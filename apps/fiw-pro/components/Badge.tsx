import React from 'react';
import { View, StyleSheet } from 'react-native';
import {Colors, Radii} from '@/constants/tokens';
import Icon from '@/components/Icon';
import Text from '@/components/Text';

/** Pastille qualitative (Figma 84:76 « Bien noté » / 84:80 « Suggéré »). */
export default function Badge({ variant, label }: {
  variant: 'bienNote' | 'suggere'; label?: string;
}) {
  if (variant === 'bienNote') {
    return (
      <View style={[styles.badge, styles.badgeSuccess]}>
        <Icon name="star" size={10} weight="fill" color={Colors.success} />
        <Text variant="captionSemibold" color={Colors.success}>{label ?? 'Bien noté'}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badge, styles.badgeInfo]}>
      <Text variant="captionSemibold" color={Colors.primary}>{label ?? 'Suggéré'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: Radii.pill,
    paddingVertical: 2, paddingHorizontal: 8,
  },
  badgeSuccess: { backgroundColor: Colors.successSubtle },
  badgeInfo: { backgroundColor: Colors.primarySubtle },
});
