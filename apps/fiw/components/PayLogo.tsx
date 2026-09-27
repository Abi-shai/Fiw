import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Medallion from '@/components/Medallion';
import { type IconName } from '@/components/Icon';
import { PAY_ILLUSTRATIONS } from '@/constants/illustrations';

/**
 * Tête de rangée d'un moyen de paiement ou d'un opérateur Mobile Money, au
 * gabarit de 56 de la maquette : **le logo de marque quand il existe** — un
 * logo se reconnaît plus vite qu'un glyphe — et sinon le `Medallion lg` du
 * système. Le repli n'est donc pas un motif à part, c'est le composant.
 *
 * Extrait de `PaymentSheet` le 27 septembre 2026, quand le choix d'opérateur du
 * retrait Affilié en a eu besoin : il dessinait jusque-là une **pastille de
 * couleur de 12 px** par opérateur, alors que le style guide écrit noir sur
 * blanc « moyens de paiement = logos en assets ». Wave et Orange Money ont leur
 * logo ; Free Money n'en a pas encore et prend donc le médaillon.
 */
export default function PayLogo({ id, icon = 'card' }: { id: string; icon?: IconName }) {
  const illustration = PAY_ILLUSTRATIONS[id];
  if (!illustration) return <Medallion icon={icon} size="lg" />;
  return (
    <View style={styles.wrap}>
      <Image source={illustration} style={styles.illo} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  illo: { width: 52, height: 52, borderRadius: 14 },
});
