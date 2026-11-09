import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Logo from '@/components/Logo';
import { Colors } from '@/constants/tokens';

const { width } = Dimensions.get('window');

/** Écran de chargement de marque, affiché à l'ouverture de l'app (Fiw client).
 *  Fond bleu marque plein écran + logo centré, avec une entrée douce. Le carré
 *  bleu du logo se fond dans le fond → seul le monogramme « ressort ». */
export default function BrandSplash() {
  const scale = useRef(new Animated.Value(0.86)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, stiffness: 150, damping: 18, mass: 1, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        <Logo size={Math.round(width * 0.36)} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
