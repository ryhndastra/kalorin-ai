import os
import asyncio
import traceback
import re
from fastapi import FastAPI, HTTPException,UploadFile, File
from classifier import predict_food
from pydantic import BaseModel
import tensorflow as tf
from tensorflow.keras import layers
import google.generativeai as genai
import joblib
import numpy as np
import pandas as pd
from dotenv import load_dotenv
import redis
import json


load_dotenv()
GEMINI_TIMEOUT_SECONDS = float(os.getenv("GEMINI_TIMEOUT_SECONDS", "12"))
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# REDIS CLIENT
redis_client = redis.from_url(
    REDIS_URL,
    decode_responses=True,
    socket_connect_timeout=1,
    socket_timeout=1,
)

# EXPLANATION CACHE (in-memory)
# Key: "food_name|user_status|is_recommended"
# Gemini hanya dipanggil kalau belum pernah ada di cache
explanation_cache: dict[str, str] = {}

# CUSTOM LAYER
class NutritionInteractionLayer(layers.Layer):
    def __init__(self, units=64, **kwargs):
        super(NutritionInteractionLayer, self).__init__(**kwargs)
        self.units = units

    def build(self, input_shape):
        user_dim = input_shape[0][-1]
        food_dim = input_shape[1][-1]
        concat_dim = user_dim + food_dim
        self.w = self.add_weight(
            shape=(concat_dim, self.units),
            initializer='he_normal',
            trainable=True,
            name='interaction_weights'
        )
        self.b = self.add_weight(
            shape=(self.units,),
            initializer='zeros',
            trainable=True,
            name='interaction_bias'
        )

    def call(self, inputs):
        user_features, food_features = inputs
        merged = tf.concat([user_features, food_features], axis=-1)
        return tf.nn.relu(tf.matmul(merged, self.w) + self.b)

    def get_config(self):
        config = super(NutritionInteractionLayer, self).get_config()
        config.update({'units': self.units})
        return config

# GEMINI SETUP
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)
gemini_model = genai.GenerativeModel('gemini-2.5-flash')

app = FastAPI(title="KaloriN AI Recommender Microservice", version="2.0")
MODEL_READY = False

def redis_get(key: str):
    try:
        return redis_client.get(key)
    except Exception as e:
        print(f"⚠️ Redis get skipped: {e}")
        return None

def redis_setex(key: str, ttl: int, value: str):
    try:
        redis_client.setex(key, ttl, value)
    except Exception as e:
        print(f"⚠️ Redis set skipped: {e}")

async def generate_gemini_text(
    prompt: str,
    timeout: float = GEMINI_TIMEOUT_SECONDS,
    generation_config: dict | None = None,
) -> str:
    def call_gemini():
        return gemini_model.generate_content(
            prompt,
            generation_config=generation_config,
            request_options={"timeout": timeout},
        )

    response = await asyncio.wait_for(
        asyncio.to_thread(call_gemini),
        timeout=timeout + 1,
    )
    return response.text.strip()

# LOAD MODEL
try:
    recsys_model = tf.keras.models.load_model(
        'kalorin_recsys_model.keras',
        custom_objects={'NutritionInteractionLayer': NutritionInteractionLayer}
    )
    scaler_user = joblib.load('recsys_scaler_user.pkl')
    scaler_food = joblib.load('recsys_scaler_food.pkl')
    ohe_user    = joblib.load('recsys_ohe_user.pkl')
    ohe_food    = joblib.load('recsys_ohe_food.pkl')
    MODEL_READY = True
    print("✅ Model dan semua scaler berhasil dimuat!")
except Exception as e:
    print(f"❌ Error loading model: {e}")

# SCHEMAS
class InferenceRequest(BaseModel):
    user_age: float
    user_weight: float
    user_height: float
    user_status: str
    food_cal: float
    food_prot: float
    food_fat: float
    food_carb: float
    food_cluster: int
    food_name: str

class DailyInsightRequest(BaseModel):
    user_status: str
    macro_context: str

class BehavioralInsightRequest(BaseModel):
    trackingConsistency: str
    trackingDays: int
    calorieSpikeDay: str | None
    weekendOvereating: bool
    proteinGoalHitDays: int
    underProteinDays: int
    averageCalories: int
    averageProtein: int

    dominantMealType: str | None
    highestCalorieFood: str | None
    highestProteinFood: str | None

    dominantFoods: list[str]
    weekendCalories: int
    weekdayCalories: int
    lateNightEatingCount: int

# HELPER: GENERATE EXPLANATION
# Hanya panggil Gemini kalau cache miss
async def generate_explanation(food_name: str, user_status: str, is_recommended: bool) -> str:
    if not is_recommended:
        return f"RinAI di sini! Makanan ini kurang pas buat kondisi {user_status} kamu sekarang, coba cari alternatif lain ya!"

    cache_key = f"{food_name.lower()}|{user_status.lower()}"

    # Cache hit → ga perlu panggil Gemini
    cached = redis_get(cache_key)

    if cached:
        print(f"⚡ Redis explanation cache hit")
        return cached

    # Cache miss → panggil Gemini
    try:
        prompt = (
            f"Sapa user sebagai 'RinAI'. "
            f"Berperanlah sebagai ahli gizi digital untuk aplikasi KaloriN AI. "
            f"Berikan 1 kalimat penjelasan singkat dan ramah kenapa '{food_name}' "
            f"sangat cocok direkomendasikan untuk seseorang dengan status kesehatan '{user_status}'. "
            f"Fokus pada manfaat gizi makronya."
        )
        text = await generate_gemini_text(prompt)
        redis_setex(cache_key,86400,text)  # simpan ke cache
        return text
    except Exception:
        fallback = "Makanan ini direkomendasikan karena komposisi nutrisinya sangat mendukung profil kesehatan kamu."
        redis_setex(cache_key,86400,fallback)  # simpan fallback ke cache juga
        return fallback

# HELPER: PREDICT SCORE (shared logic)
def predict_score(data: InferenceRequest) -> tuple[float, bool]:
    user_num_cols  = ['user_age', 'user_weight', 'user_height']
    user_cat_cols  = ['user_status']
    food_num_cols  = ['food_calories', 'food_proteins', 'food_fat', 'food_carbohydrate']
    food_cat_cols  = ['food_cluster']

    user_num = pd.DataFrame([[data.user_age, data.user_weight, data.user_height]], columns=user_num_cols)
    user_cat = pd.DataFrame([[data.user_status]], columns=user_cat_cols)
    food_num = pd.DataFrame([[data.food_cal, data.food_prot, data.food_fat, data.food_carb]], columns=food_num_cols)
    food_cat = pd.DataFrame([[data.food_cluster]], columns=food_cat_cols)

    u_num_scaled   = scaler_user.transform(user_num)
    u_cat_encoded  = ohe_user.transform(user_cat)
    user_input     = np.hstack([u_num_scaled, u_cat_encoded])

    f_num_scaled   = scaler_food.transform(food_num)
    f_cat_encoded  = ohe_food.transform(food_cat)
    food_input     = np.hstack([f_num_scaled, f_cat_encoded])

    match_score    = recsys_model.predict([user_input, food_input], verbose=0)[0][0]
    score_percent  = float(match_score * 100)
    is_recommended = bool(match_score >= 0.5)

    return round(score_percent, 2), is_recommended

# ENDPOINT 1: /api/recommend
# Hanya predict score — TANPA panggil Gemini
# Dipanggil Express untuk tiap food di list rekomendasi
@app.post("/api/recommend")
async def get_recommendation(data: InferenceRequest):
    try:
        score_percent, is_recommended = predict_score(data)

        return {
            "food_name": data.food_name,
            "match_score_percent": score_percent,
            "is_recommended": is_recommended,
            "message": "Direkomendasikan" if is_recommended else "Ditolak (Tidak sesuai target nutrisi)",
            # Tidak ada explanation di sini — hemat Gemini call
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ENDPOINT 2: /api/recommend/explain
# Predict + explanation Gemini — dipanggil hanya saat user buka detail food
@app.post("/api/recommend/explain")
async def get_recommendation_with_explanation(data: InferenceRequest):
    try:
        score_percent, is_recommended = predict_score(data)
        explanation = await generate_explanation(data.food_name, data.user_status, is_recommended)

        return {
            "food_name": data.food_name,
            "match_score_percent": score_percent,
            "is_recommended": is_recommended,
            "message": "Direkomendasikan" if is_recommended else "Ditolak (Tidak sesuai target nutrisi)",
            "explanation": explanation,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ENDPOINT 3: /api/daily-insight
# Tetap panggil Gemini, tapi tambah cache harian
insight_cache: dict[str, str] = {}
behavioral_cache: dict[str, list] = {}

def build_behavioral_fallback(data: BehavioralInsightRequest) -> list[dict]:
    insights = []

    if data.trackingDays <= 0:
        return [
            {
                "type": "info",
                "title": "Data Belum Ada",
                "message": "Belum ada pola makan yang cukup untuk dianalisis minggu ini."
            },
            {
                "type": "tip",
                "title": "Mulai Tracking",
                "message": "Catat beberapa meal agar pola kalori dan protein mulai terlihat."
            },
            {
                "type": "info",
                "title": "Baseline Kosong",
                "message": "Insight akan lebih akurat setelah ada beberapa hari data."
            }
        ]

    if data.underProteinDays > data.proteinGoalHitDays:
        insights.append({
            "type": "warning",
            "title": "Protein Rendah",
            "message": f"Protein masih rendah pada {data.underProteinDays} dari {data.trackingDays} hari tracking."
        })
    else:
        insights.append({
            "type": "success",
            "title": "Protein Stabil",
            "message": f"Target protein tercapai pada {data.proteinGoalHitDays} hari tracking."
        })

    if data.calorieSpikeDay:
        insights.append({
            "type": "info",
            "title": "Kalori Puncak",
            "message": f"Asupan kalori tertinggi muncul pada {data.calorieSpikeDay}."
        })
    elif data.averageCalories > 0:
        insights.append({
            "type": "info",
            "title": "Kalori Rata",
            "message": f"Rata-rata kalori minggu ini sekitar {data.averageCalories} kkal per hari."
        })

    if data.dominantFoods:
        foods = ", ".join(data.dominantFoods[:2])
        insights.append({
            "type": "tip",
            "title": "Pola Makanan",
            "message": f"{foods} cukup sering muncul dalam catatan makan minggu ini."
        })
    elif data.highestCalorieFood:
        insights.append({
            "type": "tip",
            "title": "Sumber Kalori",
            "message": f"{data.highestCalorieFood} menjadi makanan dengan kalori tertinggi minggu ini."
        })

    if data.weekendOvereating:
        insights.append({
            "type": "warning",
            "title": "Weekend Naik",
            "message": "Kalori akhir pekan terlihat lebih tinggi dari target mingguan."
        })

    if data.lateNightEatingCount > 0:
        insights.append({
            "type": "tip",
            "title": "Pola Malam",
            "message": f"Ada {data.lateNightEatingCount} catatan makan larut malam minggu ini."
        })

    if len(insights) < 3 and data.dominantMealType:
        insights.append({
            "type": "info",
            "title": "Meal Dominan",
            "message": f"{data.dominantMealType} menjadi tipe meal yang paling sering dicatat."
        })

    if len(insights) < 3:
        insights.append({
            "type": "success" if data.trackingDays >= 4 else "info",
            "title": "Konsistensi",
            "message": f"Kamu mencatat makanan pada {data.trackingDays} hari dalam rentang ini."
        })

    while len(insights) < 3:
        insights.append({
            "type": "info",
            "title": "Pola Mingguan",
            "message": "Tambahkan lebih banyak catatan agar analisis perilaku makin tajam."
        })

    return insights[:3]

def build_behavioral_ai_payload(data: BehavioralInsightRequest) -> dict:
    return {
        "tracking_days": data.trackingDays,
        "tracking_consistency": data.trackingConsistency,
        "calorie_spike_day": data.calorieSpikeDay,
        "weekend_overeating": data.weekendOvereating,
        "protein_goal_hit_days": data.proteinGoalHitDays,
        "under_protein_days": data.underProteinDays,
        "average_calories": data.averageCalories,
        "average_protein": data.averageProtein,
        "dominant_meal_type": data.dominantMealType,
        "dominant_foods": data.dominantFoods[:3],
        "highest_calorie_food": data.highestCalorieFood,
        "highest_protein_food": data.highestProteinFood,
        "weekend_calories": data.weekendCalories,
        "weekday_calories": data.weekdayCalories,
        "late_night_eating_count": data.lateNightEatingCount,
    }

def parse_gemini_json_array(raw: str) -> list:
    text = raw.strip()
    text = re.sub(r"```[a-zA-Z]*", "", text).replace("```", "").strip()

    start = text.find("[")
    end = text.rfind("]")
    if start != -1 and end != -1 and end > start:
        text = text[start:end + 1]

    parse_candidates = [text]
    repaired = re.sub(
        r'(^|[{\[,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:',
        r'\1"\2":',
        text,
        flags=re.MULTILINE,
    )
    repaired = repaired.replace("'", '"')
    repaired = re.sub(r",\s*([}\]])", r"\1", repaired)
    parse_candidates.append(repaired)

    for candidate in parse_candidates:
        try:
            parsed = json.loads(candidate)
            if isinstance(parsed, dict):
                parsed = parsed.get("insights") or parsed.get("data") or parsed.get("items")
            if isinstance(parsed, list):
                return parsed
        except json.JSONDecodeError:
            continue

    extracted = []
    for block in re.findall(r"\{[^{}]*\}", text, flags=re.DOTALL):
        item = {}
        for field in ("type", "title", "message"):
            match = re.search(
                rf'{field}\s*:\s*["\']?([^,"\';\n}}]+)',
                block,
                flags=re.IGNORECASE,
            )
            if match:
                item[field] = match.group(1).strip()
        if {"type", "title", "message"}.issubset(item):
            extracted.append(item)

    if extracted:
        return extracted

    raise json.JSONDecodeError("Could not parse Gemini JSON array", text, 0)

@app.post("/api/daily-insight")
async def get_daily_insight(data: DailyInsightRequest):
    fallback = data.macro_context or "Stay consistent with your nutrition goals today!"
    cache_key = f"daily-insight|{data.user_status.lower()}|{data.macro_context.lower()}"

    cached = redis_get(cache_key)
    if cached:
        print("⚡ Redis insight cache hit")
        return {
            "insight_text": cached
        }

    try:
        prompt = (
            f"Kamu adalah AI Gizi di aplikasi. User dengan status {data.user_status} "
            f"saat ini kondisinya: {data.macro_context}. "
            f"Berikan 1 kalimat insight harian yang menyemangati dan spesifik (misal menyarankan jenis makanan). "
            f"Gunakan bahasa Inggris yang natural seperti contoh ini: "
            f"'You need 38g more protein today. Try adding a chicken breast!'"
        )
        text = await generate_gemini_text(prompt)
        redis_setex(cache_key,43200,text)

        return {"insight_text": text}
    except Exception as e:
        print(f"⚠️ Daily insight fallback used: {e}")
        redis_setex(cache_key,1800,fallback)
        return {"insight_text": fallback}

# ENDPOINT: /api/behavioral-insights
@app.post("/api/behavioral-insights")
async def get_behavioral_insights(data: BehavioralInsightRequest):
    ai_payload = build_behavioral_ai_payload(data)
    cache_key = f"behavioral-insights:v3|{json.dumps(ai_payload, sort_keys=True)}"
    try:
        # CACHE HIT
        cached = redis_get(cache_key)

        if cached:
            print(" Redis behavioral cache hit")

            return {
                "insights": json.loads(cached),
                "source": "cache"
            }

        compact_payload = json.dumps(ai_payload, ensure_ascii=False, separators=(",", ":"))
        prompt = (
            "Return ONLY minified valid JSON array with exactly 3 items. "
            'Each item: {"type":"warning|success|info|tip","title":"max 3 kata","message":"max 14 kata"}. '
            "Bahasa Indonesia natural. No markdown. Use double quotes. "
            "At least one item about dominant_foods if present. Data="
            f"{compact_payload}"
        )

        print("GEMINI CALLED")
        raw = await generate_gemini_text(
            prompt,
            generation_config={
                "temperature": 0.2,
                "max_output_tokens": 1024,
                "response_mime_type": "application/json",
            },
        )
        try:
            parsed = parse_gemini_json_array(raw)
        except Exception as parse_error:
            print(f"⚠️ Gemini parse retry: {type(parse_error).__name__}: {parse_error}")
            print(f"⚠️ Gemini raw preview: {raw[:500]}")
            retry_prompt = (
                "Output valid JSON only. Exactly 3 compact objects in an array. "
                'No prose. Example [{"type":"info","title":"Pola","message":"Kalimat pendek."}]. '
                f"Data={compact_payload}"
            )
            raw = await generate_gemini_text(
                retry_prompt,
                generation_config={
                    "temperature": 0,
                    "max_output_tokens": 1024,
                    "response_mime_type": "application/json",
                },
            )
            parsed = parse_gemini_json_array(raw)
        if not isinstance(parsed, list) or len(parsed) < 3:
            raise ValueError("Gemini did not return a JSON array")

        # CACHE STORE (12 HOURS)
        redis_setex(
            cache_key,
            43200,
            json.dumps(parsed)
        )

        return {
            "insights": parsed,
            "source": "gemini"
        }

    except Exception as e:
        print(f"⚠️ Behavioral Gemini fallback used: {type(e).__name__}: {e}")
        if "raw" in locals():
            print(f"⚠️ Gemini raw preview: {raw[:500]}")
        fallback = build_behavioral_fallback(data)
        return {
            "insights": fallback,
            "source": "fallback"
        }

# ENDPOINT 4: /api/cache/stats buat debugging
@app.get("/health")
def health_check():
    redis_connected = False
    try:
        redis_connected = bool(redis_client.ping())
    except Exception:
        redis_connected = False

    return {
        "ok": True,
        "model_ready": MODEL_READY,
        "redis_connected": redis_connected,
        "gemini_configured": bool(GOOGLE_API_KEY),
        "gemini_timeout_seconds": GEMINI_TIMEOUT_SECONDS,
    }

@app.get("/api/cache/stats")
def cache_stats():
    redis_connected = False
    try:
        redis_connected = bool(redis_client.ping())
    except Exception:
        redis_connected = False

    return {
        "redis_connected": redis_connected,
        "gemini_timeout_seconds": GEMINI_TIMEOUT_SECONDS,
        # "explanation_cache_size": len(explanation_cache), udah pake Redis, jadi ga perlu cache in-memory lagi
        # "insight_cache_size": len(insight_cache),
        # "behavioral_cache_size": len(behavioral_cache),
    }

# FOOD CLASSIFIER
@app.post("/predict-food")
async def predict_food_api(
    file: UploadFile = File(...)
):
    try:
        result = predict_food(
            file.file
        )

        return result

    except Exception as e:
        traceback.print_exc()

        return {
            "success": False,
            "message": str(e),
        }

# Cara run: uvicorn main:app --reload
