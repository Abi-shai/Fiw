import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Text from '@/components/Text';
import { Colors, Radii, Strokes } from '@/constants/tokens';

type Props = {
  /** Code court (ex. « 4832 ») — un caractère par case. */
  code: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Code de remise en gros caractères, une case par chiffre (réf. benchmark
 * Livraison : inDrive Delivery protection). Le Client le communique au
 * destinataire ; le prestataire le demande à la remise du Colis.
 */
export default function CodePill({ code, style }: Props) {
  return (
    <View style={[styles.row, style]}>
      {code.split('').map((char, i) => (
        <View key={`${char}-${i}`} style={styles.cell}>
          <Text variant="codeCell">{char}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  cell: {
    width: 52, height: 60,
    borderRadius: Radii.lg,
    backgroundColor: Colors.borderSubtle,
    borderWidth: Strokes.medium, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
});
