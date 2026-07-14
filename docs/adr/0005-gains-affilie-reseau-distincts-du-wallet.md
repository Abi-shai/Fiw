# ADR 0005 — Gains de l'Affilié Réseau : réserve distincte du Wallet, encaissable uniquement

**Date :** 2026-07-13
**Statut :** Décidé

## Contexte

Il fallait trancher comment l'Affilié Réseau perçoit et utilise sa commission de 2 %. Le meeting client du 27 juin 2026 a acté un retrait cash via Mobile Money, avec un tableau de bord présenté comme un « wallet ».

Deux problèmes :

1. **Collision de vocabulaire.** `CONTEXT.md` réserve **Wallet** au Prestataire (Fiw Pro), avec un flux **inverse** : le Wallet sert à *payer Fiw* (commission de 14 % débitée ; Wallet vide = accès bloqué). L'argent de l'affilié fait le contraire : il *accumule* les 2 % et se *retire* vers Mobile Money.
2. **Scénario piège.** L'Affilié Réseau est un rôle activable sur un compte Client *ou Prestataire* existant. Un Prestataire qui est aussi Affilié Réseau détiendrait donc, dans Fiw Pro, **deux réserves de flux opposés** en même temps. Les nommer toutes deux « wallet » les rendrait indistinguables.

Restait aussi ouvert : les commissions de l'affilié sont-elles dépensables in-app (payer une course) ou seulement encaissables ?

## Décision

- Terme canonique distinct : **Gains** — l'argent accumulé par l'Affilié Réseau à partir de sa commission de 2 %. On **n'élargit pas** Wallet.
- Les Gains sont **encaissables uniquement via Mobile Money**, **jamais dépensables in-app** — l'usage in-app de la valeur reste propre aux Points Fidélité.
- **Solde** devient un mot transversal : le *montant courant/retirable* d'une réserve (Wallet, Gains, Points Fidélité), jamais le nom d'une réserve.

## Alternatives écartées

- **Élargir Wallet aux deux rôles** — rejeté à cause du scénario Prestataire + Affilié Réseau : un même mot désignerait deux réserves de sens opposé (payer Fiw vs retirer vers Mobile Money).
- **Cagnotte / Solde Affiliation** comme terme — Cagnotte trop informel pour la marque ; « Solde Affiliation » redondant avec le mot transversal Solde. **Gains** prolonge le CTA existant « Gagner de l'argent ».
- **Dépense in-app des Gains** (payer une course avec ses commissions) — jamais demandée, et rebrouillerait Gains ↔ Wallet. Garder deux lignes produit nettes : Fidélité = valeur in-app gagnée en *dépensant* ; Gains = cash gagné en *recrutant*.

## Conséquences

- `CONTEXT.md` porte **Gains** et **Solde** ; **Wallet** reste réservé au Prestataire.
- `conceptual-model.md` §AffiliéRéseau : attribut **Solde des Gains** + action **Retirer** (Gains → Mobile Money), sans entité propre (réserve scalaire portée par le compte).
- Le retrait cash est le **modèle cible (long terme)**. Au lancement, le paiement sera vraisemblablement **différé** (phase « Affilié Fondateur », d'abord formulée « Partenaire Fondateur » — renommée pour éviter la collision avec Affilié Partenaire) ; la date de bascule est une décision Blaise & Daniel, à définir.
- **Seuil minimum de retrait** : à définir (Blaise & Daniel).
