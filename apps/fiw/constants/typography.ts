// Familles Poppins chargées dans _layout (via @expo-google-fonts/poppins).
// En RN, fontWeight ne sélectionne pas une graisse Poppins : on mappe
// explicitement chaque graisse à sa famille nommée.
export const Poppins = {
  light: 'Poppins_300Light',
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

export type TextVariant =
  | 'displayXl' | 'display' | 'heading1' | 'heading2'
  | 'body' | 'bodySmall' | 'label' | 'caption';

// Échelle du style-guide. Line-height : titres ×1.3, corps ×1.6, labels/captions ×1.4.
// `displayXl` = grand nombre mis en avant (compte à rebours d'arrivée, gros montant).
export const Typography: Record<TextVariant, {
  fontFamily: string; fontSize: number; lineHeight: number;
}> = {
  displayXl: { fontFamily: Poppins.bold,     fontSize: 40, lineHeight: 48 },
  display:   { fontFamily: Poppins.bold,     fontSize: 28, lineHeight: 36 },
  heading1:  { fontFamily: Poppins.semibold, fontSize: 22, lineHeight: 29 },
  heading2:  { fontFamily: Poppins.semibold, fontSize: 18, lineHeight: 23 },
  body:      { fontFamily: Poppins.regular,  fontSize: 15, lineHeight: 24 },
  bodySmall: { fontFamily: Poppins.regular,  fontSize: 13, lineHeight: 21 },
  label:     { fontFamily: Poppins.medium,   fontSize: 13, lineHeight: 18 },
  caption:   { fontFamily: Poppins.regular,  fontSize: 11, lineHeight: 15 },
};
