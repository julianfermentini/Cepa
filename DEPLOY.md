# Deploy Cepa — Vercel + Supabase + Railway

Arquitectura productiva:

```
┌──────────────────────┐        ┌──────────────────────┐
│  Frontend (Vercel)   │ ─────► │   Backend Go (Railway│
│  React + Vite        │  HTTPS │   o Fly.io / Render) │
│  /wine/:short_code   │        │   API + QR resolver  │
└──────────────────────┘        └───────────┬──────────┘
                                            │
                                            ▼
                                ┌──────────────────────┐
                                │   Supabase Postgres  │
                                │   (sin IPv6-only —   │
                                │   usar session       │
                                │   pooler 6543)       │
                                └──────────────────────┘
```

## 1 · Supabase (Postgres)

1. Crear proyecto en [supabase.com](https://supabase.com).
2. Copiar connection string del **Session pooler** (puerto 6543, región con IPv4).
3. Aplicar migraciones:
   ```bash
   psql "$DATABASE_URL" -f migrations/001_initial_schema.sql
   psql "$DATABASE_URL" -f migrations/002_seed_demo.sql   # opcional
   ```

## 2 · Backend Go (Railway / Fly.io)

### Railway (recomendado, más simple)

1. `railway login && railway init`.
2. Dashboard → **New Service → Deploy from Dockerfile**.
3. Variables:
   - `DATABASE_URL` → pooler Supabase
   - `JWT_SECRET` → `openssl rand -hex 32`
   - `QR_BASE_URL` → `https://<tu-proyecto>.vercel.app/wine`
   - `REDIS_URL` → Redis de Railway (add-on)
   - `PORT=8080`
4. Build target: `production`.

## 3 · Frontend (Vercel)

1. `cd frontend/dashboard && vercel`.
2. Env var en dashboard de Vercel:
   - `VITE_API_URL=https://<tu-backend-railway>.up.railway.app`
3. Cada PR → deploy preview automático.

## 4 · Cuenta demo para testing

Credenciales seed:
- **email:** `demo@cepa.wine`
- **password:** `cepa2024`

## 5 · Flujo de verificación

1. Login en `https://<vercel>.vercel.app/login`.
2. Crear lote, publicar → copia URL QR pública.
3. Escanear el QR desde cualquier dispositivo/red → landing `/wine/<short_code>`.
4. Verificar en Supabase: `SELECT * FROM scan_events ORDER BY scanned_at DESC LIMIT 5;`

## Notas

- **CORS** ya está abierto (`Access-Control-Allow-Origin: *`). Para producción seria, restringir al dominio Vercel en `cmd/api/main.go:corsMiddleware`.
- **IA** mockeada — el endpoint `/story` devuelve placeholder. Habilitar cuando haya `OPENAI_API_KEY`.
- **MinIO/S3**: no requerido para MVP (solo para logos/certificados PDF en el futuro).
