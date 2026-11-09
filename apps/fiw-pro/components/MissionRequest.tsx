import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radii, Spacing, Strokes } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import Button from '@/components/Button';
import Avatar from '@/components/Avatar';
import CountdownButton from '@/components/CountdownButton';
import MissionItineraire from '@/components/MissionItineraire';
import { sheetSurface } from '@/components/Sheet';
import { fcfa, type MISSION_INCOMING } from '@/constants/data';

type Mission = typeof MISSION_INCOMING;

/**
 * **La mission entrante.**
 *
 * Panneau posé sur la carte, **non refermable par accident**. C'est pour ça
 * qu'il n'utilise pas `BottomSheet` : la feuille modale du système se ferme au
 * glissé vers le bas et au tap sur le voile, et ici l'un comme l'autre serait
 * un **refus silencieux** — le Prestataire perdrait la course en rangeant son
 * téléphone. La seule sortie est explicite.
 *
 * ── La hiérarchie, et elle vient du corpus ────────────────────────────────
 * Ce qui est en grand, c'est **la distance et la durée jusqu'au Client** —
 * Uber « 3 min away », Yango « 780 m · 2 min », Careem « 5 min | 4 km ». Pas le
 * prix. La question à laquelle le Prestataire répond en deux secondes n'est pas
 * « combien ça rapporte » mais « est-ce que j'y vais ». Le prix est juste en
 * dessous, lisible, mais il ne commande pas la décision.
 *
 * _(Seul Heetch met le prix en premier — parce que chez lui le chauffeur
 * CHOISIT parmi une liste, et le prix y est le critère de tri. Fiw attribue :
 * la comparaison n'existe pas.)_
 *
 * ── Le refus ──────────────────────────────────────────────────────────────
 * Aucune des six apps du corpus n'oppose un « Accepter » et un « Refuser » de
 * même poids, et Careem va jusqu'à reléguer son « Reject » en pilule flottante
 * à l'opposé du pouce. Ici le refus est un `Button variant="link"` centré sous
 * le bouton d'acceptation : trouvable, jamais touché par erreur.
 *
 * ⚠️ **Le refus n'est pas puni, et ne doit pas en avoir l'air.** `CONTEXT.md`
 * pose que le Score de coopération *« n'empêche jamais un prestataire de
 * travailler »*, et la liste de fonctionnalités demande une formulation
 * positive, **sans mention de pénalité**. Le libellé reste donc « Refuser »,
 * nu — pas « Refuser (affecte votre score) ».
 */
export default function MissionRequest({ mission, onAccept, onRefuse, onExpire }: {
  mission: Mission;
  onAccept: () => void;
  onRefuse: () => void;
  onExpire: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      {/* Voile posé à la main et non via `Scrim` : celui du système suit la
          position d'une feuille déplaçable, or ce panneau ne bouge pas. */}
      <View style={styles.voile} pointerEvents="none" />

      <View style={[sheetSurface, styles.panel, { paddingBottom: insets.bottom + Spacing[4] }]}>
        {/* En-tête : la gamme, et la note du Client. Deux qualifications, pas
            plus — au-delà, on demande au Prestataire de comparer au lieu de
            décider. */}
        <View style={styles.entete}>
          <View style={styles.gamme}>
            <Text variant="captionSemibold" color={Colors.primaryInk}>{mission.gamme}</Text>
          </View>
          <View style={styles.note}>
            <Icon name="star" size={12} weight="fill" color={Colors.brandYellow} />
            <Text variant="caption" color={Colors.textSecondary}>
              {mission.clientNote.toLocaleString('fr-FR')}
            </Text>
          </View>
        </View>

        {/* Le grand chiffre : le trajet jusqu'au Client. */}
        <Text variant="display" style={styles.tete}>
          {mission.dureeClient} · {mission.distanceClient}
        </Text>
        {/* Qui on va chercher. Un visage plutôt qu'un nom seul : c'est la
            seule richesse qui serve la décision de deux secondes — on ne
            charge pas davantage cet écran, qui se lit au volant. */}
        <View style={styles.clientRow}>
          <Avatar name={mission.clientName} size={28} />
          <Text variant="bodySmall" color={Colors.textSecondary}>
            pour rejoindre {mission.clientName}
          </Text>
        </View>

        <MissionItineraire
          depart={mission.pickup}
          arrivee={mission.destination}
          style={styles.itineraire}
        />

        {/* Le prix, et ce qu'il laisse. Le Prestataire encaisse la totalité —
            le Client le paie directement — et Fiw prélève sa commission sur le
            Wallet, pas sur la course. La ligne le dit, parce que c'est
            exactement ce que les apps du corpus NE disent pas de la même
            façon : ailleurs la commission est retenue sur le versement. */}
        <View style={styles.prixRow}>
          <View style={styles.flex1}>
            <Text variant="bodySmall" color={Colors.textSecondary}>Course de {mission.distanceCourse}</Text>
            <Text variant="amount">{fcfa(mission.prix)}</Text>
          </View>
        </View>

        <CountdownButton
          label="Accepter"
          seconds={mission.timerSeconds}
          onPress={onAccept}
          onExpire={onExpire}
        />
        <Button label="Refuser" variant="link" onPress={onRefuse} style={styles.refus} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  wrap: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' },
  voile: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000', opacity: 0.38 },

  panel: { paddingHorizontal: Spacing[4], paddingTop: Spacing[5], gap: Spacing[1] },

  entete: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[2] },
  gamme: {
    backgroundColor: Colors.primarySubtle,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing[2], paddingVertical: 2,
  },
  note: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  tete: { marginTop: Spacing[1] },
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginTop: Spacing[2] },

  itineraire: {
    marginTop: Spacing[4],
    backgroundColor: Colors.bg,
    borderRadius: Radii.card,
    paddingHorizontal: Spacing[4],
  },

  prixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[4],
    borderBottomWidth: Strokes.thin,
    borderBottomColor: Colors.borderSubtle,
    marginBottom: Spacing[4],
  },

  refus: { alignSelf: 'center', marginTop: Spacing[1] },
});
