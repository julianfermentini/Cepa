package auth

import (
	"context"
	"net/http"
	"strings"

	"github.com/cepa/api/internal/response"
	"github.com/cepa/api/pkg/config"
	"github.com/google/uuid"
)

type contextKey string

const WineryIDKey contextKey = "winery_id"

// Middleware provee el middleware de autenticación JWT.
type Middleware struct {
	cfg *config.Config
	svc *Service
}

func NewMiddleware(cfg *config.Config) *Middleware {
	// El middleware necesita parsear el token; reutilizamos la lógica del servicio
	// creando un servicio sin repositorio (solo usa el secret de config).
	svc := &Service{cfg: cfg}
	return &Middleware{cfg: cfg, svc: svc}
}

// RequireAuth valida el JWT del header Authorization e inyecta winery_id en el contexto.
func (m *Middleware) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			response.Err(w, http.StatusUnauthorized, "UNAUTHORIZED", "token requerido")
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			response.Err(w, http.StatusUnauthorized, "UNAUTHORIZED", "formato de token inválido")
			return
		}

		claims, err := m.svc.parseToken(parts[1])
		if err != nil {
			response.Err(w, http.StatusUnauthorized, "UNAUTHORIZED", "token inválido o expirado")
			return
		}

		ctx := context.WithValue(r.Context(), WineryIDKey, claims.WineryID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// WineryIDFromContext extrae el winery_id del contexto.
// Retorna uuid.Nil si no está presente.
func WineryIDFromContext(ctx context.Context) uuid.UUID {
	id, _ := ctx.Value(WineryIDKey).(uuid.UUID)
	return id
}
