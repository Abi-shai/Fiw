import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/tokens';
import Icon from '@/components/Icon';
import Text from '@/components/Text';
import Avatar, { AVATAR_CARD } from '@/components/Avatar';

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/[\s\u202f\u00a0]/g, '.');

/** Forme du Prestataire telle que les composants de feuille la consomment. */
export type Prestataire = {
  name: string; vehicle: string; color: string; plate: string;
  rating: number; trips: number;
};

/** Rangée prestataire — avatar 64 + nom + note + chevron. C'est la `ListRow` du
 *  système avec un `Avatar` en tête : même gouttière 12, même padding vertical 8,
 *  même titre `bodyMedium`. Le liseré blanc de l'avatar (porté par `Avatar`
 *  lui-même) la détache du bloc véhicule qu'elle chevauche. */
export default function PrestataireRow({ prestataire, onPress }: {
  prestataire: Prestataire; onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.prestataireRow}
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={!onPress}
    >
      <Avatar name={prestataire.name} size={AVATAR_CARD} />
      <View style={styles.prestataireCol}>
        <Text variant="bodyMedium" numberOfLines={1}>{prestataire.name}</Text>
        <View style={styles.ratingRow}>
          <Icon name="star" size={14} weight="fill" color={Colors.warning} />
          <Text variant="bodySmallSemibold">{prestataire.rating}</Text>
          <Text variant="bodySmall" color={Colors.textSecondary}>· {fmt(prestataire.trips)} courses</Text>
        </View>
      </View>
      {onPress && <Icon name="chevronRight" size={18} color={Colors.textTertiary} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  prestataireRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  prestataireCol: { flex: 1, gap: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
