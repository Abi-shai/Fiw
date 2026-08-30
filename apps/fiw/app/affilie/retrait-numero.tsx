import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenHeader from '@/components/ScreenHeader';
import Button from '@/components/Button';
import ScreenFooter from '@/components/ScreenFooter';
import Text from '@/components/Text';
import { Colors, Radii, Spacing, Outfit, Strokes } from '@/constants/tokens';
import { AMBASSADEUR, detectOperator } from '@/constants/affilie';

// JS3 — Saisie du numéro Mobile Money. « Valider » → récapitulatif de retrait.

export default function RetraitNumero() {
  const params = useLocalSearchParams<{ number?: string; amount?: string; method?: string }>();
  const [number, setNumber] = useState(params.number ?? AMBASSADEUR.defaultNumber);
  const operator = detectOperator(number);
  const valid = number.replace(/\D/g, '').length >= 9;

  const validate = () => {
    router.replace({
      pathname: '/affilie/retrait-recap',
      params: { number, ...(params.amount ? { amount: params.amount } : {}) },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      // `padding` sur les deux OS. Le `KeyboardAvoidingView` vient de
      // `react-native-keyboard-controller` et non de React Native : même prop,
      // mais le décalage suit le clavier image par image au lieu d'attendre
      // qu'il soit posé. Cf. `docs/style-guide.md` § Les deux OS.
      behavior="padding"
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

      <ScreenFooter>
        <Button label="Valider" disabled={!valid} onPress={validate} />
      </ScreenFooter>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, paddingHorizontal: Spacing[4], paddingTop: Spacing[4] },
  label: { marginBottom: Spacing[3] },
  input: {
    // Android réserve un espace au-dessus de l'ascendante et sous la descendante
    // de la police, iOS non — cf. `components/Text.tsx`. Ce site ne passe pas par
    // l'atome, il porte donc le correctif lui-même.
    includeFontPadding: false,
    fontFamily: Outfit.semibold,
    fontSize: 24,
    color: Colors.textPrimary,
    borderBottomWidth: Strokes.thick,
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
});
