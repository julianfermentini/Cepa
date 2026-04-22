package experience

import (
	"time"

	"github.com/google/uuid"
)

// PublicLot datos públicos de un lote para la landing del consumidor.
type PublicLot struct {
	ID               uuid.UUID        `json:"id"`
	WineryID         uuid.UUID        `json:"-"`
	Name             string           `json:"name"`
	Variety          *string          `json:"variety,omitempty"`
	VintageYear      *int             `json:"vintage_year,omitempty"`
	LotCode          *string          `json:"lot_code,omitempty"`
	WinemakerName    *string          `json:"winemaker_name,omitempty"`
	WinemakerNote    *string          `json:"winemaker_note,omitempty"`
	BottleCount      *int             `json:"bottle_count,omitempty"`
	BarrelType       *string          `json:"barrel_type,omitempty"`
	BarrelMonths     *int             `json:"barrel_months,omitempty"`
	FermentationDays *int             `json:"fermentation_days,omitempty"`
	HarvestDate      *time.Time       `json:"harvest_date,omitempty"`
	HarvestKg        *float64         `json:"harvest_kg,omitempty"`
	BrixAtHarvest    *float64         `json:"brix_at_harvest,omitempty"`
	PhAtHarvest      *float64         `json:"ph_at_harvest,omitempty"`
	BottledAt        *time.Time       `json:"bottled_at,omitempty"`
	ImageURL         *string          `json:"image_url,omitempty"`
	ShortCode        string           `json:"short_code"`
	QRCodeID         uuid.UUID        `json:"-"`
	Winery           WineryPublic     `json:"winery"`
	Vineyard         *VineyardPublic  `json:"vineyard,omitempty"`
	SensoryProfile   *SensoryProfile  `json:"sensory_profile,omitempty"`
	CreatedAt        time.Time        `json:"created_at"`
}

// VineyardPublic datos públicos del viñedo.
type VineyardPublic struct {
	Name      string  `json:"name"`
	Location  *string `json:"location,omitempty"`
	AltitudeM *int    `json:"altitude_m,omitempty"`
	SoilType  *string `json:"soil_type,omitempty"`
}

// WineryPublic datos públicos de la bodega.
type WineryPublic struct {
	Name         string  `json:"name"`
	Slug         string  `json:"slug"`
	LogoURL      *string `json:"logo_url,omitempty"`
	PrimaryColor *string `json:"primary_color,omitempty"`
}

// SensoryProfile perfil sensorial del vino.
type SensoryProfile struct {
	RedFruit  *int    `json:"red_fruit,omitempty"`
	Spices    *int    `json:"spices,omitempty"`
	Wood      *int    `json:"wood,omitempty"`
	Tannins   *int    `json:"tannins,omitempty"`
	Acidity   *int    `json:"acidity,omitempty"`
	Body      *int    `json:"body,omitempty"`
	TempMin   *int    `json:"service_temp_min,omitempty"`
	TempMax   *int    `json:"service_temp_max,omitempty"`
	DecantMin *int    `json:"decant_minutes,omitempty"`
	GlassType *string `json:"glass_type,omitempty"`
}

// ScanEvent representa un escaneo del QR registrado.
type ScanEvent struct {
	ID         uuid.UUID `json:"id"`
	QRCodeID   uuid.UUID `json:"qr_code_id"`
	LotID      uuid.UUID `json:"lot_id"`
	WineryID   uuid.UUID `json:"winery_id"`
	DeviceType string    `json:"device_type"`
}
