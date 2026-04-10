package auth

import (
	"time"

	"github.com/google/uuid"
)

// Winery representa una bodega en el sistema.
type Winery struct {
	ID           uuid.UUID  `json:"id"`
	Name         string     `json:"name"`
	Slug         string     `json:"slug"`
	Email        string     `json:"email"`
	PasswordHash string     `json:"-"`
	LogoURL      *string    `json:"logo_url,omitempty"`
	PrimaryColor *string    `json:"primary_color,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	DeletedAt    *time.Time `json:"-"`
}

// RegisterRequest payload para crear una bodega nueva.
type RegisterRequest struct {
	Name     string `json:"name"`
	Slug     string `json:"slug"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginRequest payload para autenticar.
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// RefreshRequest payload para renovar el token.
type RefreshRequest struct {
	Token string `json:"token"`
}

// TokenResponse respuesta con el JWT.
type TokenResponse struct {
	Token string `json:"token"`
}

// WineryResponse datos públicos de una bodega (sin password).
type WineryResponse struct {
	ID           uuid.UUID  `json:"id"`
	Name         string     `json:"name"`
	Slug         string     `json:"slug"`
	Email        string     `json:"email"`
	LogoURL      *string    `json:"logo_url,omitempty"`
	PrimaryColor *string    `json:"primary_color,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
}

func toWineryResponse(w *Winery) WineryResponse {
	return WineryResponse{
		ID:           w.ID,
		Name:         w.Name,
		Slug:         w.Slug,
		Email:        w.Email,
		LogoURL:      w.LogoURL,
		PrimaryColor: w.PrimaryColor,
		CreatedAt:    w.CreatedAt,
	}
}
