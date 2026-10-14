#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
docker compose --env-file .env.vps -f compose.vps.yml --profile maintenance run --rm --no-deps certbot renew --webroot -w /var/www/certbot --quiet
docker compose --env-file .env.vps -f compose.vps.yml exec -T nginx nginx -s reload
