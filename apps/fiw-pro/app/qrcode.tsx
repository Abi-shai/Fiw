import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { PARTENAIRE, MOCK_MODE } from '@/constants/data-partenaire';

function QRLarge({ inactive }: { inactive?: boolean }) {
  return (
    <View style={[styles.qrOuter, inactive && styles.qrOuterInactive]}>
      {/* Coins */}
      <View style={[styles.corner, styles.cornerTL, inactive && styles.cornerInactive]} />
      <View style={[styles.corner, styles.cornerTR, inactive && styles.cornerInactive]} />
      <View style={[styles.corner, styles.cornerBL, inactive && styles.cornerInactive]} />
      <View style={[styles.corner, styles.cornerBR, inactive && styles.cornerInactive]} />
      {/* Centre */}
      <View style={styles.qrCenter}>
        <View style={[styles.qrLogo, inactive && styles.qrLogoInactive]}>
          <Text style={styles.qrLogoText}>fiw</Text>
        </View>
        <Text style={[styles.qrPointLabel, inactive && styles.qrPointLabelInactive]}>
          POINT EXPRESS
        </Text>
      </View>
    </View>
  );
}

export default function QRCodeScreen() {
  const inactive = MOCK_MODE === 'pending';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Mon QR code</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.pointNom}>{PARTENAIRE.pointExpress}</Text>

        {inactive && (
          <View style={styles.inactiveBanner}>
            <Ionicons name="time-outline" size={16} color={Colors.warning} />
            <Text style={styles.inactiveBannerText}>
              QR pas encore actif — il fonctionnera dès la validation de votre Point Express
            </Text>
          </View>
        )}

        <View style={styles.qrWrapper}>
          <QRLarge inactive={inactive} />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Alert.alert('QR code enregistré', 'Votre QR code a été enregistré dans Photos.')}
          >
            <Ionicons name="download-outline" size={22} color={Colors.primary} />
            <Text style={styles.actionLabel}>Télécharger</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Alert.alert('Partager', 'Partage natif disponible sur l\'appareil réel.')}
          >
            <Ionicons name="share-outline" size={22} color={Colors.primary} />
            <Text style={styles.actionLabel}>Partager</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Alert.alert('Imprimer', 'Impression disponible sur l\'appareil réel.')}
          >
            <Ionicons name="print-outline" size={22} color={Colors.primary} />
            <Text style={styles.actionLabel}>Imprimer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  topTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: Colors.textPrimary },

  content: { flex: 1, alignItems: 'center', paddingHorizontal: 32, paddingTop: 24, gap: 20 },

  pointNom: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },

  inactiveBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.warningSubtle,
    borderRadius: 12,
    padding: 12,
    width: '100%',
  },
  inactiveBannerText: { flex: 1, fontSize: 13, color: Colors.textPrimary, lineHeight: 18 },

  qrWrapper: {
    padding: 24,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },

  // QR placeholder large
  qrOuter: {
    width: 220,
    height: 220,
    borderWidth: 3,
    borderColor: Colors.textPrimary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  qrOuterInactive: { borderColor: Colors.textTertiary },
  corner: {
    position: 'absolute',
    width: 36, height: 36,
    borderWidth: 3, borderColor: Colors.textPrimary,
  },
  cornerInactive: { borderColor: Colors.textTertiary },
  cornerTL: { top: 8, left: 8, borderBottomWidth: 0, borderRightWidth: 0 },
  cornerTR: { top: 8, right: 8, borderBottomWidth: 0, borderLeftWidth: 0 },
  cornerBL: { bottom: 8, left: 8, borderTopWidth: 0, borderRightWidth: 0 },
  cornerBR: { bottom: 8, right: 8, borderTopWidth: 0, borderLeftWidth: 0 },
  qrCenter: { alignItems: 'center', gap: 6 },
  qrLogo: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  qrLogoInactive: { backgroundColor: Colors.textTertiary },
  qrLogoText: { fontSize: 18, fontWeight: '800', color: Colors.white, letterSpacing: -0.5 },
  qrPointLabel: { fontSize: 10, fontWeight: '700', color: Colors.textPrimary, letterSpacing: 1.5, textAlign: 'center' },
  qrPointLabelInactive: { color: Colors.textTertiary },

  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionLabel: { fontSize: 12, fontWeight: '600', color: Colors.primary },
});
