import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, Radii, Shadows } from '@/constants/tokens';
import Text from '@/components/Text';
import IconButton from '@/components/IconButton';

export const SHEET_RADIUS = Radii.xl;

const HAIRLINE = StyleSheet.hairlineWidth;

/**
 * Habillage visuel commun à toutes les feuilles (bottom sheets) de l'app :
 * coins arrondis en haut, fond surface, ombre portée vers le haut.
 * Source unique de vérité — à appliquer aussi sur les `Animated.View`
 * des feuilles déplaçables pour qu'elles restent identiques.
 */
export const sheetSurface: ViewStyle = {
  backgroundColor: Colors.surface,
  borderTopLeftRadius: SHEET_RADIUS,
  borderTopRightRadius: SHEET_RADIUS,
  // Liseré fin sur l'arête haute : détache la feuille du fond carto.
  borderTopWidth: HAIRLINE,
  borderColor: Colors.hairline,
  ...Shadows.sheet,
};

/** Poignée de glissement standard, alignée au centre. */
export function Handle({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.handle, style]} />;
}

/**
 * En-tête standard des feuilles : titre `heading1` à gauche + croix (close)
 * optionnelle à droite. Source unique de vérité pour que toutes les feuilles
 * (configure, recherche accueil, feuilles modales) partagent exactement le même
 * placement et la même typo.
 */
export function SheetHeader({ title, onClose, style }: {
  title: string; onClose?: () => void; style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.headerRow, style]}>
      <Text variant="heading1" style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      {onClose && (
        <IconButton name="close" variant="flat" color={Colors.textPrimary} onPress={onClose} />
      )}
    </View>
  );
}

type SheetProps = {
  children: React.ReactNode;
  /** Ancre la feuille en bas de l'écran (position absolue). */
  floating?: boolean;
  /** Affiche la poignée de glissement en haut. */
  handle?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Feuille statique (non déplaçable). Pour les feuilles animées, appliquer
 *  `sheetSurface` directement sur l'`Animated.View`. */
export default function Sheet({ children, floating, handle, style }: SheetProps) {
  return (
    <View style={[sheetSurface, floating && styles.floating, style]}>
      {handle && (
        <View style={styles.handleArea}>
          <Handle />
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  floating: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
  },
  handleArea: {
    paddingTop: 10,
    paddingBottom: 14,
    alignItems: 'center',
  },
  handle: {
    width: 40, height: 5,
    borderRadius: 3,
    backgroundColor: Colors.border,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: { flex: 1, letterSpacing: -0.4 },
});
