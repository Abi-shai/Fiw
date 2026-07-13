import { ViewStyle } from 'react-native';

// Ombres teintées bleu Fiw Pro (style-guide). Chaque token empaquette les props
// iOS (shadow*) + Android (elevation) pour un rendu homogène entre OS.
// `sheet` : variante orientée vers le haut pour les bottom sheets.
// `float` : ombre neutre pour les éléments posés sur la carte.
const BRAND = '#084EC5';
const NEUTRAL = '#0B1220';

export const Shadows: Record<'sm' | 'md' | 'lg' | 'sheet' | 'float', ViewStyle> = {
  sm: {
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 14,
  },
  sheet: {
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 16,
  },
  float: {
    shadowColor: NEUTRAL,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 12,
  },
};
