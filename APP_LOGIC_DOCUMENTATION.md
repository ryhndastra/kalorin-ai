# Dokumentasi Logika dan Alur Aplikasi KaloriN AI

Dokumen ini menjelaskan arsitektur, alur data, serta peran file-file utama pada aplikasi KaloriN AI.

## Gambaran Umum

KaloriN AI adalah aplikasi tracking nutrisi berbasis React, Express, PostgreSQL/Prisma, dan microservice AI berbasis FastAPI. Aplikasi ini punya tiga bagian besar:

1. `frontend/`
   Aplikasi React + Vite yang menangani halaman, UI, autentikasi Firebase, pemanggilan API, tracking makanan, rekomendasi makanan, dan tampilan insight.

2. `backend/`
   API Express yang menjadi penghubung antara frontend, database PostgreSQL via Prisma, Redis/cache, dan AI microservice.

3. `ai_service/`
   Microservice FastAPI yang menjalankan model rekomendasi TensorFlow/Keras, preprocessing dengan scaler/encoder, Redis cache, dan Gemini untuk penjelasan atau behavioral insight.

Alur utamanya:

```
User
  -> Frontend React
  -> Backend Express API
  -> PostgreSQL via Prisma
  -> AI Service FastAPI jika butuh rekomendasi/insight
  -> Redis untuk cache AI
  -> Frontend menampilkan hasil
```

## Alur Fitur Utama

### 1. Register/Login

User register atau login lewat Firebase Authentication. Setelah berhasil, frontend memanggil backend endpoint `/api/profile` untuk sinkronisasi profil ke database.

File yang terlibat:

- `frontend/src/pages/RegisterPage.jsx`
- `frontend/src/pages/LoginPage.jsx`
- `frontend/src/utils/authUtils.js`
- `frontend/src/config/firebase.js`
- `backend/src/controllers/userController.js`
- `backend/prisma/schema.prisma`

Alur:

```
Register/Login Firebase
  -> syncUserToDb()
  -> POST /api/profile
  -> createOrUpdateProfile()
  -> Profile di database dibuat/diupdate
```

### 2. Profile dan Target Nutrisi

Profile menyimpan data user seperti berat, tinggi, goal, birthdate, target kalori, target protein, dan status BMI. Jika user mengubah berat/tinggi/goal, backend menghitung ulang kebutuhan kalori dan protein secara otomatis.

Alur:

```
ProfilePage
  -> POST /api/profile
  -> createOrUpdateProfile()
  -> calculateUserStatus()
  -> calculateDailyNeeds()
  -> Prisma upsert Profile
  -> fetchProfile() refresh UserContext
```

### 3. Search Food dan Add Meal

User dapat mencari makanan dari database master food, lalu menambah makanan ke daily log.

Alur:

```
SearchFoodTab
  -> GET /api/foods
  -> getAllFoods()
  -> render food list
  -> Add to Meal
  -> POST /api/track/add
  -> addMealLog()
  -> DailyLog dibuat
  -> fetchProfile(force=true) refresh statistik hari ini
```

### 4. Rekomendasi Makanan AI

Frontend meminta rekomendasi makanan yang cocok dengan profil user. Backend mengambil kandidat makanan, filter awal dengan heuristik, lalu meminta skor ke AI service.

Alur:

```text
RecommendationList / MealsGrid
  -> POST /api/ai/food-list
  -> getRecommendedFoodList()
  -> generateRecommendationList()
  -> ambil Profile + Food
  -> filter heuristik
  -> buildAIPayload()
  -> requestRecommendation()
  -> FastAPI /api/recommend
  -> TensorFlow model predict score
  -> return top recommendations
```

### 5. Detail Makanan dan Penjelasan AI

Saat user membuka detail makanan, frontend memanggil endpoint detail AI. Endpoint ini tidak hanya memberi score, tapi juga explanation dari Gemini jika belum ada cache.

Alur:

```text
FoodDetailModal
  -> POST /api/ai/food-detail
  -> generateFoodDetail()
  -> requestRecommendationWithExplanation()
  -> FastAPI /api/recommend/explain
  -> predict score
  -> generate_explanation()
  -> Gemini + Redis cache
  -> frontend typewriter explanation
```

### 6. Tracking Harian

Track page membaca log makanan berdasarkan tanggal yang dipilih, lalu menampilkan total kalori dan daftar meal history.

Alur:

```text
TrackPage
  -> GET /api/track/logs?userId=&date=
  -> getDailyLogs()
  -> DailyLog findMany pada range tanggal
  -> totals dihitung dari logs
  -> NutritionProgressCard + MealHistoryList
```

### 7. Weekly Insights

Insights page mengambil beberapa endpoint cepat secara paralel, lalu mengambil behavioral insights dari AI secara terpisah karena lebih lambat.

Alur:

```text
InsightsPage
  -> Promise.all([
       weekly-trends,
       weekly-comparison,
       weekly-score,
       streaks
     ])
  -> render chart/score/comparison
  -> GET behavioral-insights
  -> backend generate nutrition + food patterns
  -> FastAPI /api/behavioral-insights
  -> Gemini returns 3 insight JSON
```

## Database Prisma

### `backend/prisma/schema.prisma`

Mendefinisikan model database PostgreSQL:

- `Profile`
  Menyimpan identitas dan data nutrisi user: `userId`, `email`, `fullName`, `birthdate`, `weight`, `height`, `goal`, `dailyCalories`, `proteinTarget`, `userStatus`.

- `Food`
  Master data makanan: nama, kalori, protein, lemak, karbohidrat, gambar, dan `foodCluster` untuk kebutuhan model rekomendasi.

- `DailyLog`
  Log makanan harian user. Menyimpan snapshot nutrisi makanan pada saat ditambahkan agar riwayat tidak berubah jika master food berubah.

- `DailyInsight`
  Menyimpan insight harian, meskipun pada kode saat ini insight lebih banyak memakai cache dan AI service.

### `backend/prisma/seed.js`

Membaca `backend/data/nutrition_data.json`, lalu melakukan `upsert` ke tabel `Food`. Ini dipakai untuk mengisi master food database.

### `backend/data/nutrition_data.json`

Dataset makanan yang menjadi sumber seed untuk tabel `Food`.

## Backend Express

### `backend/src/server.js`

Entry point backend Express. Tanggung jawab:

- Load `.env`.
- Setup `cors()` dan `express.json()`.
- Register endpoint health check.
- Register endpoint food, profile, user route, track route, insight route, dan AI route.
- Menjalankan server di `PORT` atau default `5000`.

Endpoint utama:

- `GET /`
- `GET /api/foods`
- `GET /api/foods/:id`
- `POST /api/profile`
- `GET /api/profile/:userId`
- `POST /api/ai/recommend`
- `POST /api/ai/food-list`
- `POST /api/ai/food-detail`
- Prefix route: `/api/track`, `/api/insights`

### Routes

#### `backend/src/routes/trackRoutes.js`

Route tracking makanan:

- `POST /api/track/add` memanggil `addMealLog`.
- `GET /api/track/logs` memanggil `getDailyLogs`.

#### `backend/src/routes/insightRoutes.js`

Route analytics mingguan:

- `/weekly-summary`
- `/weekly-trends`
- `/behavioral-insights`
- `/weekly-comparison`
- `/weekly-score`
- `/nutrition-patterns`
- `/food-patterns`
- `/streaks`

Semua endpoint memakai `userId` dari query parameter.

## Backend Controllers

### `backend/src/controllers/userController.js`

Berisi logic profile user.

`createOrUpdateProfile(req, res)`:

- Mengambil data profil dari body request.
- Cek apakah profile sudah ada.
- Hitung `userStatus` dari BMI jika ada berat dan tinggi.
- Deteksi apakah data fisik atau goal berubah.
- Jika data berubah dan bukan input manual, hitung ulang kebutuhan kalori dan protein memakai `calculateDailyNeeds`.
- Melakukan `prisma.profile.upsert`.
- Return profile terbaru.

`getProfile(req, res)`:

- Ambil profile berdasarkan `userId`.
- Hitung statistik makanan hari ini dari `DailyLog`.
- Hitung BMI, BMI status, dan rentang berat ideal.
- Return profile plus `today_stats`.

### `backend/src/controllers/foodController.js`

`getAllFoods`:

- Ambil maksimal 50 data makanan dari database.
- Return `{ success, data }`.

`getFoodById`:

- Ambil satu makanan berdasarkan id.
- Return 404 jika tidak ditemukan.

### `backend/src/controllers/trackController.js`

`addMealLog`:

- Validasi `userId` dan `foodName`.
- Menentukan nama hari dari tanggal saat ini.
- Membuat `DailyLog`.
- Menyimpan snapshot nutrisi: kalori, protein, fat, carbs, quantity, mealType.

`getDailyLogs`:

- Membaca `userId` dan optional `date`.
- Membuat range start/end of day.
- Mengambil semua log pada tanggal tersebut.
- Menghitung total kalori, protein, fat, dan carbs.
- Return logs dan totals.

### `backend/src/controllers/aiController.js`

Controller tipis untuk endpoint AI.

`getQuickInsight`:

- Body: `userId`, `macroContext`.
- Memanggil `generateInsight`.

`getRecommendedFoodList`:

- Body: `userId`.
- Memanggil `generateRecommendationList`.

`getFoodRecommendation`:

- Body: `userId`, `foodId`.
- Memanggil `generateFoodDetail`.

### `backend/src/controllers/insightController.js`

Controller untuk analytics mingguan. Polanya konsisten:

- Validasi `userId`.
- Panggil service insight yang sesuai.
- Return `{ success: true, data }`.

Fungsi:

- `getWeeklySummary`
- `getWeeklyTrends`
- `getBehavioralInsights`
- `getWeeklyComparison`
- `getWeeklyScore`
- `getNutritionPatterns`
- `getFoodPatterns`
- `getStreaks`

## Backend Services

### `backend/src/services/aiApiService.js`

Service HTTP client untuk komunikasi backend Express ke AI FastAPI.

Logic penting:

- Membuat Axios instance dengan `AI_URL` dan `AI_TIMEOUT`.
- Membuat Redis client untuk cache rekomendasi.
- `requestRecommendation` memakai Redis cache per payload.
- `requestRecommendationWithExplanation` memakai Redis cache khusus explanation.
- `requestInsight` langsung memanggil endpoint insight AI.
- Ada circuit breaker:
  - `CLOSED`: normal.
  - `OPEN`: request AI diblok sementara setelah banyak error/rate limit.
  - `HALF_OPEN`: mencoba request lagi setelah cooldown.
- Ada retry dengan exponential backoff.
- Ada deduplication untuk request payload yang sama agar tidak ditembak berkali-kali bersamaan.

### `backend/src/services/recommendationService.js`

Service utama rekomendasi makanan.

Logic:

- Ambil profile user.
- Ambil sebagian makanan dari database.
- Filter keras makanan yang tidak cocok dengan goal/status user.
- Skor heuristik awal untuk memilih kandidat terbaik.
- Kirim kandidat ke AI service secara batch dengan batas concurrency.
- Ambil hanya makanan yang direkomendasikan AI.
- Normalisasi score.
- Sort dan return top 10.
- Cache list final di memory Map.

Fungsi penting:

- `heuristicScore(food, userGoal, userStatus)`
- `isFoodSuitable(food, userGoal, userStatus)`
- `processWithLimit(items, limit, asyncFn)`
- `generateRecommendationList(userId)`
- `generateFoodDetail(userId, foodId)`

### `backend/src/services/insightService.js`

Menghasilkan quick daily insight.

Logic:

- Cache insight berdasarkan `userId` dan `macroContext`.
- Ambil profile user.
- Hitung user status dari BMI.
- Request insight ke FastAPI `/api/daily-insight`.
- Jika AI gagal, return fallback dari `macroContext` atau kalimat default.

### `backend/src/services/insights/summaryService.js`

Menghitung ringkasan 7 hari terakhir:

- Rata-rata kalori.
- Rata-rata protein.
- Total meals.
- Goal completion rate berdasarkan jumlah hari tracking dari 7 hari.

### `backend/src/services/insights/trendsService.js`

Menghasilkan tren nutrisi 7 hari terakhir dengan timezone Asia/Jakarta.

Logic:

- Membuat range 7 hari.
- Mengisi default tiap hari dengan nol.
- Mengelompokkan `DailyLog` berdasarkan tanggal lokal Jakarta.
- Return array berisi `date`, `calories`, `proteins`, `carbs`, `fat`.

### `backend/src/services/insights/comparisonService.js`

Membandingkan minggu berjalan 7 hari terakhir dengan 7 hari sebelumnya.

Return:

- `caloriesChange`
- `proteinsChange`
- `trackingChange`
- `hasPreviousData`

### `backend/src/services/insights/scoreService.js`

Menghitung weekly nutrition score.

Komponen skor:

- Consistency: jumlah hari tracking / 7.
- Protein: rata-rata protein dibanding target protein.
- Calories: kedekatan rata-rata kalori dengan target.

Overall score:

```text
overall = consistencyScore * 0.4 + proteinScore * 0.35 + calorieScore * 0.25
```

### `backend/src/services/insights/patternEngineService.js`

Membuat pattern nutrisi berbasis data 7 hari:

- `trackingConsistency`
- `trackingDays`
- `calorieSpikeDay`
- `weekendOvereating`
- `proteinGoalHitDays`
- `underProteinDays`
- `averageCalories`
- `averageProtein`
- `dominantMealType`
- `highestCalorieFood`
- `highestProteinFood`

Data ini dipakai sebagai input behavioral insight AI.

### `backend/src/services/insights/foodPatternService.js`

Menganalisis pola makanan 7 hari:

- Makanan yang paling sering muncul.
- Meal type dominan.
- Makanan tertinggi kalori.
- Makanan tertinggi protein.
- Total kalori weekend vs weekday.
- Jumlah makan larut malam.

### `backend/src/services/insights/behavioralInsightService.js`

Menggabungkan hasil `patternEngineService` dan `foodPatternService`, lalu mengirim payload ke FastAPI `/api/behavioral-insights`. Jika gagal, return fallback insight.

### `backend/src/services/insights/streakService.js`

Menghitung streak:

- `trackingStreak`: streak tracking aktif sampai hari ini/kemarin.
- `longestTrackingStreak`: streak tracking terpanjang.
- `proteinStreak`: streak hari berturut-turut yang mencapai target protein.

## Backend Utils dan Config

### `backend/src/utils/bmiUtils.js`

Menghitung status user berdasarkan BMI:

- `Insufficient_Weight`
- `Normal_Weight`
- `Overweight_Level_I`
- `Overweight_Level_II`
- `Obesity_Type_I`
- `Obesity_Type_II`
- `Obesity_Type_III`

### `backend/src/utils/calculatorUtils.js`

Menghitung kebutuhan kalori dan protein harian.

Logic:

- Hitung umur dari birthdate.
- Hitung BMR dengan rumus Mifflin-St Jeor versi pria:
  `BMR = 10 * weight + 6.25 * height - 5 * age + 5`
- TDEE memakai multiplier aktivitas `1.375`.
- Goal:
  - `Weight Loss`: TDEE - 500, protein 2.0 g/kg.
  - `Bulking`: TDEE + 500, protein 1.9 g/kg.
  - Default: TDEE, protein 1.8 g/kg.

### `backend/src/utils/payloadBuilder.js`

Membangun payload untuk AI service.

Isi payload:

- `user_age`
- `user_weight`
- `user_height`
- `user_status`
- `user_goal`
- `food_cal`
- `food_prot`
- `food_fat`
- `food_carb`
- `food_cluster`
- `food_name`

### `backend/src/utils/scoreUtils.js`

Utility score:

- `normalizeScore(score)` clamp score ke rentang 50 sampai 98.
- `getScoreLabel(score)` mengubah angka score menjadi label.

### `backend/src/utils/cacheUtils.js`

Cache in-memory sederhana berbasis `Map`.

Fungsi:

- `setCache(cache, key, value, ttl)`
- `getCache(cache, key)`
- `clearExpiredCache(cache)`

### `backend/src/config/aiConfig.js`

Konfigurasi AI:

- `AI_URL`
- `MAX_FOOD_SCAN`
- `AI_TIMEOUT`
- `CACHE_TTL`
- `INSIGHT_TTL`
- `RECOMMENDATION_LIST_TTL`
- `CONCURRENT_LIMIT`

## AI Service FastAPI

### `ai_service/main.py`

Entry point AI microservice.

Komponen utama:

- FastAPI app.
- TensorFlow/Keras model recommender.
- Custom layer `NutritionInteractionLayer`.
- Scaler dan one-hot encoder dari file `.pkl`.
- Gemini model `gemini-2.5-flash`.
- Redis client lokal.
- Pydantic schema untuk request.

Model files:

- `kalorin_recsys_model.keras`
- `recsys_scaler_user.pkl`
- `recsys_scaler_food.pkl`
- `recsys_ohe_user.pkl`
- `recsys_ohe_food.pkl`

Endpoint:

#### `POST /api/recommend`

Menerima data user + data makanan, lalu:

- Transform fitur numerik user.
- One-hot encode status user.
- Transform fitur numerik food.
- One-hot encode food cluster.
- Prediksi match score dengan model.
- Return score dan `is_recommended`.

Endpoint ini tidak memanggil Gemini agar hemat request.

#### `POST /api/recommend/explain`

Melakukan prediksi seperti `/api/recommend`, lalu membuat explanation.

Logic:

- Jika `is_recommended` false, return kalimat penolakan sederhana.
- Jika recommended, cek Redis cache berdasarkan `food_name|user_status`.
- Jika cache miss, panggil Gemini untuk membuat 1 kalimat penjelasan.
- Simpan explanation ke Redis 24 jam.

#### `POST /api/daily-insight`

Membuat insight harian berdasarkan `user_status` dan `macro_context`.

Logic:

- Cek Redis cache.
- Jika cache miss, panggil Gemini.
- Simpan cache 12 jam.
- Return `insight_text`.

#### `POST /api/behavioral-insights`

Menerima pola nutrisi dan pola makanan dari backend, lalu meminta Gemini menghasilkan tepat 3 insight berbentuk JSON array.

Jika parsing atau AI gagal, return fallback:

```json
[
  {
    "type": "info",
    "title": "Insight Gagal",
    "message": "Insight perilaku belum dapat dibuat."
  }
]
```

#### `GET /api/cache/stats`

Endpoint debugging untuk mengecek koneksi Redis.

### `ai_service/requirements.txt`

Daftar dependency Python untuk FastAPI, TensorFlow, Gemini SDK, joblib, pandas, numpy, Redis, dan dependency lain.

## Frontend React

### `frontend/src/main.jsx`

Entry point React. Merender `App` ke `#root` dan membungkusnya dengan:

- `BrowserRouter`
- `AuthProvider`
- `UserProvider`

Urutan provider penting karena banyak halaman membutuhkan auth dan profile context.

### `frontend/src/App.jsx`

Mengatur routing aplikasi.

Route:

- `/` -> `LandingPage`
- `/login` -> `LoginPage`
- `/register` -> `RegisterPage`
- `/analyze` -> `AnalyzePage`
- `/home` -> `HomePage`
- `/profile` -> `ProfilePage`
- `/meals` -> `MealsPage`
- `/track` -> `TrackPage`
- `/insights` -> `InsightsPage`

Juga melakukan auto fetch profile jika user sudah login tetapi `userData` belum ada.

### Context

#### `frontend/src/context/AuthContext.js`

Membuat `AuthContext` dan hook `useAuth`.

#### `frontend/src/context/AuthProvider.jsx`

Provider auth Firebase.

Logic:

- Subscribe ke `onAuthStateChanged`.
- Menyimpan user ringkas: `id`, `email`, `displayName`, `photoURL`.
- Menampilkan skeleton sesuai route saat auth masih loading.
- Menyediakan `{ user, authLoading }`.

#### `frontend/src/context/UserContext.jsx`

Provider profile user dari backend.

Logic:

- `fetchProfile(userId, force=false)` mengambil profile backend.
- Mencegah fetch berulang untuk user yang sama dengan `lastFetchedId`.
- `force=true` dipakai setelah profile/log berubah.
- Reset userData saat logout.
- Menyediakan `userData`, `loading`, `isInitialized`, `fetchProfile`, `setUserData`, dan `clearUserData`.

### API Client Files

#### `frontend/src/api/userService.js`

Memanggil backend profile:

- `getUserProfile(userId)` -> `GET /api/profile/:userId`
- `updateUserProfile(profileData)` -> `POST /api/profile`

#### `frontend/src/api/foodService.js`

`getFoods()` mengambil master food dari `GET /api/foods`.

#### `frontend/src/api/trackService.js`

Tracking API:

- `addMealLog(payload)` -> `POST /api/track/add`
- `getDailyLogs(userId, date)` -> `GET /api/track/logs`

#### `frontend/src/api/aiService.js`

AI API via backend:

- `getFoodRecommendation(userId, foodId)` -> detail rekomendasi makanan.
- `getFoodRecommendations(userId)` -> list rekomendasi makanan.
- `getDailyInsight(userId, macroContext)` -> insight harian.

#### `frontend/src/api/insightService.js`

Insight API:

- `getWeeklySummary(userId)`
- `getWeeklyTrends(userId)`
- `getBehavioralInsights(userId)`
- `getWeeklyComparison(userId)`
- `getWeeklyScore(userId)`
- `getStreaks(userId)`

### Utils dan Config Frontend

#### `frontend/src/config/firebase.js`

Inisialisasi Firebase app dan export:

- `auth`
- `googleProvider`

#### `frontend/src/utils/authUtils.js`

`syncUserToDb(user, fullName)` menyinkronkan user Firebase ke backend profile.

#### `frontend/src/utils/shuffleArray.js`

Mengacak array dengan `sort(() => Math.random() - 0.5)`.

#### `frontend/src/utils/trackUtils.js`

`formatTrackTime(dateString)` memformat jam dan menit dari tanggal log.

## Frontend Pages

### `frontend/src/pages/LandingPage.jsx`

Halaman publik awal. Menyusun:

- `LandingNavbar`
- `LandingHero`
- `Features`
- `HowItWorks`
- `LandingCTA`
- `Footer`

### `frontend/src/pages/LoginPage.jsx`

Halaman login.

Logic:

- Login email/password via Firebase.
- Login Google via popup.
- Setelah sukses, panggil `syncUserToDb`.
- Navigate ke `/analyze`.
- Menampilkan error saat gagal login.

### `frontend/src/pages/RegisterPage.jsx`

Halaman register.

Logic:

- Validasi password dan confirm password.
- Register Firebase email/password.
- Update displayName Firebase.
- Sinkron ke backend via `syncUserToDb`.
- Bisa register/login Google.
- Navigate ke `/analyze`.

### `frontend/src/pages/AnalyzePage.jsx`

Halaman analisis makanan.

Mode:

- `scan`: kamera/upload gambar.
- `search`: cari makanan dari database.

Logic scan saat ini masih dummy:

- Ambil gambar dari kamera/upload.
- `handleAnalyze` menunggu 2 detik lalu mengisi dummy result.

Logic search:

- Delegasi ke `SearchFoodTab`.

Guest user tetap bisa membuka halaman ini, dengan banner upsell.

### `frontend/src/pages/HomePage.jsx`

Dashboard setelah login.

Menampilkan:

- `HeroDashboard`
- `QuickActions`
- Summary meals/goals hari ini.
- `InsightBanners`
- `RecommendationList`

Data utama berasal dari `UserContext` dan AI recommendation endpoint.

### `frontend/src/pages/MealsPage.jsx`

Halaman rekomendasi makanan.

Menampilkan:

- `MealsHero`
- `MealsGrid`

`MealsGrid` mengambil rekomendasi AI berdasarkan `userId`.

### `frontend/src/pages/TrackPage.jsx`

Halaman riwayat tracking makanan.

Logic:

- Menentukan default tanggal dengan timezone Asia/Jakarta.
- Fetch daily logs setiap `user` atau `selectedDate` berubah.
- Hitung progress kalori dari totals vs daily calorie goal.
- Menampilkan CTA floating ke `/analyze`.

### `frontend/src/pages/InsightsPage.jsx`

Halaman analytics mingguan.

Logic:

- Fetch endpoint cepat secara paralel:
  - trends
  - comparison
  - score
  - streaks
- Fetch behavioral AI insight secara terpisah.
- Menampilkan:
  - `NutritionScoreCard`
  - `WeeklyComparisonCard`
  - `InsightsTrendChart`
  - `BehavioralInsightsList`

### `frontend/src/pages/ProfilePage.jsx`

Halaman profile user.

Logic:

- Menampilkan data profile dari `UserContext`.
- Edit stats atau goal lewat modal.
- Saat save, kirim payload ke `POST /api/profile`.
- Backend menghitung ulang target kalori/protein.
- Refresh profile context.
- Logout via Firebase.

## Frontend Components

### Analyze Components

#### `frontend/src/components/Analyze/CameraScanner.jsx`

Komponen kamera berbasis `react-webcam`. Menerima `facingMode`, `toggleCamera`, `capture`, dan `onCancel`.

#### `frontend/src/components/Analyze/DefaultScanPlaceholder.jsx`

Placeholder awal scan. Menyediakan tombol Take Photo dan Upload Photo.

#### `frontend/src/components/Analyze/ImagePreview.jsx`

Menampilkan gambar yang sudah diambil/upload, serta tombol Analyze dan Retake.

#### `frontend/src/components/Analyze/LoadingCard.jsx`

UI loading saat proses analisis gambar.

#### `frontend/src/components/Analyze/AnalysisResult.jsx`

Menampilkan hasil analisis gambar: nama makanan, estimasi kalori, macro, dan confidence.

#### `frontend/src/components/Analyze/GuestUpsell.jsx`

Banner untuk guest agar membuat akun.

#### `frontend/src/components/Analyze/SearchFoodTab.jsx`

Tab search makanan.

Logic:

- Fetch semua food dari backend.
- Debounce search input 300ms.
- Filter berdasarkan keyword.
- Filter berdasarkan kategori dari `searchConfig`.
- Shuffle dan batasi hasil ke 8 item.

#### `frontend/src/components/Analyze/SearchFoodCard.jsx`

Card hasil pencarian makanan.

Logic:

- Tampilkan gambar, kalori, protein, carbs, fat.
- Tombol Add to Meal memanggil `addMealLog`.
- Setelah berhasil, refresh profile agar statistik harian update.

#### `frontend/src/components/Analyze/SearchCategoryChips.jsx`

UI chip kategori search.

#### `frontend/src/components/Analyze/searchConfig.js`

Berisi daftar kategori dan fungsi filter:

- High Protein
- Low Carb
- Healthy
- Breakfast
- Low Sugar
- Snacks

### Common Components

#### `frontend/src/components/common/FoodDetailModal.jsx`

Modal detail makanan.

Logic:

- Saat modal terbuka, cek sessionStorage cache `rinai-{userId}-{foodId}`.
- Jika cache valid, pakai explanation dari cache.
- Jika tidak, panggil `getFoodRecommendation`.
- Simpan explanation dan match score ke sessionStorage selama 30 menit.
- Menampilkan typewriter effect untuk explanation.
- Tombol Add Meal memanggil `addMealLog`, refresh profile, lalu toast.

### Home Components

#### `frontend/src/components/home/HeroDashboard.jsx`

Dashboard hero untuk statistik hari ini.

Menampilkan:

- Nama depan user.
- Kalori eaten vs goal.
- Progress ring.
- BMI dan ideal weight range.
- Progress macro protein, carbs, fat, dan water dummy.

#### `frontend/src/components/home/QuickActions.jsx`

Shortcut navigasi:

- Scan Food
- Search
- Add Meal
- Insight

#### `frontend/src/components/home/InsightBanners.jsx`

Banner goal dan AI insight.

Logic:

- Hitung sisa protein hari ini.
- Jika sisa protein > 0, panggil `/api/ai/recommend` untuk advice.
- Jika gagal, pakai fallback advice.

Catatan: body request komponen ini memakai `remainingProtein` dan `currentGoal`, sedangkan controller backend membaca `macroContext`. Artinya quick insight tetap bisa fallback jika context tidak lengkap.

#### `frontend/src/components/home/RecommendationList.jsx`

List rekomendasi makanan di homepage.

Logic:

- Panggil `getFoodRecommendations(userId)`.
- Tampilkan loading, empty state, atau grid card.
- Secara default hanya menampilkan 4 item.

#### `frontend/src/components/home/HomeFoodCard.jsx`

Card makanan kecil untuk homepage. Bisa membuka `FoodDetailModal` dan menampilkan match score.

### Meals Components

#### `frontend/src/components/meals/MealsHero.jsx`

Hero sederhana untuk halaman meal recommendations.

#### `frontend/src/components/meals/MealsGrid.jsx`

Grid rekomendasi makanan.

Logic:

- Panggil `getFoodRecommendations(userId)`.
- Ambil `foods.slice(4, 10)` sebagai rekomendasi tambahan.
- Render `MealsFoodCard`.

#### `frontend/src/components/meals/MealsFoodCard.jsx`

Card makanan untuk halaman meals. Menampilkan gambar, match score, kalori, macro, dan tombol detail.

#### `frontend/src/components/meals/MealsStats.jsx`

Card statistik dummy/static untuk calories, protein, dan healthy choices. Pada struktur page saat ini tidak terlihat dipakai di `MealsPage`.

### Track Components

#### `frontend/src/components/track/TrackHeader.jsx`

Header tracking dengan input date untuk memilih tanggal.

#### `frontend/src/components/track/NutritionProgressCard.jsx`

Menampilkan progress kalori harian:

- Kalori sudah dimakan.
- Goal kalori.
- Persentase progress.
- Sisa kalori.

#### `frontend/src/components/track/MealHistoryList.jsx`

Membungkus daftar `MealHistoryCard` dan memformat tanggal pilihan.

#### `frontend/src/components/track/MealHistoryCard.jsx`

Menampilkan satu log makanan: nama, kalori, protein, carbs, fat.

#### `frontend/src/components/track/TrackEmptyState.jsx`

UI saat belum ada log makanan pada tanggal yang dipilih.

### Insights Components

#### `frontend/src/components/insights/NutritionScoreCard.jsx`

Menampilkan weekly nutrition score, message, tracking goal, protein goal, dan tracking streak.

Logic tambahan:

- `getStreakLevel(streak)` memberi label visual seperti Fresh, Growing, Hot, Rare, Elite, Legend.

#### `frontend/src/components/insights/WeeklyComparisonCard.jsx`

Card perbandingan minggu ini vs minggu sebelumnya.

Type:

- calories
- protein
- tracking

Jika belum ada previous data, card menampilkan locked/baseline state.

#### `frontend/src/components/insights/InsightsTrendChart.jsx`

Chart tren nutrisi 7 hari memakai Recharts.

Logic:

- Toggle metric: calories, protein, carbs, fat.
- Generate 7 hari terakhir timezone Asia/Jakarta.
- Cocokkan data backend berdasarkan tanggal.
- Menampilkan empty state jika semua data nol.

#### `frontend/src/components/insights/BehavioralInsightsList.jsx`

Menampilkan insight AI behavioral.

Type style:

- success
- warning
- info

Jika tidak ada insight, tampil empty state.

#### `frontend/src/components/insights/InsightsSummaryCards.jsx`

Menampilkan summary card untuk avg calories, avg protein, meals logged, dan goal completion. Saat ini tidak terlihat dipakai langsung di `InsightsPage`.

### Profile Components

#### `frontend/src/components/Profile/ProfileHero.jsx`

Hero profile user. Menampilkan avatar, nama, email, weight, height, BMI, dan BMI status.

#### `frontend/src/components/Profile/StatsCard.jsx`

Menampilkan age, weight, dan height dari `UserContext`. Age dihitung dari birthdate.

#### `frontend/src/components/Profile/GoalsCard.jsx`

Menampilkan current goal, daily calories, dan protein target.

#### `frontend/src/components/Profile/EditModal.jsx`

Modal reusable untuk edit body stats atau goal settings.

#### `frontend/src/components/Profile/ProfileItem.jsx`

Komponen baris label/value dengan icon untuk profile cards.

### Auth Components

#### `frontend/src/components/Auth/AuthInput.jsx`

Input reusable untuk login/register. Jika type password, tersedia toggle show/hide password.

#### `frontend/src/components/Auth/SocialAuth.jsx`

Tombol login sosial:

- Google aktif via callback.
- Phone dan Apple masih alert placeholder.

### Navbar Components

#### `frontend/src/components/Navbar/Navbar.jsx`

Navbar utama aplikasi.

Logic:

- Hide saat scroll, muncul lagi setelah delay.
- Desktop nav links.
- Mobile side panel.
- Login/register buttons untuk guest.
- User dropdown untuk logged-in user.
- Logout Firebase.

#### `frontend/src/components/Navbar/NavLinks.jsx`

Daftar link navigasi:

- Home
- Analyze
- Meals
- Track
- Insights

Mendukung mode desktop dan mobile.

#### `frontend/src/components/Navbar/NavUserDropdown.jsx`

Dropdown user di desktop. Menampilkan profile/settings/logout.

#### `frontend/src/components/Navbar/LandingNavbar.jsx`

Navbar khusus landing page. Menampilkan logo, Guest, dan Masuk.

#### `frontend/src/components/Navbar/GuestRoute.jsx`

Route guard untuk halaman guest. Jika user sudah login, redirect ke `/analyze`; jika belum login, render child route via `Outlet`.

### Landing Components

#### `frontend/src/components/LandingPage/LandingHero.jsx`

Hero landing page dengan CTA ke `/analyze` dan kartu ilustrasi analisis makanan.

#### `frontend/src/components/LandingPage/Features.jsx`

Section fitur aplikasi.

#### `frontend/src/components/LandingPage/HowItWorks.jsx`

Section langkah penggunaan aplikasi.

#### `frontend/src/components/LandingPage/LandingCTA.jsx`

CTA akhir landing page.

#### `frontend/src/components/Footer.jsx`

Footer landing page.

### Skeleton Components

Folder `frontend/src/components/skeletons/` berisi loading UI untuk berbagai halaman dan section:

- `AnalyzeSkeleton.jsx`
- `HomeSkeleton.jsx`
- `InsightsPageSkeleton.jsx`
- `MealsPageSkeleton.jsx`
- `TrackSkeleton.jsx`
- `DefaultSpinner.jsx`
- Skeleton khusus analyze, home, insights, meals, dan track.

Skeleton dipakai saat auth/profile/API masih loading agar perpindahan halaman terasa halus.

## Konfigurasi Frontend

### `frontend/package.json`

Script:

- `npm run dev` menjalankan Vite dev server.
- `npm run build` build production.
- `npm run lint` menjalankan ESLint.
- `npm run preview` preview build.

Dependency utama:

- React 19
- React Router
- Firebase
- Axios
- Framer Motion
- Lucide React
- React Hot Toast
- React Webcam
- Recharts
- Tailwind CSS

### `frontend/vite.config.js`

Konfigurasi Vite untuk React.

### `frontend/tailwind.config.js`

Konfigurasi Tailwind CSS.

### `frontend/src/index.css`

CSS global dan Tailwind entry.

## Kontrak API Ringkas

### Profile

`POST /api/profile`

Body utama:

```json
{
  "userId": "firebase-uid",
  "name": "User Name",
  "email": "user@email.com",
  "birthdate": "2000-01-01",
  "weight": 70,
  "height": 170,
  "goal": "Stay Healthy",
  "dailyCalories": 0,
  "proteinTarget": 0
}
```

`GET /api/profile/:userId`

Return profile plus:

- `bmi`
- `bmiStatus`
- `idealWeightRange`
- `today_stats`

### Food

`GET /api/foods`

Return maksimal 50 makanan.

`GET /api/foods/:id`

Return detail satu makanan.

### Track

`POST /api/track/add`

Body:

```json
{
  "userId": "firebase-uid",
  "foodId": 1,
  "foodName": "Food Name",
  "calories": 250,
  "proteins": 20,
  "fat": 8,
  "carbs": 30,
  "quantity": 1,
  "mealType": "meal"
}
```

`GET /api/track/logs?userId=...&date=YYYY-MM-DD`

Return:

- `logs`
- `totals`

### AI

`POST /api/ai/food-list`

Body:

```json
{
  "userId": "firebase-uid"
}
```

Return top food recommendations.

`POST /api/ai/food-detail`

Body:

```json
{
  "userId": "firebase-uid",
  "foodId": 1
}
```

Return match score dan explanation.

`POST /api/ai/recommend`

Body ideal:

```json
{
  "userId": "firebase-uid",
  "macroContext": "You need 30g more protein today"
}
```

Return quick insight.

### Insights

Semua memakai query `userId`.

- `GET /api/insights/weekly-summary`
- `GET /api/insights/weekly-trends`
- `GET /api/insights/behavioral-insights`
- `GET /api/insights/weekly-comparison`
- `GET /api/insights/weekly-score`
- `GET /api/insights/nutrition-patterns`
- `GET /api/insights/food-patterns`
- `GET /api/insights/streaks`

## Cache dan Performa

Cache dipakai di beberapa layer:

1. Frontend sessionStorage
   `FoodDetailModal` menyimpan explanation makanan selama 30 menit.

2. Backend in-memory Map
   `recommendationService` menyimpan list rekomendasi final.
   `insightService` menyimpan quick insight.

3. Backend Redis
   `aiApiService` menyimpan hasil request rekomendasi AI per payload.

4. AI Service Redis
   `main.py` menyimpan explanation, daily insight, dan behavioral insight.

5. Request deduplication
   `aiApiService` memakai `inFlightRequests` agar request identik yang sedang berjalan tidak dikirim dua kali.

6. Circuit breaker
   Jika AI service error/rate limit berulang, backend menghentikan request sementara untuk menghindari overload.

## Catatan Teknis Penting

- Auth memakai Firebase, tetapi data profile dan log makanan disimpan di database backend.
- `user.id` di frontend adalah UID Firebase yang sudah dinormalisasi oleh `AuthProvider`.
- Beberapa file masih memakai `user.uid || user.id` untuk kompatibilitas.
- Scan image di `AnalyzePage` saat ini masih dummy result, belum benar-benar mengirim gambar ke AI.
- Search food mengambil maksimal 50 item dari backend karena `getAllFoods` memakai `take: 50`.
- Insight mingguan banyak memakai range 7 hari terakhir, bukan minggu kalender Senin-Minggu.
- `trendsService` secara eksplisit memakai timezone Asia/Jakarta agar tanggal chart cocok dengan user lokal.
- `InsightBanners` mengirim body yang belum sepenuhnya sama dengan ekspektasi `getQuickInsight`, tetapi fallback masih membuat fitur tidak crash.

## Ringkasan Alur Data End-to-End

### User baru

```text
Register/Login
  -> Firebase Auth
  -> syncUserToDb
  -> backend upsert Profile
  -> UserContext fetchProfile
  -> UI memakai userData
```

### Menambah makanan

```text
Search/Detail food
  -> addMealLog
  -> backend DailyLog create
  -> fetchProfile(force)
  -> today_stats update
  -> Home/Track berubah
```

### Rekomendasi makanan

```text
RecommendationList/MealsGrid
  -> backend recommendationService
  -> filter kandidat
  -> build AI payload
  -> FastAPI model predict
  -> cache
  -> frontend render card
```

### Detail rekomendasi

```text
FoodDetailModal
  -> sessionStorage cache check
  -> backend food-detail
  -> FastAPI recommend/explain
  -> Gemini explanation jika cache miss
  -> typewriter text
```

### Weekly insight

```text
InsightsPage
  -> backend trends/comparison/score/streaks
  -> render chart and score
  -> backend behavioral insights
  -> pattern engine + food pattern
  -> FastAPI Gemini behavioral JSON
  -> render insight cards
```
