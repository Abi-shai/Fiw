import React, { useState } from 'react';
import {
  View, StyleSheet, KeyboardAvoidingView,
  Platform, TouchableOpacity, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/tokens';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Logo from '@/components/Logo';
import PhoneField from '@/components/PhoneField';
import CountryPicker from '@/components/CountryPicker';
import { COUNTRIES, isComplete, type Country } from '@/constants/countries';

export default function OnboardingScreen() {
  const [country, setCountry] = useState<Country>(() => COUNTRIES.find((c) => c.code === 'SN')!);
  const [digits, setDigits] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Logo size={80} />
          <Text variant="body" color={Colors.textSecondary} style={styles.tagline}>Votre mobilité à Dakar</Text>
        </View>

        <View style={styles.form}>
          <Text variant="display" style={styles.title}>Bienvenue</Text>
          <Text variant="body" color={Colors.textSecondary} style={styles.subtitle}>Entrez votre numéro pour continuer</Text>

          <PhoneField
            country={country}
            digits={digits}
            onChangeDigits={setDigits}
            onPressDial={() => setPickerOpen(true)}
          />

          <Button
            label="Se connecter"
            onPress={() => router.push('/otp')}
            disabled={!isComplete(country, digits)}
            style={styles.btn}
          />

          <TouchableOpacity onPress={() => router.push('/otp')} style={styles.createLink}>
            <Text variant="bodySmall" color={Colors.textSecondary}>
              Pas encore de compte ? <Text variant="bodySmallSemibold" color={Colors.primary}>Créer un compte</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text variant="caption" color={Colors.textTertiary} align="center">
            En continuant, vous acceptez les{' '}
            <Text variant="caption" color={Colors.primary}>Conditions d'utilisation</Text>
          </Text>
        </View>
      </ScrollView>

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
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 48,
  },
  tagline: { marginTop: 16 },
  form: { flex: 1 },
  title: { marginBottom: 8 },
  subtitle: { marginBottom: 32 },
  btn: { marginTop: 24 },
  createLink: { marginTop: 20, alignItems: 'center' },
  footer: { paddingVertical: 32, alignItems: 'center' },
});
