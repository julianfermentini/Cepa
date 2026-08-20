<h1 align="center">🍷 Cepa</h1>

<p align="center">
  <strong>B2B SaaS traceability platform for boutique wineries: from vineyard to glass, in a QR code.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Go-1.23-00ADD8?logo=go&logoColor=white" alt="Go 1.23">
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL 16">
  <img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white" alt="Redis 7">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/FastAPI-AI%20sidecar-009688?logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" alt="Docker Compose">
</p>

<p align="center">
  <a href="README.md">🇦🇷 Leer en Español</a>&nbsp;&nbsp;·&nbsp;&nbsp;🇺🇸 English
</p>

---

## What it is

Cepa digitizes the story behind every batch ("lot") a boutique winery produces. The winery enters
a lot's production data (vineyard, harvest, winemaking, winemaker notes) and publishes it; the
system generates a unique short code printed as a QR on the bottle label. When a consumer scans
it, they land on a public page telling that bottle's story — no app install required — while the
winery sees in its dashboard how many times each lot was scanned, from which countries, and when.

It's a backend-first project: the focus is the Go API, the multi-winery data model, and the
lot → QR → scan → analytics pipeline. The React dashboard and the AI sidecar sit around that API.

## How it works

```
Winery creates a Lot → publishes it → a short_code + public URL are generated
                                        │
                             Consumer scans the QR
                                        │
                    GET /api/v1/public/lots/{short_code}
                                        │
                       Public landing page with the lot's story
                                        │
                The winery sees the scan in /analytics/overview
```

## Architecture

```
┌────────────────────────┐        ┌─────────────────────────┐
│  Dashboard (React)     │──────▶│   Go API (chi router)    │
│  login, lots,          │ REST  │   /api/v1/auth           │
│  analytics             │       │   /api/v1/lots           │
└────────────────────────┘       │   /api/v1/public         │
                                   │   /api/v1/analytics      │
┌────────────────────────┐        │   /q/{short_code}        │
│  Consumer (QR scan)    │───────▶│                          │
└────────────────────────┘        └──────────┬───────────────┘
                                              │
                              ┌───────────────┼──────────────┐
                              ▼                              ▼
                     ┌─────────────────┐          ┌──────────────────┐
                     │  PostgreSQL     │          │  Redis (optional  │
                     │  (pgx, no ORM)  │          │  cache)           │
                     └─────────────────┘          └──────────────────┘

┌──────────────────────────────────┐
│  ai-sidecar (Python + FastAPI)   │  ← standalone microservice in
│  storytelling / pairings         │    docker-compose, not yet wired
└──────────────────────────────────┘    into the Go backend (see Roadmap)
```

## Stack

| Layer | Technology |
|---|---|
| **Backend** | **Go 1.23**, [chi](https://github.com/go-chi/chi) (router), [pgx](https://github.com/jackc/pgx) (Postgres, no ORM), `golang-jwt`, `slog` |
| **Database** | PostgreSQL 16, plain versioned SQL migrations |
| **Cache** | Redis 7 (optional — the server still boots if it's unavailable) |
| **AI** | Python 3 + FastAPI, separate microservice for storytelling and food pairings |
| **Winery frontend** | React + Vite + Tailwind CSS, `react-router` |
| **Dev infra** | Docker Compose (Postgres, Redis, MinIO, API with `air` hot-reload, sidecar, dashboard) |
| **Deploy** | Backend on Railway/Fly.io, frontend on Vercel, Postgres on Supabase |

## API endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | — | Health check |
| `POST` | `/api/v1/auth/register` | — | Register a winery |
| `POST` | `/api/v1/auth/login` | — | Login, returns a JWT |
| `POST` | `/api/v1/auth/refresh` | — | Refresh token |
| `GET/POST` | `/api/v1/lots` | JWT | List / create lots |
| `GET/PUT/DELETE` | `/api/v1/lots/{id}` | JWT | Get / update / delete a lot |
| `POST` | `/api/v1/lots/{id}/publish` | JWT | Publishes the lot and generates its public `short_code` |
| `GET` | `/q/{short_code}` | — | Redirects the consumer to the public landing page |
| `GET` | `/api/v1/public/lots/{short_code}` | — | Public lot data (records the scan event) |
| `GET` | `/api/v1/analytics/overview` | JWT | Winery-wide metrics |
| `GET` | `/api/v1/analytics/lots/top` | JWT | Most-scanned lots |
| `GET` | `/api/v1/analytics/countries` | JWT | Scans grouped by country |

## Project structure

```
cepa/
├── cmd/api/main.go          # entry point: router, middleware, dependency wiring
├── internal/
│   ├── auth/                # JWT, register/login, auth middleware
│   ├── lots/                # lot CRUD + publish
│   ├── experience/          # public endpoints the QR flow consumes
│   └── analytics/           # scan metrics
├── pkg/
│   ├── db/                  # pgx connection to PostgreSQL
│   ├── cache/                # Redis client
│   └── config/               # configuration loaded from environment variables
├── migrations/               # plain SQL, no ORM
├── ai-sidecar/                # Python/FastAPI microservice (storytelling, pairings)
└── frontend/dashboard/         # React dashboard for the winery
```

## Running locally

```bash
cp .env.example .env
make dev            # docker compose up --build: API + Postgres + Redis + MinIO + sidecar + dashboard
```

Without Docker:

```bash
go run ./cmd/api                          # requires Postgres running and DATABASE_URL set
cd frontend/dashboard && npm install && npm run dev
```

Demo account (after running `migrations/002_seed_demo.sql`): `demo@cepa.wine` / `cepa2024`.

## Roadmap

The design targets full multi-tenancy, a downloadable QR image endpoint, PDF certificates, and
wiring the AI sidecar into the Go backend for real (it currently returns placeholder content and
is ready to be connected). These are next steps, not finished functionality.

---

<p align="center">
  <a href="README.md">🇦🇷 Leer este README en Español</a>
</p>
