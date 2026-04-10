package auth

import (
	"context"
	"fmt"

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

// Create inserta una bodega nueva en la base de datos.
func (r *Repository) Create(ctx context.Context, w *Winery) error {
	query := `
		INSERT INTO wineries (id, name, slug, email, password_hash, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.pool.Exec(ctx, query,
		w.ID, w.Name, w.Slug, w.Email, w.PasswordHash, w.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("auth.repository: crear bodega: %w", err)
	}
	return nil
}

// FindByEmail busca una bodega por email (solo activas).
func (r *Repository) FindByEmail(ctx context.Context, email string) (*Winery, error) {
	query := `
		SELECT id, name, slug, email, password_hash, logo_url, primary_color, created_at
		FROM wineries
		WHERE email = $1 AND deleted_at IS NULL
	`
	row := r.pool.QueryRow(ctx, query, email)
	return scanWinery(row)
}

// FindByID busca una bodega por ID.
func (r *Repository) FindByID(ctx context.Context, id uuid.UUID) (*Winery, error) {
	query := `
		SELECT id, name, slug, email, password_hash, logo_url, primary_color, created_at
		FROM wineries
		WHERE id = $1 AND deleted_at IS NULL
	`
	row := r.pool.QueryRow(ctx, query, id)
	return scanWinery(row)
}

// SlugExists verifica si un slug ya está en uso.
func (r *Repository) SlugExists(ctx context.Context, slug string) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM wineries WHERE slug = $1 AND deleted_at IS NULL)`,
		slug,
	).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("auth.repository: verificar slug: %w", err)
	}
	return exists, nil
}

// EmailExists verifica si un email ya está en uso.
func (r *Repository) EmailExists(ctx context.Context, email string) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM wineries WHERE email = $1 AND deleted_at IS NULL)`,
		email,
	).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("auth.repository: verificar email: %w", err)
	}
	return exists, nil
}

func scanWinery(row pgx.Row) (*Winery, error) {
	w := &Winery{}
	err := row.Scan(
		&w.ID, &w.Name, &w.Slug, &w.Email, &w.PasswordHash,
		&w.LogoURL, &w.PrimaryColor, &w.CreatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("auth.repository: escanear bodega: %w", err)
	}
	return w, nil
}
