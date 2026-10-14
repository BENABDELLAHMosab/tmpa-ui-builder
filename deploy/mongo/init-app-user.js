const dbName = process.env.MONGO_INITDB_DATABASE || 'tmpa_ui_builder';
const database = db.getSiblingDB(dbName);
const username = process.env.MONGO_APP_USERNAME || 'tmpa_app';
const password = process.env.TMPA_APP_PASSWORD;
if (!password) {
  throw new Error('Mot de passe MongoDB applicatif absent');
}
database.createUser({
  user: username,
  pwd: password,
  roles: [{ role: 'readWrite', db: dbName }]
});
print('Utilisateur applicatif créé sur ' + dbName);
