package cache

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
)

// New crea y verifica un cliente Redis.
func New(ctx context.Context, redisURL string) (*redis.Client, error) {
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, fmt.Errorf("cache: parsear URL: %w", err)
	}

	client := redis.NewClient(opts)

	if err := client.Ping(ctx).Err(); err != nil {
		_ = client.Close()
		return nil, fmt.Errorf("cache: ping falló: %w", err)
	}

	return client, nil
}
