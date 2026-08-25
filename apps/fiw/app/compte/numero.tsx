import React, { useState, useRef } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/tokens';
import ScreenHeader from '@/components/ScreenHeader';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import Text from '@/components/Text';
import PhoneField from '@/components/PhoneField';
import CodeField from '@/components/CodeField';
import Hint from '@/components/Hint';
import CountryPicker from '@/components/CountryPicker';
import { COUNTRIES, fullNumber, isComplete, type Country } from '@/constants/countries';
import { CLIENT } from '@/constants/data';

// Changement de numéro en 2 étapes : saisie (indicatif + numéro formaté par pays)
// → code de vérification envoyé par SMS au nouveau numéro (proto : simulé).
// Le numéro n'est appliqué (mutation de CLIENT) qu'après validation du code.
// Tous les pays sont acceptés : un numéro étranger reste joignable via l'appel
// in-app masqué (le prestataire n'appelle jamais le numéro en direct).
export default function NumeroScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<'number' | 'code'>('number');
  const [country, setCountry] = useState<Country>(() => COUNTRIES.find((c) => c.code === 'SN')!);
  const [digits, setDigits] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const codeRef = useRef<TextInput>(null);

  const newNumber = fullNumber(country, digits);
  const canSend = isComplete(country, digits) && newNumber !== CLIENT.phone;

  const sendCode = () => {
    setStep('code');
    setTimeout(() => codeRef.current?.focus(), 250);
  };

  const onCode = (t: string) => {
    const cleaned = t.replace(/[^0-9]/g, '').slice(0, 4);
    setCode(cleaned);
    if (cleaned.length === 4) verify(cleaned);
  };
  const verify = (final?: string) => {
    if ((final ?? code).length < 4) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      CLIENT.phone = newNumber; // appliqué seulement après vérification
      router.back();
    }, 1000);
  };

  if (step === 'number') {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Modifier le numéro" />
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text variant="body" color={Colors.textSecondary} style={styles.intro}>
            Saisissez votre nouveau numéro. Un code de vérification y sera envoyé par SMS.
          </Text>

          <Text variant="caption" color={Colors.textTertiary} style={styles.label}>Nouveau numéro</Text>
          <PhoneField
            country={country}
            digits={digits}
            onChangeDigits={setDigits}
            onPressDial={() => setPickerOpen(true)}
            autoFocus
          />

          <Hint icon="phone" style={styles.note}>
            Numéro actuel : <Text variant="captionSemibold" color={Colors.textSecondary}>{CLIENT.phone}</Text>
          </Hint>

          <Button label="Envoyer le code" onPress={sendCode} disabled={!canSend} style={styles.cta} />
        </ScrollView>

        <CountryPicker
          visible={pickerOpen}
          selectedCode={country.code}
          onSelect={(c) => { setCountry(c); setDigits(''); setPickerOpen(false); }}
          onClose={() => setPickerOpen(false)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Vérification" onBack={() => setStep('number')} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text variant="body" color={Colors.textSecondary} style={styles.intro}>
          Entrez le code envoyé par SMS au{'\n'}
          <Text variant="bodySemibold">{newNumber}</Text>
        </Text>

        <TouchableOpacity style={styles.codeRow} activeOpacity={1} onPress={() => codeRef.current?.focus()}>
          <CodeField code={code} />
        </TouchableOpacity>

        <TextInput
          ref={codeRef}
          value={code}
          onChangeText={onCode}
          keyboardType="number-pad"
          maxLength={4}
          style={styles.hiddenInput}
          autoFocus
        />

        <Button label="Vérifier" onPress={() => verify()} loading={loading} disabled={code.length < 4} style={styles.cta} />
        <Button label="Renvoyer le code" variant="link" size="sm" onPress={() => setCode('')} style={styles.resend} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  intro: { lineHeight: 22, marginBottom: 28 },
  label: { marginBottom: 8, marginLeft: 4 },

  note: { marginTop: 12, marginBottom: 24, paddingHorizontal: 4 },
  cta: { marginTop: 8 },

  codeRow: { marginBottom: 32 },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  resend: { alignSelf: 'center', marginTop: 20 },
});
