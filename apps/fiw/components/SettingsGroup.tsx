import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '@/constants/tokens';
import Text from '@/components/Text';

type Props = {
  /** Label de section en capitales, au-dessus du groupe. */
  title?: string;
  /** Note discrète sous le groupe (explication d'une rubrique). */
  footnote?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Groupe de réglages : des `SettingsRow` posées à même la page, séparées par un
 *  filet 1 px de bord à bord, avec un label de section et une note optionnelle.
 *
 *  **Pas de carte.** Une rangée de réglage n'est pas un objet, c'est une porte
 *  vers un écran — elle n'a pas d'état à représenter, donc rien à encadrer. Les
 *  cartes restent aux objets (un moyen de paiement, une gamme, un reçu). C'est
 *  aussi la géométrie de la sidebar (`MenuDrawer`), qui est la même nature de
 *  liste, et l'idiome natif des réglages sur Android — la plateforme des Clients
 *  visés. Décidé en rendant, le 11 août 2026 (todo P5). */
export default function SettingsGroup({ title, footnote, children, style }: Props) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[styles.wrap, style]}>
      {title ? (
        // En-tête renforcé : `label` (13 px medium) en gris secondaire plutôt que
        // `caption` (11 px regular) en tertiaire. Sans carte, c'est lui qui porte
        // la coupure entre deux sections — un titre trop léger et les groupes se
        // suivent sans qu'on voie où l'un finit.
        <Text variant="label" color={Colors.textSecondary} style={styles.title}>{title}</Text>
      ) : null}

      <View style={styles.rows}>
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
  wrap: { marginBottom: 28 },
  title: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  // Le retrait annule la gouttière de page : les filets filent d'un bord à
  // l'autre de l'écran, comme ceux de la sidebar. Les rangées portent la
  // gouttière dans leur propre padding, si bien que leur texte reste aligné
  // sous le titre de section.
  rows: { marginHorizontal: -20 },
  sep: { height: 1, backgroundColor: Colors.border },
  footnote: { marginTop: 8, lineHeight: 16 },
});
