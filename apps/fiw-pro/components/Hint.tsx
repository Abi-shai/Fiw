import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';

type Props = {
  /** Glyphe 14 en tête. Sans lui, la note est un simple paragraphe tertiaire. */
  icon?: IconName;
  /** Texte enrichi accepté : la note de `compte/numero` met un fragment en
   *  `captionSemibold` au milieu de sa phrase. */
  children: React.ReactNode;
  align?: 'left' | 'center';
  style?: StyleProp<ViewStyle>;
};

/**
 * Note d'aide — le petit texte tertiaire posé sous un champ, une carte ou une
 * liste. `caption`, gouttière 6, aligné en haut pour supporter deux lignes,
 * **aucun fond**.
 *
 * Huit sites la refaisaient à la main sous quatre noms (`infoRow`, `help`,
 * `hint`, `noteHint`) et deux traitements. Le traitement retenu est celui de
 * Compte, le plus répandu.
 *
 * Les trois notes du système, à ne pas confondre :
 * · `Hint` — précise, sans rien réclamer. Pas de fond.
 * · `Callout` — énonce une **règle** ou une affordance non devinable. Pastille jaune.
 * · `InfoBanner` — porte un fait qui change le prix ou le délai, dans une feuille.
 */
export default function Hint({ icon, children, align = 'left', style }: Props) {
  return (
    <View style={[styles.row, align === 'center' && styles.centered, style]}>
      {icon ? <Icon name={icon} size={14} color={Colors.textTertiary} /> : null}
      <Text
        variant="caption"
        color={Colors.textTertiary}
        align={align === 'center' ? 'center' : undefined}
        style={styles.text}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  centered: { justifyContent: 'center' },
  text: { flex: 1 },
});
