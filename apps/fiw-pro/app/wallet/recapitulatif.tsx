import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { PARTENAIRE, STATS } from '@/constants/data-partenaire';

export default function RecapitulatifRetraitScreen() {
  const [editNumero, setEditNumero] = useState(false);
  const [numero, setNumero] = useState(PARTENAIRE.mobileMoneyNumero);
  const montant = STATS.solde;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Récapitulatif</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Montant principal */}
        <View style={styles.montantCard}>
          <Text style={styles.montantLabel}>Vous retirez</Text>
          <Text style={styles.montantValue}>{montant.toLocaleString('fr-FR')} F CFA</Text>
          <Text style={styles.montantSub}>Délai estimé : 5 à 15 minutes</Text>
        </View>

        {/* Destination */}
        <View style={styles.destinationCard}>
          <View style={styles.destinationRow}>
            <View>
              <Text style={styles.destLabel}>Vers</Text>
              {editNumero ? (
                <TextInput
                  style={styles.destInput}
                  value={numero}
                  onChangeText={setNumero}
                  keyboardType="phone-pad"
                  autoFocus
                  onBlur={() => setEditNumero(false)}
                />
              ) : (
                <Text style={styles.destValue}>{numero}</Text>
              )}
              <Text style={styles.destOperateur}>{PARTENAIRE.mobileMoneyOperateur}</Text>
            </View>
            <TouchableOpacity
              style={styles.modifierBtn}
              onPress={() => setEditNumero(true)}
            >
              <Text style={styles.modifierLabel}>Modifier</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.fraisNote}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.fraisText}>Aucun frais de retrait</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelLabel}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={() => router.replace('/wallet/succes')}
        >
          <Text style={styles.confirmLabel}>Confirmer le retrait</Text>
        </TouchableOpacity>
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

  content: { flex: 1, padding: 20, gap: 14 },

  montantCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 6,
  },
  montantLabel: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  montantValue: { fontSize: 34, fontWeight: '800', color: Colors.white },
  montantSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },

  destinationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  destinationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  destLabel: { fontSize: 11, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', marginBottom: 4 },
  destValue: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  destInput: {
    fontSize: 17, fontWeight: '700', color: Colors.textPrimary,
    borderBottomWidth: 1.5, borderBottomColor: Colors.primary,
    paddingBottom: 4, minWidth: 160,
  },
  destOperateur: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  modifierBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: Colors.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modifierLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },

  fraisNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fraisText: { fontSize: 12, color: Colors.textTertiary },

  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelLabel: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  confirmBtn: {
    flex: 2,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmLabel: { fontSize: 15, fontWeight: '700', color: Colors.white },
});
