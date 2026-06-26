import React from 'react';
import { Animated, StyleSheet } from 'react-native';

/** Voile sombre derrière une bottom sheet. S'assombrit à mesure que la feuille
 *  monte vers les niveaux hauts (medium → full) pour concentrer l'attention sur
 *  la feuille et atténuer la carte/le fond. `opacity` est piloté par la position
 *  de la feuille (interpolation). `pointerEvents="none"` : purement visuel, ne
 *  bloque jamais les interactions avec le fond. */
export default function Scrim({ opacity }: { opacity: Animated.AnimatedInterpolation<number> }) {
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.scrim, { opacity }]} />;
}

const styles = StyleSheet.create({
  scrim: { backgroundColor: '#000' },
});
