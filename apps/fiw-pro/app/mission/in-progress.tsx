import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import LeafletMap from '@/components/LeafletMap';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import { sheetSurface } from '@/components/Sheet';
import { Colors, Spacing, Radii, Shadows, Poppins } from '@/constants/tokens';
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
          <View style={[styles.inProgressBadge, Shadows.float]}>
            <View style={styles.pulseDot} />
            <Text variant="bodySmall" style={{ fontFamily: Poppins.semibold }}>Mission en cours</Text>
          </View>
          <View style={[styles.etaBadge, Shadows.md]}>
            <Text variant="caption" color={Colors.primarySubtle} style={{ fontFamily: Poppins.semibold, letterSpacing: 0.5 }}>
              ETA
            </Text>
            <Text style={{ fontFamily: Poppins.bold, fontSize: 18, color: Colors.textOnPrimary }}>
              {eta} min
            </Text>
          </View>
        </View>

        <View style={[sheetSurface, styles.bottomPanel]}>
          <View style={styles.routeSummary}>
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
              <Text variant="bodySmall" style={{ flex: 1 }}>{MISSION_INCOMING.pickup.name}</Text>
              <Text variant="caption" color={Colors.success} style={{ fontFamily: Poppins.semibold }}>
                Collecte ✓
              </Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: Colors.error }]} />
              <Text variant="bodySmall" style={{ flex: 1 }}>{DEST.name}</Text>
              <Text variant="caption" color={Colors.textTertiary}>{DEST.detail}</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text variant="bodySmall" color={Colors.textSecondary}>Montant estimé</Text>
            <Text variant="heading2">
              {MISSION_INCOMING.prixEstime.toLocaleString('fr-FR')} F CFA
            </Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.callBtn} onPress={() => {}}>
              <Icon name="phone" size={20} color={Colors.primary} />
              <Text variant="caption" color={Colors.primary} style={{ fontFamily: Poppins.semibold, marginTop: 2 }}>
                Appeler
              </Text>
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
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[2],
  },
  inProgressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.pill,
    paddingHorizontal: 14,
    paddingVertical: Spacing[2],
    gap: Spacing[2],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.hairline,
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  etaBadge: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    alignItems: 'center',
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: Spacing[6],
    paddingBottom: 40,
  },
  routeSummary: {
    backgroundColor: Colors.bg,
    borderRadius: Radii.md,
    padding: 14,
    marginBottom: Spacing[4],
    gap: 4,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeLine: {
    width: 2, height: 12,
    backgroundColor: Colors.border,
    marginLeft: 4, marginVertical: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[6],
  },
  actionsRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  callBtn: {
    width: 56, height: 52,
    borderRadius: Radii.md,
    backgroundColor: Colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  endBtn: { flex: 1 },
});
