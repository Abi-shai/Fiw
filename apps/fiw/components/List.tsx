import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Colors, Radii, SectionLabel, Strokes } from '@/constants/tokens';
import Text from '@/components/Text';
import Divider from '@/components/Divider';

type Props = {
  /** Libellé de section en capitales, au-dessus de la liste. */
  title?: string;
  /** Note discrète sous la liste (ce qu'une rubrique implique). */
  footnote?: string;
  /**
   * `carte` — les rangées sont posées dans une carte blanche à liseré (écrans
   * Compte). `plat` — pas de carte, les rangées coulent dans la page (feuilles,
   * listes de résultats).
   */
  style_?: 'carte' | 'plat';
  /** Retrait du filet entre rangées : 50 pour une tête d'icône 22, 76 pour un
   *  avatar de 48. Se déduit de ce qu'on met dans le `leading` des rangées. */
  inset?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Conteneur de rangées (Figma `List`) : libellé de section, rangées séparées
 * par un `Divider`, note de bas de liste. Remplace `SettingsGroup` — même motif,
 * mais il accorde enfin son retrait de filet avec la géométrie réelle de
 * `ListRow` (16 de padding + 22 d'icône + 12 de gouttière = 50).
 */
export default function List({
  title, footnote, style_ = 'carte', inset = 50, children, style,
}: Props) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[styles.wrap, style]}>
      {title ? (
        <Text variant="caption" color={Colors.textTertiary} style={styles.title}>{title}</Text>
      ) : null}
      <View style={style_ === 'carte' ? styles.card : undefined}>
        {items.map((child, i) => (
          <View key={i}>
            {i > 0 ? <Divider inset={inset} /> : null}
            {child}
          </View>
        ))}
      </View>
      {footnote ? (
        <Text variant="bodySmall" color={Colors.textTertiary} style={styles.footnote}>{footnote}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginBottom: 20 },
  title: { ...SectionLabel },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: Strokes.thin,
    borderColor: Colors.borderSubtle,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  footnote: {},
});
