import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/tokens';
import Icon, { type IconName } from '@/components/Icon';

/** Pastille d'état en tête d'une feuille ou d'un écran de fin : 56, glyphe 28.
 *
 *  `alerte` ouvre une confirmation destructive ou une alerte SOS ; `succès`
 *  couronne une course ou une livraison terminée.
 *
 *  Les deux écrans de clôture dessinaient cette seconde pastille à la main, à
 *  64 : ce n'était pas une taille de `Medallion` manquante, c'était **ce
 *  composant-ci dans un autre ton**. Elle rentre donc à 56.
 *
 *  À ne pas confondre avec `Medallion`, qui accompagne une rangée ou une
 *  donnée : celui-ci annonce l'état d'un écran entier. */
export default function AlertBadge({ icon, ton = 'alerte', weight = 'bold' }: {
  icon: IconName; ton?: 'alerte' | 'succès'; weight?: 'bold' | 'fill';
}) {
  const succes = ton === 'succès';
  return (
    <View style={[styles.alertBadge, succes && styles.succes]}>
      <Icon name={icon} size={28} weight={weight} color={succes ? Colors.success : Colors.error} />
    </View>
  );
}

const styles = StyleSheet.create({
  alertBadge: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.errorSubtle,
    alignItems: 'center', justifyContent: 'center',
  },
  succes: { backgroundColor: Colors.successSubtle },
});
