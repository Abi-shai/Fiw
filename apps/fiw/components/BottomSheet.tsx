import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, PanResponder, Pressable, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Handle, SheetHeader, sheetSurface } from '@/components/Sheet';

const SCREEN_H = Dimensions.get('window').height;
const SPRING = { stiffness: 280, damping: 28, mass: 1 };
const CLOSE_DY = 120;  // glissé vers le bas au-delà → fermeture
const CLOSE_V = 0.4;   // px/ms : flick vers le bas → fermeture

type Props = {
  /** Appelé une fois l'animation de sortie terminée (démontage). */
  onClose: () => void;
  /** Appelé dès le DÉBUT de la sortie — pour synchroniser une animation
   *  d'arrière-plan (ex. réduire la feuille de fond en même temps). */
  onCloseStart?: () => void;
  title?: string;
  /** Enfants, ou fonction recevant `close` pour fermer avec animation. */
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
};

/**
 * Feuille modale ancrée en bas : entrée par glissement, voile qui suit, fermeture
 * par glissé vers le bas (poignée/en-tête), par flick, ou par tap sur le voile.
 * À monter conditionnellement par le parent ; `onClose` est appelé en fin de
 * sortie. S'appuie sur `sheetSurface` + `Handle` (mêmes tokens que les autres
 * feuilles).
 */
export default function BottomSheet({ onClose, onCloseStart, title, children }: Props) {
  const insets = useSafeAreaInsets();
  const ty = useRef(new Animated.Value(SCREEN_H)).current;

  useEffect(() => {
    Animated.spring(ty, { toValue: 0, ...SPRING, useNativeDriver: true }).start();
  }, []);

  const close = () => {
    onCloseStart?.();
    Animated.timing(ty, { toValue: SCREEN_H, duration: 240, useNativeDriver: true })
      .start(() => onClose());
  };

  const scrim = ty.interpolate({ inputRange: [0, SCREEN_H], outputRange: [0.5, 0], extrapolate: 'clamp' });

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, g) => g.dy > 4 && Math.abs(g.dy) > Math.abs(g.dx),
    onPanResponderMove: (_, g) => { ty.setValue(Math.max(0, g.dy)); },
    onPanResponderRelease: (_, g) => {
      if (g.dy > CLOSE_DY || g.vy > CLOSE_V) close();
      else Animated.spring(ty, { toValue: 0, ...SPRING, useNativeDriver: true }).start();
    },
  })).current;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, { opacity: scrim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      <Animated.View
        style={[sheetSurface, styles.sheet, { paddingBottom: insets.bottom + 16, transform: [{ translateY: ty }] }]}
      >
        <View {...pan.panHandlers}>
          <View style={styles.handleArea}><Handle /></View>
          {title ? <SheetHeader title={title} onClose={close} /> : null}
        </View>

        {typeof children === 'function' ? children(close) : children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: { backgroundColor: '#000' },
  sheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  handleArea: { paddingTop: 6, paddingBottom: 12, alignItems: 'center' },
});
