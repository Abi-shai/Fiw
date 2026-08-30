import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Logo from '@/components/Logo';
import { Colors, Motion } from '@/constants/tokens';

const { width } = Dimensions.get('window');

/** Écran de chargement de marque, affiché à l'ouverture de l'app (Fiw client).
 *  Fond bleu marque plein écran + logo centré, avec une entrée douce. Le carré
 *  bleu du logo se fond dans le fond → seul le monogramme « ressort ». */
export default function BrandSplash() {
  const scale = useRef(new Animated.Value(0.86)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      // Le monogramme de marque est LE cas que « Spring for Hero Only » vise :
      // un actif de marque à forte valeur. Il prend donc le `Spring Gentle`.
      Animated.spring(scale, { toValue: 1, ...Motion.spring.gentle, useNativeDriver: true }),
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
