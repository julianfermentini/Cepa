.PHONY: dev build test migrate lint clean down logs restart status db-shell

# ============================================================
# Desarrollo local — todo corre en Docker
# ============================================================

# Levantar todo el stack (PostgreSQL, Redis, MinIO, API, AI Sidecar, Dashboard)
dev:
	docker compose up --build

# Levantar en background (detached)
dev-bg:
	docker compose up --build -d

# Ver estado de los servicios
status:
	docker compose ps

# Reiniciar solo el API (útil después de cambios en Go)
restart:
	docker compose restart api

# Ver logs del API
logs:
	docker compose logs -f api

# Ver logs de todos los servicios
logs-all:
	docker compose logs -f

# Ver logs del dashboard
logs-dash:
	docker compose logs -f dashboard

# ============================================================
# Base de datos
# ============================================================

# Correr migrations manualmente
migrate:
	@echo "Corriendo migrations..."
	@for f in migrations/*.sql; do \
		echo "Aplicando $$f..."; \
		docker exec cepa_postgres psql -U cepa -d cepa_dev -f /dev/stdin < $$f; \
	done
	@echo "Migrations completadas."

# Abrir shell SQL para consultas directas
db-shell:
	docker exec -it cepa_postgres psql -U cepa -d cepa_dev

# Resetear la base de datos (borra todo y re-aplica migrations)
db-reset:
	docker compose down -v
	docker compose up -d postgres redis minio
	@echo "Esperando a que PostgreSQL esté listo..."
	@sleep 5
	docker compose up migrate
	@echo "Base de datos reseteada."

# ============================================================
# Build y tests (corren dentro de Docker)
# ============================================================

# Build del binario Go
build:
	docker compose exec api go build -o bin/api ./cmd/api

# Correr tests
test:
	docker compose exec api go test ./...

# Lint
lint:
	docker compose exec api golangci-lint run ./...

# ============================================================
# Limpieza
# ============================================================

# Bajar el stack (conserva datos)
stop:
	docker compose down

# Bajar el stack y borrar volúmenes (borra datos de DB, Redis, MinIO)
down:
	docker compose down -v

# Limpiar todo (volúmenes + imágenes construidas)
clean:
	docker compose down -v --rmi local
