#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
umask 077
mkdir -p deploy/secrets
for key in mongo-root-password mongo-app-password jwt-secret; do
  if [[ ! -s "deploy/secrets/$key" ]]; then
    openssl rand -hex 48 > "deploy/secrets/$key"
    chmod 600 "deploy/secrets/$key"
  fi
done
if [[ ! -f .env.vps ]]; then
  echo "DOMAIN=application.example.com" > .env.vps
  chmod 600 .env.vps
fi
cp deploy/nginx/bootstrap.conf deploy/nginx/active.conf
chmod 644 deploy/nginx/active.conf
echo "Secrets initialisés. Remplacez DOMAIN dans .env.vps avant démarrage."
