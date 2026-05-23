import os
import traceback
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
# REDIS CLIENT
redis_client = redis.Redis(
    host="localhost",
    port=6379,
    decode_responses=True
)
print("KEY:", os.getenv("GOOGLE_API_KEY"))
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
    cached = redis_client.get(cache_key)

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
        response = gemini_model.generate_content(prompt)
        text = response.text.strip()
        redis_client.setex(cache_key,86400,text)  # simpan ke cache
        return text
    except Exception:
        fallback = "Makanan ini direkomendasikan karena komposisi nutrisinya sangat mendukung profil kesehatan kamu."
        redis_client.setex(cache_key,86400,fallback)  # simpan fallback ke cache juga
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

@app.post("/api/daily-insight")
async def get_daily_insight(data: DailyInsightRequest):
    try:
        cache_key = f"{data.user_status.lower()}|{data.macro_context.lower()}"

        cached = redis_client.get(cache_key)
        if cached:
            print("⚡ Redis insight cache hit")
            return {
                "insight_text": cached
            }

        prompt = (
            f"Kamu adalah AI Gizi di aplikasi. User dengan status {data.user_status} "
            f"saat ini kondisinya: {data.macro_context}. "
            f"Berikan 1 kalimat insight harian yang menyemangati dan spesifik (misal menyarankan jenis makanan). "
            f"Gunakan bahasa Inggris yang natural seperti contoh ini: "
            f"'You need 38g more protein today. Try adding a chicken breast!'"
        )
        response = gemini_model.generate_content(prompt)
        text = response.text.strip()
        redis_client.setex(cache_key,43200,text)

        return {"insight_text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# ENDPOINT: /api/behavioral-insights
@app.post("/api/behavioral-insights")
async def get_behavioral_insights(data: BehavioralInsightRequest):
    try:
        cache_key = str(data.dict())

        # CACHE HIT
        cached = redis_client.get(cache_key)

        if cached:
            print(" Redis behavioral cache hit")

            return {
                "insights": json.loads(cached)
            }

        prompt = f"""
            Kamu adalah AI nutrition behavior analyst di aplikasi nutrition modern.

            Tugasmu:
            Menganalisa pola makan dan perilaku nutrisi user berdasarkan data yang diberikan.

            Generate tepat 3 insight singkat dalam format JSON.

            Campurkan tipe insight secara natural:
            - warning
            - success
            - info
            - tip

            Insight HARUS berbasis data nyata.
            Jangan membuat asumsi di luar data.

            Kamu boleh menganalisa:
            - pola makanan yang sering dikonsumsi
            - dominasi gorengan atau processed food
            - pola makan malam terlalu larut
            - konsistensi protein
            - perbedaan weekday dan weekend
            - kualitas sumber nutrisi
            - kebiasaan tracking
            - pola meal timing

            Minimal satu insight HARUS membahas food behavior pattern jika datanya relevan.

            Jangan buat semua insight negatif.

            Tone:
            - modern
            - pintar
            - ringkas
            - manusiawi
            - analitis
            - observasional
            - praktikal

            Hindari:
            - bahasa corporate
            - generic health advice
            - motivational phrases
            - emotional encouragement
            - celebratory language
            - kata dramatis
            - mengulang insight sama
            - kalimat terlalu panjang
            - sounding like fitness influencer

            Fokus pada observasi perilaku, bukan motivasi.

            Rules:
            - maksimal 18 kata per message
            - title maksimal 3 kata
            - jangan pakai emoji
            - tanpa markdown
            - return ONLY valid JSON array
            - gunakan bahasa Indonesia natural
            - hindari wording awkward atau translasi literal

            Format:
            [
                {{
                    "type": "warning",
                    "title": "Protein Rendah",
                    "message": "Target protein hanya tercapai pada 1 dari 7 hari tracking."
                }},
                {{
                    "type": "tip",
                    "title": "Pola Malam",
                    "message": "Makan terlalu malam cukup sering muncul minggu ini."
                }},
                {{
                    "type": "info",
                    "title": "Pilihan Makanan",
                    "message": "Keripik cukup mendominasi sumber kalori minggu ini."
                }}
            ]

            Nutrition Patterns:
            {data.dict()}
            """

        print("GEMINI CALLED")
        response = gemini_model.generate_content(prompt)
        raw = response.text.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(raw)

        # CACHE STORE (12 HOURS)
        redis_client.setex(
            cache_key,
            43200,
            json.dumps(parsed)
        )

        return {
            "insights": parsed
        }

    except Exception as e:
        traceback.print_exc()
        return {
            "insights": [
                {
                    "type": "info",
                    "title": "Insight Gagal",
                    "message": "Insight perilaku belum dapat dibuat."
                }
            ]
        }

# ENDPOINT 4: /api/cache/stats buat debugging
@app.get("/api/cache/stats")
def cache_stats():
    return {
        "redis_connected": redis_client.ping(),
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