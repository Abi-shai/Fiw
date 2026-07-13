import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import LeafletMap from '@/components/LeafletMap';
import Button from '@/components/Button';
import { Colors } from '@/constants/colors';
import { MISSION_INCOMING } from '@/constants/data';

const PRESTA_START = { lat: 14.7320, lng: -17.5113 };

export default function NavigatingScreen() {
  const [eta, setEta] = React.useState(8);

  useEffect(() => {
    const t = setInterval(() => {
      setEta((prev) => (prev > 1 ? prev - 1 : 1));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={styles.container}>
      <LeafletMap
        center={PRESTA_START}
        zoom={14}
        markers={[
          { lat: PRESTA_START.lat, lng: PRESTA_START.lng, type: 'prestataire' },
          { lat: MISSION_INCOMING.pickup.lat, lng: MISSION_INCOMING.pickup.lng, type: 'client' },
        ]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.etaBadge}>
            <Text style={styles.etaLabel}>ETA</Text>
            <Text style={styles.etaValue}>{eta} min</Text>
          </View>
        </View>

        <View style={styles.bottomPanel}>
          <Text style={styles.stepLabel}>En route vers le client</Text>

          <View style={styles.clientRow}>
            <View style={styles.clientAvatar}>
              <Text style={styles.clientEmoji}>👤</Text>
            </View>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{MISSION_INCOMING.clientName}</Text>
              <Text style={styles.clientAddress}>{MISSION_INCOMING.pickup.name} · {MISSION_INCOMING.pickup.detail}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Text style={styles.callIcon}>📞</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.routeSummary}>
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.routeText}>{MISSION_INCOMING.pickup.name}</Text>
              <Text style={styles.routeRight}>Prise en charge</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: Colors.error }]} />
              <Text style={styles.routeText}>{MISSION_INCOMING.destination.name}</Text>
              <Text style={styles.routeRight}>Destination</Text>
            </View>
          </View>

          <Button
            label="Confirmer mon arrivée"
            onPress={() => router.push('/mission/arrived')}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backBtn: {
    width: 40, height: 40,
    backgroundColor: Colors.white,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backIcon: { fontSize: 20, color: Colors.black },
  etaBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  etaLabel: { fontSize: 10, color: Colors.primaryLight, fontWeight: '600', letterSpacing: 0.5 },
  etaValue: { fontSize: 18, color: Colors.white, fontWeight: '800' },
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
  stepLabel: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  routeSummary: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 4,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeText: { fontSize: 14, fontWeight: '500', color: Colors.black, flex: 1 },
  routeRight: { fontSize: 12, color: Colors.textTertiary },
  routeLine: {
    width: 2, height: 12,
    backgroundColor: Colors.border,
    marginLeft: 4,
    marginVertical: 2,
  },
});
