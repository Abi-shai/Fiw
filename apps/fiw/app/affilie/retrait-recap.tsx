import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenHeader from '@/components/ScreenHeader';
import ScreenFooter from '@/components/ScreenFooter';
import Button from '@/components/Button';
import Text from '@/components/Text';
import InfoRow from '@/components/InfoRow';
import Divider from '@/components/Divider';
import { Colors, Radii, Spacing, Strokes } from '@/constants/tokens';
import { AFFILIE_RESEAU, fcfa, detectOperator } from '@/constants/affilie';

// JS3 — Le récapitulatif, dernier point avant l'envoi.
//
// ── Passe du 27 septembre 2026 ─────────────────────────────────────────────
// · **La pilule bleue du numéro tombe.** Fond `primarySubtle` + texte bleu +
//   crayon : un bleu clair employé comme fond de mise en avant, ce que le style
//   guide proscrit, pour porter une action qui a déjà sa forme au système. Le
//   numéro redevient une **rangée de restitution** (`InfoRow`) comme les
//   autres, et « Modifier » un `Button variant="link"` — la forme exacte de
//   l'action-lien inline.
// · **Les rangées libellé/valeur deviennent des `InfoRow`** : c'est le
//   composant du système pour un fait déjà renseigné, et elles le refaisaient
//   à la main avec leurs propres filets.
// · Le `letterSpacing: -0.8` du montant disparaît (hors échelle).
export default function RetraitRecap() {
  const params = useLocalSearchParams<{ number?: string; amount?: string; method?: string }>();
  const number = params.number ?? AFFILIE_RESEAU.defaultNumber;
  const operator = params.method ?? detectOperator(number);
  const amount = params.amount ? parseInt(params.amount, 10) : AFFILIE_RESEAU.balance;

  const editNumber = () =>
    router.push({
      pathname: '/affilie/retrait-numero',
      params: { number, ...(params.amount ? { amount: params.amount } : {}) },
    });

  return (
    <View style={styles.page}>
      <ScreenHeader title="Retrait" />
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text variant="body" color={Colors.textSecondary} align="center">Vous retirez</Text>
          <Text variant="display" align="center" style={styles.amount}>{fcfa(amount)}</Text>
        </View>

        {/* Une seule carte de restitution : où va l'argent, par quoi, à quel
            prix, en combien de temps. Le numéro est le seul fait modifiable,
            d'où le lien qui le suit. */}
        <View style={styles.details}>
          <InfoRow label="Numéro" value={number} />
          <View style={styles.editRow}>
            <Button label="Modifier le numéro" variant="link" size="sm" onPress={editNumber} />
          </View>
          <Divider />
          {operator ? (
            <>
              <InfoRow label="Opérateur" value={operator} />
              <Divider />
            </>
          ) : null}
          <InfoRow label="Frais de retrait" value="Gratuit" />
          <Divider />
          <InfoRow label="Délai estimé" value="Quelques minutes" />
        </View>
      </View>

      <ScreenFooter>
        <Button label="Confirmer le retrait" onPress={() => router.replace({
          pathname: '/affilie/retrait-traitement',
          params: { number, amount: String(amount) },
        })} />
      </ScreenFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, paddingHorizontal: Spacing[4] },

  hero: { alignItems: 'center', paddingTop: Spacing[8], paddingBottom: Spacing[8] },
  amount: { marginTop: Spacing[1] },

  // Même habillage que les cartes de la section : surface, rayon `lg`, liseré
  // `borderSubtle`, aucune ombre.
  details: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: Strokes.thin,
    borderColor: Colors.borderSubtle,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    gap: Spacing[4],
  },
  // Le lien s'aligne à gauche, sous la valeur qu'il modifie.
  editRow: { alignItems: 'flex-start', marginTop: -Spacing[3] },
});
