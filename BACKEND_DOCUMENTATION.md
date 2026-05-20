# Backend Documentation - KalorinAI

Tanggal review: 2026-05-17

Dokumen ini menjelaskan backend KalorinAI secara ringkas tetapi cukup detail untuk bahan konsultasi dengan advisor backend. Fokusnya adalah arsitektur, endpoint, fungsi per file, alur utama, serta kelemahan/bottleneck yang perlu didiskusikan.

## Ringkasan Sistem

Backend memakai Express.js, Prisma ORM, PostgreSQL, Redis, dan AI microservice FastAPI di port 8000.

Alur besar:

1. Frontend mengirim request ke Express backend di `localhost:5000`.
2. Backend membaca/menulis data melalui Prisma ke PostgreSQL.
3. Untuk rekomendasi makanan dan insight AI, backend memanggil AI microservice melalui HTTP.
4. Redis dipakai untuk cache hasil rekomendasi AI per-food.
5. Beberapa cache lain masih memakai in-memory `Map`.

Service utama:

- Master food: list dan detail makanan dari database.
- Profile: create/update profile, hitung BMI, target kalori/protein.
- Track: menyimpan log makanan harian dan mengambil total harian.
- AI recommendation: rekomendasi food-list, food-detail, dan daily insight.
- Insights: summary, trend, score, comparison, pattern, streak, behavioral insight.

## Cara Menjalankan

Backend:

```bash
cd backend
npm run dev
```

AI service, jika ingin test endpoint AI:

```bash
cd ai_service
uvicorn main:app --reload --port 8000
```

Redis, jika ingin cache AI aktif:

```bash
redis-server
```

Environment variables yang dipakai backend:

- `DATABASE_URL`: koneksi PostgreSQL untuk Prisma.
- `DIRECT_URL`: koneksi direct database, dipakai di Prisma datasource.
- `AI_URL`: base URL AI service, default `http://localhost:8000`.
- `REDIS_URL`: koneksi Redis, default `redis://localhost:6379`.

## Endpoint Map

### Health Check

`GET /`

Mengembalikan teks bahwa API berjalan.

### Food

`GET /api/foods`

Mengambil maksimal 50 master food dari tabel `Food`.

`GET /api/foods/:id`

Mengambil detail satu food berdasarkan `id`.

### Profile

Ada dua jalur route yang saat ini menuju function yang sama:

- `POST /api/profile`
- `POST /api/user/profile`

Body:

```json
{
  "userId": "test-user-1",
  "email": "test@example.com",
  "name": "Test User",
  "weight": 70,
  "height": 170,
  "goal": "Stay Healthy",
  "birthdate": "2000-01-01",
  "dailyCalories": 2000,
  "proteinTarget": 100
}
```

`GET /api/profile/:userId`

`GET /api/user/profile/:userId`

Mengambil profile, BMI, rentang berat ideal, dan statistik makan hari ini.

### Track

`POST /api/track/add`

Body:

```json
{
  "userId": "test-user-1",
  "foodId": 1,
  "foodName": "Abon",
  "calories": 280,
  "proteins": 9.2,
  "fat": 28.4,
  "carbs": 0,
  "quantity": 1,
  "mealType": "meal"
}
```

`GET /api/track/logs?userId=test-user-1&date=2026-05-17`

Mengambil log makanan harian dan total nutrisi harian.

### AI

`POST /api/ai/recommend`

Body:

```json
{
  "userId": "test-user-1",
  "macroContext": "User has eaten 1200 kcal today and needs more protein."
}
```

Menghasilkan quick daily insight.

`POST /api/ai/food-list`

Body:

```json
{
  "userId": "test-user-1"
}
```

Menghasilkan list rekomendasi makanan untuk user. Endpoint ini membutuhkan profile user, data food, AI service, dan idealnya Redis.

`POST /api/ai/food-detail`

Body:

```json
{
  "userId": "test-user-1",
  "foodId": 1
}
```

Menghasilkan detail rekomendasi satu makanan, termasuk explanation dari AI service.

### Insights

Semua endpoint insights memakai query `userId`.

- `GET /api/insights/weekly-summary?userId=...`
- `GET /api/insights/weekly-trends?userId=...`
- `GET /api/insights/behavioral-insights?userId=...`
- `GET /api/insights/weekly-comparison?userId=...`
- `GET /api/insights/weekly-score?userId=...`
- `GET /api/insights/nutrition-patterns?userId=...`
- `GET /api/insights/food-patterns?userId=...`
- `GET /api/insights/streaks?userId=...`

## Alur Penting

### Alur `POST /api/ai/food-list`

File utama: `backend/src/controllers/aiController.js` dan `backend/src/services/recommendationService.js`.

1. Controller membaca `userId` dari body.
2. Service mencari profile user dari tabel `Profile`.
3. Service mengambil beberapa kandidat food dari tabel `Food`.
4. Food difilter memakai `isFoodSuitable`.
5. Food diurutkan memakai `heuristicScore`.
6. Kandidat dikirim ke AI service melalui `requestRecommendation`.
7. Hasil AI yang `is_recommended` disimpan ke list akhir.
8. List akhir disimpan di in-memory cache `recommendationListCache`.

Catatan penting: response bisa kosong jika AI menolak semua kandidat atau AI service error untuk semua kandidat.

### Alur `POST /api/ai/food-detail`

1. Backend mengambil profile user dan food by id.
2. `buildAIPayload` menyusun payload numerik dan kategori.
3. Backend memanggil AI service endpoint `/api/recommend/explain`.
4. Redis cache digunakan untuk menyimpan hasil detail.

### Alur Insights

Insights kebanyakan membaca `DailyLog` dalam rentang 7 hari, lalu melakukan aggregasi di Node.js:

- Summary: rata-rata kalori/protein dan jumlah meal.
- Trends: data harian 7 hari.
- Score: skor konsistensi, protein, dan kalori.
- Pattern: pola tracking, spike kalori, weekend overeating, food dominan.
- Behavioral insights: pattern lokal dikirim ke AI service untuk dibuat insight.

## Dokumentasi File dan Method

### `backend/package.json`

Berisi script dan dependency backend.

- `npm run dev`: menjalankan `nodemon src/server.js`.
- `npm start`: menjalankan `node src/server.js`.
- `npm test`: belum ada test, masih placeholder.
- Prisma seed: `node prisma/seed.js`.

### `backend/package-lock.json`

Generated lockfile npm. Fungsinya mengunci versi dependency agar install di mesin lain tetap konsisten.

### `backend/src/server.js`

Entrypoint Express.

- Load `.env` dari `backend/.env`.
- Mengaktifkan `cors()` dan `express.json()`.
- Register route utama:
  - food endpoint.
  - profile endpoint langsung.
  - `/api/user`.
  - `/api/track`.
  - `/api/insights`.
  - `/api/ai/*`.
- Menjalankan server di `process.env.PORT || 5000`.

Catatan: ada duplikasi route profile langsung dan route profile melalui `/api/user`.

### `backend/src/controllers/foodController.js`

Mengelola master food.

- `getAllFoods(req, res)`: ambil maksimal 50 food dari tabel `Food`.
- `getFoodById(req, res)`: ambil food berdasarkan `req.params.id`; jika tidak ada, return 404.

### `backend/src/controllers/userController.js`

Mengelola profile user.

- `createOrUpdateProfile(req, res)`: membaca data user, menghitung BMI status, menghitung target kalori/protein jika perlu, lalu `upsert` ke tabel `Profile`.
- `getProfile(req, res)`: mengambil profile by `userId`, menghitung statistik makan hari ini, BMI, rentang berat ideal, dan status on-track.

Helper yang dipakai:

- `calculateUserStatus` dari `bmiUtils`.
- `calculateDailyNeeds` dari `calculatorUtils`.

### `backend/src/controllers/trackController.js`

Mengelola meal tracking.

- `addMealLog(req, res)`: menyimpan log makanan harian ke tabel `DailyLog`. Field minimal: `userId` dan `foodName`.
- `getDailyLogs(req, res)`: mengambil log berdasarkan `userId` dan optional `date`, lalu menghitung total kalori, protein, fat, carbs.

### `backend/src/controllers/aiController.js`

Controller untuk endpoint AI.

- `getQuickInsight(req, res)`: memanggil `generateInsight(userId, macroContext)`.
- `getRecommendedFoodList(req, res)`: memanggil `generateRecommendationList(userId)`.
- `getFoodRecommendation(req, res)`: memanggil `generateFoodDetail(userId, foodId)`.

### `backend/src/controllers/insightController.js`

Controller untuk insight dashboard.

- `getWeeklySummary(req, res)`: validasi `userId`, lalu memanggil summary service.
- `getWeeklyTrends(req, res)`: validasi `userId`, lalu memanggil trends service.
- `getBehavioralInsights(req, res)`: validasi `userId`, lalu memanggil behavioral AI service.
- `getWeeklyComparison(req, res)`: membandingkan 7 hari terakhir dengan 7 hari sebelumnya.
- `getWeeklyScore(req, res)`: menghitung skor nutrisi mingguan.
- `getNutritionPatterns(req, res)`: menghasilkan pattern nutrisi lokal.
- `getFoodPatterns(req, res)`: menghasilkan pattern makanan lokal.
- `getStreaks(req, res)`: menghitung streak tracking dan protein.

### `backend/src/routes/userRoutes.js`

Route profile alternatif.

- `POST /profile`: ke `createOrUpdateProfile`.
- `GET /profile/:userId`: ke `getProfile`.

Mounted di `server.js` sebagai `/api/user`.

### `backend/src/routes/trackRoutes.js`

Route tracking.

- `POST /add`: ke `addMealLog`.
- `GET /logs`: ke `getDailyLogs`.

Mounted di `server.js` sebagai `/api/track`.

### `backend/src/routes/insightRoutes.js`

Route insight.

- `/weekly-summary`
- `/weekly-trends`
- `/behavioral-insights`
- `/weekly-comparison`
- `/weekly-score`
- `/nutrition-patterns`
- `/food-patterns`
- `/streaks`

Mounted di `server.js` sebagai `/api/insights`.

### `backend/src/config/aiConfig.js`

Konfigurasi AI dan cache.

- `AI_URL`: URL AI service, default `http://localhost:8000`.
- `MAX_FOOD_SCAN`: jumlah food yang discan untuk kandidat rekomendasi.
- `AI_TIMEOUT`: timeout request AI dalam ms.
- `CACHE_TTL`: TTL cache AI.
- `INSIGHT_TTL`: TTL cache insight in-memory.
- `RECOMMENDATION_LIST_TTL`: TTL cache list rekomendasi in-memory.
- `CONCURRENT_LIMIT`: jumlah request AI paralel per batch.

### `backend/src/services/aiApiService.js`

Wrapper HTTP ke AI microservice dan Redis cache.

- `redisClient`: koneksi Redis.
- `getRedisCache(key)`: ambil cache dari Redis.
- `setRedisCache(key, value)`: simpan cache ke Redis.
- `REDIS_TTL_SECONDS`: konversi TTL cache dari konfigurasi millisecond ke second untuk Redis `setEx`.
- `circuitBreaker`: mencegah request ke AI saat error/rate limit berulang.
- `parseRetryDelay(errorData)`: membaca retry delay dari error AI/Gemini.
- `postWithRetry(endpoint, payload, retries)`: POST ke AI dengan retry dan circuit breaker.
- `deduplicatedPost(endpoint, payload)`: menggabungkan request identik yang sedang berjalan.
- `requestRecommendation(payload)`: score-only recommendation ke `/api/recommend`.
- `requestRecommendationWithExplanation(payload)`: recommendation detail ke `/api/recommend/explain`.
- `requestInsight(payload)`: daily insight ke `/api/daily-insight`.
- `requestBehavioralInsights(payload)`: behavioral insight ke `/api/behavioral-insights`.
- `getCircuitState()`: expose status circuit breaker, tapi belum dipakai endpoint monitoring.

### `backend/src/services/recommendationService.js`

Service rekomendasi makanan.

- `heuristicScore(food, userGoal, userStatus)`: scoring awal tanpa AI berdasarkan kalori, protein, fat, carbs, goal, dan BMI status.
- `isFoodSuitable(food, userGoal, userStatus)`: filter kasar makanan yang dianggap tidak cocok.
- `processWithLimit(items, limit, asyncFn)`: memproses request AI per batch dengan limit paralel.
- `generateRecommendationList(userId)`: alur utama food-list recommendation.
- `generateFoodDetail(userId, foodId)`: alur utama food-detail recommendation.

### `backend/src/services/insightService.js`

Service quick daily insight.

- `insightCache`: cache in-memory.
- `generateInsight(userId, macroContext)`: ambil profile user, hitung user status, panggil AI service, simpan hasil ke cache, dan return fallback jika AI error.

### `backend/src/services/insights/summaryService.js`

- `getWeeklySummaryService(userId)`: membaca log 7 hari terakhir, menghitung average calories, average protein, total meals, dan goal completion rate berbasis jumlah hari yang punya log.

### `backend/src/services/insights/trendsService.js`

- `getJakartaDate()`: membuat tanggal berdasarkan timezone Asia/Jakarta.
- `formatLocalDate(date)`: format date menjadi `YYYY-MM-DD` Asia/Jakarta.
- `getWeeklyTrendsService(userId)`: membuat data kalori/protein/carbs/fat per hari untuk 7 hari terakhir.

### `backend/src/services/insights/comparisonService.js`

- `getWeeklyComparisonService(userId)`: membandingkan current week dan previous week untuk calories, proteins, dan tracking days.

### `backend/src/services/insights/scoreService.js`

- `getWeeklyScoreService(userId)`: menghitung skor weekly nutrition dari consistency, protein target, dan calorie target.

Formula overall:

```text
overall = consistency * 0.4 + protein * 0.35 + calories * 0.25
```

### `backend/src/services/insights/patternEngineService.js`

- `generateNutritionPatterns(userId)`: membaca log 7 hari, menghitung consistency, calorie spike day, weekend overeating, protein goal hit days, under protein days, average calories/protein, dominant meal type, highest calorie food, dan highest protein food.

### `backend/src/services/insights/foodPatternService.js`

- `getFoodPatternService(userId)`: membaca log 7 hari, menghitung dominant foods, dominant meal type, highest calorie/protein food, weekend vs weekday calories, dan late night eating count.

### `backend/src/services/insights/behavioralInsightService.js`

- `getBehavioralInsightsService(userId)`: menggabungkan nutrition patterns dan food patterns, lalu POST ke AI service `/api/behavioral-insights`. Jika gagal, return fallback insight.

### `backend/src/services/insights/streakService.js`

- `getStreakService(userId)`: membaca semua log user, membuat grouped days, menghitung tracking streak aktif, longest tracking streak, dan protein streak.

### `backend/src/utils/bmiUtils.js`

- `calculateUserStatus(weight, height)`: menghitung BMI dan return kategori seperti `Normal_Weight`, `Overweight_Level_I`, `Obesity_Type_I`.

### `backend/src/utils/calculatorUtils.js`

- `calculateDailyNeeds(weight, height, birthdate, goal)`: menghitung kebutuhan kalori dan protein. Jika data tidak lengkap, return default `{ calories: 2000, protein: 100 }`.

Catatan: rumus BMR saat ini tidak memakai gender dan activity level user. Activity multiplier hardcoded `1.375`.

### `backend/src/utils/payloadBuilder.js`

- `safeNumber(value, fallback)`: parse angka dengan fallback.
- `calculateAge(birthdate)`: hitung umur dari birthdate, fallback 20.
- `buildAIPayload(user, food)`: menyusun payload untuk AI service berisi user age, weight, height, status, goal, dan data nutrisi food.

### `backend/src/utils/scoreUtils.js`

- `normalizeScore(score)`: parse score AI, clamp ke range 50-98.
- `getScoreLabel(score)`: return label seperti `Excellent Match`, `Good Match`, `Fair Match`, `Low Match`.

Catatan: `getScoreLabel` dipakai oleh `recommendationService.js` untuk menambahkan `matchLabel` pada response rekomendasi.

### `backend/src/utils/cacheUtils.js`

- `setCache(cache, key, value, ttl)`: simpan value dengan expiresAt.
- `getCache(cache, key)`: ambil cache jika belum expired.
- `clearExpiredCache(cache)`: helper cleanup expired cache, belum terlihat dipanggil otomatis.

### `backend/src/utils/dateUtils.js`

- `getJakartaDayRange(dateInput)`: membuat start/end day berbasis timezone Asia/Jakarta, optional input `YYYY-MM-DD`.
- `getJakartaRollingRange(days)`: membuat range rolling N hari berbasis Asia/Jakarta.
- `formatJakartaDate(date)`: format tanggal menjadi `YYYY-MM-DD` Asia/Jakarta.
- `formatJakartaWeekday(date)`: format weekday Asia/Jakarta.

### `backend/src/utils/requestValidation.js`

- `isBlank(value)`: cek value kosong.
- `isPositiveNumber(value)`: cek angka lebih dari 0.
- `isNonNegativeNumber(value)`: cek angka minimal 0.
- `hasInvalidNumber(payload, fields, validator)`: cek field numerik invalid pada request body.

### `backend/prisma/schema.prisma`

Model database:

- `Profile`: data user, berat/tinggi, goal, target kalori/protein.
- `Food`: master makanan.
- `DailyLog`: snapshot makanan yang dimakan user.
- `DailyInsight`: penyimpanan insight harian, tetapi belum terlihat dipakai service saat ini.

Index saat ini:

- `DailyLog @@index([userId, day])`
- `DailyLog @@index([userId, date])`
- `DailyLog @@index([foodId])`
- `DailyInsight @@index([userId])`

### `backend/prisma/seed.js`

- `main()`: membaca `backend/data/nutrition_data.json`, lalu `upsert` data ke tabel `Food`.
- Dipakai untuk mengisi master food database.

Catatan: seed melakukan upsert satu per satu, sehingga bisa lambat jika dataset bertambah besar.

### `backend/data/nutrition_data.json`

Dataset master food. Field penting:

- `id`
- `name`
- `calories`
- `proteins`
- `fat`
- `carbohydrate`
- `image`
- `food_cluster`

### `backend/prisma.config.ts`

Konfigurasi Prisma CLI:

- schema: `prisma/schema.prisma`
- migrations path: `prisma/migrations`
- datasource URL dari `DATABASE_URL`

### `backend/prisma/migrations/*`

Berisi migration SQL awal. Isi migration bisa berbeda dari `schema.prisma` karena setelah mengubah schema, workflow yang dipakai adalah `prisma db push`, bukan `prisma migrate`. `db push` menyinkronkan database langsung dari schema, tetapi tidak membuat file migration baru.

- `20260507172240_init_schema/migration.sql`: migration awal untuk tabel `Profile`, `Food`, dan `DailyLog`.
- `migration_lock.toml`: lock provider database Prisma, saat ini `postgresql`.

## Kelemahan dan Bottleneck yang Perlu Dibahas

### 1. Belum ada authentication dan authorization di backend

Risiko: hampir semua endpoint menerima `userId` dari client. Client bisa membaca atau menulis data user lain jika tahu `userId`.

File/function yang ditunjukkan:

- `backend/src/controllers/userController.js`
- `backend/src/controllers/trackController.js`
- `backend/src/controllers/insightController.js`
- `backend/src/controllers/aiController.js`

Pertanyaan ke advisor:

- "Apakah backend perlu verify Firebase token di setiap request, lalu mengambil `userId` dari token, bukan dari body/query?"
- "Pattern middleware auth yang cocok untuk Express project ini seperti apa?"

### 2. Validasi input sudah lebih aman, tapi belum pakai schema validator

Status: validasi dasar sudah ditambahkan untuk `userId`, `foodId`, field numerik profile, field numerik meal log, `birthdate`, dan format date `YYYY-MM-DD`.

Risiko tersisa: validasi masih manual per-controller, belum memakai schema validator seperti Zod/Joi. Format error juga belum sepenuhnya distandarkan.

File/function:

- `createOrUpdateProfile`
- `addMealLog`
- `getFoodById`
- `getRecommendedFoodList`
- `getFoodRecommendation`

Pertanyaan:

- "Sebaiknya pakai Zod/Joi/express-validator untuk validasi schema request?"
- "Response error standar backend sebaiknya bentuknya seperti apa?"

### 3. PrismaClient lifecycle masih perlu diperhatikan

Status: sebagian sudah dirapikan dengan singleton `backend/src/config/prisma.js`, sehingga controller/service memakai instance Prisma yang sama.

Risiko tersisa: belum ada graceful shutdown di `server.js`, sehingga disconnect Prisma saat process berhenti belum eksplisit.

File:

- `backend/src/config/prisma.js`
- `backend/src/server.js`

Pertanyaan:

- "Perlu graceful shutdown `prisma.$disconnect()` di server?"

### 4. Food recommendation punya latency dan dependency tinggi ke AI service

Risiko: `POST /api/ai/food-list` memanggil AI service untuk beberapa kandidat food. Jika AI lambat/down/rate-limited, endpoint bisa lambat atau return list kosong.

File/function:

- `generateRecommendationList`
- `processWithLimit`
- `requestRecommendation`
- `postWithRetry`

Bottleneck utama:

- HTTP call AI per kandidat food.
- Batch concurrency dibatasi `CONCURRENT_LIMIT = 3`.
- Ada delay 300 ms antar batch.
- Jika kandidat 15 dan AI lambat, user bisa menunggu lama.

Pertanyaan:

- "Apakah rekomendasi list sebaiknya precompute/background job?"
- "Apakah model AI bisa menerima batch list food sekali request, bukan satu request per food?"
- "Jika AI gagal, fallback recommendation lokal sebaiknya tetap dikirim atau return error?"

### 5. Cache TTL Redis perlu dijaga konsisten

Status: Redis TTL sudah dikonversi dari millisecond ke second sebelum dipakai di `setEx`.

Status tambahan: koneksi Redis sekarang di-catch saat startup, dan operasi get/set cache akan fallback diam-diam jika Redis belum ready.

Risiko tersisa: config TTL in-memory dan Redis masih berbagi satu konstanta millisecond, jadi perlu dijaga agar developer berikutnya tidak salah pakai satuan.

File/function:

- `backend/src/config/aiConfig.js`
- `backend/src/services/aiApiService.js` pada `setRedisCache`

Pertanyaan:

- "Untuk Redis, apakah TTL sebaiknya dibuat seconds terpisah dari TTL in-memory?"

### 6. Cache in-memory tidak cocok untuk production multi-instance

Risiko: `insightCache` dan `recommendationListCache` hilang saat server restart dan tidak share antar instance.

File/function:

- `insightService.js`
- `recommendationService.js`
- `cacheUtils.js`

Pertanyaan:

- "Apakah semua cache sebaiknya dipindah ke Redis?"
- "Perlu strategy invalidation saat profile user berubah?"

### 7. Timezone sudah lebih konsisten untuk query harian/mingguan

Status: helper `backend/src/utils/dateUtils.js` sudah ditambahkan. Query daily log, profile today stats, weekly summary, trends, score, patterns, food patterns, dan streak sekarang memakai boundary/format Asia/Jakarta.

Risiko tersisa: jika nanti fitur multi-timezone user ditambahkan, timezone tidak bisa hardcoded Asia/Jakarta lagi.

File/function:

- `addMealLog`
- `getDailyLogs`
- `getProfile`
- `getWeeklySummaryService`
- `getWeeklyTrendsService`
- `getStreakService`

Pertanyaan:

- "Apakah untuk scope aplikasi ini Asia/Jakarta cukup, atau perlu timezone per user?"
- "Apakah perlu simpan `dateKey` seperti `YYYY-MM-DD` untuk query harian agar lebih mudah dan cepat?"

### 8. Schema Prisma dan migration memakai workflow `db push`

Kondisi ini wajar jika perubahan schema diterapkan dengan `prisma db push`, karena `db push` tidak menulis file migration baru.

Risiko: jika orang lain setup database hanya dari migration lama, hasilnya bisa tidak sama dengan schema terbaru. Untuk development tunggal, `db push` masih bisa dipakai. Untuk kerja tim/deploy production, advisor biasanya akan menyarankan workflow migrate.

File:

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20260507172240_init_schema/migration.sql`

Pertanyaan:

- "Untuk tahap project ini, apakah cukup lanjut `prisma db push`, atau mulai pindah ke `prisma migrate dev`?"
- "Kalau nanti deploy/kerja tim, bagaimana strategi menyamakan DB fresh dengan schema terbaru?"

### 9. Index date range sudah ditambahkan di schema

Status: `@@index([userId, date])` sudah ditambahkan ke `DailyLog` di `schema.prisma`.

Risiko tersisa: jika kamu pakai `prisma db push`, index ini perlu dipush ke database agar benar-benar ada di DB.

File/function:

- `schema.prisma`
- `getDailyLogs`
- `getWeeklySummaryService`
- `getWeeklyTrendsService`
- `getWeeklyScoreService`
- `generateNutritionPatterns`
- `getFoodPatternService`

Pertanyaan:

- "Apakah `day` masih perlu disimpan jika sudah ada `date` dan timezone helper?"
- "Apakah perlu index lain untuk analytics/insights?"

### 10. Behavioral insight sudah lewat wrapper AI

Status: behavioral insight sudah memakai `requestBehavioralInsights` dari `aiApiService`, sehingga ikut retry, dedup, timeout, dan circuit breaker yang sama dengan AI endpoint lain.

Risiko tersisa: fallback masih generic jika AI service gagal.

File/function:

- `getBehavioralInsightsService`

Pertanyaan:

- "Fallback behavioral insight sebaiknya generic seperti sekarang, atau dibuat dari pattern lokal tanpa AI?"

### 11. Route profile duplikat

Saat ini profile bisa diakses lewat:

- `/api/profile`
- `/api/user/profile`

Risiko: API surface jadi membingungkan dan dokumentasi frontend bisa tidak konsisten.

File:

- `server.js`
- `routes/userRoutes.js`

Pertanyaan:

- "Route profile final sebaiknya yang mana?"
- "Apakah route lama perlu dideprecate?"

### 12. Error handling belum centralized

Setiap controller menangani try/catch sendiri. Bentuk error response belum selalu sama: ada yang `message`, ada yang `error`.

File:

- Semua controller.

Pertanyaan:

- "Apakah perlu middleware `errorHandler` dan helper `asyncHandler`?"
- "Format response error standar sebaiknya bagaimana?"

### 13. Endpoint insights bisa menjadi berat saat dashboard memanggil banyak endpoint sekaligus

Frontend kemungkinan memanggil beberapa endpoint insights untuk satu halaman. Setiap endpoint melakukan query `DailyLog` sendiri-sendiri.

File/function:

- Semua service di `backend/src/services/insights/*`

Bottleneck:

- Query berulang ke tabel yang sama.
- Aggregasi dilakukan di memory Node.js.

Pertanyaan:

- "Apakah lebih baik ada endpoint agregat `/api/insights/dashboard` yang menghitung semua data sekaligus?"
- "Apakah aggregasi sebaiknya sebagian dipindahkan ke query SQL/Prisma aggregate?"

### 14. `streakService` membaca semua log user

`getStreakService` tidak membatasi rentang tanggal. Jika user punya data bertahun-tahun, query dan proses grouping bisa berat.

File/function:

- `backend/src/services/insights/streakService.js`

Pertanyaan:

- "Apakah streak memang perlu semua data, atau cukup window tertentu?"
- "Kalau perlu semua data, apakah perlu materialized summary/streak table?"

### 15. Belum ada automated test

`npm test` masih placeholder.

Risiko: regression sulit dideteksi sebelum demo/konsul.

File:

- `backend/package.json`

Pertanyaan:

- "Test minimal apa yang paling penting: controller integration test, service unit test, atau endpoint test dengan Supertest?"

## Prioritas Perbaikan yang Paling Layak Dibahas

Urutan yang paling penting menurut review:

1. Auth middleware: jangan percaya `userId` dari client.
2. Standardized error response dan schema validator.
3. Tambahkan graceful shutdown Prisma dan cek migration/schema.
4. Perbaiki bottleneck AI recommendation, terutama batch request atau fallback lokal.
5. Putuskan workflow Prisma: lanjut `db push` atau pindah ke migrate.
6. Pindahkan cache in-memory ke Redis jika mulai production/multi-instance.
7. Tambahkan test minimal untuk endpoint critical.

## File yang Sebaiknya Ditunjukkan ke Advisor

Untuk sesi konsultasi backend, buka file ini:

1. `backend/src/server.js`
   - Tunjukkan route map dan duplikasi route profile.
2. `backend/src/controllers/aiController.js`
   - Tunjukkan endpoint `food-list` dan `food-detail`.
3. `backend/src/services/recommendationService.js`
   - Tunjukkan bottleneck utama rekomendasi AI.
4. `backend/src/services/aiApiService.js`
   - Tunjukkan Redis cache, retry, circuit breaker, dan TTL.
5. `backend/src/controllers/trackController.js`
   - Tunjukkan validasi dan penyimpanan `DailyLog`.
6. `backend/src/services/insights/*`
   - Tunjukkan query weekly/daily yang berulang.
7. `backend/prisma/schema.prisma`
   - Tunjukkan model, index, dan relasi.
8. `backend/prisma/migrations/20260507172240_init_schema/migration.sql`
   - Jelaskan bahwa file ini lama karena perubahan setelahnya memakai `prisma db push`.

## Pertanyaan Singkat untuk Advisor

- "Apakah design auth saya sudah aman kalau frontend mengirim `userId`, atau harus verify token di backend?"
- "Bagaimana best practice validasi request body/query di Express untuk project seperti ini?"
- "Apakah food recommendation lebih baik synchronous seperti sekarang, atau dibuat batch/background/precomputed?"
- "Kalau AI service down, backend sebaiknya return fallback lokal, empty list, atau error?"
- "Apakah sebaiknya TTL Redis dan TTL in-memory dipisah konfigurasinya agar satuannya tidak membingungkan?"
- "Kalau selama ini saya pakai `prisma db push`, kapan saya harus mulai pakai `prisma migrate dev`?"
- "Apakah index `DailyLog(userId, date)` sudah cukup untuk query weekly/daily?"
- "Bagaimana cara merapikan banyak endpoint insights agar tidak query data yang sama berkali-kali?"
- "Apakah singleton Prisma saat ini perlu ditambah graceful shutdown?"
- "Test backend minimal apa yang harus saya punya sebelum lanjut fitur?"

## Kesimpulan

Backend sudah punya pembagian controller, route, service, util, dan Prisma yang cukup jelas. Beberapa risk teknis sudah dirapikan: Prisma singleton, Redis TTL/connect fallback, validasi dasar, timezone Asia/Jakarta, index `DailyLog(userId, date)`, dan behavioral insight via AI wrapper. Bagian yang paling perlu dibahas sebelum production adalah security/auth, standardized validation/error, workflow Prisma `db push` vs migrate, dan desain alur rekomendasi AI yang masih berpotensi menjadi bottleneck.
