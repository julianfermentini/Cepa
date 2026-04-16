package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/cepa/api/internal/analytics"
	"github.com/cepa/api/internal/auth"
	"github.com/cepa/api/internal/experience"
	"github.com/cepa/api/internal/lots"
	"github.com/cepa/api/internal/response"
	"github.com/cepa/api/pkg/cache"
	"github.com/cepa/api/pkg/config"
	"github.com/cepa/api/pkg/db"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	cfg, err := config.Load()
	if err != nil {
		slog.Error("cargar configuración", "error", err)
		os.Exit(1)
	}

	ctx := context.Background()

	pool, err := db.New(ctx, cfg.DatabaseURL)
	if err != nil {
		slog.Error("conectar a PostgreSQL", "error", err)
		os.Exit(1)
	}
	defer pool.Close()
	slog.Info("PostgreSQL conectado")

	if cfg.RedisURL != "" {
		redisClient, err := cache.New(ctx, cfg.RedisURL)
		if err != nil {
			slog.Warn("Redis no disponible, continuando sin cache", "error", err)
		} else {
			defer redisClient.Close()
			slog.Info("Redis conectado")
		}
	} else {
		slog.Info("Redis no configurado, continuando sin cache")
	}

	r := chi.NewRouter()

	// Middleware global
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(corsMiddleware)

	// Health check
	r.Get("/health", healthHandler)

	// Auth
	authRepo := auth.NewRepository(pool)
	authService := auth.NewService(authRepo, cfg)
	authHandler := auth.NewHandler(authService)

	r.Route("/api/v1/auth", func(r chi.Router) {
		r.Post("/register", authHandler.Register)
		r.Post("/login", authHandler.Login)
		r.Post("/refresh", authHandler.Refresh)
	})

	// Lots (requieren auth)
	authMiddleware := auth.NewMiddleware(cfg)
	lotsRepo := lots.NewRepository(pool)
	lotsService := lots.NewService(lotsRepo)
	lotsHandler := lots.NewHandler(lotsService, cfg)

	r.Route("/api/v1/lots", func(r chi.Router) {
		r.Use(authMiddleware.RequireAuth)
		r.Get("/", lotsHandler.List)
		r.Post("/", lotsHandler.Create)
		r.Get("/{id}", lotsHandler.Get)
		r.Put("/{id}", lotsHandler.Update)
		r.Delete("/{id}", lotsHandler.Delete)
		r.Post("/{id}/publish", lotsHandler.Publish)
	})

	// Experience — endpoints públicos del consumidor
	expRepo := experience.NewRepository(pool)
	expService := experience.NewService(expRepo)
	// consumerBase: base URL de la landing del consumidor
	consumerBase := cfg.QRBaseURL // ej: http://localhost:3000/wine
	expHandler := experience.NewHandler(expService, consumerBase)

	r.Get("/q/{short_code}", expHandler.Redirect)
	r.Route("/api/v1/public", func(r chi.Router) {
		r.Get("/lots/{short_code}", expHandler.GetPublicLot)
	})

	// Analytics (requieren auth)
	analyticsRepo := analytics.NewRepository(pool)
	analyticsService := analytics.NewService(analyticsRepo)
	analyticsHandler := analytics.NewHandler(analyticsService)

	r.Route("/api/v1/analytics", func(r chi.Router) {
		r.Use(authMiddleware.RequireAuth)
		r.Get("/overview", analyticsHandler.GetOverview)
		r.Get("/lots/top", analyticsHandler.GetTopLots)
		r.Get("/countries", analyticsHandler.GetCountries)
	})

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Port),
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	serverErr := make(chan error, 1)
	go func() {
		slog.Info("servidor iniciado", "port", cfg.Port)
		serverErr <- srv.ListenAndServe()
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	select {
	case err := <-serverErr:
		slog.Error("error del servidor", "error", err)
	case sig := <-quit:
		slog.Info("señal recibida, apagando...", "signal", sig)
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := srv.Shutdown(shutdownCtx); err != nil {
			slog.Error("error en shutdown", "error", err)
		}
	}

	slog.Info("servidor detenido")
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	response.OK(w, http.StatusOK, map[string]string{"status": "ok"})
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-Request-ID")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
