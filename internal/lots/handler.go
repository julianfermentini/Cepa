package lots

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/cepa/api/internal/auth"
	"github.com/cepa/api/internal/response"
	"github.com/cepa/api/pkg/config"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type Handler struct {
	svc *Service
	cfg *config.Config
}

func NewHandler(svc *Service, cfg *config.Config) *Handler {
	return &Handler{svc: svc, cfg: cfg}
}

// List godoc
// GET /api/v1/lots
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	wineryID := auth.WineryIDFromContext(r.Context())

	params := ListParams{Limit: 20}

	if lStr := r.URL.Query().Get("limit"); lStr != "" {
		if l, err := strconv.Atoi(lStr); err == nil {
			params.Limit = l
		}
	}

	if status := r.URL.Query().Get("status"); status != "" {
		params.Status = status
	}

	if cursorStr := r.URL.Query().Get("cursor"); cursorStr != "" {
		if id, err := uuid.Parse(cursorStr); err == nil {
			params.Cursor = &id
		}
	}

	lots, err := h.svc.List(r.Context(), wineryID, params)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "INTERNAL_ERROR", "error al listar lotes")
		return
	}

	if lots == nil {
		lots = []*Lot{}
	}

	response.OK(w, http.StatusOK, lots)
}

// Create godoc
// POST /api/v1/lots
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	wineryID := auth.WineryIDFromContext(r.Context())

	var req CreateLotRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Err(w, http.StatusBadRequest, "INVALID_BODY", "cuerpo de solicitud inválido")
		return
	}

	lot, err := h.svc.Create(r.Context(), wineryID, req)
	if err != nil {
		if errors.Is(err, ErrInvalidData) {
			response.Err(w, http.StatusBadRequest, "INVALID_DATA", err.Error())
			return
		}
		if errors.Is(err, ErrLotCodeTaken) {
			response.Err(w, http.StatusConflict, "LOT_CODE_TAKEN", "ya existe un lote con ese código")
			return
		}
		response.Err(w, http.StatusInternalServerError, "INTERNAL_ERROR", "error al crear lote")
		return
	}

	response.OK(w, http.StatusCreated, lot)
}

// Get godoc
// GET /api/v1/lots/{id}
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	wineryID := auth.WineryIDFromContext(r.Context())

	lotID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		response.Err(w, http.StatusBadRequest, "INVALID_ID", "ID de lote inválido")
		return
	}

	lot, err := h.svc.GetByID(r.Context(), lotID, wineryID)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			response.Err(w, http.StatusNotFound, "LOT_NOT_FOUND", "lote no encontrado")
			return
		}
		response.Err(w, http.StatusInternalServerError, "INTERNAL_ERROR", "error al obtener lote")
		return
	}

	response.OK(w, http.StatusOK, lot)
}

// Update godoc
// PUT /api/v1/lots/{id}
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	wineryID := auth.WineryIDFromContext(r.Context())

	lotID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		response.Err(w, http.StatusBadRequest, "INVALID_ID", "ID de lote inválido")
		return
	}

	var req UpdateLotRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Err(w, http.StatusBadRequest, "INVALID_BODY", "cuerpo de solicitud inválido")
		return
	}

	lot, err := h.svc.Update(r.Context(), lotID, wineryID, req)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			response.Err(w, http.StatusNotFound, "LOT_NOT_FOUND", "lote no encontrado")
			return
		}
		response.Err(w, http.StatusInternalServerError, "INTERNAL_ERROR", "error al actualizar lote")
		return
	}

	response.OK(w, http.StatusOK, lot)
}

// Publish godoc
// POST /api/v1/lots/{id}/publish
func (h *Handler) Publish(w http.ResponseWriter, r *http.Request) {
	wineryID := auth.WineryIDFromContext(r.Context())

	lotID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		response.Err(w, http.StatusBadRequest, "INVALID_ID", "ID de lote inválido")
		return
	}

	result, err := h.svc.Publish(r.Context(), lotID, wineryID, h.cfg.QRBaseURL)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			response.Err(w, http.StatusNotFound, "LOT_NOT_FOUND", "lote no encontrado")
			return
		}
		response.Err(w, http.StatusInternalServerError, "INTERNAL_ERROR", "error al publicar lote")
		return
	}

	response.OK(w, http.StatusOK, result)
}

// Delete godoc
// DELETE /api/v1/lots/{id}
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	wineryID := auth.WineryIDFromContext(r.Context())

	lotID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		response.Err(w, http.StatusBadRequest, "INVALID_ID", "ID de lote inválido")
		return
	}

	if err := h.svc.Delete(r.Context(), lotID, wineryID); err != nil {
		if errors.Is(err, ErrNotFound) {
			response.Err(w, http.StatusNotFound, "LOT_NOT_FOUND", "lote no encontrado")
			return
		}
		response.Err(w, http.StatusInternalServerError, "INTERNAL_ERROR", "error al eliminar lote")
		return
	}

	response.OK(w, http.StatusOK, map[string]string{"message": "lote eliminado"})
}
