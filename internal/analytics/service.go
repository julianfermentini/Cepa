package analytics

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetOverview(ctx context.Context, wineryID uuid.UUID) (OverviewStats, error) {
	stats, err := s.repo.Overview(ctx, wineryID)
	if err != nil {
		return stats, fmt.Errorf("analytics.service: %w", err)
	}
	return stats, nil
}

func (s *Service) GetTopLots(ctx context.Context, wineryID uuid.UUID) ([]TopLot, error) {
	lots, err := s.repo.TopLots(ctx, wineryID)
	if err != nil {
		return nil, fmt.Errorf("analytics.service: %w", err)
	}
	return lots, nil
}

func (s *Service) GetCountries(ctx context.Context, wineryID uuid.UUID) ([]CountryStat, error) {
	countries, err := s.repo.Countries(ctx, wineryID)
	if err != nil {
		return nil, fmt.Errorf("analytics.service: %w", err)
	}
	return countries, nil
}
