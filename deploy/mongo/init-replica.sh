#!/bin/sh
set -eu

PASSWORD="$(cat /run/secrets/mongo_root_password)"
URI="mongodb://root:${PASSWORD}@mongo:27017/admin?directConnection=true"
unset PASSWORD

i=0
until mongosh "$URI" --quiet --eval 'db.adminCommand({ping:1})' >/dev/null 2>&1; do
  i=$((i + 1))
  if [ "$i" -ge 90 ]; then
    echo "MongoDB non disponible après 180 secondes" >&2
    exit 1
  fi
  sleep 2
done

mongosh "$URI" --quiet --eval '
  try {
    rs.status();
    print("Replica set déjà initialisé");
  } catch (e) {
    if (e.code === 94 || e.codeName === "NotYetInitialized") {
      rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "mongo:27017" }] });
      print("Replica set initialisé");
    } else {
      throw e;
    }
  }
'

i=0
until mongosh "$URI" --quiet --eval 'if (!db.hello().isWritablePrimary) quit(1)' >/dev/null 2>&1; do
  i=$((i + 1))
  if [ "$i" -ge 60 ]; then
    echo "Replica set : PRIMARY indisponible" >&2
    exit 1
  fi
  sleep 2
done
echo "MongoDB PRIMARY prêt"
