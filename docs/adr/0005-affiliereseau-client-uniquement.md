# ADR 0005 — Affilié Réseau : rôle Client uniquement (modèle « 1 affilié = 1 app »)

**Date :** 2026-06-26
**Statut :** Décidé
**Amende :** ADR 0003 (conséquence n°2), CONTEXT.md, conceptual-model.md, sitemap-pro.md

## Contexte

Le modèle initial définissait **Affilié Réseau** comme un rôle activable indifféremment sur un compte **Client** (dans Fiw) ou **Prestataire** (dans Fiw Pro). En conséquence, sitemap-pro §8 prévoyait une section AffiliéRéseau dans Fiw Pro, et ADR 0003 mentionnait le « recrutement de Prestataires à 2 % » côté Pro.

En retravaillant le flow Affilié Réseau (breadboard du 26 juin 2026), la question s'est posée : faut-il vraiment maintenir le rôle dans les deux apps ? Le porter dans Fiw Pro signifie charger l'app prestataire d'un second tableau de bord, dupliquer les écrans, et gérer un rôle transversal.

## Décision

**Affilié Réseau est un rôle exclusivement activable sur un compte Client, dans l'app Fiw.** Un Prestataire ne peut pas devenir Affilié Réseau depuis Fiw Pro.

Modèle « **1 affilié = 1 app** » :
- **Affilié Réseau** (commission 2 %) → app **Fiw** (Client).
- **Affilié Partenaire** (commission 4 %) → app **Fiw Pro** (Prestataire), entité distincte (ADR 0003).

## Alternatives écartées

- **Garder le rôle dans les deux apps** : conserve le canal de recrutement prestataire→prestataire (souvent le meilleur recruteur), mais introduit un rôle transversal, des écrans dupliqués et un modèle mental plus lourd. Écarté pour la simplicité.

## Conséquences

- **Perte assumée** du canal prestataire→prestataire : un Prestataire qui veut recruter devrait passer par un compte Client distinct. Réouverture possible plus tard si le terrain le demande.
- **sitemap-pro.md §8 (AffiliéRéseau)** doit être retiré.
- **conceptual-model.md** : la définition « activé par un Client ou un Prestataire » devient « activé par un Client ».
- **ADR 0003**, conséquence n°2 : la section Pro ne couvre plus qu'AffiliéPartenaire (plus de section AffiliéRéseau côté Pro).
- **CONTEXT.md** : définition Affilié Réseau mise à jour (déjà fait).
