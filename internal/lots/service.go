package lots

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
)

var (
	ErrNotFound    = errors.New("lote no encontrado")
	ErrInvalidData = errors.New("datos inválidos")
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

// Create crea un lote nuevo para la bodega autenticada.
func (s *Service) Create(ctx context.Context, wineryID uuid.UUID, req CreateLotRequest) (*Lot, error) {
	if req.Name == "" {
		return nil, fmt.Errorf("lots.service: %w: nombre requerido", ErrInvalidData)
	}

	lot := &Lot{
		ID:               uuid.New(),
		WineryID:         wineryID,
		VineyardID:       req.VineyardID,
		Name:             req.Name,
		Variety:          req.Variety,
		VintageYear:      req.VintageYear,
		HarvestDate:      req.HarvestDate,
		HarvestKg:        req.HarvestKg,
		BrixAtHarvest:    req.BrixAtHarvest,
		PHAtHarvest:      req.PHAtHarvest,
		FermentationDays: req.FermentationDays,
		BarrelType:       req.BarrelType,
		BarrelMonths:     req.BarrelMonths,
		WinemakerName:    req.WinemakerName,
		WinemakerNote:    req.WinemakerNote,
		BottleCount:      req.BottleCount,
		BottledAt:        req.BottledAt,
		LotCode:          req.LotCode,
		Status:           "draft",
		CreatedAt:        time.Now().UTC(),
	}

	if err := s.repo.Create(ctx, lot); err != nil {
		return nil, fmt.Errorf("lots.service: %w", err)
	}

	return lot, nil
}

// GetByID devuelve un lote verificando que pertenezca a la bodega.
func (s *Service) GetByID(ctx context.Context, id, wineryID uuid.UUID) (*Lot, error) {
	lot, err := s.repo.FindByID(ctx, id, wineryID)
	if err != nil {
		return nil, fmt.Errorf("lots.service: %w", err)
	}
	if lot == nil {
		return nil, ErrNotFound
	}
	return lot, nil
}

// List devuelve lotes paginados de la bodega.
func (s *Service) List(ctx context.Context, wineryID uuid.UUID, params ListParams) ([]*Lot, error) {
	if params.Limit <= 0 || params.Limit > 100 {
		params.Limit = 20
	}

	lots, err := s.repo.List(ctx, wineryID, params)
	if err != nil {
		return nil, fmt.Errorf("lots.service: %w", err)
	}
	return lots, nil
}

// Update actualiza un lote verificando que pertenezca a la bodega.
func (s *Service) Update(ctx context.Context, id, wineryID uuid.UUID, req UpdateLotRequest) (*Lot, error) {
	// Verificar que el lote existe y pertenece a la bodega
	existing, err := s.repo.FindByID(ctx, id, wineryID)
	if err != nil {
		return nil, fmt.Errorf("lots.service: %w", err)
	}
	if existing == nil {
		return nil, ErrNotFound
	}

	lot, err := s.repo.Update(ctx, id, wineryID, req)
	if err != nil {
		return nil, fmt.Errorf("lots.service: %w", err)
	}
	return lot, nil
}

// Delete hace soft delete de un lote verificando que pertenezca a la bodega.
func (s *Service) Delete(ctx context.Context, id, wineryID uuid.UUID) error {
	if err := s.repo.SoftDelete(ctx, id, wineryID); err != nil {
		if errors.Is(err, ErrNotFound) {
			return ErrNotFound
		}
		return fmt.Errorf("lots.service: %w", err)
	}
	return nil
}
