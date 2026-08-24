import React from 'react';
import { View, StyleSheet } from 'react-native';
import {Colors} from '@/constants/tokens';
import Text from '@/components/Text';

/** Rangée de **restitution** (Figma `InfoRow`) : un fait déjà renseigné, ou
 *  associé à une action de l'utilisateur. À plat — ni fond, ni rayon, ni
 *  padding — séparée de la suivante par un `Divider`. Le libellé reste discret,
 *  la valeur porte l'accent : `emphase="montant"` la passe en 20 Bold `primary`.
 *  `leading` accepte ce qu'on veut (icône, illustration, logo) à sa taille. */
export default function InfoRow({ label, value, leading, emphase = 'normale' }: {
  label: string; value: string;
  leading?: React.ReactNode;
  emphase?: 'normale' | 'montant';
}) {
  return (
    <View style={styles.infoRow}>
      {leading}
      <Text variant="bodySmall" color={Colors.textSecondary}>{label}</Text>
      <Text
        variant={emphase === 'montant' ? 'amount' : 'infoValue'}
        color={emphase === 'montant' ? Colors.primary : Colors.textPrimary}
        align="right"
        style={styles.value}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  value: { flex: 1 },
});
