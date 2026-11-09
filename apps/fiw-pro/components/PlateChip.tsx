import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Radii, Outfit, Strokes } from '@/constants/tokens';
import Text from '@/components/Text';

/** Pastille de plaque d'immatriculation (Figma 84:74) — bordure 1.5,
 *  Outfit Bold, chasse élargie. */
export default function PlateChip({ plate }: { plate: string }) {
  return (
    <View style={styles.plateChip}>
      <Text style={styles.plateText}>{plate}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  plateChip: {
    alignSelf: 'flex-start',
    borderWidth: Strokes.medium, borderColor: Colors.borderSubtle,
    borderRadius: Radii.pill,
    paddingVertical: 4, paddingHorizontal: 12,
    backgroundColor: Colors.surface,
  },
  plateText: { fontFamily: Outfit.bold, fontSize: 15, letterSpacing: 1.5, color: Colors.textPrimary },
});
