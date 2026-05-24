# KaloriN AI

KaloriN AI is a nutrition tracking web app with AI-powered food scanning, meal logging, personalized recommendations, BMI-based calorie targets, and weekly nutrition insights.

The project is split into three services:

- `frontend/` - React + Vite client with Firebase Authentication.
- `backend/` - Express API with Prisma and PostgreSQL.
- `ai_service/` - FastAPI microservice for food classification, recommendation scoring, and AI explanations.

## Features

- Firebase email/password and Google authentication.
- Required onboarding profile data for authenticated users: birthdate, weight, and height.
- Automatic BMI, ideal weight range, daily calorie, and protein target calculation.
- Guest mode for food analysis without account access to protected pages.
- Food image scanner powered by the AI service.
- Food search and add-to-meal logging.
- Personalized food recommendations.
- Daily nutrition progress and meal history.
- Weekly insights, trends, score, comparison, and behavioral AI insights.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, React Router, Firebase Auth |
| Backend | Node.js, Express, Prisma |
| Database | PostgreSQL |
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

- Node.js and npm
- Python 3.10+ recommended
- PostgreSQL
- Redis, optional but recommended for AI caching
- Firebase project with Authentication enabled
- Google Gemini API key for AI explanations and behavioral insights

## Environment Variables

Create local `.env` files in each service. Do not commit real secrets.

### `frontend/.env`

```env
VITE_API_URL=http://localhost:5000
```

Firebase configuration is currently defined in `frontend/src/config/firebase.js`. If you move Firebase config to environment variables later, make sure the variable names match that file.

### `backend/.env`

```env
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/kalorinai
DIRECT_URL=postgresql://USER:PASSWORD@localhost:5432/kalorinai
AI_URL=http://localhost:8000
AI_TIMEOUT=15000
REDIS_URL=redis://localhost:6379

# Optional external recipe APIs
SPOONACULAR_API_KEY=
EDAMAM_APP_ID=
EDAMAM_APP_KEY=
```

### `ai_service/.env`

```env
GOOGLE_API_KEY=your_gemini_api_key
REDIS_URL=redis://localhost:6379
GEMINI_TIMEOUT_SECONDS=12
```

## Setup

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

Default URL: `http://localhost:5173`

### 2. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Default API URL: `http://localhost:5000`

### 3. AI Service

```bash
cd ai_service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Default AI URL: `http://localhost:8000`

### 4. Redis

If Redis is installed locally:

```bash
redis-server
```

The app can still run with limited caching if Redis is unavailable, but recommendation and explanation caching will be less effective.

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

Then open `http://localhost:5173`.

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

Protected routes are guarded in the frontend so guests cannot bypass them by typing the URL.

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

More backend details are available in `BACKEND_DOCUMENTATION.md`.

## Database

Prisma models live in `backend/prisma/schema.prisma`.

Main models:

- `Profile` - user identity, body stats, nutrition goal, calculated targets.
- `Food` - master food nutrition data.
- `DailyLog` - daily meal logs with nutrition snapshots.
- `DailyInsight` - stored AI insight text.

Seed data lives in `backend/data/nutrition_data.json`.

## User Guide

See `USER_GUIDE.md` for non-technical instructions covering:

- Guest mode
- Creating an account
- Completing profile onboarding
- Scanning food
- Searching and adding meals
- Tracking daily intake
- Reading recommendations and insights
- Editing profile, goals, and account name

## Additional Documentation

- `APP_LOGIC_DOCUMENTATION.md` - application flow and architecture notes.
- `BACKEND_DOCUMENTATION.md` - backend endpoints, services, and implementation notes.

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

- Authenticated users must complete birthdate, weight, and height before using protected account features.
- Guest users can access only the landing page and food analysis page.
- AI recommendations require a complete user profile and the AI service running.
- Gemini-based explanations require `GOOGLE_API_KEY`.
- Redis improves caching but should not be treated as the source of truth.
