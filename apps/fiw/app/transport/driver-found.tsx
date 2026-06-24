import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/colors';
import { DRIVER } from '@/constants/data';
import Button from '@/components/Button';

export default function DriverFoundScreen() {
  const params = useLocalSearchParams();
  const slideUp = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.spring(slideUp, {
      toValue: 0, tension: 65, friction: 11, useNativeDriver: true,
    }).start();
  }, []);

  const startRide = () => {
    router.replace({ pathname: '/transport/active-ride', params });
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapEmoji}>🗺️</Text>
        <Text style={styles.mapText}>Prestataire en route vers vous</Text>
      </View>

      <Animated.View style={[styles.card, { transform: [{ translateY: slideUp }] }]}>
        <View style={styles.eta}>
          <Text style={styles.etaTime}>4 min</Text>
          <Text style={styles.etaLabel}>avant l'arrivée</Text>
        </View>

        <View style={styles.driverRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>{DRIVER.emoji}</Text>
          </View>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{DRIVER.name}</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.star}>★</Text>
              <Text style={styles.ratingVal}>{DRIVER.rating}</Text>
              <Text style={styles.tripCount}>· {DRIVER.trips} courses</Text>
            </View>
          </View>
          <View style={styles.actions}>
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
            <Text style={styles.vehicleValue}>{DRIVER.vehicle} {DRIVER.color}</Text>
          </View>
          <View style={styles.vehicleDivider} />
          <View style={styles.vehicleItem}>
            <Text style={styles.vehicleLabel}>Plaque</Text>
            <Text style={styles.vehicleValue}>{DRIVER.plate}</Text>
          </View>
          <View style={styles.vehicleDivider} />
          <View style={styles.vehicleItem}>
            <Text style={styles.vehicleLabel}>ID</Text>
            <Text style={styles.vehicleValue}>{DRIVER.id}</Text>
          </View>
        </View>

        <View style={styles.shareRow}>
          <TouchableOpacity style={styles.shareBtn}>
            <Text style={styles.shareIcon}>📤</Text>
            <Text style={styles.shareBtnText}>Partager la course</Text>
          </TouchableOpacity>
        </View>

        <Button label="C'est lui ! Commencer →" onPress={startRide} style={styles.startBtn} />

        <TouchableOpacity style={styles.cancelLink} onPress={() => router.replace('/home')}>
          <Text style={styles.cancelText}>Annuler (gratuit)</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  mapEmoji: { fontSize: 48 },
  mapText: { fontSize: 15, color: Colors.textSecondary, fontWeight: '500' },
  card: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  eta: { alignItems: 'center', marginBottom: 20 },
  etaTime: { fontSize: 40, fontWeight: '800', color: Colors.primary },
  etaLabel: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  avatar: {
    width: 56, height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarEmoji: { fontSize: 28 },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 17, fontWeight: '700', color: Colors.black },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  star: { color: Colors.star, fontSize: 14 },
  ratingVal: { fontSize: 14, fontWeight: '600', color: Colors.black },
  tripCount: { fontSize: 13, color: Colors.textSecondary },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: { fontSize: 18 },
  vehicleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  vehicleItem: { flex: 1, alignItems: 'center' },
  vehicleLabel: { fontSize: 11, color: Colors.textTertiary, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  vehicleValue: { fontSize: 13, fontWeight: '600', color: Colors.black, textAlign: 'center' },
  vehicleDivider: { width: 1, backgroundColor: Colors.border },
  shareRow: { marginBottom: 14 },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shareIcon: { fontSize: 16 },
  shareBtnText: { fontSize: 14, fontWeight: '600', color: Colors.black },
  startBtn: { marginBottom: 12 },
  cancelLink: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, color: Colors.error, fontWeight: '600' },
});
