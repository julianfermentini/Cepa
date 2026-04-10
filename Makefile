.PHONY: dev build test migrate lint clean

# Levantar todo el stack con Docker Compose (hot reload via air)
dev:
	docker compose up --build

# Build del binario Go
build:
	go build -o bin/api ./cmd/api

# Correr tests
test:
	go test ./...

# Correr migrations contra la base de datos local (requiere psql instalado o Docker corriendo)
migrate:
	@echo "Corriendo migrations..."
	@for f in migrations/*.sql; do \
		echo "Aplicando $$f..."; \
		docker exec cepa_postgres psql -U cepa -d cepa_dev -f /dev/stdin < $$f; \
	done
	@echo "Migrations completadas."

# Lint
lint:
	golangci-lint run ./...

# Limpiar binarios y cache
clean:
	rm -rf bin/
	go clean -cache

# Bajar el stack y borrar volúmenes
down:
	docker compose down -v

# Ver logs del API
logs:
	docker compose logs -f api
