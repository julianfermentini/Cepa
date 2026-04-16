package auth

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/cepa/api/internal/response"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

// Register godoc
// POST /api/v1/auth/register
func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Err(w, http.StatusBadRequest, "INVALID_BODY", "cuerpo de solicitud inválido")
		return
	}

	token, winery, err := h.svc.Register(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, ErrEmailTaken):
			response.Err(w, http.StatusConflict, "EMAIL_TAKEN", "el email ya está registrado")
		case errors.Is(err, ErrSlugTaken):
			response.Err(w, http.StatusConflict, "SLUG_TAKEN", "el slug ya está en uso")
		default:
			slog.Error("auth: register failed", "error", err)
			response.Err(w, http.StatusInternalServerError, "INTERNAL_ERROR", "error interno del servidor")
		}
		return
	}

	response.OK(w, http.StatusCreated, map[string]any{
		"token":  token.Token,
		"winery": winery,
	})
}

// Login godoc
// POST /api/v1/auth/login
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Err(w, http.StatusBadRequest, "INVALID_BODY", "cuerpo de solicitud inválido")
		return
	}

	token, err := h.svc.Login(r.Context(), req)
	if err != nil {
		if errors.Is(err, ErrInvalidCreds) {
			response.Err(w, http.StatusUnauthorized, "INVALID_CREDENTIALS", "email o contraseña incorrectos")
			return
		}
		slog.Error("auth: login failed", "error", err)
		response.Err(w, http.StatusInternalServerError, "INTERNAL_ERROR", "error interno del servidor")
		return
	}

	response.OK(w, http.StatusOK, token)
}

// Refresh godoc
// POST /api/v1/auth/refresh
func (h *Handler) Refresh(w http.ResponseWriter, r *http.Request) {
	var req RefreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Err(w, http.StatusBadRequest, "INVALID_BODY", "cuerpo de solicitud inválido")
		return
	}

	token, err := h.svc.Refresh(r.Context(), req)
	if err != nil {
		if errors.Is(err, ErrInvalidToken) {
			response.Err(w, http.StatusUnauthorized, "INVALID_TOKEN", "token inválido o expirado")
			return
		}
		slog.Error("auth: refresh failed", "error", err)
		response.Err(w, http.StatusInternalServerError, "INTERNAL_ERROR", "error interno del servidor")
		return
	}

	response.OK(w, http.StatusOK, token)
}
