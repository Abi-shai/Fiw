import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Outfit } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';

type Props = {
  /** Glyphe de tête (style réglages : icône ligne, sans cercle). */
  icon?: IconName;
  label: string;
  /** Ligne secondaire sous le label : c'est **le seul** emplacement d'un résumé.
   *  Il n'y a volontairement pas de valeur alignée à droite — elle disputait sa
   *  largeur au label et le faisait passer à la ligne, d'où des rangées de
   *  hauteurs inégales (cf. style-guide, « Composants & organismes »). */
  subtitle?: string;
  /** Label rouge Error (déconnexion / suppression). */
  destructive?: boolean;
  /** Rangée d'objet : le glyphe passe en bleu marque dans une pastille
   *  `primary-subtle`, au lieu de l'icône ligne nue des rangées de réglage.
   *  Pour une liste d'ÉLÉMENTS que le Client possède (un contact de confiance,
   *  un lieu) et l'action qui en crée un — pas pour une porte vers un écran.
   *  Se met alors sur **toutes** les rangées de la liste : c'est la liste
   *  entière qui change de grammaire, pas une rangée qui se distingue.
   *  Même pastille que `PlaceRow` (42 px), pour que les deux écrans se lisent
   *  comme un seul motif. */
  accent?: boolean;
  /** Élément à droite (Switch, badge…). Prioritaire sur le chevron. */
  right?: React.ReactNode;
  /** Force l'affichage du chevron (défaut : présent si `onPress` et pas de `right`). */
  chevron?: boolean;
  onPress?: () => void;
};

/** Rangée de réglage réutilisable (page Compte et sous-écrans). Icône ligne +
 *  label + valeur/contrôle à droite. À composer dans un `SettingsGroup`.
 *
 *  Volontairement pauvre : c'est une rangée de *réglage*, pas un support à tout
 *  faire. Un objet plus riche (logo de service, badge d'état, action sur une
 *  seconde ligne — voir la carte de `compte/paiement.tsx`) mérite son propre
 *  composant plutôt que des slots ajoutés ici un par un. */
export default function SettingsRow({
  icon, label, subtitle, destructive, accent, right, chevron, onPress,
}: Props) {
  const showChevron = chevron ?? (!!onPress && !right);
  const labelColor = destructive ? Colors.error : Colors.textPrimary;
  const iconColor = destructive ? Colors.error : Colors.textSecondary;

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.6}
      onPress={onPress}
      disabled={!onPress}
    >
      {icon && (accent ? (
        <View style={styles.accentIcon}>
          <Icon name={icon} size={20} color={Colors.primary} />
        </View>
      ) : (
        <Icon name={icon} size={22} color={iconColor} />
      ))}
      <View style={styles.body}>
        <Text variant="body" color={labelColor} style={styles.label}>{label}</Text>
        {subtitle ? (
          // Une seule ligne : c'est ce qui garantit que toutes les rangées d'une
          // carte font la même hauteur. Un résumé qui déborde se tronque, il ne
          // déforme pas la liste.
          <Text variant="caption" color={Colors.textTertiary} style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? (showChevron ? <Icon name="chevronRight" size={18} color={Colors.textTertiary} /> : null)}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 56,
    // 20 = gouttière de page : sans carte pour la porter, c'est la rangée qui
    // tient l'alignement du contenu sous le titre de section.
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  // Pastille des rangées d'objet. Géométrie de `PlaceRow` (42 px, glyphe 20,
  // gap 14) : les Lieux enregistrés et les Contacts de confiance sont deux
  // listes de la même nature, elles doivent se lire pareil. Le label est donc
  // décalé par rapport à un groupe de réglages voisin — c'est la marque de la
  // liste, et à l'intérieur d'une liste rien n'est désaligné.
  accentIcon: {
    width: 42, height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  label: { fontFamily: Outfit.medium },
  subtitle: { marginTop: 2 },
});
