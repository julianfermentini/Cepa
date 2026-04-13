package lots

import (
	"context"
	"fmt"
	"time"

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

// Create inserta un lote nuevo.
func (r *Repository) Create(ctx context.Context, lot *Lot) error {
	query := `
		INSERT INTO lots (
			id, winery_id, vineyard_id, name, variety, vintage_year,
			harvest_date, harvest_kg, brix_at_harvest, ph_at_harvest,
			fermentation_days, barrel_type, barrel_months,
			winemaker_name, winemaker_note, bottle_count, bottled_at,
			lot_code, status, created_at
		) VALUES (
			$1, $2, $3, $4, $5, $6,
			$7, $8, $9, $10,
			$11, $12, $13,
			$14, $15, $16, $17,
			$18, $19, $20
		)
	`
	_, err := r.pool.Exec(ctx, query,
		lot.ID, lot.WineryID, lot.VineyardID, lot.Name, lot.Variety, lot.VintageYear,
		lot.HarvestDate, lot.HarvestKg, lot.BrixAtHarvest, lot.PHAtHarvest,
		lot.FermentationDays, lot.BarrelType, lot.BarrelMonths,
		lot.WinemakerName, lot.WinemakerNote, lot.BottleCount, lot.BottledAt,
		lot.LotCode, lot.Status, lot.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("lots.repository: crear lote: %w", err)
	}
	return nil
}

// FindByID busca un lote por ID, filtrando por winery_id (multi-tenancy).
func (r *Repository) FindByID(ctx context.Context, id, wineryID uuid.UUID) (*Lot, error) {
	query := `
		SELECT id, winery_id, vineyard_id, name, variety, vintage_year,
			harvest_date, harvest_kg, brix_at_harvest, ph_at_harvest,
			fermentation_days, barrel_type, barrel_months,
			winemaker_name, winemaker_note, bottle_count, bottled_at,
			lot_code, status, hash, created_at
		FROM lots
		WHERE id = $1 AND winery_id = $2 AND deleted_at IS NULL
	`
	row := r.pool.QueryRow(ctx, query, id, wineryID)
	return scanLot(row)
}

// List devuelve lotes paginados de una bodega.
func (r *Repository) List(ctx context.Context, wineryID uuid.UUID, params ListParams) ([]*Lot, error) {
	args := []any{wineryID, params.Limit}
	query := `
		SELECT id, winery_id, vineyard_id, name, variety, vintage_year,
			harvest_date, harvest_kg, brix_at_harvest, ph_at_harvest,
			fermentation_days, barrel_type, barrel_months,
			winemaker_name, winemaker_note, bottle_count, bottled_at,
			lot_code, status, hash, created_at
		FROM lots
		WHERE winery_id = $1 AND deleted_at IS NULL
	`

	if params.Status != "" {
		args = append(args, params.Status)
		query += fmt.Sprintf(" AND status = $%d", len(args))
	}

	if params.Cursor != nil {
		args = append(args, *params.Cursor)
		query += fmt.Sprintf(" AND id > $%d", len(args))
	}

	query += " ORDER BY created_at DESC LIMIT $2"

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("lots.repository: listar lotes: %w", err)
	}
	defer rows.Close()

	var result []*Lot
	for rows.Next() {
		lot, err := scanLot(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, lot)
	}
	return result, rows.Err()
}

// Update actualiza los campos de un lote (solo los no-nulos del request).
func (r *Repository) Update(ctx context.Context, id, wineryID uuid.UUID, req UpdateLotRequest) (*Lot, error) {
	// Construir query dinámico solo con los campos enviados
	setClauses := []string{}
	args := []any{}
	argIdx := 1

	if req.Name != nil {
		setClauses = append(setClauses, fmt.Sprintf("name = $%d", argIdx))
		args = append(args, *req.Name)
		argIdx++
	}
	if req.Variety != nil {
		setClauses = append(setClauses, fmt.Sprintf("variety = $%d", argIdx))
		args = append(args, *req.Variety)
		argIdx++
	}
	if req.VintageYear != nil {
		setClauses = append(setClauses, fmt.Sprintf("vintage_year = $%d", argIdx))
		args = append(args, *req.VintageYear)
		argIdx++
	}
	if req.Status != nil {
		setClauses = append(setClauses, fmt.Sprintf("status = $%d", argIdx))
		args = append(args, *req.Status)
		argIdx++
	}
	if req.WinemakerNote != nil {
		setClauses = append(setClauses, fmt.Sprintf("winemaker_note = $%d", argIdx))
		args = append(args, *req.WinemakerNote)
		argIdx++
	}
	if req.WinemakerName != nil {
		setClauses = append(setClauses, fmt.Sprintf("winemaker_name = $%d", argIdx))
		args = append(args, *req.WinemakerName)
		argIdx++
	}
	if req.BottleCount != nil {
		setClauses = append(setClauses, fmt.Sprintf("bottle_count = $%d", argIdx))
		args = append(args, *req.BottleCount)
		argIdx++
	}
	if req.LotCode != nil {
		setClauses = append(setClauses, fmt.Sprintf("lot_code = $%d", argIdx))
		args = append(args, *req.LotCode)
		argIdx++
	}
	if req.BarrelType != nil {
		setClauses = append(setClauses, fmt.Sprintf("barrel_type = $%d", argIdx))
		args = append(args, *req.BarrelType)
		argIdx++
	}
	if req.BarrelMonths != nil {
		setClauses = append(setClauses, fmt.Sprintf("barrel_months = $%d", argIdx))
		args = append(args, *req.BarrelMonths)
		argIdx++
	}
	if req.HarvestKg != nil {
		setClauses = append(setClauses, fmt.Sprintf("harvest_kg = $%d", argIdx))
		args = append(args, *req.HarvestKg)
		argIdx++
	}
	if req.FermentationDays != nil {
		setClauses = append(setClauses, fmt.Sprintf("fermentation_days = $%d", argIdx))
		args = append(args, *req.FermentationDays)
		argIdx++
	}

	if len(setClauses) == 0 {
		return r.FindByID(ctx, id, wineryID)
	}

	args = append(args, id, wineryID)
	query := fmt.Sprintf(`
		UPDATE lots SET %s
		WHERE id = $%d AND winery_id = $%d AND deleted_at IS NULL
	`, joinClauses(setClauses), argIdx, argIdx+1)

	_, err := r.pool.Exec(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("lots.repository: actualizar lote: %w", err)
	}

	return r.FindByID(ctx, id, wineryID)
}

// SoftDelete marca un lote como eliminado.
func (r *Repository) SoftDelete(ctx context.Context, id, wineryID uuid.UUID) error {
	query := `
		UPDATE lots SET deleted_at = $1
		WHERE id = $2 AND winery_id = $3 AND deleted_at IS NULL
	`
	result, err := r.pool.Exec(ctx, query, time.Now().UTC(), id, wineryID)
	if err != nil {
		return fmt.Errorf("lots.repository: eliminar lote: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func scanLot(row pgx.Row) (*Lot, error) {
	l := &Lot{}
	err := row.Scan(
		&l.ID, &l.WineryID, &l.VineyardID, &l.Name, &l.Variety, &l.VintageYear,
		&l.HarvestDate, &l.HarvestKg, &l.BrixAtHarvest, &l.PHAtHarvest,
		&l.FermentationDays, &l.BarrelType, &l.BarrelMonths,
		&l.WinemakerName, &l.WinemakerNote, &l.BottleCount, &l.BottledAt,
		&l.LotCode, &l.Status, &l.Hash, &l.CreatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("lots.repository: escanear lote: %w", err)
	}
	return l, nil
}

func joinClauses(clauses []string) string {
	result := ""
	for i, c := range clauses {
		if i > 0 {
			result += ", "
		}
		result += c
	}
	return result
}

// FindQRByLotID busca el QR code de un lote.
func (r *Repository) FindQRByLotID(ctx context.Context, lotID uuid.UUID) (*QRCode, error) {
	query := `
		SELECT id, lot_id, short_code, target_url, created_at
		FROM qr_codes WHERE lot_id = $1
	`
	row := r.pool.QueryRow(ctx, query, lotID)
	qr := &QRCode{}
	err := row.Scan(&qr.ID, &qr.LotID, &qr.ShortCode, &qr.TargetURL, &qr.CreatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("lots.repository: buscar QR: %w", err)
	}
	return qr, nil
}

// CreateQR inserta un nuevo código QR para un lote.
func (r *Repository) CreateQR(ctx context.Context, lotID uuid.UUID, shortCode, targetURL string) (*QRCode, error) {
	qr := &QRCode{
		ID:        uuid.New(),
		LotID:     lotID,
		ShortCode: shortCode,
		TargetURL: targetURL,
		CreatedAt: time.Now().UTC(),
	}
	_, err := r.pool.Exec(ctx,
		`INSERT INTO qr_codes (id, lot_id, short_code, target_url, created_at) VALUES ($1, $2, $3, $4, $5)`,
		qr.ID, qr.LotID, qr.ShortCode, qr.TargetURL, qr.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("lots.repository: crear QR: %w", err)
	}
	return qr, nil
}

// UpdateStatus actualiza el estado de un lote.
func (r *Repository) UpdateStatus(ctx context.Context, id, wineryID uuid.UUID, status string) error {
	_, err := r.pool.Exec(ctx,
		`UPDATE lots SET status = $1 WHERE id = $2 AND winery_id = $3 AND deleted_at IS NULL`,
		status, id, wineryID,
	)
	if err != nil {
		return fmt.Errorf("lots.repository: actualizar estado: %w", err)
	}
	return nil
}
