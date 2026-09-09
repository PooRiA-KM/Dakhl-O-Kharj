#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
set -a
# shellcheck disable=SC1091
source .env
set +a

BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

FILE="$BACKUP_DIR/dakhl_o_kharj_$(date +%Y%m%d_%H%M%S).sql.gz"

echo "Creating backup: $FILE"

docker exec dakhl_o_kharj_db \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$FILE"

echo "Backup created successfully."
ls -lh "$FILE"