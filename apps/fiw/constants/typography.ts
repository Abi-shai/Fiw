// Familles Outfit chargées dans _layout (via @expo-google-fonts/outfit).
// En RN, fontWeight ne sélectionne pas une graisse Outfit : on mappe
// explicitement chaque graisse à sa famille nommée.
export const Outfit = {
  light: 'Outfit_300Light',
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
} as const;

export type TextVariant =
  | 'displayXl' | 'display' | 'heading1' | 'heading2'
  | 'body' | 'bodySmall' | 'label' | 'caption';

// Échelle du style-guide. Line-height : titres ×1.3, corps ×1.6, labels/captions ×1.4.
// `displayXl` = grand nombre mis en avant (compte à rebours d'arrivée, gros montant).
export const Typography: Record<TextVariant, {
  fontFamily: string; fontSize: number; lineHeight: number;
}> = {
  displayXl: { fontFamily: Outfit.bold,     fontSize: 40, lineHeight: 48 },
  display:   { fontFamily: Outfit.bold,     fontSize: 28, lineHeight: 36 },
  heading1:  { fontFamily: Outfit.semibold, fontSize: 22, lineHeight: 29 },
  heading2:  { fontFamily: Outfit.semibold, fontSize: 18, lineHeight: 23 },
  body:      { fontFamily: Outfit.regular,  fontSize: 15, lineHeight: 24 },
  bodySmall: { fontFamily: Outfit.regular,  fontSize: 13, lineHeight: 21 },
  label:     { fontFamily: Outfit.medium,   fontSize: 13, lineHeight: 18 },
  caption:   { fontFamily: Outfit.regular,  fontSize: 11, lineHeight: 15 },
};
