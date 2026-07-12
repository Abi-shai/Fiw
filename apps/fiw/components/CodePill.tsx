import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Text from '@/components/Text';
import { Colors, Radii, Poppins } from '@/constants/tokens';

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
          <Text style={styles.digit}>{char}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  cell: {
    width: 52, height: 60,
    borderRadius: Radii.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  digit: { fontFamily: Poppins.bold, fontSize: 28, lineHeight: 36, color: Colors.textPrimary },
});
