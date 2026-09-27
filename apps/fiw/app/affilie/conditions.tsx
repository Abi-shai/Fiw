import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import ScreenHeader from '@/components/ScreenHeader';
import Text from '@/components/Text';
import StepList, { type StepItem } from '@/components/StepList';
import { Colors, Spacing } from '@/constants/tokens';

// JS1 — Le contrat d'affiliation, atteint depuis la mention du pied de
// `presentation`. Page de LECTURE : on en revient par la flèche.
//
// ── Ce qui a changé (27 septembre 2026) ───────────────────────────────────
// Elle portait sa propre case à cocher et son propre « J'accepte et je
// commence » qui activait le profil — alors que `presentation` avait déjà une
// case (pré-cochée) et un bouton qui activait, lui aussi. Un même contrat était
// donc accepté à deux endroits, par deux chemins, avec deux libellés.
// L'acceptation est désormais portée UNE fois, par le CTA de `presentation`, et
// annoncée par la mention qui mène ici. Cette page n'active plus rien.
//
// Vocabulaire : « les personnes inscrites avec votre code » devient « les
// prestataires » — la commission ne tombe que sur leurs courses (recap du
// 30 août 2026), et `CONTEXT.md` proscrit « chauffeur » hors Transport.
const CLAUSES: StepItem[] = [
  { icon: 'check', body: 'Vous touchez 2 % du montant brut de chaque course réalisée par les prestataires inscrits avec votre code.' },
  { icon: 'check', body: 'Les commissions sont créditées sur votre Wallet et retirables vers Mobile Money à partir de 1 000 F.' },
  { icon: 'check', body: 'Fiw peut suspendre les retraits en cas d’usage frauduleux du programme.' },
  { icon: 'check', body: 'Le programme peut évoluer ; vous serez notifié de tout changement des règles de commission.' },
];

export default function Conditions() {
  return (
    <View style={styles.page}>
      <ScreenHeader title="Conditions d’utilisation" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text variant="body" color={Colors.textSecondary} style={styles.intro}>
          En activant votre profil Affilié Réseau, vous acceptez le contrat
          d’affiliation Fiw :
        </Text>

        {/* Médaillons en ton `neutre` : les clauses ne sont pas la matière
            qu'on vient vendre, elles déroulent un texte déjà annoncé. Quatre
            pastilles bleues auraient donné à un contrat le poids d'une
            proposition. Les coches étaient jusqu'ici des glyphes `check` nus en
            `fill` — un cercle plein Phosphor, soit la pastille dessinée par
            l'icône plutôt que par le système. */}
        <StepList items={CLAUSES} ton="neutre" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing[4], paddingBottom: Spacing[8] },
  intro: { marginBottom: Spacing[6] },
});
