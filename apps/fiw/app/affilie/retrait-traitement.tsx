import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import Text from '@/components/Text';
import { Colors, Spacing } from '@/constants/tokens';

// JS3 — Traitement du retrait. Bascule automatiquement vers Confirmation
// (succès) ou Échec. Proto : toujours succès après un court délai.

export default function RetraitTraitement() {
  useEffect(() => {
    const t = setTimeout(() => router.replace('/affilie/retrait-confirmation'), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text variant="heading2" align="center" style={styles.title}>Traitement en cours…</Text>
      <Text variant="bodySmall" color={Colors.textSecondary} align="center" style={styles.body}>
        Nous envoyons votre retrait. Ne fermez pas l’application.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing[8] },
  title: { marginTop: Spacing[6] },
  body: { marginTop: Spacing[2], maxWidth: 280 },
});
