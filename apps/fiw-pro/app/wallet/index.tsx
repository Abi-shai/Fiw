import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '@/components/ScreenHeader';
import Button from '@/components/Button';
import Text from '@/components/Text';
import List from '@/components/List';
import ListRow from '@/components/ListRow';
import Medallion from '@/components/Medallion';
import Callout from '@/components/Callout';
import { Colors, Radii, SectionLabel, Spacing, Strokes } from '@/constants/tokens';
import {
  MOUVEMENTS, PRESTATAIRE, WALLET_LOW, COMMISSION_RATE,
  autonomie, fcfa, fcfaSigne, walletEtat, type Mouvement, type WalletEtat,
} from '@/constants/data';

/**
 * **Mon Wallet — l'écran pivot de Fiw Pro.**
 *
 * Et c'est le seul écran du produit qui n'a aucun modèle dans le corpus
 * (cf. `docs/benchmark-fiw-pro.md` § 1). Chez Bolt, Uber, Heetch, Careem et
 * Yassir, le chauffeur **accumule** ses gains et la plateforme les lui
 * **reverse** — d'où partout un « Balance · will be paid to you on June 7 » et
 * un bouton **Cash out**. Chez Fiw c'est l'inverse : le Client paie le
 * Prestataire directement, et le Prestataire **doit** 14 % à Fiw, prépayés
 * depuis ce Wallet. Il n'y a rien à retirer, et inventer un « Retirer » par
 * mimétisme serait un contresens produit.
 *
 * ── Ce que l'écran doit dire ──────────────────────────────────────────────
 * **Pas un solde : une autonomie.** 4 200 F ne veut rien dire tant qu'on ne
 * sait pas ce que ça achète — c'est confortable pour un vélo, court pour une
 * voiture. La seule question du Prestataire est « quand est-ce que je serai
 * coupé ? ». Le chiffre reste donc le solde (c'est lui qu'on recharge), mais il
 * est immédiatement converti en **nombre de courses restantes**.
 *
 * **Trois états, portés par les jetons FONCTIONNELS** — jamais le jaune de
 * marque, qui est celui de la pédagogie : un Wallet bas, ce n'est pas une
 * explication, c'est « quelque chose cloche ».
 *
 * ⚠️ **L'encre de la ligne d'explication reste `textPrimary` dans les trois
 * états**, y compris sur `errorSubtle`. Le système n'a pas d'`errorInk` — le
 * style guide a doté `warning` et `success` d'une encre faite pour écrire sur
 * leur palier subtil, pas `error`. `error` posé en 14 px sur `errorSubtle` ne
 * fait que ~3,3:1, sous le seuil du petit texte. Il porte donc le grand nombre
 * (40 px, où 3:1 suffit) et rien d'autre. **C'est un manque du système, pas une
 * préférence** : le jour où du petit texte devra tenir sur `errorSubtle`, il
 * faudra un `errorInk` (≈ `#B91C1C`) — à poser comme décision, pas à bricoler
 * dans un écran.
 */

// Trois états, trois aplats. L'état SAIN prend le bleu de marque plein —
// comme le Wallet de l'espace Affilié côté Client, qui est exactement le même
// objet vu de l'autre côté. Un héros blanc sur fond gris ne disait pas que
// c'était la pièce maîtresse de l'écran ; un aplat le dit sans un mot.
//
// Les deux autres gardent leur palier fonctionnel : un Wallet bas ou vide
// n'est plus un actif qu'on montre, c'est un problème à traiter.
const ETAT_FOND: Record<WalletEtat, string> = {
  sain:   Colors.primary,
  bas:    Colors.warningSubtle,
  bloque: Colors.errorSubtle,
};

/** Encre du grand nombre. */
const ETAT_ENCRE: Record<WalletEtat, string> = {
  sain:   Colors.textOnPrimary,
  bas:    Colors.warningInk,
  bloque: Colors.error,
};

/** Encre des deux lignes secondaires — elle suit le FOND, pas le ton. Sur
 *  l'aplat bleu c'est le blanc translucide du système ; sur les deux paliers
 *  clairs, l'encre de texte ordinaire. */
const ETAT_ENCRE_2: Record<WalletEtat, string> = {
  sain:   Colors.textOnInverseSecondary,
  bas:    Colors.textPrimary,
  bloque: Colors.textPrimary,
};

function MouvementRow({ m }: { m: Mouvement }) {
  const credit = m.montant > 0;
  return (
    <ListRow
      leading={<Medallion icon={credit ? 'bank' : 'car'} size="sm" />}
      title={m.label}
      // Le sous-titre d'une commission porte la course dont elle est tirée :
      // c'est ce qui rend la retenue lisible au lieu de subie — on voit d'où
      // vient le prélèvement sans ouvrir quoi que ce soit.
      subtitle={credit ? m.date : `${m.date} · course ${fcfa(m.coursePrix ?? 0)}`}
      trailing={
        // ⚠️ Les débits ne sont PAS en rouge, contrairement à tout le corpus
        // (Yassir, Bolt et Heetch peignent les frais en rouge). Dans ce système
        // le rouge dit « quelque chose cloche », et une commission normalement
        // prélevée ne cloche pas. C'est le SIGNE qui porte la direction ; la
        // couleur reste disponible pour ce qui va vraiment mal.
        <Text
          variant="infoValue"
          color={credit ? Colors.successInk : Colors.textPrimary}
        >
          {fcfaSigne(m.montant)}
        </Text>
      }
      style={styles.row}
    />
  );
}

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const solde = PRESTATAIRE.walletSolde;
  const etat = walletEtat(solde);
  const courses = autonomie(solde);

  // Une phrase par état. Elle dit toujours la même chose — ce que le solde
  // permet — mais le registre change : un constat, un avertissement, un fait.
  const phrase =
    etat === 'bloque'
      ? 'Vous ne recevez plus de mission. Rechargez pour reprendre.'
      : courses === 0
      ? 'Plus assez pour couvrir une course. Rechargez pour continuer.'
      : `Environ ${courses} course${courses > 1 ? 's' : ''} avant blocage.`;

  return (
    <View style={styles.page}>
      <ScreenHeader title="Mon Wallet" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Le Wallet est un OBJET qui a un état — il a donc droit à sa carte,
            au sens de la règle « les cartes sont pour les objets, les portes
            sont à plat ». Rayon `lg`, comme toutes les cartes posées sur `bg`
            dans ce produit. */}
        <View style={[styles.hero, { backgroundColor: ETAT_FOND[etat] }]}>
          <Text variant="caption" color={ETAT_ENCRE_2[etat]} style={styles.kicker}>SOLDE</Text>
          <Text variant="displayXl" color={ETAT_ENCRE[etat]}>{fcfa(solde)}</Text>
          <Text variant="bodySmall" color={ETAT_ENCRE_2[etat]} style={styles.phrase}>
            {phrase}
          </Text>
        </View>

        <Button
          label={etat === 'bloque' ? 'Recharger pour reprendre' : 'Recharger'}
          icon="add"
          variant={etat === 'sain' ? 'inverse' : 'primary'}
          onPress={() => router.push('/wallet/recapitulatif')}
          style={styles.cta}
        />

        {/* La règle non devinable, et UN SEUL encart par écran. Il n'apparaît
            que quand tout va bien : dès que le Wallet est bas ou bloqué, la
            carte du haut dit déjà la même chose, en plus fort. Un encart jaune
            sous un bandeau rouge répéterait l'information en la rendant moins
            lisible, pas plus. */}
        {etat === 'sain' && (
          <Callout icon="info">
            Fiw prélève {Math.round(COMMISSION_RATE * 100)} % du prix de chaque course terminée.
            En dessous de {fcfa(WALLET_LOW)}, vous êtes prévenu ; à zéro, vous ne recevez plus de mission.
          </Callout>
        )}

        {/* Le relevé ne contient que deux natures : des recharges et des
            commissions. Les GAINS de course n'y figurent pas et ne doivent pas
            y figurer — le Client paie le Prestataire directement, cet argent ne
            passe jamais par Fiw. C'est la différence qui fait que l'écran
            « Earnings » du corpus ne se transpose pas ici. */}
        <List title="Relevé" style_="carte" inset={64} style={styles.releve}>
          {MOUVEMENTS.map((m) => <MouvementRow key={m.id} m={m} />)}
        </List>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing[4], paddingTop: Spacing[2] },

  hero: {
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[5],
    gap: Spacing[1],
  },
  kicker: { ...SectionLabel },
  phrase: { marginTop: Spacing[1] },

  cta: { marginTop: Spacing[5], marginBottom: Spacing[5] },
  releve: { marginTop: Spacing[2] },
  row: {},
});
