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

### Neutres

| Token | Hex | Usage |
|---|---|---|
| `color-bg` | `#F9FAFB` | Fond d'écran |
| `color-surface` | `#FFFFFF` | Cards, inputs, modals |
| `color-border` | `#E5E7EB` | Bordures standards |
| `color-border-subtle` | `#F3F4F6` | Séparateurs légers |
| `color-text-primary` | `#1A1A1A` | Texte principal |
| `color-text-secondary` | `#6B7280` | Texte secondaire |
| `color-text-tertiary` | `#9CA3AF` | Placeholders, mentions |
| `color-text-disabled` | `#D1D5DB` | États désactivés |
| `color-text-on-primary` | `#FFFFFF` | Texte sur fond primaire |

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

**Police** : Poppins  
**Graisses chargées** : Light 300 · Regular 400 · Medium 500 · SemiBold 600 · Bold 700

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
| `radius-sm` | 8px | Champs de saisie, tags, badges |
| `radius-md` | 12px | Boutons, cards |
| `radius-lg` | 16px | Bottom sheets, modals, grandes cartes |

---

## Ombres

Teintées bleu brand pour rester dans la cohérence chromatique.

| Token | Valeur CSS | Usage |
|---|---|---|
| `shadow-sm` | `0 1px 3px rgba(0, 102, 255, 0.08)` | Inputs focus, cards plates |
| `shadow-md` | `0 4px 12px rgba(0, 102, 255, 0.12)` | Cards interactives, FAB |
| `shadow-lg` | `0 8px 24px rgba(0, 102, 255, 0.16)` | Bottom sheets, modals, toasts |

---

## Boutons

**Rayon** : `radius-md` (12px)

### Variantes

| Variante | Fond | Texte | Bordure | Usage |
|---|---|---|---|---|
| `primary` | `color-primary` | `#FFFFFF` | — | Action principale |
| `secondary` | `color-primary-subtle` | `color-primary` | — | Action secondaire |
| `ghost` | transparent | `color-primary` | `color-primary` (1px) | Action tertiaire |
| `destructive` | `#EF4444` | `#FFFFFF` | — | Suppression, annulation critique |

### Tailles

| Taille | Hauteur | Typographie | Usage |
|---|---|---|---|
| `lg` | 52px | `text-label` SemiBold 15px | CTA pleine largeur |
| `md` | 44px | `text-label` Medium 13px | Actions inline |

---

## Icônes

**Bibliothèque** : [Lucide Icons](https://lucide.dev) via `lucide-react-native`.

- Taille standard dans les boutons : 18px
- Taille standard inline (texte) : 16px
- Taille grande (actions flottantes, écrans vides) : 24px
- Trait : 1.5px (valeur par défaut Lucide)
- Couleur : hérite du contexte (`color-primary`, `color-text-secondary`, etc.)
