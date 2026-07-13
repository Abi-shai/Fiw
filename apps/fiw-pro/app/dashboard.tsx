import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, Animated, Modal
} from 'react-native';
import { router } from 'expo-router';
import LeafletMap from '@/components/LeafletMap';
import Button from '@/components/Button';
import { Colors } from '@/constants/colors';
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
            <Text style={styles.logoText}>fiw</Text>
            <Text style={styles.logoPro}>pro</Text>
          </View>

          <TouchableOpacity
            style={[styles.walletBadge, walletLow && styles.walletBadgeLow]}
            activeOpacity={0.8}
          >
            <Text style={styles.walletIcon}>💰</Text>
            <Text style={[styles.walletText, walletLow && styles.walletTextLow]}>
              {PRESTATAIRE.walletSolde.toLocaleString('fr-FR')} F
            </Text>
          </TouchableOpacity>
        </View>

        {/* Refused toast */}
        {refusedVisible && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>Mission refusée — impact sur votre Score de coopération</Text>
          </View>
        )}

        {/* Bottom panel */}
        <View style={styles.bottomPanel}>
          <View style={styles.prestaRow}>
            <Text style={styles.prestaName}>Bonjour, {PRESTATAIRE.prenom} 👋</Text>
            <View style={styles.statutBadge}>
              <Text style={styles.statutText}>⭐ {PRESTATAIRE.statut}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.toggleRow, online && styles.toggleRowOnline]}
            onPress={() => {
              if (online) { setMissionVisible(false); }
              setOnline(!online);
            }}
            activeOpacity={0.85}
          >
            <View style={[styles.toggleDot, online && styles.toggleDotOnline]} />
            <Text style={[styles.toggleLabel, online && styles.toggleLabelOnline]}>
              {online ? 'En ligne' : 'Hors ligne'}
            </Text>
            <Text style={styles.toggleSub}>
              {online ? 'Vous recevez des missions' : 'Appuyez pour commencer'}
            </Text>
          </TouchableOpacity>

          {online && (
            <View style={styles.waitingRow}>
              <Text style={styles.waitingDot}>●</Text>
              <Text style={styles.waitingText}>En attente d'une mission…</Text>
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* Mission incoming modal */}
      <Modal visible={missionVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.missionCard, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.missionHeader}>
              <Text style={styles.missionTitle}>Mission entrante</Text>
              <View style={[styles.timerBadge, timer <= 5 && styles.timerBadgeUrgent]}>
                <Text style={[styles.timerText, timer <= 5 && styles.timerTextUrgent]}>{timer}s</Text>
              </View>
            </View>

            <View style={styles.timerBar}>
              <View
                style={[
                  styles.timerFill,
                  { width: `${(timer / MISSION_INCOMING.timerSeconds) * 100}%` },
                  timer <= 5 && styles.timerFillUrgent,
                ]}
              />
            </View>

            <View style={styles.missionRow}>
              <Text style={styles.missionIcon}>{MISSION_INCOMING.icon}</Text>
              <View style={styles.missionInfo}>
                <Text style={styles.missionType}>{MISSION_INCOMING.type}</Text>
                <Text style={styles.missionClient}>
                  {MISSION_INCOMING.clientName} · ★ {MISSION_INCOMING.clientRating}
                </Text>
              </View>
              <Text style={styles.missionPrice}>
                {MISSION_INCOMING.prixEstime.toLocaleString('fr-FR')} F
              </Text>
            </View>

            <View style={styles.routeBox}>
              <View style={styles.routeRow}>
                <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
                <Text style={styles.routeText}>{MISSION_INCOMING.pickup.name}</Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routeRow}>
                <View style={[styles.routeDot, { backgroundColor: Colors.error }]} />
                <Text style={styles.routeText}>{MISSION_INCOMING.destination.name}</Text>
              </View>
            </View>

            <Text style={styles.missionDistance}>{MISSION_INCOMING.distance} · Prise en charge</Text>

            <View style={styles.missionActions}>
              <Button
                label="Refuser"
                variant="danger"
                onPress={handleRefuse}
                style={styles.actionBtn}
              />
              <Button
                label="Accepter"
                onPress={handleAccept}
                style={styles.actionBtn}
              />
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
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  logoText: { color: Colors.white, fontWeight: '800', fontSize: 16, letterSpacing: -0.5 },
  logoPro: {
    color: Colors.primaryLight,
    fontWeight: '700',
    fontSize: 10,
    marginLeft: 3,
    marginBottom: 1,
    letterSpacing: 1,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  walletBadgeLow: { borderWidth: 1.5, borderColor: Colors.walletLow },
  walletIcon: { fontSize: 14 },
  walletText: { fontSize: 13, fontWeight: '700', color: Colors.black },
  walletTextLow: { color: Colors.walletLow },
  toast: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: Colors.warningLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  toastText: { fontSize: 13, color: Colors.black, fontWeight: '500' },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  prestaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  prestaName: { fontSize: 18, fontWeight: '700', color: Colors.black },
  statutBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statutText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 12,
  },
  toggleRowOnline: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  toggleDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.offline,
  },
  toggleDotOnline: { backgroundColor: Colors.online },
  toggleLabel: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary, flex: 1 },
  toggleLabelOnline: { color: Colors.primary },
  toggleSub: { fontSize: 12, color: Colors.textTertiary },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  waitingDot: { color: Colors.online, fontSize: 10 },
  waitingText: { fontSize: 13, color: Colors.textSecondary },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.overlay,
  },
  missionCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  missionTitle: { fontSize: 20, fontWeight: '700', color: Colors.black },
  timerBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  timerBadgeUrgent: { backgroundColor: '#FEE2E2' },
  timerText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  timerTextUrgent: { color: Colors.error },
  timerBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: 20,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  timerFillUrgent: { backgroundColor: Colors.error },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  missionIcon: { fontSize: 32 },
  missionInfo: { flex: 1 },
  missionType: { fontSize: 16, fontWeight: '700', color: Colors.black },
  missionClient: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  missionPrice: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  routeBox: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 4,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeLine: {
    width: 2,
    height: 12,
    backgroundColor: Colors.border,
    marginLeft: 4,
    marginVertical: 2,
  },
  routeText: { fontSize: 14, fontWeight: '500', color: Colors.black },
  missionDistance: { fontSize: 13, color: Colors.textSecondary, marginBottom: 20 },
  missionActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1 },
});
