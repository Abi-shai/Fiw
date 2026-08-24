// Espacement base 4px (style-guide). Usage : padding: Spacing[4]  →  16px.
//
// L'index vaut la valeur divisée par 4 — d'où les demi-crans 1.5/2.5/3.5 pour
// 6, 10 et 14 px. Ces trois valeurs ne sont pas des multiples de 4 mais sont
// délibérées et récurrentes : 6 est l'interstice entre cartes d'une feuille
// groupée (`CARD_GAP`), 14 le padding horizontal des champs et pilules, 10 le
// gap interne de la famille Button. Côté Figma les mêmes jetons existent sous
// `space/1-5`, `space/2-5`, `space/3-5` (Figma interdit le point dans un nom de
// variable, le tiret y tient lieu de décimale).
export const Spacing = {
  0: 0,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  12: 48,
  16: 64,
} as const;
