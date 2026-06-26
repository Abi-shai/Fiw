import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Colors, Poppins } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';

type Props = {
  /** Icône (atome Icon) affichée dans le cercle de gauche. */
  icon: IconName;
  title: string;
  subtitle?: string;
  /** Teinte le cercle d'icône avec l'accent primaire (lieu enregistré, action). */
  accent?: boolean;
  /** Icône de fin de ligne (ex. chevronRight). */
  trailing?: IconName;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Ligne de lieu réutilisable : cercle d'icône + titre + sous-titre.
 *  Utilisée pour les récents (accueil), les suggestions et les lieux
 *  enregistrés (itinéraire) afin d'unifier l'aspect et le comportement. */
export default function PlaceRow({ icon, title, subtitle, accent, trailing, onPress, style }: Props) {
  return (
    <TouchableOpacity
      style={[styles.row, style]}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.icon, accent && styles.iconAccent]}>
        <Icon name={icon} size={20} color={accent ? Colors.primary : Colors.textSecondary} />
      </View>
      <View style={styles.text}>
        <Text variant="body" style={styles.title}>{title}</Text>
        {subtitle ? <Text variant="bodySmall" color={Colors.textSecondary}>{subtitle}</Text> : null}
      </View>
      {trailing ? <Icon name={trailing} size={18} color={Colors.textTertiary} /> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 14,
  },
  icon: {
    width: 42, height: 42,
    borderRadius: 21,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconAccent: { backgroundColor: Colors.primarySubtle },
  text: { flex: 1 },
  title: { fontFamily: Poppins.medium },
});
