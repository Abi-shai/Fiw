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
  /** Retrait du filet entre rangées : la distance entre le début de la rangée
   *  et son TEXTE, soit la tête + la gouttière 12 de `ListRow`. 34 pour une
   *  icône 22 (le défaut), 48 pour un `Medallion sm` 36, 54 pour un `Medallion`
   *  42, 60 pour un `Avatar` 48, 68 pour un `PayLogo` 56. Même dans une
   *  feuille : la règle « pleine largeur en feuille » est abandonnée le
   *  29 septembre 2026 (style guide, « La liste du Menu fait référence »).
   *
   *  _Changé le 29 septembre 2026._ Le défaut était 50, soit 16 + 22 + 12 : il
   *  comptait un padding 16 que `ListRow` n'a pas — ces 16 sont ceux du contenu
   *  de la liste (la carte), qui décale déjà les filets autant que les rangées.
   *  Tous les filets partaient donc 16 à droite du texte (mesuré sur le Menu :
   *  filet à 70 du bord, titre à 54). La maquette Figma avait la même erreur,
   *  corrigée le même jour. */
  inset?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Conteneur de rangées (Figma `List`) : libellé de section, rangées séparées
 * par un `Divider`, note de bas de liste. Remplace `SettingsGroup`.
 *
 * **Le filet part sous le texte et s'arrête où s'arrêtent les rangées** — à la
 * gouttière de la page en `plat`, au padding de la carte en `carte`. C'est la
 * liste du Menu, arrêtée le 29 septembre 2026 et étendue à toute l'app. Le prop
 * `bleed`, qui faisait déborder une liste à plat jusqu'aux bords de l'écran pour
 * que ses filets y filent, est retiré avec la règle « filet de bord à bord ».
 */
export default function List({
  title, footnote, style_ = 'carte', inset = 34, children, style,
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
      <View style={plat ? null : styles.card}>
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
