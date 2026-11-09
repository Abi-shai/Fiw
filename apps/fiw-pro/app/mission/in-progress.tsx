import React, { useEffect, useState } from 'react';
import { Share, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LeafletMap from '@/components/LeafletMap';
import SlideToConfirm from '@/components/SlideToConfirm';
import Toast, { useToast } from '@/components/Toast';
import ActionTile, { ActionTileRow } from '@/components/ActionTile';
import Button from '@/components/Button';
import AlertBadge from '@/components/AlertBadge';
import BottomSheet from '@/components/BottomSheet';
import Text from '@/components/Text';
import MissionItineraire from '@/components/MissionItineraire';
import Sheet from '@/components/Sheet';
import { Colors, Radii, Spacing } from '@/constants/tokens';
import { topviewSprite } from '@/constants/illustrations';
import { CARTE_BASE, DUREE_COURSE } from '@/constants/carte';
import { MISSION_INCOMING, fcfa } from '@/constants/data';

/**
 * **Course en cours — vers la destination.**
 *
 * L'écran le plus dépouillé du parcours, et c'est voulu : le Prestataire
 * conduit. Tout ce qui n'est pas la destination, le moyen de joindre le Client
 * et la fin de course a été retiré.
 *
 * Ce qui a disparu de la version de juin, et pourquoi :
 * - **Le badge « Mission en cours »** — il nommait l'écran qu'on regardait.
 * - **La pastille ETA bleue en haut** — doublon de la durée restante, dans un
 *   objet dessiné à la main (fond `primary`, typo en dur) qui n'existait nulle
 *   part ailleurs dans le système.
 * - **Le bouton d'appel carré de 56 × 52** — une troisième géométrie de bouton,
 *   inventée pour cet écran. Les contacts passent par la rangée d'`ActionTile`
 *   du Client.
 *
 * ⚠️ **« Passer hors ligne après cette course » a été retiré** (8 novembre).
 * L'idée venait du benchmark — le besoin est réel, aucune des dix apps du
 * corpus ne le couvre — mais elle encombrait l'écran de conduite d'un
 * troisième ordre, sous un glissé de fin de course qui est déjà la seule
 * chose à faire ici. Si elle revient, ce sera ailleurs : dans la bascule
 * elle-même, au moment où l'on maintient « Sortir » pendant une course.
 */
export default function InProgress() {
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
  const [minutes, setMinutes] = useState(12);

  useEffect(() => {
    const t = setInterval(() => setMinutes((v) => (v > 1 ? v - 1 : 1)), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={styles.page}>
      <LeafletMap
        center={m.pickup}
        zoom={13}
        markers={[{ lat: m.destination.lat, lng: m.destination.lng, type: 'destination' }]}
        route={{ from: m.pickup, to: m.destination, animateDuration: DUREE_COURSE }}
        vehicleSprite={topviewSprite('auto')}
        followVehicle
        fitPadding={{ top: insets.top + 40, bottom: 380, left: 48, right: 48 }}
        {...CARTE_BASE}
        style={StyleSheet.absoluteFillObject}
      />

      <Sheet floating style={[styles.sheet, { paddingBottom: insets.bottom + Spacing[4] }]}>
        <Text variant="heading2">{minutes} min restantes</Text>
        <Text variant="bodySmall" color={Colors.textSecondary}>
          Course de {m.distanceCourse} avec {m.clientName}
        </Text>

        {/* La prise en charge est faite : elle reste affichée, mais c'est la
            destination qui porte désormais le Repère utile. Le Repère du point
            de collecte n'a plus d'emploi une fois le Client à bord. */}
        <MissionItineraire
          depart={{ name: m.pickup.name, detail: m.pickup.detail }}
          arrivee={m.destination}
          labels={{ from: 'Prise en charge', to: 'Destination' }}
          style={styles.itineraire}
        />

        <View style={styles.prixRow}>
          <Text variant="bodySmall" color={Colors.textSecondary} style={styles.flex1}>
            À encaisser
          </Text>
          <Text variant="amount">{fcfa(m.prix)}</Text>
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

        <SlideToConfirm label="Terminer la course" onConfirm={() => router.replace('/mission/complete')} />

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
  itineraire: { marginTop: Spacing[3] },
  prixRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bg,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[3],
    marginTop: Spacing[2], marginBottom: Spacing[4],
  },
});
