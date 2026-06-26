import React, { useState } from 'react';
import {
  View, StyleSheet, TextInput, KeyboardAvoidingView,
  Platform, TouchableOpacity, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Radii, Poppins } from '@/constants/tokens';
import Button from '@/components/Button';
import Text from '@/components/Text';

export default function OnboardingScreen() {
  const [phone, setPhone] = useState('+221 77 000 00 00');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text color={Colors.surface} style={styles.logoText}>fiw</Text>
          </View>
          <Text variant="body" color={Colors.textSecondary}>Votre mobilité à Dakar</Text>
        </View>

        <View style={styles.form}>
          <Text variant="display" style={styles.title}>Bienvenue</Text>
          <Text variant="body" color={Colors.textSecondary} style={styles.subtitle}>Entrez votre numéro pour continuer</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.flag}>🇸🇳</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+221 XX XXX XX XX"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <Button
            label="Se connecter"
            onPress={() => router.push('/otp')}
            style={styles.btn}
          />

          <TouchableOpacity onPress={() => router.push('/otp')} style={styles.createLink}>
            <Text variant="bodySmall" color={Colors.textSecondary}>
              Pas encore de compte ? <Text variant="bodySmall" color={Colors.primary} style={styles.createBold}>Créer un compte</Text>
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
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: Radii.lg,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontFamily: Poppins.bold,
    fontSize: 32,
    letterSpacing: -1,
  },
  form: { flex: 1 },
  title: { marginBottom: 8 },
  subtitle: { marginBottom: 32 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg,
    borderRadius: Radii.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  flag: { fontSize: 22, marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 17,
    color: Colors.textPrimary,
    fontFamily: Poppins.medium,
  },
  btn: { marginTop: 8 },
  createLink: { marginTop: 20, alignItems: 'center' },
  createBold: { fontFamily: Poppins.semibold },
  footer: { paddingVertical: 32, alignItems: 'center' },
});
