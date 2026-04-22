package lots

import (
	"time"

	"github.com/google/uuid"
)

// Lot representa un lote de producción.
type Lot struct {
	ID               uuid.UUID  `json:"id"`
	WineryID         uuid.UUID  `json:"winery_id"`
	VineyardID       *uuid.UUID `json:"vineyard_id,omitempty"`
	Name             string     `json:"name"`
	Variety          *string    `json:"variety,omitempty"`
	VintageYear      *int       `json:"vintage_year,omitempty"`
	HarvestDate      *time.Time `json:"harvest_date,omitempty"`
	HarvestKg        *float64   `json:"harvest_kg,omitempty"`
	BrixAtHarvest    *float64   `json:"brix_at_harvest,omitempty"`
	PHAtHarvest      *float64   `json:"ph_at_harvest,omitempty"`
	FermentationDays *int       `json:"fermentation_days,omitempty"`
	BarrelType       *string    `json:"barrel_type,omitempty"`
	BarrelMonths     *int       `json:"barrel_months,omitempty"`
	WinemakerName    *string    `json:"winemaker_name,omitempty"`
	WinemakerNote    *string    `json:"winemaker_note,omitempty"`
	BottleCount      *int       `json:"bottle_count,omitempty"`
	BottledAt        *time.Time `json:"bottled_at,omitempty"`
	LotCode          *string    `json:"lot_code,omitempty"`
	ImageURL         *string    `json:"image_url,omitempty"`
	Status           string     `json:"status"`
	Hash             *string    `json:"hash,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
}

// CreateLotRequest payload para crear un lote.
type CreateLotRequest struct {
	VineyardID       *uuid.UUID `json:"vineyard_id,omitempty"`
	Name             string     `json:"name"`
	Variety          *string    `json:"variety,omitempty"`
	VintageYear      *int       `json:"vintage_year,omitempty"`
	HarvestDate      *time.Time `json:"harvest_date,omitempty"`
	HarvestKg        *float64   `json:"harvest_kg,omitempty"`
	BrixAtHarvest    *float64   `json:"brix_at_harvest,omitempty"`
	PHAtHarvest      *float64   `json:"ph_at_harvest,omitempty"`
	FermentationDays *int       `json:"fermentation_days,omitempty"`
	BarrelType       *string    `json:"barrel_type,omitempty"`
	BarrelMonths     *int       `json:"barrel_months,omitempty"`
	WinemakerName    *string    `json:"winemaker_name,omitempty"`
	WinemakerNote    *string    `json:"winemaker_note,omitempty"`
	BottleCount      *int       `json:"bottle_count,omitempty"`
	BottledAt        *time.Time `json:"bottled_at,omitempty"`
	LotCode          *string    `json:"lot_code,omitempty"`
	ImageURL         *string    `json:"image_url,omitempty"`
}

// UpdateLotRequest payload para actualizar un lote (todos los campos opcionales).
type UpdateLotRequest struct {
	Name             *string    `json:"name,omitempty"`
	Variety          *string    `json:"variety,omitempty"`
	VintageYear      *int       `json:"vintage_year,omitempty"`
	HarvestDate      *time.Time `json:"harvest_date,omitempty"`
	HarvestKg        *float64   `json:"harvest_kg,omitempty"`
	BrixAtHarvest    *float64   `json:"brix_at_harvest,omitempty"`
	PHAtHarvest      *float64   `json:"ph_at_harvest,omitempty"`
	FermentationDays *int       `json:"fermentation_days,omitempty"`
	BarrelType       *string    `json:"barrel_type,omitempty"`
	BarrelMonths     *int       `json:"barrel_months,omitempty"`
	WinemakerName    *string    `json:"winemaker_name,omitempty"`
	WinemakerNote    *string    `json:"winemaker_note,omitempty"`
	BottleCount      *int       `json:"bottle_count,omitempty"`
	BottledAt        *time.Time `json:"bottled_at,omitempty"`
	LotCode          *string    `json:"lot_code,omitempty"`
	ImageURL         *string    `json:"image_url,omitempty"`
	Status           *string    `json:"status,omitempty"`
}

// ListParams parámetros de paginación y filtros para listar lotes.
type ListParams struct {
	Limit  int
	Cursor *uuid.UUID
	Status string
}

// QRCode representa un código QR vinculado a un lote.
type QRCode struct {
	ID        uuid.UUID
	LotID     uuid.UUID
	ShortCode string
	TargetURL string
	CreatedAt time.Time
}

// PublishResult resultado de publicar un lote.
type PublishResult struct {
	ShortCode   string `json:"short_code"`
	ConsumerURL string `json:"consumer_url"`
	LotID       string `json:"lot_id"`
}
