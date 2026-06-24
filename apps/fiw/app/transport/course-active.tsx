import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView, ScrollView
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import LeafletMap from '@/components/LeafletMap';
import { Colors } from '@/constants/colors';
import { DRIVER, MOTO_DRIVER, DAKAR_CENTER } from '@/constants/data';

type StepKey = 'en_route' | 'arrived' | 'in_progress' | 'finished';

const STEPS: { key: StepKey; label: string; emoji: string; duration: number }[] = [
  { key: 'en_route', label: 'En route vers vous', emoji: '🚗', duration: 5000 },
  { key: 'arrived', label: 'Prestataire arrivé', emoji: '📍', duration: 6000 },
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

const GRACE_SECONDS = 3;

export default function CourseActiveScreen() {
  const params = useLocalSearchParams<{
    destName: string; gammeLabel: string; gammeId: string;
    finalPrice: string; paymentId: string; selectedOption: string;
  }>();

  const driver = params.gammeId === 'moto' ? MOTO_DRIVER : DRIVER;
  const basePrice = parseInt(params.finalPrice || '1500');

  const [stepIndex, setStepIndex] = useState(0);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const [driverPos, setDriverPos] = useState(DRIVER_PATH[0]);
  const slideUp = useRef(new Animated.Value(400)).current;
  const barAnim = useRef(new Animated.Value(0)).current;

  const step = STEPS[stepIndex];
  const waitFrais = waitSeconds > GRACE_SECONDS ? (waitSeconds - GRACE_SECONDS) * 100 : 0;
  const currentPrice = basePrice + waitFrais;

  useEffect(() => {
    Animated.spring(slideUp, {
      toValue: 0, tension: 65, friction: 11, useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
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
    let timer: ReturnType<typeof setInterval>;
    if (step.key === 'arrived') {
      timer = setInterval(() => setWaitSeconds((s) => s + 1), 1000);
    } else {
      setWaitSeconds(0);
    }
    return () => clearInterval(timer);
  }, [stepIndex]);

  useEffect(() => {
    if (step.key === 'finished') {
      setTimeout(() => {
        router.replace({
          pathname: '/transport/cloture',
          params: {
            destName: params.destName,
            gammeLabel: params.gammeLabel,
            gammeId: params.gammeId,
            finalPrice: currentPrice,
            paymentId: params.paymentId,
            selectedOption: params.selectedOption,
            waitFrais,
          },
        });
      }, 1200);
    }
  }, [stepIndex]);

  const skipStep = () => {
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };

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
          {step.duration > 0 && (
            <View style={styles.progressBar}>
              <Animated.View
                style={[styles.progressFill, {
                  width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                }]}
              />
            </View>
          )}
        </View>

        {step.key !== 'finished' && (
          <TouchableOpacity style={styles.skipBtn} onPress={skipStep}>
            <Text style={styles.skipText}>⏭ Étape suivante (facilitateur)</Text>
          </TouchableOpacity>
        )}

        <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideUp }] }]}>
          {step.key === 'en_route' && (
            <EnRouteSheet driver={driver} onCancel={() => router.replace('/home')} />
          )}
          {step.key === 'arrived' && (
            <ArrivedSheet driver={driver} waitSeconds={waitSeconds} waitFrais={waitFrais} />
          )}
          {step.key === 'in_progress' && (
            <InProgressSheet driver={driver} currentPrice={currentPrice} />
          )}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

function EnRouteSheet({ driver, onCancel }: { driver: typeof DRIVER; onCancel: () => void }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.eta}>
        <Text style={styles.etaTime}>4 min</Text>
        <Text style={styles.etaLabel}>avant l'arrivée</Text>
      </View>

      <View style={styles.driverRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>{driver.emoji}</Text>
        </View>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{driver.name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.ratingVal}>{driver.rating}</Text>
            <Text style={styles.tripCount}>· {driver.trips} courses</Text>
          </View>
        </View>
        <View style={styles.contactActions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>📞</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>💬</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.vehicleRow}>
        <View style={styles.vehicleItem}>
          <Text style={styles.vehicleLabel}>Véhicule</Text>
          <Text style={styles.vehicleValue}>{driver.vehicle} {driver.color}</Text>
        </View>
        <View style={styles.vehicleDivider} />
        <View style={styles.vehicleItem}>
          <Text style={styles.vehicleLabel}>Plaque</Text>
          <Text style={styles.vehicleValue}>{driver.plate}</Text>
        </View>
        <View style={styles.vehicleDivider} />
        <View style={styles.vehicleItem}>
          <Text style={styles.vehicleLabel}>ID</Text>
          <Text style={styles.vehicleValue}>{driver.id}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.shareBtn}>
        <Text style={styles.shareIcon}>📤</Text>
        <Text style={styles.shareBtnText}>Partager la course</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelLink} onPress={onCancel}>
        <Text style={styles.cancelText}>Annuler (gratuit)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function ArrivedSheet({ driver, waitSeconds, waitFrais }: {
  driver: typeof DRIVER; waitSeconds: number; waitFrais: number;
}) {
  const inGrace = waitSeconds <= GRACE_SECONDS;
  return (
    <View>
      <View style={styles.arrivedHeader}>
        <Text style={styles.arrivedEmoji}>📍</Text>
        <View>
          <Text style={styles.arrivedTitle}>Prestataire arrivé</Text>
          <Text style={styles.arrivedSub}>{driver.name} vous attend</Text>
        </View>
      </View>

      {inGrace ? (
        <View style={styles.graceCard}>
          <Text style={styles.graceText}>Gratuit encore {GRACE_SECONDS - waitSeconds} s</Text>
        </View>
      ) : (
        <View style={styles.waitCard}>
          <Text style={styles.waitTitle}>Frais d'attente</Text>
          <Text style={styles.waitAmount}>{waitFrais.toLocaleString()} F CFA</Text>
          <Text style={styles.waitSub}>100 F/min · {waitSeconds - GRACE_SECONDS}s écoulées</Text>
        </View>
      )}

      <View style={styles.driverMini}>
        <View style={styles.avatarSmall}>
          <Text style={styles.avatarSmallEmoji}>{driver.emoji}</Text>
        </View>
        <Text style={styles.driverMiniName}>{driver.name}</Text>
        <Text style={styles.driverMiniVehicle}>{driver.vehicle} · {driver.plate}</Text>
      </View>
    </View>
  );
}

function InProgressSheet({ driver, currentPrice }: { driver: typeof DRIVER; currentPrice: number }) {
  return (
    <View>
      <View style={styles.driverMiniRow}>
        <View style={styles.avatarSmall}>
          <Text style={styles.avatarSmallEmoji}>{driver.emoji}</Text>
        </View>
        <View style={styles.driverMiniInfo}>
          <Text style={styles.driverMiniName}>{driver.name}</Text>
          <Text style={styles.driverMiniVehicleInline}>{driver.vehicle} · {driver.plate}</Text>
        </View>
        <Text style={styles.driverMiniPrice}>{currentPrice.toLocaleString()} F</Text>
      </View>

      <View style={styles.actionsRow}>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1 },
  topCard: {
    margin: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  statusEmoji: { fontSize: 22 },
  statusLabel: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  progressBar: { height: 4, borderRadius: 2, backgroundColor: Colors.border, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  skipBtn: {
    position: 'absolute',
    top: 80, right: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: { color: Colors.surface, fontSize: 12, fontWeight: '600' },
  bottomSheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
    maxHeight: '60%',
  },
  eta: { alignItems: 'center', marginBottom: 20 },
  etaTime: { fontSize: 40, fontWeight: '800', color: Colors.primary },
  etaLabel: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  driverRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  avatar: {
    width: 56, height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarEmoji: { fontSize: 28 },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  star: { color: Colors.warning, fontSize: 14 },
  ratingVal: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  tripCount: { fontSize: 13, color: Colors.textSecondary },
  contactActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: { fontSize: 18 },
  vehicleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.bg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  vehicleItem: { flex: 1, alignItems: 'center' },
  vehicleLabel: { fontSize: 11, color: Colors.textTertiary, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  vehicleValue: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
  vehicleDivider: { width: 1, backgroundColor: Colors.border },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  shareIcon: { fontSize: 16 },
  shareBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  cancelLink: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, color: Colors.error, fontWeight: '600' },
  arrivedHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  arrivedEmoji: { fontSize: 36 },
  arrivedTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  arrivedSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  graceCard: {
    backgroundColor: Colors.primarySubtle,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  graceText: { fontSize: 14, fontWeight: '600', color: Colors.primaryPressed },
  waitCard: {
    backgroundColor: Colors.warningSubtle,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  waitTitle: { fontSize: 12, fontWeight: '600', color: Colors.warning },
  waitAmount: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, marginTop: 2 },
  waitSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  driverMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.bg,
    borderRadius: 12,
    padding: 12,
  },
  avatarSmall: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSmallEmoji: { fontSize: 20 },
  driverMiniName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  driverMiniVehicle: { fontSize: 12, color: Colors.textSecondary },
  driverMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  driverMiniInfo: { flex: 1 },
  driverMiniVehicleInline: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  driverMiniPrice: { fontSize: 17, fontWeight: '700', color: Colors.primary },
  actionsRow: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    backgroundColor: Colors.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sosBtn: { borderColor: Colors.error, backgroundColor: Colors.errorSubtle },
  iconBtnEmoji: { fontSize: 20 },
  iconBtnLabel: { fontSize: 11, fontWeight: '600', color: Colors.textPrimary },
});
