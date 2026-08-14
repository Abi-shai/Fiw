import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Colors, Outfit } from '@/constants/tokens';
import Text from '@/components/Text';
import { FLAG_IMAGES } from '@/constants/flags';

/** Drapeau plat, bundlé en asset local (PNG flagcdn w80, rendu par `Image` natif
 *  — fiable, pas de parsing SVG). Repli sur un rectangle au code ISO si absent. */
export default function FlagChip({ code, width = 26 }: { code: string; width?: number }) {
  const height = Math.round(width * 0.72);
  const src = FLAG_IMAGES[code.toUpperCase()];
  return (
    <View style={[styles.base, { width, height }]}>
      {src ? (
        <Image source={src} style={{ width, height }} resizeMode="cover" />
      ) : (
        <Text color={Colors.textSecondary} style={styles.code}>{code}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    backgroundColor: Colors.track,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  code: { fontFamily: Outfit.semibold, fontSize: 10, letterSpacing: 0.3 },
});
