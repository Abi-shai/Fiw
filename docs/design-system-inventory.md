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
| `AltSuggestCard` | vignette 48 + illustration + `Badge` « Suggéré » + chevron |
| `GammeCard` | `Illu` (5 gammes) × `State` — plateforme 52, illustration à son gabarit propre qui déborde, badge ETA |
| `OptionCard` | `State` × `Ton` (success \| primary) — un seul composant pour `RapprochementChoice` **et** `LivraisonModeChoice` |
| `FlagChip` | 26×19, drapeau SN réel importé + repli code ISO |
| `PhoneField` | `Rempli=false\|true` — chip indicatif + filet + numéro au gabarit du pays |
| `ProgressBar` | `Progress=0\|25\|50\|75\|100` |
| `CodeCell` · `CodePill` | case 52×60 + rangée de 4, un `Chiffre` par case |
| `StepProgress` | `Étape=0\|1\|2\|3` — 3 jalons Livraison, anneau sur le jalon courant |
| `ActionPill` | pilule neutre `track` + slot icône |
| `InfoBanner` | `Tone=info\|warn` (ex-`Banner`) |
| `TotalBar` | Total + note + montant Bold 22 en primary |
| `Sheet` · `SheetCard` · `SheetHeader` · `GroupedSheet` | primitives de feuille, géométrie exacte des maquettes |
| `ScreenHeader` · `Divider` · `MapSurface` | — |

Tous portent une **description** qui cite le fichier source et les décisions de design (pourquoi jaune et pas bleu, pourquoi 48 et pas 56, pourquoi la poignée est en absolu…).

### Reste à faire

**Petits** — `AvatarStack` · `Logo`, `Scrim`, `BrandSplash`, `FauxQR`.

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

---

# Partie V — RouteCard & ReceiptCard (22 août 2026)

## `RouteCard` — deux présentations, un seul composant

Miroir de `RideSheet.RouteCard`, dont le prop `plain` devient l'axe `Plain=false | true`.

- **`Plain=false`** (335×134) — cadre `surfaceAlt`, `radius/lg`, liseré `borderSubtle`, padding 14. Rail vertical à gauche : icône `walk`, filet de 2 px (`border`, min 24, étiré sur la hauteur), icône `flag`. Les deux points à droite, `gap 24`, libellé `bodySmall` secondaire + valeur `label`.
- **`Plain=true`** (335×109) — ni carte ni rail. Deux lignes « icône 20 `gray700` + texte » séparées par un filet **en retrait de 32** (20 d'icône + 12 de gouttière). Interligne resserré à **16** et non 21/18 : les variantes typo gonfleraient chaque ligne de 7 px et casseraient la hauteur de 108 des maquettes.

Les deux hauteurs obtenues (134 / 109) correspondent au calcul du code.

Quatre propriétés TEXT partagées (`LibelléDépart`, `Départ`, `LibelléArrivée`, `Arrivée`) — ici le défaut partagé ne gêne pas, les deux variantes veulent les mêmes valeurs par défaut. `Edit` booléen ajoute le crayon.

**Pas de propriété de swap pour les icônes**, volontairement : `walk` puis `flag` valent pour Transport comme pour Livraison depuis la fusion du 16 août, et le commentaire du code est explicite — aucun écran n'a à surcharger `icons`. Le piéton dit le point de départ du **Client**, pas le véhicule qui vient le chercher.

## `ReceiptRow` + `ReceiptCard`

`ReceiptCard` est piloté par deux tableaux (`rows[]`, `lines[]`) : impossible à paramétrer par des propriétés Figma. Il est donc **composé d'instances**, comme en code où `Row` est déjà un sous-composant.

- **`ReceiptRow`** (295 de large) — libellé `body` secondaire, valeur `body/Medium` alignée à **droite**, largeur max 60 % de la carte (177 sur 295), `padV space/2`, `space-between`. Deux propriétés TEXT.
- **`ReceiptCard`** (335×381) — fond `surface`, `radius/lg`, padding 20, `Fiw/shadow/sm`. Titre en capitales, deux groupes de `ReceiptRow` séparés par des filets `border` à `padV 8`, ligne de total (`heading2` + montant `heading1` en `primary`, `padTop 4`).

Ajouter ou retirer une ligne = ajouter ou retirer une instance. Les trois composants sont **100 % bindés** (12/12, 2/2, 5/5 peintures).

---

# Partie VI — AltSuggestCard, GammeCard, OptionCard (22 août 2026)

## 🐞 Bug trouvé au passage : deux illustrations interverties

En construisant `GammeCard`, la carte « Taxi Moto » affichait un **vélo**. Vérification faite sur les variantes isolées :

| Variante Figma | Dessin réel | Gabarit |
|---|---|---|
| `mobility option=moto, View=Default` | 🚲 **vélo** | 79×88 |
| `mobility option=vélo, View=Default` | 🏍️ **moto** | 107×88 |
| `mobility option=moto, View=top view` | 🏍️ moto | 34×77 — correct |
| `mobility option=vélo, View=top view` | 🚲 vélo | 76×51 — correct |

Les deux variantes **`View=Default` étaient interverties** ; les vues de dessus, elles, étaient justes. Renommées d'après le dessin, et les cartes re-pointées.

**Ce que ça corrige dans mon propre diagnostic** : j'avais d'abord conclu que les assets moto/vélo étaient *périmés* (antérieurs à la passe craft du 14 août), en me fondant sur des gabarits qui ne collaient pas à `ILLO_SIZES`. C'était faux. Une fois l'inversion corrigée, la moto retombe sur **106×87**, exactement la valeur du code — l'asset était à jour, seul le nom était faux. Rien à resynchroniser depuis `assets/illustrations/`.

Reste un écart mineur et sans conséquence : le cadre du vélo est 79×88 là où le code attend 78×76 (marge verticale en trop dans le dessin), donc à hauteur égale il rend 68 de large au lieu de 78. La géométrie de la carte est pilotée par la hauteur, elle n'en souffre pas.

## `AltSuggestCard`

Cadre `surfaceAlt`, `radius/lg`, padding 12. Vignette 48 (`track`, `radius/md`, illustration contenue dans 42) + titre `label` flanqué du `Badge` « Suggéré » + méta 12 px + chevron conditionnel. 335×72, comme le code.

Rappel inscrit dans la description du composant : **« Aucun prestataire » n'est pas une option** (`CONTEXT.md`) — cette carte propose une autre *gamme*, elle ne doit jamais devenir une variante d'`OptionCard`.

## `GammeCard` — 10 variantes

Axes `Illu` (moto | velo | auto | covoiturage | luxe) × `State`. 138×133, et 152 quand `Description=true` — la carte hugge, les deux hauteurs tombent d'elles-mêmes.

L'axe `Illu` existe parce que **chaque gamme a un gabarit d'illustration propre** (`ILLO_SIZES` : 76 de haut pour les voitures et le vélo, **87 pour la moto**, qui casse volontairement le gabarit commun). Un simple `INSTANCE_SWAP` ne peut pas changer la taille : il aurait mis toutes les gammes au même gabarit et écrasé cette intention.

La plateforme fait 52 de haut et n'est **pas** un auto-layout : l'illustration doit pouvoir la déborder de 12 en haut comme en bas (c'est ce débord qui donne son expressivité à la carte) et le badge ETA mordre le coin bas-gauche à `bottom −8`. Les deux sont donc positionnés en absolu, `clipsContent = false`.

Pas de propriété `Label` : chaque gamme porte son libellé propre (Taxi Moto, Vélo Express, Taxi Auto, Covoiturage, Taxi Prestige) et un défaut partagé les aurait tous alignés sur un seul mot.

## `OptionCard` — un composant, deux consommateurs

`RapprochementChoice` et `LivraisonModeChoice` rendaient en code **exactement la même carte** — seul le contenu changeait. Le composant Figma est désormais unique, sur deux axes : `State` (Inactive | Active) × `Ton` (success | primary), le ton étant celui du **bénéfice**, pas de la carte.

- `Ton=success` → icône `coins` en `success` (« Économisez N F »)
- `Ton=primary` → icône `lightning` en `primary` (« ~N min plus tôt », « Part tout de suite »)

L'icône du bénéfice est **bakée par variante**, pas exposée en swap : elle est solidaire du ton. Les quatre textes (`Title`, `Bénéfice`, `Meta`, `Prix`) restent des propriétés — ils portent des montants et des durées, donc ils sont toujours renseignés à l'usage ; leur défaut partagé est celui de l'Option A.

**Les trois composants sont 100 % bindés** : 4/4, 110/110, 38/38 peintures.

---

# Partie VII — Formulaire, progression, code (22 août 2026)

## `FlagChip` — avec un vrai drapeau

26×19 (la hauteur vaut 72 % de la largeur), rayon 3, liseré `border`, fond `track`, contenu rogné. Le **drapeau sénégalais réel** a été importé dans Figma depuis `apps/fiw/assets/flags/sn.png` : le défaut du composant ne montre donc pas un carré gris là où l'app affiche un drapeau. `Repli code=true` expose le chemin de repli du code (code ISO en `SemiBold 10`, `letterSpacing 0.3`) — celui qu'emprunte l'app quand l'asset manque.

Rayon 3 : valeur ponctuelle hors échelle `Radii`, assumée — un drapeau de 19 px de haut ne supporte pas `radius/sm`.

## `PhoneField`

Hauteur 52 (`padV 14` + 24). Chip indicatif à gauche (`FlagChip` + « +221 » + caret 14) qui ouvre le `CountryPicker`, filet `1×24`, puis le numéro. `Rempli=false` montre le **gabarit en zéros** en `textTertiary` — c'est un placeholder, pas une valeur, et `Numéro` n'est donc câblé que sur la variante remplie.

La description du composant rappelle la règle de `style-guide.md` : **un champ au repos n'est jamais bleu**. Fond `surface`, liseré `border`, comme les autres blocs. Sur un écran de formulaire le bleu n'appartient qu'aux CTA ; seul le focus clavier peut se marquer en bleu, parce que c'est un état.

## `ProgressBar` — 5 variantes

`Progress=0 | 25 | 50 | 75 | 100`. En code la largeur est animée (`Animated.Value` 0→1) ou statique via `value` (défaut 0.6) : les variantes servent à maquetter, redimensionner l'enfant `Fill` d'une instance reste tout aussi légitime.

## `CodeCell` + `CodePill`

Le code de remise est découpé caractère par caractère en code, donc le composant Figma est **composé** : `CodeCell` (52×60, `radius/md`, liseré 1.5, chiffre `Bold 28/36`) et `CodePill` = quatre instances à `gap 8`, avec un `Chiffre N` par case. 232×60, exactement la largeur d'origine.

## `StepProgress` — 4 variantes

Les trois jalons réels du suivi Livraison — **Collecte** (`package`), **En route** (`navigate`), **Remis** (`flag`) — et l'axe `Étape` qui reprend `activeIndex` : 0, 1, 2, et **3 = tout est fait** (`JALON_INDEX` place `finished` au-delà du dernier jalon, le temps du fondu vers la clôture).

Jalon fait → pastille `primary` + coche. Jalon courant → pastille de 28 plus un **anneau de 3 px** en `primarySubtle` (34 au total) : c'est l'anneau qui le détache des jalons faits. Jalon à venir → `track` + icône `textTertiary`. D'où la variante `Étape=3` qui fait 49 de haut et non 55 : plus de jalon courant, donc plus d'anneau.

## État de la bibliothèque

**38 composants, 244 variantes, ZÉRO peinture en dur** — tout est bindé sur un token, sur toute la bibliothèque. Les 38 portent une description qui cite le fichier source et les décisions de design.

---

# Partie VIII — Les cinq derniers, les quatre feuilles, et Code Connect (22 août 2026)

## Les cinq derniers composants

| Composant | Note |
|---|---|
| `Logo` | **Le vrai SVG** (`assets/logo.svg`) importé comme arbre vectoriel éditable, pas une approximation. 96 px par défaut. |
| `AvatarStack` | 28×28, liseré 2 px `surface`, chevauchement −12. |
| `Scrim` | `Niveau=collapsed\|half\|full` → opacité 0 / 38 % / 58 %, comme l'interpolation du code. |
| `BrandSplash` | Fond `primary` plein écran + `Logo` à 36 % de la largeur. |
| `FauxQR` | **Le même algorithme que le code** rejoué dans le script Figma (grille 17×17, seed « AWA2024 », trois finder patterns) — donc le dessin est identique à l'app, pas une imitation. |

Deux ajouts de fondation au passage : la primitive **`base/black`** (le `Scrim` a besoin d'un noir pur ; `gray/ink` vaut `#1A1A1A`), et le drapeau sénégalais **réellement importé** dans `FlagChip`.

`FlagChip` a d'ailleurs été corrigé en cours de route : un booléen `Repli code` superposait le code ISO **par-dessus** le drapeau. Les deux états sont mutuellement exclusifs → c'est un axe de variante `Repli=false|true`, pas un booléen.

## Les quatre feuilles : compositions, pas composants

`CountryPicker`, `PaymentSheet`, `MenuDrawer` et `WheelPicker` sont désormais des
**compositions** sur `03 · Patterns` — des frames assemblées à partir des primitives,
pas des composants paramétrés. Raison : chacune est une **surface d'écran unique**,
pas un objet réutilisé. Les paramétrer aurait produit quatre composants à une seule
instance, c'est-à-dire du coût de maintenance sans réemploi.

- **`CountryPicker`** — feuille 3 crans : poignée + titre `heading1`, barre de recherche 48 px (`bg`, `radius/md`, liseré `border`), rangées `FlagChip` + nom + indicatif + coche. La rangée Sénégal montre le vrai drapeau, les autres le repli ISO — les deux chemins sont donc visibles côte à côte.
- **`PaymentSheet`** — `SheetHeader` + trois rangées (logo 56 `radius/lg`, nom 16, `Radio`) séparées par des filets **en retrait de 64**, puis le CTA `Button/primary/lg`. Les logos réels (Wave, Orange Money, espèces) sont des PNG locaux : ici ce sont des pastilles à icône.
- **`MenuDrawer`** — panneau de **308** (`min(largeur × 0.82, 320)`), coins droits `radius/xl`, ombre horizontale `#000` 8/0 flou 24 à 10 % (valeur propre au tiroir, pas un style d'effet partagé). En-tête `Avatar` + nom + téléphone, rangées de menu, puis la carte Affiliation.
- **`WheelPicker`** — deux colonnes de 72, items de 44, 5 visibles ; valeurs éloignées à 22 % d'opacité. La **bande de sélection est dessinée par le parent** — une seule bande traversant toutes les colonnes, façon Lyft — et c'est écrit sur la composition, parce que c'est la seule chose qu'on se trompe à remettre dans la colonne.

## Code Connect : bloqué par le plan

Le serveur Figma est catégorique :

> _You need a Dev or Full seat on an Organization or Enterprise plan to use Code Connect._

Le compte est sur `starter` + `pro`. Code Connect est donc **indisponible**, et aucun
template `.figma.ts` n'a été écrit — il n'aurait rien pu valider.

À la place : **[`design-system-figma-code-map.md`](design-system-figma-code-map.md)**
encode la même information (nœud, axes, propriétés, fichier de code, correspondance
propriété → prop) pour les 45 composants. La conversion en templates sera mécanique
le jour où le plan le permet.

**Publier la bibliothèque** reste à faire et n'a pas d'API : Figma → menu Ressources →
onglet Bibliothèques → _Publier_. Le plan `pro` l'autorise, et c'est le prérequis pour
que le fichier soit consommable ailleurs.

---

# Partie IX — Les six dettes soldées (23 août 2026)

## 1. Les trois dernières couleurs hors token

`AvatarStack` portait trois hex écrits en dur dans `searching.tsx` : `#e7ecff`,
`#b45309`, `#047857`. Le motif est toujours le même — **un fond subtil, une encre
foncée de la même teinte** — et le bleu avait déjà son couple (`primarySubtle` +
`primaryPressed`, celui de `PrestataireAvatar`). Il manquait donc les encres ambre
et verte, pas un fond bleu.

Ajoutés : primitives **`amber/700`** et **`green/700`**, tokens sémantiques
**`warningInk`** et `**successInk**` (scope `TEXT_FILL`), plus `Colors.warningInk` /
`Colors.successInk` en code.

Pourquoi des encres séparées : `warning` et `success` sont des **pleins**. Posés en
texte sur leur propre palier subtil ils tombent à **2.0:1** et **2.4:1**. C'est
exactement le manque que `colors.ts` annonçait déjà pour le jaune de marque — « le
jaune plein remplit, il ne dessine jamais ».

Le fond bleu passe à `primarySubtle` : le `#e7ecff` d'origine tirait vers le violet
sans raison, et le couple bleu existait déjà.

## 2. Le libellé de section, une fois pour toutes

Deux traitements pour un seul rôle : `caption`/0.8/tertiaire dans `SettingsGroup`,
`label`/0.5/secondaire dans `ReceiptCard`.

Tranché sur **`caption` + capitales + `letterSpacing 0.8` + `textTertiary`** — la
valeur déjà employée partout dans Compte, et à 11 px des capitales ont besoin de
plus d'air que du corps de texte. `ReceiptCard` s'y aligne (son titre passe donc de
13 à 11 px et de secondaire à tertiaire : sur un reçu, le contenu est le sujet, pas
son en-tête).

Le vrai correctif est structurel : le tracking et la casse vivent maintenant dans
**`SectionLabel`** (`constants/typography.ts`), pas dans les `StyleSheet` des
composants. C'est ce qui empêche la divergence de revenir.

## 3. « Driver » évacué du modèle

`CONTEXT.md` autorise « chauffeur » dans la **copie d'interface** du flux Transport
et le proscrit comme **terme de domaine**. Le code violait la seconde moitié.

Renommés : `RideDriver` → **`Prestataire`**, `DriverRow` → **`PrestataireRow`**,
`DriverAvatar` → `PrestataireAvatar`, le prop `driver` → `prestataire`, les
constantes `DRIVER`/`MOTO_DRIVER` → `PRESTATAIRE`/`PRESTATAIRE_MOTO`, les champs
`driverName`/`driverPlate` → `prestataireName`/`prestatairePlate`, le type de
marqueur de carte `'driver'` → `'prestataire'` et l'auteur des messages du chat.
Renommé aussi côté Figma. **Plus aucune occurrence de `driver` dans le produit.**

La copie d'interface, elle, garde « chauffeur » là où `CONTEXT.md` l'autorise —
« On repère les chauffeurs autour de vous » reste tel quel.

## 4. `variant="ghost"` — déjà corrigé côté client

Faux positif de ma part sur le responsable : au moment où je l'ai signalé, l'erreur
était réelle, mais elle a été corrigée et committée entre-temps (`retrait-echec.tsx`
lit `variant="link"` dans `HEAD`). `npx tsc --noEmit` est propre. Rien à faire.

## 5. `style-guide.tokens.json` : dérivé, plus maintenu

Le fichier n'est plus écrit à la main : **`scripts/gen-style-guide-tokens.py`** le
génère depuis `apps/fiw/constants/*.ts`. Il redevient donc vrai, et surtout
**régénérable** au lieu d'être à maintenir — c'était la cause de sa péremption.

Contenu à jour : 44 couleurs (avec les deux nouvelles encres), 8 styles de texte
(`displayXl` inclus), 9 espacements, 6 rayons (`card` inclus), 5 ombres avec leurs
opacités et élévations réelles, et les icônes en **Phosphor** — plus Lucide, plus de
boutons 52/44, plus de section `button` (c'était du composant déguisé en token).

## 6. `SearchBar` construite, `TopBar` retiré

Le style guide décrivait deux composants qui n'existaient nulle part. Vérification
faite, **trois** écrans réimplémentaient chacun sa barre de recherche —
`CountryPicker`, la feuille destinataire de `livraison/configure`, le champ
d'adresse sur carte de `compte/lieu`. La documentation avait raison, c'est le code
qui manquait.

**`SearchBar`** est construite (code + Figma), deux variantes :

- `sheet` — fond `bg`, `radius/md`, liseré `border`, h48. Le traitement de champ au
  repos du style guide, celui de `PhoneField`.
- `floating` — pilule `surface`, liseré `hairline`, `shadow-float`, h46, texte en
  Medium parce qu'il doit tenir sur un fond carto bruité.

Les trois écrans y passent. Deux unifications au passage : la feuille destinataire
gagne le liseré qui lui manquait, et le champ de `compte/lieu` aligne son icône sur
18/`textTertiary`.

**`TopBar`** est retiré du tableau au profit de **`ScreenHeader`**, qui tenait déjà
le rôle sans en porter le nom. Les champs De/À de l'accueil sont explicitement
exclus de `SearchBar` : ce sont des rangées d'itinéraire à deux lignes, pas une
recherche.

## État final

**46 composants · 265 variantes · 94 variables · 4 collections.**

Une seule exception au binding, délibérée : **le `Logo`** garde ses couleurs de
marque en dur. C'est une marque, pas un composant thémable — le carré doit rester
`#0066FF` même si le token `primary` bouge. Tout le reste de la bibliothèque est
bindé, et les 46 composants portent une description.

Côté code, les seuls hex restants sont eux aussi hors périmètre : les couleurs de
marque **tierces** (Orange `#FF6200`, Wave `#009FE3`) dans `retrait-methode.tsx`, et
le style **cartographique** injecté dans la WebView de `LeafletMap.tsx`. Ni l'un ni
l'autre n'appartient à la palette Fiw.


---

# Partie X — Le set `BottomSheet` décomposé (23 août 2026)

Le set legacy à 13 états (`119:407`) était la dernière décision à moitié appliquée :
Partie II actait « **décomposer**, garder le legacy vivant », et seule la seconde
moitié avait été faite. Reprise complète.

## 1. Ce que l'inspection a révélé

Le set n'avait pas été ignoré **comme source de design** — le code lui est fidèle,
`app/transport/searching.tsx` cite même `maquette 118-362`, et les montants
(`GROUPEE_ECONOMIE` 250, `FRAIS_RAPPROCHEMENT` 350, `GROUPAGE_MIN_COMMANDES` 2,
`GROUPAGE_DELAI_MAX_MIN` 10) concordent. Il avait été ignoré **comme objet de
bibliothèque**, avec trois conséquences qu'aucun document ne portait :

| Trouvaille | Détail |
|---|---|
| **Le label mentait** | Les node id trahissent la chronologie : Transport en `118:*`/`163:*`, Livraison en `294:*`→`311:*`. Les 7 états Livraison ont été **ajoutés après** le classement en legacy. Ce n'était pas du legacy, c'était la seule maquette de la Livraison — rangée dans une page « à migrer ». |
| **3 mains orphelines** | `BottomSheet/EnRoute` (`118:404`), `BottomSheet/Arrivé` (`118:427`), `BottomSheet/EnCours` (`118:454`) : des composants **sans parent**, absents de toute page, vivants uniquement parce que trois écrans les instanciaient. Ni l'inventaire ni la carte ne les connaissaient. |
| **69 peintures non bindées** | Le set avait été **exclu de la passe de binding** de la Partie IX. L'« État final » de la Partie IX (« tout est bindé sauf le `Logo` ») était donc faux — il ne parlait que des 46 composants. |
| **1 état sans écran** | `State=Arrived` (`163:902`) n'était instancié nulle part. `Transport · Arrivé` tournait sur l'orpheline, plus ancienne et d'un autre langage visuel. |
| **3 écrans délavés** | Les feuilles de `Transport · En route`, `Arrivé` et `Course en cours` étaient à `opacity 0.5` — texte gris illisible. Les trois écrans sur mains orphelines sont exactement les trois écrans cassés. |

## 2. Ce qui a été fait

**Promotion en écrans** — `04 · Écrans` passe de 12 à 20 écrans réels.

- **7 écrans Livraison créés** : `Recherche`, `Frais de rapprochement`, `Aucun
  prestataire`, `Attente groupage`, `Groupage`, `Méthode de livraison`, `Suivi du
  colis`. Le fond de carte est **cloné** de l'écran Transport analogue plutôt
  qu'inventé — aucune décision de fond n'est de mon fait. Le bandeau d'attente de
  `Transport · Recherche` (« 5 min d'attente gratuite… ») est écarté : c'est de la
  copie Transport, et le code Livraison ne place ses `InfoBanner` que **dans** la
  feuille.
- **1 écran Transport créé** : `Transport · Chauffeur arrivé`, depuis le 13ᵉ état
  qui n'en avait aucun.

**Décomposition** — les 8 instances de feuille des écrans Transport sont
**détachées** (`detachInstance()`), pas reconstruites. C'est ce qui préserve
exactement les surcharges d'écran : `Sheet · EnRoute` garde sa hauteur 566 et non
les 779 du composant.

**Suppression** — après vérification qu'aucune instance ne subsistait dans **aucune**
page, le set (13 variantes) et les 3 mains orphelines sont supprimés.

> ⚠️ **Décision annulée le 23 août 2026.** Supprimer le set était une erreur : il
> sert de référence vivante, pas seulement de source d'écrans. Il a été
> **reconstruit puis étendu** — voir Partie XI. Les 3 mains orphelines, elles,
> restent supprimées : elles étaient de vrais doublons périmés.

**Binding** — **68 peintures** liées aux tokens `Fiw Colors` sur les 16 feuilles.
Rendu strictement identique (même hex, comparé par capture avant/après).

## 3. Resté ouvert — décisions qui ne m'appartiennent pas

- **4 peintures sans token** : `#E7ECFF` ×3 (fond du groupe d'avatars de
  `Recherche` / `Attente groupage`) et `#E6F0FF` ×1 (carte `Directe` sélectionnée de
  `Groupage`). Absents de la palette **et** du code. Voisins de `primarySubtle`
  `#EDF7FF` et `blue100` `#D6EDFF` sans s'y confondre — retinter serait substituer
  mon choix à celui du design.
- **Doublon d'état arrivée** : `Transport · Arrivé` (ancien) et
  `Transport · Chauffeur arrivé` (maquette courante) coexistent.
- **Vocabulaire** : `Transport · En route` dit « Rejoindre le **conducteur** » —
  variante explicitement _Avoid_ dans `CONTEXT.md`. Sa feuille est aussi rognée
  (566 pour 779 de contenu). Écran à trancher : rafraîchir ou retirer.
- **`IconAction`** reste sur `98 · Legacy` avec 2 instances vivantes dans
  `Sheet · EnRoute`. Son remplacement par `IconButton` est indépendant de ce
  chantier.
- **Écart Figma ↔ code sur `Suivi`** : la maquette empile `Colis en route` /
  `CodePill` / `Détails de la livraison` / tuiles ; `app/livraison/suivi.tsx`
  structure autrement (`Votre colis`, `InfoBanner` conditionnels de collecte et de
  groupage absents de la maquette). Non tranché ici.

## État final — révision

`98 · Legacy` tombe de 4 entrées à 3 (`IconAction` + 2 icônes doublons).
`04 · Écrans` passe de **12 à 20 écrans réels**, Transport **et** Livraison.
Pour le compte de composants, voir la Partie XI : le set `BottomSheet` est revenu.

La phrase « tout est bindé sauf le `Logo` » vaut désormais pour la bibliothèque
**et** pour les feuilles d'écran, aux 4 peintures ci-dessus près.

---

# Partie XI — `BottomSheet` reconstruit et étendu à tous les parcours (23 août 2026)

## 1. Pourquoi

La Partie X avait supprimé le set après avoir promu ses 13 états en écrans. C'était
une erreur de lecture : le set n'était pas seulement une **source** d'écrans, c'est
la **référence** de la feuille inférieure — l'objet qu'on ouvre pour voir d'un coup
tous les états d'une même surface. Demande explicite de le restaurer, et de
l'étendre à **toutes** les versions de feuille de l'app Client.

**Rien n'avait été perdu** : les 13 états vivaient intacts dans les écrans sous
forme de frames `Sheet · …`. Le set est reconstruit à partir d'eux — hauteurs
identiques au pixel (251 · 382 · 377 · 523 · 664 · 739 · 271 · 386 · 377 · 271 ·
561 · 691 · 935), et il hérite au passage des 68 peintures bindées de la Partie X.

Emplacement : **`03 · Patterns`** (`486:1447`), aux côtés de `Sheet`, `SheetCard`,
`GroupedSheet` — et non plus `98 · Legacy`, page dont le nom disait l'inverse de ce
que l'objet est devenu.

## 2. Deux axes plutôt qu'un

| Axe | Valeurs |
|---|---|
| `Parcours` | `Accueil` · `Transport` · `Livraison` |
| `État` | 20 valeurs, des états d'écran aux modales |

Les modales sont rattachées à **leur parcours** (`État=Modale · Annuler`) plutôt
qu'à un `Parcours=Modale` : la matrice tombe de 84 à 60 cases, et
« Annuler la course » garde son lien au Transport. La matrice reste **creuse** —
32 cases remplies sur 60 — ce qui est normal : aucun parcours ne porte tous les
états.

Le passage à deux axes règle au passage le mélange de langues signalé en Partie I
§3 : `On his way` → `En route`, `Arrived` → `Arrivé`, `ChoixAB` → `Frais`,
`Livraison — Méthode` → `Configure`.

## 3. Couverture — 32 variantes

| Parcours | États |
|---|---|
| **Accueil** (1) | `Services` |
| **Transport** (13) | `Adresse` · `Configure` · `Recherche` · `Frais` · `Aucun` · `Révélation` · `En route` · `Arrivé` · `Arrivé · frais` · `En cours` · `Modale · Annuler` · `Modale · SOS` · `Modale · Paiement` |
| **Livraison** (18) | les mêmes moins `Arrivé · frais`, plus `Groupage` · `Attente groupage` · `Remise` · `Modale · Décrire le colis` · `Modale · Destinataire (contacts)` · `Modale · Destinataire (saisie)` |

**19 variantes créées.** Correspondance avec le code :

| Variante | Source |
|---|---|
| `Transport/Livraison · Révélation` | `phase='reveal'` des deux `searching.tsx` |
| `Transport · En cours` | `course-active.tsx` `step.key='in_progress'` |
| `Transport · Arrivé · frais` | `course-active.tsx` — bandeau `warn` hors période de grâce |
| `Livraison · En route` / `Arrivé` / `Remise` | `suivi.tsx` `vers_collecte` / `collecte` / `remise` |
| `Accueil · Services` | cloné de la maquette `326:664` que `home.tsx` cite déjà (`node 336:1175`) |
| `Transport/Livraison · Adresse` | `home.tsx` `mode='search'` + `SEARCH_COPY` |
| `Modale · *` | les 8 `<BottomSheet>` de `course-active`, `configure` ×2, `suivi` |

## 4. Ce qui a été relevé en construisant

- **Le mode recherche de l'accueil n'avait aucune maquette.** Les deux variantes
  `Adresse` sont dérivées du code (géométrie `styles.field` : radius `lg`, hauteur
  60, liseré 1,5, `bg` au repos / `primarySubtle` + liseré `primary` à l'actif).
  Premier état du set qui ne descend pas d'une maquette — à valider.
- **`StepProgress` incohérent dans `Livraison · En cours`.** La maquette d'origine
  le laisse à `Étape=0` alors que son titre dit « Colis en route » ; le code place
  `vers_livraison` au jalon **1**. La variante d'origine est laissée telle quelle,
  les nouvelles portent l'index du code. À trancher.
- **Bandeaux détachés.** L'`InfoBanner` de `Transport · Arrivé` n'est pas une
  instance mais un frame recopié. Les variantes créées utilisent le composant.
- **`Avatar` 44 vs 48.** `livraison/configure.tsx` demande un avatar de 44 dans la
  liste de contacts ; le composant n'offre que 48 et 64. La variante utilise 48.
- **Dépendance hors DS.** `Accueil · Services` instancie `PlaceRow · Accueil`, un
  composant **local à la page `Homepage exploration`**. À remonter dans
  `02 · Composants` ou à fusionner avec `PlaceRow`.

## 5. Divergence à surveiller

Les écrans de `04 · Écrans` portent des frames `Sheet · …` **détachées** ; le set
en est une copie indépendante. Modifier l'un ne modifie plus l'autre. Deux issues
possibles, non tranchées : re-pointer les 13 écrans sur des instances du set
(architecture d'origine), ou assumer que les écrans sont des compositions figées et
que le set est la référence.

---

# Partie XII — Les sous-composants du set remis sur le DS (23 août 2026)

Constat : beaucoup de sous-éléments du set `BottomSheet` étaient des **frames
recopiées** alors que le composant existait. Recensement puis remise en instances.

## 1. Remis en instances

| Composant | Occurrences | Détail |
|---|---|---|
| `RouteCard` | **10** | Les frames `Itinéraire` sont des `RouteCard Plain=true`. Le code utilise `plain` sur ses **4** appels et son commentaire donne 108 px de haut — la variante `Plain=true` (109) est la bonne. `Edit=true` sur les deux `Configure`. |
| `Divider` | **12** | 4 frames `Divider` des modales Paiement + 8 nœuds `LINE` des blocs `InfosCourse`. |
| `TotalBar` | **4** | Frames `375x69` « Total / 1.850 F » → instances avec `Note visible=false`. |
| `OptionCard` | **2** | `Directe` / `Groupée` étaient des copies **détachées** d'`OptionCard` — mêmes noms de calques exactement. Rendu identique au pixel après échange. |
| `AvatarStack` | **2** | Les grappes `60x28` d'avatars A·C·F. |
| `Illustration/Gamme` + `VehicleBlock` | **+6 chacun** | Gagnées en décomposant les `VehicleGroup` Livraison (voir §3). |

**250 instances de tête**, 26 composants distincts, contre 234 avant la passe.

## 2. Homonymies levées

`Badge` → `AlertBadge` (4×) et `Logo` → `LogoPartenaire` (6×). Ces frames portaient
le nom d'un composant du DS **sans être** ce composant : `Badge` est le badge
`bienNote|suggere`, pas une pastille d'alerte de 56 px ; `Logo` est la marque Fiw,
pas un logo Wave ou Orange Money. Le recensement les remontait en faux positifs.

## 3. 🐞 Défaut trouvé : `VehicleBlock` ne sait pas afficher un vélo

Échanger les 4 `VehicleGroup` Livraison a produit un vélo **tronqué**. Cause :

- les 10 variantes d'`Illustration/Gamme` mesurent toutes **88 de haut**, mais les
  largeurs vont de 79 (vélo, portrait) à 108 (auto, paysage) ;
- dans `VehicleBlock`, l'illustration est **mise à l'échelle à la main** à 48×39 —
  un cadrage calculé pour l'auto ;
- la boîte `Render` fait 64×52 et **rogne** (`clipsContent`) ;
- un changement de variante **réinitialise** la taille à la valeur naturelle. Le
  vélo repasse à 79×88 et déborde. `resize()` est silencieusement ignoré dans une
  instance et la position y est verrouillée (`relative-transform`).

Les 4 `VehicleGroup` Livraison sont donc revenues en frames — mais **décomposées** :
`Illustration/Gamme`, `PlateChip`, `PrestataireRow`, `Star`, `Chevron` y sont
maintenant des instances, alors que l'illustration était un dessin détaché avant.
Net positif malgré le retour en arrière.

**Deux corrections possibles**, non tranchées : ramener les 10 variantes
d'`Illustration/Gamme` à une échelle commune ajustée en hauteur (52/88 = 0,591 —
toutes tiennent alors dans 64×52), ou ajouter un axe `View=inline` calibré pour
cette boîte.

## 4. `SheetCard` gagne un slot — les 42 cartes deviennent des instances

**47 frames sont des cartes de feuille** (pleine largeur, rayon 20, fond `surface`,
padding 20/16) sous des noms hétéroclites — `Frame 6`, `Frame 7`, `Frame 10`,
`InfosCourse`, `SheetCard`… Elles ne peuvent **pas** devenir des instances de
`SheetCard` : une instance Figma n'accepte pas d'enfants arbitraires.

La seule voie était un **slot**, et `ComponentNode.createSlot()` existe dans cette
version de l'API. **Fait** : `SheetCard` porte désormais une propriété
`Contenu` de type `SLOT`, le texte de remplissage y sert de contenu par défaut.
Rayon d'impact vérifié avant modification : **3 instances** dans tout le fichier,
toutes dans `GroupedSheet`, qui rend toujours correctement.

**42 des 47 cartes converties**, zéro incident :

| Signature | n | Traitement |
|---|---|---|
| pad 20/16, rayons 20, gap 12 | 37 | Instance `SheetCard`, contenu déplacé dans le slot |
| idem, rayons bas à **0** | 5 | Idem + surcharge `bottomLeftRadius`/`bottomRightRadius` = 0 sur l'instance (vérifié : surchargeable) |
| pad 16/16 | 4 | **Écartées** — ce sont les blocs véhicule dupliqués et **masqués** de `En route` / `Arrivé` / `Arrivé · frais` / `En cours`. Contenu mort, à supprimer un jour. |

Les hauteurs de variante bougent de **+6 à +9 px** sur 4 d'entre elles. Ce n'est pas
la conversion : c'est le cumul des composants réels, qui font autorité —
`RouteCard` 109 contre 116 pour la frame recopiée, `Divider` 1 px contre un `LINE`
à 0, `TotalBar` 53 contre 69.

## 4 bis. `ActionTile` créé et déployé

## 5. Motifs sans composant — vrais trous du DS

| Motif | Occurrences |
|---|---|
`ActionTile` (Appeler / Chat / Partager / Urgence) | **32** (8 rangées `Tuiles`)
Rangée `Paiement` (illustration + libellé + montant) | **8**
Rangée moyen de paiement (logo + nom + `Radio`) | **6**
`contactRow` (avatar + nom + numéro + chevron) | **4**
`trackingRow` (icône + libellé + n° de suivi) | **4**
Champ de saisie (`inputWrap` / `descInput`) | **3**

**`ActionTile` est traité.** Nouveau set sur `02 · Composants` — axe
`Danger=false|true`, propriétés `Label` (TEXT) et `IconName` (INSTANCE_SWAP), fond
`bg` / `errorSubtle`, icône 20 en `primary` / `error`, libellé `caption`. Les **32**
tuiles du set sont passées en instances.

Deux divergences tranchées en faveur du code, qui seul est tokenisé : la maquette
utilisait un rayon **20** (le code dit `Radii.md` = 12) et un rose **`#FEF3F2`**
hors palette (le code dit `errorSubtle` `#FEE2E2`).

**Côté code** : `ActionTile` était dupliqué **à l'identique** dans
`app/transport/course-active.tsx` et `app/livraison/suivi.tsx`, styles compris.
Extrait dans `components/RideSheet.tsx` (aux côtés d'`ActionPill`) avec
`ActionTileRow` pour la rangée. Les deux écrans l'importent. `npx tsc --noEmit`
propre.

Les autres trous restent ouverts : rangée `Paiement` (8), rangée moyen de paiement
(6), `contactRow` (4), `trackingRow` (4), champ de saisie (3).

## 6. Bilan chiffré

**283 instances** de composants du DS dans le set, **28 composants distincts**,
contre 234 / 26 avant la passe. Le ratio instances / frames brutes passe de **42 %
à 55 %**.

| Composant | Instances |
|---|---|
| `SheetCard` | 43 |
| `Icon` | 41 |
| `Button` · `ActionTile` | 32 chacun |
| `Handle` | 27 |
| `Divider` | 12 |
| `RouteCard` · `PrestataireRow` | 10 chacun |
| `SheetHeader` | 9 |
| `PlaceRow` · `VehicleBlock` · `Radio` | 6 chacun |
| `GammeCard` | 5 |
| `VehicleGroup` · `TotalBar` · `StepProgress` · `PlateChip` · `Illustration/Gamme` · `Avatar` | 4 chacun |
| `ProgressBar` · `ActionPill` · `InfoBanner` | 3 chacun |
| `AvatarStack` · `AltSuggestCard` · `OptionCard` · `CodePill` · `PlaceRow · Accueil` | 2 chacun |
| `SearchBar` | 1 |

---

# Partie XIII — Les sujets ouverts soldés (23 août 2026)

Suite de la Partie XII : le défaut `VehicleBlock`, les blocs morts, et les six
motifs qui n'avaient pas de composant.

## 1. 🐞 `VehicleBlock` / vélo — corrigé par un axe `View=inline`

Le code donnait la règle, avec son commentaire d'origine : la boîte de rendu fait
**64×52** et l'image **48×48 en `resizeMode="contain"`**
(`RideSheet.tsx` · `vehicleRender` / `vehicleRenderImg`). Les deux tailles Figma
observées en découlent exactement — auto 108×88 → **48×39**, vélo 79×88 → **43×48**.
Le composant ne savait pas exprimer « contain », il figeait un seul résultat.

**Correction** : `Illustration/Gamme` gagne un troisième axe `View=inline` —
5 variantes de **48×48** contenant l'art ajusté en `contain` et centré. Le set passe
de 10 à **15 variantes**. Purement additif : `Default` et `top view` sont
inchangés, aucun consommateur existant n'est touché.

`VehicleBlock` pointe désormais sur `View=inline` en 48×48. Changer de gamme ne
réinitialise plus l'échelle : **toutes les variantes inline font la même taille**.
Les 4 `VehicleGroup` Livraison sont repassées en instances du composant, vélo
compris — ce qui était impossible avant.

## 2. Blocs morts supprimés

Les 4 frames `375x185` **masquées** de `Transport · En route / Arrivé /
Arrivé · frais / En cours` — des blocs véhicule dupliqués, invisibles, hérités des
écrans d'origine. Supprimées.

## 3. Six composants créés et déployés

| Composant | Instances | Source code |
|---|---|---|
| `ActionTile` (`Danger=false\|true`) | **32** | `ActionTile` de `course-active.tsx` / `suivi.tsx` |
| `PaymentRow` | **8** | `styles.paymentRow` — fond `bg`, rayon 20, montant Outfit Bold 20/28 en `primary` |
| `PaymentMethodRow` (`Selected=false\|true`) | **6** | `PaymentSheetContent` |
| `TrackingRow` | **4** | `styles.trackingRow` / `trackingNum` (Outfit SemiBold 13, interlettrage 0,5) |
| `ContactRow` | **4** | `styles.contactRow` de `livraison/configure.tsx` |
| `Field` (voir XIV) · `TextArea` | **6** · **1** | `styles.inputWrap` · `styles.descInput` |

`02 · Composants` passe de **24 à 31** composants.

Deux couleurs hors palette corrigées au passage : le fond `#FEF3F2` de la tuile
Urgence (→ `errorSubtle`) et le nom de contact en `#000000` (→ `textPrimary`).

## 4. Contrepartie côté code

`ActionTile` **et** `PaymentRow` étaient dupliqués **à l'identique** — fonction et
styles — dans `app/transport/course-active.tsx` et `app/livraison/suivi.tsx`. Les
deux sont extraits dans `components/RideSheet.tsx` (aux côtés d'`ActionPill`), avec
`ActionTileRow` pour la rangée de tuiles. Imports morts nettoyés (`Image`,
`payIllustration`). `npx tsc --noEmit` propre.

## 5. Bilan

| | Avant Partie XII | Après XII | Après XIII |
|---|---|---|---|
| Instances de composants dans le set | 234 | 250 | **264** |
| Frames brutes | 322 | 236 | **141** |
| Part d'instances | 42 % | 55 % | **65 %** |
| Composants distincts utilisés | 26 | 28 | **28** |
| Composants sur `02 · Composants` | 24 | 25 | **31** |

Les 141 frames restantes sont de la **structure** — conteneurs d'agencement
(`Contenu`, `HandleArea`, `Gauche`, `gap`, `Tuiles`, `Texte`), pas des motifs
réutilisables. Le set ne contient plus de composant recopié à la main.

---

# Partie XIV — Trois composants de saisie, séparés (23 août 2026)

Les frames `Champ De` / `Champ À` des variantes `Adresse` étaient restées brutes.
Elles portent un motif distinct : **deux lignes** (libellé + valeur), **bouton
d'action** à droite, **état actif**.

Un premier essai les a fusionnées avec le champ simple dans un `Field` à deux axes
`Libellé` × `État`. **Abandonné** — décision de séparer. Deux raisons, l'une de
fond, l'autre technique :

- **De fond** : saisir un Lieu et saisir du texte libre ne sont pas le même geste.
  Le premier a un libellé permanent, une valeur pré-remplie, un état actif et un
  raccourci carte ; le second n'a qu'un placeholder.
- **Technique** : dans le set fusionné, l'axe de variante `Libellé` et la propriété
  texte `Libellé` portaient le **même nom**. À la lecture des surcharges, la valeur
  d'axe `"true"` écrasait le libellé — quatre instances se sont retrouvées avec
  « true » affiché. Deux composants, deux espaces de noms, le problème disparaît.

## Les trois composants

| Composant | Forme | Source code |
|---|---|---|
| **`PlaceField`** (`État=repos\|actif`) | 343×60 — libellé + valeur, icône de tête, bouton rond optionnel, liseré `primary` + fond `primarySubtle` à l'actif | `styles.field` / `fieldActive` / `fieldBtn` de `app/home.tsx` |
| **`Field`** | 343×56 — une ligne, icône optionnelle, placeholder | `styles.inputWrap` de `app/livraison/configure.tsx` |
| **`TextArea`** | 343×96 — multiligne, rayon `md`, texte 15/21 | `styles.descInput` |

`PlaceField` : propriétés `Libellé`, `Valeur`, `IconName` + `Icône`,
`Action` + `ActionIcon`. Il est le voisin de `PlaceRow` — l'un **saisit** un Lieu,
l'autre l'**affiche**.

**6 instances** : 4 `PlaceField` (les champs De/À des deux variantes `Adresse`) et
2 `Field` (la modale Destinataire · saisie).

## Reste : l'unification côté code n'est pas faite

Les trois implémentations divergent structurellement, pas seulement visuellement :

- **`home.tsx` · champ « De »** — `TouchableOpacity`, bascule `Text` ↔ `TextInput`
  selon le focus, `autoFocus` inconditionnel ;
- **`home.tsx` · champ « À »** — `View`, toujours un `TextInput`, focus via
  `onFocus`, `autoFocus` conditionnel ;
- **`livraison/configure.tsx` · `inputWrap`** — pas de libellé, pas de bouton.

Extraire un `PlaceField` de code demande d'arbitrer une API (`label`, `active`,
`onPress?`, `onActionPress?`, valeur contrôlée ou rendue) **et** touche au
comportement de focus de l'accueil. Contrairement à `ActionTile` et `PaymentRow`,
duplications à l'identique et purement présentationnelles, ce n'est pas un
déplacement mécanique. À cadrer avant de coder.

## Bilan

**262 instances**, 127 frames brutes → **67 %**. `02 · Composants` : **32
composants**, dont trois de saisie clairement distincts.

---

# Partie XV — `Field` mûri : 12 variantes, benchmark Mobbin (23 août 2026)

Demande : étendre `Field` en un set mature aux standards mobiles, avec une plus
large gamme d'états et de types, **téléphone compris**, tout regroupé.

## 1. Relevé Mobbin (iOS)

| Observation | Références |
|---|---|
| **Erreur** = liseré rouge **et** message sous le champ | [Wolt](https://mobbin.com/screens/6cf1d44c-7839-4bff-8363-a72110639cde) · [PayPal](https://mobbin.com/screens/b5021e3e-e1ed-473f-8353-3680f39fe2c4) · [Google Home](https://mobbin.com/screens/4b71909b-e447-42c1-b1e0-d3bf1220eb16) · [Alan](https://mobbin.com/screens/5cb123bd-28bb-49a2-a6ac-229cc35ae528) (fond teinté) |
| **Astérisque requis** rouge dans le libellé | [Grab Driver](https://mobbin.com/screens/590357eb-8f75-4292-8faa-263d144aa887) · [TheFork](https://mobbin.com/screens/a318597d-3a56-43a3-ac1d-9cd20eeeb3de) · [CHOPT](https://mobbin.com/screens/116e979e-ae95-4914-b09a-b1a15d8e73b6) |
| **Verrouillé** : fond gris + cadenas en trailing | [Airalo](https://mobbin.com/screens/f9a1f5b1-3f23-4c56-9041-2e40e258ab58) · [Acorns](https://mobbin.com/screens/bb59f30c-65e3-435b-9540-2cdc63e08104) · [Airtasker](https://mobbin.com/screens/40078e7d-1a2d-4fe0-bbab-b082a49c8b3c) |
| **Téléphone** : indicatif en cellule préfixe accolée au numéro | [TheFork](https://mobbin.com/screens/a318597d-3a56-43a3-ac1d-9cd20eeeb3de) · [Deel](https://mobbin.com/screens/53bbb738-7815-4749-8442-13967cd07cc2) · [Postmates](https://mobbin.com/screens/6a64e1c5-aeb9-4b25-a9f3-8d6bc92aedef) — ou empilé ([Kraken](https://mobbin.com/screens/60bb19c9-691c-405c-8b63-85350b20ee4b), [Monese](https://mobbin.com/screens/32b5a982-af56-4cb1-ad40-94ad8c615fea)) |

L'astérisque requis confirme la règle déjà écrite au style guide §Formulaires. La
cellule préfixe accolée est déjà ce que faisait `PhoneField` : conservée.

## 2. Deux décisions tranchées

**Traitement au repos.** Trois traitements coexistaient : fond `bg` sans liseré
(code `field` / `inputWrap`), fond `surface` + liseré (`PhoneField`), fond `bg` +
liseré (`SearchBar`). Retenu : **`surface` + liseré `border` 1 px**, la règle déjà
écrite au style guide ligne 356. Appliqué à `Field`, `PlaceField` et documenté pour
`SearchBar`. En contexte, les champs se détachent mieux de la carte blanche et le
focus bleu ressort davantage.

**État erreur.** Le style guide disait « pas de message d'erreur inline en v1 ».
**Levé**, doc mise à jour : un CTA grisé ne dit pas *lequel* des champs bloque. La
validation reste en deux temps — CTA désactivé pour les requis manquants, état
`erreur` pour une valeur saisie invalide.

## 3. Le set

**`Field`** — `Type` (`texte` · `téléphone` · `zone`) × `État` (`repos` · `actif` ·
`erreur` · `désactivé`) = **12 variantes**.

| État | Fond | Liseré |
|---|---|---|
| `repos` | `surface` | `border` 1 px |
| `actif` | `primarySubtle` | `primary` 1,5 px |
| `erreur` | `surface` | `error` 1,5 px |
| `désactivé` | `track` | `border` 1 px |

Structure : `Header` (libellé + astérisque) › `Control` › `Aide`. Onze propriétés —
`Libellé` + `Afficher libellé`, `Requis`, `Valeur`, `Icône` + `IconName`,
`Trailing` + `TrailingIcon`, `Aide` + `Afficher aide`, `Indicatif`.

Le texte d'aide vire au `color-error` sur l'état `erreur`, la valeur au
`textDisabled` sur `désactivé`.

## 4. Absorptions et retraits

`PhoneField` (2 variantes) et `TextArea` sont **retirés** : le premier devient
`Type=téléphone`, le second `Type=zone`. `PhoneField` n'avait **aucune instance**
dans le fichier — c'était une spec jamais posée, alors que le style guide en
faisait « le point d'entrée unique de toute saisie de téléphone ».

`PlaceField` reste **séparé**, comme décidé en Partie XIV — saisir un Lieu n'est pas
saisir du texte libre.

3 instances migrées (2 champs de la modale Destinataire, 1 zone de description).

## 5. Bilan

`02 · Composants` : **30 composants, 100 variantes**. Le set `BottomSheet` reste à
**262 instances / 67 %**.

**Reste ouvert** — le rayon. Le style guide ligne 217 attribue `radius-md` (12 px)
aux champs de saisie, alors que `Field`, `PlaceField`, `SearchBar` et l'ancien
`PhoneField` utilisent tous **16** (`radius/lg`). J'ai gardé 16 : c'est ce que fait
tout le code. La ligne 217 est donc à corriger, ou les quatre composants à repasser
à 12 — décision non prise.

---

# Partie XVI — `IconButton` : tailles et variantes sans fond (23 août 2026)

Demande : des tailles plus petites, utiles pour les actions **dans un champ**, et
une variante secondaire **sans fond**.

## 1. Le set passe de 2 à 12 variantes

Deux axes, calqués sur `Button` qui fait déjà `Variant` × `Size` :

| `Variant` | Traitement | Emploi |
|---|---|---|
| `floating` | `surface` + liseré `hairline` + `shadow-float` | commandes sur la carte |
| `flat` | fond `bg` | actions de feuille |
| `secondary` | **transparent** + liseré `border` | second rang, lisible sur fond teinté |
| `link` | **nu** — ni fond ni liseré | actions inline d'un champ |

| `Size` | Empreinte | Icône |
|---|---|---|
| `lg` | 46 | 24 |
| `md` | 40 | 22 |
| `sm` | **32** | **18** |

Les deux variantes historiques deviennent `floating/lg` et `flat/md` — **empreintes
inchangées**, les 5 instances du fichier sont intactes. Défaut côté code :
`lg` en `floating`, `md` ailleurs, donc aucun site d'appel à toucher.

Sur la demande « secondary sans background » : le vocabulaire de `Button` distingue
déjà `secondary` (transparent **avec** liseré) et `link` (nu). Les deux sont
construits — `secondary` pour ce qui doit rester délimité, `link` pour ce qui ne
doit rien peser.

⚠️ **`sm` fait 32 px, sous la cible tactile de 48.** Documenté dans le composant et
au style guide : à n'utiliser qu'à l'intérieur d'un contrôle qui porte déjà la zone
de frappe (champ, rangée).

## 2. Mis à l'œuvre

| Où | Avant | Après |
|---|---|---|
| `Field` · slot trailing (4 variantes `texte`) | icône nue 18 px | `IconButton link/sm` |
| `PlaceField` · bouton carte (2 variantes) | frame ronde bricolée 40 px | `IconButton secondary/md` |

Les propriétés `TrailingIcon` et `ActionIcon` sont **supprimées** : l'icône se règle
désormais sur la propriété `Icon` de l'`IconButton` imbriqué, que Figma expose
nativement. Une propriété de moins à maintenir de chaque côté.

Restent bricolés à la main, hors périmètre : `CloseBtn` 36 px
(`Livraison · Configure`) et `manualIcon` 44 px (`Destinataire · contacts`, un
cercle décoratif, pas un bouton).

## 3. 🐞 Piège d'API — le 9ᵉ

**Cloner une variante efface les `componentPropertyReferences` de ses enfants.**
Les 10 variantes créées par clonage avaient toutes perdu le lien vers
`Icon#421:0` : la propriété portait la bonne valeur, l'icône rendue restait au
défaut. Symptôme trompeur — `componentProperties` affiche la valeur voulue, seul le
rendu trahit.

**Parade** : après tout `clone()` de variante, réappliquer
`componentPropertyReferences` sur chaque enfant concerné, puis **vérifier par le
`mainComponent` réellement résolu**, pas par la valeur de la propriété.

Même famille que le piège relevé en Partie XIV — cloner une variante hors d'un set
perd aussi les définitions de propriétés du set.

## 4. Bilan

`02 · Composants` : **30 composants, 110 variantes**. `IconButton.tsx` porte les
mêmes quatre variantes et trois tailles ; `npx tsc --noEmit` propre.

---

# Partie XVII — `Field` : l'axe `Contenu` (23 août 2026)

Manque relevé : les 12 variantes montraient toutes une **valeur**. L'état vide,
celui qu'on voit le plus dans un formulaire, n'existait nulle part.

## 1. Pourquoi un troisième axe et pas un cinquième état

Vide/rempli est **orthogonal** à repos/actif/erreur/désactivé, pas une valeur de
plus sur la même échelle :

- un champ **focus et vide** est le cas le plus courant — on vient de le toucher ;
- un requis **en erreur** est vide *par définition* ;
- un champ **désactivé** peut être vide comme rempli.

Les huit combinaisons ont un sens. D'où `Type` × `État` × `Contenu` = **24
variantes**, matrice pleine, aucun trou.

## 2. Ce que change `Contenu=vide`

| | `rempli` | `vide` |
|---|---|---|
| Texte | prop `Valeur`, en `textPrimary` | prop **`Placeholder`**, en `textTertiary` |
| Effacement | `IconButton link/sm` présent | **absent** — rien à effacer |
| Désactivé | valeur en `textDisabled` | placeholder en `textDisabled` |

Deux propriétés texte distinctes plutôt qu'une : on peut renseigner `Valeur` **et**
`Placeholder` sur une instance et basculer `Contenu` pour comparer.

**Limite Figma à connaître** : une propriété TEXT n'a qu'**un seul défaut pour tout
le set**. Les variantes `vide` affichent donc « Nom du destinataire » y compris en
`téléphone` et en `zone`. C'est cosmétique sur la planche — chaque instance
surcharge — mais ça ne peut pas être corrigé sans dupliquer la propriété par type,
ce qui coûterait plus cher que ça ne rapporte.

## 3. Effacement étendu au type `téléphone`

Ajouté côté design : les quatre variantes `téléphone` portent le même
`IconButton link/sm` que `texte`, correctement câblé sur la propriété `Trailing`.
La couleur du × **suit l'état** — `textTertiary` au repos, `primary` en actif,
`error` en erreur. Règle cohérente, conservée.

Une correction appliquée : sur `désactivé`, le × était en `textTertiary` `#9CA3AF`
alors que la valeur qu'il effacerait est en `textDisabled` `#D1D5DB` — le bouton
paraissait plus actif que le champ. Aligné sur `textDisabled`.

**`zone` l'a aussi**, sur décision : le × se pose **en haut à droite** — le contrôle
passe en rangée (`counterAxisAlignItems: MIN`), texte à gauche en `FILL`, bouton
aligné sur la première ligne. C'est là qu'on va le chercher dans une zone
multiligne, pas au centre vertical.

Bilan de l'effacement sur les 24 variantes : présent sur les **12 `rempli`**,
absent des **12 `vide`**, la couleur suivant l'état partout (`textTertiary` /
`primary` / `error` / `textDisabled`), toujours bindée à un token.

## 4. Rappel du piège de clonage

Les 12 variantes `vide` sont des clones — donc **toutes leurs
`componentPropertyReferences` étaient perdues** (cf. Partie XVI §3). Réappliquées
en même temps que la différenciation, puis **auditées** : zéro référence manquante
sur les 24.

## 5. Bilan

`02 · Composants` : **30 composants, 122 variantes**. `Field` en porte 24 à lui
seul — c'est le composant le plus dense du système, et le plus sollicité.

---

# Partie XVIII — Rangées et listes unifiées (23 août 2026)

Dernier îlot non systématisé : **dix composants faisaient « rangée »** et aucun ne
s'accordait — trois largeurs (335 / 343 / 295), sept tailles de leading sans
échelle, quatre paddings verticaux, quatre gaps, trois tailles de trailing. Un seul
conteneur, `SettingsGroup`, dont le retrait de séparateur codé en dur (52 px) était
justifié par « icône 22 + gap 14 + padding 16 » alors que `SettingsRow` a un gap de
**12**. Le conteneur ne s'accordait même pas avec sa propre rangée.

## 1. Ce qui remplace quoi

| Nouveau | Absorbe |
|---|---|
| **`ListRow`** — 4 variantes (`État=repos\|désactivé` × `Ton=neutre\|destructif`) | `PlaceRow` · `SettingsRow` · `ContactRow` · `PaymentMethodRow` · `PrestataireRow` |
| **`List`** — `Style=carte\|plat`, slot `Contenu`, titre de section, note | `SettingsGroup` |
| **`Divider`** — axe `Retrait` = `aucun` · `icône` 50 · `avatar` 76 | l'ancien `Divider` à retrait fixe |
| **`Medallion`** — `Forme=cercle 42\|squircle 56` × `Ton=neutre\|accent` | les médaillons dessinés à la main dans `PlaceRow` et `PaymentMethodRow` |

**Spécification unique de `ListRow`** : largeur 335, gap 12, padding 12/16, trailing
18, hauteur 59. Le retrait `icône` de `Divider` vaut **50** — exactement
`padding 16 + leading 22 + gap 12`. Il n'est plus codé en dur, il se déduit.

**37 instances migrées** : PlaceRow 15 · PrestataireRow 9 · PaymentMethodRow 6 ·
ContactRow 4 · SettingsRow 3. Les six anciens composants sont supprimés.

## 2. Deux limites d'API contournées

**Un slot ne peut pas insérer de séparateurs.** L'axe `Séparateur` prévu sur `List`
aurait été mort dès qu'on remplace le contenu du slot. Le retrait est donc porté par
`Divider`, où il agit réellement.

**🐞 INSTANCE_SWAP ne redimensionne pas son slot.** Le `Leading` était d'abord une
propriété INSTANCE_SWAP fixée à 22×22 : y échanger un `Avatar 64` laissait un rendu
**22×22**, et `resize()` sur un enfant d'instance est refusé. C'est le pendant exact
du piège de `VehicleBlock` (Partie XIII) — là un swap de **variante** adoptait la
taille naturelle et débordait, ici un swap de **composant** garde la taille du slot.

**Parade** : `Leading` est un **SLOT**, qui accepte n'importe quel contenu à sa
taille naturelle — icône 22, `Medallion` 42, `Avatar` 48 ou 64, `Medallion` squircle
56, et demain un `FlagChip` ou un `Logo` sans toucher au composant.

**🐞 Piège n° 10 — `createSlot()` sur un set existant ne fusionne pas.** Appelé sur
quatre variantes déjà combinées, il crée **quatre** propriétés `Leading` distinctes
(alors que `combineAsVariants` **après** création les fusionne, comme sur `List`).
Parade : lier les quatre slots à une seule clé via
`componentPropertyReferences = { slotContentId: clé }`, puis supprimer les trois
autres propriétés.

## 3. L'étoile de notation conservée

`PrestataireRow` affichait `★ 4,9 · 1.240 courses` — une icône suivie de texte, que
le `Sous-titre` d'une rangée générique ne sait pas porter. Un slot n'était pas
possible à cet endroit (il doit être enfant direct du composant, or le sous-titre
vit dans une colonne). Ajouté à la place : **`Sous-titre icône`** (booléen, faux par
défaut) + **`Sous-titre icône nom`** (swap). Les 9 instances gardent leur étoile.

À noter : la couleur du vecteur **ne survit pas** au swap d'icône — il faut la
réappliquer sur chaque instance. Troisième variante du même piège.

## 4. Bilan

`02 · Composants` : **26 composants, 119 variantes** — six de moins qu'avant, pour
une couverture plus large. `01 · Primitives` gagne `Medallion` et le `Divider`
étendu.

**Reste à faire côté code** : `PlaceRow.tsx`, `SettingsRow.tsx` et `SettingsGroup.tsx`
existent toujours, ainsi que `RideSheet.PrestataireRow`. Le pendant code de
`ListRow` / `List` n'est pas écrit — c'est le plus gros chantier de synchronisation
restant, et il touche les écrans Compte, l'accueil et les feuilles de course.

---

# Partie XIX — `Radio` recalibré, `Trailing` en slot (23 août 2026)

## 1. La taille dépend du registre

`Radio` faisait **26**, alors qu'`OptionCard` portait un radio **fait main à 22** —
même traitement, deux tailles. J'ai d'abord normalisé à 22 en m'appuyant sur
`OptionCard`. **C'était une erreur de méthode** : 22 venait du fichier, pas du
benchmark.

Relevé Mobbin refait, la taille suit le **registre** :

| Registre | Taille | Exemples |
|---|---|---|
| Listes de **réglages** | 20–22 | [Rivian](https://mobbin.com/screens/04cf9ab7-83c4-48fd-b175-e7b15716d8ff) · [Whatnot](https://mobbin.com/screens/be978a11-8055-4d35-ba43-65bdde4f6137) · [H&M](https://mobbin.com/screens/bd430fa6-233e-4afb-ab1b-8117f0057c8f) · [Fidelity](https://mobbin.com/screens/06438471-82de-4abe-82d7-5fdd43e2a602) |
| Écrans d'**achat / choix d'offre** | 24–28 | [Skip](https://mobbin.com/screens/f765604d-802a-453b-951f-162b50dee261) · [Taco Bell](https://mobbin.com/screens/59832cdd-ea77-4e4a-b9d0-f2d523bbd5ee) · [Peerspace](https://mobbin.com/screens/3b908023-071a-4811-9c36-b22769daf1b9) · [Afterpay](https://mobbin.com/screens/967dae0b-7b7b-4fb6-befa-43e40e7a3dde) |

Les deux usages de Fiw — moyen de paiement, mode de livraison — sont du commerce.
**26 est la bonne taille** ; c'est le 22 d'`OptionCard` qui était l'anomalie.
Rétabli, coche 15. La règle de registre est écrite dans la description du composant.

## 2. Ce qui était vraiment cassé

- **Liseré non sélectionné en `textDisabled` `#D1D5DB`** — un token de *désactivé*
  sur un contrôle actif. Il paraissait éteint et interdisait un vrai état
  désactivé. Passé en `textTertiary`.
- **Deux états seulement.** `Radio` a désormais 4 variantes :
  `Selected=false\|true` × `État=actif\|désactivé`.
- **Six radios dessinés à la main** — 4 dans `OptionCard`, 2 sur l'écran
  `Livraison · Groupage` — remplacés par des instances. Il n'en reste aucun.

**Idiome non tranché** : Fiw utilise le disque plein à coche, l'idiome de la *case
à cocher*. Pour un choix exclusif, le benchmark préfère nettement l'**anneau +
point plein** (8 références contre 3). À décider.

## 3. `Trailing` devient un slot

Même piège que le `Leading` (Partie XVIII) : `Trailing` était un INSTANCE_SWAP fixé
à 18×18. Y échanger un `Radio` de 26 le rendait **écrasé à 18** — mesuré sur les
10 trailings du fichier, **tous** écrasés, dont 6 radios.

`Trailing` est donc un **SLOT** lui aussi. Après conversion : 30 chevrons à 18 et
6 radios à **26**, chacun à sa taille naturelle. `Leading visible`, perdu lors de la
conversion du leading, est rebranché.

`ListRow` porte maintenant deux slots et 11 propriétés.

## 4. 🐞 Piège n° 11 — `createSlot()` réinitialise l'auto-layout

Après conversion, les quatre variantes étaient retombées à **padding 8 et gap 8**
au lieu de 12/16 et 12 — hauteur 51 au lieu de 59, titre qui ne tronquait plus.
`createSlot()` remet les réglages d'auto-layout du composant à leurs valeurs par
défaut.

**Parade** : réappliquer `layoutMode`, `itemSpacing`, `padding*`,
`counterAxisAlignItems`, les modes de dimensionnement **et l'ordre des enfants**
après chaque `createSlot()`, puis vérifier la hauteur.

Cumulé avec le piège n° 10 (les slots d'un set existant ne fusionnent pas),
`createSlot()` demande systématiquement trois réparations : fusion des clés,
restauration de l'auto-layout, remise en ordre des enfants.

---

# Partie XX — `ListRow` gagne le ton action (24 août 2026)

## 1. Un motif déjà décidé, jamais construit

`Ton` n'avait que `neutre` et `destructif`. Or la **rangée-action bleue** est
nommée noir sur blanc au style guide §Formulaires (ligne 382) — « le bleu marque
signale l'action (une rangée requise vide se style en **rangée-action bleue**, ex.
“Ajouter le destinataire *”) » — et le code la refait à la main à trois endroits :
`livraison/configure.tsx:413` (« Saisir un autre destinataire »),
`compte/lieu.tsx:225` et `compte/numero.tsx:129` (« Renvoyer le code »).

## 2. Ce que montre le benchmark

Le libellé en accent est la **constante** ; c'est le leading qui varie.

| Traitement | Référence |
|---|---|
| Libellé accent · leading **neutre** · sous-titre gris | [Grab](https://mobbin.com/screens/24a30a02-78ad-4923-90b6-1f4af724c8f1) — « Add work », « Add new » |
| Libellé accent · leading **accent plein** | [Yazio](https://mobbin.com/screens/3ca9daea-b402-49d9-b1d5-6423fcc49309) — « + Add ingredient » |
| Libellé accent · **aucun** leading | [monday.com](https://mobbin.com/screens/3f45c8a5-25e7-469e-a4a1-769f2be710d1) — « + New Item » |
| Libellé sourd · leading gris | [Transit](https://mobbin.com/screens/52dcb21f-ccf2-490f-91c1-078bc5a8e3bf) — « Add location… » |

Comme `Leading` est un **slot**, l'axe n'a besoin de piloter que le texte : les
quatre traitements restent atteignables sans variante supplémentaire. C'est le
bénéfice concret de la conversion en slot de la Partie XIX.

## 3. Ce qui est construit

`Ton = neutre · action · destructif` — **6 variantes** (× `État`).

`Ton=action` : titre en `primary`, sous-titre et valeur inchangés en
`textSecondary`, chevron neutre. Le contenu par défaut du slot `Leading` est une
icône en `primary` — c'est le précédent de Fiw (`manualRow` : pastille
`primarySubtle` + icône `primary`), plus assertif que Grab, moins que Yazio. Un
consommateur qui veut le registre Grab dépose simplement une icône neutre.

Padding **8/0/8/0** et hauteur 58 conservés tels quels.

## 4. 🐞 Piège n° 12 — cloner une variante détruit ses slots

Les variantes `action` ont été créées par clonage. Résultat : leurs `SLOT` étaient
devenus des **`FRAME` ordinaires**, sans référence de propriété. Le composant
paraissait correct — mêmes noms de calques, même rendu — mais les deux emplacements
n'étaient plus pilotables.

**Parade** : après tout clonage d'une variante à slots, reconstruire les slots
(`createSlot()`), les relier aux clés **existantes** via `slotContentId`, supprimer
les clés surnuméraires que `createSlot()` vient de créer (piège n° 10), puis
restaurer l'auto-layout et l'ordre des enfants (piège n° 11).

Trois pièges de clonage se cumulent désormais sur le même geste :
références perdues (n° 9), clés non fusionnées (n° 10), auto-layout réinitialisé
(n° 11) — et maintenant slots dégradés en frames (n° 12). **Cloner une variante à
slots n'est jamais une opération neutre : il faut auditer après.**

---

# Partie XXI — La révélation allégée (24 août 2026)

## 1. Ce que fait cet état

`État=Révélation` est le **point de convergence** du hub `searching` : l'issue
`near` y va directement (`searching.tsx:165`), l'issue `far` y arrive après
acceptation du frais de rapprochement (`:198`). C'est la « carte révélation
universelle » — la même annonce quel qu'ait été le chemin, pour ne pas mettre en
scène différemment celui qui a payé un frais.

Elle est **temporisée, pas pilotée** : 2 600 ms (`REVEAL_DURATION`, `:37`) puis
`router.replace` vers `course-active` (`:188`). Pendant ces 2,6 s le voile de carte
s'efface (600 ms), la barre de progression se termine (350 ms), la carto se
recentre, et **le bouton retour comme l'interrupteur de démo disparaissent**
(`phase !== 'reveal'`, `:276`). Aucune action n'y est possible.

## 2. Le `TotalBar` retiré

Un écran sans action n'a pas à porter un montant. Et ce montant était affiché
**trois fois** :

| Où | Rôle |
|---|---|
| Écran `frais` (`searching.tsx:310`, `livraison:366`) | « Total à payer » — le montant qu'on **accepte** |
| ~~Révélation~~ | ~~redite, sans action~~ → **retiré** |
| `course-active` | « Paiement », dans les détails de la course |

Retiré des deux variantes Figma **et** des deux écrans
(`searching.tsx:349`, `livraison/searching.tsx:458`), imports nettoyés.
`finalPrice` reste utilisé pour la carte de total et les paramètres de route —
aucun code mort. `npx tsc --noEmit` propre.

Ce qui **reste** sur la révélation Livraison : le bandeau de résultat du groupage.
Ce n'est pas une redite — c'est la seule fois où l'on apprend si le colis voisin a
confirmé.

## 3. Deux bugs de clonage corrigés au passage

La révélation Livraison avait été construite en clonant celle du Transport. Elle
affichait donc encore **« Toyota Corolla · Blanche » et une voiture** au lieu du
vélo cargo. Corrigé : `Vehicle`, `Plate` et l'illustration (`mobility option=vélo`,
`View=inline`).

Les deux variantes tombent à 230 (Transport) et 325 (Livraison) — la différence
tient au bandeau de groupage et au titre qui passe sur deux lignes.

---

# Partie XXII — `RouteCard` ramené à une seule présentation (24 août 2026)

## 1. La variante encadrée supprimée

`RouteCard` portait deux présentations : `Plain=false` (cadre `surfaceAlt`, rail
vertical reliant les deux points, crayon en `IconButton`) et `Plain=true` (à plat,
deux rangées séparées par un filet en retrait de 32, pilule « Modifier »).

**`Plain=false` avait 0 instance** et les **quatre** appels du code passaient tous
`plain`. Supprimée en Figma, branche correspondante retirée de
`RideSheet.RouteCard` avec ses six styles morts (`routeCard`, `routeRail`,
`routeLine`, `routeCol`, `routePoint`, `routeEdit`). Le prop `plain` disparaît des
quatre sites d'appel.

Le set n'ayant plus qu'une présentation, il est **dissous** : `RouteCard` redevient
un **composant simple** (`441:93`), 335×113, cinq propriétés, aucun axe. Les 10
instances du fichier sont intactes.

## 2. Pas d'état incomplet — le rôle du composant l'exclut

J'avais ajouté un axe `État=complet|incomplet`, où l'arrivée vide devenait une
« rangée-action bleue ». **Écarté**, et pour une bonne raison : `RouteCard` ne fait
que **restituer** un itinéraire déjà renseigné. Quand on veut le changer, le CTA
« Modifier » renvoie à l'écran de saisie — c'est là que vivent les états de
renseignement, pas dans la carte de restitution.

Le `destination={params.destName || ''}` de `livraison/configure.tsx:238` reste une
**garde défensive**, pas un état à modéliser : l'écran n'est pas censé être atteint
sans destination.

## 3. Deux pièges d'API rencontrés

**Une référence de nœud devient périmée dès qu'on supprime un de ses enfants.**
Après `variant.remove()`, lire `set.children` lève
« The node with id … does not exist ». Il faut **relire le nœud** par son id après
toute suppression structurelle.

**`findAll` ne rend pas le même résultat selon la page courante.** Le même comptage
d'instances a rendu 1 puis 10 selon que `figma.currentPage` était la page des
composants ou celle des patterns. Un garde-fou comparant un avant et un après doit
compter **dans le même contexte de page**, sinon il annule des opérations
correctes — ce qui m'est arrivé une fois ici.

## 4. Collision de noms évitée

L'axe s'était d'abord appelé `Arrivée` — **le même nom que la propriété texte
`Arrivée`**. C'est la collision qui avait corrompu quatre champs du set `Field`
(Partie XIV). **Règle** : ne jamais nommer un axe de variante comme une propriété
du même composant, et le vérifier au moment de l'ajouter.

## 5. Divergence restante à trancher

Figma affiche l'action d'édition en **pilule `ActionPill` « Modifier »** ; le code
rend une **icône crayon nue** (`<Icon name="edit" size={18} />`). Or le style guide
réserve à ce cas le `Button variant="link"` — « action-lien inline dans une rangée
ou un formulaire (ex. “Modifier” un numéro) ». Les trois ne s'accordent pas ; aucun
n'a été changé.

---

# Partie XXIII — `InfoRow` : les rangées de restitution patronnées (24 août 2026)

## 1. Le motif retenu

Les rangées qui **restituent** un fait — déjà renseigné par l'utilisateur, ou
produit par une de ses actions — étaient des **pastilles remplies** : fond `bg`,
rayon 20, padding 12, chacune isolée. Empilées, elles se lisaient comme un tas de
chips grises.

Le motif retenu les met **à plat**, séparées par un `Divider`, alignées sur le même
rythme que le `RouteCard` juste au-dessus. La carte se lit alors comme **une liste
de faits**.

| | Avant (`PaymentRow` / `TrackingRow`) | `InfoRow` |
|---|---|---|
| Surface | fond `bg`, rayon 20, padding 12 | **aucune** |
| Séparation | rien | **`Divider`** pleine largeur |
| Libellé | 12–13 px | **14 Regular** `textSecondary` |
| Valeur | 13 SemiBold / 20 Bold | `normale` **14 SemiBold** ink · `montant` **20 Bold** `primary` |

`Leading` est un **slot**, pas un swap : le paiement n'a pas une icône mais un
**rectangle illustré 24×16**, qu'un INSTANCE_SWAP aurait écrasé (piège de la
Partie XVIII).

## 2. Portée

`PaymentRow` (8) et `TrackingRow` (5) sont **absorbés puis supprimés**. Les 11
pastilles restantes sont migrées, avec insertion du filet manquant dans 4 cas.

Côté code, `RideSheet.PaymentRow` devient `InfoRow`, et un `Divider` est exporté
avec un `inset` qui reprend l'axe `Retrait` du composant Figma. Les deux sites
d'appel (`course-active.tsx`, `suivi.tsx`) passent dessus, ainsi que le
`styles.trackingRow` que `suivi.tsx` faisait encore à la main. Cinq styles morts
retirés (`trackingRow`, `trackingNum`, et les trois de `paymentRow`).
`npx tsc --noEmit` propre.

## 3. 🐞 Une régression de ma part, et ce qu'elle apprend

En recâblant l'axe de `RouteCard` (Partie XXII) j'avais écrit
`rowFrom.children.find(c => c.type === 'INSTANCE')` pour attraper la pilule
« Modifier ». Or dans `Row` les enfants sont `[Icon, Col, ActionPill]` : le premier
`INSTANCE` est **l'icône**. La propriété `Edit` s'est donc retrouvée liée à
l'**icône de départ**, qui disparaissait sur les 7 instances où `Edit=false`.

**Leçon** : ne jamais cibler un enfant par son *type* quand plusieurs enfants
partagent ce type. Cibler par nom, ou par composant principal résolu.

Le rebranchement seul n'a pas suffi : les instances gardaient une **surcharge de
disposition périmée** (`Col` à x=0, largeur 343 au lieu de 311 — la largeur qu'il
avait quand l'icône était masquée). Ni `layoutSizingHorizontal` ni `layoutGrow` ne
la lèvent : seul **`resetOverrides()`** y parvient. Parade employée : relever
`componentProperties`, appeler `resetOverrides()`, puis réappliquer les valeurs.

## 4. Bilan

`02 · Composants` : **25 composants, 120 variantes** — deux de moins pour une
couverture identique.

---

# Partie XXIV — Passe d'architecture sémantique (24 août 2026)

Audit du set `BottomSheet` (`486:1447`) puis correction, en six temps. Deux
reproches de mon audit initial **ne tenaient pas** et sont retirés :
`Radio.Selected × État` est une donnée croisée à un état d'interaction — la même
structure que `Field.Contenu × État`, pas un doublon ; et les booléens-axes
(`Selected`, `Active`, `Danger`, `Repli`, `Bordered`) nomment chacun une dimension
réelle, les fondre appauvrirait le sens.

## 1–2. Vocabulaire des axes unifié

Sept noms couvraient trois idées. Canonisé :

| Axe | Avant | Composants alignés |
|---|---|---|
| `État` | `State` (anglais) | OptionCard, GammeCard, Button/State — valeurs francisées (`actif`, `inactif`, `pressé`, `désactivé`, `chargement`) |
| `Ton` | `Tone` | InfoBanner → `info`, `alerte` |
| `Size` | `Taille` | Medallion → `md`, `lg` |
| `Variant` | `variant` minuscule | SearchBar |

`État` couvre maintenant **8 composants**, `Size`, `Ton` et `Variant` **4** chacun.

Le vocabulaire de `Ton` est un jeu unique dont chaque composant tire son
sous-ensemble : `neutre · accent · succès · destructif · action · info · alerte`.
`OptionCard` passe de `success|primary` à `succès|accent`. Les jeux diffèrent d'un
composant à l'autre parce que les sémantiques diffèrent — c'est la **langue** et le
**nom d'axe** qui sont unifiés, pas les valeurs.

## 3. Propriétés : une convention par nature

| Nature | Nom canonique | Composants |
|---|---|---|
| INSTANCE_SWAP d'icône | **`IconName`** | 9 (OptionCard, IconButton, Callout rejoignent Medallion, ActionPill, InfoBanner, ActionTile, PlaceField, Field) |
| BOOLEAN de visibilité d'icône | **`Icône`** | 5 (Button, Chip rejoignent ActionPill, PlaceField, Field) |
| Libellé | **`Libellé`** | Button, Button/State, Chip, ActionTile, ActionPill, ReceiptRow |

`OptionCard` et `AltSuggestCard` passent de `Title`/`Meta` à `Titre`/`Méta` — plus
de composant à trois langues.

## 4. Redondances — et une erreur d'audit

**`TotalBar` supprimé** : ses 2 instances étaient `visible: false`, du contenu mort.
Pas à absorber, à retirer.

**`ReceiptRow` absorbé par `InfoRow`** : même anatomie à valeurs dérivées
(15 Regular / 15 Medium, gap 12 contre 14 Regular / 14 SemiBold, gap 8). Les 6
instances de `ReceiptCard` migrées, `ReceiptCard` passe de 327 à **261** de haut.

**`CodePill` : mon reproche était faux.** Il instancie déjà `CodeCell` ×4 ; j'avais
déduit des cellules faites main de la présence de 4 props `Chiffre N`. Architecture
correcte, rien à faire.

Bug corrigé au passage dans `InfoRow` : le libellé était en hauteur automatique à
largeur contrainte, donc écrasé par la valeur en `FILL` — « Frais de rapprochement »
s'enroulait sur trois lignes. Il prend maintenant sa largeur naturelle.

## 5. `Divider` découplé

`Retrait = aucun | icône | avatar` — une primitive dont les valeurs désignaient les
tailles de leading de `ListRow`, un composant de la couche au-dessus. Passé en
valeurs **géométriques** : `0 | 50 | 76`. La description explique d'où viennent 50
et 76 sans que l'axe en dépende.

## 6. Deux motifs répétés devenus composants

| Composant | Remplace | Instances |
|---|---|---|
| **`ActionTileRow`** (slot `Tuiles`) | 8 frames `Tuiles` | 8 |
| **`AlertBadge`** (56, `errorSubtle`, icône 28 `error`) | 4 frames `AlertBadge` | 4 |

Côté code, `ActionTileRow` existait déjà ; `AlertBadge` est extrait des
`styles.cancelBadge` / `styles.sosBadge` dupliqués dans `course-active.tsx` et
`suivi.tsx`, et remplace les quatre usages. `npx tsc --noEmit` propre.

## Bilan

| | Avant la passe | Après |
|---|---|---|
| `01 · Primitives` | 17 | **18 composants / 192 variantes** |
| `02 · Composants` | 25 | **24 composants / 119 variantes** |

> **Correction du 24 août 2026 — le recensement d'instances ci-dessus était faux.**
> J'avais inscrit « 344 instances / 111 frames brutes = 76 % », en progression
> depuis « 320 / 123 = 72 % ». Ce chiffre ne se reproduit sous **aucune** méthode
> de comptage ni **aucun** périmètre : le set `486:1447` donne 160 instances /
> 75 frames brutes (68 %) en comptant chaque instance à son sommet et en excluant
> les frames internes aux instances ; 552 / 365 (60 %) en descendant dans les
> instances ; la page `03 · Patterns` entière donne 195 / 132 (60 %). Les trois
> mesures sont reproductibles, le 344/111 ne l'est pas — à ignorer, ainsi que la
> progression 72 % → 76 % qui en découlait.
>
> **Méthode de référence désormais** : périmètre = les 32 variantes du set ; une
> instance compte une fois, à son sommet ; une frame compte comme « brute » si
> aucun de ses ancêtres jusqu'à la variante n'est une instance. Soit
> **160 instances / 75 frames brutes = 68 %** au 24 août 2026.

## Partie XXV — Les trois points laissés ouverts, tranchés (24 août 2026)

Les trois éléments de la section « Reste à trancher » de la Partie XXIV. Deux de
mes trois formulations étaient fausses ; les faits l'ont montré avant que je ne
touche à quoi que ce soit.

### 1. Le baril `RideSheet.tsx` — défait

Le reproche visait le nom. La vraie faute était structurelle : **la convention du
dossier est un composant par fichier avec export par défaut, et 32 fichiers sur 33
la respectaient**. `RideSheet.tsx` était le seul baril — 617 lignes, 23 exports.

Les consommateurs donnaient la ligne de partage : `InfoRow` et `Divider`
servaient déjà `ReceiptCard`, qui n'est pas une feuille. Le fichier confondait
donc **le châssis de feuille** et **ce qui se trouve dedans**.

- Le châssis rejoint `components/Sheet.tsx`, sa maison légitime, qui portait déjà
  `sheetSurface`, `Handle`, `SheetHeader` : `CARD_RADIUS`, `CARD_GAP`,
  `groupedSheetSurface`, `SheetCard`, `flattenCards`, `GroupedSheet`. Le fichier
  documente désormais les **deux** motifs de feuille du produit — la surface
  blanche unique et le fond `track` d'où émergent des cartes.
- Le contenu éclate en **14 fichiers** à export par défaut : `ProgressBar`,
  `AvatarStack`, `Badge`, `PlateChip`, `PrestataireRow`, `VehicleGroup`,
  `AltSuggestCard`, `RouteCard`, `ActionPill`, `AlertBadge`, `InfoRow`,
  `Divider`, `ActionTile` (+ `ActionTileRow`), `InfoBanner`.
- **`TotalBar` est supprimé.** Retiré du set Figma à la Partie XXIV (ses 2
  instances étaient `visible:false`), il ne restait plus dans le code que comme
  export sans appelant. Sa seule autre trace était un commentaire de
  `constants/radii.ts`.
- **Cinq exports deviennent privés** : `CARD_RADIUS` hors du châssis,
  `VehicleBlock`, `PrestataireAvatar`, `flattenCards`, `fmt` — aucun n'avait de
  consommateur externe. `VehicleBlock` vit maintenant à l'intérieur de
  `VehicleGroup.tsx`, qui est le seul à l'appeler.
- **La dépendance croisée disparaît** : les trois composants qui importaient
  `CARD_RADIUS` du châssis (`VehicleBlock`, `VehicleGroup`, `InfoBanner`) lisent
  `Radii.card` directement. Plus aucun composant de contenu ne dépend de la
  feuille.

Bénéfice de lecture concret : `livraison/suivi.tsx` passait par une ligne
d'import de 12 symboles ; il nomme maintenant huit fichiers, et on voit ce qu'il
consomme sans ouvrir le baril.

### 2. Les modales — l'asymétrie n'était pas celle que j'avais décrite

J'avais écrit que « les modales Livraison n'ont pas de `SheetHeader` alors que les
Transport en ont reçu un ». Le relevé des 9 modales du set dit autre chose : le
clivage n'est pas Transport/Livraison, **il est par type de modale**, et
7 modales sur 9 portaient déjà un en-tête.

| Modale | Transport | Livraison |
|---|---|---|
| Annuler | `SheetHeader` | titre centré sous le badge |
| SOS | `SheetHeader` | **titre « Annuler la livraison ? »** |
| Paiement | `SheetHeader` | `SheetHeader` |
| Décrire le colis · Destinataire ×2 | — | `SheetHeader` |

Deux découvertes au passage :

- **Un défaut de contenu réel** : `Livraison · Modale · SOS` affichait
  « Annuler la livraison ? » au-dessus du corps de texte SOS. C'est le symétrique
  exact du défaut corrigé côté Transport à la Partie XXIV — la copie fautive
  existait des deux côtés, je n'en avais réparé qu'une. L'`AlertBadge`, lui,
  portait bien `sos/fill`.
- **Le `Handle` n'était pas en cause.** Son parentage diffère (dans la première
  carte côté Transport, à la racine côté Livraison) mais il est `ABSOLUTE` en
  (168, 6) dans les neuf cas : le rendu est identique. Rien à corriger — noté
  pour ne pas y revenir.

Résolution : la convention majoritaire du set l'emporte, **toute modale porte un
en-tête**. Les deux modales Livraison reçoivent un `SheetHeader`, le titre quitte
le corps, et `AlertBadge` + texte passent dans un sous-cadre à gap 8 — la
structure exacte de Transport. Les sous-cadres `Frame 7`/`Frame 8`/`Frame 11`/
`Frame 13` sont renommés `Corps` sur les quatre.

Vérification : les hauteurs coïncident désormais au pixel — Annuler **370** de
part et d'autre, SOS **302**.

Le code a suivi : les deux `BottomSheet` d'annulation reçoivent leur `title` et
perdent le `<Text variant="heading1">` centré qui doublonnait. La croix
n'introduit aucune échappatoire nouvelle : `BottomSheet` se fermait déjà au
glissé vers le bas et au tap sur le voile.

### 3. `Avatar` — l'axe numérique est correct, le défaut était ailleurs

J'avais présenté `Size = 48|64` comme « une exception à assumer ». C'est un faux
problème : le code prend `size?: number` et **déduit tout par formule**
(`borderRadius: size/2`, `fontSize: size*0.38`). Aucun cran ne porte de décision
de design, donc `sm|md|lg` y serait une fausse abstraction. La règle générale est
maintenant écrite dans le style guide.

Le vrai défaut apparaît en cherchant : **sept valeurs ad hoc** aux points
d'appel — 44, 48, 60, 64, 72, 88, 112. Et le retrait `Divider` tokenisé à la
Partie XXIV le dénonce : 76 = 16 (padding) + **48** (avatar) + 12 (gap). La
taille d'avatar de rangée du système est donc 48, or deux écrans utilisaient 44 et
un troisième 60 là où la carte prestataire dit 64.

`AVATAR_ROW` (48) et `AVATAR_CARD` (64) sont exportés depuis `Avatar.tsx`, et les
trois points d'appel hors système sont recalés : `affilie/reseau.tsx` 44 → 48,
`livraison/configure.tsx` 44 → 48, `compte/index.tsx` 60 → 64. Les tailles
« héros » (72 clôture, 88 profil, 112 appel) restent libres et assumées : elles
sortent du système de rangées et de cartes.

## Reste à faire

- **Le document de correspondance Figma ↔ code est en retard.** Ses chemins sont
  à jour, mais il ne liste toujours pas `InfoRow`, `ActionTile`, `ActionTileRow`,
  `AlertBadge`, `ListRow`, `List`, `Medallion`, `Field` ni `PlaceField` — neuf
  composants construits au fil des Parties XVIII à XXIV.
- **`ListRow` / `List` n'ont pas de pendant code.** C'est le plus gros chantier
  de synchronisation restant ; `PlaceRow.tsx`, `SettingsRow.tsx` et
  `SettingsGroup.tsx` existent toujours, et il touche les écrans Compte,
  l'accueil et les feuilles de course.
- **`fmt` est dupliqué à l'identique dans 10 fichiers** (`n.toLocaleString('fr-FR')`
  avec séparateur en point). Un helper partagé suffirait.
- **Vocabulaire des surfaces Affiliation.** `CONTEXT.md` réserve « chauffeur » aux
  intitulés du flux Transport et impose « Prestataire » ailleurs. Or
  `affilie/dashboard.tsx` dit « Chauffeurs actifs », `affilie/reseau.tsx`
  « Chauffeurs & livreurs », `affilie/presentation.tsx` « vos chauffeurs », et
  `constants/affilie.ts` porte un type `MemberKind = 'chauffeur' | 'livreur'` —
  proscrit comme terme de domaine dans le code.
- **`Transport · En route`** dit encore « Rejoindre le **conducteur** », variante
  explicitement _Avoid_.
- Le désaccord de longue date sur « Modifier » (pilule `ActionPill` dans Figma,
  icône crayon nue dans le code, `Button variant="link"` dans le style guide)
  n'est toujours pas tranché.


## Partie XXVI — Tokenisation du set : audit et liaison (24 août 2026)

Question posée : le set `486:1447` est-il bon « en design systémique et en
tokenisation » ? La sémantique l'était (Parties XXIV-XXV) ; **la tokenisation ne
l'était pas**, et pas là où je l'aurais deviné.

### Méthode

Périmètre en trois zones : les frames brutes du set (`03 · Patterns`), et les
définitions de composants de `01 · Primitives` et `02 · Composants`. Une valeur
compte comme liée si elle porte une entrée dans `boundVariables` ; les nœuds
internes aux instances sont exclus, puisqu'ils héritent de leur définition.

### État avant

| | Couleurs | Rayons | Padding | Gap | Styles de texte |
|---|---|---|---|---|---|
| `02 · Composants` | **100 %** | 79 % | 14 % | 11 % | 51 % |
| `01 · Primitives` | 86 % | 12 % | 44 % | 0 % | 17 % |
| Set (frames brutes) | 80 % | 82 % | 67 % | 26 % | 71 % |

La couleur était donc faite — les 57 + 23 valeurs non liées sont des
illustrations vectorielles (`Hand with Cash`, `Illustration/Gamme`, `Logo`), de
l'art et non des jetons. **L'espacement, lui, n'était quasiment pas tokenisé.**

### L'échelle d'espacement était trop clairsemée

Sur 540 valeurs d'espacement non liées, 289 avaient déjà un jeton qui attendait
(pure omission) mais **251 utilisaient des valeurs que `Fiw Spacing` ne contenait
pas**. Elle sautait de 16 à 24 à 32, alors que le produit emploie massivement
6 (×48), 14 (×34), 28 (×32), 20 (×16) et 10 (×24) — dont deux valeurs Fiw
canoniques (`radius-card` = 20, rayon de feuille = 28) et surtout **6, l'interstice
`CARD_GAP` qui structure toutes les feuilles groupées**.

Cinq jetons ajoutés. L'index vaut la valeur ÷ 4, donc 20 et 28 tombent juste
(`space/5`, `space/7`) ; 6, 10 et 14 sont des **demi-crans** assumés.

> **Piège 13 — Figma refuse le point dans un nom de variable.** `space/1.5` lève
> `invalid variable name`. Le tiret tient lieu de décimale : `space/1-5`,
> `space/2-5`, `space/3-5`.

Les valeurs de 1, 2 et 3 px restent délibérément **sans jeton** : ce sont des
réglages optiques internes, et ils sont concentrés — `GammeCard` en porte 60 sur
73 à lui seul.

### Ce que la liaison a donné

**662 liaisons** posées : 351 paddings, 247 gaps, 48 rayons, 16 pilules.

| | Padding | Gap | Rayons |
|---|---|---|---|
| Set (frames brutes) | 67 % → **100 %** | 26 % → **96 %** | 82 % → **100 %** |
| `02 · Composants` | 14 % → **88 %** | 11 % → **89 %** | 79 % |
| `01 · Primitives` | 44 % → **67 %** | 0 % → **100 %** | 19 % |

Deux trouvailles au passage :

- **Un garde-fou m'a évité une erreur.** J'avais annoncé 32 rayons « on-scale à
  lier » (20 ×24, 16 ×8). Le contrôle « rayon = moitié du petit côté ⇒ géométrie,
  pas jeton » les a tous écartés : ce sont des **cercles** (r20 sur 40×40, r16 sur
  32×32). Les lier à `radius/card` aurait été faux. Même raison pour les 19 % de
  `01 · Primitives` : 13 = 26/2 (`Radio`), 24 = 48/2 (`Avatar`), 14 = 28/2, plus
  des rayons décoratifs de 3 et 5 sous l'échelle.
- **Des rayons « pilule » écrits en dur et démesurés** : 999999, 99999, 9999 au
  lieu du jeton `radius/pill` (999). 16 occurrences — `Avatar` (8), `PlateChip`
  (4), le set (4). Corrigées ; sans effet visuel, les deux valeurs arrondissant
  complètement.

### La typographie est bloquée, et pas par une omission

C'est le tiers du chantier que je n'ai pas fait, parce qu'il n'est pas mécanique.
Sur 124 nœuds de texte sans style, **2 seulement** peuvent recevoir un style
existant sans changer le rendu. Raison : **les 8 styles Figma contredisent
l'échelle du code** sur la moitié des variantes.

| Variante | `constants/typography.ts` | Style Figma |
|---|---|---|
| `body` | 15 / interligne 24 | **16** / AUTO |
| `bodySmall` | 13 / 21 | **14** / AUTO |
| `label` | 13 / 18 | **14** / AUTO |
| `caption` | 11 / 15 | **12** / AUTO |

Les textes du set suivent le **code** (15, 13, 11, interlignes explicites), pas les
styles. Et au-delà de l'écart, le set emploie une quinzaine de combinaisons
distinctes qu'aucune échelle de 8 styles ne couvre : 11/Medium (×20), 16/Medium
(×16), 16/SemiBold (×12), 18/Bold (×10), 15/Medium, 14/Medium, 13/Medium,
15/SemiBold… Appliquer les styles restylerait 122 nœuds et ferait diverger la
maquette de l'app.

**Décision requise**, hors de ce qui a été fait ici : soit corriger les 8 styles
Figma pour qu'ils épousent l'échelle du code (et leur donner les interlignages
explicites), soit reconnaître que la typographie du set n'est pas systématisée et
arbitrer les combinaisons sanctionnées avant de pousser chaque nœud sur l'une
d'elles. La seconde est la vraie passe.

### Côté code

`constants/spacing.ts` reçoit les 5 crans (l'échelle est réellement utilisée, les
écrans `affilie/` s'appuient dessus), le §Espacement du style guide est réécrit —
il affirmait que « tous les espacements sont des multiples de 4 », ce qui est faux
depuis longtemps — et `docs/style-guide.tokens.json` est régénéré.

> **Bogue du générateur, corrigé.** `scripts/gen-style-guide-tokens.py` lisait les
> clés avec `([\w]+)`, qui ne matche pas `1.5`. Les trois demi-crans étaient
> **silencieusement absents** du JSON généré (11 espacements au lieu de 14). La
> clé accepte désormais le point.


## Partie XXVII — La maquette devient la source de vérité des jetons (24 août 2026)

Renversement de sens explicite : **c'est la maquette Figma qui fait autorité sur
l'échelle de jetons, le code s'y aligne.** Les styles de texte avaient été réglés
à la main dans le fichier ; j'avais lu cet écart comme une dérive à réparer côté
Figma, ce qui était une inversion — la décision de design appartient à la
maquette. La consigne a ensuite été étendue à *toute* l'échelle : couleurs, typo,
espacement, rayons, ombres.

### Typographie — le code s'aligne

| Variante | Code avant | Code après (= Figma) |
|---|---|---|
| `displayXl` | 40 / 48 | 40 / **50** |
| `display` | 28 / 36 | 28 / **35** |
| `heading1` | 22 / 29 | 22 / **28** |
| `heading2` | 18 / 23 | 18 / 23 _(inchangé)_ |
| `body` | 15 / 24 | **16 / 20** |
| `bodySmall` | 13 / 21 | **14 / 18** |
| `label` | 13 / 18 | **14 / 18** |
| `caption` | 11 / 15 | **12 / 15** |

Les styles Figma sont en interligne `AUTO`, notion absente de React Native. Plutôt
que de deviner, une **sonde jetable** a mesuré la résolution réelle pour Outfit :
40→50, 28→35, 22→28, 18→23, 16→20, 14→18, 12→15, soit un ratio constant de
**×1.25** (les métriques intrinsèques de la police). Ces valeurs sont fixées en dur
côté RN et non laissées à son propre AUTO : les deux moteurs ne garantissent pas la
même résolution.

⚠️ **Conséquence visible** : le corps de texte passe d'un interlignage ×1.6 à
×1.25. Les paragraphes de plusieurs lignes — explications de modale, corps
d'`InfoBanner`, textes de clôture — sont sensiblement plus serrés. Le style guide
prescrivait trois ratios (titres ×1.3, corps ×1.6, labels ×1.4) qui ne
correspondaient ni à la maquette ni à ce que le code appliquait ; la section est
réécrite.

### Le reste de l'échelle

| Famille | Verdict |
|---|---|
| **Couleurs** (44) | Déjà en parité parfaite, alias Figma résolus compris |
| **Espacement** (14) | En parité depuis la Partie XXVI |
| **Rayons** (6) | Déjà en parité |
| **Styles de texte** (8) | Alignés ci-dessus |
| **Ombres** (5) | **Un écart réel**, corrigé |

L'ombre `sheet` divergeait : Figma dit `#374151` (gray/700) à **0.30** d'opacité,
le code disait `#0066FF` (bleu marque) à **0.14**. Le bleu n'y portait pas assez
pour décoller la feuille du fond. Le code suit désormais la maquette.

### Bordures : il n'y a rien à aligner

Aucune collection d'épaisseur de liseré n'existe dans le fichier Figma. Les deux
côtés emploient le même vocabulaire — 1, 1.5 et 2 px — mais côté maquette ce sont
des valeurs en dur, non des variables. Les *couleurs* de bordure (`border`,
`borderSubtle`, `hairline`) vivent bien dans `Fiw Colors` et sont en parité. Créer
une collection `Fiw Stroke` reste une décision ouverte.

### Vérification

La parité n'est pas affirmée, elle est **diffée** : un script émet la liste
normalisée des 77 jetons Figma (alias résolus, collection `Primitives` exclue car
socle interne non exposé au code), un autre émet la même liste depuis
`docs/style-guide.tokens.json` (dérivé du code). Diff → **aucun écart**.

> **Deux bogues du générateur, trouvés par ce diff.**
> `scripts/gen-style-guide-tokens.py` testait `"BRAND" in body` pour la couleur
> d'une ombre et **retombait silencieusement sur NEUTRAL** sinon : dès qu'une
> troisième constante est apparue, `sheet` est sorti en `#0B1220` au lieu de
> `#374151`. Il résout maintenant n'importe quelle constante du fichier et
> **échoue bruyamment** sur une référence inconnue. C'est le second repli
> silencieux du même script (cf. Partie XXVI, les demi-crans perdus par
> `([\w]+)`) — un repli par défaut y coûte plus cher qu'une erreur.

### Suite : `body` = 16 tranché, les usages suivent

Arbitrage rendu — **16 gagne pour le corps de texte**. Le relevé Figma le confirme
composant par composant : `Field.Valeur`, `Field.Placeholder`,
`SearchBar.Placeholder` et la valeur de `PlaceField` sont toutes à 16.

**11 sites passés de 15 à 16**, tous des saisies ou du corps de texte :
`SearchBar`, `PhoneField` (le champ numéro), les champs de `home`, `profil`,
`lieu` (×2), la description de colis et la saisie destinataire de
`livraison/configure`, les commentaires des deux écrans de clôture, la saisie de
`chat`.

**Deux exceptions respectées, sur foi de la maquette :**

- **`PlateChip` reste à 15/20 Bold** — Figma le dit explicitement, et une plaque
  d'immatriculation n'est pas du corps de texte.
- **Les deux `bannerText` des écrans de recherche perdent leur surcharge.** Ils
  forçaient 15/20 par-dessus `variant="label"` pour compenser l'ancien label à 13.
  Label valant 14 désormais, la surcharge n'avait plus d'objet : la variante
  reprend la main et deux tailles en dur disparaissent.

`InfoBanner` passe de `label` à `bodySmall` : même taille et même interligne
(14/18), mais Regular et non Medium — ce que dit la maquette.

Les tailles en dur tombent de **40 à 38**, et il ne reste **plus aucun
`fontSize: 15`** hors `PlateChip`.

### Les deux valeurs hors échelle, tranchées

Arbitrage rendu : **les réglages à 15 px sont intentionnels et méritent leur
propre style ; `Callout` en revanche se calque sur `caption`.**

En cherchant tous les nœuds à 15 px, il s'est avéré que **15 sert trois rôles**
dans la maquette, pas un :

| Nœud | Réglage | Occurrences | Sort |
|---|---|---|---|
| `Button / Continuer` | 15 / 20 | 6 | déjà en parité — c'est la taille `md`, la table `SIZING` du code dit lg 16 / md 15 / sm 14 |
| `OptionCard / Title` | 15 / 24 SemiBold | 4 | nouveau style `Fiw/cardTitle` |
| `Field / Indicatif` | 15 / 21 Medium | 8 | nouveau style `Fiw/fieldPrefix` |

**Une régression que j'avais causée, rattrapée au passage.** Le titre d'`OptionCard`
était rendu par `variant="body"` + SemiBold ; l'ancien `body` valant 15/24, il
tombait *exactement* sur la maquette — par accident. En passant `body` à 16/20 je
l'avais décroché sans le voir. Il a maintenant son propre style, donc il ne peut
plus dériver au gré d'un changement de `body`.

Deux styles de texte créés dans Figma et appliqués (13 nœuds stylés), avec
**interlignage explicite et non AUTO** : 24 et 21 ne sont pas le ×1.25 d'Outfit,
qui donnerait 19. Côté code, `TextVariant` gagne `cardTitle` et `fieldPrefix` ;
`PhoneField` et les deux `OptionCard` (`RapprochementChoice`,
`LivraisonModeChoice`) passent dessus et **perdent leurs surcharges de graisse**.

`Callout` se calque sur `caption` : son texte Figma passe de 11/17 à 12/15 et
reçoit le style `Fiw/caption` ; côté code la surcharge `lineHeight: 17` disparaît.
Trois zones de saisie restées en 16/21 sont ramenées à 16/20, l'interligne de
`body`.

**Parité revérifiée par diff : 79 jetons, aucun écart.**

### Reste ouvert : les 38 tailles en dur

Le code porte **40 déclarations `fontSize` en dur dans 28 fichiers**, hors échelle
— ce que le style guide interdit déjà (« pas de `fontSize`/`fontWeight` bruts dans
les écrans »). Dont **14 à `fontSize: 15`**, l'ancienne valeur de `body` : ce sont
presque toutes des `TextInput` (`SearchBar`, `PhoneField`, champs de `home`,
`profil`, `lieu`, `configure`, la saisie de `chat`), qui ne peuvent pas passer par
l'atome `Text` et décalquaient donc `body` à la main.

Avec `body` à 16, **tous les champs de saisie de l'app sont désormais 1 px sous le
corps de texte**. Côté Figma la question n'est pas tranchée non plus : `Field`
emploie 16/Medium à 16 endroits et 15/Medium à 8 autres. C'est la passe de
systématisation typographique annoncée en Partie XXVI — elle demande d'arbitrer les
combinaisons sanctionnées, pas de lier des jetons.


## Partie XXVIII — Systématisation typographique complète (24 août 2026)

La passe annoncée depuis la Partie XXVI. Elle ne consistait pas à lier des jetons
mais à **arbitrer les combinaisons sanctionnées**, puis à y ramener chaque nœud —
de part et d'autre.

### Le diagnostic

Relevé exhaustif : 26 combinaisons de texte nues dans Figma, 38 `fontSize` en dur
dans le code et 37 surcharges `fontFamily: Outfit.*`. Les deux versants disaient la
même chose, et le manque était **structurel** : l'échelle ne donnait **qu'une
graisse par taille** alors que le design en emploie plusieurs.

Cas le plus parlant, `16/20` : Regular (`body`, 33 nœuds), **Medium** (25 nœuds) et
**SemiBold** (14 nœuds, les libellés de bouton `lg`). Seul le premier avait un
style ; les deux autres vivaient en surcharge.

Deux familles étaient par ailleurs des **restes des changements de la Partie
XXVII** : les 31 nœuds à 11 px datant de l'époque où `caption` valait 11, et les
12 nœuds à 13 px de celle où `bodySmall` valait 13.

### La mécanique retenue

**Axe de graisse là où le design l'emploie, rattrapage des restes.** L'échelle
passe de 8 à **22 styles** : 8 de base, 6 de graisse, 8 de rôle.

Les styles de **rôle** portent un nom d'emploi (`cardTitle`, `infoValue`,
`amount`, `codeCell`, `buttonMd`…) et non de graisse. La raison est concrète :
`cardTitle` tenait jusqu'ici par accident, via `variant="body"` + SemiBold à
l'époque où `body` valait 15/24. Le passage de `body` à 16/20 l'avait
silencieusement décroché de la maquette. Un nom d'emploi le rend insensible aux
changements de l'échelle de base.

### Résultat

| | Avant | Après |
|---|---|---|
| Styles de texte | 8 | **22** |
| Nœuds Figma stylés | ~146 | **283** |
| Nœuds Figma nus | 26 combinaisons | **2** (chasse propre) |
| `fontSize` en dur (code) | 38 | **8** |
| Surcharges `fontFamily` (code) | 37 | **8** |

**126 nœuds Figma** stylés en trois passes parallèles, **41 sites de code**
repointés. Les trois pages sont à zéro nu, hors les deux exclusions voulues
(`PlateChip` ls 1.5, `FlagChip` ls 0.3 — la chasse élargie *est* le motif).

### Ce que la recherche exhaustive a révélé

- **Mon alerte sur `Button` était fausse.** Ma requête ne filtrait que le 15 px, je
  ne voyais donc que la taille `md`. La table `SIZING` du code dit lg 16 / md 15 /
  sm 14, et la maquette concorde — `Button` n'a jamais divergé. En revanche sa typo
  vivait en surcharge : elle passe dans une table `LABEL` de variantes indexée par
  (taille × lien), la variante `link` descendant d'une graisse.
- **Les chiffres OTP d'`otp.tsx` et `compte/numero.tsx` sont du 28/36 Bold**, soit
  exactement le rôle `codeCell` de `CodePill`. Trois implémentations du même motif,
  désormais une seule.
- **`GammeCard.priceText`** était `heading2` + Bold = 18/23 Bold, précisément le
  `heading2Bold` que la maquette emploie 10 fois. La surcharge disparaît.
- **Sept sites voulaient « bodySmall accentué »** — 14/18 SemiBold, absent de
  l'échelle qui n'avait que Regular (`bodySmall`) et Medium (`label`) à cette
  taille. D'où `bodySmallSemibold`, qui complète proprement l'axe : 14/18 en trois
  graisses.
- **Trois surcharges ne disaient plus rien** : `segmentText: { fontSize: 14 }` sur
  un `label` qui vaut 14, `detourTitle`, `ratingLabel: { fontFamily: medium }` sur
  un `label` déjà Medium. Restes d'avant les changements de la Partie XXVII.

### Les champs de saisie

Un `TextInput` ne peut pas passer par l'atome `Text` : c'est par là que l'échelle
divergeait, avec 11 champs portant leur taille en dur. Ils reprennent maintenant
une variante via **`inputTypo()`**, qui en tire famille et taille **sans
l'interligne** — poser `lineHeight` sur un champ d'une seule ligne décale le texte
verticalement sur Android. Les champs multilignes (description de colis,
commentaires de clôture, repère d'adresse), eux, reprennent la variante entière.

Au passage, le champ de connexion d'`app/index.tsx` était à **17 px**, seule
occurrence de cette taille dans l'app. Il rejoint `bodyMedium`.

### Ce qui reste hors échelle, et pourquoi

16 déclarations, toutes assumées et documentées dans le style guide : les deux
composants à chasse élargie (`PlateChip`, `FlagChip` — conformes à la maquette),
les tailles **calculées** (`Avatar`, `PrestataireRow` : `size * 0.38`), le signe de
marque textuel, deux **emojis** (dont la taille n'est pas de la typographie), et
trois saisies de montant absentes de la maquette (`WheelPicker` 22/30,
`affilie/retrait-*` 24 et 48).

**Parité revérifiée par diff : 22 styles de part et d'autre, aucun écart.**


## Partie XXIX — Audit de la couche fondations (24 août 2026)

Question posée : « à l'échelle des fondations, on est bon ? » La réponse était
**non**, et le défaut principal était celui que je n'avais pas pensé à regarder :
la page qui *documente* les fondations.

### La page `00 · Fondations` était périmée

C'est la page qu'on regarde quand on veut juger le système. Son en-tête promet
« Miroir 1:1 de `apps/fiw/constants/*` ». Elle affichait encore `body 15 / 24`,
`bodySmall 13 / 21`, `label 13 / 18`, `caption 11 / 15` — l'échelle d'avant la
Partie XXVII — et ne connaissait que 8 styles sur 22.

Détail instructif : **les échantillons de texte étaient liés aux styles**, donc ils
s'étaient mis à jour tout seuls. Seules les **étiquettes**, saisies à la main,
mentaient. Le rendu était juste, la légende fausse — le pire des deux mondes pour
une page de référence.

- 7 étiquettes rafraîchies (`heading2` était déjà correcte).
- 14 rangées ajoutées, avec deux intertitres — « Axe de graisse », « Rôles » — qui
  reprennent la structure du style guide.
- **`radius/card` (20) manquait à la section Rayons**, alors que c'est le palier le
  plus employé du produit. Ajouté, lié à sa variable, inséré entre `lg` et `xl`.
- Les 5 nouveaux crans d'espacement ajoutés, l'échelle remise dans l'ordre
  croissant, les trois demi-crans étiquetés comme tels.
- La section Élévation, elle, s'était mise à jour seule : ses ombres sont des
  **styles d'effet**, donc le passage de `sheet` au gris `gray/700` s'y reflétait
  déjà. C'est l'argument pour lier plutôt que peindre, démontré sur pièce.

### Deux défauts structurels de la couche variables

**Les 35 primitives étaient en `ALL_SCOPES`.** L'anti-motif classique : en
choisissant une couleur de fond, le sélecteur proposait les 44 jetons sémantiques
**et** les 35 valeurs brutes. Elles sont désormais restreintes aux portées de
couleur et **masquées à la publication** — ce que la page `00 · Fondations`
annonçait déjà (« rampes brutes, masquées à la publication ») sans que ce soit
vrai. Les alias résolvent malgré le masquage, c'est le motif standard.

**Les descriptions étaient quasi absentes** : 42 des 44 couleurs, 34 des 35
primitives, 14 des 14 espacements. Or `constants/colors.ts` porte d'excellents
commentaires expliquant *pourquoi* `primaryFill` existe (le bleu de marque vibre
sur une grande surface), pourquoi le jaune de marque ne dessine jamais (1.2:1 sur
son subtil), pourquoi `warningInk` et `successInk` sont nécessaires. Cette
intention ne voyageait pas jusqu'à Figma, où travaille le designer. Les 33 jetons
sémantiques, les 14 espacements, les 11 paliers bruts et les 4 collections sont
maintenant décrits.

### Deux reproches que je retire

- **L'échelle bleue brute exposée dans `Fiw Colors` n'est pas un défaut.** J'allais
  la signaler comme une violation de couches ; la page `00 · Fondations` porte une
  rubrique « Échelle bleue exposée ». C'est un choix documenté, pas un accident.
  Elle est désormais décrite comme telle sur chaque palier (« préférer `primary`,
  `primarySubtle` ou `primaryPressed` quand le rôle existe »). Côté code, un seul
  de ces 11 jetons sert : `blue100`, trois fois.
- **Les 4 jetons sémantiques à valeur brute** (`surfaceAlt`, `track`,
  `primaryFill`, `primaryInk`) ne sont pas non plus un défaut. Je les avais notés
  comme « modèle à deux couches cassé », mais aucun n'appartient à une rampe : ce
  sont des couleurs fonctionnelles ponctuelles, et leur créer un palier
  primitif reviendrait à inventer une position dans une échelle où ils n'en ont
  pas. Ils restent bruts, à dessein.

### Reste ouvert

- ~~Aucune collection d'épaisseur de liseré.~~ **Faite** — voir ci-dessous.
- **Un seul mode par collection** — pas de thème sombre. Décision produit, pas
  défaut ; à acter explicitement si le sujet revient.
- **`base/black` n'est visée par aucun jeton sémantique.** Primitive orpheline,
  sans conséquence.


### Suite — `Fiw Stroke`, la dernière famille de jetons (24 août 2026)

Question posée : côté code ou côté Figma ? **Figma d'abord**, comme pour tout le
reste — le code s'aligne ensuite. Techniquement praticable : `strokeWeight` est
liable, la portée s'appelle `STROKE_FLOAT`.

Le relevé montrait que les deux côtés employaient déjà la même échelle, ce qui
rendait l'exercice presque mécanique — 1.5 px apparaissait exactement 13 fois de
part et d'autre :

| Épaisseur | Figma | Code |
|---|---|---|
| 1 | 45 | 35 |
| 1.5 | 13 | **13** |
| 2 | 24 | 11 |
| 3 | 3 | 1 |

Cinq jetons, nommés par le **poids visuel** et non par le nombre — `hairline`,
`thin`, `medium`, `thick`, `heavy` — chacun décrit dans Figma. 88 nœuds liés côté
maquette, 69 déclarations repointées côté code, plus aucun littéral numérique.

Deux asymétries traitées plutôt qu'escamotées :

- **`StyleSheet.hairlineWidth` n'a pas d'équivalent Figma.** React Native le
  calcule selon la densité de l'écran (≈0.5 en @2x, ≈0.33 en @3x) ; la maquette
  porte un nominal de 0.5. C'est le **seul jeton du système dont la valeur diffère
  entre les deux mondes**, et c'est assumé : « le trait le plus fin possible » est
  une notion de plateforme. Même nature que l'interligne `AUTO`, résolu à ×1.25
  côté code. Le générateur sort la valeur nominale **et** la provenance, plutôt
  que d'inventer un nombre ou de laisser un trou.
- **Le `Logo` portait un liseré de 0.032** — artefact d'un vecteur mis à
  l'échelle, pas une décision. Seul nœud écarté de la liaison.

La page `00 · Fondations` gagne une section **5 · Liserés** (les suivantes
renumérotées), bâtie sur le gabarit de la section Rayons : cinq carrés cernés à
l'épaisseur du jeton, la progression se lit d'un coup d'œil. Chaque démonstration
est **liée à la variable**, donc la section vieillira toute seule dans le bon sens
— comme la section Élévation l'a prouvé quand `sheet` a changé de couleur.

Il ne reste qu'un chantier de fondations ouvert : **le mode sombre**, un seul mode
par collection aujourd'hui. C'est une décision produit, pas une dette.

---

# Partie XXX — Le code aligné sur la maquette (24 août 2026)

Consigne : **la maquette fait autorité, du jeton au pattern**. Passe complète
`apps/fiw` ↔ `MsKt5tJdmMUWIDTRtPh6L1`, menée sur les **valeurs lues dans le
fichier** (dump de l'API plugin), pas sur les documents.

## 0. Fondations — rien à faire

Diff des quatre collections et des styles : **parité stricte**. 44 couleurs
(alias résolus compris), 14 espacements, 6 rayons, 5 liserés, 5 ombres,
22 styles de texte — aucune valeur ne diverge. La passe des Parties XXVI-XXIX
tient.

Une seule exception trouvée, et elle était dans un dérivé : **`SectionLabel`
portait `letterSpacing: 0.8`** alors que les libellés de section de la maquette
sont composés avec `Fiw/caption` nu (tracking 0) sur un texte déjà saisi en
capitales. Le 0.8 de la Partie IX n'a pas survécu à la systématisation
typographique — il est retiré, la transformation en capitales reste.

## 1. Primitives

| Composant | Ce que disait le code | Ce que dit la maquette |
|---|---|---|
| `Avatar` | initiales en `primary`, taille `size × 0.38`, liseré seulement si `bordered` | initiales **`primaryPressed`**, tailles **typées** (48 → `bodySemibold` 16, 64 → `heading1` 22), **liseré blanc 2 permanent** — `bordered` ne fait que le passer en `primary` |
| `Badge` | gouttière 3 | **4** |
| `PlateChip` | padding 10, liseré `border` | padding **12**, liseré **`borderSubtle`** (et la marge haute de 6 quitte le composant pour le `gap` du bloc véhicule) |
| `FlagChip` | liseré `hairline` | **`thin`** |
| `CodeCell` | rayon `md`, fond `surface` | rayon **`lg`**, fond **`borderSubtle`** |
| `Radio` | liseré `textDisabled` au repos | **`textTertiary`** ; `textDisabled` devient l'état **désactivé**, ajouté |
| **`Medallion`** | *absent* | **créé** — 42 / 56 × `neutre` (fond `bg`, glyphe `textSecondary`) / `accent` (`primarySubtle`, glyphe `primary`) |

`Divider`, `ProgressBar`, `Handle`, `Scrim`, `AvatarStack`, `AlertBadge`,
`Callout` étaient déjà conformes.

## 2. Composants

| Composant | Écart corrigé |
|---|---|
| `IconButton` | le **liseré du flottant est retiré** — c'est l'ombre `float` seule qui le détache du fond carto ; l'icône de `flat` passe de `primary` à **`gray700`** |
| `Chip` | padding 14/9 → **12/8**, gouttière 6 → **4**, plus de liseré transparent au repos, libellé actif en **`infoValue`** (14/20) et non `bodySmallSemibold` (14/18) |
| `ActionPill` | padding 14/9 → **12/8** (36 de haut, pas 38) |
| `ActionTile` | rayon `md` → **`lg`** |
| `SearchBar` | rayon `md` → **`lg`** pour les DEUX variantes — la flottante était en pilule ; gouttière 10 → **8**, padding 14 → **16**, loupe `textTertiary` → **`textSecondary`**, surcharge de graisse de la variante flottante supprimée |
| `InfoBanner` | rayon `card` → **`pill`**, gouttière 12 → **8**, ton `warn` → **`alerte`**, ambre plein → **`warningInk`** |
| `ReceiptCard` | titre `caption` capitales tertiaire → **`heading2` encre pleine** ; gouttière 12 entre rangées et filets à 8 (le contenu était collé, faute de gap) |
| `RouteCard` | « Modifier » devient un **`ActionPill`** — le désaccord de longue date (pilule Figma / crayon nu code / lien style guide) est tranché par la maquette ; les interlignes forcés à 16 disparaissent, la carte retrouve ses **117** de haut |
| `AltSuggestCard` | padding 12 → **8** (64 de haut) |
| `VehicleGroup` | interstice 12 → **4**, bloc padding 12 → **8/12**, gouttière 10 → **12**, modèle du véhicule en **`textSecondary`**, rangée prestataire **en retrait de 8** |
| `StepProgress` | pastille **28 → 44**, glyphe **13 → 20**, jalon fait **`primary` → `blue100`** (le bleu de marque appartient au jalon COURANT), segment franchi idem, libellé courant **`textPrimary` → `primary`**, anneau désormais intérieur |
| `OptionCard` ×2 | le radio maison de 22 laisse place au composant **`Radio`** (26, liseré `textTertiary`) |
| `PrestataireRow` | titre `heading2` → **`bodyMedium`**, padding 4 → **8**, avatar maison remplacé par **`Avatar`** |
| `PhoneField` | rayon `md` → **`lg`**, hauteur **56**, chip indicatif à **16**, saisie en `body` |

## 3. Patterns

- **`SheetCard` passe de 20 à 16.** La maquette met `radius/lg` aux quatre coins
  de chaque carte, y compris la première : le fond `track` de la feuille
  transparaît donc dans les coins hauts — c'est **la lèvre grise du motif**, pas
  un défaut. Le code forçait 28 en haut de la première carte. Le rayon 20 reste
  celui des cartes de **contenu** (bloc et groupe véhicule), qui le portent bien
  dans la maquette.
- **`SheetHeader`** perd son interlettrage `-0.4`, absent du style `heading1`.
- **`ScreenHeader`** : titre **`heading2` → `heading1`**, gouttière 12.

Un seul écart de pattern est **volontairement non appliqué** : la dernière carte
d'un `GroupedSheet` garde ses coins bas carrés et absorbe la zone sûre en blanc.
La maquette flotte, l'app est ancrée au bord de l'écran — même nature que
`StyleSheet.hairlineWidth`, qui n'a pas d'équivalent Figma.

## 4. Les fusions de la maquette, répercutées

- **`ListRow` et `List` sont écrits.** Ils remplacent `SettingsRow`,
  `SettingsGroup` et `PlaceRow`, **supprimés** — comme dans la maquette depuis la
  Partie XVIII. Cinq écrans migrés (`compte/index`, `compte/securite`,
  `compte/preferences`, `compte/lieux`, `history/index`, plus les résultats de
  `compte/lieu` et les deux listes de `home`). Le retrait du filet (50) se déduit
  enfin de la géométrie réelle de la rangée : 16 + 22 + 12.
- **`Field` et `PlaceField` sont écrits.** `Field` porte les trois types et les
  quatre états relevés dans la maquette — repos (`surface` + `border`), actif
  (`primarySubtle` + `primary` 2), erreur (`surface` + `error` 2, aide en rouge),
  désactivé (`track`, valeur `textDisabled`). `compte/profil` et `compte/lieu` y
  passent, cadenas compris.

## 5. Ce qui reste ouvert

| Sujet | Pourquoi ce n'est pas fait |
|---|---|
| Champs De/À de `home.tsx` → `PlaceField` | Les deux champs sont pris dans le morphing de la feuille (refs, focus, animations). La migration est mécanique mais elle touche la partie la plus animée de l'app — à faire d'un bloc, à froid. |
| `otp.tsx` / `compte/numero.tsx` → un `CodeField` | `CodePill` n'a **aucun état de saisie** dans la maquette (vide / curseur / rempli). Rien à aligner tant que l'axe n'existe pas — c'est l'entrée n° 5 des écarts Client. |
| `ContactRow`, rangée de moyen de paiement, `payBtn`/`payImg` | Motifs encore inline dans `livraison/configure`, `PaymentSheet`, les deux `configure` et les deux écrans actifs. Ils ont un composant en face (`ListRow`, `InfoRow`) mais la migration touche des feuilles animées. |
| `app/index.tsx` | Logo redessiné, drapeau emoji, champ maison : trois objets à remplacer par `Logo`, `FlagChip` et `PhoneField`. Voir §7 des écarts Client. |
| `ListRow.subtitleAccent` | Prop **sans contrepartie dans la maquette** : `Ton=action` y accentue le titre, pas le sous-titre. Conservée pour ne pas perdre l'affordance de « Ajouter une adresse », à porter dans Figma ou à retirer. |

`npx tsc --noEmit` est propre après la passe. **Aucune vérification visuelle
n'a été faite** : les hauteurs annoncées (117 pour `RouteCard`, 64 pour
`AltSuggestCard`, 65 pour `StepProgress`) sont déduites de la maquette, pas
mesurées à l'écran.

---

# Partie XXXI — Les quatre contrôles manquants (24 août 2026)

Premier lot des « composants manquants de la maquette » relevés dans
[`design-system-ecarts-client.md`](design-system-ecarts-client.md). Les atomes
d'abord : ce sont eux dont les molécules dépendront.

| Composant | Nœud | Axes | Où |
|---|---|---|---|
| `Checkbox` | `757:32` | `Selected=false\|true` × `État=actif\|désactivé` | `01 — Primitives` › Contrôles |
| `Toggle` | `759:34` | `On=false\|true` × `État=actif\|désactivé` | idem |
| `SegmentedControl` | `760:57` | `Segments=2\|3` × `Actif=0\|1\|2` (5 variantes, matrice creuse) | idem |
| `Spinner` | `761:30` | `Taille=sm\|lg` | `01 — Primitives` › Indicateurs |

## Les deux arbitrages rendus

- **Checkbox : 24 px, `radius/sm`, liseré `stroke/thick`.** Le code portait deux
  versions (22 / rayon 6 dans `presentation.tsx`, 24 / `radius/sm` dans
  `conditions.tsx`). La seconde gagne : à côté du `Radio` (26, même poids de
  trait) elle se lit comme un membre de la même famille, et son rayon reste dans
  l'échelle. Au repos le liseré est `textTertiary` comme celui du `Radio` — pas
  `border`, qui est le liseré des *surfaces*, pas des contrôles.
- **Contrôle segmenté : piste `track`, pastille active `surface` + `shadow/sm`.**
  Celui de `transport/configure.tsx`, contre la piste blanche à liseré d'
  `affilie/reseau.tsx`. Il réemploie la piste `track` déjà tenue par `Chip` et
  `ActionPill`, et il laisse le bleu à ce qui *sélectionne une valeur* plutôt
  qu'à ce qui *filtre une vue*.

## Deux notes de construction

- **`Toggle` ne dessine pas un interrupteur Fiw** : l'app rend le `Switch` natif
  de React Native. La maquette en reprend donc la géométrie iOS (51 × 31, pouce
  27, marge 2) et n'y applique que les couleurs du système. Inventer une autre
  empreinte aurait produit une maquette que le code ne peut pas rendre.
- **L'axe s'appelle `On` et non `Actif`** : `État` porte déjà `actif |
  désactivé`, les deux se seraient télescopés.

## Vérifications

Capture de chaque set, et **audit de liaison sur les quatre** : zéro peinture non
liée. Un défaut trouvé au passage et corrigé — la coche de `Checkbox` était
peinte en dur après le swap d'icône (la couleur d'un vecteur ne survit pas au
swap, c'est le piège déjà rencontré en Partie XVIII).

`01 — Primitives` passe de 18 à **22 composants**.

## Reste du lot

Priorité 1 : `RatingCard`, `ResultState`, `Toast`, `CodeField`, `MapPin` +
`MapPickDock`, `Radar` + `MapBanner`, `ScreenFooter`, `Hint`. Puis les 13 objets
de priorité 2. **Aucun des quatre n'a encore de pendant code** — c'est la passe
d'alignement suivante.

---

# Partie XXXII — Signalétique, chrome et saisie de code (24 août 2026)

Deuxième lot des composants manquants. Cinq objets, dont trois qui ne demandaient
aucun arbitrage et deux qui en ont demandé un.

| Composant | Nœud | Page › section | Propriétés |
|---|---|---|---|
| `Toast` | `764:259` | `02` › Signalétique | `Libellé` · `Icône` · `IconName` |
| `Hint` | `765:256` | `02` › Signalétique | `Texte` · `Icône` · `IconName` |
| `ScreenFooter` | `766:1605` | `03` › Chrome d'écran | slot `Actions` · `Liseré` |
| `ResultState` | `768:1623` | `03` › Chrome d'écran | `Ton=succès\|erreur\|accent` × `Titre` · `Corps` |
| `CodeField` | `770:302` | `02` › Saisie | `Saisis=0…4` × `Chiffre 1…4` |

## Les trois notes du système, enfin distinctes

`Hint` manquait, et c'est ce qui laissait huit sites du code refaire la même note
sous quatre noms (`infoRow`, `help`, `hint`, `noteHint`). Le partage est
maintenant écrit dans les descriptions :

- **`Hint`** — précise, sans rien réclamer. Aucun fond, `caption` tertiaire.
- **`Callout`** — énonce une **règle** ou une affordance non devinable. Pastille jaune.
- **`InfoBanner`** — porte un fait qui change le prix ou le délai, dans une feuille.

## Deux arbitrages

- **`ResultState` ne porte pas ses actions.** Elles restent dans un
  `ScreenFooter` posé dessous, comme en code. Un état de résultat dit ce qui
  s'est passé ; ce qu'on peut faire ensuite appartient au pied d'écran. Ça évite
  au passage le piège des slots sur un set à variantes (n° 10 et n° 12).
- **`CodeField` n'est pas `CodePill`.** L'un se remplit au clavier (cases
  extensibles de 64, rayon `md`, fond `surface` au repos, `primarySubtle` dès
  qu'une case est active), l'autre restitue le code de remise d'un Colis (cases
  fixes 52×60, rayon `lg`, fond `borderSubtle`). Deux gestes, deux composants —
  le code avait raison de les traiter séparément, il avait tort de les traiter
  chacun deux fois.

## Ce qui reste en suspens

**Le ton `marque` de `ResultState`** — celui de `affilie/celebration.tsx`, plein
`primary` avec un médaillon blanc translucide — n'est pas construit : il attend
un **jeton d'opacité sur fond primaire**, qui n'existe pas dans les fondations
(cf. §4 n° 1 du relevé d'écarts : neuf valeurs `rgba` en dur dans sept fichiers).
C'est une décision de fondation, pas de composant.

## Pièges rencontrés

- **`addComponentProperty` en `INSTANCE_SWAP` attend un identifiant de nœud**,
  pas une clé de composant. `tickMain.key` est refusé, `tickMain.id` passe.
- **Un slot n'est pas auto-layout par défaut** : le bouton posé dedans hugge son
  libellé au lieu de remplir la barre. Il faut donner au slot son propre
  `layoutMode`, comme le fait déjà `ActionTileRow`.
- **`createSlot()` pose une peinture blanche par défaut** sur le slot — la seule
  peinture non liée trouvée à l'audit des cinq. Retirée.

Audit de liaison sur les cinq : **zéro peinture non liée**. `02 · Composants`
passe de 24 à **27**, `03 · Patterns` de 7 à **9**.

---

# Partie XXXIII — `CodeField` et `CodePill` fusionnés (25 août 2026)

Décision prise contre celle de la Partie XXXII : j'y avais conclu « deux gestes,
deux composants ». Arbitrage rendu — **un seul objet code**, dont la saisie et la
restitution sont deux états. Conçu d'abord dans la maquette, benchmark à l'appui.

## Ce que dit le benchmark mobile

Dix écrans de saisie de code relevés sur Mobbin (Truecaller, Urban Company, Pi,
MoonPay, Agoda, ShopBack, Oportun, Tesla, Superpower, Zomato) et huit écrans de
restitution (Postmates, Uber Eats ×2, Grubhub ×2, foodpanda, Honest Greens,
inDrive). Deux enseignements nets :

1. **Seule la case active est marquée.** Urban Company, Agoda, Tesla, ShopBack et
   Oportun accentuent la case où l'on écrit et laissent les cases déjà remplies
   au repos — le regard cherche le curseur, pas les cases pleines. Fiw faisait
   l'inverse : cinq accents bleus à l'écran pour un seul point d'attention.
2. **Une restitution n'est pas un champ.** Postmates, Uber Eats et Grubhub
   traitent le code de remise en **cases pleines et calmes**, jamais en cases
   à liseré : il se lit à voix haute, il ne se remplit pas. foodpanda va plus
   loin et le pose en simple pilule.

## Le composant

`CodeField` (`779:320`) — un axe, sept états :

| État | Traitement |
|---|---|
| `vide · 1 · 2 · 3` | La case courante en `primarySubtle` + liseré `primary` **épais** ; les remplies en `surface` + `border`, chiffre en encre ; les suivantes vides |
| `complet` | Les quatre remplies, aucune case marquée — la saisie est finie |
| `erreur` | Les quatre en liseré `error`, chiffres à l'encre rouge. **Cet état n'existait pas** dans le code |
| `lecture` | Cases pleines `borderSubtle`, sans liseré, chiffres en encre — le code de remise d'un Colis |

Quatre propriétés `Chiffre N`, câblées uniquement sur les cases qui affichent
quelque chose : une case vide n'a rien à montrer, et une propriété partagée y
aurait fait apparaître le chiffre par défaut.

## Ce que ça change côté code

- Les chiffres saisis passent de `primary` à **l'encre** : le bleu n'appartient
  plus qu'à la case active.
- Le rayon des cases s'unifie sur **`radius/lg`** — `otp.tsx` et
  `compte/numero.tsx` disaient `md`, l'ancien `CodePill` disait `lg`. C'est `lg`
  qui gagne, celui de la famille `Field`.
- Le fond des cases au repos s'unifie sur **`surface`** (`otp.tsx` disait `bg`).
- **L'état `erreur` est à écrire** : aucun des deux écrans OTP ne dit aujourd'hui
  qu'un code est refusé.

## Migration faite dans la maquette

Les **4 instances** de `CodePill` sont basculées sur `CodeField / État=lecture`,
puis `CodePill` est supprimé. Trois des quatre vivaient dans du contenu mort —
l'ancien set `BottomSheet` (`119:407`, que la Partie X croyait supprimé) et la
page `🗑️ Dump`. La quatrième est celle du suivi de Livraison.

> **Reste un orphelin** : la primitive `CodeCell` (`453:18`) n'a plus aucun
> consommateur — `CodePill` était son seul. Le nouveau composant dessine ses
> cases lui-même. À supprimer, ou à conserver comme atome si un autre code
> devait apparaître ; ce n'est pas une décision que j'ai prise seul, `CodeCell`
> n'était pas dans le périmètre de la fusion.

## Partie XXXIII bis — `CodeField` retravaillé, et l'orphelin retiré (25 août 2026)

`CodeCell` (`453:18`) est **supprimé** : plus aucun consommateur depuis
l'absorption de `CodePill`. La section `Étiquettes` de `01 — Primitives` perd sa
quatrième entrée.

Le composant lui-même a été jugé faible visuellement, et il l'était. Second tour
de relevé Mobbin, cette fois sur les écrans de code **bancaires** — Chime, Wise,
State Farm, Afterpay, ANZ Plus, Starling, Alan, Shell — qui sont les plus soignés
du genre. Trois enseignements, tous appliqués :

1. **Une case au repos garde toujours son liseré.** Ma deuxième passe l'avait
   creusée en fond `bg` sans contour : sur un écran clair, les cases en attente
   **disparaissaient purement et simplement**. Aucun des produits relevés ne fait
   ça — la case vide doit se voir, c'est elle qui annonce combien de chiffres on
   attend.
2. **La case active se marque par son liseré, pas par un fond teinté.** Chime et
   Wise épaississent le contour et ne touchent pas au fond. Le halo bleu que
   j'avais ajouté est retiré : aucun de ces produits n'en pose, et le soin y vient
   de la retenue.
3. **Une case remplie redevient ordinaire** — même boîte qu'une case vide, seul
   le chiffre la distingue.

Géométrie revue au passage : cases **60 × 68** (portrait) au lieu de 72 × 64
(paysage). Tous les écrans relevés emploient des cases plus hautes que larges ;
c'était la première raison pour laquelle le composant faisait « boîtes grises ».
Ajout d'un **curseur** de 2 × 28 dans la case active, rayon lié à `radius/pill`.

Audit final : **80 peintures, toutes liées**.

## Partie XXXIII ter — `CodeField` porté dans le code (25 août 2026)

`components/CodeField.tsx` remplace **trois** implémentations : les cases faites à
la main d'`otp.tsx` et de `compte/numero.tsx`, et `CodePill.tsx` — supprimé.

| | Avant | Après |
|---|---|---|
| Fichiers | 2 blocs inline + 1 composant | **1 composant** |
| Géométrie | 64 de haut, largeur flexible (paysage) | **60 × 68**, rangée centrée |
| Rayon | `md` (OTP) / `lg` (CodePill) | **`lg`** partout |
| Fond au repos | `bg` (otp) / `surface` (numero) | **`surface`** |
| Case remplie | fond `primarySubtle` + liseré `primary` | **ordinaire** — seul le chiffre la distingue |
| Case active | même traitement que remplie | **liseré `primary` épais + curseur** |
| Chiffre | `primary` | **encre** |
| Erreur | *n'existait pas* | `error` — liseré et chiffres |

API : `code`, `length = 4`, `mode = 'saisie' | 'lecture'`, `error`.

**Un ajout que la maquette ne peut pas porter** : le curseur clignote (480 ms,
`useNativeDriver`). Figma le montre fixe parce qu'il ne sait pas dire autrement ;
un curseur figé dans une app en marche se lit comme un champ bloqué. Même nature
que les springs de feuille, qui n'ont jamais eu de pendant dans le fichier.

**Reste à faire** : `error` est exposé mais **aucun écran ne le passe** — les deux
écrans OTP acceptent encore n'importe quel code à quatre chiffres. Câbler un vrai
refus est une décision de produit, pas de design system.

`npx tsc --noEmit` propre. Aucune vérification visuelle : la rangée fait 276 de
large (4 × 60 + 3 × 12), elle tient dans les trois écrans (327, 335 et 315
disponibles), mais ça reste calculé, pas mesuré.

## Partie XXXIV — La migration soldée (25 août 2026)

Les quatre chantiers laissés ouverts par la Partie XXX sont faits.

| Chantier | Ce qui remplace quoi |
|---|---|
| **Champs De/À de l'accueil** | Les deux blocs `styles.field` de `home.tsx` passent sur **`PlaceField`**. Huit styles morts retirés. |
| **Feuille de paiement** | `PaymentSheet.PayRow` passe sur **`ListRow`** dans une **`List`** à plat — la maquette avait absorbé `PaymentMethodRow` depuis la Partie XVIII. |
| **Contacts du destinataire** | `styles.contactRow` de `livraison/configure.tsx` passe sur **`ListRow`** + `Avatar`, filet en retrait 76. |
| **Écran de connexion** | `app/index.tsx` cesse de redessiner la marque : **`Logo`**, **`PhoneField`** et **`CountryPicker`** remplacent le carré bleu à ombre écrite en dur, le drapeau emoji et le champ maison. |

### Trois décisions prises en chemin

- **Le libellé d'un moyen de paiement ne change plus de couleur à la sélection.**
  C'est le `Radio` qui dit l'élu. Deux signaux pour la même chose, c'en était un
  de trop — et `ListRow` n'a pas de ton « sélectionné », à raison.
- **La `key` des champs De/À bascule avec `actif`.** Le rendu conditionnel
  d'avant remontait la saisie et `autoFocus` reprenait la main ; `PlaceField`
  rend toujours son `TextInput`, donc la `key` restaure ce comportement. Elle ne
  bouge pas pendant la frappe.
- **Le retrait du filet de l'accueil passe de 56 à 54** — `Medallion` 42 +
  gouttière 12. Il se déduit maintenant de la géométrie réelle au lieu d'être
  approché.

### Ce qui reste, et qui n'est plus de la migration

- `ListRow.subtitleAccent` n'a toujours pas de contrepartie dans la maquette.
- Les boutons `payBtn` / `payImg` des deux écrans `configure` — la pastille
  carrée qui ouvre la feuille de paiement — n'ont **pas** de composant en face.
  Ce n'est pas un retard du code : c'est un motif que la maquette ne connaît pas.
- Le `MenuDrawer`, le `WheelPicker` et le `CountryPicker` restent des
  compositions sans source de design depuis leur suppression du fichier.

`npx tsc --noEmit` propre. **Rien n'a été vérifié à l'écran** : cette passe touche
l'accueil (la feuille la plus animée du produit) et l'écran de connexion, les deux
méritent un passage au simulateur avant commit.

## Partie XXXIV bis — Mauvaise variante d'`IconButton` dans `PlaceField` (25 août 2026)

Défaut vu **à l'écran**, pas au typecheck : sur la ligne active de l'accueil, le
bouton « choisir sur la carte » s'affichait en **disque blanc** posé sur le
`primarySubtle` de la ligne. Trois erreurs cumulées de ma part au moment du
portage :

| | Ce que j'avais écrit | Ce que dit la maquette (`558:174`) |
|---|---|---|
| Variante au repos | *bouton absent* | `IconButton / Variant=flat` |
| Variante à l'actif | `flat` (fond `bg`) → disque blanc | **`link`** — nu, glyphe `primary` |
| Glyphe | `pin` (`MapPin`) | **`location`** (`MapPinLine`) |

**Le correctif n'est pas dans l'écran, il est dans le composant.** `PlaceField`
prenait un `action: ReactNode` — un emplacement libre, donc un endroit où
l'appelant pouvait se tromper de variante, et il s'est trompé. Il prend
maintenant `onAction` + `actionIcon`, et c'est **lui** qui choisit l'habillage
selon son état : `flat` au repos, `link` sur la ligne active. L'erreur n'est plus
exprimable.

Règle générale à retenir : *un slot libre là où la maquette impose un traitement
par état est un bug en attente*. Quand la maquette fait varier l'habillage d'un
enfant selon l'état du parent, c'est le parent qui doit le porter.

**Vérification de la même classe d'erreur ailleurs** : `ScreenHeader` et
`SheetHeader` emploient tous deux `IconButton / flat` avec le glyphe en
`textPrimary` — le code le force déjà, les deux sont conformes.

---

# Partie XXXV — Les trois sujets restants, traités (25 août 2026)

## 1. `Sous-titre accent` porté dans la maquette

`ListRow` gagne un troisième axe : **`Sous-titre = neutre | accent`**. En `accent`
la seconde ligne passe en `primary` — elle cesse d'être un fait pour devenir une
invitation (« Ajouter une adresse » sous un emplacement encore vide).

À ne pas confondre avec `Ton=action`, qui accentue le **titre**. Les deux disent
« cette rangée agit », mais pas au même endroit : `Ton=action` quand la rangée
EST l'action et n'a rien d'autre à dire (registre Grab, « Renvoyer le code ») ;
`Sous-titre=accent` quand le titre est un fait — Maison et Travail sont des
emplacements permanents, leur nom ne bouge pas — et que c'est la ligne du dessous
qui invite à le compléter.

Matrice creuse assumée : `accent` n'existe qu'en `État=repos, Ton=neutre`. Une
rangée désactivée n'invite à rien, une rangée déjà accentuée par son ton n'a pas
besoin d'un second accent. **7 variantes.**

> Le clonage de variante a rejoué les pièges n° 9, 10 et 12 d'un coup : slots
> dégradés en frames, références de propriétés perdues, clés surnuméraires. La
> parade documentée les corrige toutes les trois — et confirme qu'**il faut
> toujours auditer après avoir cloné une variante à slots**.

## 2. Les pastilles de paiement remplacées par une rangée

Relevé Mobbin sur la confirmation de course : **Uber, Careem, Gojek, Waymo et
Grab posent tous le moyen de paiement en rangée pleine largeur au-dessus du CTA**,
jamais en pastille. Gojek va jusqu'à passer la rangée en rouge quand aucun moyen
n'est choisi — exactement notre `ListRow / Ton=action`.

Le carré à logo des deux écrans `configure` disparaît donc au profit d'une
`ListRow` (logo en `leading`, **libellé du moyen** en titre, chevron). Le motif
sans composant n'est pas comblé : il est **retiré**. C'est la bonne façon de
solder un écart — se demander d'abord si le motif méritait d'exister.

Gain de lecture concret : la pastille montrait un logo et rien d'autre. Elle ne
disait ni quel moyen était sélectionné, ni qu'on pouvait en changer.

## 3. Les trois compositions auditées

Vérification que `CountryPicker`, `WheelPicker` et `MenuDrawer` ne sont bâtis que
de composants du système. Ils ne l'étaient pas.

| Composition | Corrigé |
|---|---|
| `CountryPicker` | Rangées de pays refaites à la main → **`ListRow`** (drapeau en `leading`, indicatif en `Valeur`, coche en `trailing`) · séparateur `hairlineWidth` maison → **`Divider`** · voile `#000` en dur → **`Scrim`** |
| `WheelPicker` | Valeur en `Outfit.semibold` 22/30 écrit en dur → **`heading1`**. Une des huit dernières tailles hors échelle du code |
| `MenuDrawer` | Filet de section fait main → **`Divider`** (l'air de 14 passe dans un conteneur, la primitive ne porte que le trait) · pastille de comptage en rayon 20 brut → **`Radii.pill`** |

### Ce qui reste sans contrepartie, et pourquoi

- **`proCard`** du tiroir (« Devenir prestataire ») — c'est la `PromoCard` du
  relevé d'écarts, pas encore construite.
- **La pastille de comptage** (« 240 pts ») — un `Badge` à ton neutre, l'axe `Ton`
  de `Badge` n'existe pas encore.
- **Les sous-rangées** de l'item Affiliation — laissées telles quelles par
  décision du 24 août : le tiroir sera repris en entier dans sa passe de design.
- **La roue elle-même** — aucun produit du système ne la décrit ; c'est une
  primitive de plateforme, comme le `Switch`.

`npx tsc --noEmit` propre. Rien vérifié à l'écran : les rangées de pays passent
d'un padding vertical de 14 à celui de `ListRow` (8), et les deux écrans
`configure` changent de mise en page en pied de feuille.

---

# Partie XXXVI — La fusion avec `main` (25 août 2026)

La PR #6 était bloquée : `main` avait reçu trois commits de Diana (14 et 20 août)
qui refont **exactement** les mêmes fichiers. Dix conflits, tous sur Compte, dont
deux « modification/suppression » — j'avais supprimé `SettingsRow` et
`SettingsGroup` pendant qu'elle les enrichissait.

## Ce que ce n'était pas

Ce n'était pas un conflit mécanique. Deux décisions de design se rencontraient :

| | Sa branche (main) | La nôtre |
|---|---|---|
| Rangée de réglage | `SettingsRow` enrichie d'un ton `accent` | supprimée au profit de `ListRow` |
| Valeur à droite | **retirée** — « elle dispute sa largeur au label et le fait passer à la ligne, d'où des rangées de hauteurs inégales » | `ListRow` en porte une (`Valeur`) |
| Surface | **page blanche, rangées à plat, filets bord à bord** (todo P5) | cartes `List / Style=carte` |
| Résumés | lus depuis `stores/payment` et `stores/safety` | écrits en dur |

## Règle de résolution retenue

**L'architecture est la nôtre, la grammaire est la sienne.** `ListRow` et `List`
restent — c'est ce que dit la maquette — mais ils adoptent ses décisions :

- **Aucune valeur alignée à droite dans Compte.** Les résumés passent en
  sous-titre. `ListRow` sait faire les deux : il suffit de ne pas passer `value`.
  Sa raison tient, et la maquette n'a rien à changer.
- **`List` absorbe la géométrie de `SettingsGroup`** : mode `plat` sans carte,
  nouveau prop `bleed` qui annule la gouttière de page pour que les filets filent
  d'un bord à l'autre, et titre en `label` secondaire plutôt qu'en `caption`
  tertiaire — sans carte, c'est le titre qui porte la coupure de section.
- **Ses deux stores sont conservés intacts**, ainsi que ses renommages
  (« Contacts de confiance » → « Sécurité »), sa suppression du groupe
  « Connexion », son bouton d'ajout en `primary`, et sa liste d'objets à pastille
  — qui devient un `Medallion / Ton=accent` dans le `leading` de la rangée.
- **Le style guide garde ses trois règles**, amendées de façon datée là où elles
  nommaient des composants supprimés.

## Ce qui a été tranché contre elle, et pourquoi

- **`PhoneField`** garde le rayon `lg` et le fond `surface` de la maquette, là où
  elle avait mis `md` et `bg`. La maquette fait autorité sur un composant ; c'est
  la consigne du 24 août.
- **Les champs de `compte/lieu` et `compte/profil`** restent sur `Field` : ses
  styles visaient l'ancien balisage, que le composant a remplacé.

## Reste à vérifier à l'écran

Le hub Compte et Sécurité changent de surface (page blanche, plus de cartes) et
de rythme. `npx tsc --noEmit` est propre, mais **cette fusion n'a pas été vue
tourner** — c'est le premier écran à ouvrir.

---

# Partie XXXVII — Les quatre contrôles écrits (25 août 2026)

Les quatre primitives dessinées le 24 août ont enfin leur pendant code. Huit
points d'appel migrés, quatre motifs faits main supprimés.

| Composant | Remplace | Sites |
|---|---|---|
| `Checkbox` | Deux cases divergentes — 22/rayon 6 et 24/`radius/sm` | `affilie/conditions`, `affilie/presentation` |
| `Toggle` | Le `trackColor`/`thumbColor`/`ios_backgroundColor` répété à chaque rangée | `compte/securite`, `compte/preferences` |
| `SegmentedControl` | Deux traitements — piste `track` + pastille blanche, et piste blanche + pastille `primarySubtle` | `transport/configure`, `affilie/reseau` |
| `Spinner` | `ActivityIndicator` posé à la main | `affilie/retrait-traitement`, `Button` (chargement) |

## Deux composants qui ne dessinent rien

`Toggle` et `Spinner` **enveloppent la primitive de plateforme** au lieu de la
redessiner — le `Switch` et l'`ActivityIndicator` de React Native. C'est
délibéré, et c'est ce que dit la maquette : elle a repris la géométrie iOS du
`Switch` (51 × 31, pouce 27) plutôt que d'en inventer une, parce qu'une maquette
que le code ne peut pas rendre ne sert à personne.

Leur valeur n'est donc pas visuelle, elle est **structurelle** : les couleurs et
les deux tailles réelles vivent à un seul endroit au lieu d'être recopiées à
chaque emploi. C'est le même service que rend `inputTypo()` aux champs de saisie.

## Les deux arbitrages appliqués

- **Checkbox 24 / `radius/sm` / liseré `thick`**, et liseré `textTertiary` au
  repos comme le `Radio` — pas `border`, qui est le liseré des surfaces.
  `affilie/presentation` perd sa version à 22 et son rayon 6 hors échelle.
- **Segment : piste `track`, pastille active `surface` + `Shadows.sm`.**
  `affilie/reseau` perd sa piste blanche à liseré et son libellé actif en bleu —
  le bleu revient à ce qui *sélectionne une valeur*, pas à ce qui *filtre une vue*.

## État de la migration

**50 des 56 composants de la bibliothèque ont désormais leur pendant code.**
Restent six : `Hint` (7 sites), `Toast` (2), `ResultState` (5), `ScreenFooter`
(12), `OptionCard` (encore dédoublé en `RapprochementChoice` et
`LivraisonModeChoice`), et `MapSurface` — qui n'est qu'un placeholder de
maquette pour `LeafletMap`, donc hors périmètre.

`npx tsc --noEmit` propre. Non vérifié à l'écran : le contrôle segmenté change
d'aspect sur `affilie/reseau`, et les cases à cocher d'`affilie/presentation`
grandissent de 2 px.

---

# Partie XXXVIII — La migration achevée (25 août 2026)

Cinq composants écrits, **23 points d'appel** migrés. Il ne reste plus rien de la
liste ouverte par la Partie XXX.

| Composant | Sites | Ce qui disparaît |
|---|---|---|
| `Hint` | 7 | Quatre noms pour une même note — `infoRow`, `help`, `hint`, `noteHint` — et deux traitements |
| `Toast` | 2 | Le cycle d'animation recopié à l'identique (180 / 1300 / 280 ms) |
| `ScreenFooter` | 8 | **Quatre géométries** de pied : filet `thin`, `hairline` ou absent ; fond `bg` ou `surface` ; 16 ou 32 en bas |
| `ResultState` | 4 | Les médaillons 88 et 112 faits main, et leurs blocs titre/corps |
| `OptionCard` | 2 | La carte de choix, dupliquée entre `RapprochementChoice` et `LivraisonModeChoice` |

## Trois décisions de conception

- **`Toast` sort avec son hook.** `useToast()` porte l'état, l'opacité animée et
  le geste ; le composant ne fait que rendre la pilule. C'est le cycle qui était
  dupliqué, pas seulement l'apparence — le sortir sans lui n'aurait rien réglé.
- **`ScreenFooter` calcule son bas.** `max(32, zone sûre + 16)` : la maquette
  pose 32 comme repos visuel, l'appareil impose sa zone sûre, le plus grand des
  deux gagne. Sinon la barre colle à la barre d'accueil sur un téléphone à
  encoche, ou flotte trop haut sur un téléphone plat.
- **`ResultState` ne porte pas ses actions**, mais accepte des enfants — le
  montant du retrait, la pastille « En cours d'arrivée », l'encart qui rassure.
  Les actions restent dans le `ScreenFooter` posé dessous.

## Ce qui n'a délibérément pas été migré

- **Le pied de `app/index.tsx`** n'est pas une barre d'action mais un pied de
  mentions légales : il porte du texte centré, pas des boutons.
- **`affilie/celebration`** attend le ton `marque` de `ResultState` — plein
  `primary`, médaillon blanc translucide — qui attend lui-même **un jeton
  d'opacité sur fond primaire**. C'est une décision de fondation.
- **Les pastilles de 64 des deux écrans de clôture** (`successBadge`) restent
  faites main : 64 n'est pas dans l'échelle de `Medallion` (42 / 56), et
  trancher cette échelle est l'autre décision de fondation ouverte.

## État

**54 des 56 composants de la bibliothèque ont leur pendant code.** Les deux
restants sont `MapSurface` — un placeholder de maquette pour `LeafletMap`, hors
périmètre — et le ton `marque`, qui n'est pas un composant mais une variante en
attente de jetons.

Un manque relevé en chemin, à porter dans la maquette : **`Button` n'a pas de
variante de lien NEUTRE.** « Passer » (clôture) et « Annuler » (récapitulatif de
retrait) sont des actions de texte en gris ; `link` est bleu et `linkDestructive`
rouge. Les deux restent donc des `TouchableOpacity` à la main.

`npx tsc --noEmit` propre. **Rien vérifié à l'écran** : le lot touche 23 endroits,
dont les deux écrans de clôture et les quatre écrans de retrait.

---

# Partie XXXIX — La variante manquante n'était pas une variante (25 août 2026)

J'avais conclu la Partie XXXVIII sur un manque : « `Button` n'a pas de variante
de lien **neutre** ». Relevé Mobbin fait sur les deux écrans concernés — la
conclusion était fausse, et le manque n'existe pas.

## Ce que dit le relevé

**Écran d'avis** (Shopee, Walmart, Grab, Grubhub, Gojek, Tesla Robotaxi) : un
seul CTA, et l'échappatoire est le **✕ de l'en-tête**. Freenow met son « Skip »
en lien accent **en haut à droite**, Waymo un bouton secondaire au-dessus du
contenu. **Aucun des huit ne pose de lien gris sous le CTA.**

**Récapitulatif d'un transfert d'argent** (Fidelity, Revolut, Careem, Wise,
Monzo, Betterment, Mercury) : **un seul CTA**, jamais de « Annuler ». Le retour
se fait par la flèche ou la croix de l'en-tête.

Un lien gris jumeau du CTA lui dispute l'attention sans jamais la gagner : il
occupe la zone la plus lue de l'écran pour dire « ne faites rien ».

## Ce qui a été fait

| Écran | Avant | Après |
|---|---|---|
| `affilie/retrait-recap` | « Annuler » sous le CTA — qui appelait `router.back()`, **exactement ce que fait déjà la flèche de son `ScreenHeader`** | Le lien disparaît. La même action figurait deux fois sur l'écran |
| `transport/cloture` · `livraison/cloture` | « Passer » en gris sous le CTA | Un **`IconButton`** ✕ en haut à droite, comme le fait la maquette pour ses feuilles (`SheetHeader`) |
| `otp` · `compte/numero` | « Renvoyer le code » à la main | **`Button variant="link" size="sm"`** |
| `affilie/dashboard` | « Voir mon réseau » + chevron à la main | **`Button variant="link"`** avec `trailingIcon` |
| `compte/profil` | « Modifier la photo » à la main | **`Button variant="link"`** |

**Aucune variante ajoutée au système.** Quatre liens qui existaient déjà y
entrent enfin, et deux motifs disparaissent parce qu'ils n'auraient pas dû
exister.

## Les trois qui restent, et pourquoi

- **« Créer un compte »** (`app/index.tsx`) — un fragment cliquable **dans une
  phrase** (« Pas encore de compte ? »). Ce n'est pas un bouton, c'est du texte
  enrichi ; l'entourer d'un composant casserait la phrase.
- **« Tout retirer »** (`affilie/retrait-methode`) — un lien en `caption` (12)
  aligné sur la ligne « Disponible : … ». L'échelle de `Button` s'arrête à 14
  (`sm`), et le passer à 14 le ferait dominer la ligne qu'il accompagne. Seul
  vrai candidat à une taille de lien plus petite, **si le cas se reproduit** ;
  un seul emploi ne fait pas une variante.
- **« Fermer »** (`affilie/celebration`) — blanc sur fond `primary`. `link` y
  serait bleu sur bleu. Il attend les **rôles « sur fond sombre »**, la même
  fondation ouverte que l'écran d'appel et le ton `marque` de `ResultState`.

## La leçon

Un motif du produit qui n'a pas de composant pose **deux** questions, pas une :
« quel composant lui manque ? » et « ce motif devrait-il exister ? ». J'avais
sauté la seconde. Le relevé y répond mieux que l'intuition — ici il a supprimé le
besoin au lieu de le satisfaire.
