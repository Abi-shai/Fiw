import { StyleSheet } from 'react-native';

// Épaisseurs de liseré. Miroir de la collection Figma `Fiw Stroke`.
//
// `hairline` est le SEUL jeton du système dont la valeur diffère entre les deux
// mondes : React Native la calcule selon la densité de l'écran (≈0.5 en @2x,
// ≈0.33 en @3x) là où la maquette porte un nominal de 0.5. C'est voulu — « le
// trait le plus fin possible » est une notion de plateforme, pas une valeur de
// design. Même nature que l'interligne `AUTO` de Figma.
export const Strokes = {
  /** Le trait le plus fin que l'appareil sache dessiner. Réservé aux éléments
   *  FLOTTANT sur la carte : détache l'élément du fond carto sans peser. Se
   *  marie avec la couleur `hairline`. */
  hairline: StyleSheet.hairlineWidth,
  /** Liseré par défaut : champs, cartes, rangées, boutons secondaires. */
  thin: 1,
  /** Liseré qui doit se voir sans crier : contour d'un bouton, carte de choix
   *  sélectionnée, pastille de plaque. */
  medium: 1.5,
  /** Liseré porteur : anneau d'un `Radio`, liseré blanc qui détache un avatar de
   *  ce qu'il chevauche, champ actif ou en erreur. */
  thick: 2,
  /** Le plus épais. Segment franchi d'un `StepProgress` — un trait qui EST le
   *  contenu, pas un contour. */
  heavy: 3,
} as const;
