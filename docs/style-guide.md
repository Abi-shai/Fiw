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
> **pas** le plein), motif de la carte « Devenir prestataire » (`MenuDrawer`). Ne
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
| `WheelPicker`, saisies de montant `affilie` | 22/30, 24, 48 | Chiffres d'un sélecteur ou d'une saisie de montant, absents de la maquette |

### Troncature : deux lignes pour un descriptif, jamais pour un titre

La maquette a tranché, et le partage est net (relevé du 28 août 2026 sur
`853:12`) :

| Rôle | Traitement | Exemples |
|---|---|---|
| **Descriptif** — sous-titre, phrase d'accroche, blurb | `numberOfLines={2}`, ellipse en fin | le corps de la bannière Affilié, les deux phrases de pied des tuiles de service |
| **Titre dans un bloc à hauteur contrainte** | `numberOfLines={1}`, ellipse en fin | « Gagnez de l'argent avec Fiw ! » (bannière Affilié) |
| **Titre libre** | **aucune** troncature | « De quoi avez-vous besoin ? », « Course », « Livraison » |

Un descriptif est du remplissage utile : il peut se faire couper sans qu'on perde
l'essentiel, et le borner protège la géométrie de son conteneur.

Un titre porte le sens, donc **là où la mise en page peut céder, on ne le coupe
pas** — on raccourcit la copie s'il ne tient pas. Mais **là où elle ne peut pas
céder, il tient sur une ligne et s'ellipse.** Un bloc dont la hauteur est contrainte
par autre chose que son texte — la bannière Affilié l'est par sa vignette de 64 — ne
peut pas absorber une deuxième ligne : elle écraserait son padding. Entre un titre
tronqué et un padding détruit, c'est la troncature qui coûte le moins.

_(Amendement du 28 août 2026. Ce document disait « un titre ne se tronque jamais »,
écrit d'après l'état de la maquette de la veille. Le titre de la bannière tenait à
**un pixel près** à 375 pt : il passait à deux lignes sur un Android plus étroit, le
bloc de texte montait de 63 à 83 et crevait la boîte de 64. La maquette porte
désormais `maxLines: 1` / `ENDING` sur ce titre, décision de l'utilisatrice après
essai à l'écran.)_

> **Ne pas déclarer `ellipsizeMode`.** `tail` est le défaut de React Native et
> c'est exactement le `textTruncation: ENDING` de Figma. L'écrire serait du bruit.
>
> **Le plafond de lignes est souvent porteur.** Sur la bannière Affilié il ne
> décore pas : titre 20 + gouttière 3 + corps borné à 40 = 63, sous les 64 de la
> vignette d'illustration — c'est lui qui **garantit** la hauteur du bloc quelle que
> soit la copie. Sans lui, une phrase plus longue passerait à trois lignes et la
> carte déborderait de son cadre. Quand une hauteur est déduite, vérifier que le
> texte qu'elle contient est borné.

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
| `radius-xl` | 28px | **Bottom sheets, modals** |
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

### Les contrôles de carte au-dessus d'une feuille

**Tout écran qui pose une feuille sur la carto porte des contrôles flottants**,
via **`MapControls`** — retour à gauche, recentrage à droite, 12 au-dessus de
l'arête de la feuille. Ce n'est pas une décoration d'écran : **le recentrage est
la seule façon de revenir sur sa position** quand la carte a suivi le véhicule ou
qu'on l'a fait glisser.

| Écran | Retour | Recentrage |
|---|---|---|
| `configure` (Transport, Livraison) | ✓ | ✓ |
| `searching` (Transport, Livraison) | ✓ (il annule la recherche) | ✓ |
| **`course-active`, `livraison/suivi`** | **✗ — une course en cours ne se quitte pas en arrière** | ✓ |

> ⚠️ **Les contrôles sont FRÈRES de la feuille, jamais ses enfants.** Un enfant
> posé en `top` négatif déborde d'une vue à coins arrondis, et Android le rogne —
> le même piège que la pastille de fermeture de la bannière Affilié. Ancrés en
> `bottom` comme la feuille, les deux vivent dans le même repère et le décalage de
> 12 tient sur les deux OS (§ Les deux OS, « un repère, pas deux »).
>
> Pour une feuille à crans, leur passer son `translateY` : ils la suivent d'un cran
> à l'autre sans que l'écran recalcule quoi que ce soit.
>
> _(Composant écrit le 30 août 2026, sur signalement à l'écran. Le motif était
> réimplémenté de **quatre** façons dans quatre écrans — ancré en `bottom`, posé en
> `top: -60` dans la feuille, réduit au seul retour, et le cadre animé de
> l'accueil. Conséquence : `course-active` et `livraison/suivi` n'en avaient
> **aucun**, donc on ne pouvait pas recentrer la carte pendant une course ni
> pendant une livraison. **Une chose qui n'est pas un composant finit par manquer
> quelque part sans que personne s'en aperçoive.**)_


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
| `link` | transparent | transparent (opacité 0.55) | `color-primary` | — |
| `linkDestructive` | transparent | transparent (opacité 0.55) | `color-error` | — |

`disabled` : opacité 0.45 (toutes variantes). `loading` : spinner à la couleur du texte. Slots icône Phosphor leading/trailing sur toutes les variantes.

> **Choix de variante.** `secondary` (contour neutre gris) = action secondaire courante. `destructive` (texte rouge, **sans bordure ni fond**) = **annulation / action dangereuse secondaire** (ex. « Annuler la commande », « Annuler (gratuit) ») — à privilégier sur toutes les pages présentant ce type d'action, plutôt qu'un lien texte ad hoc. `destructiveFilled` (plein rouge) est **réservé** au cas où l'action destructive EST le CTA de l'écran (ex. « Raccrocher »). `link` (texte bleu primary, **sans fond ni bordure ni pilule**, empreinte compacte) = **action-lien inline** dans une rangée ou un formulaire (ex. « Modifier » un numéro, « Renvoyer le code ») — à privilégier plutôt qu'un `Text` + icône ad hoc. `linkDestructive` = le **pendant rouge de `link`** (même empreinte, texte `color-error`), pour l'action-lien qui retire/supprime dans une rangée (ex. « Retirer » un compte Mobile Money) — il permet d'opposer deux actions **de même forme** dans la même liste, seule la couleur changeant selon la portée (ex. slot rempli « Retirer » vs slot vide « Ajouter »).

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
| `Button` | Action | 6 variantes (`primary` / `secondary` contour neutre / `destructive` texte Error / `destructiveFilled` plein rouge / `link` texte-action sans fond / `linkDestructive` idem en rouge), tailles `lg`/`md`/`sm`, slots icône, loading/disabled. |
| `IconButton` | Bouton rond icône | Set `Variant` × `Size`. **Variantes** : `floating` (blanc + liseré + ombre, sur carte ; **icône gris foncé `gray-700`** — neutre, registre nav, pas le bleu marque) · `flat` (fond gris, dans sheet ; icône bleu marque) · `secondary` (transparent + liseré `border`, icône `textPrimary` — action de second rang lisible sur fond teinté, ex. bouton carte d'un `PlaceField`) · `link` (**nu**, ni fond ni liseré, icône bleu marque — actions inline d'un champ : effacer, afficher le mot de passe). **Tailles** : `lg` 46 / icône 24 · `md` 40 / icône 22 · `sm` 32 / icône 18. Défaut : `lg` en `floating`, `md` ailleurs. ⚠️ `sm` passe sous la cible tactile de 48 — réservé à l'intérieur d'un contrôle qui porte déjà la zone de frappe. _(Étendu le 23 août 2026.)_ |
| `SearchBar` | Recherche | Deux variantes : `sheet` (dans une feuille — fond `bg`, rayon `md`, liseré `border`, h48) et `floating` (posée **sur la carte** — pilule blanche, liseré `hairline`, `shadow-float`, h46). Croix d'effacement quand le champ n'est pas vide, slot `trailing` optionnel (bouton carte, micro). **Ne couvre pas** les champs De/À de l'accueil : ce sont des rangées d'itinéraire à deux lignes, pas une recherche. _(Construite le 23 août 2026 — jusque-là ce tableau la décrivait alors qu'elle n'existait nulle part, et trois écrans la réimplémentaient chacun à sa façon.)_ |
| `ScreenHeader` | En-tête de page | `IconButton` retour (icône forcée en `gray-700`, pas en bleu) + titre `heading2` + slot d'action à droite. Gère la safe-area. Le pendant « feuille » est `SheetHeader` (titre `heading1` + croix). **N'inclut pas** les boutons flottants sur carte (ce sont des `IconButton` posés séparément). |
| `PlaceRow` | Ligne de lieu | Cercle d'icône + titre + sous-titre + trailing. Récents, suggestions, lieux enregistrés. |
| `Field` | Toute saisie | Set à **trois axes** : `Type` = `texte` · `téléphone` · `zone`, `État` = `repos` · `actif` · `erreur` · `désactivé`, `Contenu` = `rempli` · `vide` — 24 variantes. Vide et rempli sont orthogonaux à l'état : un champ focus peut être vide, un requis en erreur l'est par définition. Le champ **vide** affiche un `Placeholder` en `text-tertiary` et **n'a pas de bouton d'effacement** (rien à effacer) ; le champ **rempli** le porte dans les trois types — au centre à droite en `texte` et `téléphone`, **en haut à droite** en `zone`. La couleur du × suit l'état (`text-tertiary` / `primary` / `error` / `text-disabled`). Libellé avec astérisque requis, icône de tête, slot trailing, texte d'aide sous le contrôle. `Type=téléphone` porte le chip indicatif (drapeau + `+code` + caret) ouvrant le `CountryPicker`, numéro **formaté par pays** (`constants/countries.ts`), **tous pays acceptés** — point d'entrée unique de toute saisie de téléphone, changement de numéro **et** onboarding (cf. `sitemap-client.md` §1). _(Absorbe `PhoneField` et `TextArea`, retirés le 23 août 2026 ; **absorption effective dans le code le 25 août 2026** — `Field` porte l'axe `type` = `texte` · `téléphone` · `zone`, et `components/PhoneField.tsx` est supprimé.)_ |
| `PlaceField` | Saisie d'un Lieu | Départ / arrivée : deux lignes (libellé + valeur), icône de tête, bouton rond « choisir sur la carte » optionnel, état `actif`. Distinct de `Field` — on y saisit un Lieu, pas du texte libre. Pendant de `PlaceRow`, qui **affiche** un Lieu. |
| `CountryPicker` | Choix du pays | Feuille **3 crans** (`hooks/useSnapSheet`) + barre de recherche + liste monde triée. Drapeaux = **PNG plats locaux** (`assets/flags/`, map `constants/flags.ts`) rendus via `FlagChip` — **pas de SVG** (`SvgXml` plante sur les drapeaux à bloc `<style>`). |
| `SettingsRow` | Ligne de réglage | Icône ligne + label + **sous-titre** + slot `right` + chevron. Variante `destructive` (label rouge) ; prop `accent` = **rangée d'objet** (pastille bleue 42 px, voir la règle plus bas). Page Compte et sous-écrans. **Volontairement pauvre** : un objet plus riche (logo de service, badge d'état, action sur une 2ᵉ ligne — cf. carte de `compte/paiement.tsx`) mérite **son propre composant**, pas des slots ajoutés ici un par un. Le résumé de la rangée passe **toujours par `subtitle`**, jamais par une valeur alignée à droite : la valeur de droite dispute sa largeur au label et le fait passer à la ligne, d'où des rangées de hauteurs inégales. `subtitle` est en `numberOfLines={1}` — un résumé trop long se tronque, il ne déforme pas la liste. |
| `SettingsGroup` | Groupe de réglages | Regroupe des `SettingsRow` séparées par un filet 1 px **de bord à bord**, label de section en capitales (`label` 13 px medium, gris secondaire) + `footnote`. **Sans carte** — voir la règle ci-dessous. |
| `Radio` | Pastille de sélection | Coché = fond bleu marque + tick blanc ; décoché = cercle vide `text-disabled`. Marque l'élu d'un ensemble à choix unique **dans une feuille de choix** (`PaymentSheet`). Non tappable en propre — c'est la rangée qui porte l'action. Dans une **liste persistante**, préférer `SettingsRow selected` + badge (voir ci-dessous). |
| `Callout` | Encart d'information | Fond `brand-yellow-subtle` + liseré `brand-yellow-100` + **pastille `brand-yellow` à glyphe sombre** (structure de la carte « Devenir prestataire » — le jaune remplit, le glyphe dessus porte le contraste). Pour une **règle** ou une **affordance non devinable** que le Client doit lire. Jaune et **pas bleu** : cf. répartition des rôles bleu/jaune. **Un seul par écran** — au-delà, c'est un problème de hiérarchie. À distinguer du motif `infoRow` (icône + `caption` tertiaire **sans fond**), qui précise sans réclamer l'attention. |

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
> pour le **Menu** (`MenuDrawer`) — même nature de liste, même traitement — et le
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
> _Amendement du 26 septembre 2026 : le Menu **redevient un tiroir**
> (`components/MenuDrawer.tsx`), et `app/menu.tsx` est supprimé. Rien de ce qui
> précède ne change — la grammaire de rangées, les résumés, l'ordre des portes et
> le nom « Menu » ont été portés tels quels dans le tiroir, qui passe lui aussi
> par `List style_="plat"` + `ListRow`. **Seul le contenant change, et pour une
> raison de mouvement** : cf. § Transitions & navigation._
>
> ⚠️ **Précision sur le benchmark.** `benchmark-compte-mobbin.md` décrit la carte de
> réglages comme le « motif unanime » de Bolt / Careem / Réglages iOS. Cette
> unanimité est celle d'un **échantillon iOS** : toutes les recherches Mobbin ont été
> faites en `platform: "ios"`, et la carte blanche sur gris est précisément l'idiome
> des Réglages iOS. L'idiome natif Android — la plateforme dominante du marché
> dakarois — est l'inverse : rangées à plat, filets pleine largeur, en-têtes de
> section. _(Décidé en rendant le 11 août 2026, todo P5.)_

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

> **Un bloc de listing respire de 8.** Dès qu'un bloc empile des `ListRow` — avec
> ou sans `Divider` entre elles — son conteneur porte une gouttière de **`space/2`
> (8 px)**. Avec filets, les 8 s'appliquent **de part et d'autre** du filet : la
> ligne ne touche jamais la rangée qu'elle sépare.
>
> Le pourquoi : une `ListRow` a déjà 8 de padding vertical, donc deux rangées
> collées mettent 16 entre leurs textes mais **0 entre leurs limites** — le filet
> s'y écrase et la liste se lit comme un bloc compact. Les 8 rendent au filet son
> rôle de séparation au lieu d'en faire une soudure. Et pour une liste sans filet
> (l'historique des courses), c'est l'air seul qui sépare : il lui faut la même
> valeur, sinon les deux motifs de liste ne se ressemblent plus.
>
> Porté par `components/List.tsx` pour tout ce qui passe par lui, et à la main
> dans les listings qui ne l'emploient pas : les deux listes de l'accueil, le
> sélecteur de pays, l'historique.
>
> ⚠️ **Sur une liste virtualisée, c'est le SÉPARATEUR qui porte l'espace**, pas le
> conteneur. Une `FlatList` enveloppe chaque item avec son séparateur dans une
> cellule : une gouttière de conteneur espace les cellules et laisse le filet
> soudé à la rangée qui le précède. Poser `paddingVertical: 8` sur le séparateur
> donne les 8 des deux côtés. Sur un conteneur à plat (`View`, `ScrollView`), la
> gouttière suffit — à condition que rangées et filets soient des frères.
>
> _(Décidé le 26 août 2026. La règle est née des deux listes de feuille de la
> maquette — `Lignes` et `Frame 27`, toutes deux en `space/2` — puis **étendue à
> tous les blocs de listing**, l'espace paramètres compris. Le composant `List`
> de la maquette, qui collait encore ses rangées, a été aligné le même jour.
> Exception assumée jusqu'au 4 septembre 2026 : le tiroir de menu gardait son
> rythme dense à 14, n'étant pas une liste de `ListRow` mais la sidebar, ses
> filets séparant des GROUPES. **L'exception est levée** — le Menu passe par
> `List style_="plat"` et prend donc les 8 comme le reste. Elle l'est restée
> quand il est redevenu un tiroir le 26 septembre : ce qui l'a levée est sa
> grammaire de rangées, pas son contenant. Il ne reste aucune liste hors de la
> règle.)_

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

**3 niveaux (fractions fixes), et rien entre les deux** — un écran peut n'exposer
qu'un sous-ensemble. Valeurs relevées sur `Scrim state` (836:615) : sur l'écran de
375×844 de la maquette, la feuille mesure 220 / 430 / 717 px.

| Niveau | Hauteur | Voile | Usage |
|---|---|---|---|
| `collapsed` | **25 %** | **aucun** | La feuille affleure ; ce qu'elle laisse voir doit rester franc |
| `half` | **50 %** | noir 30 % | Contenu principal, **état de repos par défaut** |
| `full` | **85 %** | noir 50 % | Listes longues / clavier actif — **le maximum du système** |

> ⚠️ **85 % est un plafond dur, quel que soit l'écran ou le contenu.** Une feuille
> ne grandit jamais au-delà : du contenu qui ne tient pas **scrolle dans la
> feuille**. On ne gagne pas de hauteur en rognant la carte — c'est ce que le
> Client garde sous les yeux, et c'est pour ça que le plafond ne se négocie pas
> écran par écran. Corollaire de code : le corps scrollable d'une feuille est
> borné par `sheetMaxH(screenH)`, et les trois crans sont donnés par
> `sheetSnaps(screenH, sheetH)` (`components/Sheet.tsx`) — aucun écran ne calcule
> ses propres crans.
>
> _(Amendement du 27 août 2026. Ce document annonçait 14 / 48 / 90 % ; les crans
> sont désormais **25 / 50 / 85**, relevés dans la maquette. Le 90 % passait au
> travers du plafond, et le 14 % — « poignée + 1ʳᵉ ligne » — était trop bas pour
> qu'un cran replié montre quelque chose d'utile.)_

**Clavier** : au focus d'un champ interne → snap `full` (`keyboardBehavior: fillParent`) via `BottomSheetTextInput`, contenu scrollé au-dessus du clavier ; au blur, retour au cran précédent. Android : `adjustResize`.

**La dernière carte prend la hauteur restante.** Dans une feuille dont la hauteur
est **fixe** — un cran, ou la pleine hauteur de l'accueil — le contenu court ne
doit pas laisser apparaître le fond `track` gris sous la dernière carte : la
feuille se lit alors comme une carte posée dans un vide gris plutôt que comme une
surface. La dernière carte porte donc **`lastCardFill`** (`components/Sheet.tsx`)
et s'étire jusqu'au bord.

> Les rangées **à l'intérieur** continuent d'épouser leur contenu et restent en
> haut de la carte : c'est la carte qui s'étire, pas ce qu'elle contient. C'est
> exactement ce que fait la maquette — `layoutGrow: 1` sur la dernière carte,
> `AUTO` sur le bloc de rangées (`Scrim state`, `State=Half` → `Récemment`,
> 836:611).
>
> Le conteneur de défilement qui la porte prend `flexGrow: 1` sur son
> `contentContainerStyle` : la carte peut ainsi **s'étirer quand le contenu est
> court ET défiler quand il est long**, sans choisir entre les deux.
>
> ⚠️ **Ne s'applique pas à une feuille qui épouse son contenu** (`GroupedSheet`
> par défaut, donc `searching` et `configure`) : là, il n'y a pas d'espace
> restant, et la feuille s'arrête exactement où sa dernière carte s'arrête.
>
> _(Règle actée le 27 août 2026, sur signalement d'un rendu à l'écran : la feuille
> d'accueil au repos laissait une bande grise sous la carte des lieux récents. Le
> motif existait déjà à un endroit — la carte de résultats de la recherche est en
> `flex: 1` depuis le début — il est maintenant nommé.)_

**Feuille figée à un niveau** : un écran peut verrouiller la feuille sur **un seul cran**, non déplaçable (poignée alors purement visuelle). Si le contenu dépasse la hauteur du cran, il **scrolle à l'intérieur** — on ne compresse jamais le contenu. Ex. : étape *Configurer la course* (Transport) = `full` figé, contenu scrollable, footer (total + CTA) épinglé en bas.

**Physique du snap** (feuilles déplaçables, ex. accueil) : suit le doigt au 1:1, **rubber-band** aux bornes. Flick franc → cran suivant dans la direction ; drag lent → cran le plus proche. Au lâcher, **deux régimes** que `snapTo` distingue à la vélocité :

| Déclencheur | Mouvement | Pourquoi |
|---|---|---|
| **Lâcher de geste** (vélocité ≠ 0) | ressort `Spring Gentle` qui **repart à la vélocité du doigt** | Une courbe de timing ne sait pas accepter une vélocité initiale : il y aurait un micro-arrêt au lâcher. Le ressort est ici de la **physique**, pas un rebond décoratif — c'est ce qui le fait survivre au principe « Spring for Hero Only ». |
| **Snap programmatique** (entrée, ouverture, retour à un cran) | fenêtre `container-morph` + courbe `Hold / Anchor` | C'est la recette « Modals / Sheets » de l'identité de mouvement. Bords fermes pour une surface qui s'installe, et le maintien de 50 ms laisse la mise en page parente finir avant que la feuille bouge. |

_(Amendement du 27 août 2026, à l'arrivée de l'identité de mouvement. Ce document
annonçait un seul ressort `stiffness 280 / damping 22 / mass 1` pour le snap **et**
l'entrée. L'amortissement passe de 22 à 25 — le `bounce` de 0,25 de la planche au
lieu de 0,34 : la feuille rebondit un peu moins, elle ne va pas plus lentement. Et
l'entrée cesse d'être un ressort.)_

**Modales de feuille — DEUX cartes.** Une modale n'est pas une surface blanche
unique : c'est une **feuille groupée**, fond `track`, avec le **contenu** dans une
première `SheetCard` et les **actions** dans une seconde, séparées par la gouttière
de 6. Ce n'est pas décoratif — le contenu explique, les actions engagent, et
l'interstice gris dit que ce sont deux natures différentes. Les cinq variantes de
modale de la maquette ont toutes cette structure, sans exception (`Annuler` 499:582,
`SOS` 500:596, `Paiement` 674:3375, `Décrire le colis`, `Destinataire`).

> En code : `BottomSheet` porte un emplacement **`actions`** à côté de `children`.
> Sans `actions`, la feuille n'a qu'une carte. La zone de glissement s'arrête à la
> carte de contenu — un doigt posé sur un bouton ne doit pas commencer à traîner la
> feuille.
>
> ⚠️ Le `SheetHeader` d'une modale passe en `marginBottom: 0` : c'est la gouttière
> de 12 de la `SheetCard` qui l'espace du corps. Cumuler les deux donnerait 28 là
> où la maquette met 12.
>
> _(Structure relevée et implémentée le 29 août 2026. Le code mettait jusque-là
> contenu et actions dans une seule surface blanche à padding 20.)_

**Modales de feuille — en-tête obligatoire.** Toute feuille modale porte un
`SheetHeader` (titre `heading1` à gauche + croix `flat`), y compris les
confirmations destructives : le titre vit dans l'en-tête, jamais centré une
seconde fois dans le corps. Le corps enchaîne alors `AlertBadge` puis le texte
d'explication, centrés, dans un sous-cadre à gap 8. La croix n'ouvre aucune
échappatoire nouvelle — `BottomSheet` se ferme déjà au glissé vers le bas et au
tap sur le voile — elle rend seulement visible une sortie qui existait déjà.
_(Règle actée le 24 août 2026 : 7 des 9 modales du set la suivaient déjà, les
deux modales Livraison ont été alignées et le code a suivi.)_

**Voile (scrim)** — composant `Scrim` : voile noir derrière la feuille dont l'opacité **suit la position de la feuille**. Une opacité par cran — `collapsed` **0** · `half` **30 %** · `full` **50 %** (`ScrimLevels`, exposé par `components/Scrim.tsx`), relevées sur `Scrim state` (836:615). `pointerEvents="none"` (purement visuel, ne bloque pas le fond) et posé **entre le fond et les contrôles flottants** (les boutons carte restent nets). Comportement standard de toute feuille posée sur un fond.

> **Le cran bas ne porte AUCUN voile.** C'est une décision, pas un oubli : à 25 %
> la feuille ne fait qu'affleurer, et ce qu'elle laisse voir derrière elle — la
> carte, le véhicule, l'itinéraire — doit rester **franc**. Le voile n'apparaît
> qu'à partir du moment où la feuille prend la moitié de l'écran et devient
> l'objet regardé.
>
> ⚠️ **Ne pas confondre les deux échelles.** `SHEET_LEVELS` (25 / 50 / 85 %) sont
> des **hauteurs de feuille** ; `ScrimLevels` (0 / 30 / 50 %) sont les
> **opacités de voile** à ces trois crans. Deux axes, et les nombres ne se
> correspondent pas : le cran de 25 % de hauteur porte un voile de 0 %.
>
> **Une feuille à position unique** — modale, tiroir, feuille figée — n'a aucun
> cran à suivre : elle prend le **niveau nommé** qui lui correspond. Une modale
> mesure 44 à 47 % dans la maquette, donc `half` (`BottomSheet`) ; un tiroir
> couvre 82 % de la largeur, donc `full` (`MenuDrawer`) ; une feuille figée haute
> prend `full` (`transport/configure`). Le nombre de crans ne suffit pas à choisir
> le niveau, d'où deux écritures et non une abstraction de plus :
> `sheetScrimOpacity(ty, snaps, offscreen)` pour les feuilles à trois crans, une
> interpolation en clair vers `ScrimLevels.*` pour les autres.
>
> **Exception écrite : les deux écrans `searching`.** Ils portent déjà un voile,
> mais sur la **carte elle-même** (`Colors.scrim`, encre 22 %), pour poser le
> radar. Empiler le voile de feuille par-dessus ferait deux voiles pour deux
> intentions, et éteindrait la carto au moment précis où le Client regarde
> arriver un Prestataire. Le voile carto y tient lieu de voile d'écran.
>
> _(Amendement du 27 août 2026. Ce document prescrivait « nul quand la feuille
> est basse, ~0,38 à `half`, ~0,58 à `full` » ; le code, lui, portait cinq
> opacités différentes pour dire la même chose — 0,38 · 0,40 · 0,48 · 0,50 ·
> 0,58 — pendant que quatre feuilles sur carte n'avaient aucun voile.)_

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

## Motion

> Miroir de la planche **`motion-identity-system`** (`842:2727`, page
> `03 — Patterns`). Valeurs dans **`apps/fiw/constants/motion.ts`** ; la maquette
> fait autorité, ce document en porte le pourquoi.

L'identité de mouvement formalise la chorégraphie, les paramètres de temps et les
courbes structurelles. Elle n'a pas été inventée par-dessus le produit : la sortie
de tuile de l'accueil, transcrite d'une piste Figma Motion, en portait déjà les
neuf valeurs. **La planche généralise ce qui existait**, elle ne le corrige pas —
c'est ce qui la rend applicable sans rien casser.

### 1. Courbes — trois, et trois seulement

| Courbe | Valeur | Registre | Emploi |
|---|---|---|---|
| **Primary Ease** | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard | Décélération assurée : départ vif, large coussin à l'arrivée. **Plus de 80 % des actions d'interface.** C'est le défaut ; s'en écarter demande une raison. |
| **Hold / Anchor** | `cubic-bezier(0.5, 0, 0.5, 1)` | Symétrique | Vélocité neutre, sans biais d'entrée. Glissements de fond, **boucles utilitaires**, états temporaires — et les feuilles, dont elle tient les bords fermes. |
| **Spring Gentle** | `spring(bounce: 0.25, mass: 1)` | Élastique | Dépassement organique, stabilisation rapide. **Réservé aux composants héros et aux moments de signature.** |

> **Il n'y a pas de quatrième courbe à ajouter au coup par coup.** Un mouvement qui
> ne rentre dans aucune des trois est un mouvement à **requalifier**, pas une
> courbe à inventer.
>
> **Conversion du ressort vers React Native.** Le `bounce` de la planche est un
> taux d'amortissement déguisé : `ζ = 1 − bounce = 0,75`, d'où
> `damping = 2 ζ √(k·m) ≈ 25` pour `k = 280`. ⚠️ **La raideur n'est pas dans la
> planche** : 280 est reprise de la valeur que le produit portait déjà, pour que
> seul le rebond change et pas la vitesse ressentie. C'est une dérivation
> assumée, signalée comme telle dans `constants/motion.ts`.

### 2. Constantes de temps — ce sont des FENÊTRES

⚠️ **Le point qui se lit de travers une fois et coûte une passe.** La planche écrit
« Container morph · 50–500 ms » : cela veut dire *ça commence à 50 et c'est fini à
500* — donc **450 ms d'animation après un maintien de 50**, pas 500 ms d'animation.
Même sémantique que la timeline Figma Motion dont l'identité est tirée. D'où
`Motion.window(fin, début)`, qui rend le couple `{ delay, dur }` : personne n'a à
refaire la soustraction de tête.

| Jeton | Fenêtre | Contexte |
|---|---|---|
| `anticipation-hold` | 50 ms | Micro-attente avant un changement de structure |
| `decoration-exit` | 200 ms | Départ d'un élément secondaire, rognage visuel |
| `container-exit` | 200 ms | Un conteneur qu'on **renvoie** : modale, tiroir, feuille qui se retire |
| `text-exit` | 250–300 ms | Bloc de texte qui se fond et se replie verticalement |
| `support-exit` | 350 ms | Une mise en page principale qui **cède la place** |
| `container-morph` | 500 ms | Grand bloc qui se reforme au changement de vue |
| `hero-reveal` | 600 ms | Séquence de contenu complexe qui se déploie |

> **La bande `text-exit` n'est pas une approximation.** Le code en emploie les deux
> bouts : le **fondu** prend 250, le **déplacement** 300 — le texte a fini de
> disparaître avant d'avoir fini de glisser. D'où `textExitFade` et
> `textExitShift` dans les jetons plutôt qu'une moyenne.
>
> **Les noms disent « exit » mais les fenêtres servent aussi aux entrées** : la
> timeline de la section 4 est une séquence de dévoilement et réemploie les mêmes
> valeurs. Les noms sont ceux de la planche, on ne les renomme pas.

### 3. Principes de chorégraphie

- **Hierarchy Staging.** Échelonner les entrées selon l'importance spatiale :
  décoration d'abord, ancres de titre ensuite, corps de texte troisième, supports
  environnants quatrième, et **le conteneur en dernier**.
- **Asymmetric Timing.** **Sorties rapides (200–350 ms), entrées lentes
  (500–600 ms).** Un objet entre avec de l'énergie gracieuse, mais dégage
  instantanément quand on le renvoie — c'est ce qui tient la vitesse *ressentie*
  de l'app.
- **Spring for Hero Only.** Ne pas saturer les pages de rebonds. Ce sont les
  courbes qui tiennent la discipline du système ; le ressort ne va qu'aux actifs
  de marque à forte valeur et aux modales d'action finale.

### 4. Séquence & échelonnement

Plan d'une séquence standard, de 0 à 600 ms, orchestrée par priorité structurelle :

| Couche | Fenêtre |
|---|---|
| Décoration | 0–200 ms |
| Texte d'en-tête | 0–250 ms |
| Corps de texte | 0–300 ms |
| Contenu de support | 50–350 ms |
| Morph du conteneur | 50–500 ms |
| Révélation héros | 0–600 ms |

Tout part de 0 ou de 50 : **l'échelonnement se fait par la durée, pas par le
délai.** Les couches finissent l'une après l'autre au lieu de démarrer l'une après
l'autre — c'est ce qui donne un mouvement d'un seul tenant plutôt qu'une cascade.
Pour un dévoilement de contenu, s'y ajoute un décalage de **40 ms** entre groupes
(`Motion.stagger`).

### 5. Recettes d'implémentation

| Contexte | Recette | Détail |
|---|---|---|
| **Modales / Feuilles** | `container-morph` + maintien de 50 ms | Entrée en 500 ms avec le maintien symétrique, pour des bords fermes ; le maintien laisse la mise en page parente se terminer avant l'ouverture. |
| **Transitions de page** | `Primary Ease` + ressort pour le héros | La transition par défaut tient sur 300 ms de courbe primaire, les cadres d'image héros étant mis en scène séparément avec le ressort élastique. |
| **Dévoilements de contenu** | entrée échelonnée par la hiérarchie | Les cartes introduisent leurs éléments par groupes de 40 ms : les décorations grandissent d'abord, le texte s'écrit ensuite, les métadonnées de support se résolvent en dernier. |
| **Micro-interactions** | `Primary Ease` au press + retour élastique | Les réponses rapides (survol, focus actif) finissent **en moins de 200 ms** avec les courbes primaires. Une validation positive déclenche un rebond doux. |

### Faire remarquer un bloc : l'arrivée décalée

Un bloc qui porte un **enjeu de conversion** peut arriver **après** le reste de
l'écran plutôt qu'avec lui. C'est le seul motif du système où le mouvement sert à
attirer l'œil et non à expliquer une transition, et il obéit à trois contraintes :

1. **La latence se déduit, elle ne se choisit pas.** Le bloc arrive à la fin de la
   séquence d'atterrissage — **calculée** depuis la timeline, pas écrite en dur,
   donc elle suit d'elle-même quand cette timeline change — plus un temps de
   silence de `hero-reveal`. Sur l'accueil : 900 + 600 = **1 500 ms**.

   La planche n'a pas de jeton de « pause », et ce silence n'est pourtant pas un
   nombre choisi à la main : il prend la **plus longue fenêtre du système**, celle
   d'une séquence de contenu complexe qui se déploie — on laisse passer le temps
   qu'aurait pris un dévoilement entier avant que le bloc se manifeste.
   **Le silence fait partie de l'accroche** : trop court, le bloc se confond avec
   l'atterrissage et la latence ne sert à rien.

   ⚠️ `hero-reveal` est le **plafond** de l'échelle. Allonger encore ne serait plus
   un changement de jeton mais une décision de design system — un jeton de pause à
   poser dans la planche, pas un nombre à écrire dans un écran.

   _(940 ms au premier jet ; 1 400 le 27 août 2026 ; 1 500 le 28 août 2026 — les
   deux fois sur retour à l'écran de l'utilisatrice, qui la trouvait trop
   rapprochée du reste.)_
2. **La mise en page se comporte comme si le bloc n'existait pas, et c'est le
   SHIFT qui le fait naître.** Aucune place réservée : voir un emplacement vide
   attendre son contenu se lit comme un trou, pas comme une promesse. Le bloc est
   replié à zéro, et à l'arrivée sa hauteur s'ouvre sur la fenêtre
   `container-morph` — le reste de l'écran cède la place, et ce mouvement-là fait
   partie de l'effet.

   ⚠️ **Un bloc qui s'ouvre doit être recadré pendant qu'il s'ouvre**, sinon son
   contenu — qui garde sa hauteur naturelle — déborde sur ce qui le suit. Et le
   recadrage doit être **retiré au repos** dès que l'ouverture est finie, sans quoi
   il rogne ce qui dépasse volontairement du bloc (ici une pastille de fermeture
   en débord de 10 px). Un `overflow` qu'on active le temps de l'animation, pas un
   `overflow` permanent.

   ⚠️ **La hauteur cible se mesure HORS FLUX, jamais dans un cadre replié.** Deux
   façons de s'y tromper, toutes deux payées :
   - mesurer le contenu d'un cadre à `height: 0` ne rend pas sa hauteur naturelle ;
   - la **déduire** des styles ne tient que si le texte occupe le nombre de lignes
     prévu — et un titre qui tient sur une ligne à 375 pt passe à deux sur un écran
     plus étroit, ou avec un réglage de police système plus grand.

   La phase de mesure pose donc le cadre **hors flux** (`position: 'absolute'`) et
   invisible : la mise en page l'ignore — ce qui est l'effet voulu — et il se mesure
   à sa hauteur réelle. Une seule image, et la mesure se garde au niveau **module**
   pour ne pas refaire la phase (donc ne pas faire clignoter le bloc) à chaque
   remontage de l'écran.

   ⚠️ **Et le contenu porte un PLANCHER, pas une hauteur fixe.** Une hauteur fixe
   suppose que le texte tient : quand il ne tient pas, il crève la boîte de contenu
   et **le padding disparaît**. Avec `minHeight`, le bloc grandit et son padding est
   respecté sur toutes les largeurs d'écran et toutes les échelles de police.

   ⚠️ **Un enfant de hauteur zéro consomme quand même la gouttière de son
   parent.** « La mise en page se comporte comme si le bloc n'existait pas » est
   donc faux sans un `marginBottom` négatif qui l'annule — sinon il reste une
   bande vide de la taille de la gouttière. Hauteur et gouttière se dérivent de la
   **même** valeur d'ouverture, pour qu'elles ne puissent pas se contredire.
3. **Le contenu arrive par couches, selon le plan de séquence.** C'est là que
   l'identité se dépense le plus : les cinq couches de la section 4 appliquées à
   un seul bloc — décoration (rang 0), ancre de titre (0–250), corps (0–300),
   supports (50–350), et **le conteneur qui conclut** (50–500). Elles finissent
   l'une après l'autre au lieu de démarrer l'une après l'autre, dans l'ordre de
   *Hierarchy Staging*.
4. **Le ressort ne va qu'à la décoration, et seulement pour cette raison.** Un bloc
   qui arrive seul, après tout le monde, avec un enjeu business : sa décoration est
   un « brand-signature interactive moment » au sens de *Spring for Hero Only*.
   Sans le dépassement, la latence ne servirait à rien — c'est lui qui fait
   remarquer l'arrivée. ⚠️ **La couche à ressort quitte le modèle des fenêtres** :
   un ressort n'a pas de durée, sa fenêtre ne dit plus que son rang.

**Une fois par lancement d'app, pas à chaque retour sur l'écran.** L'état vit dans
une variable de **module**, pas dans un `useState` : un état React repart à zéro à
chaque remontage de l'écran (un `router.replace` depuis une clôture, par exemple)
et l'intro se rejouerait en cours de navigation. Un module vit aussi longtemps que
le bundle JS.

**Au retrait, `container-exit` et un repli vertical.** Le bloc est un conteneur
qu'on renvoie (200 ms), et son fondu s'accompagne d'un repli de sa hauteur pour
que le reste reprenne la place sans saut — motif « fading and collapsing
vertically ». ⚠️ Un bloc qui se replie dans une carte doit **annuler la gouttière**
de cette carte (`marginBottom: -CARD_CONTENT_GAP`) : replié à 0, il laisserait
sinon ses 12 px de gouttière, et le contenu suivant sauterait de 12 au démontage.

_(Motif écrit le 27 août 2026 pour la bannière Affilié Réseau de l'accueil. Ses
trois décalages — monter de 10, arriver à 0,88, se retirer à 0,92 — sont
**repris** de valeurs déjà relevées sur la maquette ailleurs dans l'écran
(`CHROME.*Shift`, l'échelle d'arrivée des calques véhicule, `EXIT.groupDrift`),
pour que le bloc bouge dans le vocabulaire du reste plutôt qu'avec des nombres
neufs.)_

### Trois règles de rendu, payées par des défauts visibles

Elles ne viennent pas de la planche mais du moteur, et elles décident si une
animation juste sur le papier est fluide à l'écran.

**1. Une horloge, pas deux.** React Native a deux moteurs : le **driver natif**
(thread UI, 60 im/s garanties) et le **driver JS**. Certaines propriétés ne
peuvent pas être natives — `height`, `width`, `backgroundColor`, tout ce qui
relève de la **mise en page**. Dès qu'une piste d'une animation est obligée
d'être en JS, **toutes les pistes qui bougent AVEC elle doivent l'être aussi**.
Sinon le conteneur avance par saccades du thread JS pendant que son contenu
glisse à 60 im/s sur le thread UI, et l'œil voit ce décalage-là. **Une seule
horloge, même imparfaite, est fluide ; deux horloges ne le sont jamais.**

> Piège dont la règle est née : la sortie de tuile de l'accueil animait la
> `height` du panneau en JS et le fondu du groupe véhicule en natif. Les véhicules
> bégayaient en disparaissant, sur les deux OS. _(27 août 2026.)_
>
> ⚠️ Contrainte à connaître avant de déplacer une piste : **un même nœud animé ne
> peut pas vivre sur les deux drivers.** Une valeur combinée par
> `Animated.multiply` / `Animated.add` à une valeur de l'autre driver lève une
> erreur à l'exécution. C'est ce qui cloue les pistes d'en-tête, de pied et de
> feuille au driver natif : elles sont additionnées aux valeurs d'entrée.

**2. Ne jamais animer le `borderRadius` d'une vue qui rogne.** Sur une vue en
`overflow: 'hidden'`, le rayon définit le **masque de clip** : l'animer le fait
reconstruire à chaque image, et ça se voit — un flash. Si le rayon doit
disparaître, c'est presque toujours qu'un **fond** disparaît : faire fondre le
fond et laisser le rayon fixe donne le même résultat, puisqu'un fond transparent
n'a pas de coin à arrondir.

**3. Faire fondre un calque plutôt qu'interpoler un `backgroundColor`.** Une
couleur animée s'interpole composante par composante sur le thread JS et invalide
le fond à chaque image. Un calque de couleur en `absoluteFill` dont on anime
l'**opacité** coûte une fraction de ça — et l'opacité, elle, peut être native
quand rien ne l'en empêche.

### Ce que l'identité laisse hors d'elle, et pourquoi

Trois familles de mouvement ne passent pas par les jetons. Ce n'est pas un oubli,
et il faut que ce soit écrit pour que personne ne « corrige » ces endroits :

1. **La timeline d'ENTRÉE des tuiles de l'accueil** (`CHROME`, `SERVICE_ART`) garde
   ses trois courbes propres — `EASE_QUART`, `EASE_BACK` (dépassement 1,56),
   `EASE_QUINT` — parce qu'elle est **transcrite d'une piste Figma Motion**
   authored à la main sur cette frame précise (`357:1685`). La maquette fait
   autorité sur son propre mouvement, et le dépassement de `EASE_BACK` sur
   l'illustration relève exactement du « brand-signature » que la planche autorise
   aux héros. La remplacer par les défauts du système effacerait une animation
   dessinée.
2. **Le ressort du lâcher de geste** survit à « Spring for Hero Only » : voir
   § BottomSheet, il n'y a pas de courbe de timing qui accepte une vélocité
   initiale.
3. **Trois durées sans rôle dans la planche** restent en dur, faute de jeton
   honnête : le fondu du splash de marque (420 ms), l'apparition/disparition du
   `Toast` (180 / 280 ms) et le clignotement du curseur de `CodeField` (480 ms).
   Ce sont des candidats à un futur jeton, pas des valeurs à forcer dans un jeton
   voisin. Le press de `Button` (`bounciness: 0`, settle ≈ 120 ms) **respecte
   déjà** la recette micro-interaction sans rien changer.

### Les deux 200 ms, et pourquoi ce n'est pas un doublon

`decoration-exit` et `container-exit` portent la même valeur et des rôles
opposés. Les fusionner serait perdre l'information :

- **`decoration-exit`** est le premier pas d'une sortie **échelonnée** dans une
  composition — `decoration 200 → text 250–300 → support 350` — où le conteneur
  part **en dernier** parce qu'il attend que son contenu ait dégagé.
- **`container-exit`** est un **renvoi en bloc** : rien n'attend, donc rien ne
  retarde. C'est le principe *Asymmetric Timing* pris au mot — « clean up and
  clear space **instantly** when dismissed to maintain high perceived application
  speed ».

Sortie échelonnée et renvoi en bloc sont deux événements différents, et c'est le
nom du jeton qui dit lequel on est en train d'écrire.

**Corollaire, visible partout dans le code : entrée 500, sortie 200.** L'asymétrie
n'est pas une nuance de la planche, c'est sa mécanique principale.

- `BottomSheet` : ouverture `container-morph`, fermeture `container-exit`.
- `MenuDrawer` : idem — et sa fermeture n'est **pas** sa fenêtre d'ouverture jouée
  à l'envers.
- `useSnapSheet`, snap programmatique : la **direction** tranche. La feuille monte
  → elle s'installe (`container-morph`, avec son maintien de 50) ; elle descend →
  elle rend la place (`container-exit`, sans maintien). Le sens suffit, ce qui
  évite un paramètre que chaque appelant devrait penser à passer.

_(Jeton ajouté le 27 août 2026, à la planche `motion-identity-system` comme au
code. Il manquait : `BottomSheet` empruntait `support-exit` (350 ms) faute de
mieux, ce qui **ralentissait** la fermeture des modales au lieu de la presser.)_

---

## Transitions & navigation

Deux familles de transitions, à ne jamais confondre :

### Inter-pages (navigation de pile)

Tout passage **d'une page à une autre** (nouvelle route) utilise la transition de pile native :

- **Animation** : glissement horizontal `slide_from_right` — la nouvelle page entre par la droite, l'ancienne fait son parallaxe.
- **Geste de retour** : swipe **bord gauche → droite** interactif (`gestureEnabled: true`), comportement natif iOS. Sur Android, c'est le retour système qui joue ce rôle (pas d'edge-swipe natif).
- **Règle** : c'est le comportement **par défaut de toute nouvelle page / tout nouveau flow**. Ne pas réinventer de transition de page ad hoc.

> ⚠️ **La transition de pile est le seul mouvement du produit qui ne passe PAS
> par l'identité.** C'est une conséquence de la pile native, pas un choix :
> `native-stack` n'expose ni courbe, ni durée par direction — son
> `animationDuration` est **iOS seulement** et ne couvre même pas
> `slide_from_right`. Une page entre et sort donc à la vitesse de la plateforme,
> quand tout le reste du produit tient l'asymétrie « entrée 500 / sortie 200 »
> (§ Motion, « Les deux 200 ms »). La recette « Transitions de page · Primary
> Ease · 300 ms » de la planche n'est **appliquée nulle part** — elle décrit une
> intention que la pile native ne sait pas recevoir.
>
> **Corollaire tranché le 26 septembre 2026 : ce qui a besoin de l'asymétrie ne
> devient pas une page.** Le Menu l'a appris en aller-retour. Tiroir, il portait
> l'asymétrie en propre — ouverture `container-morph` + `Hold / Anchor`,
> fermeture `container-exit`, « un tiroir qu'on referme dégage la place tout de
> suite, il ne se retire pas avec la même componction qu'il a mise à venir ».
> Devenu la page `app/menu` le 4 septembre, il l'a perdue : la pile native ne
> sait pas la rejouer. Il **redevient un tiroir**, en gardant tout le contenu
> gagné entre-temps — les résumés de portes, l'ordre, le portrait, la zone
> « Gagner de l'argent ».
>
> La leçon n'est pas « le tiroir est mieux ». C'est que **le contenant se choisit
> aussi sur le mouvement**, pas seulement sur la grammaire de son contenu : la
> conversion en page était juste côté grammaire — et elle l'est restée, puisque
> le tiroir a gardé `List style_="plat"` — mais le prix en mouvement n'avait pas
> été posé sur la table. Une surface qui doit s'installer puis être renvoyée est
> un **conteneur**, et un conteneur vit dans la page, pas dans la pile.
>
> L'autre sortie existait : passer la pile au navigateur **JS**
> (`@react-navigation/stack`, dont le `transitionSpec` distingue `open` et
> `close`) donnerait l'identité à **toutes** les transitions de page. Écartée
> pour l'instant — une dépendance de plus et l'abandon des transitions natives
> de plateforme, retour prédictif d'Android compris, pour un prototype qui part
> en test utilisateur. Le trou décrit plus haut reste donc ouvert : il est réel,
> il n'est simplement plus sur le chemin du Menu.
>
> _(Écrit le 26 septembre 2026, en fusionnant la passe d'identité de mouvement
> avec la conversion du tiroir en page. Les deux travaux étaient justes
> séparément ; c'est leur rencontre qui a révélé le trou.)_

### Intra-page (états & feuilles)

Tout changement **à l'intérieur d'une même page** (morph d'un mode à l'autre, ouverture/fermeture d'une bottom sheet, snap entre crans) utilise une **animation locale** — pas une transition de pile :

- Entrée de feuille : slide-up sur la fenêtre `container-morph` + courbe `Hold / Anchor` (cf. § Motion, recette « Modals / Sheets »).
- Morph in-place (ex. accueil : grille de services ↔ recherche d'itinéraire ↔ choix sur carte) : on **reste sur la même route**, on anime le contenu.

> **Seul l'élément touché se transforme.** Quand un morph part d'un objet d'une
> liste ou d'une grille — une tuile de service, une carte de gamme — c'est **cet
> objet-là** qui joue la transition, pas ses voisins. Les voisins n'ont rien
> déclenché ; les animer dit à l'utilisatrice qu'elle a ouvert plusieurs choses à
> la fois.
>
> Piège dont la règle est née : la timeline Motion de la maquette vit sur la
> **feuille**, pas sur une tuile. Lue littéralement, elle fait sortir les deux
> tuiles de l'accueil ensemble — et c'est ce que le code faisait. À l'écran, ça se
> lit comme si on ouvrait Course ET Livraison. Une timeline posée au niveau d'un
> conteneur ne dit pas que tous ses enfants la jouent : elle dit seulement où
> l'auteur l'a rangée. _(Corrigé le 27 août 2026 sur signalement à l'écran.)_
>
> Corollaire de code : l'objet pressé **tend sa propre valeur animée** au
> gestionnaire (`onService(service, anim)`) au lieu qu'on la retrouve par index —
> il n'y a alors aucun appariement à maintenir entre l'ordre des données et celui
> des animations.

> Repère : changement de **page** = transition de pile (slide + swipe-back). Changement d'**état dans la page** = animation locale (sheet, morph). Si on se surprend à pousser une route juste pour animer un changement d'état, c'est probablement le mauvais outil.

---

## Les deux OS

Le design se décide sur une maquette iPhone (375×844) ; le produit tourne sur les
deux. Ces règles sont nées d'écarts **constatés sur Android**, et aucune ne passe
par une branche `Platform` : dans les trois cas, la version correcte l'est sur les
deux OS. Une branche `Platform` est le dernier recours, pas le premier réflexe.

### Un repère, pas deux

**Deux éléments qui doivent rester alignés se mesurent depuis le même bord.** Un
enfant ancré en `top` et un frère ancré en `bottom` ne s'alignent que si la
hauteur de vue supposée par l'un vaut exactement celle de l'autre.

_Défaut réel : le bouton de recentrage de l'accueil, ancré en `top: 0` avec
`translateY = ty − 60`, devait flotter 60 px au-dessus d'une feuille ancrée en
`bottom: 0`. Juste sur iOS, décalé sur Android d'exactement l'écart entre la
hauteur de fenêtre rapportée et celle de la vue. Corrigé non par un décalage
Android, mais en posant le bouton dans un cadre qui **rejoue la géométrie de la
feuille** — le 60 est alors mesuré depuis le même bord, et n'a plus à être
corrigé nulle part._

### La hauteur d'écran se lit à l'exécution

**Toujours `useScreenHeight()` (`hooks/`), jamais `Dimensions.get('window')`.**
Sur iOS les deux coïncident ; sur Android, pas forcément — barres système,
edge-to-edge activé par défaut depuis le SDK 54. Or **tous les niveaux de feuille
sont des fractions de cette hauteur** : lue au mauvais endroit, le plafond de
85 % cesse d'être 85 % de ce que l'utilisatrice voit.

Corollaire : une valeur qui dépend de la hauteur d'écran ne peut pas être une
constante de module ni vivre dans un `StyleSheet.create` — elle se pose à
l'exécution. C'est le prix de la justesse, et il est faible.

> **`useScreenHeight` garde la plus GRANDE hauteur observée, pas la dernière.**
> Le cadre mesuré rétrécit quand la fenêtre se redimensionne. Si la géométrie
> d'une feuille en dépendait, ses crans et sa hauteur se recalculeraient pendant
> que son `translateY` porte encore une valeur absolue calculée dans l'ancien
> repère : **la feuille entière saute**. Le clavier ne peut que rétrécir le cadre,
> jamais l'agrandir, et l'app est verrouillée en portrait — garder le maximum
> suffit donc à immuniser la géométrie.
>
> _(Défaut réel, introduit le 27 août 2026 en passant de `Dimensions` au cadre
> mesuré, et signalé à l'écran sur Android le même jour. La cause première est
> traitée par `adjustNothing`, mais une géométrie qui ne dépend pas du clavier
> reste juste quel que soit le mode.)_

### Le texte n'a pas la même hauteur sur les deux OS

**Android réserve un espace au-dessus de l'ascendante et sous la descendante de la
police** (`includeFontPadding`, actif par défaut) ; iOS non. Chaque texte y est donc
plus haut de quelques points **en haut et en bas** — et comme la hauteur d'un texte
participe à la mise en page (rangées, cartes, gouttières, alignements sur la ligne
de base), l'écart se propage partout. À l'écran ça se lit comme du **padding en trop
autour du texte**, alors que rien dans les styles ne l'a demandé.

L'effet est d'autant plus net avec **Outfit**, dont les métriques déclarées sont
généreuses.

**Règle : `includeFontPadding: false` sur tout texte.** Android mesure alors sur
l'interligne réel — donc comme iOS, et comme la maquette, qui est dessinée sur un
cadre iPhone. Pas de branche `Platform` : la propriété est ignorée sur iOS.

Il est posé aux **deux sources** de la typographie, donc l'immense majorité du
produit l'a sans rien demander :

| Source | Portée |
|---|---|
| `components/Text.tsx` (style `base`) | tout texte passant par l'atome |
| `constants/typography.ts` (`inputTypo`) | tout champ de saisie d'**une** ligne |

> **Compagnon obligé sur un champ d'une ligne : `textAlignVertical: 'center'`.**
> Sans le padding de police, le texte d'un champ se cale en haut de sa boîte sur
> Android. Il est dans `inputTypo`, donc réservé aux champs d'une ligne — un champ
> **multiligne** reprend la variante entière et veut son texte en haut.
>
> **Les sites qui contournent l'atome portent le correctif eux-mêmes.** Ce sont
> exactement ceux que § Typographie liste comme « hors échelle » : `PlateChip`,
> `FlagChip`, le champ multiligne de `Field`, et les deux saisies de montant de
> `affilie`. Cinq sites — et c'est un argument de plus pour l'atome : un texte qui
> passe par lui n'a jamais ce problème.
>
> _(Règle écrite le 28 août 2026, sur signalement d'un écart de spacing constaté
> sur appareil Android. `includeFontPadding` n'apparaissait alors nulle part dans
> le projet, donc l'écart existait sur **tout** le produit.)_

### Clavier

**Le clavier passe par `react-native-keyboard-controller`, jamais par les
événements `Keyboard` de React Native.** La raison est unique et suffit : les
événements de RN sont des `keyboardDidShow` / `keyboardDidHide` — ils ne se
déclenchent qu'une fois le clavier **posé**, donc la mise en page rattrape son
retard d'un coup et ça se voit. Android n'a même pas les `will*` d'iOS. La
bibliothèque publie la position du clavier **image par image**, sur les deux OS.

Quatre règles, dans cet ordre :

0. **Android ne redimensionne PAS la fenêtre.** `app/_layout.tsx` appelle
   `KeyboardController.setInputMode(SOFT_INPUT_ADJUST_NOTHING)` au démarrage. En
   `adjustResize` — le défaut — Android rétrécit la fenêtre dès que le clavier
   monte : **deux choses bougent au lieu d'une**, le système repositionne
   instantanément tout ce qui est ancré en bas, et notre décalage animé s'ajoute
   par-dessus. Un saut, puis une animation. `adjustNothing` rend la main : le seul
   mouvement est celui qu'on anime.

   ⚠️ **Contrepartie, et elle n'est pas optionnelle : plus aucun écran ne peut
   compter sur le système pour dégager un champ.** Tout écran à saisie doit
   porter son propre `KeyboardAvoidingView`, ou vivre dans une feuille qui se
   décale, ou avoir une liste au `paddingBottom` conscient du clavier. Un écran à
   champ qu'on ajoute sans rien de tout ça aura son champ sous le clavier — sur
   les deux OS. Deux exclusions **vérifiées** et volontaires : l'écran OTP (tout
   son contenu est en haut, le clavier ne l'atteint pas) et l'étape carte de la
   fiche de Lieu (sa barre de recherche flotte en haut d'une carto plein écran —
   un `padding` y rétrécirait la carte).
1. **`KeyboardAvoidingView` s'importe de `react-native-keyboard-controller`**, pas
   de `react-native`. Mêmes props (`behavior="padding"` sur les deux OS), mais le
   décalage suit le clavier. Passer `behavior={undefined}` côté Android n'a jamais
   été une option : ça reposait sur `adjustResize`, qui **ne redimensionne plus la
   fenêtre depuis Android 15** (API 35) et l'edge-to-edge — le champ restait
   simplement caché.
2. **Une feuille ancrée en bas se décale par sa TRANSFORMATION, pas par son
   `paddingBottom`.** `useKeyboardAnimation()` rend des `Animated.Value` en
   **native driver** : ils se composent avec le `translateY` de la feuille
   (`Animated.subtract(ty, kbHeight)`) et elle monte s'asseoir sur le clavier en
   synchro. Une valeur en native driver ne peut pas animer une propriété de mise
   en page — donc `paddingBottom` reste statique, et c'est très bien ainsi.
3. **Le clavier REMPLACE la zone sûre, il ne s'y ajoute pas.** Il couvre déjà la
   barre système. `paddingBottom: (kbHeight || insets.bottom) + 16`, jamais
   `kbHeight + insets.bottom`. Pour les cas non animés — du mou de défilement en
   bas d'une liste, où rien ne bouge à l'écran — `useKeyboardState((s) =>
   s.height)` donne un nombre ordinaire, et c'est suffisant.

Et le décalage clavier d'une feuille modale vit **dans `BottomSheet`**, une fois,
pas répété dans chaque écran qui en ouvre une.

`KeyboardProvider` est monté dans `app/_layout.tsx` avec `statusBarTranslucent` et
`navigationBarTranslucent` : l'edge-to-edge est actif par défaut depuis le SDK 54,
l'app dessine derrière les deux barres, leur hauteur ne doit donc pas être comptée
deux fois. `android.softwareKeyboardLayoutMode` reste déclaré à `"resize"` dans `app.json`,
mais ce n'est plus qu'un **repli** : le mode posé à l'exécution (`adjustNothing`)
gagne. On le garde parce qu'il vaut mieux que le silence — c'est ce silence qui
avait laissé trois stratégies coexister — et parce qu'il redonne le comportement
système si la bibliothèque venait à ne pas se charger.

⚠️ **C'est un module natif : l'app ne tourne plus dans Expo Go.** Il faut un dev
client (`npx expo run:android` / `run:ios`, ou un build EAS).

_(Section écrite le 27 août 2026, après un signalement sur appareil Android :
bouton flottant mal placé, et décalage clavier qui ne suivait pas le comportement
du système. La partie Clavier a été refaite le même jour : une première passe
avait unifié le `KeyboardAvoidingView` de React Native, mais le décalage restait
désynchronisé du clavier — défaut confirmé à l'écran par l'utilisatrice, d'où le
passage à `react-native-keyboard-controller`.)_
