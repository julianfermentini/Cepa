package experience

import (
	"errors"
	"net/http"

	"github.com/cepa/api/internal/response"
	"github.com/go-chi/chi/v5"
)

type Handler struct {
	svc          *Service
	consumerBase string // ej: http://localhost:3000/wine
}

func NewHandler(svc *Service, consumerBase string) *Handler {
	return &Handler{svc: svc, consumerBase: consumerBase}
}

// GetPublicLot godoc
// GET /api/v1/public/lots/{short_code}
func (h *Handler) GetPublicLot(w http.ResponseWriter, r *http.Request) {
	shortCode := chi.URLParam(r, "short_code")
	userAgent := r.Header.Get("User-Agent")

	lot, err := h.svc.GetByShortCode(r.Context(), shortCode, userAgent)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			response.Err(w, http.StatusNotFound, "LOT_NOT_FOUND", "vino no encontrado")
			return
		}
		response.Err(w, http.StatusInternalServerError, "INTERNAL_ERROR", "error interno")
		return
	}

	response.OK(w, http.StatusOK, lot)
}

// Redirect godoc
// GET /q/{short_code} — redirige a la landing del consumidor
func (h *Handler) Redirect(w http.ResponseWriter, r *http.Request) {
	shortCode := chi.URLParam(r, "short_code")
	http.Redirect(w, r, h.consumerBase+"/"+shortCode, http.StatusFound)
}
