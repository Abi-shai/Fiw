import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/tokens';

/** Barre de progression (Figma 84:84) — piste `track` h6, remplissage
 *  `primary`. `progress` (Animated.Value 0→1) anime la largeur ; sinon `value`
 *  statique. */
export default function ProgressBar({ progress, value = 0.6 }: {
  progress?: Animated.Value; value?: number;
}) {
  const width = progress
    ? progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
    : `${Math.round(value * 100)}%`;
  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, { width } as any]} />
    </View>
  );
}

const styles = StyleSheet.create({
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: Colors.track, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: Colors.primary },
});
