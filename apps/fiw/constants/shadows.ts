import { ViewStyle } from 'react-native';

// Miroir des styles d'effet Figma `Fiw/shadow/*`. Chaque token empaquette les
// props iOS (shadow*) + Android (elevation, absent de Figma) pour un rendu
// homogène entre OS.
//
// `sm`/`md`/`lg` sont teintées bleu marque pour rester dans la cohérence
// chromatique. Les deux ombres de mise en avant ne le sont pas :
// `float` (éléments posés sur la carte) se détache mieux d'un fond carto coloré
// en neutre, et `sheet` (arête haute des bottom sheets) est un gris `gray/700`
// franc — le bleu marque n'y portait pas assez pour décoller la feuille du fond.
const BRAND = '#0066FF';
const NEUTRAL = '#0B1220';
const SHEET = '#374151';   // gray/700

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
    shadowColor: SHEET,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.3,
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
