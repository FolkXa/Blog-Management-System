DC ?= docker compose

.PHONY: help build up down restart ps logs be-sh fe-sh db-sh db-init db-seed clean

help:
	@echo "Available targets:"
	@echo "  make build     - Build all images"
	@echo "  make up        - Start all services in background"
	@echo "  make down      - Stop all services"
	@echo "  make restart   - Restart backend and frontend services"
	@echo "  make ps        - Show service status"
	@echo "  make logs      - Tail logs for all services"
	@echo "  make be-sh     - Shell into backend container"
	@echo "  make fe-sh     - Shell into frontend container"
	@echo "  make db-sh     - psql shell into Postgres"
	@echo "  make db-init   - Run DB migrations (init.sql) inside backend"
	@echo "  make db-seed   - Seed sample data via backend script"
	@echo "  make clean     - Stop services and remove volumes (DANGEROUS)"

build:
	$(DC) build

up:
	$(DC) up -d
	@echo "\nServices starting..."
	@echo "Backend:  http://localhost:4000/api/health"
	@echo "Frontend: http://localhost:5173"

down:
	$(DC) down

restart:
	$(DC) restart backend frontend

ps:
	$(DC) ps

logs:
	$(DC) logs -f db backend frontend

be-sh:
	$(DC) exec backend sh

fe-sh:
	$(DC) exec frontend sh

# Open interactive psql on the Postgres service
# Default creds defined in docker-compose.yml
# user: postgres, pass: postgres, db: blog_db
# For password prompts, set PGPASSWORD inline
# Example: make db-sh

db-sh:
	PGPASSWORD=postgres $(DC) exec db psql -U postgres -d blog_db

# Run DB migration (init.sql) using the backend container's Node runtime
# Requires the DB service to be healthy and backend container running

db-init:
	$(DC) exec backend node src/scripts/init-db.js

# Seed sample data (wipes users/posts/comments)

db-seed:
	$(DC) exec backend node src/scripts/seed-db.js

# DANGEROUS: removes containers and volumes (including Postgres data)
clean:
	$(DC) down -v --remove-orphans
