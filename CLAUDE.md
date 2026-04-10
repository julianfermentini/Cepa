# Cepa — Contexto del proyecto

## Qué es Cepa

Cepa es una plataforma SaaS B2B para bodegas boutique y vinos premium que digitaliza
la historia completa de cada botella de vino: desde el viñedo hasta la copa del consumidor.

El producto tiene dos caras:
- **Para la bodega:** un sistema de gestión donde carga los datos de cada lote (viñedo,
  cosecha, elaboración, enólogo) y obtiene QRs dinámicos para sus etiquetas.
- **Para el consumidor:** una experiencia web progresiva (PWA) accesible escaneando el QR
  de la botella — sin instalar ninguna app — que muestra la historia del vino, el viaje
  por etapas, perfil sensorial, maridajes generados por IA y verificación de autenticidad.

La bodega también accede a analytics: cuántas veces se escaneó cada lote, desde qué países,
en qué fechas, y qué porcentaje descargó el certificado PDF.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend / API | Go (principal) |
| Base de datos | PostgreSQL |
| Cache / pub-sub | Redis |
| IA / ML sidecar | Python (FastAPI) — llamado por gRPC desde Go |
| Frontend bodega | React + Tailwind |
| Frontend consumidor (QR) | Next.js (PWA, SSR para SEO y velocidad) |
| Almacenamiento archivos | S3-compatible (MinIO en dev) |
| Infraestructura | Docker + Docker Compose en dev |

---

## Arquitectura general

```
┌─────────────────────────────────────────────────────┐
│  Clientes                                           │
│  - Dashboard bodega (React)                         │
│  - Landing QR consumidor (Next.js PWA)              │
│  - API pública (futura integración third-party)     │
└────────────────────┬────────────────────────────────┘
                     │ HTTP/REST + WebSockets
┌────────────────────▼────────────────────────────────┐
│  API Gateway — Go                                   │
│  - Auth JWT + API keys                              │
│  - Multi-tenant middleware (por bodega)             │
│  - Rate limiting                                    │
│  - Routing a microservicios internos                │
└──┬──────────────┬──────────────┬───────────────┬────┘
   │              │              │               │
┌──▼──┐     ┌────▼────┐   ┌─────▼────┐   ┌─────▼────┐
│Lotes│     │  QR /   │   │Analytics │   │Certific. │
│ Go  │     │Experienc│   │   Go     │   │  Go      │
│     │     │  Go     │   │          │   │          │
└──┬──┘     └────┬────┘   └─────┬────┘   └─────┬────┘
   │              │              │               │
   └──────────────┴──────────────┴───────────────┘
                     │
         ┌───────────▼──────────┐
         │   PostgreSQL + Redis  │
         └──────────────────────┘
                     │
         ┌───────────▼──────────┐
         │  Python AI sidecar   │
         │  - Storytelling LLM  │
         │  - Maridajes IA      │
         │  - Perfil sensorial  │
         └──────────────────────┘
```

---

## Estructura de carpetas del proyecto

```
cepa/
├── cmd/
│   └── api/
│       └── main.go              # Entry point del servidor Go
├── internal/
│   ├── auth/                    # JWT, API keys, middleware
│   ├── tenant/                  # Multi-tenancy (por bodega)
│   ├── lots/                    # Gestión de lotes de vino
│   ├── qr/                      # Generación y resolución de QRs
│   ├── experience/              # Datos para la landing del consumidor
│   ├── analytics/               # Registro y consulta de escaneos
│   ├── certificates/            # Generación de PDFs
│   └── ai/                      # Cliente gRPC al sidecar Python
├── pkg/
│   ├── db/                      # Conexión y migrations PostgreSQL
│   ├── cache/                   # Cliente Redis
│   ├── storage/                 # Cliente S3
│   └── config/                  # Configuración desde env vars
├── migrations/                  # Archivos SQL de migración
├── ai-sidecar/                  # Microservicio Python
│   ├── main.py
│   ├── storytelling.py          # Generación de relato con LLM
│   ├── pairings.py              # Maridajes con IA
│   └── requirements.txt
├── frontend/
│   ├── dashboard/               # React — panel de la bodega
│   └── consumer/                # Next.js — landing QR del consumidor
├── docker-compose.yml
├── Makefile
└── CLAUDE.md                    # Este archivo
```

---

## Modelo de datos principal

### Tablas clave en PostgreSQL

```sql
-- Una fila por bodega cliente
wineries (
  id UUID PK,
  name TEXT,
  slug TEXT UNIQUE,        -- usado en URLs del QR
  logo_url TEXT,
  primary_color TEXT,      -- para white-label de la landing
  created_at TIMESTAMPTZ
)

-- Un viñedo puede tener múltiples lotes
vineyards (
  id UUID PK,
  winery_id UUID FK,
  name TEXT,               -- "Finca El Espino"
  location TEXT,           -- "Agrelo, Mendoza"
  altitude_m INT,          -- 950
  soil_type TEXT,
  lat DECIMAL, lng DECIMAL
)

-- El corazón del sistema: cada lote de producción
lots (
  id UUID PK,
  winery_id UUID FK,
  vineyard_id UUID FK,
  name TEXT,               -- "Valle Escondido Malbec 2022"
  variety TEXT,            -- "Malbec"
  vintage_year INT,        -- 2022
  harvest_date DATE,
  harvest_kg DECIMAL,
  brix_at_harvest DECIMAL,
  ph_at_harvest DECIMAL,
  fermentation_days INT,
  barrel_type TEXT,        -- "Roble francés 70% nueva"
  barrel_months INT,
  winemaker_name TEXT,
  winemaker_note TEXT,     -- nota personal del enólogo (texto libre)
  bottle_count INT,
  bottled_at DATE,
  lot_code TEXT UNIQUE,    -- "#VE2022-047"
  status TEXT,             -- draft | active | archived
  hash TEXT,               -- SHA-256 para verificación de autenticidad
  created_at TIMESTAMPTZ
)

-- Perfil sensorial de cada lote (calculado o cargado manualmente)
lot_sensory_profiles (
  lot_id UUID PK FK,
  red_fruit INT,           -- 0-100
  spices INT,
  wood INT,
  tannins INT,
  acidity INT,
  body INT,
  service_temp_min INT,    -- grados Celsius
  service_temp_max INT,
  decant_minutes INT,
  glass_type TEXT
)

-- QR único por lote (dinámico — el destino puede actualizarse)
qr_codes (
  id UUID PK,
  lot_id UUID FK,
  short_code TEXT UNIQUE,  -- código corto para la URL: cepa.wine/q/abc123
  target_url TEXT,
  created_at TIMESTAMPTZ
)

-- Cada escaneo del QR registrado
scan_events (
  id UUID PK,
  qr_code_id UUID FK,
  lot_id UUID FK,
  winery_id UUID FK,
  scanned_at TIMESTAMPTZ,
  country_code TEXT,       -- detectado por IP
  city TEXT,
  device_type TEXT,        -- mobile | tablet | desktop
  downloaded_pdf BOOLEAN DEFAULT FALSE
)

-- Contenido generado por IA (cacheado por lote e idioma)
ai_content (
  id UUID PK,
  lot_id UUID FK,
  language TEXT,           -- "es" | "en" | "pt"
  story TEXT,              -- relato narrativo del vino
  pairings JSONB,          -- array de maridajes sugeridos
  generated_at TIMESTAMPTZ
)
```

---

## Endpoints principales de la API (Go)

### Autenticación
- `POST /api/v1/auth/login` — login bodega, devuelve JWT
- `POST /api/v1/auth/refresh` — refresh token

### Bodegas (requiere JWT)
- `GET  /api/v1/winery/me` — datos de la bodega autenticada
- `PUT  /api/v1/winery/me` — actualizar branding/configuración

### Viñedos
- `GET  /api/v1/vineyards` — listar viñedos de la bodega
- `POST /api/v1/vineyards` — crear viñedo
- `PUT  /api/v1/vineyards/:id` — editar viñedo

### Lotes (core del sistema)
- `GET  /api/v1/lots` — listar lotes con filtros
- `POST /api/v1/lots` — crear lote nuevo
- `GET  /api/v1/lots/:id` — detalle de lote
- `PUT  /api/v1/lots/:id` — editar lote
- `POST /api/v1/lots/:id/publish` — publicar lote (genera QR)
- `GET  /api/v1/lots/:id/qr` — descargar QR en PNG/SVG/PDF

### Experiencia del consumidor (pública, sin auth)
- `GET  /q/:short_code` — resuelve el QR y redirige a la landing
- `GET  /api/v1/public/lots/:short_code` — datos del lote para la PWA
- `GET  /api/v1/public/lots/:short_code/story?lang=es` — storytelling IA
- `POST /api/v1/public/scan` — registra evento de escaneo
- `GET  /api/v1/public/lots/:short_code/certificate` — descarga PDF

### Analytics (requiere JWT)
- `GET  /api/v1/analytics/overview` — métricas generales
- `GET  /api/v1/analytics/scans?lot_id=&from=&to=` — escaneos por filtro
- `GET  /api/v1/analytics/countries` — escaneos por país
- `GET  /api/v1/analytics/lots/top` — lotes con más interacción

---

## Convenciones de código

### Go
- Usar `context.Context` en todas las funciones que tocan IO
- Errores: siempre wrapear con `fmt.Errorf("capa: %w", err)`
- Handlers HTTP: separar en handler → service → repository
- Nombres de paquetes en minúscula, singular: `lot`, `qr`, `scan`
- Tests unitarios en `_test.go` al lado del archivo, no en carpeta separada
- Variables de entorno en `pkg/config/config.go` con struct tipada

### Base de datos
- Migrations con nombre: `001_initial_schema.sql`, `002_add_ai_content.sql`
- Nunca usar ORM — queries SQL explícitas con `pgx`
- Siempre usar UUIDs como PK, nunca integers secuenciales
- Soft delete con `deleted_at TIMESTAMPTZ NULL` en tablas principales

### API
- Respuestas siempre en JSON con estructura `{ data: ..., error: null }`
- Errores con código semántico: `{ data: null, error: { code: "LOT_NOT_FOUND", message: "..." } }`
- Paginación con `limit` y `cursor` (cursor-based, no offset)
- Versioning en la URL: `/api/v1/`

---

## Variables de entorno (.env)

```env
# Base de datos
DATABASE_URL=postgres://cepa:password@localhost:5432/cepa_dev

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=dev_secret_change_in_production
JWT_EXPIRY_HOURS=24

# S3 / MinIO
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=cepa-dev
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin

# AI Sidecar
AI_SIDECAR_URL=localhost:50051   # gRPC

# OpenAI (para el sidecar Python)
OPENAI_API_KEY=sk-...

# QR base URL
QR_BASE_URL=http://localhost:3000/q
```

---

## Flujo principal del negocio

1. La bodega se registra y configura su perfil (nombre, logo, color)
2. Crea sus viñedos con ubicación y características
3. Para cada cosecha crea un **Lote** con todos los datos de producción
4. Al publicar el lote, el sistema genera un QR dinámico único
5. La bodega descarga el QR y lo incluye en sus etiquetas
6. Cuando un consumidor escanea el QR:
   - Se registra el evento de escaneo (país, dispositivo, fecha)
   - Se sirve la PWA con la historia del vino
   - El sidecar Python genera el storytelling en el idioma del dispositivo
   - El consumidor puede descargar el certificado PDF
7. La bodega accede a su dashboard de analytics para ver el desempeño

---

## Diferencial del producto

Cepa no es una herramienta de compliance regulatorio.
Es una **experiencia de marca premium** que convierte cada botella en una historia:
- El consumidor que paga $80+ por un vino boutique descubre quién lo hizo, cuándo,
  cómo y por qué — en lenguaje simple y emotivo, generado por IA a partir de datos reales.
- La bodega por primera vez sabe **dónde llega su vino** y qué genera más engagement.
- El certificado descargable captura el segmento coleccionista y el mercado de regalos premium.

---

## Estado actual del proyecto

- [ ] Setup inicial del repositorio
- [ ] Docker Compose con PostgreSQL + Redis + MinIO
- [ ] Estructura base del servidor Go
- [ ] Migrations de base de datos
- [ ] Auth (registro bodega + JWT)
- [ ] CRUD de viñedos y lotes
- [ ] Generación de QR
- [ ] Endpoint público de experiencia del consumidor
- [ ] Sidecar Python con storytelling LLM
- [ ] Analytics de escaneos
- [ ] Generación de certificado PDF
- [ ] Dashboard React para la bodega
- [ ] PWA Next.js para el consumidor
