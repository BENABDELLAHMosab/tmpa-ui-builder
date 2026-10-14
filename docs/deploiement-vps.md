# Déploiement VPS TMPA UI Builder — Docker Compose, Nginx et HTTPS

**Portée** : infrastructure de démonstration ou VPS autorisé. Pour les données internes TMPA, obtenir l'autorisation de l'organisation et privilégier un VPN ou un accès privé. La présence de HTTPS ne suffit pas à qualifier une infrastructure pour la production.

## Avant de commencer

- VPS Linux récent (Ubuntu Server LTS conseillé), au moins 2 vCPU, 4 Go RAM pour commencer, espace disque dimensionné pour MongoDB et les sauvegardes.
- Domaine DNS sous votre contrôle ; un enregistrement A vers l'IP du VPS, et AAAA uniquement si IPv6 fonctionne.
- Accès SSH avec une clé, compte non-root avec sudo.
- Docker Engine et plugin Docker Compose installés depuis les dépôts officiels.
- Pare-feu : SSH restreint à votre IP si possible, ports publics 80 et 443 uniquement ; 27017, 5000, 5173 et 8081 **fermés**.
- Sauvegardes chiffrées hors VPS et restauration testée.
- Ce déploiement utilise un Replica Set MongoDB mono-nœud : transactions possibles, mais **aucune haute disponibilité**.

## 1. Récupérer le dépôt privé

Sur le VPS (après autorisation SSH/GitHub) :

```bash
git clone git@github.com:BENABDELLAHMosab/tmpa-ui-builder.git
cd tmpa-ui-builder
git switch deploy/vps-docker-nginx-https
```

Installez seulement une clé de déploiement GitHub **en lecture seule**, ou copiez un artefact approuvé, plutôt qu'une clé personnelle non restreinte.

## 2. Préparer la configuration

```bash
bash deploy/scripts/prepare.sh
nano .env.vps
```

Définissez `DOMAIN` avec votre vrai domaine DNS et `LETSENCRYPT_EMAIL` avec une boîte valide. Le script crée des secrets aléatoires et prépare la configuration HTTP initiale. Ne transmettez jamais les fichiers de `deploy/secrets/` à Git.

Avant toute mise en service, vérifier que le domaine pointe vers le VPS :

```bash
dig +short A votre-domaine.example
```

## 3. Démarrer

```bash
docker compose --env-file .env.vps -f compose.vps.yml config --quiet
docker compose --env-file .env.vps -f compose.vps.yml up -d --build
docker compose --env-file .env.vps -f compose.vps.yml ps
docker compose --env-file .env.vps -f compose.vps.yml logs --tail=100 mongo-init backend nginx
```

Seul Nginx expose des ports publics ; MongoDB et Express ne publient aucun port sur l'hôte. Le service `mongo-init` initialise le replica set. L'utilisateur applicatif reçoit des droits `readWrite` seulement dans sa base.

## 4. HTTPS

Après propagation DNS et ouverture du port 80 :

```bash
bash deploy/scripts/enable-https.sh
curl -I https://votre-domaine.example/login
curl -fsS https://votre-domaine.example/api/health/test
```

Le renouvellement se fait via cron root ou un timer systemd :

```cron
15 3 * * * /chemin/absolu/vers/tmpa-ui-builder/deploy/scripts/renew-https.sh >> /var/log/tmpa-certbot.log 2>&1
```

Le script recharge Nginx après tentative de renouvellement.

## 5. Premier compte administrateur

**Ne lancez jamais** `npm run seed:users` en production : ce script crée des mots de passe de démonstration. Créez un administrateur depuis un terminal sécurisé (pas en laissant durablement ses secrets dans Compose ou dans le dépôt) :

```bash
# Choisir un email et un mot de passe >= 12 caractères.
read -r -p "Email admin : " SEED_ADMIN_EMAIL
read -r -s -p "Mot de passe admin : " SEED_ADMIN_PASSWORD; echo
export SEED_ADMIN_EMAIL SEED_ADMIN_PASSWORD
docker compose --env-file .env.vps -f compose.vps.yml run --rm --no-deps \
  -e SEED_ADMIN_EMAIL -e SEED_ADMIN_PASSWORD backend \
  node /app/dist/scripts/seed-admin.js
unset SEED_ADMIN_EMAIL SEED_ADMIN_PASSWORD
```

Le script refuse de modifier un compte existant. Les secrets de l'administrateur sont injectés uniquement dans cette commande ponctuelle et ne sont pas conservés dans Compose.


## 6. Tests et exploitation

- Tester `/api/health/test` : `database.status` doit être `connected`.
- Tester les routes React en accès direct et après actualisation.
- Tester l'authentification, l'édition, les prévisualisations, les versions, la validation et la publication.
- Tester un téléversement d'image de moins de 5 Mo.
- Vérifier les logs, les volumes et les mises à jour de sécurité.
- Avant toute mise à jour destructive, faire une sauvegarde cohérente MongoDB, chiffrée, hors VPS, puis tester la restauration.
- Surveiller l'espace disque, surtout MongoDB et les certificats.
- Pour mettre à jour : `git pull`, reconstruire et relancer les services ; une migration de schéma nécessiterait une étape dédiée.

## Sécurité complémentaire avant vraie production

Auditer le stockage de JWT en `localStorage`, la protection contre le brute force sur le login, l'absence de secrets de secours, la configuration de CORS, la politique CSP, le durcissement des images, le backup / restore, les correctifs Node, et les restrictions réseau. Un DNS public et un certificat TLS ne rendent pas automatiquement cette application interne appropriée pour Internet.

## Sources

- https://docs.docker.com/compose/
- https://docs.docker.com/compose/how-tos/use-secrets/
- https://nginx.org/en/docs/
- https://eff-certbot.readthedocs.io/en/stable/using.html#webroot
- https://www.mongodb.com/docs/manual/tutorial/deploy-replica-set-with-keyfile-access-control/
