import React, { useState } from 'react';
import { View, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenHeader from '@/components/ScreenHeader';
import Button from '@/components/Button';
import Text from '@/components/Text';
import { Colors, Radii, Spacing, Poppins } from '@/constants/tokens';
import { AMBASSADEUR, detectOperator } from '@/constants/affilie';

// JS3 — Saisie du numéro Mobile Money. « Valider » → récapitulatif de retrait.

export default function RetraitNumero() {
  const params = useLocalSearchParams<{ number?: string }>();
  const [number, setNumber] = useState(params.number ?? AMBASSADEUR.defaultNumber);
  const operator = detectOperator(number);
  const valid = number.replace(/\D/g, '').length >= 9;

  const validate = () => {
    router.replace({ pathname: '/affilie/retrait-recap', params: { number } });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="Numéro Mobile Money" />
      <View style={styles.content}>
        <Text variant="bodySmall" color={Colors.textSecondary} style={styles.label}>
          Vers quel numéro envoyer votre retrait ?
        </Text>
        <TextInput
          style={styles.input}
          value={number}
          onChangeText={setNumber}
          keyboardType="phone-pad"
          placeholder="77 000 00 00"
          placeholderTextColor={Colors.textTertiary}
          autoFocus
        />
        <View style={styles.operatorRow}>
          {operator && (
            <View style={styles.operatorChip}>
              <Text variant="caption" color={Colors.primary}>{operator}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Valider" disabled={!valid} onPress={validate} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, paddingHorizontal: Spacing[4], paddingTop: Spacing[4] },
  label: { marginBottom: Spacing[3] },
  input: {
    fontFamily: Poppins.semibold,
    fontSize: 24,
    color: Colors.textPrimary,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingVertical: Spacing[3],
    letterSpacing: 1,
  },
  operatorRow: { flexDirection: 'row', marginTop: Spacing[4], minHeight: 28 },
  operatorChip: {
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: Spacing[3],
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  footer: { paddingHorizontal: Spacing[4], paddingTop: Spacing[3], paddingBottom: Spacing[8] },
});
