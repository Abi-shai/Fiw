import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '@/components/ScreenHeader';
import ScreenFooter from '@/components/ScreenFooter';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import AlertBadge from '@/components/AlertBadge';
import StepList from '@/components/StepList';
import { Colors, Radii, Spacing, Strokes } from '@/constants/tokens';
import { PRESTATAIRE, WALLET_LOW, fcfa } from '@/constants/data';

/**
 * **Vous ne recevez plus de mission.**
 *
 * ── Pourquoi cet écran existe (piste O3 du benchmark) ─────────────────────
 * La recherche sur les plaintes de chauffeurs donne un résultat net, et il
 * arrive **avant les tarifs** : la **désactivation sans recours lisible**. Pas
 * de délai annoncé, pas d'interlocuteur, pas d'état d'avancement. Les témoignages
 * décrivent un processus d'appel qui « ressemble à une impasse ».
 *
 * Fiw a deux blocages — Wallet vide (`CONTEXT.md` : *« Wallet vide = accès
 * bloqué »*) et l'état **Gelé** — et n'avait d'écran pour ni l'un ni l'autre.
 * C'est le point où Fiw peut être **visiblement meilleur** que la concurrence
 * pour un coût faible.
 *
 * ── Les trois choses qu'il doit dire, dans cet ordre ──────────────────────
 * 1. **Ce qui est arrivé**, nommé sans détour.
 * 2. **Ce qu'il faut faire**, sous forme d'actes et non de conditions.
 * 3. **Sous combien de temps ça se débloque** — c'est le manque le plus cité,
 *    et le moins cher à combler.
 *
 * ⚠️ **Les deux blocages ne se ressemblent pas, et l'écran ne les traite pas
 * pareil.** Le Wallet vide se règle **seul et tout de suite** : c'est une
 * action, pas une sanction, et le ton reste neutre. L'état Gelé est une
 * **suspension**, elle se règle avec quelqu'un, et le délai devient la seule
 * information qui compte. Fondre les deux dans un seul écran rouge
 * traiterait un Prestataire qui a juste oublié de recharger comme un fraudeur.
 */
type Motif = 'wallet' | 'gele';

export default function Bloque() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ motif?: string }>();
  const motif: Motif = params.motif === 'gele' ? 'gele' : 'wallet';

  const gele = motif === 'gele';

  return (
    <View style={styles.page}>
      <ScreenHeader title={gele ? 'Compte suspendu' : 'Wallet vide'} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tete}>
          {/* `alerte` pour la suspension, qui est subie. Pour le Wallet, le ton
              reste `alerte` aussi — l'accès EST coupé — mais tout le reste de
              l'écran dit que c'est à portée de main. */}
          <AlertBadge icon={gele ? 'lock' : 'wallet'} ton="alerte" />
          <Text variant="heading1" align="center" style={styles.titre}>
            Vous ne recevez plus de mission
          </Text>
          <Text variant="body" color={Colors.textSecondary} align="center">
            {gele
              ? 'Votre compte est suspendu le temps d’une vérification. Vos gains déjà encaissés ne sont pas touchés.'
              : `Votre Wallet est à ${fcfa(PRESTATAIRE.walletSolde)}. Fiw y prélève sa commission après chaque course : sans solde, aucune mission ne peut vous être attribuée.`}
          </Text>
        </View>

        {/* Le délai, encadré — c'est l'information que les apps du corpus
            n'affichent jamais, et celle que les chauffeurs réclament. */}
        <View style={[styles.delai, gele ? styles.delaiGele : styles.delaiWallet]}>
          <Icon
            name={gele ? 'hourglass' : 'lightning'}
            size={20}
            weight="bold"
            color={gele ? Colors.warningInk : Colors.successInk}
          />
          <View style={styles.flex1}>
            <Text variant="label">{gele ? 'Réponse sous 48 h' : 'Déblocage immédiat'}</Text>
            <Text variant="bodySmall" color={Colors.textSecondary}>
              {gele
                ? 'Un conseiller examine votre dossier et vous rappelle. Vous recevrez une notification.'
                : 'Dès que votre recharge est reçue, vous pouvez repasser en ligne.'}
            </Text>
          </View>
        </View>

        <Text variant="heading2" style={styles.sousTitre}>Ce qu'il faut faire</Text>
        <StepList
          items={
            gele
              ? [
                  { icon: 'chat', title: 'Contactez le support', body: 'Depuis cet écran, avec votre identifiant déjà rempli.' },
                  { icon: 'document', title: 'Tenez vos pièces à portée', body: 'Le conseiller peut demander une pièce à jour.' },
                  { icon: 'bell', title: 'Attendez la notification', body: 'Vous êtes prévenu dès que le compte est rouvert.' },
                ]
              : [
                  { icon: 'add', title: 'Rechargez votre Wallet', body: `Par Wave, Orange Money ou Free Money. ${fcfa(WALLET_LOW)} suffisent pour repartir.` },
                  { icon: 'car', title: 'Repassez en ligne', body: 'Aucune validation à attendre — la recharge débloque tout de suite.' },
                ]
          }
        />

        {!gele && (
          <View style={styles.eviter}>
            <Icon name="shield" size={18} weight="bold" color={Colors.primary} />
            <Text variant="bodySmall" color={Colors.textPrimary} style={styles.flex1}>
              Pour éviter la coupure, Fiw vous prévient dès que le solde passe
              sous {fcfa(WALLET_LOW)}.
            </Text>
          </View>
        )}
      </ScrollView>

      <ScreenFooter rule>
        {gele ? (
          <Button label="Contacter le support" icon="chat" onPress={() => router.back()} />
        ) : (
          <Button label="Recharger mon Wallet" icon="add" onPress={() => router.push('/wallet')} />
        )}
        <Button label="Retour" variant="link" onPress={() => router.back()} style={styles.retour} />
      </ScreenFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing[4], paddingTop: Spacing[2] },
  flex1: { flex: 1 },

  tete: { alignItems: 'center', gap: Spacing[3], paddingVertical: Spacing[5] },
  titre: { marginTop: Spacing[2] },

  delai: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[3],
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[4],
    marginTop: Spacing[3],
  },
  delaiWallet: { backgroundColor: Colors.successSubtle },
  delaiGele: { backgroundColor: Colors.warningSubtle },

  sousTitre: { marginTop: Spacing[7], marginBottom: Spacing[4] },

  eviter: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[3],
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: Strokes.thin, borderColor: Colors.borderSubtle,
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[3],
    marginTop: Spacing[6],
  },
  retour: { alignSelf: 'center' },
});
