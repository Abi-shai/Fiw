# ADR 0003 — AffiliéPartenaire : accessible uniquement depuis Fiw Pro

**Date :** 2026-06-23
**Statut :** Décidé
**Supersede :** ADR 0002

## Contexte

ADR 0002 avait décidé que l'onboarding et le tableau de bord AffiliéPartenaire vivaient dans l'app Fiw (côté Client), via un sélecteur de compte. Cette décision est annulée.

AffiliéPartenaire est une entité de type commerce/entreprise (restaurant, hôtel, agence…) qui génère des Commandes depuis un point physique. Ce profil s'inscrit et gère son activité depuis Fiw Pro — pas depuis l'app Fiw réservée aux Clients individuels.

## Décision

AffiliéPartenaire est uniquement accessible depuis Fiw Pro. Fiw (app Client) ne propose pas d'onboarding ni de tableau de bord AffiliéPartenaire.

## Conséquences

- Dans Fiw (sitemap Client) : la section affiliation couvre uniquement AffiliéRéseau. La mention de l'AffiliéPartenaire se limite à une page informative orientant vers Fiw Pro.
- Dans Fiw Pro (sitemap Prestataire) : une section dédiée à AffiliéPartenaire s'ajoute. _(Amendé par ADR 0005 : il n'y a plus de section AffiliéRéseau côté Pro — Affilié Réseau est désormais un rôle Client uniquement.)_
- ADR 0002 (sélecteur de compte dans Fiw) est annulé — l'app Fiw n'a pas besoin de gérer plusieurs contextes d'identité.
- Les relations membres/succursales de l'entité AffiliéPartenaire (encore ouvertes dans le modèle conceptuel) restent à résoudre avec l'engineering.
