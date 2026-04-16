package experience

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

// FindByShortCode busca un lote publicado por el short_code del QR.
func (r *Repository) FindByShortCode(ctx context.Context, shortCode string) (*PublicLot, error) {
	query := `
		SELECT
			l.id, l.winery_id, l.name, l.variety, l.vintage_year, l.lot_code,
			l.winemaker_name, l.winemaker_note, l.bottle_count,
			l.barrel_type, l.barrel_months, l.fermentation_days,
			l.harvest_date, l.harvest_kg, l.brix_at_harvest, l.ph_at_harvest, l.bottled_at,
			l.created_at,
			qr.id, qr.short_code,
			w.name, w.slug, w.logo_url, w.primary_color,
			v.name, v.location, v.altitude_m, v.soil_type,
			sp.red_fruit, sp.spices, sp.wood, sp.tannins,
			sp.acidity, sp.body,
			sp.service_temp_min, sp.service_temp_max,
			sp.decant_minutes, sp.glass_type
		FROM qr_codes qr
		JOIN lots l ON qr.lot_id = l.id
		JOIN wineries w ON l.winery_id = w.id
		LEFT JOIN vineyards v ON l.vineyard_id = v.id AND v.deleted_at IS NULL
		LEFT JOIN lot_sensory_profiles sp ON l.id = sp.lot_id
		WHERE qr.short_code = $1
		  AND l.status = 'active'
		  AND l.deleted_at IS NULL
		  AND w.deleted_at IS NULL
	`

	row := r.pool.QueryRow(ctx, query, shortCode)

	lot := &PublicLot{}
	var sp SensoryProfile
	var hasSensory bool
	var vName *string
	var vLocation, vSoilType *string
	var vAltitude *int

	err := row.Scan(
		&lot.ID, &lot.WineryID, &lot.Name, &lot.Variety, &lot.VintageYear, &lot.LotCode,
		&lot.WinemakerName, &lot.WinemakerNote, &lot.BottleCount,
		&lot.BarrelType, &lot.BarrelMonths, &lot.FermentationDays,
		&lot.HarvestDate, &lot.HarvestKg, &lot.BrixAtHarvest, &lot.PhAtHarvest, &lot.BottledAt,
		&lot.CreatedAt,
		&lot.QRCodeID, &lot.ShortCode,
		&lot.Winery.Name, &lot.Winery.Slug, &lot.Winery.LogoURL, &lot.Winery.PrimaryColor,
		&vName, &vLocation, &vAltitude, &vSoilType,
		&sp.RedFruit, &sp.Spices, &sp.Wood, &sp.Tannins,
		&sp.Acidity, &sp.Body,
		&sp.TempMin, &sp.TempMax,
		&sp.DecantMin, &sp.GlassType,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("experience.repository: buscar lote: %w", err)
	}

	if vName != nil {
		lot.Vineyard = &VineyardPublic{
			Name:      *vName,
			Location:  vLocation,
			AltitudeM: vAltitude,
			SoilType:  vSoilType,
		}
	}

	if sp.RedFruit != nil || sp.Body != nil || sp.Tannins != nil {
		hasSensory = true
	}
	if hasSensory {
		lot.SensoryProfile = &sp
	}

	return lot, nil
}

// InsertScanEvent registra un escaneo del QR en scan_events.
func (r *Repository) InsertScanEvent(ctx context.Context, ev ScanEvent) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO scan_events (id, qr_code_id, lot_id, winery_id, scanned_at, device_type)
		VALUES ($1, $2, $3, $4, NOW(), $5)
	`, ev.ID, ev.QRCodeID, ev.LotID, ev.WineryID, ev.DeviceType)
	if err != nil {
		return fmt.Errorf("experience.repository: insertar scan event: %w", err)
	}
	return nil
}

// detectDevice clasifica el User-Agent en mobile | tablet | desktop.
func detectDevice(ua string) string {
	ua = strings.ToLower(ua)
	if strings.Contains(ua, "mobile") || strings.Contains(ua, "android") || strings.Contains(ua, "iphone") {
		return "mobile"
	}
	if strings.Contains(ua, "tablet") || strings.Contains(ua, "ipad") {
		return "tablet"
	}
	return "desktop"
}

// DetectDevice expone la función para uso en el service.
func DetectDevice(ua string) string { return detectDevice(ua) }

// NewScanEvent construye un ScanEvent listo para insertar.
func NewScanEvent(lot *PublicLot, userAgent string) ScanEvent {
	return ScanEvent{
		ID:         uuid.New(),
		QRCodeID:   lot.QRCodeID,
		LotID:      lot.ID,
		WineryID:   lot.WineryID,
		DeviceType: detectDevice(userAgent),
	}
}
