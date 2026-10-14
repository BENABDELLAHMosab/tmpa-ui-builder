#!/bin/sh
set -eu

if [ ! -s /run/secrets/mongo_app_password ] || [ ! -s /run/secrets/jwt_secret ]; then
  echo "Secrets backend absents ou vides" >&2
  exit 1
fi

MONGO_PASSWORD="$(cat /run/secrets/mongo_app_password)"
JWT_SECRET="$(cat /run/secrets/jwt_secret)"
MONGO_URI="mongodb://tmpa_app:${MONGO_PASSWORD}@mongo:27017/tmpa_ui_builder?authSource=tmpa_ui_builder&replicaSet=rs0"

export JWT_SECRET MONGO_URI
unset MONGO_PASSWORD
if [ "$#" -gt 0 ]; then
  exec su-exec node "$@"
fi
exec su-exec node node /app/dist/server.js
