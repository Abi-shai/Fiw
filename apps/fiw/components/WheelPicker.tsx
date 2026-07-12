import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Poppins } from '@/constants/tokens';

// Géométrie partagée avec les parents (bande de sélection, hauteur de zone).
export const WHEEL_ITEM_H = 44;
export const WHEEL_VISIBLE = 5;
export const WHEEL_H = WHEEL_ITEM_H * WHEEL_VISIBLE;

type Props = {
  items: string[];
  /** Index sélectionné (contrôlé). */
  index: number;
  onChange: (i: number) => void;
  width?: number;
};

/**
 * Colonne de roue (réf. benchmark : Lyft « Schedule a ride », Opal, WHOOP) —
 * snap par item, fondu + réduction des valeurs éloignées du centre, tick
 * haptique au défilement. La bande de sélection est dessinée par le PARENT
 * (une seule bande traversant toutes les colonnes, façon Lyft) via
 * `WHEEL_ITEM_H`/`WHEEL_H`. Réutilisable : heure de livraison, départ Yobanté…
 */
export default function WheelPicker({ items, index, onChange, width = 72 }: Props) {
  const scrollY = useRef(new Animated.Value(index * WHEEL_ITEM_H)).current;
  const scrollRef = useRef<ScrollView>(null);
  const lastTick = useRef(index);

  // Position initiale (contentOffset n'est pas fiable sur Android).
  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: index * WHEEL_ITEM_H, animated: false });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clampIndex = (y: number) =>
    Math.min(items.length - 1, Math.max(0, Math.round(y / WHEEL_ITEM_H)));

  return (
    <View style={{ height: WHEEL_H, width }}>
      <Animated.ScrollView
        ref={scrollRef as any}
        showsVerticalScrollIndicator={false}
        snapToInterval={WHEEL_ITEM_H}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
            listener: (e: { nativeEvent: { contentOffset: { y: number } } }) => {
              const i = clampIndex(e.nativeEvent.contentOffset.y);
              if (i !== lastTick.current) {
                lastTick.current = i;
                Haptics.selectionAsync();
              }
            },
          },
        )}
        onMomentumScrollEnd={(e) => onChange(clampIndex(e.nativeEvent.contentOffset.y))}
        contentContainerStyle={{ paddingVertical: (WHEEL_H - WHEEL_ITEM_H) / 2 }}
      >
        {items.map((item, i) => {
          const inputRange = [(i - 2) * WHEEL_ITEM_H, i * WHEEL_ITEM_H, (i + 2) * WHEEL_ITEM_H];
          const opacity = scrollY.interpolate({ inputRange, outputRange: [0.22, 1, 0.22], extrapolate: 'clamp' });
          const scale = scrollY.interpolate({ inputRange, outputRange: [0.82, 1, 0.82], extrapolate: 'clamp' });
          return (
            <Animated.View key={`${item}-${i}`} style={[styles.item, { opacity, transform: [{ scale }] }]}>
              <Animated.Text style={styles.value}>{item}</Animated.Text>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    height: WHEEL_ITEM_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontFamily: Poppins.semibold,
    fontSize: 22,
    lineHeight: 30,
    color: Colors.textPrimary,
  },
});
