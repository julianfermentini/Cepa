# ---- Development stage (hot reload con air) ----
FROM golang:1.25-alpine AS dev

RUN apk add --no-cache git curl

# Instalar air para hot reload
RUN go install github.com/air-verse/air@latest

WORKDIR /app

# Copiar go.mod y go.sum primero para aprovechar cache de capas
COPY go.mod go.sum ./
RUN go mod download

CMD ["air", "-c", "air.toml"]


# ---- Build stage ----
FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o /app/bin/api ./cmd/api


# ---- Production stage ----
FROM alpine:3.20 AS production

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

COPY --from=builder /app/bin/api ./api

EXPOSE 8080

CMD ["./api"]
