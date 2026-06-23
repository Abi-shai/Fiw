# Fiw

Application mobile multi-services de mobilité urbaine et de livraison, basée à Dakar, Sénégal.

Deux applications :
- **Fiw** — côté Client (passager ou expéditeur de colis)
- **Fiw Pro** — côté Prestataire (chauffeur ou livreur)

Une même personne peut utiliser les deux simultanément.

---

## Services

| Service | Description |
|---|---|
| Transport | Taxi voiture, taxi moto, covoiturage |
| Livraison | Vélo express, moto livraison, livraison groupée |
| Yobanté | Livraison interrégionale multi-prestataires |
| Assistance Routière | Dépannage, batterie, pneu, carburant, mécanique rapide |
| Location Longue Durée | Véhicules avec ou sans chauffeur, parkings |

---

## Ce repo

Dossier de projet design UX/UI + prototype interactif. Contient le glossaire domaine, le modèle conceptuel, la liste des fonctionnalités, les sitemaps, les signaux de recherche, les décisions de design (ADR), et un prototype React Native du flux Transport côté Client.

Conçu pour être travaillé avec Claude Code : `CLAUDE.md` charge le contexte nécessaire à chaque session.

---

## Structure

```
CLAUDE.md               Instructions pour les sessions Claude Code
CONTEXT.md              Glossaire canonique — termes officiels du projet et variantes à éviter
MEMORY.md               Carte des documents + état actuel du travail de design
skills-lock.json        Skills Claude Code installés dans ce projet

app/                    Prototype React Native — flux Transport côté Client
  app/                  Écrans (expo-router) : onboarding, accueil, transport/*
  components/           Composants partagés (Button, LeafletMap)
  constants/            Couleurs, données de démo (destinations Dakar, prestataire fictif)
  app.json              Config Expo (SDK 54)
  package.json          Dépendances — React Native 0.81.5, Expo SDK 54, Leaflet/OSM

docs/
  feature-list.md       Périmètre validé : toutes les fonctionnalités Fiw et Fiw Pro
  conceptual-model.md   Objets, relations, machines d'état, inventaire d'actions
  sitemap-client.md     Navigation complète app Fiw (côté Client) — 8 sections
  sitemap-pro.md        Navigation complète app Fiw Pro (côté Prestataire) — 9 sections
  user-needs.md         Besoins principaux par persona (Client + Prestataire), classés par priorité
  research-signals.md   Résultats clés des 9 entretiens pré-conception
  orient-audit.md       État couche par couche (framework Layers of Product Design)
  figma-make-brief.md        Brief Figma Make — vue générale
  figma-make-brief-fiw.md    Brief Figma Make — app Fiw (Client)
  figma-make-brief-fiw-pro.md Brief Figma Make — app Fiw Pro (Prestataire)
  adr/                  Décisions de design avec contexte et alternatives considérées
    0001-transport-priority-on-home.md
    0002-affiliepartenaire-account-switcher-in-fiw-app.md  (superseded par ADR 0003)
    0003-affiliepartenaire-dans-fiw-pro.md
```

---

## Lancer le prototype

```bash
cd app
npx expo start
```

Requiert **Expo Go SDK 54** sur Android ou iOS. Scanne le QR affiché dans le terminal.

Le prototype couvre le flux Transport complet côté Client : onboarding simulé → saisie destination → sélection gamme (Simple / Confort / Prestige / Moto / Covoiturage) → frais de rapprochement (Option A / B / C) → recherche prestataire → course active avec carte OpenStreetMap → reçu → notation.
