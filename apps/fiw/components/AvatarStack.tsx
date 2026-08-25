import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Strokes } from '@/constants/tokens';
import Text from '@/components/Text';

/** Pile d'avatars à initiale unique et teintes distinctes — annonce une
 *  disponibilité de prestataires à proximité (Figma searching). */
export default function AvatarStack({ items }: {
  items: { label: string; bg: string; fg: string }[];
}) {
  return (
    <View style={styles.avatarStack}>
      {items.map((it, i) => (
        <View key={it.label + i} style={[styles.stackAvatar, { backgroundColor: it.bg }, i > 0 && styles.stackOverlap]}>
          <Text variant="captionSemibold" color={it.fg}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  stackAvatar: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: Strokes.thick, borderColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  stackOverlap: { marginLeft: -12 },
});
