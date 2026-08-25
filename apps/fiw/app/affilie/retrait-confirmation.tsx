import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import ResultState from '@/components/ResultState';
import ScreenFooter from '@/components/ScreenFooter';
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
        <ResultState
          ton="succès"
          titre="Retrait envoyé"
          corps={`vers le ${AMBASSADEUR.defaultNumber}`}
        >
          <Text variant="heading1" color={Colors.primary} align="center">
            {fcfa(AMBASSADEUR.balance)}
          </Text>
          <View style={styles.statusPill}>
            <Icon name="hourglass" size={14} color={Colors.warning} />
            <Text variant="caption" color={Colors.gray700}>En cours d’arrivée</Text>
          </View>
        </ResultState>
      </View>

      <ScreenFooter>
        <Button label="Retour au tableau de bord" onPress={() => router.replace('/affilie/dashboard')} />
      </ScreenFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, paddingHorizontal: Spacing[6] },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.warningSubtle,
    paddingHorizontal: Spacing[3], paddingVertical: 6,
    borderRadius: Radii.pill,
    marginTop: Spacing[6],
  },
});
