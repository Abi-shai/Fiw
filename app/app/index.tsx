import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, KeyboardAvoidingView,
  Platform, TouchableOpacity, Image, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import Button from '@/components/Button';

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
            <Text style={styles.logoText}>fiw</Text>
          </View>
          <Text style={styles.tagline}>Votre mobilité à Dakar</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Bienvenue</Text>
          <Text style={styles.subtitle}>Entrez votre numéro pour continuer</Text>

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
            <Text style={styles.createText}>Pas encore de compte ? <Text style={styles.createBold}>Créer un compte</Text></Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>En continuant, vous acceptez les{' '}
            <Text style={styles.footerLink}>Conditions d'utilisation</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
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
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  form: { flex: 1 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 14,
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
    color: Colors.black,
    fontWeight: '500',
  },
  btn: { marginTop: 8 },
  createLink: { marginTop: 20, alignItems: 'center' },
  createText: { fontSize: 14, color: Colors.textSecondary },
  createBold: { color: Colors.primary, fontWeight: '600' },
  footer: { paddingVertical: 32, alignItems: 'center' },
  footerText: { fontSize: 12, color: Colors.textTertiary, textAlign: 'center' },
  footerLink: { color: Colors.primary },
});
