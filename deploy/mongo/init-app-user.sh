#!/bin/sh
set -eu
export TMPA_APP_PASSWORD="$(cat /run/secrets/mongo_app_password)"
mongosh --quiet --host 127.0.0.1 --port 27017 /docker-entrypoint-initdb.d/10-app-user.js
unset TMPA_APP_PASSWORD
