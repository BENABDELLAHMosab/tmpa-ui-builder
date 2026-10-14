#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
set -a
source .env.vps
set +a
: "${DOMAIN:?DOMAIN absent}"
: "${LETSENCRYPT_EMAIL:?LETSENCRYPT_EMAIL absent}"
if [[ ! "$DOMAIN" =~ ^[a-zA-Z0-9.-]+$ ]] || [[ "$DOMAIN" == "application.example.com" ]]; then
  echo "Domaine invalide ou de démonstration" >&2
  exit 1
fi
docker compose --env-file .env.vps -f compose.vps.yml --profile maintenance run --rm --no-deps certbot certonly \
  --webroot -w /var/www/certbot -d "$DOMAIN" \
  --email "$LETSENCRYPT_EMAIL" --agree-tos --no-eff-email --non-interactive
sed "s/__DOMAIN__/$DOMAIN/g" deploy/nginx/https.conf.template > deploy/nginx/active.conf
docker compose --env-file .env.vps -f compose.vps.yml exec nginx nginx -t
docker compose --env-file .env.vps -f compose.vps.yml exec nginx nginx -s reload
echo "HTTPS activé : https://$DOMAIN"
