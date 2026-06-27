import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import ScreenHeader from '@/components/ScreenHeader';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import { Colors, Radii, Spacing, Poppins, Shadows } from '@/constants/tokens';
import { AMBASSADEUR, WITHDRAW_MIN, fcfa } from '@/constants/affilie';

type Method = { id: string; name: string; color: string };

const METHODS: Method[] = [
  { id: 'orange', name: 'Orange Money', color: '#FF6200' },
  { id: 'wave',   name: 'Wave',         color: '#009FE3' },
  { id: 'free',   name: 'Free Money',   color: '#00B050' },
];

export default function RetraitMethode() {
  const { balance, defaultNumber } = AMBASSADEUR;
  const [method, setMethod] = useState<Method>(METHODS[0]);
  const [raw, setRaw] = useState('');

  const amount = parseInt(raw.replace(/\D/g, '') || '0', 10);
  const tooLow  = raw.length > 0 && amount > 0 && amount < WITHDRAW_MIN;
  const tooHigh = amount > balance;
  const valid   = amount >= WITHDRAW_MIN && amount <= balance;

  const onContinue = () => {
    router.push({
      pathname: '/affilie/retrait-recap',
      params: { method: method.name, number: defaultNumber, amount: String(amount) },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="Retirer" />

      <View style={styles.content}>
        {/* Montant — hero éditable, miroir du recap */}
        <View style={styles.hero}>
          <Text variant="caption" color={Colors.textTertiary} style={styles.kicker}>MONTANT</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={[styles.amountInput, (tooLow || tooHigh) && styles.amountInputError]}
              value={raw}
              onChangeText={setRaw}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={Colors.textTertiary}
              textAlign="center"
              maxLength={7}
              autoFocus
            />
            <Text variant="heading2" color={Colors.textSecondary} style={styles.currency}>F</Text>
          </View>

          <View style={styles.balanceLine}>
            <Text variant="caption" color={Colors.textTertiary}>
              Disponible : <Text variant="caption" color={Colors.textPrimary}>{fcfa(balance)}</Text>
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => setRaw(String(balance))}>
              <Text variant="caption" color={Colors.primary}>Tout retirer</Text>
            </TouchableOpacity>
          </View>

          {tooLow && (
            <Text variant="caption" color={Colors.error} style={styles.errorText}>
              Minimum {fcfa(WITHDRAW_MIN)}
            </Text>
          )}
          {tooHigh && (
            <Text variant="caption" color={Colors.error} style={styles.errorText}>
              Solde insuffisant
            </Text>
          )}
        </View>

        {/* Méthode — carte identique aux détails du récap */}
        <Text variant="caption" color={Colors.textTertiary} style={styles.sectionLabel}>MÉTHODE</Text>
        <View style={styles.details}>
          {METHODS.map((m, i) => {
            const selected = method.id === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.detailRow, i > 0 && styles.detailBorder, selected && styles.detailRowSelected]}
                activeOpacity={0.7}
                onPress={() => setMethod(m)}
              >
                <View style={[styles.methodDot, { backgroundColor: m.color }]} />
                <Text variant="label" style={styles.flex1}>{m.name}</Text>
                {selected && <Icon name="tick" size={16} color={Colors.primary} weight="bold" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Continuer" disabled={!valid} onPress={onContinue} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  flex1: { flex: 1 },

  content: { flex: 1, paddingHorizontal: Spacing[4] },

  hero: { alignItems: 'center', paddingTop: Spacing[8], gap: 6 },
  kicker: { textTransform: 'uppercase', letterSpacing: 0.8 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing[2] },
  amountInput: {
    fontFamily: Poppins.semibold,
    fontSize: 48,
    color: Colors.textPrimary,
    letterSpacing: -1,
    padding: 0,
    minWidth: 80,
  },
  amountInputError: { color: Colors.error },
  currency: { paddingBottom: 4 },

  balanceLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: Spacing[2],
  },
  errorText: { marginTop: -2 },

  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: Spacing[8],
    marginBottom: Spacing[3],
  },

  details: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    paddingHorizontal: Spacing[4],
    ...Shadows.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[4],
  },
  detailBorder: { borderTopWidth: 1, borderTopColor: Colors.borderSubtle },
  detailRowSelected: { backgroundColor: Colors.primarySubtle },
  methodDot: { width: 12, height: 12, borderRadius: 6 },

  footer: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[8],
  },
});
