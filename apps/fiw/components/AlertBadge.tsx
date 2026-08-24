import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/tokens';
import Icon, { type IconName } from '@/components/Icon';

/** Pastille d'alerte en tête d'une feuille modale (Figma `AlertBadge`) : 56,
 *  fond `errorSubtle`, icône 28 en `error`. Confirmation destructive, alerte
 *  SOS. */
export default function AlertBadge({ icon, weight = 'bold' }: {
  icon: IconName; weight?: 'bold' | 'fill';
}) {
  return (
    <View style={styles.alertBadge}>
      <Icon name={icon} size={28} weight={weight} color={Colors.error} />
    </View>
  );
}

const styles = StyleSheet.create({
  alertBadge: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.errorSubtle,
    alignItems: 'center', justifyContent: 'center',
  },
});
