<p align="center">
  <img src="frontend/public/images/logo/kalorinLogo.png" alt="KaloriN AI" width="280" />
</p>

# KaloriN AI

KaloriN AI is a nutrition tracking web app with AI-powered food scanning, meal logging, personalized recommendations, BMI-based calorie targets, and weekly nutrition insights.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, React Router, Firebase Auth |
| Backend | Node.js, Express, Prisma |
| Database | Supabase PostgreSQL |
| AI Service | FastAPI, TensorFlow/Keras, scikit-learn, Gemini |
| Cache | Redis |

## Repository Structure

```text
.
├── frontend/              # React app
├── backend/               # Express API and Prisma schema
├── ai_service/            # FastAPI AI microservice and ML assets
├── APP_LOGIC_DOCUMENTATION.md
├── BACKEND_DOCUMENTATION.md
└── USER_GUIDE.md
```

## Prerequisites

Install these before running the full app:

- Node.js 18+ and npm
- Python 3.10+
- Supabase PostgreSQL project
- Firebase project with Authentication enabled
- Gemini API key
- Redis (optional, recommended for caching)

## Environment Variables

Create local `.env` files in each service. Do not commit real secrets.

### `frontend/.env`

```env
VITE_API_URL=http://localhost:5000
```

Firebase config is currently set in `frontend/src/config/firebase.js`.

### `backend/.env`

```env
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/postgres
DIRECT_URL=postgresql://USER:PASSWORD@HOST:PORT/postgres
AI_URL=http://localhost:8000
AI_TIMEOUT=15000
REDIS_URL=redis://localhost:6379
FIREBASE_SERVICE_ACCOUNT_BASE64=base64_encoded_firebase_service_account_json
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
SUPABASE_URL=https://PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_AVATAR_BUCKET=avatars

# Optional external recipe APIs
SPOONACULAR_API_KEY=
EDAMAM_APP_ID=
EDAMAM_APP_KEY=
```

Notes:
- `FIREBASE_SERVICE_ACCOUNT_BASE64` is used by backend to verify Firebase ID tokens.
- `CORS_ORIGINS` is a comma-separated allowlist.
- `SUPABASE_SERVICE_ROLE_KEY` must remain server-side only.

### `ai_service/.env`

```env
GOOGLE_API_KEY=your_gemini_api_key
REDIS_URL=redis://localhost:6379
GEMINI_TIMEOUT_SECONDS=12
```

## Quick Replication Steps

```bash
git clone <repo-url>
cd kalorinAi
```

### 1. Start Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Backend runs at `http://localhost:5000`.

### 2. Start AI Service

```bash
cd ai_service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

AI service runs at `http://localhost:8000`.

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 4. (Optional) Start Redis

```bash
redis-server
```

If Redis is not running, the app still works but AI caching is reduced.

## Main App Routes

| Route | Access | Description |
| --- | --- | --- |
| `/` | Guest | Landing page |
| `/analyze` | Guest/User | Food scan and food search |
| `/login` | Guest | Sign in |
| `/register` | Guest | Create account |
| `/home` | User only | Dashboard |
| `/meals` | User only | AI meal recommendations |
| `/track` | User only | Daily meal tracking |
| `/insights` | User only | Weekly nutrition insights |
| `/profile` | User only | Profile, body stats, goals, and account name |

Protected routes are guarded in the frontend.

## Key API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | Backend health check |
| `GET` | `/api/foods` | Get master food list |
| `GET` | `/api/foods/search?keyword=...` | Search foods |
| `GET` | `/api/foods/:id` | Get one food |
| `POST` | `/api/profile` | Create or update profile |
| `GET` | `/api/profile/:userId` | Get profile, BMI, targets, and today's stats |
| `POST` | `/api/track/add` | Add meal log |
| `GET` | `/api/track/logs` | Get daily logs |
| `POST` | `/api/ai/food-list` | Get recommended food list |
| `POST` | `/api/ai/food-detail` | Get AI explanation for one food |
| `GET` | `/api/insights/*` | Weekly insights endpoints |
| `POST` | `/api/scanner/scan-food` | Analyze uploaded food image |

More backend details: `BACKEND_DOCUMENTATION.md`.

## Database

Prisma schema: `backend/prisma/schema.prisma`

Main models:
- `Profile`
- `Food`
- `DailyLog`
- `DailyInsight`

Seed data: `backend/data/nutrition_data.json`

## Common Development Workflow

Run services in separate terminals:

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd ai_service
source .venv/bin/activate
uvicorn main:app --reload --port 8000

# Terminal 3
cd frontend
npm run dev
```

## Work Completed (Project Log)

- Set up modular architecture (`frontend`, `backend`, `ai_service`)
- Implemented Firebase authentication (email/password + Google)
- Added profile onboarding and BMI/calorie/protein target calculation
- Built AI food scanner integration
- Built food recommendation and explanation flow
- Added daily tracking and weekly insight modules
- Added guest mode for limited access

## Known Limitations

- No end-to-end test suite yet
- Some external API integrations are optional and key-dependent
- Redis is optional but affects recommendation/explanation caching quality

## Additional Documentation

- `APP_LOGIC_DOCUMENTATION.md` - app flow and architecture notes
- `BACKEND_DOCUMENTATION.md` - backend implementation details
- `USER_GUIDE.md` - non-technical usage guide

## Useful Commands

```bash
# Frontend
cd frontend
npm run dev
npm run build
npm run lint

# Backend
cd backend
npm run dev
npx prisma studio
npx prisma db seed

# AI service
cd ai_service
uvicorn main:app --reload --port 8000
```

## Notes

- Authenticated users must complete birthdate, weight, and height before using protected features.
- Guest users can access only landing and food analysis pages.
