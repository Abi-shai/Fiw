---
status: accepted
---

# Design System dans un package partagé (monorepo workspaces)

## Contexte

Fiw (client) et Fiw Pro (prestataire) sont deux projets Expo indépendants. Les composants et tokens étaient copiés-collés d'une app à l'autre (`Button.tsx`, `LeafletMap.tsx`, `colors.ts`, `data.ts` dupliqués), et le `style-guide.md` avait déjà divergé de l'implémentation (icônes Lucide jamais installées, Poppins jamais chargé, rayons et ombres différents). Cette dérive est exactement le « rendu à côté de la plaque » qu'on veut éliminer.

## Décision

Mettre en place un **monorepo à workspaces** (npm/yarn workspaces + config Metro Expo, **sans Nx/Turborepo** pour 2 apps) avec un Design System partagé :

- `packages/tokens/` — foundations (couleurs, typographie, espacement, rayons, ombres, icônes).
- `packages/ui/` — `components/` (atomes + molécules) et `patterns/` (organismes), suivant un **Atomic Design pragmatique à 3 niveaux**. Templates/pages restent les routes Expo de chaque app.

Construction **client-first** : on code le package + migre les écrans Transport de Fiw client ; Fiw Pro est migré plus tard. Le `style-guide.md` est réécrit pour refléter les décisions réelles.

## Conséquences

- Source unique de vérité : modifier un token ou un composant se répercute sur les deux apps, plus de re-divergence par copier-coller.
- Coût initial : mise en place du monorepo (workspaces + Metro `watchFolders`/`nodeModulesPaths`), et retravail des composants déjà créés dans `apps/fiw` (`Sheet`, `PlaceRow`, `IconButton`) pour les déplacer dans `packages/ui`.

## Choix techniques liés

Décidés en même temps (réversibles, donc non bloquants mais notés ici) : icônes **Phosphor** (`phosphor-react-native`) exposées via un atome `Icon` ; typographie **Poppins** (`@expo-google-fonts/poppins`) via un atome `Text` ; bottom sheets sur **`@gorhom/bottom-sheet`** enveloppé. Détails et conventions dans [`style-guide.md`](../style-guide.md).
