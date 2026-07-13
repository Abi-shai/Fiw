import React, { useState } from 'react';
import {
  View, StyleSheet, TextInput, KeyboardAvoidingView,
  Platform, TouchableOpacity, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, Radii, Shadows, Poppins } from '@/constants/tokens';
import Text from '@/components/Text';
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
          <View style={styles.logoBox}>
            <Text style={{ fontFamily: Poppins.bold, fontSize: 32, color: Colors.textOnPrimary, letterSpacing: -1 }}>
              fiw
            </Text>
            <Text style={{ fontFamily: Poppins.bold, fontSize: 14, color: Colors.primarySubtle, marginLeft: 4, marginBottom: 4, letterSpacing: 1 }}>
              pro
            </Text>
          </View>
          <Text variant="body" color={Colors.textSecondary}>Votre espace prestataire</Text>
        </View>

        <View style={styles.form}>
          <Text variant="display" style={{ marginBottom: Spacing[2] }}>Connexion</Text>
          <Text variant="body" color={Colors.textSecondary} style={{ marginBottom: Spacing[8] }}>
            Entrez votre numéro pour continuer
          </Text>

          <View style={styles.inputWrapper}>
            {/* 🇸🇳 drapeau emoji — pas d'équivalent Phosphor */}
            <Text style={{ fontSize: 22, marginRight: 10 }}>🇸🇳</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+221 XX XXX XX XX"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <Button label="Continuer" onPress={() => router.push('/otp')} style={{ marginTop: Spacing[2] }} />

          <TouchableOpacity onPress={() => router.push('/otp')} style={styles.createLink}>
            <Text variant="bodySmall" color={Colors.textSecondary} align="center">
              Pas encore inscrit ?{' '}
              <Text variant="bodySmall" color={Colors.primary} style={{ fontFamily: Poppins.semibold }}>
                Créer un compte
              </Text>
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
  scroll: { flexGrow: 1, paddingHorizontal: Spacing[6] },
  header: { alignItems: 'center', paddingTop: 80, paddingBottom: Spacing[12] },
  logoBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: Radii.xl,
    marginBottom: Spacing[4],
    ...Shadows.lg,
  },
  form: { flex: 1 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg,
    borderRadius: Radii.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[4],
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: Colors.textPrimary,
    fontFamily: Poppins.medium,
  },
  createLink: { marginTop: Spacing[6], alignItems: 'center' },
  footer: { paddingVertical: Spacing[8], alignItems: 'center' },
});
