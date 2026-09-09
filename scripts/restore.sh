#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: ./scripts/restore.sh backups/dakhl_o_kharj_YYYYMMDD_HHMMSS.sql.gz"
  exit 1
fi

cd "$(dirname "$0")/.."
set -a
# shellcheck disable=SC1091
source .env
set +a

echo "WARNING: This will REPLACE current database data!"
read -r -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

gunzip -c "$1" | docker exec -i dakhl_o_kharj_db \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"

echo "Restore finished."