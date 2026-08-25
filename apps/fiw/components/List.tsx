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
   * `plat` — pas de carte : les rangées sont posées à même la page et séparées
   * d'un filet. **C'est le mode des réglages.** Une rangée de réglage n'est pas
   * un objet, c'est une porte vers un écran : elle n'a pas d'état à représenter,
   * donc rien à encadrer. Les cartes restent aux objets — un moyen de paiement,
   * une gamme, un reçu. (Décision du 11 août 2026, todo P5.)
   * `carte` — carte blanche à liseré, pour les listes posées dans une feuille.
   */
  style_?: 'carte' | 'plat';
  /** Retrait du filet entre rangées : 50 pour une tête d'icône 22, 76 pour un
   *  avatar de 48. Se déduit de ce qu'on met dans le `leading` des rangées. */
  inset?: number;
  /** Débord horizontal, en `plat` : annule la gouttière de page pour que les
   *  filets filent d'un bord à l'autre de l'écran, comme ceux de la sidebar. Les
   *  rangées reprennent la gouttière dans leur propre padding, si bien que leur
   *  texte reste aligné sous le titre de section. */
  bleed?: number;
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
  title, footnote, style_ = 'carte', inset = 50, bleed = 0, children, style,
}: Props) {
  const items = React.Children.toArray(children).filter(Boolean);
  const plat = style_ === 'plat';
  return (
    <View style={[plat ? styles.wrapPlat : styles.wrap, style]}>
      {title ? (
        // Sans carte, c'est le titre qui porte la coupure entre deux sections :
        // il passe en `label` secondaire. Un `caption` tertiaire y est trop
        // léger, les groupes se suivent sans qu'on voie où l'un finit.
        plat
          ? <Text variant="label" color={Colors.textSecondary} style={styles.title}>{title}</Text>
          : <Text variant="caption" color={Colors.textTertiary} style={styles.title}>{title}</Text>
      ) : null}
      <View style={[plat ? null : styles.card, bleed ? { marginHorizontal: -bleed } : null]}>
        {items.map((child, i) => (
          <View key={i}>
            {i > 0 ? <Divider inset={bleed ? inset + bleed : inset} /> : null}
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
  // En `plat`, la coupure entre deux groupes ne tient qu'à l'air : 28 au lieu
  // de 20, puisqu'il n'y a plus de liseré de carte pour la marquer.
  wrapPlat: { gap: 10, marginBottom: 28 },
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
