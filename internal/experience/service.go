package experience

import (
	"context"
	"errors"
	"fmt"
)

var ErrNotFound = errors.New("lote no encontrado")

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetByShortCode(ctx context.Context, shortCode, userAgent string) (*PublicLot, error) {
	lot, err := s.repo.FindByShortCode(ctx, shortCode)
	if err != nil {
		return nil, fmt.Errorf("experience.service: %w", err)
	}
	if lot == nil {
		return nil, ErrNotFound
	}

	// Registrar el escaneo en segundo plano para no bloquear la respuesta.
	go func() {
		ev := NewScanEvent(lot, userAgent)
		_ = s.repo.InsertScanEvent(context.Background(), ev)
	}()

	return lot, nil
}
