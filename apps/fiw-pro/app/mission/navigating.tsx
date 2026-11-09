import React, { useState } from 'react';
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
import { Colors, Spacing } from '@/constants/tokens';
import { topviewSprite } from '@/constants/illustrations';
import { CARTE_BASE, DUREE_VERS_CLIENT } from '@/constants/carte';
import { MISSION_INCOMING, PRESTATAIRE } from '@/constants/data';

const DEPART_PRESTA = { lat: 14.7280, lng: -17.5060 };

/**
 * **En route vers le Client.**
 *
 * C'est l'écran qui solde la dette de l'[ADR 0009](../../../docs/adr/0009-le-repere-voyage-jusquau-prestataire.md) :
 * le **Repère** y est affiché, et c'est ici qu'il sert. Le sitemap Pro le
 * signalait depuis août — *« tant que ce n'est pas fait, le Client saisit un
 * Repère que personne ne lit »*. Le modèle de mission le porte désormais
 * (`constants/data.ts`), et `MissionItineraire` l'affiche sans le tronquer.
 *
 * **Pas de bouton retour.** Une mission acceptée ne s'annule pas en revenant
 * en arrière ; l'en-tête ne porte donc que les deux moyens de joindre le
 * Client. L'annulation côté Prestataire existe au périmètre produit — elle est
 * toujours gratuite mais affecte le Score de coopération — et elle demande sa
 * propre confirmation, pas une flèche.
 */
export default function Navigating() {
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

  return (
    <View style={styles.page}>
      {/* Le véhicule SUIVI est le sien : vu du dessus, il pivote selon le cap,
          braque au train avant dans les courbes et avance à vitesse sol
          constante. Le tracé se lit parcouru atténué / restant en bleu, et la
          caméra cadre le trajet entier avant de le suivre. Tout cela vit déjà
          dans `LeafletMap` — il suffit de le lui demander. */}
      <LeafletMap
        center={DEPART_PRESTA}
        zoom={13}
        markers={[{ lat: m.pickup.lat, lng: m.pickup.lng, type: 'origin' }]}
        route={{ from: DEPART_PRESTA, to: m.pickup, animateDuration: DUREE_VERS_CLIENT }}
        vehicleSprite={topviewSprite('auto')}
        followVehicle
        fitPadding={{ top: insets.top + 40, bottom: 420, left: 48, right: 48 }}
        {...CARTE_BASE}
        style={StyleSheet.absoluteFillObject}
      />

      <Sheet floating style={[styles.sheet, { paddingBottom: insets.bottom + Spacing[4] }]}>
        <Text variant="heading2">En route vers {m.clientName}</Text>
        <Text variant="bodySmall" color={Colors.textSecondary}>
          {m.dureeClient} · {m.distanceClient}
        </Text>

        {/* L'itinéraire PORTE le Repère du point de collecte. C'est la ligne la
            plus utile de l'écran : à Dakar, l'adresse localise une parcelle,
            c'est le Repère qui désigne le portail. */}
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
            <Text variant="bodySmall" color={Colors.textSecondary}>
              {PRESTATAIRE.vehicle} · {PRESTATAIRE.plate}
            </Text>
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

        <SlideToConfirm label="Je suis arrivé" onConfirm={() => router.replace('/mission/arrived')} />
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
  clientRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[3],
    paddingVertical: Spacing[3], marginBottom: Spacing[2],
  },
});
