import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import LeafletMap from '@/components/LeafletMap';
import Button from '@/components/Button';
import Text from '@/components/Text';
import IconButton from '@/components/IconButton';
import Avatar from '@/components/Avatar';
import { sheetSurface } from '@/components/Sheet';
import { Colors, Spacing, Radii, Shadows, Poppins } from '@/constants/tokens';
import { MISSION_INCOMING } from '@/constants/data';

const PRESTA_START = { lat: 14.7320, lng: -17.5113 };

export default function NavigatingScreen() {
  const [eta, setEta] = useState(8);

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
          <IconButton name="back" onPress={() => router.back()} variant="floating" />
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
          <Text
            variant="label"
            color={Colors.primary}
            style={{ textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing[4] }}
          >
            En route vers le client
          </Text>

          <View style={styles.clientRow}>
            <Avatar name={MISSION_INCOMING.clientName} size={44} bordered />
            <View style={styles.clientInfo}>
              <Text variant="label" style={{ fontFamily: Poppins.semibold, fontSize: 16 }}>
                {MISSION_INCOMING.clientName}
              </Text>
              <Text variant="bodySmall" color={Colors.textSecondary} style={{ marginTop: 2 }}>
                {MISSION_INCOMING.pickup.name} · {MISSION_INCOMING.pickup.detail}
              </Text>
            </View>
            <IconButton name="phone" variant="flat" />
          </View>

          <View style={styles.routeSummary}>
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
              <Text variant="bodySmall" style={{ flex: 1 }}>{MISSION_INCOMING.pickup.name}</Text>
              <Text variant="caption" color={Colors.textTertiary}>Prise en charge</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: Colors.error }]} />
              <Text variant="bodySmall" style={{ flex: 1 }}>{MISSION_INCOMING.destination.name}</Text>
              <Text variant="caption" color={Colors.textTertiary}>Destination</Text>
            </View>
          </View>

          <Button label="Confirmer mon arrivée" onPress={() => router.push('/mission/arrived')} />
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
  etaBadge: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    alignItems: 'center',
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing[6],
    paddingBottom: 40,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[4],
    gap: 12,
  },
  clientInfo: { flex: 1 },
  routeSummary: {
    backgroundColor: Colors.bg,
    borderRadius: Radii.md,
    padding: 14,
    marginBottom: Spacing[6],
    gap: 4,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeLine: {
    width: 2, height: 12,
    backgroundColor: Colors.border,
    marginLeft: 4, marginVertical: 2,
  },
});
