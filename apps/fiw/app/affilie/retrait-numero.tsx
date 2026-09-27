import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenHeader from '@/components/ScreenHeader';
import ScreenFooter from '@/components/ScreenFooter';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Field from '@/components/Field';
import Hint from '@/components/Hint';
import CountryPicker from '@/components/CountryPicker';
import { Colors, Spacing } from '@/constants/tokens';
import { COUNTRIES, fullNumber, isComplete, type Country } from '@/constants/countries';
import { AFFILIE_RESEAU, detectOperator } from '@/constants/affilie';

/** Les chiffres du numéro par défaut, sans l'indicatif ni les espaces. */
const DEFAULT_DIGITS = AFFILIE_RESEAU.defaultNumber.replace(/\D/g, '');

// JS3 — Vers quel numéro Mobile Money envoyer le retrait.
//
// ── Passe du 27 septembre 2026 ─────────────────────────────────────────────
// **L'écran dessinait son propre champ téléphone** : un `TextInput` en Outfit
// SemiBold 24, souligné d'un trait `thick` en **bleu marque**. Deux règles du
// style guide y passaient à la fois :
// · « Un champ au repos n'est JAMAIS bleu » — il ne marque aucun état, et le
//   bleu le mettait en concurrence avec le CTA, seule action réelle de l'écran.
// · `Field / Type=téléphone` est le **point d'entrée unique de toute saisie de
//   téléphone** — indicatif, drapeau, formatage par pays, `CountryPicker`. Cet
//   écran était le dernier du produit à le contourner.
//
// L'opérateur détecté passe en `Hint` sous le champ, au lieu d'une pastille
// bleue faite main : c'est une note qui précise, elle ne réclame rien.
export default function RetraitNumero() {
  const params = useLocalSearchParams<{ number?: string; amount?: string; method?: string }>();
  const [country, setCountry] = useState<Country>(() => COUNTRIES.find((c) => c.code === 'SN')!);
  const [digits, setDigits] = useState(() => (params.number ?? '').replace(/\D/g, '') || DEFAULT_DIGITS);
  const [pickerOpen, setPickerOpen] = useState(false);

  const numero = fullNumber(country, digits);
  const operator = detectOperator(digits);
  const valid = isComplete(country, digits);

  const validate = () => {
    router.replace({
      pathname: '/affilie/retrait-recap',
      params: { number: numero, ...(params.amount ? { amount: params.amount } : {}) },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="Numéro Mobile Money" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="body" color={Colors.textSecondary} style={styles.intro}>
          Vers quel numéro envoyer votre retrait ?
        </Text>

        <Field
          type="téléphone"
          label="Numéro Mobile Money"
          country={country}
          digits={digits}
          onChangeDigits={setDigits}
          onPressDial={() => setPickerOpen(true)}
          autoFocus
        />

        {operator && (
          <Hint icon="card" style={styles.note}>
            Compte <Text variant="captionSemibold" color={Colors.textSecondary}>{operator}</Text> détecté.
          </Hint>
        )}
      </ScrollView>

      <ScreenFooter>
        <Button label="Valider" disabled={!valid} onPress={validate} />
      </ScreenFooter>

      <CountryPicker
        visible={pickerOpen}
        selectedCode={country.code}
        onSelect={(c) => { setCountry(c); setDigits(''); setPickerOpen(false); }}
        onClose={() => setPickerOpen(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing[4], paddingTop: Spacing[4] },
  intro: { marginBottom: Spacing[5] },
  note: { marginTop: Spacing[3], paddingHorizontal: Spacing[1] },
});
