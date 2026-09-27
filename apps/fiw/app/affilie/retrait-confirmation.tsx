import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import ResultState from '@/components/ResultState';
import ScreenFooter from '@/components/ScreenFooter';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import { Colors, Radii, Spacing } from '@/constants/tokens';
import { AFFILIE_RESEAU, fcfa } from '@/constants/affilie';

// JS3 — Le retrait est parti.
//
// ── Passe du 27 septembre 2026 ─────────────────────────────────────────────
// **Corrigé : l'écran affichait le SOLDE ENTIER et le numéro par défaut**, quel
// que soit le retrait demandé — il lisait `AFFILIE_RESEAU` au lieu des
// paramètres de navigation. Retirer 2 000 F affichait « 12 400 F ».
//
// La pastille d'état garde sa forme (un seul site dans le produit, le système
// n'a pas de `Badge` pour un état d'attente) mais **ses encres sont recalées** :
// `warningInk` et non `warning`. L'ambre plein posé sur son propre palier
// subtil ne fait que 2,0:1 — ce palier-là n'existe que pour écrire dessus.
export default function RetraitConfirmation() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ number?: string; amount?: string }>();
  const number = params.number ?? AFFILIE_RESEAU.defaultNumber;
  const amount = params.amount ? parseInt(params.amount, 10) : AFFILIE_RESEAU.balance;

  return (
    <View style={[styles.page, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing[8] }]}>
      <View style={styles.body}>
        <ResultState ton="succès" titre="Retrait envoyé" corps={`vers le ${number}`}>
          <Text variant="heading1" color={Colors.primary} align="center">{fcfa(amount)}</Text>
          <View style={styles.statusPill}>
            <Icon name="hourglass" size={14} color={Colors.warningInk} />
            <Text variant="caption" color={Colors.warningInk}>En cours d’arrivée</Text>
          </View>
        </ResultState>
      </View>

      <ScreenFooter>
        <Button label="Retour à l’Affiliation" onPress={() => router.replace('/affilie/dashboard')} />
      </ScreenFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg, paddingHorizontal: Spacing[6] },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.warningSubtle,
    paddingHorizontal: Spacing[3], paddingVertical: 6,
    borderRadius: Radii.pill,
    marginTop: Spacing[6],
  },
});
