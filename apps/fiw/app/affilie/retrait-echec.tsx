import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import { Colors, Radii, Spacing } from '@/constants/tokens';

// JS3 — Échec de retrait : diagnostiquer + rassurer (l'argent n'a pas bougé).

export default function RetraitEchec() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing[8] }]}>
      <View style={styles.body}>
        <View style={styles.badge}>
          <Icon name="xCircle" size={56} color={Colors.error} weight="fill" />
        </View>
        <Text variant="display" align="center" style={styles.title}>Retrait impossible</Text>
        <Text variant="body" color={Colors.textSecondary} align="center" style={styles.cause}>
          Le numéro Mobile Money semble invalide. Vérifiez-le et réessayez.
        </Text>

        <View style={styles.reassure}>
          <Icon name="info" size={18} color={Colors.primary} />
          <Text variant="bodySmall" color={Colors.gray700} style={styles.reassureText}>
            Rassurez-vous : l’argent n’a pas quitté votre Wallet.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Réessayer" onPress={() => router.replace('/affilie/retrait-recap')} />
        <Button
          label="Contacter le support"
          variant="secondary"
          icon="lifebuoy"
          onPress={() => Haptics.selectionAsync()}
        />
        <Button label="Retour au tableau de bord" variant="ghost" onPress={() => router.replace('/affilie/dashboard')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, paddingHorizontal: Spacing[6] },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: {
    width: 112, height: 112, borderRadius: Radii.pill,
    backgroundColor: Colors.errorSubtle,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing[6],
  },
  title: { letterSpacing: -0.5 },
  cause: { marginTop: Spacing[3], maxWidth: 300 },
  reassure: {
    flexDirection: 'row', gap: Spacing[2], alignItems: 'center',
    backgroundColor: Colors.primarySubtle,
    borderRadius: Radii.md,
    padding: Spacing[4],
    marginTop: Spacing[6],
  },
  reassureText: { flex: 1 },
  footer: { gap: Spacing[2] },
});
