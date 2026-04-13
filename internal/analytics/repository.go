package analytics

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

// Overview retorna métricas generales filtradas por bodega.
func (r *Repository) Overview(ctx context.Context, wineryID uuid.UUID) (OverviewStats, error) {
	var s OverviewStats
	err := r.pool.QueryRow(ctx, `
		SELECT
			COUNT(*)::int                                                         AS total_scans,
			COUNT(DISTINCT lot_id)::int                                           AS lots_scanned,
			COUNT(DISTINCT country_code)::int                                     AS countries,
			COUNT(*) FILTER (WHERE scanned_at > NOW() - INTERVAL '30 days')::int AS scans_last_30d
		FROM scan_events
		WHERE winery_id = $1
	`, wineryID).Scan(&s.TotalScans, &s.LotsScanned, &s.Countries, &s.ScansLast30d)
	if err != nil {
		return s, fmt.Errorf("analytics.repository: overview: %w", err)
	}
	return s, nil
}

// TopLots retorna los 5 lotes con más escaneos.
func (r *Repository) TopLots(ctx context.Context, wineryID uuid.UUID) ([]TopLot, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT l.id::text, l.name, COALESCE(l.variety, ''), COUNT(se.id)::int AS scan_count
		FROM scan_events se
		JOIN lots l ON l.id = se.lot_id
		WHERE se.winery_id = $1
		  AND l.deleted_at IS NULL
		GROUP BY l.id
		ORDER BY scan_count DESC
		LIMIT 5
	`, wineryID)
	if err != nil {
		return nil, fmt.Errorf("analytics.repository: top lots: %w", err)
	}
	defer rows.Close()

	var result []TopLot
	for rows.Next() {
		var t TopLot
		if err := rows.Scan(&t.LotID, &t.Name, &t.Variety, &t.ScanCount); err != nil {
			return nil, fmt.Errorf("analytics.repository: scan top lots: %w", err)
		}
		result = append(result, t)
	}
	return result, nil
}

// Countries retorna los 10 países con más escaneos.
func (r *Repository) Countries(ctx context.Context, wineryID uuid.UUID) ([]CountryStat, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT COALESCE(country_code, 'Desconocido'), COUNT(*)::int AS scan_count
		FROM scan_events
		WHERE winery_id = $1
		GROUP BY country_code
		ORDER BY scan_count DESC
		LIMIT 10
	`, wineryID)
	if err != nil {
		return nil, fmt.Errorf("analytics.repository: countries: %w", err)
	}
	defer rows.Close()

	var result []CountryStat
	for rows.Next() {
		var c CountryStat
		if err := rows.Scan(&c.CountryCode, &c.ScanCount); err != nil {
			return nil, fmt.Errorf("analytics.repository: scan countries: %w", err)
		}
		result = append(result, c)
	}
	return result, nil
}
