import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function RechercheScreen() {
  const { nom, destination } = useLocalSearchParams<{ nom: string; destination: string }>();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [dots, setDots] = useState('');

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();

    const dotsInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 500);

    const findTimer = setTimeout(() => {
      router.replace({
        pathname: '/commander/en-cours',
        params: { nom, destination },
      });
    }, 3000);

    return () => {
      clearInterval(dotsInterval);
      clearTimeout(findTimer);
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.innerCircle}>
            <Text style={styles.icon}>🔍</Text>
          </View>
        </Animated.View>

        <Text style={styles.title}>Recherche d'un chauffeur{dots}</Text>
        <Text style={styles.sub}>
          Pour {nom} → {destination}
        </Text>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.push('/(partenaire)/commander')}
        >
          <Text style={styles.cancelLabel}>Annuler la recherche</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 20,
  },
  pulseRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 36 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    minWidth: 280,
  },
  sub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  cancelBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cancelLabel: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
});
