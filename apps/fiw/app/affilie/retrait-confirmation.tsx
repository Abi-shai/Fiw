import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import { Colors, Radii, Spacing } from '@/constants/tokens';
import { AMBASSADEUR, fcfa } from '@/constants/affilie';

// JS3 — Confirmation de retrait (succès).

export default function RetraitConfirmation() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing[8] }]}>
      <View style={styles.body}>
        <View style={styles.badge}>
          <Icon name="check" size={56} color={Colors.success} weight="fill" />
        </View>
        <Text variant="display" align="center" style={styles.title}>Retrait envoyé</Text>
        <Text variant="heading1" color={Colors.primary} align="center" style={styles.amount}>
          {fcfa(AMBASSADEUR.balance)}
        </Text>
        <Text variant="body" color={Colors.textSecondary} align="center">
          vers le {AMBASSADEUR.defaultNumber}
        </Text>

        <View style={styles.statusPill}>
          <Icon name="hourglass" size={14} color={Colors.warning} />
          <Text variant="caption" color={Colors.gray700}>En cours d’arrivée</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Retour au tableau de bord" onPress={() => router.replace('/affilie/dashboard')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, paddingHorizontal: Spacing[6] },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: {
    width: 112, height: 112, borderRadius: Radii.pill,
    backgroundColor: Colors.successSubtle,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing[6],
  },
  title: { letterSpacing: -0.5 },
  amount: { marginTop: Spacing[2] },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.warningSubtle,
    paddingHorizontal: Spacing[3], paddingVertical: 6,
    borderRadius: Radii.pill,
    marginTop: Spacing[6],
  },
  footer: {},
});
