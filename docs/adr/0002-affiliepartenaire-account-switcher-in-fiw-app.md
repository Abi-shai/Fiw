# ADR 0002 — AffiliéPartenaire : sélecteur de compte dans l'app Fiw

**Date :** 2026-06-16
**Statut :** Décidé

## Contexte

AffiliéPartenaire est une entité distincte (pas un rôle sur un compte Client — décision de session antérieure). Un Client peut initier l'onboarding AffiliéPartenaire depuis l'app Fiw et, une fois inscrit, a besoin d'accéder à son tableau de bord Partenaire.

Trois options ont été évaluées :
- **A** — Sélecteur de compte dans l'app (style Gmail / Slack workspace switcher)
- **B** — Interface Partenaire dédiée dans Fiw, reconnexion explicite pour revenir au contexte Client
- **C** — Compte Partenaire entièrement séparé (portail web ou app distincte) ; Fiw lance seulement l'inscription

## Décision

**Option A retenue.** Le Client peut basculer entre son contexte Client et son contexte AffiliéPartenaire à l'intérieur de la même session Fiw, via un sélecteur de compte.

## Raisons

- L'onboarding AffiliéPartenaire complet vit dans l'app Fiw (décision prise avant cet ADR) — il est cohérent que l'accès continu au tableau de bord Partenaire y reste aussi.
- Un portail séparé (C) aurait cassé la continuité du parcours initié dans l'app.
- Une reconnexion explicite (B) est une friction inutile si le même utilisateur alterne régulièrement entre les deux rôles.

## Conséquences

- L'app Fiw doit gérer plusieurs contextes d'identité actifs pour un même utilisateur (Client + Partenaire).
- Le sélecteur de compte doit être positionné quelque part dans la navigation — à décider (candidats : menu hamburger, zone profil/avatar en haut).
- Quand le contexte Partenaire est actif, la home et la navigation changent : à breadboarder séparément.
- Les relations membres/succursales de l'entité AffiliéPartenaire (encore ouvertes dans le modèle conceptuel) devront être résolues avant de breadboarder le contexte Partenaire.
