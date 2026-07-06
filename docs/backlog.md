# Backlog V1 - TMPA UI Builder

## Épics & User Stories

### 1. Authentification
- **En tant que** développeur / admin, **je veux** pouvoir me connecter avec un email et un mot de passe, **afin d'** accéder à mon espace dédié de manière sécurisée (JWT).
- **En tant que** système, **je veux** distinguer les rôles (Admin et User-Developer) lors de la connexion, **afin d'** appliquer les droits correspondants.

### 2. Dashboard User-Developer
- **En tant que** User-Developer, **je veux** consulter la liste de mes pages créées, **afin de** voir leur statut (Brouillon, En attente, Approuvée, Rejetée).
- **En tant que** User-Developer, **je veux** accéder à l'historique et aux différentes versions de mes pages.

### 3. Dashboard Admin
- **En tant qu'** Admin, **je veux** voir toutes les pages créées par tous les développeurs, **afin de** suivre l'activité de la plateforme.
- **En tant qu'** Admin, **je veux** lister les pages en attente de validation pour les traiter.

### 4. Création de page
- **En tant que** User-Developer, **je veux** créer une nouvelle page vide, **afin de** commencer un nouvel assemblage d'interface.
- **En tant que** User-Developer, **je veux** modifier les métadonnées d'une page (titre, description).

### 5. Builder visuel
- **En tant que** User-Developer, **je veux** glisser-déposer des composants standards depuis une bibliothèque, **afin de** construire mon interface.
- **En tant que** User-Developer, **je veux** configurer les propriétés des composants sélectionnés (texte, couleurs, marges via un Property Panel).

### 6. Prévisualisation
- **En tant que** User-Developer, **je veux** prévisualiser la page en cours de création, **afin de** vérifier son rendu final sans les éléments du builder.

### 7. Workflow de validation
- **En tant que** User-Developer, **je veux** soumettre une page terminée à la validation, **afin qu'** elle soit revue par un administrateur.
- **En tant qu'** Admin, **je veux** pouvoir approuver ou rejeter une page soumise, en ajoutant éventuellement un commentaire.
- **En tant qu'** Admin, **je veux** publier une page approuvée pour la rendre accessible en production.

### 8. Gestion des versions
- **En tant que** système, **je veux** sauvegarder un historique de modifications de la page (versioning), **afin de** pouvoir revenir à une version précédente ou garder une trace des évolutions.
