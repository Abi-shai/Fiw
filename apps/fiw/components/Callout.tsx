import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Radii, Strokes } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';

/** Encart d'information : bloc jaune de marque + icône, pour une règle que le
 *  Client doit vraiment lire. À distinguer du motif `infoRow` (icône + `caption`
 *  gris tertiaire, sans fond) qui, lui, ne fait que préciser un champ sans
 *  réclamer l'attention — voir `compte/profil.tsx`, `compte/numero.tsx`.
 *
 *  **Pourquoi jaune et pas bleu.** Répartition des rôles dans l'app : le **bleu
 *  marque un état** (sélectionné, actif, par défaut), le **jaune appelle
 *  l'attention** (pédagogie, règle à lire). Un encart bleu entrerait donc en
 *  concurrence avec les éléments qu'il surplombe — et un bleu clair posé sur le
 *  gris `bg` se fond, les deux étant trop proches. Le jaune tranche sur le gris
 *  et ne dit jamais « sélectionné ».
 *
 *  Fond `subtle` + liseré `100` (le palier clair, pas le plein) + **pastille
 *  `brandYellow` portant un glyphe sombre** — structure de la carte « Devenir
 *  prestataire » (`MenuDrawer`).
 *
 *  **Le jaune plein remplit, il ne dessine pas.** `brandYellow` sur
 *  `brandYellowSubtle` ne fait que 1.2:1 : un glyphe *tracé* en jaune plein est
 *  invisible. Il n'a donc pas à se détacher du fond — c'est le **glyphe sombre
 *  posé dessus** qui porte le contraste, ce qui laisse le jaune rester éclatant.
 *  Glyphe en `bold` (tracé) et non `fill` : `fill` ferait un disque plein dans la
 *  pastille, soit un disque sur un disque.
 *
 *  À réserver aux explications qui portent une **règle** ou une **affordance non
 *  devinable** (ex. « touchez une carte pour la passer par défaut »). Un écran
 *  qui en aligne plusieurs a un problème de hiérarchie, pas un besoin de
 *  callouts : au-delà d'un par écran, c'est le signe qu'il faut retravailler
 *  l'écran plutôt qu'ajouter un encart. */
export default function Callout({
  icon = 'info',
  children,
  style,
}: {
  icon?: IconName;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.box, style]}>
      <View style={styles.pastille}>
        <Icon name={icon} size={17} color={Colors.textPrimary} />
      </View>
      <Text variant="caption" color={Colors.textPrimary} style={styles.text}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.brandYellowSubtle,
    borderRadius: Radii.lg,
    borderWidth: Strokes.thin,
    borderColor: Colors.brandYellow100,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  pastille: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: Colors.brandYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Pas de `paddingTop` : le texte s'aligne par le haut sur la pastille. Le
  // centrer sur elle (`(30 - 17) / 2`) ne vaudrait que pour une ligne unique —
  // dès deux lignes, le bloc décroche visiblement vers le bas.
  text: { flex: 1 },
});
