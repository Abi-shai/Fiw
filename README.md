# Fiw

Application mobile multi-services de mobilité urbaine et de livraison, basée à Dakar, Sénégal. Principal concurrent : Yango.

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

Dossier de projet design UX/UI — pas de code. Contient le glossaire domaine, le modèle conceptuel, la liste des fonctionnalités, le sitemap, les signaux de recherche et les décisions de design (ADR).

Conçu pour être travaillé avec Claude Code : `CLAUDE.md` charge le contexte nécessaire à chaque session.

---

## Structure

```
CLAUDE.md               Instructions pour les sessions Claude Code
CONTEXT.md              Glossaire canonique — termes officiels du projet et variantes à éviter
MEMORY.md               Carte des documents + état actuel du travail de design
skills-lock.json        Skills Claude Code installés dans ce projet

docs/
  feature-list.md       Périmètre validé : toutes les fonctionnalités Fiw et Fiw Pro
  conceptual-model.md   Objets, relations, machines d'état, inventaire d'actions
  sitemap.md            Structure de navigation de l'app Fiw (côté Client)
  research-signals.md   Résultats clés des 9 entretiens pré-conception
  orient-audit.md       État couche par couche (framework Layers of Product Design)
  adr/                  Décisions de design avec contexte et alternatives considérées
```

