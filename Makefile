# QRMenu Docker Management
# Usage: make <target>

.PHONY: help build up down logs shell db-shell migrate clean dev prod

# Default target
help:
	@echo "QRMenu Docker Commands:"
	@echo ""
	@echo "  Production:"
	@echo "    make build     - Build production Docker image"
	@echo "    make up        - Start production containers"
	@echo "    make down      - Stop all containers"
	@echo "    make logs      - View application logs"
	@echo "    make shell     - Open shell in app container"
	@echo ""
	@echo "  Development:"
	@echo "    make dev       - Start development environment"
	@echo "    make dev-down  - Stop development environment"
	@echo ""
	@echo "  Database:"
	@echo "    make db-shell  - Open PostgreSQL shell"
	@echo "    make migrate   - Run database migrations"
	@echo ""
	@echo "  Maintenance:"
	@echo "    make clean     - Remove all containers and volumes"
	@echo "    make prune     - Remove unused Docker resources"

# ==========================================
# Production
# ==========================================

build:
	docker-compose build

up:
	docker-compose up -d
	@echo ""
	@echo "✅ QRMenu is running at http://localhost:5000"
	@echo "📊 Check status: make logs"

down:
	docker-compose down

logs:
	docker-compose logs -f app

shell:
	docker-compose exec app sh

# ==========================================
# Development
# ==========================================

dev:
	docker-compose -f docker-compose.dev.yml up --build

dev-down:
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f app

# ==========================================
# Database
# ==========================================

db-shell:
	docker-compose exec db psql -U qrmenu -d qrmenu

migrate:
	docker-compose exec app npm run db:push

# ==========================================
# Maintenance
# ==========================================

clean:
	docker-compose down -v --remove-orphans
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	@echo "✅ All containers and volumes removed"

prune:
	docker system prune -f
	@echo "✅ Unused Docker resources removed"

# ==========================================
# Quick start
# ==========================================

init: build up migrate
	@echo ""
	@echo "🎉 QRMenu initialized successfully!"
	@echo "📱 Open http://localhost:5000"
	@echo "🔧 Check config: http://localhost:5000/api/init"
