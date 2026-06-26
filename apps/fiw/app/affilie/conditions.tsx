import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import ScreenHeader from '@/components/ScreenHeader';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import { Colors, Radii, Spacing } from '@/constants/tokens';

// JS1 — Conditions d'utilisation (contrat d'affiliation).
// « J'accepte et je commence » → tableau de bord (premier accès).

const CLAUSES = [
  'Vous touchez 2 % du montant brut de chaque course réalisée par les personnes inscrites avec votre code.',
  'Les commissions sont créditées sur votre Wallet et retirables vers Mobile Money à partir de 1 000 F.',
  'Pendant la phase de lancement, vos gains sont comptabilisés mais le retrait est différé (statut Membre Fondateur).',
  'Fiw peut suspendre les retraits en cas d’usage frauduleux du programme.',
  'Le programme peut évoluer ; vous serez notifié de tout changement des règles de commission.',
];

export default function Conditions() {
  const [accepted, setAccepted] = useState(false);

  const start = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/affilie/dashboard');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Conditions d’utilisation" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text variant="body" color={Colors.textSecondary} style={styles.intro}>
          En activant votre profil Ambassadeur, vous acceptez le contrat d’affiliation Fiw :
        </Text>

        {CLAUSES.map((c, i) => (
          <View key={i} style={styles.clause}>
            <Icon name="check" size={20} color={Colors.primary} weight="fill" />
            <Text variant="bodySmall" style={styles.clauseText}>{c}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.checkRow} activeOpacity={0.7} onPress={() => setAccepted((v) => !v)}>
          <View style={[styles.checkbox, accepted && styles.checkboxOn]}>
            {accepted && <Icon name="tick" size={16} color={Colors.textOnPrimary} weight="bold" />}
          </View>
          <Text variant="bodySmall" style={styles.checkLabel}>
            J’ai lu et j’accepte le contrat d’affiliation.
          </Text>
        </TouchableOpacity>
        <Button label="J’accepte et je commence" disabled={!accepted} onPress={start} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing[4], paddingBottom: Spacing[8] },
  intro: { marginBottom: Spacing[6] },

  clause: { flexDirection: 'row', gap: Spacing[3], alignItems: 'flex-start', marginBottom: Spacing[4] },
  clauseText: { flex: 1, paddingTop: 1 },

  footer: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[8],
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    backgroundColor: Colors.bg,
    gap: Spacing[4],
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  checkbox: {
    width: 24, height: 24,
    borderRadius: Radii.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkLabel: { flex: 1 },
});
