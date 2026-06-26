import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenHeader from '@/components/ScreenHeader';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import { Colors, Radii, Spacing, Shadows } from '@/constants/tokens';
import { AMBASSADEUR, fcfa, detectOperator } from '@/constants/affilie';

// JS3 — Récapitulatif de retrait (point de non-retour avant confirmation).

export default function RetraitRecap() {
  const params = useLocalSearchParams<{ number?: string }>();
  const number = params.number ?? AMBASSADEUR.defaultNumber;
  const operator = detectOperator(number);
  const amount = AMBASSADEUR.balance;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Retrait" />
      <View style={styles.content}>
        {/* Montant + destination en grand */}
        <View style={styles.hero}>
          <Text variant="body" color={Colors.textSecondary} align="center">Vous retirez</Text>
          <Text variant="display" align="center" style={styles.amount}>{fcfa(amount)}</Text>
          <Text variant="body" color={Colors.textSecondary} align="center">vers le</Text>
          <TouchableOpacity
            style={styles.numberRow}
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/affilie/retrait-numero', params: { number } })}
          >
            <Icon name="phone" size={18} color={Colors.primary} />
            <Text variant="heading2" color={Colors.primary}>{number}</Text>
            <Icon name="edit" size={16} color={Colors.primary} />
          </TouchableOpacity>
          {operator && (
            <View style={styles.operator}>
              <Text variant="caption" color={Colors.textSecondary}>{operator}</Text>
            </View>
          )}
        </View>

        {/* Détails */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text variant="bodySmall" color={Colors.textSecondary}>Frais de retrait</Text>
            <Text variant="label" color={Colors.success}>Gratuit</Text>
          </View>
          <View style={[styles.detailRow, styles.detailBorder]}>
            <Text variant="bodySmall" color={Colors.textSecondary}>Délai estimé</Text>
            <Text variant="label">Quelques minutes</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Confirmer le retrait" onPress={() => router.replace('/affilie/retrait-traitement')} />
        <TouchableOpacity style={styles.cancel} activeOpacity={0.7} onPress={() => router.back()}>
          <Text variant="label" color={Colors.textSecondary}>Annuler</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, paddingHorizontal: Spacing[4] },

  hero: { alignItems: 'center', paddingTop: Spacing[8], gap: 4 },
  amount: { letterSpacing: -0.8, marginVertical: Spacing[1] },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginTop: Spacing[2],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: Radii.pill,
    backgroundColor: Colors.primarySubtle,
  },
  operator: { marginTop: Spacing[2] },

  details: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    paddingHorizontal: Spacing[4],
    marginTop: Spacing[8],
    ...Shadows.sm,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing[4] },
  detailBorder: { borderTopWidth: 1, borderTopColor: Colors.borderSubtle },

  footer: { paddingHorizontal: Spacing[4], paddingTop: Spacing[3], paddingBottom: Spacing[8], gap: Spacing[2] },
  cancel: { alignItems: 'center', paddingVertical: Spacing[3] },
});
