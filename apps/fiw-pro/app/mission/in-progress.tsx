import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import LeafletMap from '@/components/LeafletMap';
import Button from '@/components/Button';
import { Colors } from '@/constants/colors';
import { MISSION_INCOMING } from '@/constants/data';

const DEST = MISSION_INCOMING.destination;

export default function InProgressScreen() {
  const [eta, setEta] = useState(12);

  useEffect(() => {
    const t = setInterval(() => {
      setEta((prev) => (prev > 1 ? prev - 1 : 1));
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={styles.container}>
      <LeafletMap
        center={MISSION_INCOMING.pickup}
        zoom={13}
        markers={[
          { lat: MISSION_INCOMING.pickup.lat, lng: MISSION_INCOMING.pickup.lng, type: 'prestataire' },
          { lat: DEST.lat, lng: DEST.lng, type: 'destination' },
        ]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topBar}>
          <View style={styles.inProgressBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.inProgressText}>Mission en cours</Text>
          </View>
          <View style={styles.etaBadge}>
            <Text style={styles.etaLabel}>ETA</Text>
            <Text style={styles.etaValue}>{eta} min</Text>
          </View>
        </View>

        <View style={styles.bottomPanel}>
          <View style={styles.routeSummary}>
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.routeText}>{MISSION_INCOMING.pickup.name}</Text>
              <Text style={styles.routeTag}>Collecte ✓</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: Colors.error }]} />
              <Text style={styles.routeText}>{DEST.name}</Text>
              <Text style={styles.routeTagDest}>{DEST.detail}</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Montant estimé</Text>
            <Text style={styles.priceValue}>
              {MISSION_INCOMING.prixEstime.toLocaleString('fr-FR')} F CFA
            </Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.callBtn}>
              <Text style={styles.callIcon}>📞</Text>
              <Text style={styles.callLabel}>Appeler</Text>
            </TouchableOpacity>

            <Button
              label="Terminer la mission"
              onPress={() => router.push('/mission/complete')}
              style={styles.endBtn}
            />
          </View>
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
  inProgressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pulseDot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  inProgressText: { fontSize: 13, fontWeight: '600', color: Colors.black },
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
  routeSummary: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 4,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeText: { fontSize: 14, fontWeight: '500', color: Colors.black, flex: 1 },
  routeTag: { fontSize: 12, color: Colors.success, fontWeight: '600' },
  routeTagDest: { fontSize: 12, color: Colors.textTertiary },
  routeLine: {
    width: 2, height: 12,
    backgroundColor: Colors.border,
    marginLeft: 4, marginVertical: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  priceLabel: { fontSize: 14, color: Colors.textSecondary },
  priceValue: { fontSize: 18, fontWeight: '700', color: Colors.black },
  actionsRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  callBtn: {
    width: 56, height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  callIcon: { fontSize: 20 },
  callLabel: { fontSize: 9, color: Colors.primary, fontWeight: '600' },
  endBtn: { flex: 1 },
});
