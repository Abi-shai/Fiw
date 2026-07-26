import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Radii } from '@/constants/tokens';
import Text from '@/components/Text';

type Props = {
  /** Label de section en capitales, au-dessus de la carte. */
  title?: string;
  /** Note discrète sous la carte (explication d'une rubrique). */
  footnote?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Carte de réglages : regroupe des `SettingsRow` avec séparateurs automatiques,
 *  label de section optionnel et note de bas de carte. Motif unanime du benchmark
 *  compte (Bolt / Careem / iOS Settings). */
export default function SettingsGroup({ title, footnote, children, style }: Props) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[styles.wrap, style]}>
      {title ? (
        <Text variant="caption" color={Colors.textTertiary} style={styles.title}>{title}</Text>
      ) : null}
      <View style={styles.card}>
        {items.map((child, i) => (
          <View key={i}>
            {i > 0 ? <View style={styles.sep} /> : null}
            {child}
          </View>
        ))}
      </View>
      {footnote ? (
        <Text variant="caption" color={Colors.textTertiary} style={styles.footnote}>{footnote}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  title: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    overflow: 'hidden',
  },
  // Séparateur inséré sous le label (icône 22 + gap 14 + padding 16 = 52).
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginLeft: 52 },
  footnote: { marginTop: 8, marginLeft: 4, lineHeight: 16 },
});
