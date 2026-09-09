#!/usr/bin/env bash
set -euo pipefail

echo "=== Dakhl-O-Kharj Deployment ==="

command -v docker >/dev/null 2>&1 || {
  echo "ERROR: Docker is not installed."
  exit 1
}

docker compose version >/dev/null 2>&1 || {
  echo "ERROR: Docker Compose is not installed."
  exit 1
}

if [ ! -f .env ]; then
  echo ".env not found. Creating from .env.prod.example ..."
  cp .env.prod.example .env
  echo "!! Now edit .env with secure values, then run this script again:"
  echo "   nano .env"
  exit 1
fi

echo "Building images..."
docker compose -f docker-compose.prod.yml build

echo "Starting services..."
docker compose -f docker-compose.prod.yml up -d

echo "Waiting for services to start..."
sleep 8

if curl -fsS http://localhost/api/v1/health >/dev/null 2>&1; then
  echo "Backend is healthy."
else
  echo "WARNING: Backend did not respond yet. Check logs:"
  echo "  docker compose -f docker-compose.prod.yml logs -f backend"
fi

echo
echo "Deployment finished."
echo "Open: http://YOUR_SERVER_IP"