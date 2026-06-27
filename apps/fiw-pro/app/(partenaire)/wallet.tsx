import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { MOCK_MODE, STATS, COMMISSIONS } from '@/constants/data-partenaire';

export default function WalletScreen() {
  const isPending = MOCK_MODE === 'pending';
  const isGele = MOCK_MODE === 'gele';
  const solde = STATS.solde;
  const minimum = 1000;
  const peutRetirer = !isPending && !isGele && solde >= minimum;

  if (isPending) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Mon Wallet</Text>
        </View>
        <View style={styles.blockedContainer}>
          <View style={styles.blockedCard}>
            <Ionicons name="wallet-outline" size={32} color={Colors.textTertiary} />
            <Text style={styles.blockedTitle}>Disponible après activation</Text>
            <Text style={styles.blockedSub}>
              Vos gains apparaîtront ici dès que des courses seront commandées depuis votre Point Express.
            </Text>
            <TouchableOpacity
              style={styles.blockedLink}
              onPress={() => router.push('/(partenaire)/accueil')}
            >
              <Text style={styles.blockedLinkLabel}>Voir mon suivi de validation</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Mon Wallet</Text>
        </View>

        {/* Solde */}
        <View style={styles.soldeCard}>
          <Text style={styles.soldeLabel}>Solde disponible</Text>
          <Text style={styles.soldeValue}>{solde.toLocaleString('fr-FR')} F CFA</Text>
          <Text style={styles.soldeCommission}>Commission : 4 % par course</Text>

          {isGele ? (
            <View style={styles.geleBox}>
              <Ionicons name="warning-outline" size={16} color={Colors.warning} />
              <Text style={styles.geleText}>
                Retraits momentanément suspendus — contactez le support
              </Text>
            </View>
          ) : solde < minimum ? (
            <View style={styles.minBox}>
              <Text style={styles.minText}>
                Minimum 1 000 F pour retirer — il vous manque {(minimum - solde).toLocaleString('fr-FR')} F
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.retirerBtn, !peutRetirer && styles.retirerBtnDisabled]}
            onPress={() => peutRetirer && router.push('/wallet/recapitulatif')}
            activeOpacity={peutRetirer ? 0.85 : 1}
          >
            <Text style={[styles.retirerLabel, !peutRetirer && styles.retirerLabelDisabled]}>
              Retirer vers Mobile Money
            </Text>
          </TouchableOpacity>
        </View>

        {/* Historique */}
        <Text style={styles.sectionTitle}>Historique des commissions</Text>

        {COMMISSIONS.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={36} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>
              Pas encore de gains — ils apparaîtront ici dès que des courses seront commandées depuis votre Point Express
            </Text>
          </View>
        ) : (
          COMMISSIONS.map((c) => (
            <View key={c.id} style={styles.commissionRow}>
              <View style={styles.commissionDot} />
              <View style={styles.commissionInfo}>
                <Text style={styles.commissionClient}>{c.client}</Text>
                <Text style={styles.commissionDest}>{c.destination} · {c.date}</Text>
              </View>
              <Text style={styles.commissionMontant}>+{Math.round(c.montant * 0.04)} F</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 32 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },

  soldeCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
  },
  soldeLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6 },
  soldeValue: { fontSize: 32, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  soldeCommission: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 16 },

  geleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.warningSubtle,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  geleText: { flex: 1, fontSize: 12, color: Colors.textPrimary, lineHeight: 16 },
  minBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  minText: { fontSize: 12, color: Colors.white, lineHeight: 16 },

  retirerBtn: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retirerBtnDisabled: { opacity: 0.5 },
  retirerLabel: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  retirerLabelDisabled: { color: Colors.textSecondary },

  sectionTitle: {
    fontSize: 15, fontWeight: '700', color: Colors.textPrimary,
    paddingHorizontal: 20, marginBottom: 8,
  },
  commissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    gap: 12,
  },
  commissionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  commissionInfo: { flex: 1 },
  commissionClient: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  commissionDest: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  commissionMontant: { fontSize: 15, fontWeight: '700', color: Colors.success },

  emptyState: { padding: 40, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  blockedContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  blockedCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  blockedTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  blockedSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  blockedLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.primarySubtle,
    borderRadius: 10,
  },
  blockedLinkLabel: { fontSize: 13, fontWeight: '600', color: Colors.primary },
});
