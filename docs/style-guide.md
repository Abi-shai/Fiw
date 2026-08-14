# Fiw — Style Guide

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

---

## Typographie

**Police** : Outfit — chargée via `@expo-google-fonts/outfit`.  
**Graisses chargées** : Light 300 · Regular 400 · Medium 500 · SemiBold 600 · Bold 700

> ⚠️ En RN, `fontWeight` ne sélectionne pas une graisse Outfit : chaque graisse doit être mappée à sa famille nommée (`Outfit_600SemiBold`…). La typo passe donc **obligatoirement par l'atome `Text`** à variants sémantiques (`display`, `heading1`, `heading2`, `body`, `body-small`, `label`, `caption`) — pas de `fontSize`/`fontWeight` bruts dans les écrans.

### Échelle

| Token | Taille | Graisse | Usage |
|---|---|---|---|
| `text-display` | 28px | Bold 700 | Titres onboarding |
| `text-heading1` | 22px | SemiBold 600 | Titre d'écran |
| `text-heading2` | 18px | SemiBold 600 | En-tête de section |
| `text-body` | 15px | Regular 400 | Texte courant |
| `text-body-small` | 13px | Regular 400 | Texte secondaire |
| `text-label` | 13px | Medium 500 | Labels, boutons |
| `text-caption` | 11px | Regular 400 / Light 300 | Horodatages, mentions légales |

### Interlignage recommandé

| Contexte | Line height |
|---|---|
| Titres (`display`, `heading1`, `heading2`) | × 1.3 |
| Corps (`body`, `body-small`) | × 1.6 |
| Labels et captions | × 1.4 |

---

## Espacement

Base : **4px**. Tous les espacements internes (padding, margin, gap) sont des multiples de cette base.

| Token | Valeur |
|---|---|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-12` | 48px |
| `space-16` | 64px |

---

## Rayons

| Token | Valeur | Usage |
|---|---|---|
| `radius-sm` | 8px | Tags, badges |
| `radius-md` | 12px | Boutons, **champs de saisie & SearchBar**, cards |
| `radius-lg` | 16px | Grandes cartes |
| `radius-xl` | 28px | **Bottom sheets, modals** |

---

## Ombres

Teintées bleu brand pour rester dans la cohérence chromatique — **sauf `shadow-float`**, volontairement neutre (voir ci-dessous).

| Token | Valeur CSS | Usage |
|---|---|---|
| `shadow-sm` | `0 1px 3px rgba(0, 102, 255, 0.08)` | Inputs focus, cards plates |
| `shadow-md` | `0 4px 12px rgba(0, 102, 255, 0.12)` | Cards interactives, FAB |
| `shadow-lg` | `0 8px 24px rgba(0, 102, 255, 0.16)` | Bottom sheets, modals, toasts |
| `shadow-sheet` | `0 -6px 24px rgba(0, 102, 255, 0.14)` | Arête haute des bottom sheets (orientée vers le haut) |
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
| `link` | transparent | transparent (opacité 0.55) | `color-primary` | — |
| `linkDestructive` | transparent | transparent (opacité 0.55) | `color-error` | — |

`disabled` : opacité 0.45 (toutes variantes). `loading` : spinner à la couleur du texte. Slots icône Phosphor leading/trailing sur toutes les variantes.

> **Choix de variante.** `secondary` (contour neutre gris) = action secondaire courante. `destructive` (texte rouge, **sans bordure ni fond**) = **annulation / action dangereuse secondaire** (ex. « Annuler la commande », « Annuler (gratuit) ») — à privilégier sur toutes les pages présentant ce type d'action, plutôt qu'un lien texte ad hoc. `destructiveFilled` (plein rouge) est **réservé** au cas où l'action destructive EST le CTA de l'écran (ex. « Raccrocher »). `link` (texte bleu primary, **sans fond ni bordure ni pilule**, empreinte compacte) = **action-lien inline** dans une rangée ou un formulaire (ex. « Modifier » un numéro, « Renvoyer le code ») — à privilégier plutôt qu'un `Text` + icône ad hoc. `linkDestructive` = le **pendant rouge de `link`** (même empreinte, texte `color-error`), pour l'action-lien qui retire/supprime dans une rangée (ex. « Retirer » un compte Mobile Money) — il permet d'opposer deux actions **de même forme** dans la même liste, seule la couleur changeant selon la portée (ex. slot rempli « Retirer » vs slot vide « Ajouter »).

### Tailles (hauteurs pouce-friendly ≥ 48px)

| Taille | Hauteur | Padding horizontal | Typographie | Icône | Usage |
|---|---|---|---|---|---|
| `lg` | 56px | 28px | Outfit SemiBold 16px | 20px | CTA pleine largeur |
| `md` | 48px | 20px | Outfit SemiBold 15px | 18px | Actions courantes |
| `sm` | 40px | 16px | Outfit Medium 14px | 16px | Actions inline / compactes |

---

## Icônes

**Bibliothèque** : [Phosphor Icons](https://phosphoricons.com) via `phosphor-react-native` (+ `react-native-svg`). Exposée **uniquement** via l'atome `Icon` (sous-ensemble nommé et curé) — jamais d'import direct, pour empêcher le mélange de familles.

- **Poids** : `bold` par défaut partout — outline à trait épais, style graphique affirmé cohérent avec le logo et les éléments de marque (on évite le trait fin de `regular`). `fill` réservé aux états **actifs/sélectionnés** (onglet courant, marqueur carte actif, favori activé, étoile pleine) — emphase au-dessus du `bold`. Ni `regular` ni `duotone` ne sont utilisés comme style de base.
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
| `IconButton` | Bouton rond icône | `floating` (blanc + liseré + ombre, sur carte ; **icône gris foncé `gray-700`** — neutre, registre nav, pas le bleu marque) / `flat` (fond gris, dans sheet ; icône bleu marque). |
| `SearchBar` | Recherche | Pilotée par prop : `asButton` (lanceur → navigue) ou `editable` (saisie). Slot trailing optionnel (carte, micro), bouton clear. |
| `TopBar` | En-tête | Slots gauche/titre/droite. Variantes `solid` (gère safe-area) / `transparent` (réutilisée comme en-tête de sheet). **N'inclut pas** les boutons flottants sur carte (ce sont des `IconButton`). |
| `PlaceRow` | Ligne de lieu | Cercle d'icône + titre + sous-titre + trailing. Récents, suggestions, lieux enregistrés. |
| `PhoneField` | Saisie de numéro | Chip indicatif (drapeau + `+code` + caret) ouvrant le `CountryPicker`, numéro **formaté par pays** (`constants/countries.ts`). **Tous pays acceptés.** Point d'entrée unique de toute saisie de téléphone — changement de numéro **et onboarding** (cf. `sitemap-client.md` §1) : même saisie, même présentation. |
| `CountryPicker` | Choix du pays | Feuille **3 crans** (`hooks/useSnapSheet`) + barre de recherche + liste monde triée. Drapeaux = **PNG plats locaux** (`assets/flags/`, map `constants/flags.ts`) rendus via `FlagChip` — **pas de SVG** (`SvgXml` plante sur les drapeaux à bloc `<style>`). |
| `SettingsRow` | Ligne de réglage | Icône ligne + label + sous-titre + `value`/slot `right` + chevron. Variante `destructive` (label rouge). Page Compte et sous-écrans. **Volontairement pauvre** : un objet plus riche (logo de service, badge d'état, action sur une 2ᵉ ligne — cf. carte de `compte/paiement.tsx`) mérite **son propre composant**, pas des slots ajoutés ici un par un. |
| `SettingsGroup` | Carte de réglages | Regroupe des `SettingsRow` (séparateurs auto), label de section en capitales + `footnote`. |
| `Radio` | Pastille de sélection | Coché = fond bleu marque + tick blanc ; décoché = cercle vide `text-disabled`. Marque l'élu d'un ensemble à choix unique **dans une feuille de choix** (`PaymentSheet`). Non tappable en propre — c'est la rangée qui porte l'action. Dans une **liste persistante**, préférer `SettingsRow selected` + badge (voir ci-dessous). |
| `Callout` | Encart d'information | Fond `brand-yellow-subtle` + liseré `brand-yellow-100` + **pastille `brand-yellow` à glyphe sombre** (structure de la carte « Devenir prestataire » — le jaune remplit, le glyphe dessus porte le contraste). Pour une **règle** ou une **affordance non devinable** que le Client doit lire. Jaune et **pas bleu** : cf. répartition des rôles bleu/jaune. **Un seul par écran** — au-delà, c'est un problème de hiérarchie. À distinguer du motif `infoRow` (icône + `caption` tertiaire **sans fond**), qui précise sans réclamer l'attention. |

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

**Voile (scrim)** — composant `Scrim` : voile noir derrière la feuille dont l'opacité **suit la position de la feuille**. Nul quand la feuille est basse (`collapsed` / escamotée), net à `half`/medium (~0.38), marqué à `full`/expanded (~0.58) — pour assombrir la carte/le fond et concentrer l'attention sur la feuille. `pointerEvents="none"` (purement visuel, ne bloque pas le fond) et posé **entre le fond et les contrôles flottants** (les boutons carte restent nets). Comportement standard de toute bottom sheet montant aux niveaux hauts.

### Formulaires

- **Champ au repos : jamais bleu.** Un champ, vide ou rempli, ne marque **aucun
  état** — il n'est ni sélectionné, ni actif, ni par défaut. Le peindre en
  `color-primary-subtle` + liseré `color-primary` lui donne le poids d'un élu qu'il
  n'est pas, et le met en concurrence avec le CTA, seule action réelle de l'écran.
  Traitement de base : fond `color-surface`, liseré `color-border` 1 px, même rayon
  que les autres blocs. **Sur un écran de formulaire, le bleu n'appartient qu'aux
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
- La validation passe par le **CTA désactivé** tant que les requis manquent (pas de message d'erreur inline en v1).

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
