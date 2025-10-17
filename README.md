# AI Job Finder (Adzuna + Fireworks/Dobby)

Simple Node.js + Express API that extracts job search parameters using the Dobby model (Fireworks) and fetches job ads from Adzuna.

## Setup

1. Clone repository
2. `npm install`
3. Copy `.env.example` to `.env` and fill values:
   - FIREWORKS_API_KEY
   - ADZUNA_APP_ID
   - ADZUNA_APP_KEY
   - ADZUNA_COUNTRY (e.g. gb)
   - PORT
4. `npm start`

## Endpoints

- `GET /` - health
- `POST /api/search` - body: `{ "query": "frontend developer in Berlin with 2 years experience" }`
  - Returns analysis and job list.

## Deploy to Railway
1. Push repository to GitHub.
2. Connect repository in Railway and deploy.
3. Add environment variables in Railway Settings (same names as `.env`).

