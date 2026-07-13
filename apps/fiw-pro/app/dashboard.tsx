import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, TouchableOpacity,
  SafeAreaView, Animated, Modal,
} from 'react-native';
import { router } from 'expo-router';
import LeafletMap from '@/components/LeafletMap';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import { sheetSurface } from '@/components/Sheet';
import { Colors, Spacing, Radii, Shadows, Poppins } from '@/constants/tokens';
import { DAKAR_CENTER, PRESTATAIRE, MISSION_INCOMING } from '@/constants/data';

export default function DashboardScreen() {
  const [online, setOnline] = useState(false);
  const [missionVisible, setMissionVisible] = useState(false);
  const [timer, setTimer] = useState(MISSION_INCOMING.timerSeconds);
  const [refusedVisible, setRefusedVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (online) {
      const t = setTimeout(() => setMissionVisible(true), 2000);
      return () => clearTimeout(t);
    }
  }, [online]);

  useEffect(() => {
    if (missionVisible) {
      setTimer(MISSION_INCOMING.timerSeconds);
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setMissionVisible(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      clearInterval(timerRef.current!);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
    return () => clearInterval(timerRef.current!);
  }, [missionVisible]);

  const handleAccept = () => {
    clearInterval(timerRef.current!);
    setMissionVisible(false);
    router.push('/mission/navigating');
  };

  const handleRefuse = () => {
    clearInterval(timerRef.current!);
    setMissionVisible(false);
    setRefusedVisible(true);
    setTimeout(() => setRefusedVisible(false), 3000);
  };

  const walletLow = PRESTATAIRE.walletSolde < 1000;

  return (
    <View style={styles.container}>
      <LeafletMap
        center={DAKAR_CENTER}
        zoom={13}
        markers={[{ lat: DAKAR_CENTER.lat, lng: DAKAR_CENTER.lng, type: 'prestataire' }]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.logoRow}>
            <Text style={{ fontFamily: Poppins.bold, fontSize: 16, color: Colors.textOnPrimary, letterSpacing: -0.5 }}>
              fiw
            </Text>
            <Text style={{ fontFamily: Poppins.bold, fontSize: 10, color: Colors.primarySubtle, marginLeft: 3, marginBottom: 1, letterSpacing: 1 }}>
              pro
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.walletBadge, walletLow && styles.walletBadgeLow]}
            activeOpacity={0.8}
          >
            <Icon name="wallet" size={16} color={walletLow ? Colors.walletLow : Colors.gray700} />
            <Text
              variant="label"
              color={walletLow ? Colors.walletLow : Colors.textPrimary}
              style={{ fontFamily: Poppins.bold }}
            >
              {PRESTATAIRE.walletSolde.toLocaleString('fr-FR')} F
            </Text>
          </TouchableOpacity>
        </View>

        {/* Toast mission refusée */}
        {refusedVisible && (
          <View style={styles.toast}>
            <Text variant="bodySmall" color={Colors.textPrimary}>
              Mission refusée — impact sur votre Score de coopération
            </Text>
          </View>
        )}

        {/* Panneau bas */}
        <View style={[sheetSurface, styles.bottomPanel]}>
          <View style={styles.prestaRow}>
            <Text variant="heading2">Bonjour, {PRESTATAIRE.prenom} 👋</Text>
            <View style={styles.statutBadge}>
              <Icon name="star" size={12} color={Colors.primary} weight="fill" />
              <Text
                variant="caption"
                color={Colors.primary}
                style={{ fontFamily: Poppins.semibold, marginLeft: 4 }}
              >
                {PRESTATAIRE.statut}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.toggleRow, online && styles.toggleRowOnline]}
            onPress={() => {
              if (online) setMissionVisible(false);
              setOnline(!online);
            }}
            activeOpacity={0.85}
          >
            <View style={[styles.toggleDot, online && styles.toggleDotOnline]} />
            <View style={{ flex: 1 }}>
              <Text
                variant="label"
                color={online ? Colors.primary : Colors.textSecondary}
                style={{ fontFamily: Poppins.bold }}
              >
                {online ? 'En ligne' : 'Hors ligne'}
              </Text>
              <Text variant="caption" color={Colors.textTertiary} style={{ marginTop: 2 }}>
                {online ? 'Vous recevez des missions' : 'Appuyez pour commencer'}
              </Text>
            </View>
          </TouchableOpacity>

          {online && (
            <View style={styles.waitingRow}>
              <View style={styles.waitingDot} />
              <Text variant="bodySmall" color={Colors.textSecondary}>En attente d'une mission…</Text>
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* Modal mission entrante */}
      <Modal visible={missionVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Animated.View style={[sheetSurface, styles.missionCard, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.missionHeader}>
              <Text variant="heading2">Mission entrante</Text>
              <View style={[styles.timerBadge, timer <= 5 && styles.timerBadgeUrgent]}>
                <Text
                  variant="label"
                  color={timer <= 5 ? Colors.error : Colors.primary}
                  style={{ fontFamily: Poppins.bold }}
                >
                  {timer}s
                </Text>
              </View>
            </View>

            <View style={styles.timerBar}>
              <View
                style={[
                  styles.timerFill,
                  { width: `${(timer / MISSION_INCOMING.timerSeconds) * 100}%` as any },
                  timer <= 5 && styles.timerFillUrgent,
                ]}
              />
            </View>

            <View style={styles.missionRow}>
              <Icon name="car" size={32} color={Colors.primary} />
              <View style={styles.missionInfo}>
                <Text variant="label" color={Colors.textPrimary} style={{ fontFamily: Poppins.bold, fontSize: 16 }}>
                  {MISSION_INCOMING.type}
                </Text>
                <Text variant="bodySmall" color={Colors.textSecondary} style={{ marginTop: 2 }}>
                  {MISSION_INCOMING.clientName} · ★ {MISSION_INCOMING.clientRating}
                </Text>
              </View>
              <Text style={{ fontFamily: Poppins.bold, fontSize: 20, color: Colors.primary }}>
                {MISSION_INCOMING.prixEstime.toLocaleString('fr-FR')} F
              </Text>
            </View>

            <View style={styles.routeBox}>
              <View style={styles.routeRow}>
                <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
                <Text variant="bodySmall">{MISSION_INCOMING.pickup.name}</Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routeRow}>
                <View style={[styles.routeDot, { backgroundColor: Colors.error }]} />
                <Text variant="bodySmall">{MISSION_INCOMING.destination.name}</Text>
              </View>
            </View>

            <Text variant="bodySmall" color={Colors.textSecondary} style={{ marginBottom: Spacing[6] }}>
              {MISSION_INCOMING.distance} · Prise en charge
            </Text>

            <View style={styles.missionActions}>
              <Button
                label="Refuser"
                variant="destructive"
                onPress={handleRefuse}
                style={styles.actionBtn}
              />
              <Button label="Accepter" onPress={handleAccept} style={styles.actionBtn} />
            </View>
          </Animated.View>
        </View>
      </Modal>
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
  logoRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.sm,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.hairline,
    ...Shadows.float,
  },
  walletBadgeLow: { borderWidth: 1.5, borderColor: Colors.walletLow },
  toast: {
    marginHorizontal: Spacing[4],
    marginTop: Spacing[2],
    backgroundColor: Colors.warningSubtle,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing[4],
    paddingVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing[6],
    paddingBottom: 36,
  },
  prestaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[4],
  },
  statutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primarySubtle,
    borderRadius: Radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg,
    borderRadius: Radii.lg,
    padding: Spacing[4],
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 12,
  },
  toggleRowOnline: {
    backgroundColor: Colors.primarySubtle,
    borderColor: Colors.primary,
  },
  toggleDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.offline },
  toggleDotOnline: { backgroundColor: Colors.online },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginTop: Spacing[3],
    paddingHorizontal: Spacing[1],
  },
  waitingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.online },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.overlay,
  },
  missionCard: {
    padding: Spacing[6],
    paddingBottom: 40,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  timerBadge: {
    backgroundColor: Colors.primarySubtle,
    borderRadius: Radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  timerBadgeUrgent: { backgroundColor: Colors.errorSubtle },
  timerBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: Spacing[6],
    overflow: 'hidden',
  },
  timerFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  timerFillUrgent: { backgroundColor: Colors.error },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[4],
    gap: 12,
  },
  missionInfo: { flex: 1 },
  routeBox: {
    backgroundColor: Colors.bg,
    borderRadius: Radii.md,
    padding: 14,
    marginBottom: Spacing[2],
    gap: 4,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeLine: {
    width: 2, height: 12,
    backgroundColor: Colors.border,
    marginLeft: 4, marginVertical: 2,
  },
  missionActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1 },
});
