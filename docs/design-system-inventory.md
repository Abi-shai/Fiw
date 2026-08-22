# Fiw — Inventaire du Design System (22 août 2026)

État des lieux avant la construction de la bibliothèque Figma. Compare les **quatre**
sources qui prétendent aujourd'hui décrire le même système :

| # | Source | Fraîcheur | Rôle réel aujourd'hui |
|---|---|---|---|
| 1 | `apps/fiw/constants/*` + `apps/fiw/components/*` | **La plus à jour** | Ce qui tourne réellement dans le proto Client |
| 2 | `apps/fiw-pro/constants/*` + `components/*` | Retard | Copie partielle, palette primaire différente |
| 3 | `docs/style-guide.md` | À jour en prose, partiellement **aspirationnel** | Décisions de design (règles formulaires, motion, rôles couleur) |
| 4 | `docs/style-guide.tokens.json` | **Périmée** | Lucide, boutons 52/44 px, pas de `displayXl`, pas de jaune de marque |
| 5 | Figma `MsKt5tJdmMUWIDTRtPh6L1` | Partielle | 25 variables / 42, 8 styles de texte, 23 composants / ~55 |

**Constat central** : il n'y a pas de source unique de vérité. Le code est la version
la plus avancée ; Figma en est un instantané d'il y a plusieurs itérations ; le
`tokens.json` est mort. La bibliothèque Figma doit devenir la source **design**,
alignée sur le code, et le `tokens.json` doit être régénéré ou retiré.

ADR de référence : [0004 — Design System dans un package partagé](adr/0004-design-system-package-partage.md)
(accepté, **non encore implémenté** : `Button.tsx`, `Icon.tsx`, `Sheet.tsx`, `colors.ts`
sont toujours dupliqués entre `apps/fiw` et `apps/fiw-pro`).

---

## 1. Fondations

### 1.1 Couleur

Collection Figma actuelle : **`Fiw Colors`**, 1 mode (`Mode 1`, non nommé), 25 variables,
**valeurs brutes sans alias** (`primaryPressed` et `blue900` portent deux fois `#0D459B`
au lieu que l'un pointe vers l'autre).

| Présent dans Figma (25) | Manquant (17) |
|---|---|
| primary · primaryPressed · primarySubtle · brandYellow · blue100 · blue900 · bg · surface · surfaceAlt · track · border · borderSubtle · gray700 · textPrimary · textSecondary · textTertiary · textDisabled · textOnPrimary · error · errorSubtle · warning · warningSubtle · success · successSubtle · hairline | **primaryHover · primaryFill · primaryInk · primaryOn** · **brandYellow100 · brandYellowSubtle** · **blue50 · blue200 · blue300 · blue400 · blue500 · blue600 · blue700 · blue800 · blue950** · **gray600** · **errorPressed** |

Manques structurels :

- **Pas de tier primitives / sémantique.** Tout est à plat, donc rien n'est aliasé et
  un changement de palette se fait 3 fois à la main.
- **Pas de mode par application.** `docs/style-guide.tokens.json` prévoyait déjà
  `color.app.fiw` / `color.app.fiw-pro` ; le code confirme : Fiw Pro tourne sur
  `primary #084EC5` (= `blue800`), `primarySubtle #D6EDFF` (= `blue100`),
  `primaryPressed #0E2B5D` (= `blue950`). Les 5 tokens `primary*` sont les **seuls**
  qui diffèrent entre les deux apps.
- **Tokens Fiw Pro absents du fichier** : `online`, `offline`, `walletLow`, `overlay`
  (+ les alias legacy `white`, `black`, `primaryLight`, `background`, `warningLight`
  qui, eux, sont à supprimer du code).
- **`scopes` trop larges** : les 24 variables couleur portent
  `FRAME_FILL, SHAPE_FILL, TEXT_FILL, STROKE_COLOR` sans distinction. Un token de
  texte ne devrait pas être proposé comme fond de frame.

### 1.2 Typographie

8 styles de texte `Fiw/*` — famille **Outfit**, échelle conforme au code.

| Style | Figma | Code (`constants/typography.ts`) | Écart |
|---|---|---|---|
| `Fiw/displayXl` | Bold 40 / 48 px | Bold 40 / 48 | ✅ |
| `Fiw/display` | Bold 28 / 36 px | Bold 28 / 36 | ✅ |
| `Fiw/heading1` | SemiBold 22 / 29 px | SemiBold 22 / 29 | ✅ |
| `Fiw/heading2` | SemiBold 18 / 23 px | SemiBold 18 / 23 | ✅ |
| `Fiw/body` | Regular 15 / **AUTO** | Regular 15 / **24** | ❌ interlignage |
| `Fiw/bodySmall` | Regular 13 / **AUTO** | Regular 13 / **21** | ❌ interlignage |
| `Fiw/label` | Medium 13 / **AUTO** | Medium 13 / **18** | ❌ interlignage |
| `Fiw/caption` | Regular 11 / 15 px | Regular 11 / 15 | ✅ |

Absent : aucune variable de taille / graisse / famille, donc pas de thème typo pilotable.
Absents aussi du système : les traitements récurrents documentés mais non tokenisés —
capitales de section (`textTransform: uppercase` + `letterSpacing` 0.5 → 0.8 selon les
composants : `ReceiptCard` 0.5, `SettingsGroup` 0.8 — **incohérence à trancher**).

### 1.3 Espacement — **absent de Figma**

Base 4 px, 9 paliers dans le code (`Spacing[n] = n × 4`) :
`0 · 1 (4) · 2 (8) · 3 (12) · 4 (16) · 6 (24) · 8 (32) · 12 (48) · 16 (64)`.

Aucune variable `FLOAT` dans Figma → tous les paddings et gaps des composants existants
sont des nombres codés en dur.

### 1.4 Rayons — **absent de Figma**

`sm 8` (tags, badges) · `md 12` (boutons, champs, cards) · `lg 16` (grandes cards)
· `xl 28` (bottom sheets, modals) · `pill 999`.

`docs/style-guide.tokens.json` n'en connaît que 3 (`sm/md/lg`) — périmé.
Valeurs orphelines dans le code, à réintégrer ou à assumer comme exceptions :
`CARD_RADIUS = 20` (`RideSheet.tsx`), `FlagChip` rayon 3, `PaymentSheet` `payIllo` 14.

### 1.5 Élévation — **absent de Figma (0 style d'effet)**

5 ombres dans le code, **teintées bleu marque** sauf `float` :

| Token | Offset Y | Flou | Opacité | Couleur | Usage |
|---|---|---|---|---|---|
| `sm` | 1 | 3 | 0.08 | `#0066FF` | cards posées |
| `md` | 4 | 12 | 0.12 | `#0066FF` | cards flottantes |
| `lg` | 8 | 24 | 0.16 | `#0066FF` | modals |
| `sheet` | **−6** | 24 | 0.14 | `#0066FF` | bottom sheets (vers le haut) |
| `float` | 5 | 18 | 0.24 | `#0B1220` | éléments sur la carte |

Note : Fiw Pro teinte ses ombres en `#084EC5` → l'ombre est aussi **dépendante du mode**.

### 1.6 Icônes

| | Figma | Code |
|---|---|---|
| Jeu nommé | `Icon` (set de **44** variantes) | `components/Icon.tsx` — **72** noms |
| Doublons | `Icon/Hourglass`, `Icon/Lightning` (composants séparés **et** variantes du set) | — |
| Source | dessins locaux | Phosphor `bold` par défaut, `fill` pour les états actifs |
| Tailles | 24 px uniquement | 16 inline / 18 boutons / 24 flottant |

**28 icônes du code absentes de Figma.** Le set Figma n'a ni propriété de taille
ni propriété de poids (`bold` / `fill`), pourtant les deux sont normatifs dans
`style-guide.md`.

### 1.7 Illustrations

Set `icons` (nœud `40:169`) — mal nommé — 5 gammes × 2 vues
(`moto`, `auto`, `covoiturage`, `vélo`, `auto-luxe`) × (`Default` isométrique,
`top view`). Correspond exactement à `GAMME_ILLUSTRATIONS` / `TOPVIEW_ILLUSTRATIONS`.
✅ Aligné, à renommer.

Hors système, encombrant la page : 8 frames d'exploration « Hand with Cash » /
« Piste 1-2-3 » (personnage, parrainage, récompenses), dont des `[Vectorized]` en double.

### 1.8 Absents de tout le système

Grille de mise en page (aucun `GridStyle`) · tokens de motion (les springs et durées
sont documentés en prose dans `style-guide.md` §Transitions, jamais tokenisés) ·
opacités · durées.

---

## 2. Composants

### 2.1 Les 23 composants Figma existants

| Figma | Propriétés Figma | Contrepartie code | Verdict |
|---|---|---|---|
| `Button` (set) | `Label`, `Variant[primary/secondary/destructive/destructiveFilled]` | `Button.tsx` — **6** variantes × **3** tailles + `icon`/`trailingIcon`/`loading`/`disabled` | ⚠️ **Le plus en retard** : manque `link`, `linkDestructive`, l'axe `Size`, les états et les slots d'icône |
| `Avatar` (set) | `Initials`, `Size[Default\|2]` | `Avatar.tsx` (`name`, `size`, `bordered`) | ⚠️ Nommage non systémique (`2` ?), `bordered` absent |
| `Badge` (set) | `Type[BienNote\|Suggere]` | `RideSheet.Badge` (`bienNote`/`suggere`) | ✅ Casse et accents à aligner |
| `Icon` (set) | `Icon[44]` | 72 icônes | ⚠️ 28 manquantes, pas de taille ni de poids |
| `icons` (set) | `mobility option[5]` × `View[2]` | `constants/illustrations.ts` | ✅ À renommer `Illustration/Gamme` |
| `Taxi Moto` (set) | `service name`, `price`, `gamme`, `State[Active/Inactive]` | `GammeCard.tsx` (`label`, `eta`, `price`, `illu`, `badge`, `description`, `selected`) | ⚠️ Mal nommé (un service, pas un composant) + incomplet |
| `OptionCard` (set) | `Title`, `Benefit`, `Meta`, `Price`, `Icon`, `State[Active/Inactive]` | `RapprochementChoice.tsx` **et** `LivraisonModeChoice.tsx` | ⚠️ Un composant Figma, deux implémentations code |
| `BottomSheet` (set) | `State[13 valeurs]` | `Sheet.tsx` + `RideSheet.GroupedSheet` + contenu d'écran | ❌ **Pas un composant** : 13 états d'écran empaquetés en variantes |
| `PlaceRow` | `Title`, `Subtitle` | `PlaceRow.tsx` (`icon`, `accent`, `subtitleAccent`, `trailing`) | ⚠️ Manque icône, trailing, accents |
| `DriverRow` | `Name` | `RideSheet.DriverRow` (`name`,`vehicle`,`color`,`plate`,`rating`,`trips`) | ⚠️ Incomplet — **et nom à trancher** (voir §4) |
| `VehicleBlock` | `Vehicle` | `RideSheet.VehicleBlock` (`driver`, `illu`, `art`) | ⚠️ Incomplet |
| `AltSuggestCard` | `Title`, `Meta` | `RideSheet.AltSuggestCard` (+ `illu`, `badgeLabel`) | ⚠️ Manque illustration + badge |
| `Banner` | `Label` | `RideSheet.InfoBanner` (`icon`, `tone`) | ⚠️ Manque `tone` et l'icône ; **nom divergent** |
| `ActionPill` | `Label` | `RideSheet.ActionPill` (`label`, `icon`) | ⚠️ Manque le slot icône |
| `PlateChip` | `Plate` | `RideSheet.PlateChip` | ✅ |
| `ProgressBar` | — | `RideSheet.ProgressBar` (`progress`, `value`) | ⚠️ Aucune propriété exposée |
| `StepProgress` | — | `StepProgress.tsx` (`steps`, `activeIndex`) | ⚠️ Aucune propriété exposée |
| `CodePill` | — | `CodePill.tsx` (`code`) | ⚠️ Aucune propriété exposée |
| `Handle` | — | `Sheet.Handle` | ✅ |
| `IconAction` (set) | `Icon[Phone\|Chat]` | `IconButton.tsx` (`floating`/`flat`, 72 icônes) | ❌ Remplacé par `IconButton` |
| `Icon/Hourglass` | — | doublon du set `Icon` | ❌ À supprimer |
| `Icon/Lightning` | — | doublon du set `Icon` | ❌ À supprimer |
| `MapBackground` | — | `LeafletMap.tsx` | 🟡 Placeholder de maquette, pas un composant de DS |

Bilan : **4 alignés**, **14 en retard sur le code**, **4 à retirer ou refondre**, 1 hors périmètre.
**Aucun des 23 ne porte de description** → bibliothèque non documentée.

### 2.2 Composants du code absents de Figma (32)

**Atomes / molécules**
`Text` (le ramp typo lui-même) · `IconButton` (`floating`/`flat`) · `Radio` ·
`ChipGroup` (+ chip actif/inactif) · `Callout` · `FlagChip` · `Logo` · `Scrim` ·
`FauxQR` · `HandWithCash`

**Formulaires**
`PhoneField` · `CountryPicker` (feuille 3 crans + recherche + liste monde) ·
`WheelPicker`

**Listes & cartes**
`SettingsRow` (+ variante destructive) · `SettingsGroup` · `ReceiptCard` ·
`RouteCard` · `TotalBar` · `GammeCard` · `LivraisonModeChoice` · `RapprochementChoice` ·
`AvatarStack` · `VehicleGroup`

**Surfaces & patterns**
`Sheet` / `sheetSurface` / `SheetHeader` · `SheetCard` · `GroupedSheet` ·
`BottomSheet` (wrapper animé) · `MenuDrawer` · `PaymentSheet` · `ScreenHeader` ·
`BrandSplash` · `LeafletMap`

**Documentés dans `style-guide.md` mais construits nulle part** : `SearchBar`, `TopBar`.
(`ScreenHeader` joue le rôle de `TopBar` sans en porter le nom.)

### 2.3 Écrans (page « UI Designs »)

13 écrans Transport maquettés + 6 explorations (`Explo A/B/C`, `Frais · Explo A/B/C`).
Côté code, **36 routes** existent dans `apps/fiw/app/` : Transport (6), Livraison (4),
Affilié (11), Compte (7), Historique (2), onboarding (3). **Livraison, Affilié et
Compte n'ont aucune maquette Figma** — seul le set `BottomSheet` porte 7 états Livraison.

---

## 3. Hygiène du fichier Figma

| Problème | Détail |
|---|---|
| Pas d'architecture de pages | 23 composants + 8 explorations d'illustration + placeholders sur **une seule** page `Style guide / Components` |
| Conventions de nommage mélangées | `PascalCase` (`DriverRow`) · `slash` (`Icon/Hourglass`) · `minuscule` (`icons`) · **espaces** (`Taxi Moto`) |
| Langues mélangées dans les variantes | `State=On his way`, `Arrived` (anglais) vs `Recherche`, `Aucun`, `Configure` (français) dans **le même set** |
| Accents perdus | `Suggere` → `Suggéré`, `BienNote` → `Bien noté` |
| Aucune description | 0 / 23 composants documentés |
| Bibliothèque non publiée | Le fichier n'est pas publié comme library → pas de consommation propre, Code Connect fragile |
| Mode de variables non nommé | `Mode 1` |
| Explorations mêlées au système | `Piste 1/2/3`, `[Vectorized]` en doublon, `image 1`, `image 2`, `Group 1`, `Group 2` |

---

## 4. Points de vocabulaire (`CONTEXT.md`)

- **`DriverRow` / `RideDriver`** — `CONTEXT.md` autorise « chauffeur » **dans la copie
  d'interface du flux Transport** mais le proscrit comme **terme de domaine** (docs,
  modèle, code, commentaires). Le composant et le type violent donc la règle : le nom
  canonique serait `PrestataireRow` / `Prestataire`. À trancher — la décision engage
  le code autant que Figma.
- **`OptionCard`** — bon nom : `Option A` / `Option B` sont canoniques. Mais l'état
  `Aucun prestataire` **n'est pas une option** (cul-de-sac) ; il ne doit pas devenir
  une variante de ce composant.
- **`Taxi Moto`** comme nom de composant — c'est un **service**, pas un objet
  d'interface. Le composant s'appelle `GammeCard` dans le code.
- **`Banner` vs `InfoBanner`** — deux noms pour un objet. En choisir un.
- **`Badge` `BienNote` / `Suggere`** — à réaccentuer.

---

## 5. Chiffres

| | Figma | Code | Écart |
|---|---|---|---|
| Variables couleur | 25 | 42 | **−17** |
| Modes | 1 | 2 apps | **−1** |
| Styles de texte | 8 (3 à corriger) | 8 | ≈ |
| Variables d'espacement | 0 | 9 | **−9** |
| Variables de rayon | 0 | 5 | **−5** |
| Styles d'effet (ombres) | 0 | 5 | **−5** |
| Icônes | 44 | 72 | **−28** |
| Illustrations | 10 | 10 | ✅ |
| Composants / sets | 23 | ~55 | **−32** |
| Composants documentés | 0 | — | — |

---

# Partie II — Construction de la bibliothèque Figma (22 août 2026)

Décisions actées avant construction :

| Question | Décision |
|---|---|
| Portée | **Fiw seul, prêt pour les modes** — primitives + sémantique aliasée, mode unique `Fiw`. Un mode `Fiw Pro` s'ajoute plus tard sans refonte (seuls les 5 tokens `primary*` diffèrent). |
| Emplacement | **Nouvelles pages dans le fichier existant** `MsKt5tJdmMUWIDTRtPh6L1` — aucune instance d'écran à relier. |
| BottomSheet 13 états | **Décomposer, garder le legacy vivant** — les primitives sont construites, le set à 13 états reste sur `98 · Legacy` pour ne rien casser. |
| Nommage | **Miroir exact de l'API du code** — noms de composants et valeurs de variantes identiques aux props. |

## 1. Architecture de pages (14)

```
Cover
00 · Fondations          ← spec visuelle, tout bindé
01 · Primitives          ← Icon, Illustration/Gamme, Avatar, Badge, Handle, PlateChip, ProgressBar, Radio, Divider
02 · Composants
03 · Patterns            ← MapSurface, Sheet, SheetCard, SheetHeader, GroupedSheet, ScreenHeader
——— Écrans ———
04 · Écrans              ← ex « UI Designs »
——— Explorations ———     ← 4 pages d'exploration préexistantes, regroupées
98 · Legacy (à migrer)   ← BottomSheet (13 états), IconAction, Icon/Hourglass, Icon/Lightning
99 · Bac à sable         ← 13 explorations d'illustration + 10 images générées
```

## 2. Fondations — terminées

**4 collections, 88 variables.**

- `Primitives` (32, **masquée à la publication**) : `blue/50→950`, `gray/50→700` + `gray/ink`, `yellow/subtle|100|500`, `red`, `amber`, `green`, `base/white`, `alpha/hairline-8`.
- `Fiw Colors` (42, mode `Fiw`) : miroir 1:1 de `Colors.*`. **38 aliasent une primitive.** 4 restent en valeur brute par décision documentée — `primaryFill` `#3B82F6` et `primaryInk` `#005DE8` (hors rampe par construction, cf. `colors.ts`), `surfaceAlt` `#FBFBFC`, `track` `#F2F3F5`.
- `Fiw Spacing` (9) : `space/n` = n × 4 px, scope `GAP, WIDTH_HEIGHT`.
- `Fiw Radii` (5) : scope `CORNER_RADIUS`.

**Scopes par rôle** partout (plus d'`ALL_SCOPES` en sémantique) et **code syntax** sur les 88 (`Colors.textPrimary`, `Spacing[4]`, `Radii.md`).

**Styles** : 8 styles de texte (les 3 interlignages AUTO corrigés → 24 / 21 / 18) + **5 styles d'effet** `Fiw/shadow/{sm,md,lg,sheet,float}`.

## 3. Composants — état

### Terminés (à jour du code)

| Composant | Détail |
|---|---|
| `Button` | **18 variantes** (6 × lg/md/sm), rayon `radius/pill` bindé, `Fiw/shadow/sm` sur les pleines, slots icône avant/après (booléen + instance swap), prop `Label` |
| `Button/State` | **18 variantes** — `Pressed` / `Disabled` / `Loading` par variante, en `lg`. Set séparé pour éviter une matrice de 72 |
| `Icon` | **71 / 71**, géométrie générée depuis `phosphor-react-native` (poids bold, viewBox 256) — identique au rendu de l'app |
| `Avatar` | `Size=48\|64` × `Bordered=false\|true` (remplace `Size=Default\|2`) |
| `Radio` | `Selected=false\|true` |
| `IconButton` | `Variant=floating\|flat` + swap d'icône |
| `Chip` | `Active=false\|true`, label + icône optionnelle |
| `Callout` | pastille jaune à glyphe sombre, texte, swap d'icône |
| `SettingsRow` | `Destructive=false\|true`, 8 propriétés (label, sous-titre, valeur, icône, chevron) |
| `SettingsGroup` | label de section + carte + séparateurs en retrait 52 + footnote |
| `PlaceRow` | `Accent=false\|true`, cercle d'icône 42, swap icône + trailing |
| `DriverRow` | avatar 64, nom, note, courses, chevron conditionnel |
| `VehicleBlock` | fond `track`, PlateChip, rendu 64×52 + illustration de gamme |
| `VehicleGroup` | cadre `surfaceAlt` sans padding |
| `RouteCard` | `Plain=false\|true` — carte grise à rail vertical / présentation à plat au filet en retrait 32, `Edit` booléen |
| `ReceiptRow` | une ligne de reçu, valeur alignée à droite (max 60 %) |
| `ReceiptCard` | composée d'instances de `ReceiptRow` : 2 groupes, filets, ligne de total |
| `ActionPill` | pilule neutre `track` + slot icône |
| `InfoBanner` | `Tone=info\|warn` (ex-`Banner`) |
| `TotalBar` | Total + note + montant Bold 22 en primary |
| `Sheet` · `SheetCard` · `SheetHeader` · `GroupedSheet` | primitives de feuille, géométrie exacte des maquettes |
| `ScreenHeader` · `Divider` · `MapSurface` | — |

Tous portent une **description** qui cite le fichier source et les décisions de design (pourquoi jaune et pas bleu, pourquoi 48 et pas 56, pourquoi la poignée est en absolu…).

### Reste à faire

**Petits** — `ProgressBar`, `CodePill`, `StepProgress` (aucune propriété exposée, peintures 100 % en dur) · `AvatarStack` · `Logo`, `Scrim`, `BrandSplash`, `FauxQR`.

**Moyens** — `AltSuggestCard` (illustration + badge manquants) · `GammeCard` (renommé depuis « Taxi Moto », contenu encore ancien) · `OptionCard` (à aligner sur `RapprochementChoice` **et** `LivraisonModeChoice`) · `PhoneField` + `FlagChip`.

**Gros** — `CountryPicker`, `PaymentSheet`, `MenuDrawer`, `WheelPicker`.

**Ensuite** — page `Cover`, publication du fichier comme bibliothèque, puis **Code Connect**.

## 4. Pièges de l'API Figma rencontrés (à relire avant de reprendre)

1. **Peinture liée à une variable** : `setBoundVariableForPaint` doit recevoir une peinture **déjà à la couleur résolue**. Si on part d'un placeholder, le lien est correct mais c'est la couleur littérale en cache qui s'affiche.
2. **Auto-layout des component sets** : un set hérite souvent d'un auto-layout qui **écrase les x/y** des variantes. Passer `layoutMode = 'NONE'` avant de placer la grille.
3. **`clone()` perd les `componentPropertyReferences`** — les réattacher variante par variante après le clonage.
4. **`INSTANCE_SWAP`** : attacher la propriété **remplace l'instance par la valeur par défaut** de la propriété. Définir ce défaut explicitement (`editComponentProperty`), pas `defaultVariant`.
5. **Instances masquées** : une instance `visible = false` **n'expose pas ses enfants**. Pour la peindre : rendre visible → peindre → remasquer.
6. **`componentPropertyReferences = null`** est refusé — passer `{ characters: null }`.
7. **`resize()` sur une instance ne redimensionne pas ses enfants** si leurs contraintes ne sont pas en `SCALE` : l'illustration reste à sa taille et se fait rogner. Utiliser **`rescale(facteur)`**.
8. **Propriétés orphelines** : vider les enfants d'un composant laisse ses propriétés TEXT en place. Les supprimer, sinon Figma suffixe les nouvelles (`Name2`).

## 5. Incohérences du code relevées en passant

- **`letterSpacing` des libellés de section** : 0.8 dans `SettingsGroup`, 0.5 dans `ReceiptCard`. À trancher.
- **Poids `fill` des icônes** : normatif dans `style-guide.md` (états actifs/sélectionnés) et utilisé par `Badge`, `ChipGroup`, `DriverRow` — **absent du set Figma**, qui n'expose que `bold`.
- **Rayons hors échelle** : `CARD_RADIUS = 20` (cartes de feuille), `FlagChip` 3, `PaymentSheet` 14. Le 20 est systématique et mériterait un token.
- **`DriverRow` / `RideDriver`** : violent la règle `CONTEXT.md` sur « chauffeur » comme terme de domaine. Renommage `PrestataireRow` / `Prestataire` à faire des deux côtés.
- **`docs/style-guide.tokens.json` est mort** (Lucide, boutons 52/44, pas de `displayXl`, pas de jaune). À régénérer depuis `apps/fiw/constants/*` ou à retirer.
- **`SearchBar` et `TopBar`** sont documentés dans `style-guide.md` mais n'existent nulle part ; `ScreenHeader` joue le rôle de `TopBar`.

---

# Partie III — Les deux décisions de fondation (22 août 2026)

## 1. `radius/card` = 20 px

`CARD_RADIUS = 20` vivait en constante locale dans `RideSheet.tsx` et se retrouvait codé en dur dans cinq composants Figma. Il est désormais un token de plein droit.

- **Figma** — `Fiw Radii / radius/card` = 20, scope `CORNER_RADIUS`, code syntax `Radii.card`. Bindé sur `SheetCard`, `VehicleBlock`, `VehicleGroup`, `TotalBar`, les deux variantes d'`InfoBanner`, et sur les coins non-extrêmes des trois cartes imbriquées du `GroupedSheet` (la première garde ses coins hauts à 28, la dernière ses coins bas carrés).
- **Code** — `card: 20` ajouté à `apps/fiw/constants/radii.ts` **et** à `apps/fiw-pro/constants/radii.ts` (les deux fichiers sont encore des copies tant qu'ADR 0004 n'est pas implémenté). `RideSheet.tsx` : `export const CARD_RADIUS = Radii.card;` — la constante reste exportée pour ne casser aucun import, mais elle ne porte plus la valeur.
- **Doc** — ligne `radius-card` ajoutée au tableau des rayons de `style-guide.md`.

Il reste deux rayons hors échelle, tous deux ponctuels et assumés comme tels : `FlagChip` 3 px et `PaymentSheet` `payIllo` 14 px.

## 2. Axe `Weight` du set `Icon`

`style-guide.md` fait du poids `fill` la marque des états actifs/sélectionnés, et trois composants s'en servent en code — mais Figma n'exposait que `bold`. Le set est passé de 71 à **142 variantes**.

- **Génération** — les 71 chemins `fill` extraits de `node_modules/phosphor-react-native/src/defs/*.tsx` (même méthode que pour `bold` : bloc de poids, `viewBox 256`, un `<Path>` par icône). Aucun chemin `fill` n'est identique à son `bold`, donc les deux poids se distinguent bien partout.
- **Structure** — `Icon` (71) × `Weight` (`bold` | `fill`). Les 71 variantes existantes ont été **renommées** en `Weight=bold`, donc toutes les instances déjà posées dans les écrans continuent de fonctionner et héritent de `bold`.
- **Application** — `DriverRow` (étoile de note), `Badge/Type=bienNote` (étoile 10 px) et `Chip/Active=true` passent en `Weight=fill`, comme le code.

### Contrainte Figma à connaître

Une propriété de set (`INSTANCE_SWAP` comme `TEXT`) n'a **qu'un seul défaut pour tout le set** : impossible de faire varier ce défaut d'une variante à l'autre. Deux conséquences assumées :

- **`Chip`** — la propriété `IconName` (swap) a été **retirée**. Chaque variante porte sa propre instance d'icône, au bon poids (`bold` inactif / `fill` actif). Une propriété partagée aurait imposé le même poids aux deux états, ce qui casse précisément la règle qu'on venait d'outiller. Pour changer de glyphe : permuter l'instance imbriquée.
- **`Badge`** — pas de propriété `Label` exposée : `bienNote` et `suggere` ont des libellés par défaut différents (« Bien noté » / « Suggéré ») et une propriété TEXT partagée aurait affiché le même mot dans les deux. Le texte reste éditable directement sur l'instance.

C'est la même mécanique que le piège n° 4 de la Partie II, vue depuis les propriétés TEXT : **un défaut de propriété écrase toujours ce que porte la variante.**
