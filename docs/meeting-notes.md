# Notes de Réunion : Cadrage du Projet TMPA UI Builder

## Contexte
Le projet s'inscrit dans l'écosystème **Tanger Med PCS**. Le besoin émane de la nécessité de rationnaliser et d'uniformiser le développement des interfaces des divers services digitaux développés séparément au sein de TMPA.

## Problèmes Identifiés
- Duplication importante du code entre les différents projets.
- Incohérences visuelles (UI) et ergonomiques (UX) d'une application à l'autre.
- Absence de standardisation des composants et des pratiques frontend.

## Décisions Validées
- **Création d'une plateforme No-Code/Low-Code** orientée développeurs pour assembler des interfaces.
- **Rôles utilisateurs** :
  - *Admin* : vision globale sur l'ensemble des pages, pouvoir d'approbation et de publication.
  - *User-Developer* : vision restreinte à ses propres créations, création et soumission des pages.
- **Workflow de validation** : Création -> Soumission -> Approbation/Rejet -> Publication.
- **Base de données** : Choix d'une solution 100% MongoDB.
- **Authentification** : Utilisation de JWT pour la V1.
- **Périmètre technique V1** :
  - Pas de connexion aux APIs internes TMPA pour cette première version.
  - Utilisation exclusive de technologies Open Source (Stack MERN).
