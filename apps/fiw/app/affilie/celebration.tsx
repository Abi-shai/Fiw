import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import { Colors, Radii, Spacing } from '@/constants/tokens';

// JS2 — Écran de célébration : quelqu'un a rejoint avec le code de l'Ambassadeur.
// Atteint depuis une notification push (non câblée dans le proto).

export default function Celebration() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing[8] }]}>
      <View style={styles.body}>
        <View style={styles.badge}>
          <Icon name="users" size={56} color={Colors.textOnPrimary} weight="fill" />
        </View>
        <Text variant="display" color={Colors.textOnPrimary} align="center" style={styles.title}>
          Votre réseau grandit !
        </Text>
        <Text variant="body" color={Colors.textOnPrimary} align="center" style={styles.body2}>
          Fatou vient de rejoindre Fiw avec votre code. Vous comptez maintenant 12 affiliés.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button label="Voir mon réseau" variant="secondary" onPress={() => router.replace('/affilie/reseau')} />
        <TouchableOpacity style={styles.close} activeOpacity={0.7} onPress={() => router.replace('/affilie/dashboard')}>
          <Text variant="label" color={Colors.textOnPrimary}>Fermer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary, paddingHorizontal: Spacing[6] },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: {
    width: 112, height: 112,
    borderRadius: Radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[8],
  },
  title: { letterSpacing: -0.5 },
  body2: { marginTop: Spacing[3], opacity: 0.92, maxWidth: 300 },

  footer: { gap: Spacing[2] },
  close: { alignItems: 'center', paddingVertical: Spacing[3] },
});
