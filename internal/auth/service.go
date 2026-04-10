package auth

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/cepa/api/pkg/config"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrEmailTaken    = errors.New("el email ya está en uso")
	ErrSlugTaken     = errors.New("el slug ya está en uso")
	ErrInvalidCreds  = errors.New("credenciales inválidas")
	ErrInvalidToken  = errors.New("token inválido")
)

// Claims es el payload del JWT.
type Claims struct {
	WineryID uuid.UUID `json:"winery_id"`
	jwt.RegisteredClaims
}

type Service struct {
	repo *Repository
	cfg  *config.Config
}

func NewService(repo *Repository, cfg *config.Config) *Service {
	return &Service{repo: repo, cfg: cfg}
}

// Register crea una bodega nueva y devuelve el JWT.
func (s *Service) Register(ctx context.Context, req RegisterRequest) (*TokenResponse, *WineryResponse, error) {
	if req.Name == "" || req.Email == "" || req.Password == "" || req.Slug == "" {
		return nil, nil, fmt.Errorf("auth.service: %w", errors.New("todos los campos son requeridos"))
	}

	emailTaken, err := s.repo.EmailExists(ctx, req.Email)
	if err != nil {
		return nil, nil, fmt.Errorf("auth.service: %w", err)
	}
	if emailTaken {
		return nil, nil, ErrEmailTaken
	}

	slugTaken, err := s.repo.SlugExists(ctx, req.Slug)
	if err != nil {
		return nil, nil, fmt.Errorf("auth.service: %w", err)
	}
	if slugTaken {
		return nil, nil, ErrSlugTaken
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, nil, fmt.Errorf("auth.service: hashear password: %w", err)
	}

	winery := &Winery{
		ID:           uuid.New(),
		Name:         req.Name,
		Slug:         req.Slug,
		Email:        req.Email,
		PasswordHash: string(hash),
		CreatedAt:    time.Now().UTC(),
	}

	if err := s.repo.Create(ctx, winery); err != nil {
		return nil, nil, fmt.Errorf("auth.service: %w", err)
	}

	token, err := s.signToken(winery.ID)
	if err != nil {
		return nil, nil, fmt.Errorf("auth.service: %w", err)
	}

	resp := toWineryResponse(winery)
	return &TokenResponse{Token: token}, &resp, nil
}

// Login autentica una bodega y devuelve el JWT.
func (s *Service) Login(ctx context.Context, req LoginRequest) (*TokenResponse, error) {
	if req.Email == "" || req.Password == "" {
		return nil, ErrInvalidCreds
	}

	winery, err := s.repo.FindByEmail(ctx, req.Email)
	if err != nil {
		return nil, fmt.Errorf("auth.service: %w", err)
	}
	if winery == nil {
		return nil, ErrInvalidCreds
	}

	if err := bcrypt.CompareHashAndPassword([]byte(winery.PasswordHash), []byte(req.Password)); err != nil {
		return nil, ErrInvalidCreds
	}

	token, err := s.signToken(winery.ID)
	if err != nil {
		return nil, fmt.Errorf("auth.service: %w", err)
	}

	return &TokenResponse{Token: token}, nil
}

// Refresh valida un JWT existente y emite uno nuevo.
func (s *Service) Refresh(ctx context.Context, req RefreshRequest) (*TokenResponse, error) {
	claims, err := s.parseToken(req.Token)
	if err != nil {
		return nil, ErrInvalidToken
	}

	// Verificar que la bodega sigue existiendo
	winery, err := s.repo.FindByID(ctx, claims.WineryID)
	if err != nil {
		return nil, fmt.Errorf("auth.service: %w", err)
	}
	if winery == nil {
		return nil, ErrInvalidToken
	}

	token, err := s.signToken(winery.ID)
	if err != nil {
		return nil, fmt.Errorf("auth.service: %w", err)
	}

	return &TokenResponse{Token: token}, nil
}

func (s *Service) signToken(wineryID uuid.UUID) (string, error) {
	expiry := time.Duration(s.cfg.JWTExpiryHours) * time.Hour
	claims := Claims{
		WineryID: wineryID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		return "", fmt.Errorf("firmar token: %w", err)
	}
	return signed, nil
}

func (s *Service) parseToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de firma inesperado: %v", t.Header["alg"])
		}
		return []byte(s.cfg.JWTSecret), nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("token inválido")
	}
	return claims, nil
}

// ParseToken expone el parseo para el middleware.
func (s *Service) ParseToken(tokenStr string) (*Claims, error) {
	return s.parseToken(tokenStr)
}
