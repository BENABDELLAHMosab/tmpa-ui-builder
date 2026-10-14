# Déploiement de démonstration TMPA UI Builder

> **Important** : la plateforme TMPA est décrite comme un projet interne. Ne déployez que des données fictives et du code autorisé par votre organisme. Conservez le dépôt privé. Cette procédure est destinée à une démonstration, non à une production TMPA.

## Architecture

- **Frontend** : site statique React/Vite sur Render.
- **Backend** : service web Node.js/Express sur Render.
- **Base** : MongoDB Atlas (Replica Set managé nécessaire aux transactions MongoDB).
- Le fichier `docker-compose.yml` existant reste réservé au développement local : il expose MongoDB et mongo-express et exécute Vite/tsx en mode développement.

## 1. Vérifications locales

Depuis la racine du dépôt, exécutez `npm run install:all` puis `npm run build`. Vérifiez que les deux builds réussissent. N'envoyez jamais de fichier `.env` sur GitHub.

## 2. MongoDB Atlas

1. Créez un projet et un cluster Atlas (Free pour une démonstration légère seulement).
2. Créez un utilisateur **base de données** avec droits limités à la base `tmpa_ui_builder`.
3. Autorisez l'IP sortante du backend dans **Network Access**. Préférez une IP fixe ou un réseau privé pour une production. Ne laissez pas un accès global permanent par défaut.
4. Copiez la chaîne SRV `mongodb+srv://...` depuis Atlas, avec la base `tmpa_ui_builder`, dans un gestionnaire de secrets. Elle ne doit jamais figurer dans Git.
5. Choisissez une région Atlas proche de la région Render du backend pour limiter la latence.

**Migration** : créer un nouveau cluster ne copie pas vos données locales. Si vous souhaitez conserver les pages existantes, planifiez un export/import `mongodump` / `mongorestore` ou une migration contrôlée, et vérifiez les limites du cluster choisi. Sinon, commencez avec une base vide.

## 3. Render

1. Connectez votre compte GitHub à Render en autorisant explicitement le dépôt privé.
2. Dans **Blueprints**, créez un Blueprint à partir du `render.yaml` de cette branche une fois fusionnée.
3. Le Blueprint crée deux services : `tmpa-ui-builder-api` (Node) et `tmpa-ui-builder-web` (Static Site).
4. Complétez les valeurs demandées : `MONGO_URI` (secret Atlas), `CORS_ORIGIN` (URL exacte HTTPS du frontend), `VITE_API_URL` (URL HTTPS du backend terminée par `/api`).
5. `JWT_SECRET` est généré automatiquement. Ne l'exposez pas côté frontend. `NODE_ENV=production` bloque le backend si les paramètres de sécurité manquent.
6. Si les URLs exactes ne sont connues qu'après création, corrigez les variables dans les deux services puis relancez un déploiement. La variable `VITE_API_URL` est intégrée au **build** de Vite ; un simple redémarrage ne suffit pas.

Exemple purement illustratif :
- `CORS_ORIGIN=https://tmpa-ui-builder-web.onrender.com`
- `VITE_API_URL=https://tmpa-ui-builder-api.onrender.com/api`

Les URL réellement attribuées peuvent différer. Copiez-les depuis votre tableau de bord Render.

## 4. Premier compte administrateur (une seule fois)

**Ne lancez pas** `npm run seed:users` sur Atlas : ce script de développement utilise des mots de passe connus.

Depuis votre ordinateur et le répertoire `backend`, préparez temporairement un `.env` local non suivi par Git contenant `MONGO_URI`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` (12 caractères minimum), puis exécutez :

```bash
npm ci
npm run seed:admin
```

Pour cette opération seulement, ajoutez également l'IP publique de votre ordinateur dans la liste des IP autorisées d'Atlas, puis retirez-la si elle n'est plus nécessaire. Après succès, effacez les variables `SEED_ADMIN_*` et protégez la copie locale du fichier `.env`. Le script ne remplace pas un utilisateur existant.

## 5. Vérification finale

- `https://<votre-backend>.onrender.com/api/health/test` répond 200 avec `database.status=connected`.
- `https://<votre-frontend>.onrender.com/login` s'affiche correctement.
- Actualiser une route profonde telle que `/developer/dashboard` ne retourne pas 404 (rewrite SPA).
- Connexion admin, création de développeur, création/modification, prévisualisation, soumission, validation, publication et historique de page.
- Téléversement d'image (les assets sont stockés dans MongoDB, pas dans le disque éphémère du service).
- Vérifier qu'une origine web non autorisée ne bénéficie pas de CORS.
- Sur le plan Render gratuit, prévoir l'endormissement après inactivité et les limites de ressources ; Atlas Free a aussi des limites de stockage et ne constitue pas une solution de sauvegarde professionnelle.

## Références

- https://render.com/docs/blueprint-spec
- https://render.com/docs/monorepo-support
- https://render.com/docs/free
- https://www.mongodb.com/docs/atlas/setup-cluster-security/
- https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/
