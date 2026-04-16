package db

import (
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

func New(ctx context.Context, databaseURL string) (*pgxpool.Pool, error) {
	if strings.Contains(databaseURL, "supabase.com") || strings.Contains(databaseURL, "pooler") {
		sep := "?"
		if strings.Contains(databaseURL, "?") {
			sep = "&"
		}
		databaseURL += sep + "default_query_exec_mode=simple_protocol"
	}

	cfg, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, fmt.Errorf("db: parsear config: %w", err)
	}

	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("db: crear pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("db: ping falló: %w", err)
	}

	return pool, nil
}
