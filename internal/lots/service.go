package lots

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"
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

// Publish publica un lote: cambia estado a "active" y genera (o reutiliza) su QR.
func (s *Service) Publish(ctx context.Context, id, wineryID uuid.UUID, baseURL string) (*PublishResult, error) {
	lot, err := s.repo.FindByID(ctx, id, wineryID)
	if err != nil {
		return nil, fmt.Errorf("lots.service: %w", err)
	}
	if lot == nil {
		return nil, ErrNotFound
	}

	// Reutilizar QR si ya existe
	qr, err := s.repo.FindQRByLotID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("lots.service: %w", err)
	}
	if qr == nil {
		shortCode, err := generateShortCode()
		if err != nil {
			return nil, fmt.Errorf("lots.service: generar código: %w", err)
		}
		consumerURL := baseURL + "/" + shortCode
		qr, err = s.repo.CreateQR(ctx, id, shortCode, consumerURL)
		if err != nil {
			return nil, fmt.Errorf("lots.service: %w", err)
		}
	}

	if err := s.repo.UpdateStatus(ctx, id, wineryID, "active"); err != nil {
		return nil, fmt.Errorf("lots.service: %w", err)
	}

	return &PublishResult{
		ShortCode:   qr.ShortCode,
		ConsumerURL: qr.TargetURL,
		LotID:       id.String(),
	}, nil
}

func generateShortCode() (string, error) {
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
	result := make([]byte, 7)
	for i := range result {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(chars))))
		if err != nil {
			return "", err
		}
		result[i] = chars[n.Int64()]
	}
	return string(result), nil
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
