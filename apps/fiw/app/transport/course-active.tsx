import React, { useEffect, useRef, useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Animated,
  SafeAreaView, ScrollView, PanResponder
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import LeafletMap from '@/components/LeafletMap';
import { Handle, sheetSurface } from '@/components/Sheet';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import Avatar from '@/components/Avatar';
import { Colors, Radii, Poppins } from '@/constants/tokens';
import { DRIVER, MOTO_DRIVER, DAKAR_CENTER } from '@/constants/data';

type StepKey = 'en_route' | 'arrived' | 'in_progress' | 'finished';

const STEPS: { key: StepKey; label: string; duration: number }[] = [
  { key: 'en_route', label: 'En route vers vous', duration: 55000 },
  { key: 'arrived', label: 'Prestataire arrivé', duration: 12000 },
  { key: 'in_progress', label: 'Course en cours', duration: 60000 },
  { key: 'finished', label: 'Arrivée à destination', duration: 0 },
];

const DRIVER_START = { lat: 14.7100, lng: -17.4500 };
const GRACE_SECONDS = 3;

const SHEET_EXPANDED = 420;
const SHEET_PEEK = 160;
const SNAP_DOWN = SHEET_EXPANDED - SHEET_PEEK;

function getMapConfig(stepKey: StepKey, destLat: number, destLng: number) {
  switch (stepKey) {
    case 'en_route':
      return {
        center: {
          lat: (DRIVER_START.lat + DAKAR_CENTER.lat) / 2,
          lng: (DRIVER_START.lng + DAKAR_CENTER.lng) / 2,
        },
        zoom: 13,
        markers: [
          { lat: DAKAR_CENTER.lat, lng: DAKAR_CENTER.lng, type: 'origin' as const },
          { lat: DRIVER_START.lat, lng: DRIVER_START.lng, type: 'driver' as const },
        ],
        route: { from: DRIVER_START, to: DAKAR_CENTER, animateDuration: 54000 },
      };
    case 'arrived':
      return {
        center: DAKAR_CENTER,
        zoom: 16,
        markers: [
          { lat: DAKAR_CENTER.lat, lng: DAKAR_CENTER.lng, type: 'driver' as const },
        ],
        route: undefined,
      };
    case 'in_progress':
      return {
        center: {
          lat: (DAKAR_CENTER.lat + destLat) / 2,
          lng: (DAKAR_CENTER.lng + destLng) / 2,
        },
        zoom: 13,
        markers: [
          { lat: DAKAR_CENTER.lat, lng: DAKAR_CENTER.lng, type: 'driver' as const },
          { lat: destLat, lng: destLng, type: 'destination' as const },
        ],
        route: { from: DAKAR_CENTER, to: { lat: destLat, lng: destLng }, animateDuration: 59000 },
      };
    default:
      return {
        center: DAKAR_CENTER,
        zoom: 14,
        markers: [],
        route: undefined,
      };
  }
}

export default function CourseActiveScreen() {
  const params = useLocalSearchParams<{
    destName: string; gammeLabel: string; gammeId: string;
    finalPrice: string; paymentId: string; selectedOption: string;
    destLat: string; destLng: string;
  }>();

  const driver = params.gammeId === 'moto' ? MOTO_DRIVER : DRIVER;
  const basePrice = parseInt(params.finalPrice || '1500');
  const destLat = parseFloat(params.destLat || String(DAKAR_CENTER.lat));
  const destLng = parseFloat(params.destLng || String(DAKAR_CENTER.lng));

  const [stepIndex, setStepIndex] = useState(0);
  const [waitSeconds, setWaitSeconds] = useState(0);

  const slideUp = useRef(new Animated.Value(SHEET_EXPANDED)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const dragYValue = useRef(0);
  const dragOffset = useRef(0);

  const step = STEPS[stepIndex];
  const waitFrais = waitSeconds > GRACE_SECONDS ? (waitSeconds - GRACE_SECONDS) * 100 : 0;
  const currentPrice = basePrice + waitFrais;

  const mapConfig = getMapConfig(step.key, destLat, destLng);

  useEffect(() => {
    const id = dragY.addListener(({ value }) => { dragYValue.current = value; });
    return () => dragY.removeListener(id);
  }, []);

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      dragOffset.current = dragYValue.current;
    },
    onPanResponderMove: (_, g) => {
      const newVal = Math.max(0, Math.min(SNAP_DOWN, dragOffset.current + g.dy));
      dragY.setValue(newVal);
    },
    onPanResponderRelease: (_, g) => {
      const current = dragYValue.current;
      const snapToExpanded = current < SNAP_DOWN / 2 || g.vy < -0.5;
      Animated.spring(dragY, {
        toValue: snapToExpanded ? 0 : SNAP_DOWN,
        tension: 65,
        friction: 11,
        useNativeDriver: false,
      }).start();
    },
  })).current;

  useEffect(() => {
    Animated.spring(slideUp, {
      toValue: 0, tension: 65, friction: 11, useNativeDriver: false,
    }).start();
  }, []);

  useEffect(() => {
    if (step.duration === 0) return;
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

  const sheetTranslate = Animated.add(slideUp, dragY);

  return (
    <View style={styles.container}>
      <LeafletMap
        key={`map-${step.key}`}
        center={mapConfig.center}
        zoom={mapConfig.zoom}
        markers={mapConfig.markers}
        route={mapConfig.route}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <Animated.View style={[sheetSurface, styles.bottomSheet, { transform: [{ translateY: sheetTranslate }] }]}>
          <View style={styles.handleArea} {...panResponder.panHandlers}>
            <Handle />
          </View>

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
        <Text color={Colors.primary} style={styles.etaTime}>4 min</Text>
        <Text variant="body" color={Colors.textSecondary}>avant l'arrivée</Text>
      </View>

      <View style={styles.driverRow}>
        <Avatar name={driver.name} size={56} bordered />
        <View style={styles.flex1}>
          <Text variant="heading2">{driver.name}</Text>
          <View style={styles.ratingRow}>
            <Icon name="star" size={14} weight="fill" color={Colors.warning} />
            <Text variant="bodySmall" style={styles.ratingVal}>{driver.rating}</Text>
            <Text variant="bodySmall" color={Colors.textSecondary}>· {driver.trips} courses</Text>
          </View>
        </View>
        <View style={styles.contactActions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Icon name="phone" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Icon name="chat" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.vehicleRow}>
        <VehicleItem label="Véhicule" value={`${driver.vehicle} ${driver.color}`} />
        <View style={styles.vehicleDivider} />
        <VehicleItem label="Plaque" value={driver.plate} />
        <View style={styles.vehicleDivider} />
        <VehicleItem label="ID" value={driver.id} />
      </View>

      <TouchableOpacity style={styles.shareBtn}>
        <Icon name="share" size={16} color={Colors.textPrimary} />
        <Text variant="label">Partager la course</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelLink} onPress={onCancel}>
        <Text variant="bodySmall" color={Colors.error} style={styles.cancelText}>Annuler (gratuit)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function VehicleItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.vehicleItem}>
      <Text variant="caption" color={Colors.textTertiary} style={styles.vehicleLabel}>{label}</Text>
      <Text variant="bodySmall" align="center" style={styles.vehicleValue}>{value}</Text>
    </View>
  );
}

function ArrivedSheet({ driver, waitSeconds, waitFrais }: {
  driver: typeof DRIVER; waitSeconds: number; waitFrais: number;
}) {
  const inGrace = waitSeconds <= GRACE_SECONDS;
  return (
    <View>
      <View style={styles.arrivedHeader}>
        <View style={styles.arrivedIcon}>
          <Icon name="pin" size={24} weight="fill" color={Colors.primary} />
        </View>
        <View>
          <Text variant="heading2">Prestataire arrivé</Text>
          <Text variant="bodySmall" color={Colors.textSecondary}>{driver.name} vous attend</Text>
        </View>
      </View>

      {inGrace ? (
        <View style={styles.graceCard}>
          <Text variant="label" color={Colors.primaryPressed}>Gratuit encore {GRACE_SECONDS - waitSeconds} s</Text>
        </View>
      ) : (
        <View style={styles.waitCard}>
          <Text variant="caption" color={Colors.warning} style={styles.waitTitle}>Frais d'attente</Text>
          <Text color={Colors.textPrimary} style={styles.waitAmount}>{waitFrais.toLocaleString()} F CFA</Text>
          <Text variant="caption" color={Colors.textSecondary}>100 F/min · {waitSeconds - GRACE_SECONDS}s écoulées</Text>
        </View>
      )}

      <View style={styles.driverMini}>
        <Avatar name={driver.name} size={40} />
        <View>
          <Text variant="bodySmall" style={styles.driverMiniName}>{driver.name}</Text>
          <Text variant="caption" color={Colors.textSecondary}>{driver.vehicle} · {driver.plate}</Text>
        </View>
      </View>
    </View>
  );
}

function InProgressSheet({ driver, currentPrice }: { driver: typeof DRIVER; currentPrice: number }) {
  return (
    <View>
      <View style={styles.driverMiniRow}>
        <Avatar name={driver.name} size={40} />
        <View style={styles.flex1}>
          <Text variant="bodySmall" style={styles.driverMiniName}>{driver.name}</Text>
          <Text variant="caption" color={Colors.textSecondary}>{driver.vehicle} · {driver.plate}</Text>
        </View>
        <Text variant="heading2" color={Colors.primary}>{currentPrice.toLocaleString()} F</Text>
      </View>

      <View style={styles.actionsRow}>
        <ActionTile icon="phone" label="Appeler" />
        <ActionTile icon="chat" label="Chat" />
        <ActionTile icon="share" label="Partager" />
        <ActionTile icon="sos" label="SOS" danger />
      </View>
    </View>
  );
}

function ActionTile({ icon, label, danger }: { icon: IconName; label: string; danger?: boolean }) {
  const color = danger ? Colors.error : Colors.primary;
  return (
    <TouchableOpacity style={[styles.iconBtn, danger && styles.sosBtn]}>
      <Icon name={icon} size={20} color={color} weight={danger ? 'fill' : 'bold'} />
      <Text variant="caption" color={danger ? Colors.error : Colors.textPrimary}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1 },
  flex1: { flex: 1 },
  bottomSheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: SHEET_EXPANDED,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  handleArea: {
    paddingTop: 12,
    paddingBottom: 16,
    alignItems: 'center',
  },
  eta: { alignItems: 'center', marginBottom: 20 },
  etaTime: { fontFamily: Poppins.bold, fontSize: 40, lineHeight: 48 },
  driverRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  ratingVal: { fontFamily: Poppins.semibold },
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
  vehicleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.bg,
    borderRadius: Radii.md,
    padding: 14,
    marginBottom: 14,
  },
  vehicleItem: { flex: 1, alignItems: 'center' },
  vehicleLabel: { textTransform: 'uppercase', marginBottom: 4 },
  vehicleValue: { fontFamily: Poppins.medium },
  vehicleDivider: { width: 1, backgroundColor: Colors.border },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  cancelLink: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontFamily: Poppins.medium },
  arrivedHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  arrivedIcon: {
    width: 48, height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  graceCard: {
    backgroundColor: Colors.primarySubtle,
    borderRadius: Radii.md,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  waitCard: {
    backgroundColor: Colors.warningSubtle,
    borderRadius: Radii.md,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  waitTitle: { textTransform: 'uppercase' },
  waitAmount: { fontFamily: Poppins.bold, fontSize: 26, lineHeight: 32, marginTop: 2 },
  driverMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.bg,
    borderRadius: Radii.md,
    padding: 12,
  },
  driverMiniName: { fontFamily: Poppins.semibold },
  driverMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionsRow: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    backgroundColor: Colors.bg,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sosBtn: { borderColor: Colors.error, backgroundColor: Colors.errorSubtle },
});
