# Fiw — Sitemap (client)

> Cartographie des places et de la navigation de l'app Fiw (côté Client).
> Construit lors des sessions de design IA (juin 2026), couche "structure d'interaction" — au-dessus du modèle conceptuel, avant les flows détaillés.
>
> **Fiw Pro et le contexte AffiliéPartenaire** sont traités séparément (mêmes patterns, scopes distincts).

---

## Home (contexte Client)

```
Home
├─ [Avatar ↑] → switcher de compte Client ↔ AffiliéPartenaire
│              (visible uniquement si compte Partenaire validé)
│
├─ [Tile prioritaire] Transport + barre de recherche destination
│   └─ → Flux Transport (voir ci-dessous)
│
├─ [Grille d'icônes]
│   ├─ Livraison
│   ├─ Yobanté
│   ├─ Assistance Routière
│   ├─ Location Longue Durée → browse → Mes réservations
│   └─ Transport de marchandises (coming-soon, placeholder)
│
├─ Bande recents / [Commande en cours]
│   └─ Si une Commande est active : remplacée par carte statut live + accès suivi
│
├─ Bannière Affiliation
│   ├─ État défaut → Écran de choix
│   │   ├─ AffiliéRéseau → accepter CGU → rôle actif
│   │   │   └─ Bannière disparaît + "Mon espace Affilié" apparaît dans ≡ menu
│   │   └─ AffiliéPartenaire → formulaire onboarding → soumission
│   │       └─ Bannière passe en état "En attente"
│   ├─ État "En attente" → écran détail dossier Partenaire
│   └─ État validé → bannière disparaît + switcher avatar s'active
│
├─ [SOS] bouton flottant persistant (global, toutes pages)
│
└─ ≡ Menu hamburger
    ├─ Fidélité
    ├─ Historique → (lien vers Mes réservations, ne les absorbe pas)
    ├─ Paramètres
    ├─ Profil
    └─ [conditionnel] Mon espace Affilié (si rôle AffiliéRéseau actif)
```

---

## Flux Transport

```
Transport
├─ Destination saisie (depuis home)
├─ Choix de mode : Voiture / Moto / Covoiturage
│   ├─ Voiture → Écran gamme : Économique / Confort / Prestige (prix estimés côte à côte)
│   ├─ Moto → direct
│   └─ Covoiturage → Offres filtrées sur destination déjà saisie
│       └─ Affiner date/heure → Choisir Offre → Réserver siège
├─ [Cas nominal] Prix estimé → Confirmation → En recherche → Suivi live
└─ [Si déclenché] Option A / B / C → Confirmation → En recherche → Suivi live
```

---

## Flux non encore détaillés

Les services suivants ont leur place dans la grille home mais leurs flows internes
n'ont pas encore été cartographiés :

- **Livraison** (Vélo Express / Moto Livraison / Livraison groupée)
- **Yobanté** (multi-legs, multi-Prestataires)
- **Assistance Routière** (types de problème : Dépanneuse / Batterie / Pneu / Carburant / Mécanique)
- **Location Longue Durée** (browse véhicules / parkings → Mes réservations)

Les internals du menu hamburger (Fidélité, Historique, Paramètres, Profil)
ne sont pas encore cartographiés non plus.

---

## Prochaine étape : User Story Map

La prochaine session de travail IA reprendra avec la **user story map** —
chaque service et chaque flux ci-dessus sera décliné en user stories ordonnées
(backbone → walking skeleton → scope releases), avec les flows utilisateurs
complets et nettoyés pour chaque branche.

Ordre suggéré :
1. Flows complets des services (Livraison, Yobanté, Assistance, Location)
2. Menu hamburger internals
3. Contexte AffiliéPartenaire (home et navigation propres)
4. Fiw Pro (sitemap + user story map côté Prestataire)
