# Fiw — Style Guide

> **Source de vérité des valeurs : `apps/fiw/constants/*.ts`.** Ce document en
> explique les intentions ; `docs/style-guide.tokens.json` en est la traduction
> machine, **générée** par `python3 scripts/gen-style-guide-tokens.py` — ne pas
> l'éditer à la main. Il avait divergé au point d'être faux (icônes Lucide jamais
> installées, boutons 52/44, ni `displayXl` ni jaune de marque) ; il est désormais
> dérivé, donc régénérable au lieu d'être à maintenir.

> Référence de design pour les applications **Fiw** (client) et **Fiw Pro** (prestataire). Mode clair uniquement. Les tokens sont nommés sémantiquement pour permettre l'ajout du mode sombre sans repartir de zéro.

---

## Couleurs

### Primaire

| Token | Fiw (client) | Fiw Pro |
|---|---|---|
| `color-primary` | `#0066FF` | `#084EC5` |
| `color-primary-hover` | `#0676FF` (600) | `#0D459B` (900) |
| `color-primary-pressed` | `#0D459B` (900) | `#0E2B5D` (950) |
| `color-primary-subtle` | `#EDF7FF` (50) | `#D6EDFF` (100) |
| `color-primary-on` | `#FFFFFF` | `#FFFFFF` |

### Échelle bleue complète (référence)

| Palier | Hex |
|---|---|
| 50 | `#EDF7FF` |
| 100 | `#D6EDFF` |
| 200 | `#B5E0FF` |
| 300 | `#83CFFF` |
| 400 | `#48B3FF` |
| 500 | `#1E92FF` |
| 600 | `#0676FF` |
| **700 (brand)** | **`#0066FF`** |
| **800 (Pro)** | **`#084EC5`** |
| 900 | `#0D459B` |
| 950 | `#0E2B5D` |

### Jaune de marque

Échelle calquée sur le bleu **par les rôles**, pas par les valeurs :

| Token | Hex | TSL | Rôle | Pendant bleu |
|---|---|---|---|---|
| `color-brand-yellow` | `#FFE347` | `51° 100% 64%` | Plein du logo Fiw. **Pastilles**, tags, accents. | `color-primary` |
| `color-brand-yellow-100` | `#F6E7A3` | `49° 82% 80%` | Clair. **Liserés** d'encart. | `blue-100` |
| `color-brand-yellow-subtle` | `#FFFBE9` | `49° 100% 96%` | Subtil. **Fonds** d'encart. | `color-primary-subtle` |

**Seuls jaunes autorisés.**

> ⚠️ **Ne pas décalquer les luminosités du bleu.** Le jaune est **lumineux** : à
> luminosité égale il paraît bien plus pâle. Chaque palier jaune descend donc **plus
> bas** que son pendant bleu — `brand-yellow-100` est à **80%** là où `blue-100` est à
> 92%, et il **se désature** (82%) pour exister comme liseré au lieu de se noyer dans
> le fond. Un jaune construit « à la luminosité du bleu » donne un liseré invisible :
> c'est l'erreur qu'on a faite au premier jet (`#FFF6C2`, L 88%, saturation 100%).
> Valeurs reprises de la piste **B** de la planche « Devenir prestataire ».

> **Paire fond + liseré.** Fond `subtle` + liseré au palier **`100`** (le clair —
> **pas** le plein), motif de la carte « Devenir prestataire » (page `app/menu`). Ne
> jamais poser un `subtle` sans son liseré : seul, il se fondrait sur le gris
> `color-bg`. Le **plein** porte les accents — pastille pleine (carte sidebar) ou
> glyphe d'icône (`Callout`).
>
> ⚠️ **Le jaune plein remplit, il ne dessine jamais.** `brand-yellow` sur
> `brand-yellow-subtle` ne donne que **~1.2:1** : un glyphe **tracé** en jaune plein
> est invisible sur son propre fond clair. Le plein ne sert qu'à **remplir une forme**
> — pastille, tag, liseré — et c'est le **glyphe sombre posé dessus**
> (`color-text-primary`) qui porte le contraste. C'est ce qui permet au jaune de
> rester **éclatant** : il n'a pas à se détacher du fond, puisque ce n'est pas lui
> qu'on lit. Motif : pastille de la carte « Devenir prestataire », repris par
> `Callout`.
>
> Corollaire : sur un aplat de plein, le pendant de `color-primary-on` n'est **pas**
> le blanc mais `color-text-primary` — le jaune plein est une couleur *claire*, un
> glyphe blanc y est illisible.
>
> Piège Phosphor : en `weight="fill"`, une icône comme `info` est un **disque plein au
> glyphe évidé** (c'est le fond qui transparaît dans l'évidement) — à ne pas mettre
> dans une pastille, ça ferait un disque sur un disque. Dans une pastille, le glyphe
> est en **`bold`** (tracé).
>
> Il n'y a **pas de palier foncé** dans l'échelle : avec le motif pastille, rien n'est
> jamais tracé en jaune. Le jour où du *texte* devra tenir sur un fond jaune, il en
> faudra un (≈ `49° 100% 30%` / `#998200` → 3.7:1) — surtout pas le plein.

À ne pas confondre avec `color-warning` (`#F59E0B`) / `color-warning-subtle`
(`#FEF3C7`), qui sont **fonctionnels** et disent « attention, quelque chose cloche ».
`color-brand-yellow-subtle` est volontairement **plus clair** que `warning-subtle`
pour qu'un encart de marque ne se lise pas comme une alerte.

> **Répartition des rôles bleu / jaune.** Le **bleu marque un état** (sélectionné,
> actif, par défaut, en cours) ; le **jaune appelle l'attention** (pédagogie, règle à
> lire, accent ponctuel). Un encart explicatif est donc **jaune** (`Callout`), jamais
> bleu — en bleu, il entrerait en concurrence avec les éléments dont il parle.
>
> **Corollaire : un bleu clair ne sert jamais de fond de mise en avant.**
> `color-primary-subtle` (`#EDF7FF`) et le fond de page `color-bg` (`#F9FAFB`) sont
> trop proches : l'élément teinté se **fond** au lieu de ressortir, et se lit comme un
> trou dans la carte plutôt que comme l'élu. Pour marquer l'élu d'une liste, utiliser
> un **liseré `color-primary`** (motif [Binance](https://mobbin.com/screens/8eb64cde-e589-48bd-9a0d-6e167e573166)
> / [Plazo](https://mobbin.com/screens/dee51755-5ef4-40a3-ac33-424d53553765), cf.
> `benchmark-compte-mobbin.md` D6) — un liseré tranche quel que soit le fond.

### Neutres

Dérivés de l'échelle de gris Tailwind (gray-50 → gray-900) ; les tokens sont nommés sémantiquement, le palier d'origine est rappelé en commentaire.

| Token | Hex | Palier | Usage |
|---|---|---|---|
| `color-bg` | `#F9FAFB` | gray-50 | Fond d'écran |
| `color-surface` | `#FFFFFF` | — | Cards, inputs, modals |
| `color-border-subtle` | `#F3F4F6` | gray-100 | Séparateurs légers |
| `color-border` | `#E5E7EB` | gray-200 | Bordures standards |
| `color-text-disabled` | `#D1D5DB` | gray-300 | États désactivés |
| `color-text-tertiary` | `#9CA3AF` | gray-400 | Placeholders, mentions |
| `color-text-secondary` | `#6B7280` | gray-500 | Texte secondaire |
| `color-gray-600` | `#4B5563` | gray-600 | Gris foncé (icônes neutres) |
| `color-gray-700` | `#374151` | gray-700 | Icônes flottantes sur carte (menu, recentrage) |
| `color-text-primary` | `#1A1A1A` | ~gray-900 | Texte principal |
| `color-text-on-primary` | `#FFFFFF` | — | Texte sur fond primaire |
| `color-hairline` | `rgba(17, 24, 39, 0.08)` | — | Liseré des éléments flottant sur la carte (translucide, neutre) |

### Fonctionnelles

| Token | Hex | Usage |
|---|---|---|
| `color-error` | `#EF4444` | Erreurs, champs invalides |
| `color-error-subtle` | `#FEE2E2` | Fond message d'erreur |
| `color-warning` | `#F59E0B` | Avertissements, wallet bas |
| `color-warning-subtle` | `#FEF3C7` | Fond message d'avertissement |
| `color-success` | `#10B981` | Confirmations, prestataire en ligne |
| `color-success-subtle` | `#D1FAE5` | Fond message de succès |
| `color-warning-ink` | `#B45309` | **Texte** sur `warning-subtle` |
| `color-success-ink` | `#047857` | **Texte** sur `success-subtle` |

**Pourquoi des encres séparées.** `warning` et `success` sont des **pleins** : posés
en texte sur leur propre palier subtil ils tombent sous 3:1 (2.0:1 pour l'ambre,
2.4:1 pour le vert). Ces deux paliers-là existent uniquement pour **écrire sur** le
subtil — c'est exactement le manque annoncé plus haut à propos du jaune de marque
(« le jaune plein remplit, il ne dessine jamais »).

Le couple équivalent en bleu existait déjà : `primary-subtle` en fond,
`primary-pressed` en encre. _(Ajoutés le 23 août 2026 : trois teintes de
l'`AvatarStack` vivaient en hex codés en dur dans `searching.tsx` — c'étaient les
dernières valeurs hors token du produit.)_

---

## Typographie

**Police** : Outfit — chargée via `@expo-google-fonts/outfit`.  
**Graisses chargées** : Light 300 · Regular 400 · Medium 500 · SemiBold 600 · Bold 700

> ⚠️ En RN, `fontWeight` ne sélectionne pas une graisse Outfit : chaque graisse doit être mappée à sa famille nommée (`Outfit_600SemiBold`…). La typo passe donc **obligatoirement par l'atome `Text`** à variants sémantiques (`display`, `heading1`, `heading2`, `body`, `body-small`, `label`, `caption`) — pas de `fontSize`/`fontWeight` bruts dans les écrans.

### Échelle

Miroir exact des **22 styles de texte Figma** `Fiw/*`. **La maquette fait autorité
sur l'échelle** : elle a été réglée à la main, le code s'y aligne
(`constants/typography.ts`). Toute taille/graisse passe par une variante de
l'atome `Text` — jamais de `fontSize`/`fontFamily` brut dans un écran.

#### Échelle de base — une graisse par taille

| Token | Taille | Interligne | Graisse | Usage |
|---|---|---|---|---|
| `displayXl` | 40px | 50 | Bold 700 | Grand nombre mis en avant (compte à rebours, gros montant) |
| `display` | 28px | 35 | Bold 700 | Titres onboarding |
| `heading1` | 22px | 28 | SemiBold 600 | Titre d'écran, titre de feuille |
| `heading2` | 18px | 23 | SemiBold 600 | En-tête de section |
| `body` | 16px | 20 | Regular 400 | Texte courant |
| `bodySmall` | 14px | 18 | Regular 400 | Texte secondaire |
| `label` | 14px | 18 | Medium 500 | Libellés |
| `caption` | 12px | 15 | Regular 400 | Horodatages, mentions légales, `Callout` |

#### Axe de graisse — les tailles employées en plusieurs graisses

L'échelle de base ne donne qu'une graisse par taille, or le design en emploie
plusieurs. Ces variantes existent pour que l'accentuation n'ait pas à passer par
une surcharge `style={{ fontFamily }}`, qui contournait l'atome `Text` et était le
principal vecteur de divergence.

| Token | Réglage | Complète |
|---|---|---|
| `bodyMedium` | 16/20 Medium | `body` |
| `bodySemibold` | 16/20 SemiBold | `body` |
| `bodySmallSemibold` | 14/18 SemiBold | `bodySmall` (Regular) et `label` (Medium) |
| `captionMedium` | 12/15 Medium | `caption` |
| `captionSemibold` | 12/15 SemiBold | `caption` |
| `heading2Bold` | 18/23 Bold | `heading2` |

#### Rôles — un réglage que sa taille seule ne décrit pas

Ils portent un nom d'**emploi** et non de graisse, pour qu'un changement de
l'échelle de base ne les décroche pas de la maquette — c'est exactement ce qui est
arrivé à `cardTitle` quand `body` est passé de 15 à 16.

| Token | Réglage | Emploi |
|---|---|---|
| `cardTitle` | 15/24 SemiBold | Titre d'une carte de choix (`OptionCard`) |
| `fieldPrefix` | 15/21 Medium | Préfixe dans un champ — indicatif de `PhoneField` |
| `infoValue` | 14/20 SemiBold | Valeur d'une rangée de restitution (`InfoRow`) |
| `amount` | 20/28 Bold | Montant mis en avant |
| `codeCell` | 28/36 Bold | Chiffre d'un code à saisir (`CodePill`, OTP) |
| `buttonMd` | 15/20 SemiBold | Libellé de bouton `md` |
| `buttonMdLink` | 15/20 Medium | Idem, variante `link` — descend d'une graisse |
| `buttonSm` | 14/20 Medium | Libellé de bouton `sm`, `ActionPill` |

**Deux réglages à 15 px, assumés.** L'échelle saute de 14 à 16, mais la maquette
emploie délibérément un 15 à trois endroits, avec trois interlignages (24, 21, 20)
et deux graisses. D'où trois entrées distinctes plutôt qu'une surcharge.

#### Champs de saisie

Un `TextInput` ne peut pas passer par l'atome `Text` — c'est par là que l'échelle
divergeait. Il reprend donc une variante via **`inputTypo('body')`**, qui en tire
famille et taille **sans l'interligne** : poser `lineHeight` sur un champ d'une
seule ligne décale le texte verticalement sur Android. Les champs **multilignes**,
qui ont besoin de cet interligne pour respirer, reprennent la variante entière
(`...Typography.body`).

#### Ce qui reste hors échelle, et pourquoi

| Site | Réglage | Raison |
|---|---|---|
| `PlateChip` | 15/20 Bold, `letterSpacing` 1.5 | Plaque d'immatriculation — la chasse élargie est le motif ; conforme à la maquette |
| `FlagChip` | 10/14 SemiBold, `letterSpacing` 0.3 | Code ISO sur un drapeau ; conforme à la maquette |
| `Avatar`, `PrestataireRow` | taille calculée | `fontSize: size * 0.38` — aucun cran fixe, cf. §Axes de taille |
| `Logo` textuel (`index`) | 32 Bold | Signe de marque, pas du texte courant |
| Emojis (`PaymentSheet`, drapeau `index`) | 28, 22 | Taille d'un glyphe, pas de la typographie |
| `WheelPicker`, saisies de montant `affilie` | 22/30, 48 | Chiffres d'un sélecteur ou d'une saisie de montant, absents de la maquette. _(Le 24 du champ téléphone de retrait a disparu le 27 septembre 2026 : l'écran passe par `Field / Type=téléphone`.)_ |
| Code d'affiliation (`affilie/outils`) | `display` + `letterSpacing` 2 | Même motif que `PlateChip` : un code se lit **caractère par caractère**, la chasse élargie EST le motif. Seul interlettrage assumé hors `PlateChip` et `FlagChip`. |

### Libellé de section en capitales

Le titre qui coiffe une liste ou une carte (`SettingsGroup`, `ReceiptCard`,
« DÉTAIL DU PRIX »…) a **un seul** traitement : `caption` + capitales +
`letterSpacing 0.8` + `color-text-tertiary`, exposé par `SectionLabel` dans
`constants/typography.ts`.

Le tracking et la casse vivent dans ce token, pas dans les `StyleSheet` des
composants — c'est ce qui empêche la divergence de revenir. _(Il y en avait deux
jusqu'au 23 août 2026 : `caption`/0.8/tertiaire dans `SettingsGroup`, `label`/0.5/
secondaire dans `ReceiptCard`, pour dire exactement la même chose. 0.8 l'emporte :
à cette taille, des capitales ont besoin de plus d'air que du corps de texte.)_

### Interlignage

**Un seul régime : l'`AUTO` de Figma**, c'est-à-dire les métriques intrinsèques
d'Outfit — un ratio de **×1.25**, arrondi au pixel. Les valeurs de la table
ci-dessus en découlent et ont été **mesurées** dans le fichier, pas calculées.

Elles sont fixées en dur côté RN (et non laissées à l'`AUTO` de React Native) :
les deux moteurs ne garantissent pas la même résolution, une valeur explicite
garantit la parité avec la maquette.

_Ce document prescrivait jusqu'au 24 août 2026 trois ratios distincts — titres
×1.3, corps ×1.6, labels ×1.4 — qui ne correspondaient ni à la maquette ni à ce
que le code appliquait. En particulier le corps de texte passe de ×1.6 à ×1.25 :
les paragraphes de plusieurs lignes sont sensiblement plus serrés qu'avant._

---

## Espacement

Base : **4px**. L'index d'un jeton vaut sa valeur divisée par 4 — `space-4` = 16px.

| Token | Valeur | Note |
|---|---|---|
| `space-1` | 4px | |
| `space-1.5` | 6px | **Demi-cran.** Interstice entre cartes d'une feuille groupée (`CARD_GAP`) |
| `space-2` | 8px | |
| `space-2.5` | 10px | **Demi-cran.** Gap interne de la famille `Button` |
| `space-3` | 12px | |
| `space-3.5` | 14px | **Demi-cran.** Padding horizontal des champs et pilules |
| `space-4` | 16px | |
| `space-5` | 20px | Padding vertical des cartes de feuille |
| `space-6` | 24px | |
| `space-7` | 28px | |
| `space-8` | 32px | |
| `space-12` | 48px | |
| `space-16` | 64px | |

**Trois demi-crans assumés.** 6, 10 et 14 ne sont pas des multiples de 4, contrairement
à ce que ce document affirmait jusqu'au 24 août 2026. Ils sont pourtant délibérés et
récurrents — 6 structure toutes les feuilles groupées, 14 tous les champs — et les
snapper sur la grille changerait le produit. Ils portent donc un jeton plutôt que de
rester en dur. Dans Figma : `space/1-5`, `space/2-5`, `space/3-5`, le tiret tenant lieu
de décimale (Figma interdit le point dans un nom de variable).

**En dessous de 4px, pas de jeton.** Les valeurs de 1, 2 et 3px sont des réglages
optiques internes à un composant (chasse d'une pastille, respiration d'un badge), pas
du rythme de mise en page. Elles restent en dur et sont concentrées dans `GammeCard`,
`OptionCard` et `Badge`.

---

## Rayons

| Token | Valeur | Usage |
|---|---|---|
| `radius-sm` | 8px | Tags, badges |
| `radius-md` | 12px | Boutons, **champs de saisie & SearchBar**, cards |
| `radius-lg` | 16px | Grandes cartes |
| `radius-card` | 20px | **Cartes de feuille** — `SheetCard`, `VehicleGroup` (et son bloc véhicule interne), `InfoBanner`. Palier propre aux cartes empilées dans un `GroupedSheet` : entre `lg` et `xl`, il épouse le rayon 28 de la feuille sans le répéter. Exposé en code sous `Radii.card` (ex-constante locale `CARD_RADIUS`). |
| `radius-xl` | 28px | **Bottom sheets, modals** — et rien d'autre. Une carte posée sur un écran n'y a pas droit : le QR de l'Affiliation le portait, ce qui lui donnait l'arrondi d'une feuille au milieu d'une page. _(Relevé le 27 septembre 2026.)_ |
| `radius-pill` | 999px | Éléments totalement arrondis (chips, segmented, pastilles) |

---

## Liserés

Miroir de la collection Figma `Fiw Stroke` et de `constants/strokes.ts`. Cinq
épaisseurs, nommées par le poids visuel et non par le nombre.

| Token | Valeur | Usage |
|---|---|---|
| `stroke-hairline` | le plus fin possible | Éléments **flottant sur la carte** — détache du fond carto sans peser. Se marie avec la couleur `hairline`. |
| `stroke-thin` | 1px | Liseré par défaut : champs, cartes, rangées, boutons secondaires |
| `stroke-medium` | 1.5px | Doit se voir sans crier : contour d'un bouton, carte de choix, pastille de plaque |
| `stroke-thick` | 2px | Liseré porteur : anneau d'un `Radio`, liseré blanc détachant un avatar, champ actif |
| `stroke-heavy` | 3px | Segment franchi d'un `StepProgress` — un trait qui **est** le contenu, pas un contour |

**`hairline` est le seul jeton du système dont la valeur diffère entre les deux
mondes.** React Native la calcule selon la densité de l'écran
(`StyleSheet.hairlineWidth` ≈ 0.5 en @2x, ≈ 0.33 en @3x) ; la maquette porte un
nominal de **0.5**. C'est voulu : « le trait le plus fin possible » est une notion
de plateforme, pas une valeur de design. Même nature que l'interligne `AUTO` de
Figma, résolu à ×1.25 côté code.

Aucun liseré n'est écrit en dur : les 69 déclarations de l'app passent par
`Strokes.*`, et les 88 nœuds de la bibliothèque Figma sont liés à la variable
correspondante.

---

## Ombres

Miroir des styles d'effet Figma `Fiw/shadow/*`. Teintées bleu marque pour rester dans la cohérence chromatique — **sauf `shadow-sheet` et `shadow-float`**, volontairement neutres (voir ci-dessous).

| Token | Valeur CSS | Usage |
|---|---|---|
| `shadow-sm` | `0 1px 3px rgba(0, 102, 255, 0.08)` | Inputs focus, cards plates |
| `shadow-md` | `0 4px 12px rgba(0, 102, 255, 0.12)` | Cards interactives, FAB |
| `shadow-lg` | `0 8px 24px rgba(0, 102, 255, 0.16)` | Bottom sheets, modals, toasts |
| `shadow-sheet` | `0 -6px 24px rgba(55, 65, 81, 0.30)` | Arête haute des bottom sheets (orientée vers le haut). Gris `gray/700`, pas bleu marque : le bleu n'y portait pas assez pour décoller la feuille du fond. |
| `shadow-float` | `0 5px 18px rgba(11, 18, 32, 0.24)` | Éléments flottant sur la carte (neutre, diffuse) |

---

## Éléments flottant sur la carte

Tout élément posé **par-dessus le fond cartographique** (boutons flottants, bottom sheet) doit se détacher visuellement sans dépendre du contraste de la carte, qui varie d'une zone à l'autre. Pattern inspiré de Waze / Google Maps :

1. **Liseré fin** — `color-hairline` en `hairlineWidth`. Trait translucide neutre qui dessine le contour quel que soit le fond (clair ou foncé) ; tient là où l'ombre seule disparaît sur fond clair.
2. **Ombre neutre diffuse** — `shadow-float`. Non teintée bleu (contrairement au reste des ombres) car une ombre marque « bave » sur une carte colorée ; le neutre décolle proprement.

| Élément | Liseré | Ombre |
|---|---|---|
| `IconButton` `floating` (menu, recentrage) | contour complet `color-hairline` | `shadow-float` |
| Bottom sheet (`sheetSurface`) | arête **haute** uniquement `color-hairline` | `shadow-sheet` (montante) |

> Règle : ne jamais poser un élément interactif directement sur la carte sans **liseré + ombre**. Tout nouvel élément flottant réutilise `color-hairline` + `shadow-float`.

---

## Boutons

**Forme** : **pill** (entièrement arrondi, `radius-pill`) sur toutes les variantes et tailles — cibles tactiles généreuses, style mobile moderne.
**Pleine largeur** par défaut pour les CTA (le bouton s'étire dans son conteneur colonne).
**Effet de press** : léger `scale 0.97` + bascule de couleur vers l'état pressé. Ombre `shadow-sm` sur les variantes pleines (`primary` / `destructiveFilled`).

### Variantes (couleurs par état)

Deux familles : **pleine** (fond de couleur, pour le CTA) et **transparente** (sans fond — pour les actions secondaires, à même empreinte pilule, typo et spacing que le primary). Parmi les transparentes, seul `secondary` porte une bordure (neutre gris) ; `destructive` est **sans bordure** (texte rouge). `link` fait exception aux deux familles : c'est un **texte-action** sans pilule (empreinte compacte, inline dans une rangée/formulaire). Benchmark Mobbin : Wise, X, Duolingo, Lyft, Fabric.

| Variante | Fond repos | Fond pressé | Texte | Bordure |
|---|---|---|---|---|
| `primary` | `color-primary` | `color-primary-pressed` | `#FFFFFF` | — |
| `secondary` | transparent | `color-bg` | `color-text-primary` | `color-border` (1.5px) |
| `destructive` | transparent | `color-error-subtle` | `color-error` | — |
| `destructiveFilled` | `#EF4444` | `#DC2626` | `#FFFFFF` | — |
| `inverse` | `color-surface` | `blue-100` | `color-primary` | — |
| `link` | transparent | transparent (opacité 0.55) | `color-primary` | — |
| `linkDestructive` | transparent | transparent (opacité 0.55) | `color-error` | — |

`disabled` : opacité 0.45 (toutes variantes). `loading` : spinner à la couleur du texte. Slots icône Phosphor leading/trailing sur toutes les variantes.

> **Choix de variante.** `secondary` (contour neutre gris) = action secondaire courante. `destructive` (texte rouge, **sans bordure ni fond**) = **annulation / action dangereuse secondaire** (ex. « Annuler la commande », « Annuler (gratuit) ») — à privilégier sur toutes les pages présentant ce type d'action, plutôt qu'un lien texte ad hoc. `destructiveFilled` (plein rouge) est **réservé** au cas où l'action destructive EST le CTA de l'écran (ex. « Raccrocher »). `link` (texte bleu primary, **sans fond ni bordure ni pilule**, empreinte compacte) = **action-lien inline** dans une rangée ou un formulaire (ex. « Modifier » un numéro, « Renvoyer le code ») — à privilégier plutôt qu'un `Text` + icône ad hoc. `inverse` (**plein blanc, texte `color-primary`**) = le CTA posé sur un **aplat de marque** — bouton « Retirer » de la carte Wallet, actions de l'écran de célébration. C'est le pendant *rempli* de `linkInverse`, exactement comme `primary` est celui de `link` : sans lui, un écran plein bleu n'avait que `secondary`, dont le contour gris et l'encre `color-text-primary` tombent à ~3:1 sur `#0066FF`. Son état pressé est `blue-100` — le seul assombrissement du blanc qui reste dans la palette de marque. _(Ajouté le 27 septembre 2026.)_ `linkDestructive` = le **pendant rouge de `link`** (même empreinte, texte `color-error`), pour l'action-lien qui retire/supprime dans une rangée (ex. « Retirer » un compte Mobile Money) — il permet d'opposer deux actions **de même forme** dans la même liste, seule la couleur changeant selon la portée (ex. slot rempli « Retirer » vs slot vide « Ajouter »).

### L'état désactivé : peindre ou délaver (amendement du 25 août 2026)

Deux mécaniques cohabitent dans la maquette, et **ce n'est pas une incohérence** :

- **Un contrôle à fond plein se délave en bloc** — `Button` désactivé, c'est
  l'opacité 0,45 sur les 21 variantes. Le fond et l'encre doivent pâlir
  *ensemble* : baisser la seule encre sur un aplat bleu casserait le contraste,
  et repeindre le seul fond laisserait un libellé plein sur un aplat mort.
- **Une rangée d'encres se REPEINT** — `ListRow` désactivé garde son opacité à 1
  et passe ses quatre encres (titre, sous-titre, tête, queue) en
  `color-text-disabled`. Il n'y a pas d'aplat à accorder, et chaque encre a son
  pendant désactivé dans la palette. Surtout : une opacité globale délaverait
  aussi ce qui n'est **pas** de l'encre — le disque d'un `Medallion`, la photo
  d'un `Avatar` deviennent translucides sur le fond et la rangée se troue.

**Règle** : dès qu'un composant peut recevoir autre chose que du texte dans un
emplacement (une tête, une fin de rangée), son état désactivé se **peint**. Le
délavage est réservé aux contrôles dont on connaît tout le contenu.

_(Née d'un vrai défaut : `ListRow` délavait la rangée entière, `Medallion` compris,
là où la maquette ne grise que l'encre — Partie XLI de l'inventaire.)_

### Tailles (hauteurs pouce-friendly ≥ 48px)

| Taille | Hauteur | Padding horizontal | Typographie | Icône | Usage |
|---|---|---|---|---|---|
| `lg` | 56px | 28px | Outfit SemiBold 16px | 20px | CTA pleine largeur |
| `md` | 48px | 20px | Outfit SemiBold 15px | 18px | Actions courantes |
| `sm` | 40px | 16px | Outfit Medium 14px | 16px | Actions inline / compactes |

---

## Icônes

**Bibliothèque** : [Phosphor Icons](https://phosphoricons.com) via `phosphor-react-native` (+ `react-native-svg`). Exposée **uniquement** via l'atome `Icon` (sous-ensemble nommé et curé) — jamais d'import direct, pour empêcher le mélange de familles.

- **Poids** : exposé dans Figma comme axe `Weight=bold | fill` du set `Icon` (71 glyphes × 2 poids = 142 variantes, géométrie extraite de `phosphor-react-native`). `bold` par défaut partout — outline à trait épais, style graphique affirmé cohérent avec le logo et les éléments de marque (on évite le trait fin de `regular`). `fill` réservé aux états **actifs/sélectionnés** (onglet courant, marqueur carte actif, favori activé, étoile pleine) — emphase au-dessus du `bold`. Ni `regular` ni `duotone` ne sont utilisés comme style de base.
- Taille standard dans les boutons : 18px
- Taille standard inline (texte) : 16px
- Taille grande (actions flottantes, écrans vides) : 24px
- Couleur : hérite du contexte (`color-primary`, `color-text-secondary`, etc.)
- **Pas d'emoji** dans l'UI fonctionnelle. Moyens de paiement = logos SVG (Wave/Orange/Free) en assets ; avatars = initiales ou photo. Une éventuelle couche d'illustrations viendra plus tard comme groupe de tokens séparé.

---

## Composants & organismes

Le DS suit une logique **Atomic Design pragmatique à 3 niveaux**, dans un package partagé entre Fiw et Fiw Pro (voir [ADR 0004](adr/0004-design-system-package-partage.md)) :

```
packages/tokens/   ← foundations (couleurs, type, espacement, rayons, ombres, icônes)
packages/ui/
  components/       ← atomes + molécules (Text, Icon, Button, IconButton, SearchBar, TopBar, PlaceRow…)
  patterns/         ← organismes (BottomSheet, Panel…)
apps/fiw, apps/fiw-pro  ← templates + pages (routes Expo)
```

### Atomes / molécules clés

| Composant | Rôle | Points clés |
|---|---|---|
| `Text` | Typographie | Variants sémantiques, mappe graisse→famille Outfit. Seul point d'entrée typo. |
| `Icon` | Icône | Phosphor, sous-ensemble nommé, `regular`/`fill`. |
| `Button` | Action | 7 variantes (`primary` / `secondary` contour neutre / `destructive` texte Error / `destructiveFilled` plein rouge / `inverse` plein blanc à texte bleu, sur aplat de marque / `link` texte-action sans fond / `linkDestructive` idem en rouge), tailles `lg`/`md`/`sm`, slots icône, loading/disabled. |
| `IconButton` | Bouton rond icône | Set `Variant` × `Size`. **Variantes** : `floating` (blanc + liseré + ombre, sur carte ; **icône gris foncé `gray-700`** — neutre, registre nav, pas le bleu marque) · `flat` (fond gris, dans sheet ; icône bleu marque) · `secondary` (transparent + liseré `border`, icône `textPrimary` — action de second rang lisible sur fond teinté, ex. bouton carte d'un `PlaceField`) · `link` (**nu**, ni fond ni liseré, icône bleu marque — actions inline d'un champ : effacer, afficher le mot de passe). **Tailles** : `lg` 46 / icône 24 · `md` 40 / icône 22 · `sm` 32 / icône 18. Défaut : `lg` en `floating`, `md` ailleurs. ⚠️ `sm` passe sous la cible tactile de 48 — réservé à l'intérieur d'un contrôle qui porte déjà la zone de frappe. _(Étendu le 23 août 2026.)_ |
| `SearchBar` | Recherche | Deux variantes : `sheet` (dans une feuille — fond `bg`, rayon `md`, liseré `border`, h48) et `floating` (posée **sur la carte** — pilule blanche, liseré `hairline`, `shadow-float`, h46). Croix d'effacement quand le champ n'est pas vide, slot `trailing` optionnel (bouton carte, micro). **Ne couvre pas** les champs De/À de l'accueil : ce sont des rangées d'itinéraire à deux lignes, pas une recherche. _(Construite le 23 août 2026 — jusque-là ce tableau la décrivait alors qu'elle n'existait nulle part, et trois écrans la réimplémentaient chacun à sa façon.)_ **Prop `onPress` = raccourci** : la barre cesse d'être un champ et devient un BOUTON qui en a l'apparence — plus de `TextInput`, un `Text` tertiaire à la place du placeholder, et le tap ouvre là où la vraie saisie a lieu (le « Où allez-vous ? » en tête de l'accueil). Un prop et non un composant distinct, parce que c'est le MÊME objet à l'écran, à la mesure près — et c'est justement ce qui le fait marcher. _(27 septembre 2026.)_ |
| `ScreenHeader` | En-tête de page | `IconButton` retour (icône forcée en `gray-700`, pas en bleu) + titre `heading2` + slot d'action à droite. Gère la safe-area. Le pendant « feuille » est `SheetHeader` (titre `heading1` + croix). **N'inclut pas** les boutons flottants sur carte (ce sont des `IconButton` posés séparément). |
| `PlaceRow` | Ligne de lieu | Cercle d'icône + titre + sous-titre + trailing. Récents, suggestions, lieux enregistrés. |
| `Field` | Toute saisie | Set à **trois axes** : `Type` = `texte` · `téléphone` · `zone`, `État` = `repos` · `actif` · `erreur` · `désactivé`, `Contenu` = `rempli` · `vide` — 24 variantes. Vide et rempli sont orthogonaux à l'état : un champ focus peut être vide, un requis en erreur l'est par définition. Le champ **vide** affiche un `Placeholder` en `text-tertiary` et **n'a pas de bouton d'effacement** (rien à effacer) ; le champ **rempli** le porte dans les trois types — au centre à droite en `texte` et `téléphone`, **en haut à droite** en `zone`. La couleur du × suit l'état (`text-tertiary` / `primary` / `error` / `text-disabled`). Libellé avec astérisque requis, icône de tête, slot trailing, texte d'aide sous le contrôle. `Type=téléphone` porte le chip indicatif (drapeau + `+code` + caret) ouvrant le `CountryPicker`, numéro **formaté par pays** (`constants/countries.ts`), **tous pays acceptés** — point d'entrée unique de toute saisie de téléphone, changement de numéro **et** onboarding (cf. `sitemap-client.md` §1). _(Absorbe `PhoneField` et `TextArea`, retirés le 23 août 2026 ; **absorption effective dans le code le 25 août 2026** — `Field` porte l'axe `type` = `texte` · `téléphone` · `zone`, et `components/PhoneField.tsx` est supprimé.)_ |
| `PlaceField` | Saisie d'un Lieu | Départ / arrivée : deux lignes (libellé + valeur), icône de tête, bouton rond « choisir sur la carte » optionnel, état `actif`. Distinct de `Field` — on y saisit un Lieu, pas du texte libre. Pendant de `PlaceRow`, qui **affiche** un Lieu. |
| `CountryPicker` | Choix du pays | Feuille **3 crans** (`hooks/useSnapSheet`) + barre de recherche + liste monde triée. Drapeaux = **PNG plats locaux** (`assets/flags/`, map `constants/flags.ts`) rendus via `FlagChip` — **pas de SVG** (`SvgXml` plante sur les drapeaux à bloc `<style>`). |
| `PayLogo` | Logo d'un moyen de paiement | Gabarit 56 : **le logo de marque quand il existe** (`PAY_ILLUSTRATIONS`), sinon le `Medallion lg` du système. Extrait de `PaymentSheet` le 27 septembre 2026, quand le choix d'opérateur du retrait Affilié en a eu besoin — il dessinait jusque-là une pastille de couleur de 12 px par opérateur, contre la règle « moyens de paiement = logos en assets » du §Icônes. |
| `SettingsRow` | Ligne de réglage | Icône ligne + label + **sous-titre** + slot `right` + chevron. Variante `destructive` (label rouge) ; prop `accent` = **rangée d'objet** (pastille bleue 42 px, voir la règle plus bas). Page Compte et sous-écrans. **Volontairement pauvre** : un objet plus riche (logo de service, badge d'état, action sur une 2ᵉ ligne — cf. carte de `compte/paiement.tsx`) mérite **son propre composant**, pas des slots ajoutés ici un par un. Le résumé de la rangée passe **toujours par `subtitle`**, jamais par une valeur alignée à droite : la valeur de droite dispute sa largeur au label et le fait passer à la ligne, d'où des rangées de hauteurs inégales. `subtitle` est en `numberOfLines={1}` — un résumé trop long se tronque, il ne déforme pas la liste. |
| `SettingsGroup` | Groupe de réglages | Regroupe des `SettingsRow` séparées par un filet 1 px **de bord à bord**, label de section en capitales (`label` 13 px medium, gris secondaire) + `footnote`. **Sans carte** — voir la règle ci-dessous. |
| `Radio` | Pastille de sélection | Coché = fond bleu marque + tick blanc ; décoché = cercle vide `text-disabled`. Marque l'élu d'un ensemble à choix unique **dans une feuille de choix** (`PaymentSheet`). Non tappable en propre — c'est la rangée qui porte l'action. Dans une **liste persistante**, préférer `SettingsRow selected` + badge (voir ci-dessous). |
| `Callout` | Encart d'information | Fond `brand-yellow-subtle` + liseré `brand-yellow-100` + **pastille `brand-yellow` à glyphe sombre** (structure de la carte « Devenir prestataire » — le jaune remplit, le glyphe dessus porte le contraste). Pour une **règle** ou une **affordance non devinable** que le Client doit lire. Jaune et **pas bleu** : cf. répartition des rôles bleu/jaune. **Un seul par écran** — au-delà, c'est un problème de hiérarchie. À distinguer du motif `infoRow` (icône + `caption` tertiaire **sans fond**), qui précise sans réclamer l'attention. |
| `StepList` | Liste explicative | `Medallion sm` en tête + titre `bodyMedium` + corps `bodySmall` **qui passe à la ligne**, 20 d'air entre les items, aucun filet. Le pendant de `List`/`ListRow` pour du texte qui respire — voir la règle « Une porte se tronque, un paragraphe respire ». Axe `ton` = celui de `Medallion` (`accent` quand les étapes sont la matière de l'écran, `neutre` quand elles déroulent un texte déjà annoncé). ⚠️ Rien à voir avec `StepProgress`, qui mesure l'avancement RÉEL d'une Commande. _(Construit le 27 septembre 2026.)_ |

> **Les cartes sont pour les objets ; les portes sont à plat.** Une carte blanche
> encadrée représente **une chose qui a un état** — un moyen de paiement (configuré /
> par défaut), une gamme, un reçu, un lieu. Une rangée de réglage ne représente
> rien : c'est une **porte** vers un écran. Lui donner une carte, c'est ajouter du
> cadre là où il n'y a pas de contenu à cadrer — la page se charge visuellement sans
> livrer une information de plus.
>
> Donc : **les écrans de réglages sont à plat sur fond blanc** (`color-surface`),
> rangées séparées par un filet 1 px `color-border` de bord à bord, sections
> séparées par un label en capitales et de l'air. C'est la géométrie déjà retenue
> pour la **page Menu** (`app/menu`) — même nature de liste, même traitement — et le
> contraste gris-sur-blanc résiste mieux à une lecture en plein soleil que le
> gris-sur-gris d'une carte posée sur `color-bg`.
>
> _Amendement du 4 septembre 2026 : le code de `app/menu` ne l'appliquait pas.
> La page portait encore la rangée maison héritée du drawer — gouttière 24,
> gap 14, aucun filet entre rangées — et divergeait donc de sa propre page
> fille. Elle passe par `List style_="plat"` + `ListRow` comme le reste des
> réglages. Elle garde le nom **« Menu »** : c'est le mot du modèle
> « profil-mince + menu » du benchmark, et Historique, Fidélité, Affiliation et
> Aide y sont les FRÈRES du portrait, pas des réglages. Elle a porté
> « Paramètres » quelques heures le même jour, le temps de voir que ce nom
> désignait une rubrique qu'elle ne contient pas — les réglages vivent un cran
> plus bas, dans « Mon compte & Sécurité »._
>
> _Amendement du 14 septembre 2026 — l'exception qui existait sans être écrite._
> Une **proposition** n'est pas une porte de réglage, et elle a droit à sa carte.
> La règle disait « une rangée de réglage ne représente rien, c'est une porte » ;
> une proposition, elle, représente bien quelque chose — une offre, avec ses
> conditions et son gain. Le cadre y livre donc une information que la rangée à
> plat ne livre pas : *ceci n'est pas un réglage de plus*.
>
> Ce n'est pas un revirement, c'est la mise par écrit d'une exception qui
> tournait déjà : « Devenir prestataire » portait cette carte dans le tiroir
> depuis des mois, et la règle du 11 août ne l'a jamais visée. Le motif est celui
> que `colors.ts` nomme — fond `color-primary-subtle`, liseré `blue-100`,
> pastille `color-primary`.
>
> **La portée est étroite, et c'est voulu** : les deux propositions d'argent du
> pied du Menu. Un écran de réglages reste à plat sur fond blanc ; une porte qui
> ouvre une rubrique aussi. Le test : si l'élément a quelque chose à **proposer**
> plutôt qu'un endroit où **mener**, il peut prendre la carte.

> ⚠️ **Précision sur le benchmark.** `benchmark-compte-mobbin.md` décrit la carte de
> réglages comme le « motif unanime » de Bolt / Careem / Réglages iOS. Cette
> unanimité est celle d'un **échantillon iOS** : toutes les recherches Mobbin ont été
> faites en `platform: "ios"`, et la carte blanche sur gris est précisément l'idiome
> des Réglages iOS. L'idiome natif Android — la plateforme dominante du marché
> dakarois — est l'inverse : rangées à plat, filets pleine largeur, en-têtes de
> section. _(Décidé en rendant le 11 août 2026, todo P5.)_

> **Un portrait confirme, il n'appelle à rien : il se vide de son aplat.** Le
> bloc avatar + nom + téléphone d'une page d'atterrissage répond à « de qui
> parle-t-on ? ». Ce n'est pas une action, pas un objet qu'on possède, pas un
> état : rien qui justifie une masse de couleur. `Avatar` porte donc les deux
> familles que `Button` distingue déjà — **plein** et **contour** :
>
> | Variante | Fond | Liseré | Initiales |
> |---|---|---|---|
> | `plein` (défaut) | `color-primary-subtle` | `color-surface` (détourage) | `color-primary-pressed` |
> | `contour` | `color-surface` | `color-border-subtle` | `color-gray-700` |
>
> **Ce n'est pas un axe de ton mais de remplissage**, et c'est ce qui fait
> qu'il marche : ce n'était pas la couleur qui tirait l'œil, c'était la MASSE.
> En `contour` il ne reste que les lettres, et elles ne sont pas bleues non
> plus : `color-gray-700` est le gris foncé des glyphes neutres du système —
> celui de l'icône de retour de `ScreenHeader`. Des initiales sont un glyphe
> plus qu'un texte courant, d'où ce palier plutôt que `color-text-primary` ou
> `color-text-secondary`. Le liseré, jusque-là blanc et invisible sauf en
> chevauchement, devient le contour du cercle puisqu'il n'y a plus d'aplat pour
> le dessiner ; son épaisseur ne change pas (`stroke-thick`).
>
> **Où va chacune.** `plein` reste le défaut, et c'est le bon pour un
> **prestataire** : on attend quelque chose de lui, la couleur le désigne.
> `contour` est celle du **portrait du Client sur le Menu**, page dont la seule
> chose à mettre en avant est la proposition du pied.
>
> _(Décidé le 14 septembre 2026, en regardant le Menu à l'écran, en deux temps :
> d'abord vider l'aplat, puis retirer le bleu des initiales. Une version en deux
> gris pleins — fond `color-bg`, initiales `color-text-secondary`, empruntée à
> l'axe `Ton` de `Medallion` — avait été écrite puis écartée en chemin.)_

> **Le poids d'une proposition suit la FRÉQUENCE de sa décision, pas
> l'importance de sa rubrique.** Quand deux propositions vivent côte à côte —
> le pied du Menu en a deux, l'Affiliation et « Devenir prestataire » — c'est le
> rythme auquel on dit oui qui règle leur poids visuel, pas leur poids au
> business.
>
> Une proposition **récurrente** se gagne par la répétition : on dit oui à la
> cinquième exposition, donc elle a besoin d'une présence tenue — un bloc à son
> identité, illustré. Une décision **unique et lourde** ne se prend pas deux
> fois et ne se prend pas parce qu'une carte l'a rappelée : elle se gagne par la
> **trouvabilité** au moment où l'idée vient. Un texte-lien la rend trouvable
> sans lui donner un poids qu'elle n'utilisera jamais. D'où, sur le Menu : un
> bloc `blue-100` illustré pour l'Affiliation, un `Button variant="link"` centré
> pour « Devenir prestataire ».
>
> _Amendement du 14 septembre 2026, le même jour que la règle qu'il remplace._
> Ce paragraphe disait d'abord l'inverse : deux **jumelles**, une seule anatomie,
> séparées d'un seul cran de bleu. Cette forme a été construite, mise à l'écran,
> et écartée — l'écart d'un palier disait « presque pareil » là où les deux
> propositions ne sont pas de même nature. L'erreur est instructive et vaut
> d'être gardée : elle vient d'avoir repris au tiroir la phrase « deux blocs de
> la même famille, seul le **poids** les sépare » **sans reprendre son écart**.
> Le tiroir opposait un aplat PLEIN à une carte claire ; en ramenant les deux au
> clair, on a gardé la formule et perdu ce qu'elle mesurait. Citer une intention
> ne suffit pas — il faut vérifier de quelle amplitude elle parlait.

> **Toute porte porte son résumé ; une rangée qui agit n'en a pas.** Une rangée
> qui **ouvre un écran** dit en `subtitle` ce qu'il y a derrière : c'est ce qui
> évite d'avoir à ouvrir la porte pour savoir si on avait besoin de l'ouvrir. Une
> rangée qui **agit** — « Se déconnecter », « Supprimer mon compte » — n'ouvre
> rien : son titre est déjà l'acte entier, et lui coller une seconde ligne
> reviendrait à commenter un bouton.
>
> Le sous-titre **ajoute, il ne redit pas** : il n'énumère pas la rubrique que le
> titre nomme déjà (« Mon compte & sécurité » ne se résume pas par « …sécurité »)
> et il ne réécrit pas ce qu'un `trailing` affiche à dix pixels de là (sous
> « Fidélité », la pastille porte les 240 pts, le sous-titre dit ce qu'ils
> achètent). Quand une **source réelle** existe, il s'y lit plutôt que d'être
> écrit en dur — un lieu ajouté, une course de plus, un compte retiré s'y voient
> aussitôt. Le reste de la mécanique — jamais une valeur alignée à droite,
> troncature à une ligne — est dans la fiche de rangée ci-dessus.
> _(Confirmé le 4 septembre 2026, en donnant son résumé à chaque porte de la page
> Menu.)_

> **Une liste d'objets porte la pastille ; un groupe de réglages porte l'icône
> nue.** Dans une liste d'**éléments que le Client possède** — un Lieu
> enregistré, un Contact de confiance — le glyphe de tête passe en bleu marque
> dans une pastille `color-primary-subtle` de **42 px** (géométrie de
> `Medallion / Ton=accent`, glyphe 20 ; une `ListRow` l'obtient en posant un
> `Medallion` dans son `leading`). Dans un groupe de **réglages**, il reste une icône ligne nue de
> 22 px.
>
> La pastille se met alors sur **toutes** les rangées de la liste, y compris
> l'état vide : c'est la liste entière qui change de grammaire, pas une rangée
> qui se distingue. Elle décale le label d'une douzaine de pixels par rapport à
> un groupe de réglages voisin — c'est la marque de la liste, et à l'intérieur
> d'une liste rien n'est désaligné.
>
> Corollaire : la même pastille sur les deux écrans. Les Lieux enregistrés et
> les Contacts de confiance sont deux listes de même nature ; deux tailles de
> pastille pour un même motif se lisent comme une erreur, pas comme une nuance.
> _(Décidé en rendant le 15 août 2026 ; la pastille, née à 34 px pour la seule
> rangée « Ajouter… », est passée à 42.)_
>
> _Amendement du 25 août 2026 : `SettingsRow` et `SettingsGroup` sont absorbés
> par `ListRow` et `List`, comme dans la maquette. La règle ne change pas — la
> pastille est désormais un `Medallion / Ton=accent` posé dans le `leading` de la
> rangée, et le mode `plat` de `List` porte la géométrie sans carte décrite
> ci-dessus (débord de la gouttière pour que les filets filent aux bords)._

> **Le filet d'une liste en feuille file d'un bord à l'autre.** Une liste posée
> dans une `BottomSheet` sépare ses rangées d'un filet **pleine largeur**
> (`Divider / Retrait=0`) — quelle que soit la tête des rangées : icône 22,
> `Medallion` 42 ou 56, `Avatar` 48. Une liste d'**écran** garde son retrait,
> aligné sur le texte (`Divider / Retrait=50`, le défaut de `List`).
>
> Le pourquoi tient à ce que le filet sépare. Sur un écran, la liste est le
> contenu : le filet y découpe des rangées entre elles, et se retirer sous le
> texte dit « c'est la même famille, ligne après ligne ». Dans une feuille, la
> liste n'est qu'un **bloc parmi d'autres** — un en-tête, un champ, un CTA
> l'entourent ; le filet y sert de règle horizontale qui tient la colonne, et un
> retrait le ferait flotter au milieu du bloc sans rien border. C'est aussi ce
> qui évite d'avoir à recalculer un retrait par taille de tête : en feuille, il
> n'y en a qu'un.
>
> _(Décidé le 25 août 2026, sur relevé : les huit filets des listes en feuille de
> la maquette — accueil, adresse ×2, paiement ×2, destinataire — sont tous en
> `Retrait=0`, quand le composant `List` seul est réglé sur 50. Le code calculait
> jusque-là un retrait depuis la largeur de la tête, partout. Partie XLI.)_

> **L'action « ajouter » d'un écran de gestion est un bouton `primary` sous la
> liste.** Sur un écran dont c'est la **seule** action — Lieux enregistrés,
> Contacts de confiance — la forme retenue n'est ni le `secondary` (elle n'est
> pas une action secondaire, il n'y en a pas d'autre) ni la rangée « + Ajouter »
> en dernière ligne de liste (motif Bolt / Uber). Une rangée d'ajout **se range
> parmi les objets** : elle se lit comme un élément de plus dans la liste, alors
> qu'elle en crée un. Le bouton plein la sort de la liste et la nomme pour ce
> qu'elle est.
> _(Tranché par le client le 20 août 2026, après comparaison des deux formes sur
> interrupteur de démo. Aligne Sécurité, qui était resté en `secondary`.)_

> **La seconde ligne d'une rangée d'objet dit ce qui MANQUE, pas ce qu'il y a.**
> Un Lieu enregistré tient deux informations — l'adresse et le **Repère** — et
> une rangée n'a qu'une seconde ligne. Elle porte donc l'adresse quand le lieu
> est complet, et sinon l'invitation à combler le trou : « Ajouter une adresse »
> d'abord (sans elle le lieu n'existe pas), « Ajouter un Repère » ensuite, en
> `color-primary` — le bleu de l'action, cf. `subtitleAccent`.
>
> Le raisonnement vaut au-delà des lieux : **on ne relit pas un texte qu'on a
> écrit soi-même**, mais on doit voir l'objet qui va échouer. Afficher le contenu
> du Repère aurait demandé une troisième ligne, donc une carte — un cadre bâti
> pour montrer un état, occupé à afficher ce que personne ne relit.
> _(Tranché le 20 août 2026 ; variante carte à trois lignes construite,
> comparée, écartée.)_

> **Un portrait par flux : la page d'atterrissage le porte, ses filles en font
> une rangée.** Le bloc avatar + nom + téléphone confirme **de qui on parle** —
> un travail qui ne se fait qu'une fois, à l'entrée. Répété sur la page fille il
> ne confirme plus rien : il redit à un tap d'intervalle ce qu'on vient de lire,
> et il y est la seule **porte** qui ne soit pas une rangée, alors qu'il ouvre un
> écran exactement comme les autres en ouvrent un.
>
> Donc : le **Menu** porte le portrait (`Avatar` 64, nom `heading2`, téléphone
> `bodySmall`), et **Mon compte & Sécurité** ouvre sa liste par une rangée
> « Profil ». Ce que le portrait portait en propre — la **Note du Client** —
> passe en **résumé de cette rangée** (`subtitle` + `subtitleIcon="star"`), au
> même titre que « Espèces, Wave, Orange Money » résume Moyens de paiement : le
> sous-titre dit ce qu'il y a derrière la porte, et la Note est la seule matière
> de la fiche Profil que le Client ne connaisse pas déjà par cœur.
>
> La redondance de **D3** n'est pas touchée : deux entrées mènent toujours à la
> page Compte depuis le Menu — le portrait et la rangée « Mon compte &
> sécurité ». C'est la répétition du portrait **d'un écran à l'autre** qui tombe,
> pas la double entrée **d'un même écran**.
> _(Décidé le 4 septembre 2026, en alignant le Menu sur la grammaire de sa
> page fille.)_

> **Une porte se tronque, un paragraphe respire.** `ListRow` coupe son titre
> et son sous-titre à une ligne, et c'est sa raison d'être : des rangées
> voisines gardent la même hauteur, la liste tient comme une colonne. Une
> **étape** de « Comment ça marche », une **clause** de contrat, un fait qu'on
> explique — ça n'est pas une porte, ça ne mène nulle part, et le tronquer lui
> retire son sens. Ces listes-là passent par **`StepList`**.
>
> Le réflexe à ne pas avoir, c'est d'ajouter à `ListRow` un prop « pas de
> troncature » : il aurait cassé la seule chose qui fait tenir une liste de
> portes. C'est un composant distinct qui manquait, pas une option.
>
> Les deux se ressemblent volontairement — même typographie (`bodyMedium` /
> `bodySmall` secondaire), même gouttière 12 — pour se lire comme une seule
> famille. Trois choses les séparent : le médaillon est **aligné en haut** (le
> corps peut faire trois lignes), il est en **`sm`** (36, l'empreinte que
> `Medallion` réserve nommément à la liste d'étapes, là où `md` 42 est celle
> d'une rangée), et les items sont séparés par **20 d'air** plutôt que par un
> `Divider` — un filet découperait un texte suivi en cases.
> _(27 septembre 2026, en reprenant `affilie/presentation` ; cf.
> `benchmark-affiliation-mobbin.md`.)_

> **Une proposition demande une mention ; un contrat demande une case.** Le
> consentement n'a pas la même forme selon ce que l'écran est en train de
> faire :
>
> - L'écran **propose** un programme (il le vend, il l'explique, il finit par un
>   CTA) → le consentement est une **mention** `caption` tertiaire sous le CTA,
>   le mot « conditions » en `color-primary` et tappable. Le CTA n'est jamais
>   désactivé : rien ne manque, on n'a rien demandé à remplir.
> - L'écran **EST le contrat** (le texte intégral, qu'on est venu signer) → une
>   `Checkbox` **décochée**, qui débloque le bouton.
>
> Et jamais les deux pour un même contrat. L'Affiliation les avait tous les
> deux : une case **pré-cochée** sur la page de proposition, une seconde case
> sur la page de conditions, deux boutons de libellés différents menant au même
> tableau de bord. Une case pré-cochée est un consentement donné à la place du
> Client ; le corpus Mobbin n'en montre aucune (D5 du benchmark).
>
> La forme de la mention existait déjà dans le produit : c'est celle de
> l'onboarding (`app/index.tsx`), « En continuant, vous acceptez les
> **Conditions d'utilisation** ». _(27 septembre 2026.)_

> **Un raccourci a l'apparence de ce qu'il ouvre.** Le « Où allez-vous ? » en
> tête de l'accueil ressemble trait pour trait à une barre de recherche, mais
> on n'y saisit rien : le tap fait monter la feuille et bascule en mode
> recherche, où les vrais champs De/À prennent la main. C'est voulu — le Client
> tape à l'endroit où il tapera encore une fois la barre ouverte, et le morph
> se lit comme un agrandissement plutôt que comme un changement d'écran.
>
> Ce qu'il ne faut PAS faire, c'est poser un vrai champ : la saisie serait
> balayée par le morph. Ni dessiner une seconde géométrie qui ressemble — deux
> composants pour un seul dessin, c'est deux mesures à tenir en phase. D'où le
> prop `onPress` sur `SearchBar` plutôt qu'un composant de plus.
> _(27 septembre 2026, en simplifiant l'accueil sur le seul Transport.)_

> **Ce qui flotte sur la carto suit le cran de la feuille.** Le bouton de
> recentrage le faisait déjà ; la carte « Course en cours » le fait aussi. Deux
> raisons, et la première n'est pas esthétique : **la feuille recadre son
> contenu** (`overflow: hidden`, pour que sa première carte soit coupée par
> l'arc de 28 au lieu d'en déborder), donc tout élément volontairement hors
> bornes s'y ferait couper. Il vit dehors, et c'est la même valeur animée `ty`
> qui le porte, diminuée de sa propre hauteur et de son air.
>
> Corollaire : ces éléments **s'empilent** au-dessus de l'arête, ils ne se
> superposent pas. Quand la carte de course est là, le recentrage monte de la
> hauteur de la carte.
>
> Et ils prennent le traitement des éléments flottants — liseré `color-hairline`
> + `shadow-float` — même quand leur dessin est celui d'une carte de feuille :
> une `SheetCard` posée sur la carto n'est plus une carte de feuille, elle n'a
> plus de feuille. _(27 septembre 2026.)_

> **Un chiffre n'a droit à sa propre tuile que s'il n'a rien à ouvrir
> derrière.** La règle est née sur la page Menu, en refusant ses tuiles de
> statistiques ; elle vaut partout, et le premier à en profiter est le
> **tableau de bord de l'Affiliation**, qui en alignait quatre.
>
> Le test est mécanique : si le chiffre a un écran derrière lui, il est le
> **résumé de la porte** qui y mène — c'est là qu'il informe le plus, puisqu'il
> dit d'avance ce qu'on trouvera. S'il n'a rien derrière (les kilomètres de
> Waymo, le CO₂ d'Uber), alors il est à lui-même sa destination et peut prendre
> une tuile.
>
> Deux corollaires observés en appliquant la règle à l'Affiliation :
>
> - **Un chiffre affiché deux fois sur un écran est un défaut, pas une
>   redondance utile.** « Gains cumulés · 12 400 F » répétait au mot près le
>   solde du Wallet posé dix pixels plus haut.
> - **Deux chiffres qui ouvrent le même écran font UN sous-titre**, pas deux
>   portes : « 4 prestataires actifs · 56 courses générées » sous « Mon
>   réseau ».
>
> Et ils se lisent depuis la **source réelle** — ajouter un membre met les deux
> à jour — comme les résumés de rangée du Menu et de Mon compte.
> _(27 septembre 2026.)_

### Axes de taille : `sm|md|lg` ou pixels ?

Un composant expose une **échelle nommée** (`sm|md|lg`) quand chaque cran porte
des décisions de design qui ne se déduisent pas l'une de l'autre — `Button` et
`IconButton` changent de hauteur, de taille d'icône et de padding à chaque cran,
et ces triplets sont choisis, pas calculés.

Il expose un **nombre de pixels** quand toutes ses sous-mesures se déduisent par
formule. `Avatar` en est le seul cas : `borderRadius = size/2` et
`fontSize = size*0.38`, donc aucun cran ne décide de rien et une échelle nommée
serait une fausse abstraction. Les deux tailles qui appartiennent au système
sont malgré tout nommées — `AVATAR_ROW` (48, adossé au retrait 76 de `ListRow` :
16 padding + 48 + 12 gap) et `AVATAR_CARD` (64, carte prestataire). Au-delà, les
avatars « héros » (clôture, profil, appel plein écran) restent des valeurs
libres : ils sortent du système de rangées et de cartes.

### BottomSheet (organisme)

Basé sur `@gorhom/bottom-sheet`, enveloppé pour injecter les tokens (`radius-xl`, `shadow-lg`, `Handle`). Un `Panel` statique sépare le contenu bas **non-déplaçable** (ex. statut « recherche en cours »).

**3 niveaux (fractions fixes)** — un écran peut n'exposer qu'un sous-ensemble :

| Niveau | Hauteur ≈ | Usage |
|---|---|---|
| `collapsed` | 14% | Poignée + 1ʳᵉ ligne, carte visible |
| `half` | 48% | Contenu principal, **état de repos par défaut** |
| `full` | 90% | Listes longues / clavier actif |

**Clavier** : au focus d'un champ interne → snap `full` (`keyboardBehavior: fillParent`) via `BottomSheetTextInput`, contenu scrollé au-dessus du clavier ; au blur, retour au cran précédent. Android : `adjustResize`.

**Feuille figée à un niveau** : un écran peut verrouiller la feuille sur **un seul cran**, non déplaçable (poignée alors purement visuelle). Si le contenu dépasse la hauteur du cran, il **scrolle à l'intérieur** — on ne compresse jamais le contenu. Ex. : étape *Configurer la course* (Transport) = `full` figé, contenu scrollable, footer (total + CTA) épinglé en bas.

**Physique du snap** (feuilles déplaçables, ex. accueil) : suit le doigt au 1:1, **rubber-band** aux bornes, et au lâcher un ressort qui **repart à la vélocité du doigt** (continuité de vélocité) — `SHEET_SPRING = stiffness 280 / damping 22 / mass 1` (vif, légèrement sous-amorti). Flick franc → cran suivant dans la direction ; drag lent → cran le plus proche.

**Modales de feuille — en-tête obligatoire.** Toute feuille modale porte un
`SheetHeader` (titre `heading1` à gauche + croix `flat`), y compris les
confirmations destructives : le titre vit dans l'en-tête, jamais centré une
seconde fois dans le corps. Le corps enchaîne alors `AlertBadge` puis le texte
d'explication, centrés, dans un sous-cadre à gap 8. La croix n'ouvre aucune
échappatoire nouvelle — `BottomSheet` se ferme déjà au glissé vers le bas et au
tap sur le voile — elle rend seulement visible une sortie qui existait déjà.
_(Règle actée le 24 août 2026 : 7 des 9 modales du set la suivaient déjà, les
deux modales Livraison ont été alignées et le code a suivi.)_

**Voile (scrim)** — composant `Scrim` : voile noir derrière la feuille dont l'opacité **suit la position de la feuille**. Nul quand la feuille est basse (`collapsed` / escamotée), net à `half`/medium (~0.38), marqué à `full`/expanded (~0.58) — pour assombrir la carte/le fond et concentrer l'attention sur la feuille. `pointerEvents="none"` (purement visuel, ne bloque pas le fond) et posé **entre le fond et les contrôles flottants** (les boutons carte restent nets). Comportement standard de toute bottom sheet montant aux niveaux hauts.

### Formulaires

- **Champ au repos : jamais bleu.** Un champ, vide ou rempli, ne marque **aucun
  état** — il n'est ni sélectionné, ni actif, ni par défaut. Le peindre en
  `color-primary-subtle` + liseré `color-primary` lui donne le poids d'un élu qu'il
  n'est pas, et le met en concurrence avec le CTA, seule action réelle de l'écran.
  Traitement de base : fond `color-surface`, liseré `color-border` 1 px, même rayon
  que les autres blocs — **appliqué à tous les champs le 23 août 2026** (`Field`,
  `PlaceField`, `SearchBar`), là où trois traitements coexistaient (fond `bg` sans
  liseré côté code, fond `surface` + liseré pour `PhoneField`, fond `bg` + liseré
  pour `SearchBar`). **Sur un écran de formulaire, le bleu n'appartient qu'aux
  CTA** (bouton primaire, lien-action). Le **focus clavier**, lui, peut se marquer en
  bleu : c'est un état. _(Règle née de la fiche de Lieu enregistré, 9 août 2026 :
  deux champs en bleu plein criaient plus fort qu'un bouton « Enregistrer »
  désactivé — la couleur d'état servait de décoration.)_
- **Ne jamais pré-remplir un champ avec une valeur déjà visible ailleurs sur
  l'écran.** Pré-remplir « Nom du lieu » avec le quartier qu'on venait de choisir
  affichait « Almadies » deux fois — une fois comme adresse, une fois comme nom — et
  transformait une vraie question en **redondance à valider** : le champ avait l'air
  inutile alors qu'il porte l'idée entière de l'objet. Un exemple en `placeholder`
  montre quoi écrire sans rien affirmer ; le champ reste vide, la question reste
  ouverte, et le CTA reste honnêtement désactivé tant qu'on n'y a pas répondu.
  _(9 août 2026, fiche de Lieu enregistré.)_
- **Une note grise par écran, pas une par champ.** Une caption sous chaque contrôle
  finit par occuper autant de hauteur que les contrôles eux-mêmes et se lit comme du
  bruit. Ne garder la note que sur les champs dont l'usage **n'est pas devinable** ;
  ailleurs, un libellé clair plus un exemple en `placeholder` suffisent.
- **Un seul traitement de bloc par écran.** Carte, champ et encadré qui se suivent
  partagent le même rayon et le **même liseré**. Trois bordures différentes empilées
  se lisent comme des blocs déposés sans intention, même quand chacune est correcte
  prise isolément.
- **Champ requis** : astérisque `color-error` sur le **label de groupe**, placé au-dessus de son contrôle (jamais de label flottant à gauche). Le rouge est strictement réservé au requis et aux erreurs — jamais décoratif ; le bleu marque signale l'action (une rangée requise vide se style en **rangée-action bleue**, ex. « Ajouter le destinataire * »).
- **Champ optionnel** : toujours étiqueté « (facultatif) » en toutes lettres, visuellement affaibli (texte tertiaire, sans chevron), placé **après** les champs requis.
- **Note contextuelle** : caption grise + icône info, ancrée directement **sous le champ qu'elle explique** — jamais orpheline en fin de carte.
- **Validation en deux temps.** Le **CTA reste désactivé** tant que les requis
  manquent — c'est la barrière principale, elle évite la plupart des messages. Mais
  quand une valeur est *saisie et invalide* (numéro trop court, format refusé), le
  champ passe en **état `erreur`** : liseré `color-error` 1,5 px et message en
  `color-error` sous le contrôle. _(La v1 excluait tout message inline ; levé le
  23 août 2026 après relevé Mobbin — Wolt, PayPal, Google Home, Grab Driver, Alan
  marquent tous l'erreur au champ **et** sous le champ. Un CTA grisé sans explication
  ne dit pas **lequel** des champs bloque.)_
- **Deux notes, deux portées — et c'est l'icône qui les sépare, pas la taille ni
  la couleur.** Une note qui commente **un champ** est un `Hint` **avec son
  icône**, collé sous le champ. Une note qui commente **une liste entière** est
  le `footnote` de `List` : même caption tertiaire, **sans icône**. Les deux
  partagent taille et gris — l'icône est le seul signal, et elle suffit : elle
  dit « ceci se rapporte à la chose juste au-dessus », là où la note nue couvre
  tout le bloc.
- **Une note de liste passe par le slot `footnote`, jamais par un `Hint` posé
  après la liste.** Libre, elle hérite de la marge basse de la liste (28 px en
  `plat`) et se retrouve **plus près de ce qui suit que de ce qu'elle
  commente** — sur Lieux enregistrés elle flottait à 36 px de ses rangées pour
  16 px du CTA, et se lisait comme la légende du bouton. Dans le slot, elle est
  tenue contre sa liste, et elle ne peut pas lui survivre : elle est dans le
  composant, pas à côté. _(20 août 2026 — point 5 de l'audit de cohérence de la
  partie Compte ; transposé sur `List`/`Hint` après la migration.)_

---

## Transitions & navigation

Deux familles de transitions, à ne jamais confondre :

### Inter-pages (navigation de pile)

Tout passage **d'une page à une autre** (nouvelle route) utilise la transition de pile native :

- **Animation** : glissement horizontal `slide_from_right` — la nouvelle page entre par la droite, l'ancienne fait son parallaxe.
- **Geste de retour** : swipe **bord gauche → droite** interactif (`gestureEnabled: true`), comportement natif iOS. Sur Android, c'est le retour système qui joue ce rôle (pas d'edge-swipe natif).
- **Règle** : c'est le comportement **par défaut de toute nouvelle page / tout nouveau flow**. Ne pas réinventer de transition de page ad hoc.

### Intra-page (états & feuilles)

Tout changement **à l'intérieur d'une même page** (morph d'un mode à l'autre, ouverture/fermeture d'une bottom sheet, snap entre crans) utilise une **animation locale** — pas une transition de pile :

- Entrée de feuille : slide-up + `SHEET_SPRING` (cf. BottomSheet).
- Morph in-place (ex. accueil : grille de services ↔ recherche d'itinéraire ↔ choix sur carte) : on **reste sur la même route**, on anime le contenu.

> Repère : changement de **page** = transition de pile (slide + swipe-back). Changement d'**état dans la page** = animation locale (sheet, morph). Si on se surprend à pousser une route juste pour animer un changement d'état, c'est probablement le mauvais outil.
