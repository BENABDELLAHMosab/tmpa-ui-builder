# TMPA UI Builder

## Description
Plateforme interne No-Code/Low-Code orientée développeurs pour Tanger Med Port Authority (TMPA). Cet outil permet de créer, prévisualiser et gérer des interfaces utilisateur à partir de composants standards et réutilisables.

## Contexte Métier
Dans l'écosystème Tanger Med PCS, de nombreux services digitaux sont développés de manière décentralisée. Cela entraîne une duplication du code, des incohérences visuelles entre les interfaces et un manque de standardisation. Le TMPA UI Builder a pour but de centraliser et d'uniformiser la création d'interfaces pour l'ensemble des développeurs internes.

## Objectifs Principaux
- Standardiser les interfaces utilisateurs au sein de TMPA.
- Accélérer le développement grâce à une approche No-Code/Low-Code.
- Gérer le cycle de vie des pages (création, prévisualisation, validation, publication, historique).
- Séparer les responsabilités avec une gestion des rôles (Admin / User-Developer).

## Stack Technique Cible
- **Frontend** : React + TypeScript
- **Backend** : Node.js + Express.js
- **Base de données** : MongoDB
- **Authentification** : JWT
- **Architecture** : MERN
- **Versioning code** : Git + GitHub

## Modules Prévus
- Module d'authentification et gestion des accès (RBAC).
- Espace développeur (création, prévisualisation, soumission de pages).
- Builder visuel (Canvas, Property Panel, Component Library).
- Espace administrateur (validation, rejet, publication, suivi global).
- Moteur de prévisualisation et gestion des versions.

## Statut du Projet
**Sprint 0 / Initialisation** : Création de la structure documentaire et définition de l'architecture.

## Démarrage Rapide (Docker)

Assurez-vous d'avoir Docker et Docker Compose installés sur votre machine.

### Commandes utiles

- **Lancer toute la stack (détaché)** :
  ```bash
  docker compose up --build -d
  ```
- **Afficher les logs en direct** :
  ```bash
  docker compose logs -f
  ```
- **Arrêter les containers** :
  ```bash
  docker compose down
  ```

### URLs utiles
- **Frontend** : [http://localhost:5173](http://localhost:5173)
- **Backend (Health Check)** : [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **MongoDB** : `mongodb://localhost:27017`
- **Mongo Express** : [http://localhost:8081](http://localhost:8081)
  - Identifiant : `admin`
  - Mot de passe : `admin123`
  - *Note : mongo-express est uniquement destiné à l'environnement de développement.*
