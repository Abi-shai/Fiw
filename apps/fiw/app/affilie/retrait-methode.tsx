import React, { useState } from 'react';
import { View, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import ScreenHeader from '@/components/ScreenHeader';
import ScreenFooter from '@/components/ScreenFooter';
import Button from '@/components/Button';
import Text from '@/components/Text';
import List from '@/components/List';
import ListRow from '@/components/ListRow';
import Radio from '@/components/Radio';
import PayLogo from '@/components/PayLogo';
import { Colors, Outfit, SectionLabel, Spacing } from '@/constants/tokens';
import { AFFILIE_RESEAU, WITHDRAW_MIN, fcfa } from '@/constants/affilie';

/** Retrait du filet pour une tête de `PayLogo` : 16 (padding de carte) + 56
 *  (logo) + 12 (gouttière). Et non 0 : le filet pleine largeur est réservé aux
 *  listes posées DANS UNE FEUILLE — celle de `PaymentSheet` l'est, celle-ci est
 *  sur un écran et garde son retrait, aligné sous le texte. */
const INSET_PAYLOGO = 84;

type Operator = { id: string; name: string };

/** Les trois opérateurs Mobile Money du marché dakarois. Plus de `color` : le
 *  logo porte la marque, et Free Money — qui n'a pas encore d'asset — prend le
 *  médaillon de repli de `PayLogo`. */
const OPERATORS: Operator[] = [
  { id: 'orange', name: 'Orange Money' },
  { id: 'wave',   name: 'Wave' },
  { id: 'free',   name: 'Free Money' },
];

// JS3 — Combien, et vers quel opérateur.
//
// ── Passe du 27 septembre 2026 ─────────────────────────────────────────────
// · **La rangée élue n'est plus peinte en `primarySubtle`.** C'est la règle la
//   plus explicite du style guide sur ce point : « un bleu clair ne sert jamais
//   de fond de mise en avant — il se fond au lieu de ressortir, et se lit comme
//   un trou dans la carte plutôt que comme l'élu ». L'élu se dit ici par le
//   `Radio` du système, comme dans la feuille de paiement.
// · **Les pastilles de couleur de 12 px cèdent la place aux LOGOS.** « Moyens de
//   paiement = logos en assets » est écrit au §Icônes ; le composant existait
//   déjà dans `PaymentSheet`, il est simplement devenu partageable (`PayLogo`).
// · **« Tout retirer » devient un `Button variant="link"`** au lieu d'un
//   `TouchableOpacity` + texte bleu en `caption` 12 — une action-lien inline,
//   exactement le rôle de cette variante.
// · Le `letterSpacing: -1` de la saisie de montant disparaît. La TAILLE, elle,
//   reste hors échelle et assumée : le style guide la liste déjà (« saisies de
//   montant `affilie` »), une saisie de montant n'est pas du texte courant.
export default function RetraitMethode() {
  const { balance, defaultNumber } = AFFILIE_RESEAU;
  const [operator, setOperator] = useState<Operator>(OPERATORS[0]);
  const [raw, setRaw] = useState('');

  const amount = parseInt(raw.replace(/\D/g, '') || '0', 10);
  const tooLow = raw.length > 0 && amount > 0 && amount < WITHDRAW_MIN;
  const tooHigh = amount > balance;
  const valid = amount >= WITHDRAW_MIN && amount <= balance;

  const onContinue = () => {
    router.push({
      pathname: '/affilie/retrait-recap',
      params: { method: operator.name, number: defaultNumber, amount: String(amount) },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="Retirer" />

      <View style={styles.content}>
        <View style={styles.hero}>
          <Text variant="caption" color={Colors.textTertiary} style={styles.kicker}>Montant</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={[styles.amountInput, (tooLow || tooHigh) && styles.amountInputError]}
              value={raw}
              onChangeText={setRaw}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={Colors.textTertiary}
              textAlign="center"
              maxLength={7}
              autoFocus
            />
            <Text variant="heading2" color={Colors.textSecondary} style={styles.currency}>F</Text>
          </View>

          <View style={styles.balanceLine}>
            <Text variant="caption" color={Colors.textTertiary}>
              Disponible : <Text variant="caption" color={Colors.textPrimary}>{fcfa(balance)}</Text>
            </Text>
            <Button
              label="Tout retirer"
              variant="link"
              size="sm"
              onPress={() => setRaw(String(balance))}
            />
          </View>

          {tooLow && (
            <Text variant="caption" color={Colors.error}>Minimum {fcfa(WITHDRAW_MIN)}</Text>
          )}
          {tooHigh && (
            <Text variant="caption" color={Colors.error}>Solde insuffisant</Text>
          )}
        </View>

        {/* Choix d'opérateur : même grammaire que la feuille de paiement des
            flux Transport et Livraison — logo en tête, `Radio` en fin de
            rangée, filet pleine largeur. Deux endroits où l'on choisit par quoi
            l'argent passe, un seul dessin. */}
        <List title="Opérateur" style_="carte" inset={INSET_PAYLOGO} style={styles.operators}>
          {OPERATORS.map((o) => (
            <ListRow
              key={o.id}
              leading={<PayLogo id={o.id} />}
              title={o.name}
              trailing={<Radio selected={operator.id === o.id} />}
              onPress={() => { Haptics.selectionAsync(); setOperator(o); }}
            />
          ))}
        </List>
      </View>

      <ScreenFooter>
        <Button label="Continuer" disabled={!valid} onPress={onContinue} />
      </ScreenFooter>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, paddingHorizontal: Spacing[4] },

  hero: { alignItems: 'center', paddingTop: Spacing[8], gap: 6 },
  kicker: { ...SectionLabel },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing[2] },
  // Hors échelle et assumé (§« Ce qui reste hors échelle ») : c'est une saisie
  // de montant, pas du texte courant. Sans `letterSpacing` : l'échelle
  // typographique n'a plus d'interlettrage nulle part.
  amountInput: {
    fontFamily: Outfit.semibold,
    fontSize: 48,
    color: Colors.textPrimary,
    padding: 0,
    minWidth: 80,
  },
  amountInputError: { color: Colors.error },
  currency: { paddingBottom: 4 },

  balanceLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },

  operators: { marginTop: Spacing[8] },
});
