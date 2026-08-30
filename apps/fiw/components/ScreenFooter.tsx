import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Strokes } from '@/constants/tokens';

type Props = {
  /** Filet haut. À ne mettre qu'au-dessus d'un contenu qui **défile** sous la
   *  barre : sur un écran qui tient sans défiler, il ne sépare rien et alourdit. */
  rule?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Barre d'actions de pied d'écran — le pendant bas de `ScreenHeader`.
 *
 * Douze écrans la refaisaient à la main, sous **quatre géométries** différentes :
 * filet `thin`, `hairline` ou absent ; fond `bg` ou `surface` ; 16 ou 32 en bas.
 * Une seule ici.
 *
 * Le bas vaut `max(32, zone sûre + 16)` : la maquette pose 32 comme repos
 * visuel, l'appareil impose sa zone sûre, et c'est le plus grand des deux qui
 * gagne — sinon la barre colle à la barre d'accueil sur un téléphone à encoche,
 * ou flotte trop haut sur un téléphone plat.
 */
export default function ScreenFooter({ rule, children, style }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.footer,
        rule && styles.rule,
        { paddingBottom: Math.max(Spacing[8], insets.bottom + Spacing[4]) },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
    gap: Spacing[2],
    backgroundColor: Colors.bg,
  },
  rule: {
    borderTopWidth: Strokes.thin,
    borderTopColor: Colors.borderSubtle,
  },
});
