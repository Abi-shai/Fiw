import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Button from '@/components/Button';
import ResultState from '@/components/ResultState';
import ScreenFooter from '@/components/ScreenFooter';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import { Colors, Radii, Spacing } from '@/constants/tokens';

// JS3 — Échec de retrait : diagnostiquer + rassurer (l'argent n'a pas bougé).

export default function RetraitEchec() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing[8] }]}>
      <View style={styles.body}>
        <ResultState
          ton="erreur"
          titre="Retrait impossible"
          corps="Le numéro Mobile Money semble invalide. Vérifiez-le et réessayez."
        >
          <View style={styles.reassure}>
            <Icon name="info" size={18} color={Colors.primary} />
            <Text variant="bodySmall" color={Colors.gray700} style={styles.reassureText}>
              Rassurez-vous : l’argent n’a pas quitté votre Wallet.
            </Text>
          </View>
        </ResultState>
      </View>

      <ScreenFooter>
        <Button label="Réessayer" onPress={() => router.replace('/affilie/retrait-recap')} />
        <Button
          label="Contacter le support"
          variant="secondary"
          icon="lifebuoy"
          onPress={() => Haptics.selectionAsync()}
        />
        <Button label="Retour au tableau de bord" variant="link" onPress={() => router.replace('/affilie/dashboard')} />
      </ScreenFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, paddingHorizontal: Spacing[6] },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  reassure: {
    flexDirection: 'row', gap: Spacing[2], alignItems: 'center',
    backgroundColor: Colors.primarySubtle,
    borderRadius: Radii.md,
    padding: Spacing[4],
    marginTop: Spacing[6],
  },
  reassureText: { flex: 1 },
});
