import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Colors, Radii } from '@/constants/tokens';
import Icon, { type IconName } from '@/components/Icon';

export type MedallionSize = 'md' | 'lg';
export type MedallionTon = 'neutre' | 'accent';

/** Empreintes du système — `md` 42 pour une rangée, `lg` 56 pour une carte. */
const BOX: Record<MedallionSize, number> = { md: 42, lg: 56 };
const GLYPH: Record<MedallionSize, number> = { md: 20, lg: 24 };

/**
 * Pastille ronde à icône posée en tête d'une rangée ou d'une carte (Figma
 * `Medallion`). Deux tons : `neutre` (fond `bg`, glyphe `textSecondary`) pour
 * une rangée ordinaire, `accent` (fond `primarySubtle`, glyphe `primary`) pour
 * un lieu enregistré ou une action.
 *
 * C'est la forme SYSTÈME du cercle d'icône : les écrans qui en dessinent un à la
 * main (tuiles de statistique, en-têtes d'état vide, listes d'étapes) doivent
 * passer par ici plutôt que d'inventer une septième taille.
 */
export default function Medallion({ icon, size = 'md', ton = 'neutre', style }: {
  icon: IconName;
  size?: MedallionSize;
  ton?: MedallionTon;
  style?: StyleProp<ViewStyle>;
}) {
  const box = BOX[size];
  return (
    <View
      style={[
        styles.base,
        { width: box, height: box },
        ton === 'accent' && styles.accent,
        style,
      ]}
    >
      <Icon
        name={icon}
        size={GLYPH[size]}
        color={ton === 'accent' ? Colors.primary : Colors.textSecondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.pill,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accent: { backgroundColor: Colors.primarySubtle },
});
