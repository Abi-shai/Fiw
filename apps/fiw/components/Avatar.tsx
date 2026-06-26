import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Poppins } from '@/constants/tokens';
import Text from '@/components/Text';

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

type Props = {
  name: string;
  size?: number;
  /** Cercle accentué avec bordure primaire (mise en avant du prestataire). */
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Avatar prestataire/client à initiales (remplace les emojis visage).
 *  Une vraie photo pourra être ajoutée plus tard sans changer l'API. */
export default function Avatar({ name, size = 48, bordered, style }: Props) {
  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
        bordered && styles.bordered,
        style,
      ]}
    >
      <Text color={Colors.primary} style={[styles.text, { fontSize: size * 0.38 }]}>
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bordered: { borderWidth: 2, borderColor: Colors.primary },
  text: { fontFamily: Poppins.semibold },
});
