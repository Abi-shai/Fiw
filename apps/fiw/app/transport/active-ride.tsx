import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import LeafletMap from '@/components/LeafletMap';
import { Colors } from '@/constants/colors';
import { DRIVER, DAKAR_CENTER } from '@/constants/data';

const STEPS = [
  { key: 'en_route', label: 'En route vers vous', emoji: '🚗', duration: 5000 },
  { key: 'arrived', label: 'Prestataire arrivé', emoji: '📍', duration: 4000 },
  { key: 'waiting', label: 'Frais d\'attente en cours', emoji: '⏱️', duration: 4000 },
  { key: 'in_progress', label: 'Course en cours', emoji: '🏁', duration: 5000 },
  { key: 'finished', label: 'Arrivée à destination', emoji: '✅', duration: 0 },
];

const DRIVER_PATH = [
  { lat: 14.7100, lng: -17.4500 },
  { lat: 14.7050, lng: -17.4470 },
  { lat: 14.7010, lng: -17.4450 },
  { lat: 14.6980, lng: -17.4430 },
  { lat: DAKAR_CENTER.lat, lng: DAKAR_CENTER.lng },
];

export default function ActiveRideScreen() {
  const params = useLocalSearchParams<{ destName: string; finalPrice: string; gammeLabel: string }>();
  const [stepIndex, setStepIndex] = useState(0);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const [driverPos, setDriverPos] = useState(DRIVER_PATH[0]);
  const [showSkip, setShowSkip] = useState(false);
  const barAnim = useRef(new Animated.Value(0)).current;
  const webRef = useRef<any>(null);
  const stepRef = useRef(stepIndex);

  stepRef.current = stepIndex;
  const step = STEPS[stepIndex];

  useEffect(() => {
    setShowSkip(true);
    let pathIndex = 0;

    const moveDriver = setInterval(() => {
      if (pathIndex < DRIVER_PATH.length - 1) {
        pathIndex++;
        setDriverPos(DRIVER_PATH[pathIndex]);
      }
    }, 1200);

    return () => clearInterval(moveDriver);
  }, []);

  useEffect(() => {
    if (step.duration === 0) return;

    Animated.timing(barAnim, { toValue: 0, duration: 0, useNativeDriver: false }).start();
    Animated.timing(barAnim, { toValue: 1, duration: step.duration, useNativeDriver: false }).start();

    const timer = setTimeout(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, step.duration);

    return () => clearTimeout(timer);
  }, [stepIndex]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step.key === 'waiting') {
      timer = setInterval(() => setWaitSeconds((s) => s + 1), 1000);
    } else {
      setWaitSeconds(0);
    }
    return () => clearInterval(timer);
  }, [stepIndex]);

  useEffect(() => {
    if (step.key === 'finished') {
      setTimeout(() => {
        router.replace({ pathname: '/transport/receipt', params });
      }, 1500);
    }
  }, [stepIndex]);

  const skipStep = () => {
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const waitFrais = waitSeconds > 3 ? (waitSeconds - 3) * 100 : 0;
  const finalPrice = parseInt(params.finalPrice || '1500') + waitFrais;

  return (
    <View style={styles.container}>
      <LeafletMap
        center={DAKAR_CENTER}
        zoom={14}
        markers={[
          { lat: DAKAR_CENTER.lat, lng: DAKAR_CENTER.lng, type: 'origin' },
          { lat: driverPos.lat, lng: driverPos.lng, type: 'driver' },
        ]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusEmoji}>{step.emoji}</Text>
            <Text style={styles.statusLabel}>{step.label}</Text>
          </View>
          <View style={styles.progressBar}>
            <Animated.View
              style={[styles.progressFill, {
                width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              }]}
            />
          </View>
        </View>

        {step.key === 'waiting' && (
          <View style={styles.waitCard}>
            <Text style={styles.waitTitle}>Frais d'attente</Text>
            <Text style={styles.waitAmount}>{waitFrais.toLocaleString()} F CFA</Text>
            <Text style={styles.waitSub}>
              {waitSeconds <= 3 ? `Gratuit encore ${3 - waitSeconds}s` : `100 F/min · ${waitSeconds - 3}s écoulées`}
            </Text>
          </View>
        )}

        <View style={styles.bottomCard}>
          <View style={styles.driverMini}>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarSmallEmoji}>{DRIVER.emoji}</Text>
            </View>
            <View style={styles.driverMiniInfo}>
              <Text style={styles.driverMiniName}>{DRIVER.name}</Text>
              <Text style={styles.driverMiniVehicle}>{DRIVER.vehicle} · {DRIVER.plate}</Text>
            </View>
            <Text style={styles.driverMiniPrice}>{finalPrice.toLocaleString()} F</Text>
          </View>

          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.iconBtn}>
              <Text style={styles.iconBtnEmoji}>📞</Text>
              <Text style={styles.iconBtnLabel}>Appeler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Text style={styles.iconBtnEmoji}>💬</Text>
              <Text style={styles.iconBtnLabel}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Text style={styles.iconBtnEmoji}>📤</Text>
              <Text style={styles.iconBtnLabel}>Partager</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, styles.sosBtn]}>
              <Text style={styles.iconBtnEmoji}>🆘</Text>
              <Text style={[styles.iconBtnLabel, { color: Colors.error }]}>SOS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showSkip && step.key !== 'finished' && (
          <TouchableOpacity style={styles.skipBtn} onPress={skipStep}>
            <Text style={styles.skipText}>⏭ Étape suivante (facilitateur)</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1 },
  topCard: {
    margin: 12,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  statusEmoji: { fontSize: 22 },
  statusLabel: { fontSize: 16, fontWeight: '700', color: Colors.black, flex: 1 },
  progressBar: {
    height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  waitCard: {
    marginHorizontal: 12,
    backgroundColor: Colors.warningLight,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  waitTitle: { fontSize: 13, fontWeight: '600', color: Colors.warning, marginBottom: 4 },
  waitAmount: { fontSize: 24, fontWeight: '800', color: Colors.black },
  waitSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  bottomCard: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  driverMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarSmall: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSmallEmoji: { fontSize: 22 },
  driverMiniInfo: { flex: 1 },
  driverMiniName: { fontSize: 15, fontWeight: '700', color: Colors.black },
  driverMiniVehicle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  driverMiniPrice: { fontSize: 17, fontWeight: '700', color: Colors.primary },
  buttonsRow: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sosBtn: { borderColor: Colors.error, backgroundColor: '#FEF2F2' },
  iconBtnEmoji: { fontSize: 20 },
  iconBtnLabel: { fontSize: 11, fontWeight: '600', color: Colors.black },
  skipBtn: {
    position: 'absolute',
    top: 80, right: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: { color: Colors.white, fontSize: 12, fontWeight: '600' },
});
