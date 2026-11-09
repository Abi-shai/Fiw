import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Radii } from '@/constants/tokens';
import Icon, { type IconName } from '@/components/Icon';
import Text from '@/components/Text';

/** Bandeau contextuel d'une feuille — frais d'attente, frais de rapprochement
 *  (Figma `InfoBanner`, axe `Ton`). Texte en `bodySmall` — 14/18 Regular, ce que
 *  dit la maquette ; c'était `label` (14/18 Medium) jusqu'au 24 août 2026. */
export default function InfoBanner({ icon = 'coins', tone = 'info', children }: {
  icon?: IconName; tone?: 'info' | 'alerte'; children: React.ReactNode;
}) {
  const alerte = tone === 'alerte';
  // `warningInk` et non `warning` : l'ambre plein posé en texte sur son propre
  // palier subtil ne fait que 2.0:1 — c'est l'encre qui écrit.
  const ink = alerte ? Colors.warningInk : Colors.primaryPressed;
  return (
    <View style={[styles.banner, alerte ? styles.bannerAlerte : styles.bannerInfo]}>
      <Icon name={icon} size={18} weight="bold" color={ink} />
      <Text variant="bodySmall" color={ink} style={styles.flex1}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: Radii.pill,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  bannerInfo: { backgroundColor: Colors.primarySubtle },
  bannerAlerte: { backgroundColor: Colors.warningSubtle },
});
