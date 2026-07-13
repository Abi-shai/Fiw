import React, { useState, useEffect } from 'react';
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
          <View style={[styles.arrivedBadge, Shadows.md]}>
            <Text variant="label" color={Colors.textOnPrimary} style={{ fontFamily: Poppins.semibold }}>
              Arrivé au point de collecte
            </Text>
          </View>
        </View>

        <View style={[sheetSurface, styles.bottomPanel]}>
          <View style={styles.timerSection}>
            <Text variant="bodySmall" color={Colors.textSecondary} style={{ marginBottom: Spacing[2] }}>
              Temps d'attente
            </Text>
            <Text style={[styles.timerValue, fraisActive && { color: Colors.warning }]}>
              {formatTime(waitSeconds)}
            </Text>
            {!fraisActive ? (
              <Text variant="caption" color={Colors.textTertiary} style={{ marginTop: 4 }}>
                {formatTime(FREE_SECONDS - waitSeconds)} avant les frais d'attente
              </Text>
            ) : (
              <View style={styles.fraisRow}>
                <Text variant="bodySmall" color={Colors.textPrimary} style={{ fontFamily: Poppins.medium }}>
                  Frais d'attente
                </Text>
                <Text variant="label" color={Colors.warning} style={{ fontFamily: Poppins.bold }}>
                  +{fraisTotal} F CFA
                </Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.clientRow}>
            <Avatar name={MISSION_INCOMING.clientName} size={44} bordered />
            <View style={styles.clientInfo}>
              <Text variant="label" style={{ fontFamily: Poppins.semibold, fontSize: 16 }}>
                {MISSION_INCOMING.clientName}
              </Text>
              <Text variant="bodySmall" color={Colors.textSecondary} style={{ marginTop: 2 }}>
                {PICKUP.name}
              </Text>
            </View>
            <IconButton name="phone" variant="flat" />
          </View>

          <Button label="Démarrer la mission" onPress={() => router.push('/mission/in-progress')} />

          <Text variant="caption" color={Colors.textTertiary} align="center" style={{ marginTop: 10 }}>
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
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[2],
    alignItems: 'center',
  },
  arrivedBadge: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing[6],
    paddingVertical: 10,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: Spacing[6],
    paddingBottom: 40,
  },
  timerSection: { alignItems: 'center', marginBottom: Spacing[6] },
  timerValue: {
    fontFamily: Poppins.bold,
    fontSize: 40,
    color: Colors.textPrimary,
    letterSpacing: -1,
    lineHeight: 52,
  },
  fraisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginTop: 4,
    backgroundColor: Colors.warningSubtle,
    borderRadius: Radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: Spacing[4] },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[6],
    gap: 12,
  },
  clientInfo: { flex: 1 },
});
