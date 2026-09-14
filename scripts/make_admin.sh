#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: ./scripts/make_admin.sh your@email.com"
  exit 1
fi

cd "$(dirname "$0")/.."
set -a
# shellcheck disable=SC1091
source .env
set +a

docker exec -i dakhl_o_kharj_db \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -c "UPDATE users SET is_admin = true WHERE email = '$1';"

echo "Done. If the user exists, they are now an admin."