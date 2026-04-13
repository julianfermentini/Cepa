package analytics

import (
	"net/http"

	"github.com/cepa/api/internal/auth"
	"github.com/cepa/api/internal/response"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

// GetOverview godoc
// GET /api/v1/analytics/overview
func (h *Handler) GetOverview(w http.ResponseWriter, r *http.Request) {
	wineryID := auth.WineryIDFromContext(r.Context())
	stats, err := h.svc.GetOverview(r.Context(), wineryID)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "INTERNAL_ERROR", "error interno")
		return
	}
	response.OK(w, http.StatusOK, stats)
}

// GetTopLots godoc
// GET /api/v1/analytics/lots/top
func (h *Handler) GetTopLots(w http.ResponseWriter, r *http.Request) {
	wineryID := auth.WineryIDFromContext(r.Context())
	lots, err := h.svc.GetTopLots(r.Context(), wineryID)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "INTERNAL_ERROR", "error interno")
		return
	}
	if lots == nil {
		lots = []TopLot{}
	}
	response.OK(w, http.StatusOK, lots)
}

// GetCountries godoc
// GET /api/v1/analytics/countries
func (h *Handler) GetCountries(w http.ResponseWriter, r *http.Request) {
	wineryID := auth.WineryIDFromContext(r.Context())
	countries, err := h.svc.GetCountries(r.Context(), wineryID)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "INTERNAL_ERROR", "error interno")
		return
	}
	if countries == nil {
		countries = []CountryStat{}
	}
	response.OK(w, http.StatusOK, countries)
}
