import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { PARTENAIRE, STATS } from '@/constants/data-partenaire';

export default function RetraitSuccesScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={40} color={Colors.white} />
        </View>

        <Text style={styles.title}>Retrait envoyé</Text>
        <Text style={styles.montant}>{STATS.solde.toLocaleString('fr-FR')} F CFA</Text>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vers</Text>
            <Text style={styles.detailValue}>{PARTENAIRE.mobileMoneyNumero}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Opérateur</Text>
            <Text style={styles.detailValue}>{PARTENAIRE.mobileMoneyOperateur}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Statut</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>En cours d'arrivée</Text>
            </View>
          </View>
        </View>

        <Text style={styles.note}>Délai estimé : 5 à 15 minutes</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => router.push('/(partenaire)/wallet')}
        >
          <Text style={styles.doneBtnLabel}>Retour au Wallet</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.success,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  montant: { fontSize: 32, fontWeight: '800', color: Colors.primary },

  detailsCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  separator: { height: 1, backgroundColor: Colors.borderSubtle },
  detailLabel: { fontSize: 13, color: Colors.textSecondary },
  detailValue: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  statusBadge: {
    backgroundColor: Colors.primarySubtle,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontSize: 12, fontWeight: '600', color: Colors.primary },

  note: { fontSize: 13, color: Colors.textTertiary },

  footer: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  doneBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnLabel: { fontSize: 15, fontWeight: '700', color: Colors.white },
});
