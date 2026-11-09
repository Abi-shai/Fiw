import React, { useEffect, useState } from 'react';
import { Share, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LeafletMap from '@/components/LeafletMap';
import SlideToConfirm from '@/components/SlideToConfirm';
import ActionTile, { ActionTileRow } from '@/components/ActionTile';
import AlertBadge from '@/components/AlertBadge';
import BottomSheet from '@/components/BottomSheet';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Avatar, { AVATAR_ROW } from '@/components/Avatar';
import MissionItineraire from '@/components/MissionItineraire';
import Sheet from '@/components/Sheet';
import Toast, { useToast } from '@/components/Toast';
import { Colors, Radii, Spacing } from '@/constants/tokens';
import { topviewSprite } from '@/constants/illustrations';
import { CARTE_BASE } from '@/constants/carte';
import { MISSION_INCOMING, fcfa } from '@/constants/data';

/** Frais d'attente (CONTEXT.md) : 5 minutes offertes, délai UNIQUE quel que
 *  soit le prix de la course, puis 100 F CFA la minute. */
const ATTENTE_OFFERTE = 5 * 60;
const TARIF_MINUTE = 100;

const mmss = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/**
 * **Arrivé — le compteur d'attente tourne.**
 *
 * Deux régimes, et le passage de l'un à l'autre est le seul moment où cet
 * écran change de ton :
 *
 * - **Attente offerte** — un décompte neutre. Rien ne cloche, personne ne paie.
 * - **Attente facturée** — le Client paie 100 F la minute. Le bandeau passe en
 *   `warning`, et il dit le **montant**, pas seulement la durée.
 *
 * ⚠️ **Le compteur ne s'adresse pas au Prestataire comme à un bénéficiaire.**
 * Les frais d'attente vont au Client, pas à lui, et `CONTEXT.md` insiste sur le
 * fait qu'ils sont annoncés au Client **dès la commande** — jamais révélés à
 * la fin. Côté Prestataire, c'est donc une information d'état (« le compteur
 * tourne »), pas une bonne nouvelle à célébrer. D'où l'ambre fonctionnel et
 * non le vert : quelque chose sort de la normale, et il peut encore l'éviter
 * en appelant le Client.
 */
export default function Arrived() {
  const insets = useSafeAreaInsets();
  const m = MISSION_INCOMING;
  const toast = useToast();
  const [sosOuvert, setSosOuvert] = useState(false);

  // Partager son trajet : le Prestataire aussi roule seul la nuit. Côté
  // Client c'est « partager ma course avec un contact de confiance » ; ici
  // c'est le même geste, et c'est le lien de suivi qui change de porteur.
  const partager = () => {
    Share.share({
      message: `Je suis en course avec Fiw. Suivez-moi en direct : https://fiw.sn/suivi/${m.id}`,
    });
  };
  const [secondes, setSecondes] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSecondes((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const facture = secondes > ATTENTE_OFFERTE;
  const minutesFacturees = Math.ceil((secondes - ATTENTE_OFFERTE) / 60);
  const montant = facture ? minutesFacturees * TARIF_MINUTE : 0;

  return (
    <View style={styles.page}>
      {/* Arrivé : plus de tracé — il n'y a plus de chemin à faire.
          Le véhicule, lui, reste visible — mais il ne s'obtient pas en
          passant `vehicleSprite` seul. C'est le marqueur de type
          **`prestataire`** qui le crée (`ensureHero` dans `LeafletMap`) ; le
          sprite n'est que son habillage. Cet écran passait l'un sans l'autre
          et ne dessinait donc rien, en annonçant l'inverse en commentaire.
          C'est exactement la configuration de l'étape « arrivé » du Client.

          ⚠️ Le centre est décalé AU SUD du point : la carte occupe tout
          l'écran, son centre tombe donc derrière la feuille, et un marqueur
          centré y disparaissait. `fitPadding` ne corrige pas ce cas — il ne
          s'applique qu'au cadrage d'un tracé. */}
      <LeafletMap
        center={{ lat: m.pickup.lat - 0.0016, lng: m.pickup.lng }}
        zoom={16.5}
        markers={[{ lat: m.pickup.lat, lng: m.pickup.lng, type: 'prestataire' }]}
        vehicleSprite={topviewSprite('auto')}
        {...CARTE_BASE}
        style={StyleSheet.absoluteFillObject}
      />

      <Sheet floating style={[styles.sheet, { paddingBottom: insets.bottom + Spacing[4] }]}>
        <Text variant="heading2">Vous êtes arrivé</Text>

        <View style={[styles.attente, facture ? styles.attenteFacturee : styles.attenteOfferte]}>
          <View style={styles.flex1}>
            <Text variant="bodySmall" color={Colors.textPrimary}>
              {facture ? 'Attente facturée au Client' : 'Attente offerte'}
            </Text>
            <Text variant="amount" color={facture ? Colors.warningInk : Colors.textPrimary}>
              {facture ? fcfa(montant) : mmss(ATTENTE_OFFERTE - secondes)}
            </Text>
          </View>
          <Text variant="caption" color={Colors.textSecondary} style={styles.tarif}>
            {facture
              ? `${mmss(secondes - ATTENTE_OFFERTE)} · ${fcfa(TARIF_MINUTE)}/min`
              : `puis ${fcfa(TARIF_MINUTE)}/min`}
          </Text>
        </View>

        {/* Le Repère reste à l'écran : c'est encore maintenant qu'il sert — le
            Prestataire est sur place et cherche le bon portail. */}
        <MissionItineraire
          depart={m.pickup}
          arrivee={m.destination}
          onPhoto={() => toast.flash('Photo du point — à brancher')}
          onTraduire={() => toast.flash('Traduction en wolof — à brancher')}
          style={styles.itineraire}
        />

        <View style={styles.clientRow}>
          <Avatar name={m.clientName} size={AVATAR_ROW} />
          <View style={styles.flex1}>
            <Text variant="bodyMedium">{m.clientName}</Text>
            <Text variant="bodySmall" color={Colors.textSecondary}>Vous attend</Text>
          </View>
        </View>


        {/* ── Les deux contacts, à la forme du Client ────────────────────
            Ils étaient deux `IconButton` flottants sur la carte, sans
            libellé : deux ronds muets qu'il fallait deviner. Le Client les
            rend en **`ActionTile` étiquetées, dans la feuille** — c'est sa
            forme pour « appeler » et « chat », et il n'y a aucune raison que
            l'autre bord de la même conversation ait une autre grammaire.

            Et ils mènent désormais quelque part : `mission/appel` et
            `mission/chat` sont les écrans du Client, repris tels quels, rôles
            inversés. L'appel reste masqué dans les deux sens. */}
        <ActionTileRow>
          <ActionTile icon="phone" label="Appeler" onPress={() => router.push({ pathname: '/mission/appel', params: { name: m.clientName } })} />
          <ActionTile icon="chat" label="Chat" onPress={() => router.push({ pathname: '/mission/chat', params: { name: m.clientName } })} />
          <ActionTile icon="share" label="Partager" onPress={partager} />
          <ActionTile icon="sos" label="Urgence" danger onPress={() => setSosOuvert(true)} />
        </ActionTileRow>

        <SlideToConfirm label="Démarrer la course" onConfirm={() => router.replace('/mission/in-progress')} />
      </Sheet>
      {sosOuvert && (
        <BottomSheet title="Alerte SOS envoyée" onClose={() => setSosOuvert(false)}>
          {(close) => (
            <View style={styles.sos}>
              <AlertBadge icon="sos" weight="fill" />
              <Text variant="body" color={Colors.textSecondary} align="center" style={styles.sosTexte}>
                Votre position et les détails de la course ont été transmis au
                service de sécurité Fiw et à votre contact d'urgence. Un agent
                vous rappelle immédiatement.
              </Text>
              <Button label="J'ai compris" onPress={close} style={styles.sosCta} />
            </View>
          )}
        </BottomSheet>
      )}

      <Toast message={toast.message} opacity={toast.opacity} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg },
  flex1: { flex: 1 },
  sos: { alignItems: 'center', gap: Spacing[3], paddingBottom: Spacing[4] },
  sosTexte: { maxWidth: 300 },
  sosCta: { alignSelf: 'stretch', marginTop: Spacing[2] },
  sheet: { paddingHorizontal: Spacing[4], paddingTop: Spacing[4], gap: Spacing[1] },

  attente: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[3],
    marginTop: Spacing[3],
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[3],
    borderRadius: Radii.lg,
  },
  attenteOfferte: { backgroundColor: Colors.bg },
  attenteFacturee: { backgroundColor: Colors.warningSubtle },
  tarif: { textAlign: 'right' },

  itineraire: { marginTop: Spacing[2] },
  clientRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[3],
    paddingVertical: Spacing[3], marginBottom: Spacing[2],
  },
});
