import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import ScreenHeader from '@/components/ScreenHeader';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Medallion from '@/components/Medallion';
import List from '@/components/List';
import ListRow from '@/components/ListRow';
import Icon from '@/components/Icon';
import { Colors, Radii, SectionLabel, Shadows, Spacing } from '@/constants/tokens';
import {
  AFFILIE_RESEAU, COMMISSIONS, MEMBERS, WITHDRAW_MIN,
  activeMembers, totalCourses, fcfa, serviceIcon,
} from '@/constants/affilie';

/** Retrait du filet pour une tête de `Medallion sm` : 16 (padding de carte)
 *  + 36 (médaillon) + 12 (gouttière). Les rangées de commission l'emploient ;
 *  les portes, à tête d'icône 22, gardent le 50 par défaut de `List`. */
const INSET_MEDALLION_SM = 64;

// JS3 — Le tableau de bord de l'Affilié Réseau. Page d'atterrissage du rôle :
// combien j'ai, comment j'en gagne plus, qui est dans mon réseau, ce qui est
// tombé récemment.
//
// ── Ce que la passe du 27 septembre 2026 a changé ──────────────────────────
// **La grille de quatre statistiques tombe.** Elle portait deux défauts de
// fond : « Gains cumulés · 12 400 F » répétait au mot près le solde du Wallet
// juste au-dessus (un même chiffre deux fois sur un écran), et « Clients
// actifs » annonçait une matière SORTIE DU PÉRIMÈTRE — depuis le recap du
// 30 août 2026, seules les courses des Prestataires rapportent.
//
// Ce qui restait — les courses générées, les prestataires actifs — n'a pas
// besoin d'une tuile : c'est la règle que la page Menu a écrite en refusant
// les siennes. **Un chiffre ne devient un élément à lui seul que s'il n'a rien
// à ouvrir derrière.** Ici les deux ouvrent le même écran, `reseau`. Ils
// passent donc en SOUS-TITRE de sa porte, exactement comme « 87 courses ·
// dernière aujourd'hui » résume Historique sur le Menu. Et ils sont LUS depuis
// `MEMBERS` : ajouter un membre les met à jour tous les deux.
//
// **Le lien « Voir mon réseau » disparaît avec la grille** : la porte le dit
// mieux, et une page n'a pas besoin de deux entrées vers le même écran à dix
// pixels d'intervalle. « Mes outils » en gagne une au passage — jusqu'ici le
// QR et le code n'étaient atteignables que par le CTA « Partager mon code ».
//
// **Un seul rayon sur la page** (`lg`), là où le Wallet était en `lg` et les
// tuiles en `md` : « carte, champ et encadré qui se suivent partagent le même
// rayon » (style guide, §Formulaires).
export default function AffilieDashboard() {
  const insets = useSafeAreaInsets();
  const { state, balance } = AFFILIE_RESEAU;

  const locked = state === 'gele';
  const lockCaption = locked
    ? 'Retraits suspendus — contactez le support'
    : balance < WITHDRAW_MIN
    ? `Minimum ${fcfa(WITHDRAW_MIN)}`
    : null;

  const share = () => {
    Haptics.selectionAsync();
    router.push('/affilie/outils');
  };

  // Résumés lus depuis la SOURCE réelle, jamais écrits en dur.
  const actifs = activeMembers();
  const courses = totalCourses();
  const reseauSummary = MEMBERS.length === 0
    ? 'Personne pour le moment'
    : `${actifs} prestataire${actifs > 1 ? 's' : ''} actif${actifs > 1 ? 's' : ''} · ${courses} courses générées`;

  return (
    <View style={styles.page}>
      {/* `ScreenHeader` du système, et non l'en-tête refait à la main qu'avait
          cette page (bouton + `heading2` + cale de 40). Le titre y passe donc
          en `heading1`, comme partout ailleurs.
          « Affiliation » et non « Mon espace Affilié Réseau » : c'est le nom
          que porte sa porte sur le Menu, et un titre nomme sa rubrique. À
          22 px, la phrase longue se tronquait de toute façon. */}
      <ScreenHeader title="Affiliation" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      >
        {/* ── Le Wallet Réseau ──────────────────────────────────────────────
            « Mon Wallet » est l'intitulé canonique côté Client (CONTEXT.md) ;
            « Wallet Réseau » est le terme de domaine, il ne s'affiche pas.
            Le bouton passe au `Button variant="inverse"` du système — plein
            blanc, texte `primary` — là où la page dessinait sa propre pilule.
            Verrouillé, il prend l'état `disabled` de `Button` (opacité 0,45)
            au lieu d'un fond translucide fait main : un contrôle à fond plein
            se délave en bloc, c'est la règle du style guide. */}
        <View style={styles.wallet}>
          <View style={styles.walletTop}>
            <View style={styles.flex1}>
              <Text variant="captionMedium" color={Colors.textOnPrimary} style={styles.kicker}>
                Mon Wallet
              </Text>
              <Text variant="display" color={Colors.textOnPrimary} style={styles.balance}>
                {fcfa(balance)}
              </Text>
            </View>
            <Button
              label="Retirer"
              variant="inverse"
              size="sm"
              disabled={!!lockCaption}
              onPress={() => router.push('/affilie/retrait-methode')}
            />
          </View>
          {lockCaption && (
            <View style={styles.lockNote}>
              <Icon name="info" size={16} color={Colors.textOnPrimary} />
              <Text variant="caption" color={Colors.textOnInverseSecondary} style={styles.flex1}>
                {lockCaption}
              </Text>
            </View>
          )}
        </View>

        {/* La seule action de la page : c'est par le partage que le réseau
            grandit, donc un `primary` pleine largeur. */}
        <Button label="Partager mon code" icon="share" onPress={share} style={styles.cta} />

        {/* Les deux portes. `carte` et non `plat` : la page est grise, et les
            listes à plat du style guide vivent sur les pages BLANCHES (Compte,
            Menu). Ici la carte blanche est ce qui détache la liste du sol. */}
        <List style_="carte" style={styles.doors}>
          <ListRow
            icon="users"
            title="Mon réseau"
            subtitle={reseauSummary}
            onPress={() => router.push('/affilie/reseau')}
          />
          <ListRow
            icon="qr"
            title="Mes outils"
            subtitle={`Code ${AFFILIE_RESEAU.code} · QR à montrer`}
            onPress={() => router.push('/affilie/outils')}
          />
        </List>

        {/* ── Les commissions ───────────────────────────────────────────────
            La rangée disait la DATE et le montant, et laissait de côté les deux
            informations que la donnée portait déjà : QUI a généré la commission
            et sur combien de courses. Elle devient une `ListRow` ordinaire —
            titre = le nom de l'Affilié, sous-titre = la date et le nombre de
            courses, fin de rangée = le montant.
            Le médaillon porte le glyphe du SERVICE (`car` / `package`) et non
            un `coins` répété cinq fois : à cinq rangées identiques, l'icône ne
            distingue plus rien. Ton `neutre` — une liste de faits passés
            n'appelle à rien. */}
        {COMMISSIONS.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text variant="caption" color={Colors.textTertiary} style={styles.emptyLabel}>
              Commissions récentes
            </Text>
            <Text variant="bodySmall" color={Colors.textSecondary}>
              Pas encore de gains — ils apparaîtront ici dès que les prestataires
              de votre réseau commenceront à faire des courses.
            </Text>
          </View>
        ) : (
          <List title="Commissions récentes" style_="carte" inset={INSET_MEDALLION_SM}>
            {COMMISSIONS.map((c) => (
              <ListRow
                key={c.id}
                leading={<Medallion icon={serviceIcon(c.service)} size="sm" />}
                title={c.name}
                subtitle={`${c.date} · ${c.courses} courses`}
                trailing={
                  <Text variant="infoValue" color={Colors.success}>+{fcfa(c.amount)}</Text>
                }
              />
            ))}
          </List>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg },
  flex1: { flex: 1 },
  content: { paddingHorizontal: Spacing[4], paddingTop: Spacing[2] },

  wallet: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.lg,
    padding: Spacing[6],
    marginBottom: Spacing[6],
    ...Shadows.md,
  },
  walletTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  // Seule la CASSE vient du jeton ; l'encre se compose au point d'appel.
  kicker: { ...SectionLabel },
  // Aucun `letterSpacing` : la page en portait deux inventés (-0.6 sur le
  // solde, -0.4 sur les valeurs de statistique), hors de l'échelle typographique
  // — qui n'a plus d'interlettrage nulle part depuis le 24 août 2026.
  balance: { marginTop: Spacing[1] },
  lockNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing[4],
  },

  cta: { marginBottom: Spacing[6] },
  doors: { marginBottom: Spacing[6] },

  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  emptyLabel: { ...SectionLabel },
});
