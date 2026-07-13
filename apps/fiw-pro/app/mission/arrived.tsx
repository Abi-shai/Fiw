import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import LeafletMap from '@/components/LeafletMap';
import Button from '@/components/Button';
import { Colors } from '@/constants/colors';
import { MISSION_INCOMING } from '@/constants/data';

const PICKUP = MISSION_INCOMING.pickup;

export default function ArrivedScreen() {
  const [waitSeconds, setWaitSeconds] = useState(0);
  const FREE_MINUTES = MISSION_INCOMING.prixEstime <= 1000 ? 3 : 5;
  const FREE_SECONDS = FREE_MINUTES * 60;
  const fraisActive = waitSeconds > FREE_SECONDS;
  const fraisTotal = fraisActive ? Math.floor((waitSeconds - FREE_SECONDS) / 60) * 100 : 0;

  useEffect(() => {
    const t = setInterval(() => setWaitSeconds((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <LeafletMap
        center={PICKUP}
        zoom={16}
        markers={[
          { lat: PICKUP.lat, lng: PICKUP.lng, type: 'prestataire' },
          { lat: PICKUP.lat + 0.0003, lng: PICKUP.lng + 0.0003, type: 'client' },
        ]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topBar}>
          <View style={[styles.arrivedBadge]}>
            <Text style={styles.arrivedText}>Arrivé au point de collecte</Text>
          </View>
        </View>

        <View style={styles.bottomPanel}>
          <View style={styles.timerSection}>
            <Text style={styles.timerLabel}>Temps d'attente</Text>
            <Text style={[styles.timerValue, fraisActive && styles.timerValueActive]}>
              {formatTime(waitSeconds)}
            </Text>
            {!fraisActive ? (
              <Text style={styles.timerSub}>
                {formatTime(FREE_SECONDS - waitSeconds)} avant les frais d'attente
              </Text>
            ) : (
              <View style={styles.fraisRow}>
                <Text style={styles.fraisLabel}>Frais d'attente</Text>
                <Text style={styles.fraisValue}>+{fraisTotal} F CFA</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.clientRow}>
            <View style={styles.clientAvatar}>
              <Text style={styles.clientEmoji}>👤</Text>
            </View>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{MISSION_INCOMING.clientName}</Text>
              <Text style={styles.clientAddress}>{PICKUP.name}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Text style={styles.callIcon}>📞</Text>
            </TouchableOpacity>
          </View>

          <Button
            label="Démarrer la mission"
            onPress={() => router.push('/mission/in-progress')}
          />

          <Text style={styles.hint}>
            Appuyez quand le client est dans le véhicule
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1 },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: 'center',
  },
  arrivedBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  arrivedText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  timerSection: { alignItems: 'center', marginBottom: 20 },
  timerLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  timerValue: { fontSize: 40, fontWeight: '800', color: Colors.black, letterSpacing: -1 },
  timerValueActive: { color: Colors.warning },
  timerSub: { fontSize: 13, color: Colors.textTertiary, marginTop: 4 },
  fraisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    backgroundColor: Colors.warningLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fraisLabel: { fontSize: 13, color: Colors.black, fontWeight: '500' },
  fraisValue: { fontSize: 14, fontWeight: '700', color: Colors.warning },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 16 },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  clientAvatar: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientEmoji: { fontSize: 22 },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 16, fontWeight: '700', color: Colors.black },
  clientAddress: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  callBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: { fontSize: 18 },
  hint: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 10,
  },
});
