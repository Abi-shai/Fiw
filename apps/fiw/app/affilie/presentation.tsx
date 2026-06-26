import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import ScreenHeader from '@/components/ScreenHeader';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import { Colors, Radii, Spacing, Shadows, Poppins } from '@/constants/tokens';

// JS1 — Présentation du programme Affilié Réseau (UI : Ambassadeur).
// Point d'entrée du parcours d'activation.

type Step = { icon: IconName; title: string; body: string };

const STEPS: Step[] = [
  {
    icon: 'share',
    title: 'Partagez votre code',
    body: 'Invitez vos proches, vos chauffeurs et vos commerçants avec votre code ou votre QR.',
  },
  {
    icon: 'car',
    title: 'Ils font des courses',
    body: 'Chaque personne inscrite avec votre code rejoint votre réseau d’affiliés.',
  },
  {
    icon: 'coins',
    title: 'Vous touchez 2 %',
    body: 'Vous gagnez 2 % du prix de chaque course faite par vos affiliés, à vie.',
  },
];

export default function Presentation() {
  return (
    <View style={styles.container}>
      <ScreenHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Icon name="gift" size={40} color={Colors.primary} weight="fill" />
        </View>
        <Text variant="display" style={styles.title}>Gagnez de l’argent en partageant Fiw</Text>
        <Text variant="body" color={Colors.textSecondary} style={styles.subtitle}>
          Devenez Ambassadeur et touchez une commission sur chaque course de votre réseau.
        </Text>

        <View style={styles.steps}>
          {STEPS.map((s, i) => (
            <View key={s.title} style={styles.step}>
              <View style={styles.stepIcon}>
                <Icon name={s.icon} size={22} color={Colors.primary} />
              </View>
              <View style={styles.stepText}>
                <Text variant="label">{s.title}</Text>
                <Text variant="bodySmall" color={Colors.textSecondary} style={styles.stepBody}>{s.body}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Exemple chiffré */}
        <View style={styles.example}>
          <Text variant="caption" color={Colors.textTertiary} style={styles.kicker}>EXEMPLE</Text>
          <Text variant="body" style={styles.exampleText}>
            Un chauffeur actif dans votre réseau, c’est environ{' '}
            <Text variant="body" color={Colors.primary} style={styles.bold}>3 000 F</Text> par mois pour vous.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Activer mon profil" onPress={() => router.push('/affilie/conditions')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing[4], paddingBottom: Spacing[8] },

  hero: {
    width: 72, height: 72,
    borderRadius: Radii.lg,
    backgroundColor: Colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing[2],
    marginBottom: Spacing[4],
  },
  title: { letterSpacing: -0.5 },
  subtitle: { marginTop: Spacing[3] },

  steps: { marginTop: Spacing[8], gap: Spacing[4] },
  step: { flexDirection: 'row', gap: Spacing[3], alignItems: 'flex-start' },
  stepIcon: {
    width: 44, height: 44,
    borderRadius: Radii.md,
    backgroundColor: Colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { flex: 1, paddingTop: 2 },
  stepBody: { marginTop: 2 },

  example: {
    marginTop: Spacing[8],
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: Spacing[6],
    ...Shadows.sm,
  },
  kicker: { textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing[2] },
  exampleText: { lineHeight: 24 },
  bold: { fontFamily: Poppins.semibold },

  footer: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[8],
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    backgroundColor: Colors.bg,
  },
});
