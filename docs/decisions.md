# Décisions Techniques

Ce document consigne les choix technologiques et architecturaux majeurs pris lors de la phase de conception.

## Stack & Architecture
- **MongoDB 100 %** : Choix d'une base NoSQL documentaire car la structure d'une page créée via le builder (arbre de composants) est par nature dynamique et s'adapte parfaitement au format JSON/BSON.
- **React + TypeScript** : React est standard pour la création d'interfaces interactives (Builder). TypeScript sécurise le code, particulièrement utile lors de la manipulation d'arborescences de composants complexes.
- **Node.js + Express** : Permet de conserver le même écosystème (JavaScript/TypeScript) côté client et serveur.

## Sécurité et Authentification
- **JWT pour la V1** : Authentification stateless, simple à mettre en place pour l'API RESTful.

## Intégration
- **Pas d'API interne TMPA en V1** : La première version se concentre sur le cœur de la plateforme (le Builder et le workflow de validation) et simulera ou utilisera des données mockées/statiques pour les composants nécessitant de la donnée.
- **Technologies Open Source** : Aucune dépendance à des outils propriétaires afin d'assurer l'indépendance de la plateforme.

## Fonctionnel
- **Workflow de validation** : Séparation stricte entre le créateur (User-Developer) et le validateur (Admin) pour garantir la qualité et la conformité des UI produites avant publication.
- **Versioning des pages** : Sauvegarde des versions pour éviter la perte de données et permettre un retour arrière, indispensable dans un outil de type "Builder".
