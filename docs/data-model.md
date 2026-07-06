# Modèle de Données (MongoDB)

L'application fonctionnant avec MongoDB, voici les collections principales envisagées pour modéliser le domaine du projet.

### `users`
Stocke les informations des utilisateurs et leurs rôles.
- `_id` : ObjectId
- `email` : String (unique)
- `passwordHash` : String
- `role` : String (Enum: 'admin', 'user-developer')
- `createdAt` : Date

### `pages`
Représente l'entité globale d'une page créée.
- `_id` : ObjectId
- `title` : String
- `description` : String
- `authorId` : ObjectId (ref: 'users')
- `status` : String (Enum: 'draft', 'pending_validation', 'approved', 'rejected', 'published')
- `currentVersion` : ObjectId (ref: 'page_versions')
- `createdAt` : Date
- `updatedAt` : Date

### `page_versions`
Stocke les différentes itérations d'une page et surtout la structure de ses composants.
- `_id` : ObjectId
- `pageId` : ObjectId (ref: 'pages')
- `versionNumber` : Number
- `structure` : Object / JSON (Arbre des composants, contenant le type, les props et les enfants de chaque composant présent sur la page)
- `createdAt` : Date

### `validation_requests`
Traque le cycle de vie de la validation d'une page.
- `_id` : ObjectId
- `pageId` : ObjectId (ref: 'pages')
- `requestedBy` : ObjectId (ref: 'users')
- `reviewedBy` : ObjectId (ref: 'users', optionnel)
- `status` : String (Enum: 'pending', 'approved', 'rejected')
- `feedback` : String
- `createdAt` : Date
- `resolvedAt` : Date

### `custom_components` (Optionnel pour la V1)
Permet de stocker la définition de composants spécifiques si la plateforme doit être extensible ultérieurement.
- `_id` : ObjectId
- `name` : String
- `schema` : Object (Définition des propriétés acceptées)
- `createdAt` : Date
