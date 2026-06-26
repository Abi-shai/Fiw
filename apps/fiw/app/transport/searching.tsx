import React, { useEffect, useRef, useState } from 'react';
import {
  View, StyleSheet, Animated, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import LeafletMap from '@/components/LeafletMap';
import Text from '@/components/Text';
import Button from '@/components/Button';
import RapprochementChoice, { type OptId } from '@/components/RapprochementChoice';
import { Handle, sheetSurface } from '@/components/Sheet';
import { Colors, Poppins } from '@/constants/tokens';
import { DAKAR_CENTER, FRAIS_RAPPROCHEMENT } from '@/constants/data';

// Phases : on cherche un chauffeur → s'il n'y en a pas tout près, on propose
// le choix frais de rapprochement → mise en relation → course active.
type Phase = 'searching' | 'choice' | 'matching';

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/[\s  ]/g, '.');

export default function SearchingScreen() {
  const params = useLocalSearchParams<{
    destName: string; gammePrice: string; gammeId: string; gammeLabel: string;
    paymentId: string; destLat: string; destLng: string;
  }>();

  const base = parseInt(params.gammePrice || '0', 10);
  const frais = FRAIS_RAPPROCHEMENT;

  const [phase, setPhase] = useState<Phase>('searching');
  const [option, setOption] = useState<OptId>('A');
  const finalPrice = option === 'B' ? base + frais : base;

  const dotOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, { toValue: 0.25, duration: 700, useNativeDriver: true }),
        Animated.timing(dotOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();

    // Proto : on simule l'absence de chauffeur tout près → on présente le choix.
    const timer = setTimeout(() => setPhase('choice'), 3500);
    return () => clearTimeout(timer);
  }, []);

  // Choix validé → mise en relation puis course active.
  const proceed = () => {
    Haptics.selectionAsync();
    setPhase('matching');
    setTimeout(() => {
      router.replace({
        pathname: '/transport/course-active',
        params: { ...params, selectedOption: option, finalPrice: String(finalPrice) },
      });
    }, 2400);
  };

  const cancel = () => router.replace('/home');

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
        <View style={[sheetSurface, styles.bottomCard]}>
          <Handle style={styles.handle} />

          {phase === 'choice' ? (
            <>
              <Text variant="heading2">Pas de chauffeur tout près</Text>
              <Text variant="bodySmall" color={Colors.textSecondary} style={styles.choiceSub}>
                Choisissez comment être pris en charge :
              </Text>

              <RapprochementChoice base={base} frais={frais} value={option} onChange={setOption} />

              <Button label="Continuer" onPress={proceed} style={styles.cta} />
              <TouchableOpacity style={styles.cancelBtn} onPress={cancel} activeOpacity={0.7}>
                <Text variant="label" color={Colors.error}>Annuler</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.statusRow}>
                <Animated.View style={[styles.dot, { opacity: dotOpacity }]} />
                <Text variant="heading2">
                  {phase === 'matching' ? 'Mise en relation…' : 'Recherche en cours…'}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.tripRow}>
                <View style={styles.destDot} />
                <Text variant="body" style={styles.destName} numberOfLines={1}>{params.destName}</Text>
                <Text variant="body" style={styles.price}>
                  {fmt(phase === 'matching' ? finalPrice : base)} F
                </Text>
              </View>

              {phase === 'searching' && (
                <TouchableOpacity style={styles.cancelBtn} onPress={cancel} activeOpacity={0.7}>
                  <Text variant="label" color={Colors.error}>Annuler</Text>
                </TouchableOpacity>
              )}
            </>
          )}
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

  // Phase choix frais de rapprochement
  choiceSub: { marginTop: 4, marginBottom: 16 },
  cta: { marginTop: 16 },

  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
});
