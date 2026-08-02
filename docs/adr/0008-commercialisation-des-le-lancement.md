# ADR 0008 — Commercialisation dès le lancement : Gains et commissions perçus et retirables dès le premier jour

**Date :** 2026-07-26
**Statut :** Décidé

## Contexte

La conception du programme d'affiliation supposait une **phase de lancement à
paiement différé** : au démarrage, les commissions de l'Affilié Réseau seraient
*comptabilisées* mais le retrait cash *bloqué* jusqu'à un « lancement officiel »
ultérieur. Cette hypothèse était inscrite dans plusieurs surfaces :

- `ADR 0007`, conséquence n°3 (« au lancement, paiement vraisemblablement différé ;
  date de bascule à définir »).
- Un statut dédié **Affilié Fondateur** (reconnaissance de la cohorte de lancement)
  et son état de lifecycle **Membre Fondateur** (gains comptabilisés, retrait bloqué).
- `feature-list.md`, `conceptual-model.md`, `breadboard-affilie-reseau.md`, et le
  proto (`constants/affilie.ts` `state: 'fondateur'`, `dashboard.tsx`, drawer).

La décision produit change cette hypothèse : **l'app est commercialisée dès le
départ**. Il n'y a pas de phase pilote à paiement différé.

## Décision

- **Les Gains et les commissions sont perçus ET retirables dès le lancement** (au
  premier jour), au-dessus du seuil minimum de retrait. Plus de comptabilisation
  sans versement, plus de « bascule » ultérieure.
- **Le statut « Fondateur » est abandonné** — ni « Affilié Fondateur » ni « Membre
  Fondateur », ni badge, ni phase de lancement. Ces termes sont **retirés** du
  vocabulaire canonique (cf. `CONTEXT.md`).
- **Le lifecycle de l'Affilié Réseau se réduit à `Actif → Gelé`** — `Gelé` étant la
  suspension pour cause (retrait bloqué + contact support), mécanique **distincte** et
  conservée.

## Alternatives écartées

- **Garder « Affilié Fondateur » comme badge honorifique** (reconnaissance
  early-adopter sans effet sur l'argent) — écarté : le statut n'avait de sens que pour
  justifier le blocage de retrait ; sans lui, il ne porte plus de règle, seulement du
  bruit. Réintroductible plus tard comme pur objet marketing si le besoin émerge.

## Conséquences

- **Amende `ADR 0007`** (conséquence n°3, désormais caduque). Le reste d'ADR 0007
  (Gains ≠ Wallet, encaissables uniquement, Solde transversal) **reste valable**.
- `CONTEXT.md` — « Affilié Fondateur » et « Membre Fondateur » remplacés par une note
  de termes retirés ; lifecycle `Actif → Gelé`.
- Docs recalés : `feature-list.md`, `conceptual-model.md`, `breadboard-affilie-reseau.md`,
  `MEMORY.md`.
- Proto recalé : `constants/affilie.ts` (`AffilieState = 'actif' | 'gele'`),
  `app/affilie/{dashboard,conditions}.tsx`, `components/MenuDrawer.tsx` (toggle démo à
  2 états, note « Retrait bientôt disponible » supprimée).
- **Seuil minimum de retrait** : le proto utilise **1 000 F CFA** (convention de
  conception, cohérente sur tout le proto) ; la valeur définitive reste à confirmer
  (Blaise & Daniel). Non tranchée par cet ADR.
