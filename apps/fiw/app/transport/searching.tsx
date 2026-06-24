import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, SafeAreaView
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function SearchingScreen() {
  const params = useLocalSearchParams();
  const pulse = useRef(new Animated.Value(1)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    const animateRing = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(anim, { toValue: 1, duration: 1800, useNativeDriver: true }),
          ]),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    };

    animateRing(ring1, 0);
    animateRing(ring2, 900);

    const timer = setTimeout(() => {
      router.replace({ pathname: '/transport/driver-found', params });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const ringStyle = (anim: Animated.Value) => ({
    transform: [{ scale: Animated.add(1, Animated.multiply(anim, 1.5)) }],
    opacity: Animated.subtract(0.4, Animated.multiply(anim, 0.4)),
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.pulseContainer}>
          <Animated.View style={[styles.ring, ringStyle(ring1)]} />
          <Animated.View style={[styles.ring, ringStyle(ring2)]} />
          <Animated.View style={[styles.centerIcon, { transform: [{ scale: pulse }] }]}>
            <Text style={styles.centerEmoji}>🚗</Text>
          </Animated.View>
        </View>

        <Text style={styles.title}>Recherche en cours…</Text>
        <Text style={styles.subtitle}>
          Nous cherchons le meilleur prestataire{'\n'}près de vous à Dakar
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoEmoji}>📍</Text>
            <Text style={styles.infoLabel}>Votre position</Text>
            <Text style={styles.infoValue}>Détectée</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoEmoji}>🏁</Text>
            <Text style={styles.infoLabel}>Destination</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{params.destName as string}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.replace('/home')}>
        <Text style={styles.cancelText}>Annuler la recherche</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: Colors.white,
    justifyContent: 'space-between',
    paddingHorizontal: 24, paddingBottom: 40,
  },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pulseContainer: {
    width: 120, height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  ring: {
    position: 'absolute',
    width: 120, height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  centerIcon: {
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  centerEmoji: { fontSize: 36 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.black, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  infoRow: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    width: '100%',
  },
  infoItem: { flex: 1, alignItems: 'center', gap: 4 },
  infoEmoji: { fontSize: 20 },
  infoLabel: { fontSize: 11, color: Colors.textTertiary, fontWeight: '600', textTransform: 'uppercase' },
  infoValue: { fontSize: 14, fontWeight: '600', color: Colors.black },
  infoDivider: { width: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
  cancelBtn: { alignItems: 'center', paddingVertical: 14 },
  cancelText: { fontSize: 15, color: Colors.error, fontWeight: '600' },
});
