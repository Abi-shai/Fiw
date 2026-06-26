import React, { useEffect, useRef } from 'react';
import {
  View, StyleSheet, Animated, TouchableOpacity, SafeAreaView
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import LeafletMap from '@/components/LeafletMap';
import Text from '@/components/Text';
import { Handle, sheetSurface } from '@/components/Sheet';
import { Colors, Poppins } from '@/constants/tokens';
import { DAKAR_CENTER } from '@/constants/data';

export default function SearchingScreen() {
  const params = useLocalSearchParams<{
    destName: string; finalPrice: string; gammeId: string; gammeLabel: string;
    selectedOption: string; paymentId: string; destLat: string; destLng: string;
  }>();

  const dotOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, { toValue: 0.25, duration: 700, useNativeDriver: true }),
        Animated.timing(dotOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();

    const delay = Math.floor(Math.random() * 4000) + 11000;
    const timer = setTimeout(() => {
      router.replace({ pathname: '/transport/course-active', params });
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const price = parseInt(params.finalPrice || '0').toLocaleString();

  return (
    <View style={styles.container}>
      <LeafletMap
        center={DAKAR_CENTER}
        zoom={14}
        markers={[{ lat: DAKAR_CENTER.lat, lng: DAKAR_CENTER.lng, type: 'origin' }]}
        searchingCars
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={[sheetSurface, styles.bottomCard]} pointerEvents="box-none">
          <Handle style={styles.handle} />

          <View style={styles.statusRow}>
            <Animated.View style={[styles.dot, { opacity: dotOpacity }]} />
            <Text variant="heading2">Recherche en cours…</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.tripRow}>
            <View style={styles.destDot} />
            <Text variant="body" style={styles.destName} numberOfLines={1}>{params.destName}</Text>
            <Text variant="body" style={styles.price}>{price} F</Text>
          </View>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.replace('/home')}
            activeOpacity={0.7}
          >
            <Text variant="label" color={Colors.error}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomCard: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  dot: {
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 16,
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  destDot: {
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
  },
  destName: { flex: 1 },
  price: { fontFamily: Poppins.semibold },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
});
