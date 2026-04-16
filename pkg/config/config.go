package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL    string
	RedisURL       string
	JWTSecret      string
	JWTExpiryHours int
	S3Endpoint     string
	S3Bucket       string
	S3AccessKey    string
	S3SecretKey    string
	AISidecarURL   string
	QRBaseURL      string
	Port           string
	Env            string
}

func Load() (*Config, error) {
	// Cargar .env si existe (ignorar error si no hay archivo)
	_ = godotenv.Load()

	cfg := &Config{
		DatabaseURL:  requireEnv("DATABASE_URL"),
		RedisURL:     getEnv("REDIS_URL", ""),
		JWTSecret:    requireEnv("JWT_SECRET"),
		S3Endpoint:   getEnv("S3_ENDPOINT", "http://localhost:9000"),
		S3Bucket:     getEnv("S3_BUCKET", "cepa-dev"),
		S3AccessKey:  getEnv("S3_ACCESS_KEY", "minioadmin"),
		S3SecretKey:  getEnv("S3_SECRET_KEY", "minioadmin"),
		AISidecarURL: getEnv("AI_SIDECAR_URL", "localhost:50051"),
		QRBaseURL:    getEnv("QR_BASE_URL", "http://localhost:3000/q"),
		Port:         getEnv("PORT", "8080"),
		Env:          getEnv("ENV", "development"),
	}

	hours, err := strconv.Atoi(getEnv("JWT_EXPIRY_HOURS", "24"))
	if err != nil {
		return nil, fmt.Errorf("config: JWT_EXPIRY_HOURS inválido: %w", err)
	}
	cfg.JWTExpiryHours = hours

	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("config: DATABASE_URL es requerida")
	}
	if cfg.JWTSecret == "" {
		return nil, fmt.Errorf("config: JWT_SECRET es requerida")
	}

	return cfg, nil
}

func (c *Config) IsDevelopment() bool {
	return c.Env == "development"
}

func requireEnv(key string) string {
	return os.Getenv(key)
}

func getEnv(key, defaultValue string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultValue
}
