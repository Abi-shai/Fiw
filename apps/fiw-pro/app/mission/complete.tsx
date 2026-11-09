import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Button from '@/components/Button';
import ScreenFooter from '@/components/ScreenFooter';
import Text from '@/components/Text';
import Divider from '@/components/Divider';
import Icon from '@/components/Icon';
import Hint from '@/components/Hint';
import InfoRow from '@/components/InfoRow';
import { Colors, Radii, SectionLabel, Spacing, Strokes } from '@/constants/tokens';
import { COMMISSION_RATE, MISSION_INCOMING, PRESTATAIRE, fcfa } from '@/constants/data';

const LIBELLE_NOTE = ['', 'Très difficile', 'Difficile', 'Correct', 'Bon client', 'Excellent client'];

/**
 * **Course terminée.**
 *
 * ── Une erreur de la version de juin, corrigée ici ────────────────────────
 * L'écran annonçait « **Net perçu** = brut − commission », soit 1 892 F sur une
 * course à 2 200 F. **C'est faux, et c'est précisément le contresens que le
 * mimétisme du corpus produit** (cf. `docs/benchmark-fiw-pro.md` § 1) : chez
 * Bolt, Uber ou Heetch, la plateforme encaisse et reverse au chauffeur net de
 * commission — d'où un « net perçu » qui a un sens.
 *
 * Chez Fiw, non. Le Client paie le Prestataire **directement**, la totalité.
 * La commission ne sort pas de la course : elle est **prélevée sur le Wallet**,
 * qui est prépayé (`CONTEXT.md` — sens unique débit, Wallet vide = accès
 * bloqué). Le Prestataire encaisse donc 2 200 F en main, et son Wallet baisse
 * de 308 F. Ce sont deux mouvements distincts, et les présenter comme une
 * soustraction fait croire à une retenue qui n'existe pas.
 *
 * D'où la hiérarchie de l'écran : **ce qu'il encaisse** en grand, et la
 * commission juste en dessous comme ce qu'elle est — une **ligne de Wallet**,
 * avec le nouveau solde.
 *
 * ⚠️ **Question ouverte** : quand le Client paie en Mobile Money, l'argent
 * transite-t-il par Fiw ? Si oui, le modèle « j'encaisse la totalité » ne tient
 * que pour les espèces, et cet écran devra distinguer les deux. Le modèle du
 * Wallet prépayé suggère que non — mais ce n'est écrit nulle part.
 *
 * ── L'évaluation ──────────────────────────────────────────────────────────
 * `CONTEXT.md` : l'ÉvaluationClient est **privée**. Le Client ne voit jamais
 * qui l'a notée ni combien ; seule sa moyenne lui est montrée. L'écran le dit,
 * parce que c'est ce qui rend la note honnête — un Prestataire qui se croit
 * identifiable note poliment.
 *
 * ⚠️ Les étoiles sont en **`brandYellow`** et non en `warning`. Le Client, lui,
 * peint encore les siennes en `warning` dans `transport/cloture.tsx` — alors
 * que `ListRow` a été corrigé le 4 septembre au motif qu'*une note n'est pas
 * une alerte*. C'est un reste à corriger **côté Client** ; on ne reproduit pas
 * ici un défaut déjà identifié là-bas.
 */
export default function Complete() {
  const insets = useSafeAreaInsets();
  const [note, setNote] = useState(5);
  const m = MISSION_INCOMING;

  const commission = Math.round(m.prix * COMMISSION_RATE);
  const soldeApres = PRESTATAIRE.walletSolde - commission;

  const terminer = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/accueil');
  };

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Bandeau de marque, à fond perdu. Le corpus le fait partout où
            l'écran annonce une somme qui vient d'être gagnée (DiDi met son
            montant sur un plein bleu, Yassir sur un plein violet) — et c'est
            aussi ce que fait l'app Client sur sa célébration d'Affiliation.
            Un chiffre qui compte mérite un fond qui le porte ; posé sur du
            gris, il n'était qu'une ligne de plus. */}
        <View style={[styles.bandeau, { paddingTop: insets.top + Spacing[7] }]}>
          <View style={styles.pastille}>
            <Icon name="check" size={32} weight="fill" color={Colors.textOnPrimary} />
          </View>
          <Text variant="heading2" color={Colors.textOnPrimary} align="center">Course terminée</Text>

          {/* Ce qu'il encaisse — en main, auprès du Client. C'est le chiffre de
              l'écran, et il vaut le prix PLEIN de la course. */}
          <Text variant="caption" color={Colors.textOnInverseSecondary} style={styles.kicker}>
            À ENCAISSER AUPRÈS DU CLIENT
          </Text>
          <Text variant="displayXl" color={Colors.textOnPrimary}>{fcfa(m.prix)}</Text>
          <Text variant="bodySmall" color={Colors.textOnInverseSecondary} align="center">
            {m.pickup.name} → {m.destination.name} · {m.distanceCourse}
          </Text>
        </View>

        <View style={styles.corps}>
        {/* La commission, présentée comme un mouvement de Wallet — pas comme
            une retenue sur la course. */}
        <View style={styles.wallet}>
          <View style={styles.ligne}>
            <InfoRow
              label={`Commission Fiw (${Math.round(COMMISSION_RATE * 100)} %)`}
              value={`−${fcfa(commission)}`}
            />
          </View>
          <Divider inset={0} />
          <View style={styles.ligne}>
            <InfoRow label="Nouveau solde du Wallet" value={fcfa(soldeApres)} emphase="montant" />
          </View>
        </View>
        <Hint icon="info">
          La commission est prélevée sur votre Wallet, pas sur la course.
        </Hint>

        {/* ÉvaluationClient — privée. */}
        <Text variant="heading2" style={styles.titreNote}>Comment s'est passée la course ?</Text>
        <View style={styles.etoiles}>
          {[1, 2, 3, 4, 5].map((s) => (
            <TouchableOpacity key={s} onPress={() => { Haptics.selectionAsync(); setNote(s); }} activeOpacity={0.7}>
              <Icon
                name="star"
                size={36}
                weight={s <= note ? 'fill' : 'bold'}
                color={s <= note ? Colors.brandYellow : Colors.border}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text variant="label" align="center">{LIBELLE_NOTE[note]}</Text>
        <Hint icon="lock" align="center" style={styles.prive}>
          {m.clientName} ne verra jamais votre note ni qui l'a donnée.
        </Hint>
        </View>
      </ScrollView>

      <ScreenFooter rule>
        <Button label="Terminer" onPress={terminer} />
      </ScreenFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingBottom: Spacing[8] },
  corps: { paddingHorizontal: Spacing[4] },
  // `InfoRow` est à plat par contrat : c'est au conteneur de lui donner sa
  // respiration verticale, et au `Divider` du système de la séparer.
  ligne: { paddingVertical: Spacing[3] },

  // Le bandeau descend sous la barre d'état (le `paddingTop` ajoute la zone
  // sûre) et s'arrondit en bas seulement : en haut il est coupé par le bord de
  // l'écran, l'arrondir y laisserait deux coins de page.
  bandeau: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
    paddingBottom: Spacing[8],
    borderBottomLeftRadius: Radii.xl,
    borderBottomRightRadius: Radii.xl,
    gap: Spacing[1],
    marginBottom: Spacing[7],
  },
  pastille: {
    width: 64, height: 64, borderRadius: Radii.pill,
    backgroundColor: Colors.onInverseSubtle,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing[3],
  },
  kicker: { ...SectionLabel, marginTop: Spacing[5] },

  wallet: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: Strokes.thin, borderColor: Colors.borderSubtle,
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[2],
  },

  titreNote: { marginTop: Spacing[8], textAlign: 'center' },
  etoiles: {
    flexDirection: 'row', justifyContent: 'center', gap: Spacing[3],
    marginTop: Spacing[4], marginBottom: Spacing[3],
  },
  prive: { marginTop: Spacing[3] },
});
