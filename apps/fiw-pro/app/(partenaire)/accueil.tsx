import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { MOCK_MODE, PARTENAIRE, STATS, COMMISSIONS } from '@/constants/data-partenaire';

type Periode = 'today' | 'month' | 'total';

const PERIODES: { key: Periode; label: string }[] = [
  { key: 'today', label: "Aujourd'hui" },
  { key: 'month', label: 'Ce mois' },
  { key: 'total', label: 'Total' },
];

function QRCodePlaceholder({ inactive }: { inactive?: boolean }) {
  return (
    <View style={[styles.qrBox, inactive && styles.qrBoxInactive]}>
      <View style={styles.qrCornerTL} />
      <View style={styles.qrCornerTR} />
      <View style={styles.qrCornerBL} />
      <View style={styles.qrCenter}>
        <Text style={[styles.qrLabel, inactive && styles.qrLabelInactive]}>POINT{'\n'}EXPRESS</Text>
      </View>
    </View>
  );
}

export default function AccueilScreen() {
  const [periode, setPeriode] = useState<Periode>('month');
  const isPending = MOCK_MODE === 'pending';
  const stats = STATS[periode];

  if (isPending) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.topBar}>
            <View>
              <Text style={styles.nomPoint}>{PARTENAIRE.pointExpress}</Text>
              <Text style={styles.nomGerant}>{PARTENAIRE.gerant}</Text>
            </View>
          </View>

          <View style={styles.validationCard}>
            <Text style={styles.validationTitle}>Validation en cours</Text>
            <Text style={styles.validationSub}>Délai estimé : 2 à 3 jours ouvrables</Text>

            <View style={styles.stepper}>
              <StepRow label="Dossier reçu" done />
              <View style={styles.stepLine} />
              <StepRow label="En cours d'examen" active />
              <View style={styles.stepLine} />
              <StepRow label="Validé" />
            </View>
          </View>

          <View style={styles.qrCard}>
            <View style={styles.qrCardTop}>
              <Text style={styles.qrCardTitle}>Mon QR code Point Express</Text>
              <View style={styles.qrInactiveBadge}>
                <Text style={styles.qrInactiveBadgeText}>Pas encore actif</Text>
              </View>
            </View>
            <View style={styles.qrRow}>
              <QRCodePlaceholder inactive />
              <Text style={styles.qrInactiveNote}>
                Votre QR code sera activé dès la validation de votre Point Express
              </Text>
            </View>
            <View style={styles.qrActions}>
              <TouchableOpacity style={styles.qrBtn} onPress={() => router.push('/qrcode')}>
                <Ionicons name="download-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.qrBtnLabel}>Télécharger</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.qrBtn}>
                <Ionicons name="share-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.qrBtnLabel}>Partager</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.nomPoint}>{PARTENAIRE.pointExpress}</Text>
            <Text style={styles.nomGerant}>{PARTENAIRE.gerant}</Text>
          </View>
        </View>

        {/* Filtre période */}
        <View style={styles.periodeRow}>
          {PERIODES.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.periodeChip, periode === p.key && styles.periodeChipActive]}
              onPress={() => setPeriode(p.key)}
            >
              <Text style={[styles.periodeLabel, periode === p.key && styles.periodeLabelActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Métriques */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{stats.courses}</Text>
            <Text style={styles.metricLabel}>Courses générées</Text>
          </View>
          <View style={[styles.metricCard, styles.metricCardPrimary]}>
            <Text style={[styles.metricValue, styles.metricValuePrimary]}>
              {stats.commission.toLocaleString('fr-FR')} F
            </Text>
            <Text style={[styles.metricLabel, styles.metricLabelPrimary]}>Commission 4 %</Text>
          </View>
        </View>

        {/* Wallet */}
        <View style={styles.walletRow}>
          <View>
            <Text style={styles.walletLabel}>Mon Wallet</Text>
            <Text style={styles.walletSolde}>{STATS.solde.toLocaleString('fr-FR')} F</Text>
          </View>
          <TouchableOpacity
            style={styles.retirerBtn}
            onPress={() => router.push('/wallet/recapitulatif')}
          >
            <Text style={styles.retirerLabel}>Retirer</Text>
          </TouchableOpacity>
        </View>

        {/* QR Card */}
        <TouchableOpacity style={styles.qrCard} onPress={() => router.push('/qrcode')}>
          <View style={styles.qrCardTop}>
            <Text style={styles.qrCardTitle}>Mon QR code Point Express</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
          </View>
          <View style={styles.qrRow}>
            <QRCodePlaceholder />
            <View style={styles.qrActionsColumn}>
              <TouchableOpacity style={styles.qrBtn}>
                <Ionicons name="download-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.qrBtnLabel}>Télécharger</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.qrBtn}>
                <Ionicons name="share-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.qrBtnLabel}>Partager</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.qrBtn}
                onPress={() => router.push('/qrcode')}
              >
                <Ionicons name="expand-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.qrBtnLabel}>Plein écran</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        {/* Courses récentes */}
        <Text style={styles.sectionTitle}>Courses récentes</Text>
        {COMMISSIONS.map((c) => (
          <View key={c.id} style={styles.courseRow}>
            <View style={styles.courseDot} />
            <View style={styles.courseInfo}>
              <Text style={styles.courseClient}>{c.client}</Text>
              <Text style={styles.courseDest}>{c.destination} · {c.date}</Text>
            </View>
            <Text style={styles.courseMontant}>+{Math.round(c.montant * 0.04)} F</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function StepRow({ label, done, active }: { label: string; done?: boolean; active?: boolean }) {
  return (
    <View style={styles.stepRow}>
      <View style={[
        styles.stepDot,
        done && styles.stepDotDone,
        active && styles.stepDotActive,
      ]}>
        {done && <Ionicons name="checkmark" size={12} color={Colors.white} />}
        {active && <View style={styles.stepDotInner} />}
      </View>
      <Text style={[
        styles.stepLabel,
        done && styles.stepLabelDone,
        active && styles.stepLabelActive,
      ]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 32 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  nomPoint: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  nomGerant: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  // Période filter
  periodeRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  periodeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodeLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  periodeLabelActive: { color: Colors.white },

  // Métriques
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricCardPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  metricValue: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  metricValuePrimary: { color: Colors.white },
  metricLabel: { fontSize: 12, color: Colors.textSecondary },
  metricLabelPrimary: { color: 'rgba(255,255,255,0.75)' },

  // Wallet
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  walletLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  walletSolde: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  retirerBtn: {
    backgroundColor: Colors.primarySubtle,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retirerLabel: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  // QR Card
  qrCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qrCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  qrCardTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  qrInactiveBadge: {
    backgroundColor: Colors.warningSubtle,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  qrInactiveBadgeText: { fontSize: 11, fontWeight: '600', color: Colors.warning },
  qrRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },

  // QR placeholder
  qrBox: {
    width: 90,
    height: 90,
    borderWidth: 2,
    borderColor: Colors.textPrimary,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  qrBoxInactive: { borderColor: Colors.textTertiary },
  qrCornerTL: {
    position: 'absolute', top: 4, left: 4,
    width: 18, height: 18,
    borderWidth: 2, borderColor: Colors.textPrimary,
    borderBottomWidth: 0, borderRightWidth: 0,
  },
  qrCornerTR: {
    position: 'absolute', top: 4, right: 4,
    width: 18, height: 18,
    borderWidth: 2, borderColor: Colors.textPrimary,
    borderBottomWidth: 0, borderLeftWidth: 0,
  },
  qrCornerBL: {
    position: 'absolute', bottom: 4, left: 4,
    width: 18, height: 18,
    borderWidth: 2, borderColor: Colors.textPrimary,
    borderTopWidth: 0, borderRightWidth: 0,
  },
  qrCenter: { alignItems: 'center' },
  qrLabel: { fontSize: 8, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: 0.5 },
  qrLabelInactive: { color: Colors.textTertiary },

  qrActionsColumn: { flex: 1, gap: 8 },
  qrActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  qrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: Colors.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qrBtnLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  qrInactiveNote: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  // Validation (mode pending)
  validationCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  validationTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  validationSub: { fontSize: 13, color: Colors.textSecondary, marginBottom: 20 },
  stepper: { gap: 0 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepLine: { width: 2, height: 20, backgroundColor: Colors.border, marginLeft: 11 },
  stepDot: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.bg,
    borderWidth: 2, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  stepDotDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  stepDotActive: { borderColor: Colors.primary },
  stepDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  stepLabel: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  stepLabelDone: { color: Colors.textPrimary },
  stepLabelActive: { color: Colors.primary, fontWeight: '600' },

  // Courses récentes
  sectionTitle: {
    fontSize: 15, fontWeight: '700', color: Colors.textPrimary,
    paddingHorizontal: 20, marginBottom: 8,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    gap: 12,
  },
  courseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  courseInfo: { flex: 1 },
  courseClient: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  courseDest: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  courseMontant: { fontSize: 14, fontWeight: '700', color: Colors.success },
});
