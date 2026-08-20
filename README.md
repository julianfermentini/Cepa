<h1 align="center">🍷 Cepa</h1>

<p align="center">
  <strong>SaaS B2B de trazabilidad para bodegas boutique: de la cepa a la copa, en un QR.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Go-1.23-00ADD8?logo=go&logoColor=white" alt="Go 1.23">
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL 16">
  <img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white" alt="Redis 7">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/FastAPI-sidecar%20IA-009688?logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" alt="Docker Compose">
</p>

<p align="center">
  🇦🇷 Español&nbsp;&nbsp;·&nbsp;&nbsp;<a href="README.en.md">🇺🇸 Read in English</a>
</p>

---

## Qué es

Cepa digitaliza la historia de cada lote de vino de una bodega boutique. La bodega carga los
datos de producción de un lote (viñedo, cosecha, elaboración, enólogo) y lo publica; el sistema
genera un código corto único que se imprime como QR en la etiqueta. Cuando un consumidor lo
escanea, accede a una landing pública con la historia de esa botella — sin instalar nada — y la
bodega ve en su dashboard cuántas veces se escaneó cada lote, desde qué países y en qué fechas.

Es un proyecto backend-first: el foco está en la API en Go, el modelo de datos multi-bodega y el
pipeline lote → QR → escaneo → analytics. El dashboard React y el sidecar de IA acompañan esa API.

## Cómo funciona

```
Bodega crea Lote → publica → se genera short_code + URL pública
                                        │
                            Consumidor escanea el QR
                                        │
                    GET /api/v1/public/lots/{short_code}
                                        │
                     Landing pública con los datos del lote
                                        │
                  La bodega ve el escaneo en /analytics/overview
```

## Arquitectura

```
┌────────────────────────┐        ┌─────────────────────────┐
│  Dashboard (React)     │──────▶│   API Go (chi router)    │
│  login, lotes,         │ REST  │   /api/v1/auth           │
│  analytics             │       │   /api/v1/lots           │
└────────────────────────┘       │   /api/v1/public         │
                                   │   /api/v1/analytics      │
┌────────────────────────┐        │   /q/{short_code}        │
│  Consumidor (QR scan)  │───────▶│                          │
└────────────────────────┘        └──────────┬───────────────┘
                                              │
                              ┌───────────────┼──────────────┐
                              ▼                              ▼
                     ┌─────────────────┐          ┌──────────────────┐
                     │  PostgreSQL     │          │  Redis (cache,    │
                     │  (pgx, sin ORM) │          │  opcional)        │
                     └─────────────────┘          └──────────────────┘

┌──────────────────────────────────┐
│  ai-sidecar (Python + FastAPI)   │  ← microservicio independiente en el
│  storytelling / maridajes        │    docker-compose, todavía sin conectar
└──────────────────────────────────┘    al backend Go (ver Roadmap)
```

## Stack

| Capa | Tecnología |
|---|---|
| **Backend** | **Go 1.23**, [chi](https://github.com/go-chi/chi) (router), [pgx](https://github.com/jackc/pgx) (Postgres sin ORM), `golang-jwt`, `slog` |
| **Base de datos** | PostgreSQL 16, migraciones SQL planas versionadas |
| **Cache** | Redis 7 (opcional — el servidor arranca igual si no está disponible) |
| **IA** | Python 3 + FastAPI, microservicio separado para storytelling y maridajes |
| **Frontend bodega** | React + Vite + Tailwind CSS, `react-router` |
| **Infra dev** | Docker Compose (Postgres, Redis, MinIO, API con hot-reload vía `air`, sidecar, dashboard) |
| **Deploy** | Backend en Railway/Fly.io, frontend en Vercel, Postgres en Supabase |

## Endpoints de la API

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/health` | — | Healthcheck |
| `POST` | `/api/v1/auth/register` | — | Alta de bodega |
| `POST` | `/api/v1/auth/login` | — | Login, devuelve JWT |
| `POST` | `/api/v1/auth/refresh` | — | Refresh de token |
| `GET/POST` | `/api/v1/lots` | JWT | Listar / crear lotes |
| `GET/PUT/DELETE` | `/api/v1/lots/{id}` | JWT | Detalle / editar / borrar lote |
| `POST` | `/api/v1/lots/{id}/publish` | JWT | Publica el lote y genera su `short_code` público |
| `GET` | `/q/{short_code}` | — | Redirige al consumidor a la landing pública |
| `GET` | `/api/v1/public/lots/{short_code}` | — | Datos públicos del lote (registra el escaneo) |
| `GET` | `/api/v1/analytics/overview` | JWT | Métricas generales de la bodega |
| `GET` | `/api/v1/analytics/lots/top` | JWT | Lotes con más escaneos |
| `GET` | `/api/v1/analytics/countries` | JWT | Escaneos agrupados por país |

## Estructura del proyecto

```
cepa/
├── cmd/api/main.go          # entry point: router, middleware, wiring de dependencias
├── internal/
│   ├── auth/                # JWT, registro/login, middleware de autenticación
│   ├── lots/                # CRUD de lotes + publicación
│   ├── experience/          # endpoints públicos que consume el QR
│   └── analytics/           # métricas de escaneos
├── pkg/
│   ├── db/                  # conexión pgx a PostgreSQL
│   ├── cache/                # cliente Redis
│   └── config/               # carga de configuración desde variables de entorno
├── migrations/               # SQL plano, sin ORM
├── ai-sidecar/                # microservicio Python/FastAPI (storytelling, maridajes)
└── frontend/dashboard/         # panel React de la bodega
```

## Correr en local

```bash
cp .env.example .env
make dev            # docker compose up --build: API + Postgres + Redis + MinIO + sidecar + dashboard
```

Sin Docker:

```bash
go run ./cmd/api                          # requiere Postgres corriendo y DATABASE_URL configurada
cd frontend/dashboard && npm install && npm run dev
```

Cuenta demo (tras correr `migrations/002_seed_demo.sql`): `demo@cepa.wine` / `cepa2024`.

## Roadmap

El diseño contempla multi-tenancy completo, generación de imagen QR descargable, certificados en
PDF y conexión real del sidecar de IA al backend Go (hoy responde datos de ejemplo, listo para
integrarse). Estos son los próximos pasos, no funcionalidad ya terminada.

---

<p align="center">
  <a href="README.en.md">🇺🇸 Read this README in English</a>
</p>
