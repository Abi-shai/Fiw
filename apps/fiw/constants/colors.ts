export const Colors = {
  // Primary
  primary:        '#0066FF',
  primaryHover:   '#0676FF',
  primaryPressed: '#0D459B',
  // Aplat bleu des GRANDES surfaces (plateforme de la carte gamme). Moins
  // saturé que `primary` : étalé sur une large surface, le bleu de marque
  // vibre et écrase l'illustration posée dessus. Ne jamais l'employer pour du
  // texte ni pour un bouton — c'est un fond, pas une couleur d'action.
  primaryFill:    '#3B82F6',
  // Bleu de TEXTE sur fond clair — un cran plus profond que `primary`, qui
  // manque de corps sur un chiffre de 18 px (prix de la carte gamme).
  primaryInk:     '#005DE8',
  // Aligné sur la variable `primarySubtle` du fichier Figma (16 août 2026) : les
  // deux avaient divergé, le code tirant vers le violet et la maquette vers le
  // cyan. Même valeur que `blue50` — c'est le palier subtil de l'échelle bleue.
  primarySubtle:  '#EDF7FF',
  primaryOn:      '#FFFFFF',
  // Jaune de marque (logo Fiw, accents ponctuels). Seuls jaunes autorisés — à ne
  // pas confondre avec `warning` (#F59E0B, ambre fonctionnel « ça cloche »).
  // Échelle calquée sur le bleu, mêmes rôles (cf. carte « Devenir prestataire »,
  // MenuDrawer : fond `primarySubtle` + liseré `blue100` + pastille `primary`) :
  // même teinte (h 51°) et même saturation (100%) partout, seule la luminosité
  // change — les trois se lisent comme une seule couleur.
  // Le jaune est une couleur *lumineuse* : à luminosité égale il paraît bien plus
  // pâle que le bleu. L'échelle ne décalque donc pas les luminosités du bleu —
  // chaque palier descend plus bas que son pendant, et le `100` se désature (82%)
  // pour exister comme liseré au lieu de se noyer dans le fond.
  //
  // Corollaire : le plein sur le subtil ne fait que 1.2:1. Le jaune plein
  // **remplit une forme, il ne dessine jamais** — pastille + glyphe sombre par
  // dessus (cf. `Callout`), pas de glyphe tracé en jaune. Il n'y a donc pas de
  // palier foncé ici : le jour où du *texte* devra tenir sur un fond jaune, il en
  // faudra un (≈ 49° 100% 30% / #998200 → 3.7:1) — surtout pas le plein.
  brandYellow:       '#FFE347', // plein  (51° 100% 64%) — pastilles, tags    ≈ primary
  brandYellow100:    '#F6E7A3', // clair  (49°  82% 80%) — liserés d'encart   ≈ blue100
  brandYellowSubtle: '#FFFBE9', // subtil (49° 100% 96%) — fonds d'encart     ≈ primarySubtle

  // Blue scale
  blue50:  '#EDF7FF',
  blue100: '#D6EDFF',
  blue200: '#B5E0FF',
  blue300: '#83CFFF',
  blue400: '#48B3FF',
  blue500: '#1E92FF',
  blue600: '#0676FF',
  blue700: '#0066FF',
  blue800: '#084EC5',
  blue900: '#0D459B',
  blue950: '#0E2B5D',

  // Neutrals — dérivés de l'échelle de gris Tailwind (gray-50 → gray-900).
  // Paliers nommés sémantiquement ; gray600/700 exposés pour les cas plus
  // foncés (ex. icônes neutres) où textSecondary (gray-500) est trop clair.
  // Le gris de fond — « le sol ». Il occupe soit la page entière (Transport,
  // Livraison, Affiliation), soit seulement un bloc posé sur une page blanche
  // (toute la partie Compte, où figure et fond sont inversés : page blanche,
  // blocs gris). Deux emplois, un seul rôle : ce qui est en retrait.
  // À ne pas confondre avec `surfaceAlt`, qui est un cadre de **regroupement
  // discret à l'intérieur d'une feuille déjà dense** (RideSheet, configure) —
  // lui doit rester à peine perceptible, sinon il ajoute une frontière à lire
  // sur un écran qui en a déjà beaucoup.
  bg:            '#F9FAFB', // gray-50
  surface:       '#FFFFFF',
  border:        '#E5E7EB', // gray-200
  gray600:       '#4B5563',
  gray700:       '#374151',
  // Liseré universel des éléments flottant sur la carte : détache l'élément
  // du fond carto quel que soit son contraste (translucide, neutre).
  hairline:      'rgba(17, 24, 39, 0.08)',
  borderSubtle:  '#F3F4F6',
  // Piste neutre des segmented controls & pills d'action (gris froid).
  track:         '#F2F3F5',
  // Fond de card subtil, légèrement plus froid que `surface` (cards internes).
  surfaceAlt:    '#FBFBFC',
  textPrimary:   '#1A1A1A',
  textSecondary: '#6B7280',
  textTertiary:  '#9CA3AF',
  textDisabled:  '#D1D5DB',
  textOnPrimary: '#FFFFFF',

  // Functional
  error:          '#EF4444',
  errorPressed:   '#DC2626',
  errorSubtle:    '#FEE2E2',
  warning:        '#F59E0B',
  warningSubtle:  '#FEF3C7',
  success:        '#10B981',
  successSubtle:  '#D1FAE5',
};
