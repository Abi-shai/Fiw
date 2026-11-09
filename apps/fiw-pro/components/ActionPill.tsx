import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import {Colors, Radii} from '@/constants/tokens';
import Icon, { type IconName } from '@/components/Icon';
import Text from '@/components/Text';

/** Pilule d'action neutre sur fond `track` — « J'arrive », « Modifier »
 *  (Figma 86:86). */
export default function ActionPill({ label, icon, onPress }: {
  label: string; icon?: IconName; onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.pill} onPress={onPress} activeOpacity={0.85} disabled={!onPress}>
      {icon && <Icon name={icon} size={16} weight="bold" color={Colors.textPrimary} />}
      <Text variant="buttonSm">{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.track,
    borderRadius: Radii.pill,
    paddingHorizontal: 12, paddingVertical: 8,
  },
});
