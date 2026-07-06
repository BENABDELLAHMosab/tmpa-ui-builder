# Architecture Cible - TMPA UI Builder

L'application repose sur une architecture moderne de type MERN, séparée en un backend fournissant une API RESTful et un frontend agissant comme client lourd (Single Page Application).

## Frontend (React + TypeScript)
L'interface utilisateur sera développée en React, typée statiquement avec TypeScript pour plus de robustesse.

### Composants principaux du Frontend :
- **Component Library** : Ensemble des composants UI standards et réutilisables (Boutons, Formulaires, Tableaux, etc.) qui pourront être intégrés dans les pages.
- **Builder Visuel** : Cœur de l'application côté client, il se divise en trois parties :
  - **Canvas** : Zone centrale de glisser-déposer (Drag & Drop) où la page prend forme.
  - **Property Panel** : Panneau latéral permettant d'éditer les propriétés (props, styles) du composant sélectionné dans le Canvas.
- **Preview Engine** : Moteur capable d'interpréter le JSON représentant l'arborescence des composants pour afficher un rendu fonctionnel (sans les outils d'édition).

## Backend (API Express + Node.js)
Le backend servira d'API intermédiaire pour gérer la persistance, l'authentification et les règles métier complexes.
- **Node.js + Express.js** : Pour la création de routes API rapides et non bloquantes.
- **Rôles et Sécurité** : 
  - Différenciation des middlewares selon le rôle (Admin / User-Developer).
  - Validation des données en entrée.

## Base de Données (MongoDB)
Base de données NoSQL orientée documents, idéale pour stocker des structures JSON dynamiques générées par le Builder.

## Authentification
- **JWT (JSON Web Tokens)** : Utilisé pour sécuriser les appels API de la V1, en maintenant l'état de la session côté client.
