-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- wineries: una fila por bodega cliente
-- ============================================================
CREATE TABLE IF NOT EXISTS wineries (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT        NOT NULL,
    slug            TEXT        UNIQUE NOT NULL,
    email           TEXT        UNIQUE NOT NULL,
    password_hash   TEXT        NOT NULL,
    logo_url        TEXT,
    primary_color   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_wineries_slug ON wineries (slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_wineries_email ON wineries (email) WHERE deleted_at IS NULL;

-- ============================================================
-- vineyards: viñedos de cada bodega
-- ============================================================
CREATE TABLE IF NOT EXISTS vineyards (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    winery_id   UUID        NOT NULL REFERENCES wineries(id),
    name        TEXT        NOT NULL,
    location    TEXT,
    altitude_m  INT,
    soil_type   TEXT,
    lat         DECIMAL(10, 7),
    lng         DECIMAL(10, 7),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_vineyards_winery_id ON vineyards (winery_id) WHERE deleted_at IS NULL;

-- ============================================================
-- lots: el corazón del sistema, cada lote de producción
-- ============================================================
CREATE TABLE IF NOT EXISTS lots (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    winery_id           UUID        NOT NULL REFERENCES wineries(id),
    vineyard_id         UUID        REFERENCES vineyards(id),
    name                TEXT        NOT NULL,
    variety             TEXT,
    vintage_year        INT,
    harvest_date        DATE,
    harvest_kg          DECIMAL(12, 2),
    brix_at_harvest     DECIMAL(5, 2),
    ph_at_harvest       DECIMAL(4, 2),
    fermentation_days   INT,
    barrel_type         TEXT,
    barrel_months       INT,
    winemaker_name      TEXT,
    winemaker_note      TEXT,
    bottle_count        INT,
    bottled_at          DATE,
    lot_code            TEXT        UNIQUE,
    status              TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    hash                TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_lots_winery_id ON lots (winery_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lots_status ON lots (winery_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lots_vintage_year ON lots (winery_id, vintage_year) WHERE deleted_at IS NULL;

-- ============================================================
-- lot_sensory_profiles: perfil sensorial por lote
-- ============================================================
CREATE TABLE IF NOT EXISTS lot_sensory_profiles (
    lot_id              UUID        PRIMARY KEY REFERENCES lots(id),
    red_fruit           INT CHECK (red_fruit BETWEEN 0 AND 100),
    spices              INT CHECK (spices BETWEEN 0 AND 100),
    wood                INT CHECK (wood BETWEEN 0 AND 100),
    tannins             INT CHECK (tannins BETWEEN 0 AND 100),
    acidity             INT CHECK (acidity BETWEEN 0 AND 100),
    body                INT CHECK (body BETWEEN 0 AND 100),
    service_temp_min    INT,
    service_temp_max    INT,
    decant_minutes      INT,
    glass_type          TEXT
);

-- ============================================================
-- qr_codes: QR único por lote (dinámico)
-- ============================================================
CREATE TABLE IF NOT EXISTS qr_codes (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id      UUID        NOT NULL REFERENCES lots(id),
    short_code  TEXT        UNIQUE NOT NULL,
    target_url  TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qr_codes_short_code ON qr_codes (short_code);
CREATE INDEX IF NOT EXISTS idx_qr_codes_lot_id ON qr_codes (lot_id);

-- ============================================================
-- scan_events: cada escaneo del QR registrado
-- ============================================================
CREATE TABLE IF NOT EXISTS scan_events (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code_id      UUID        NOT NULL REFERENCES qr_codes(id),
    lot_id          UUID        NOT NULL REFERENCES lots(id),
    winery_id       UUID        NOT NULL REFERENCES wineries(id),
    scanned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    country_code    TEXT,
    city            TEXT,
    device_type     TEXT        CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'unknown')),
    downloaded_pdf  BOOLEAN     NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_scan_events_lot_id ON scan_events (lot_id);
CREATE INDEX IF NOT EXISTS idx_scan_events_winery_id ON scan_events (winery_id);
CREATE INDEX IF NOT EXISTS idx_scan_events_scanned_at ON scan_events (scanned_at);
CREATE INDEX IF NOT EXISTS idx_scan_events_winery_scanned ON scan_events (winery_id, scanned_at);

-- ============================================================
-- ai_content: contenido generado por IA (cacheado por lote e idioma)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_content (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id          UUID        NOT NULL REFERENCES lots(id),
    language        TEXT        NOT NULL CHECK (language IN ('es', 'en', 'pt')),
    story           TEXT,
    pairings        JSONB,
    generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (lot_id, language)
);

CREATE INDEX IF NOT EXISTS idx_ai_content_lot_id ON ai_content (lot_id);
