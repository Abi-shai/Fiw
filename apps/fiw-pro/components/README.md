# Composants Fiw Pro — des copies, et trois originaux

L'essentiel de ce dossier vient de `apps/fiw/components/`, porté par
`scripts/sync-pro-components.py`. **Trois composants sont nés ici**, parce que
le Client n'a pas le besoin qu'ils couvrent :

| Composant | Pourquoi il n'existe pas côté Client |
|---|---|
| `CountdownButton` | Un bouton qui porte une **durée** et agit tout seul à l'expiration. Le Client ne met jamais son utilisateur sous chronomètre. |
| `MissionRequest` | La mission entrante : panneau **non refermable par accident**, là où toutes les feuilles du Client se ferment au tap sur le voile. |
| `MissionItineraire` | L'itinéraire **avec le Repère** (ADR 0009). `RouteCard` est spécifié en deux rangées de 38 px tronquées à une ligne ; un Repère y casserait ce contrat. |

Ils ne sont **pas** dans le manifeste du script : il ne les écrasera donc
jamais, et ne les signalera pas non plus comme divergents. Si l'un d'eux devait
servir au Client un jour, c'est l'inverse qu'il faudrait faire — le remonter
dans `apps/fiw/components/` et l'ajouter au manifeste.

## La règle

**Le Client fait source.** Une correction de composant se fait **côté Client**,
puis on relance le portage :

```bash
python3 scripts/sync-pro-components.py            # rapporte les écarts
python3 scripts/sync-pro-components.py --apply    # aligne sur le Client
```

Les **jetons** (`../constants/`) suivent une règle plus stricte encore : ils
sont **générés** (`scripts/gen-pro-tokens.py`) et ne s'éditent jamais à la main,
dans aucune des deux apps côté Pro. Seule la famille primaire diffère — blue800
au lieu de blue700, et hover/pressed/subtle qui suivent.

## Pourquoi des copies plutôt qu'un paquet partagé

L'[ADR 0004](../../../docs/adr/0004-design-system-package-partage.md) prévoit
`packages/tokens` + `packages/ui` consommés par les deux apps. Il n'est pas
construit, et le dépôt n'a aujourd'hui ni workspaces ni `metro.config.js` :
le monter demande de toucher au bundling des deux applications.

Décision du 7 novembre 2026 : **extraire d'abord les jetons** (une seule source,
générée), **garder les composants dupliqués** le temps de la v1 Pro, et migrer
les composants ensuite. Les jetons sont ce qui diverge le plus vite et coûte le
moins cher à partager ; un composant mérite d'avoir servi deux fois avant qu'on
sache ce qui doit vraiment être commun.

## Ce que ça coûte, et comment on le surveille

Le risque est la divergence **silencieuse** — exactement ce qu'il a fallu six
semaines de passes pour résorber côté Affiliation. Le script le rend visible :
lancé sans `--apply`, il liste les fichiers du Pro qui ne sont plus identiques à
leur source.

Un fichier qui diverge n'est pas une faute en soi : l'app Pro rencontrera des
besoins que le Client n'a pas. **Mais une divergence doit être une décision, pas
une surprise.** Si elle se généralise, c'est le signal que le composant doit
remonter dans `packages/ui` — c'est-à-dire qu'il est temps d'exécuter l'ADR 0004.

## Ce qui n'est pas porté, et pourquoi

Le manifeste du script porte 45 composants sur les 58 du Client. Les exclus y
sont listés avec leur raison — pour l'essentiel : ce qui est adossé aux données
du Client (`PaymentSheet`, `LivraisonModeChoice`), ce qui est une **vue Client
d'un Prestataire** (`PrestataireRow`, `VehicleGroup`, `AvatarStack`), et ce qui
appartient à des services hors v1 (`CodePill`, `AltSuggestCard`, `WheelPicker`).

On en ajoute au moment où un écran le demande — pas « au cas où ».
