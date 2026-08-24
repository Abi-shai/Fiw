# Fiw — Correspondance Figma ↔ code

Table de correspondance entre les composants de la bibliothèque Figma
(`MsKt5tJdmMUWIDTRtPh6L1`) et les composants de `apps/fiw`.

## Pourquoi ce document et pas Code Connect

Code Connect exige un **siège Dev ou Full sur un plan Organization ou Enterprise**.
Le compte `dep.it@tolbico.com` est sur `starter` + `pro` — le serveur Figma refuse
explicitement l'appel :

> _You need a Dev or Full seat on an Organization or Enterprise plan to use Code Connect._

Ce document encode donc **exactement ce qu'un template Code Connect encoderait** :
le nœud Figma, ses axes de variantes, ses propriétés, le fichier de code cible et
la correspondance propriété → prop. Le jour où le plan le permet, la conversion en
`.figma.ts` est mécanique : chaque ligne devient un `instance.getEnum()` /
`getString()` / `getBoolean()` / `getInstanceSwap()`.

**Prérequis restants côté Figma**, dans l'ordre :

1. **Publier le fichier comme bibliothèque** — action manuelle, aucune API : Figma →
   menu Ressources → onglet Bibliothèques → _Publier_. Le plan `pro` l'autorise.
2. Passer un siège Dev/Full sur un plan Organization ou Enterprise.
3. Ajouter `@figma/code-connect` et un `figma.config.json` à la racine de `apps/fiw`,
   avec `"parser": "react"`, et `types: ["@figma/code-connect/figma-types"]` dans le
   `tsconfig.json`.

## Convention de lecture

- **Axes** = propriétés de variante (`VARIANT`). Une valeur Figma → une valeur de prop.
- **Props** = propriétés d'instance : `TEXT`, `BOOLEAN`, `INSTANCE_SWAP`.
- Un `—` en colonne code signale un composant **sans équivalent** : soit un artefact
  de maquette, soit un motif inline assumé comme Figma-only.

---

## 01 · Primitives

| Figma | Node | Axes | Props | Code |
|---|---|---|---|---|
| `Icon` | `133:638` | `Icon` (71) × `Weight=bold\|fill` | — | `components/Icon.tsx` — `name: IconName`, `weight` |
| `Illustration/Gamme` | `40:169` | `mobility option` (5) × `View=Default\|top view` | — | `constants/illustrations.ts` — `GAMME_ILLUSTRATIONS` / `TOPVIEW_ILLUSTRATIONS` |
| `Avatar` | `156:877` | `Size=48\|64` × `Bordered=false\|true` | `Initials:TEXT` | `components/Avatar.tsx` — `name`, `size` (px, cf. `AVATAR_ROW`/`AVATAR_CARD`), `bordered` |
| `AvatarStack` | `459:5` | — | — | `components/AvatarStack.tsx` — `items[]` |
| `Badge` | `84:82` | `Type=bienNote\|suggere` | — | `components/Badge.tsx` — `variant`, `label` |
| `Handle` | `84:83` | — | — | `Sheet.Handle` |
| `PlateChip` | `84:74` | — | `Plate:TEXT` | `components/PlateChip.tsx` — `plate` |
| `ProgressBar` | `453:17` | `Progress=0\|25\|50\|75\|100` | — | `components/ProgressBar.tsx` — `value` (0→1) / `progress` |
| `Radio` | `420:11` | `Selected=false\|true` | — | `components/Radio.tsx` — `selected`, `size` |
| `Divider` | `427:16` | `Retrait=0\|50\|76` | — | `components/Divider.tsx` — `inset` (px) |
| `FlagChip` | `451:4` | — | `Code ISO:TEXT`, `Repli code:BOOLEAN` | `components/FlagChip.tsx` — `code`, `width` |
| `CodeCell` | `453:18` | — | `Chiffre:TEXT` | — _(sous-vue interne de `CodePill`)_ |
| `Logo` | `458:1303` | — | — | `components/Logo.tsx` — `size` |
| `Scrim` | `459:15` | `Niveau=collapsed\|half\|full` | — | `components/Scrim.tsx` — `opacity` (interpolée) |
| `BrandSplash` | `459:16` | — | — | `components/BrandSplash.tsx` |
| `FauxQR` | `459:25` | — | — | `components/FauxQR.tsx` — `size` |

## 02 · Composants

| Figma | Node | Axes | Props | Code |
|---|---|---|---|---|
| `Button` | `83:83` | `Variant` (6) × `Size=lg\|md\|sm` | `Label:TEXT`, `Icon:BOOLEAN`, `Trailing:BOOLEAN`, `IconLeading`/`IconTrailing`:SWAP | `components/Button.tsx` — `label`, `variant`, `size`, `icon`, `trailingIcon` |
| `Button/State` | `414:1290` | `Variant` (6) × `State=Pressed\|Disabled\|Loading` | `Label:TEXT` | `Button.tsx` — `disabled`, `loading`, état pressé du `Pressable` |
| `IconButton` | `421:33` | `Variant=floating\|flat` | `Icon`:SWAP | `components/IconButton.tsx` — `variant`, `name`, `color` |
| `Chip` | `421:44` | `Active=false\|true` | `Label:TEXT`, `Icon:BOOLEAN` | `components/ChipGroup.tsx` — un élément de `items[]` + `value` |
| `Callout` | `421:47` | — | `Texte:TEXT`, `Icon`:SWAP | `components/Callout.tsx` — `icon`, `children` |
| `SettingsRow` | `428:46` | `Destructive=false\|true` | `Label`, `Subtitle`, `Value`:TEXT · `Sous-titre`, `Valeur`, `Icône`, `Chevron`:BOOLEAN · `IconName`:SWAP | `components/SettingsRow.tsx` — `label`, `subtitle`, `value`, `icon`, `chevron`, `destructive` |
| `SettingsGroup` | `430:34` | — | `Titre`, `Footnote`:TEXT + visibilités | `components/SettingsGroup.tsx` — `title`, `footnote`, `children` |
| `PlaceRow` | `429:41` | `Accent=false\|true` | `Title`, `Subtitle`:TEXT · `Sous-titre`, `Trailing`:BOOLEAN · `IconName`, `TrailingName`:SWAP | `components/PlaceRow.tsx` — `title`, `subtitle`, `icon`, `trailing`, `accent` |
| `PrestataireRow` | `87:74` | — | `Name`, `Initiales`, `Note`, `Courses`:TEXT · `Chevron`:BOOLEAN | `components/PrestataireRow.tsx` — `prestataire: Prestataire`, `onPress` |
| `VehicleBlock` | `87:88` | — | `Vehicle:TEXT`, `Illustration`:SWAP | `components/VehicleGroup.tsx` — `VehicleBlock` _(interne)_ — `prestataire`, `illu`, `art` |
| `VehicleGroup` | `431:520` | — | — | `components/VehicleGroup.tsx` |
| `SearchBar` | `470:150` | `variant=sheet\|floating` | `Placeholder:TEXT`, `Clear:BOOLEAN` | `components/SearchBar.tsx` — `value`, `placeholder`, `variant`, `onClear`, `trailing` |
| `ActionPill` | `86:83` | — | `Label:TEXT`, `Icône:BOOLEAN`, `IconName`:SWAP | `components/ActionPill.tsx` — `label`, `icon` |
| `InfoBanner` | `432:447` | `Tone=info\|warn` | `Texte:TEXT`, `IconName`:SWAP | `components/InfoBanner.tsx` — `tone`, `icon`, `children` |
| `RouteCard` | `441:93` | — _(composant simple)_ | `LibelléDépart`, `Départ`, `LibelléArrivée`, `Arrivée`:TEXT · `Edit`:BOOLEAN | `components/RouteCard.tsx` — `departure`, `destination`, `labels`, `icons`, `onEdit` |
| `ReceiptRow` | `443:81` | — | `Label`, `Valeur`:TEXT | `ReceiptCard.tsx` → fonction `Row` — `label`, `value` |
| `ReceiptCard` | `443:84` | — | `Titre`, `LibelléTotal`, `Total`:TEXT | `components/ReceiptCard.tsx` — `title`, `rows[]`, `lines[]`, `total`, `totalLabel` |
| `AltSuggestCard` | `89:85` | — | `Title`, `Meta`:TEXT · `Illustration`:SWAP · `Chevron`:BOOLEAN | `components/AltSuggestCard.tsx` — `title`, `subtitle`, `illu`, `badgeLabel` |
| `GammeCard` | `40:198` | `Illu` (5) × `State=Inactive\|Active` | `ETA`, `Prix`, `BadgeTexte`:TEXT · `Badge`:BOOLEAN | `components/GammeCard.tsx` — `label`, `eta`, `price`, `illu`, `badge`, `description`, `selected` |
| `OptionCard` | `88:112` | `State` × `Ton=success\|primary` | `Title`, `Bénéfice`, `Meta`, `Prix`:TEXT · `Icon`:SWAP | `RapprochementChoice.tsx` **et** `LivraisonModeChoice.tsx` — même carte |
| `CodePill` | `300:867` | — | `Chiffre 1…4`:TEXT | `components/CodePill.tsx` — `code: string` |
| `StepProgress` | `454:230` | `Étape=0\|1\|2\|3` | — | `components/StepProgress.tsx` — `steps[]`, `activeIndex` |
| `PhoneField` | `452:136` | `Rempli=false\|true` | `Indicatif`, `Numéro`:TEXT | `components/PhoneField.tsx` — `country`, `digits` |

## 03 · Patterns

| Figma | Node | Props | Code |
|---|---|---|---|
| `Sheet` | `425:2` | `Poignée:BOOLEAN` | `components/Sheet.tsx` — `handle`, `floating`, `sheetSurface` |
| `SheetCard` | `425:7` | — | `components/Sheet.tsx` — `SheetCard` |
| `SheetHeader` | `425:9` | `Titre:TEXT`, `Close:BOOLEAN` | `Sheet.SheetHeader` — `title`, `onClose` |
| `GroupedSheet` | `425:15` | — | `components/Sheet.tsx` — `GroupedSheet` — `children`, `handle` |
| `ScreenHeader` | `427:9` | `Titre:TEXT` | `components/ScreenHeader.tsx` — `title`, `onBack`, `right` |
| `MapSurface` | `107:222` | — | `components/LeafletMap.tsx` _(placeholder de maquette, pas un miroir)_ |

Les quatre feuilles composites — `CountryPicker`, `PaymentSheet`, `MenuDrawer`,
`WheelPicker` — sont des **compositions** sur cette page, pas des composants
paramétrés : chacune est une surface d'écran unique, assemblée à partir des
primitives ci-dessus. Elles n'ont donc pas de ligne de mapping : c'est leur contenu
qui est mappé.

---

## Écarts de nommage à traiter avant conversion

Un template Code Connect devra les absorber par un mapping `getEnum` explicite —
ou, mieux, ils se règlent en amont :

| Écart | Figma | Code | Note |
|---|---|---|---|
| Clés de gamme | `mobility option=vélo`, `auto-luxe` | `IlluKey = 'velo'`, `'luxe'` | L'axe `Illu` de `GammeCard` suit déjà le code (`velo`, `luxe`) ; c'est le jeu d'illustrations qui diverge. |
| Casse des badges | `Type=bienNote\|suggere` | `variant: 'bienNote' \| 'suggere'` | ✅ aligné depuis le 22 août 2026. |
| Langue des props | `Titre`, `Bénéfice`, `Prix`, `Poignée`… | `title`, `benefit`, `price`, `handle` | Les props Figma sont en français (langue de l'interface), le code en anglais. Assumé : le mapping est explicite dans le template. |
| ~~`DriverRow`~~ | `PrestataireRow` | `Prestataire` | ✅ **Résolu le 23 août 2026.** Le composant, le type `RideDriver` et le prop `driver` sont renommés des deux côtés — y compris le marqueur de carte et l'auteur des messages du chat. |
| `CodeCell` | composant | pas de composant | Motif inline dans `CodePill.tsx`. Soit l'extraire, soit assumer qu'il reste Figma-only. |

## Composants documentés mais jamais construits

✅ **Résolu le 23 août 2026.** `SearchBar` est construite **en code et en Figma**
(variantes `sheet` / `floating`) et les **trois** implémentations inline qui la
dupliquaient — `CountryPicker`, `livraison/configure`, `compte/lieu` — passent par
elle. `TopBar` est retiré du style guide au profit de `ScreenHeader`, qui tenait
déjà le rôle.

## Une exception au binding, délibérée

`Logo` garde ses couleurs de marque en dur (`#0066FF`, `#FFE347`, blanc). C'est une
marque, pas un composant thémable : le carré doit rester bleu même si le token
`primary` bouge. Ce sont les seules peintures non bindées de la bibliothèque.

---

## 04 · Écrans ↔ routes (23 août 2026)

Ajouté après la décomposition du set legacy `BottomSheet` (cf. inventaire, Partie X).
Jusque-là la page ne couvrait que Transport et les 7 états Livraison n'existaient
que comme variantes d'un composant classé « à migrer ».

Chaque écran porte sa feuille en clair, nommée `Sheet · <état>` — plus d'instance
de composant-écran.

### Transport

| Écran Figma | Node | Route | État |
|---|---|---|---|
| `Transport · Configurer la course` | `156:696` | `app/transport/configure.tsx` | |
| `Transport · Recherche` | `91:96` | `app/transport/searching.tsx` | `phase='searching'` |
| `Transport · Choix A-B` | `92:104` | `app/transport/searching.tsx` | `phase='frais'` |
| `Transport · Aucun prestataire` | `93:136` | `app/transport/searching.tsx` | `phase='none'` |
| `Transport · Prestataire trouvé` | `90:78` | `app/transport/course-active.tsx` | |
| `Transport · Chauffeur arrivé` | `481:484` | `app/transport/course-active.tsx` | arrivée — **créé le 23 août**, le 13ᵉ état n'avait aucun écran |
| `Transport · Clôture (avis)` | `104:215` | `app/transport/cloture.tsx` | |
| `Transport · Appel masqué` | `109:222` | `app/transport/call.tsx` | |
| `Transport · Chat` | `111:223` | `app/transport/chat.tsx` | |
| `Historique` | `112:223` | `app/history/index.tsx` | |
| ~~`Transport · En route`~~ | `94:150` | — | **périmé** — remplacé par `Prestataire trouvé`. Dit « conducteur » (_Avoid_), feuille rognée à 566 pour 779 de contenu |
| ~~`Transport · Arrivé`~~ | `100:182` | — | **périmé** — remplacé par `Chauffeur arrivé` |
| ~~`Transport · Course en cours`~~ | `102:202` | — | **périmé** |

### Livraison — créés le 23 août 2026

| Écran Figma | Node | Route | État |
|---|---|---|---|
| `Livraison · Méthode de livraison` | `479:1571` | `app/livraison/configure.tsx` | |
| `Livraison · Recherche` | `478:723` | `app/livraison/searching.tsx` | `phase='searching'` |
| `Livraison · Frais de rapprochement` | `479:727` | `app/livraison/searching.tsx` | `phase='frais'` |
| `Livraison · Groupage` | `479:1494` | `app/livraison/searching.tsx` | `phase='groupage'` |
| `Livraison · Attente groupage` | `479:1448` | `app/livraison/searching.tsx` | `phase='groupage_wait'` |
| `Livraison · Aucun prestataire` | `479:764` | `app/livraison/searching.tsx` | `phase='none'` |
| `Livraison · Suivi du colis` | `479:1717` | `app/livraison/suivi.tsx` | |

### Le set `BottomSheet` — 32 variantes (`03 · Patterns`, `486:1447`)

Reconstruit et étendu le 23 août 2026 (inventaire, Partie XI). Deux axes :
`Parcours=Accueil|Transport|Livraison` × `État` (20 valeurs). Il couvre **toutes**
les feuilles inférieures du Client, écrans et modales.

| `État` | Transport | Livraison | Source code |
|---|---|---|---|
| `Services` | — | — | `home.tsx` `mode='services'` (Accueil) |
| `Adresse` | ✓ | ✓ | `home.tsx` `mode='search'` + `SEARCH_COPY` |
| `Configure` | ✓ | ✓ | `transport/configure.tsx` · `livraison/configure.tsx` |
| `Recherche` | ✓ | ✓ | `searching.tsx` `phase='searching'` |
| `Frais` | ✓ | ✓ | `searching.tsx` `phase='frais'` |
| `Groupage` | — | ✓ | `livraison/searching.tsx` `phase='groupage'` |
| `Attente groupage` | — | ✓ | `livraison/searching.tsx` `phase='groupage_wait'` |
| `Aucun` | ✓ | ✓ | `searching.tsx` `phase='none'` |
| `Révélation` | ✓ | ✓ | `searching.tsx` `phase='reveal'` |
| `En route` | ✓ | ✓ | `course-active.tsx` `en_route` · `suivi.tsx` `vers_collecte` |
| `Arrivé` | ✓ | ✓ | `course-active.tsx` `arrived` · `suivi.tsx` `collecte` |
| `Arrivé · frais` | ✓ | — | `course-active.tsx` — bandeau `warn` hors grâce |
| `En cours` | ✓ | ✓ | `course-active.tsx` `in_progress` · `suivi.tsx` `vers_livraison` |
| `Remise` | — | ✓ | `suivi.tsx` `remise` |
| `Modale · Annuler` | ✓ | ✓ | `course-active.tsx:322` · `suivi.tsx:401` |
| `Modale · SOS` | ✓ | ✓ | `course-active.tsx:346` · `suivi.tsx:425` |
| `Modale · Paiement` | ✓ | ✓ | `configure.tsx` ×2 → `PaymentSheetContent` |
| `Modale · Décrire le colis` | — | ✓ | `livraison/configure.tsx:327` |
| `Modale · Destinataire (contacts)` | — | ✓ | `livraison/configure.tsx:367` |
| `Modale · Destinataire (saisie)` | — | ✓ | idem, repli manuel |

Matrice creuse assumée : 32 cases remplies sur 60. `finished` (Transport et
Livraison) n'a pas de variante — l'écran navigue, il n'affiche pas de feuille.

### Routes encore sans maquette

`phase='reveal'` des **deux** écrans `searching` · `app/livraison/cloture.tsx` ·
Affilié (11) · Compte (7) · `app/history/[id].tsx` · onboarding (3).
