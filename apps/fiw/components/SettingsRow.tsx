import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Outfit } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';

type Props = {
  /** Glyphe de tête (style réglages : icône ligne, sans cercle). */
  icon?: IconName;
  label: string;
  /** Ligne secondaire sous le label. */
  subtitle?: string;
  /** Valeur alignée à droite (ex. « Wave · +1 »). */
  value?: string;
  /** Label rouge Error (déconnexion / suppression). */
  destructive?: boolean;
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
  icon, label, subtitle, value, destructive, right, chevron, onPress,
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
      {icon && <Icon name={icon} size={22} color={iconColor} />}
      <View style={styles.body}>
        <Text variant="body" color={labelColor} style={styles.label}>{label}</Text>
        {subtitle ? (
          <Text variant="caption" color={Colors.textTertiary} style={styles.subtitle}>{subtitle}</Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="bodySmall" color={Colors.textSecondary} style={styles.value} numberOfLines={1}>{value}</Text>
      ) : null}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  body: { flex: 1 },
  label: { fontFamily: Outfit.medium },
  subtitle: { marginTop: 2 },
  value: { marginRight: 4, maxWidth: 150 },
});
