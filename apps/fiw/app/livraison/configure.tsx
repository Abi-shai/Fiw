import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Animated, Keyboard,
  ScrollView, Image, Pressable,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScreenHeight } from '@/hooks/useScreenHeight';
import * as Haptics from 'expo-haptics';
import LeafletMap, { LeafletMapHandle } from '@/components/LeafletMap';
import BottomSheet from '@/components/BottomSheet';
import IconButton from '@/components/IconButton';
import Field from '@/components/Field';
import Scrim, { sheetScrimOpacity } from '@/components/Scrim';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import SearchBar from '@/components/SearchBar';
import Button from '@/components/Button';
import Avatar, { AVATAR_ROW } from '@/components/Avatar';
import List from '@/components/List';
import ListRow from '@/components/ListRow';
import PaymentSheetContent from '@/components/PaymentSheet';
import GammeCard from '@/components/GammeCard';
import { CARD_GAP, Handle, SHEET_LEVELS, SHEET_RADIUS, SheetCard, firstCardEdge, groupedSheetSurface, sheetMaxH, sheetSnaps } from '@/components/Sheet';
import RouteCard from '@/components/RouteCard';
import { useSnapSheet } from '@/hooks/useSnapSheet';
import { Colors, Radii, Spacing, Strokes, Typography } from '@/constants/tokens';
import {
  CONTACTS, DAKAR_CENTER, LIVRAISON_GAMMES, livraisonGamme, makeTrackingNumber, makeCodeRemise,
  PAYMENT_METHODS,
} from '@/constants/data';
import { payIllustration } from '@/constants/illustrations';

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/[\s  ]/g, '.');

/**
 * Livraison — étape 2 : les détails de la livraison et le paiement.
 *
 * Ordre de priorité tranché au croquis du 2 août : **où** (point de collecte et
 * de livraison) → **comment et combien** (moyen de livraison et prix) → **pour
 * qui** (destinataire) → **quoi** (description facultative) → paiement +
 * confirmation. Une carte par bloc, séparées par l'espacement de section de la
 * feuille (`CARD_GAP`, l'interstice `track`) — les deux premières rappellent ce
 * qui est déjà décidé et restent modifiables, les deux suivantes sont ce qu'il
 * reste à saisir.
 *
 * Le colis n'est plus décrit que par la description libre — ni type ni taille
 * (décision du 2 août). L'expéditeur est le compte connecté ; le destinataire se
 * choisit d'abord dans les contacts, la saisie manuelle en repli.
 *
 * Feuille à 3 crans hug-content (pattern course-active/suivi) : le contenu est
 * plus haut qu'une feuille statique ne le permet — l'en-tête se glisse pour
 * rétracter la feuille et revoir la carte, le corps scrolle s'il dépasse l'écran.
 */
export default function LivraisonConfigureScreen() {
  const insets = useSafeAreaInsets();
  const SCREEN_H = useScreenHeight();

  const params = useLocalSearchParams<{
    departureName: string;
    destName: string; destDetail: string; destLat: string; destLng: string;
    gammeId: string; gammeLabel: string; gammePrice: string;
  }>();

  const departureName = params.departureName || 'Ma position actuelle';
  // La méthode se choisit désormais SUR cet écran (fusion des deux feuilles,
  // maquette 305:664). `params.gammeId` ne sert plus qu'au retour depuis la mise
  // en relation, qui peut avoir basculé sur la gamme complémentaire.
  const [gammeId, setGammeId] = useState(params.gammeId || 'velo');
  const gamme = livraisonGamme(gammeId);
  const destLat = parseFloat(params.destLat || String(DAKAR_CENTER.lat));
  const destLng = parseFloat(params.destLng || String(DAKAR_CENTER.lng));
  const mapCenter = { lat: (DAKAR_CENTER.lat + destLat) / 2, lng: (DAKAR_CENTER.lng + destLng) / 2 };

  const [description, setDescription] = useState('');
  const [descOpen, setDescOpen] = useState(false);
  const [descDraft, setDescDraft] = useState('');

  // Destinataire : contacts d'abord, saisie manuelle en repli.
  const [destinataireName, setDestinataireName] = useState('');
  const [destinatairePhone, setDestinatairePhone] = useState('');
  const [destOpen, setDestOpen] = useState(false);
  const [destMode, setDestMode] = useState<'contacts' | 'manual'>('contacts');
  const [contactQuery, setContactQuery] = useState('');
  const [nameDraft, setNameDraft] = useState('');
  const [phoneDraft, setPhoneDraft] = useState('');
  /** Le brouillon est complet — remonté au niveau de l'écran parce que la carte
   *  d'actions de la modale en a besoin, et qu'elle n'est plus dans le corps. */
  const destDraftOk = nameDraft.trim().length > 0 && phoneDraft.trim().length >= 9;

  // Paiement : dernier réglage avant confirmation (feuille partagée Transport).
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [pendingPayment, setPendingPayment] = useState('cash');
  const [payOpen, setPayOpen] = useState(false);
  const payLabel = (PAYMENT_METHODS.find((p) => p.id === selectedPayment) ?? PAYMENT_METHODS[0]).label;

  const mapRef = useRef<LeafletMapHandle>(null);

  // Crans mesurés (cf. suivi/course-active) : hauteur totale + hauteur d'en-tête ;
  // le corps est borné à l'écran et scrolle au-delà.
  const [sheetH, setSheetH] = useState(0);
  const [headerH, setHeaderH] = useState(0);
  const [bodyContentH, setBodyContentH] = useState(0);
  // Plafond de 85 % : le corps est borné pour que la feuille ENTIÈRE, en-tête
  // compris, ne dépasse jamais le niveau haut du système. Ce qui ne tient pas
  // scrolle DANS la feuille — on ne gagne pas de hauteur en rognant la carte.
  const bodyMaxH = Math.max(160, sheetMaxH(SCREEN_H) - headerH);
  // Le corps épouse son contenu (borné au plafond) — un ScrollView ne se
  // dimensionne pas seul dans un parent hug, on lui fixe donc min(contenu, max).
  const bodyH = Math.min(bodyContentH, bodyMaxH);
  // Les trois crans du système : la feuille montre 85 / 50 / 25 % de l'écran.
  const snaps = useMemo(() => sheetSnaps(SCREEN_H, sheetH), [sheetH]);

  const { ty, snapTo, panHandlers } = useSnapSheet({ snaps, initial: SCREEN_H });

  // Voile : la carte s'assombrit à mesure que la feuille monte — `ScrimLevels`,
  // une opacité par cran (0 au repli, 30 % à mi-hauteur, 50 % en haut), et zéro
  // tant que la feuille n'est pas entrée.
  const scrimOpacity = sheetScrimOpacity(ty, snaps, SCREEN_H);

  // Entrée : formulaire d'abord — la feuille monte au cran étendu ; l'utilisateur
  // peut la rétracter pour revoir l'itinéraire sur la carte.
  const didEnter = useRef(false);
  useEffect(() => {
    if (sheetH > 0 && headerH > 0 && bodyContentH > 0 && !didEnter.current) {
      didEnter.current = true;
      snapTo(snaps[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetH, headerH, bodyContentH]);

  // Seul requis de l'écran : le destinataire (le colis n'est plus décrit que par
  // la description libre, facultative).
  const destinataireOk = destinataireName.trim().length > 0 && destinatairePhone.trim().length >= 9;

  const openDest = () => {
    Haptics.selectionAsync();
    setDestMode('contacts');
    setContactQuery('');
    setNameDraft(destinataireName);
    setPhoneDraft(destinatairePhone);
    setDestOpen(true);
  };

  // Recherche dans le répertoire (réf. Careem « Search name or number »).
  const contactMatches = CONTACTS.filter((c) => {
    const q = contactQuery.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.phone.replace(/\s/g, '').includes(q.replace(/\s/g, ''));
  });

  const openDesc = () => {
    Haptics.selectionAsync();
    setDescDraft(description);
    setDescOpen(true);
  };

  const editItinerary = () => {
    Haptics.selectionAsync();
    router.dismissTo({
      pathname: '/home',
      params: {
        editService: 'livraison',
        editDeparture: departureName,
        editDest: params.destName ?? '',
      },
    });
  };

  const openPay = () => {
    Haptics.selectionAsync();
    setPendingPayment(selectedPayment);
    setPayOpen(true);
  };

  // Le prix définitif se joue en mise en relation (groupage détecté, frais de
  // rapprochement — Product Doc « B — Détection automatique ») : on confirme sur
  // le prix standard de la gamme, sans total figé.
  const confirmer = () => {
    Haptics.selectionAsync();
    router.push({
      pathname: '/livraison/searching',
      params: {
        ...params,
        departureName,
        gammeId: gamme.id,
        gammeLabel: gamme.label,
        gammePrice: String(gamme.basePrice),
        colisDesc: description,
        destinataireName: destinataireName.trim(),
        destinatairePhone: destinatairePhone.trim(),
        paymentId: selectedPayment,
        tracking: makeTrackingNumber(),
        codeRemise: makeCodeRemise(),
      },
    });
  };

  return (
    <View style={styles.container}>
      <LeafletMap
        ref={mapRef}
        center={mapCenter}
        zoom={13}
        markers={[
          { lat: DAKAR_CENTER.lat, lng: DAKAR_CENTER.lng, type: 'origin' },
          { lat: destLat, lng: destLng, type: 'destination' },
        ]}
        route={{ from: DAKAR_CENTER, to: { lat: destLat, lng: destLng } }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        tintWater
        declutter
        fitPadding={{ top: insets.top + 64, bottom: Math.round(SCREEN_H * SHEET_LEVELS.half), left: 56, right: 56 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Voile — posé entre la carte et la feuille : la carte s'assombrit, les
          contrôles flottants (portés par la feuille) restent nets. */}
      <Scrim opacity={scrimOpacity} />

      <Animated.View
        style={[groupedSheetSurface, styles.snapSheet, { transform: [{ translateY: ty }] }]}
        onLayout={(e) => setSheetH(e.nativeEvent.layout.height)}
      >
        {/* Contrôles carte — suivent la feuille (visibles quand elle est rétractée). */}
        <View style={styles.floatControls} pointerEvents="box-none">
          <IconButton name="back" onPress={() => router.back()} />
          <IconButton name="navigate" onPress={() => mapRef.current?.recenter(mapCenter, 13)} />
        </View>

        {/* EN-TÊTE — zone de glissement (rétracte/étend la feuille). */}
        <View
          style={styles.headerZone}
          {...panHandlers}
          onLayout={(e) => setHeaderH(e.nativeEvent.layout.height)}
        >
          <View style={styles.handleFloat} pointerEvents="none"><Handle /></View>
          <SheetCard style={firstCardEdge}>
            <View style={styles.headerRow}>
              <Text variant="heading1" style={styles.flex1} numberOfLines={1}>Planifier la livraison</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.85}>
                <Icon name="close" size={18} weight="bold" color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            {/* L'itinéraire rejoint l'en-tête : c'est le cadre de tout ce qui
                suit, et il reste visible quand la feuille est repliée. */}
            <RouteCard
              departure={departureName}
              destination={params.destName || ''}
              onEdit={editItinerary}
            />
          </SheetCard>
        </View>

        {/* CORPS — borné à l'écran, scrolle si le contenu dépasse. */}
        <ScrollView
          style={[styles.body, { height: bodyH }]}
          contentContainerStyle={styles.bodyContent}
          onContentSizeChange={(_w, h) => setBodyContentH(h)}
          scrollEnabled={bodyContentH > bodyMaxH}
          showsVerticalScrollIndicator={false}
        >
          {/* 1 — Méthode de livraison : le choix se fait ICI depuis la fusion
              des deux écrans (maquette 305:664). Le prix affiché est le prix
              standard ; le définitif se joue en mise en relation. */}
          <SheetCard>
            <Text variant="heading2">Méthodes de livraison</Text>
            <View style={styles.gRow}>
              {LIVRAISON_GAMMES.map((g) => (
                <GammeCard
                  key={g.id}
                  label={g.label}
                  eta={g.eta}
                  price={g.basePrice}
                  illu={g.illu}
                  selected={gammeId === g.id}
                  onPress={() => { Haptics.selectionAsync(); setGammeId(g.id); }}
                />
              ))}
            </View>
          </SheetCard>


          {/* 3 — Destinataire (le seul requis) : rangée-ACTION tant qu'il est
              vide, résumé compact une fois rempli. La note SMS est SON helper. */}
          <SheetCard>
            <Text variant="heading2">Destinataire et description</Text>

            {/* DESTINATAIRE — `Field` du design system (relevé sur `486:361` :
                `Type=texte`, icône de tête `user`, placeholder « Ajouter un
                destinataire », 56 de haut, libellé masqué).

                Il reste une PORTE vers la modale : c'est là que se saisissent le
                nom ET le numéro, avec l'accès au répertoire. Le champ est donc
                inerte au toucher — `pointerEvents="none"` — et c'est le
                `Pressable` qui ouvre. Sans ça le clavier s'ouvrirait sur un champ
                qu'on ne remplit pas ici. */}
            <Pressable onPress={openDest}>
              <View pointerEvents="none">
                <Field
                  icon="user"
                  placeholder="Ajouter un destinataire"
                  value={destinataireName}
                />
              </View>
            </Pressable>

            {/* DESCRIPTION — même composant et même mécanique que le
                destinataire : le champ est une PORTE, la saisie se fait dans la
                modale `Décrire le colis` (503:636). */}
            <Pressable onPress={openDesc}>
              <View pointerEvents="none">
                <Field
                  icon="edit"
                  placeholder="Ajouter une description"
                  value={description}
                />
              </View>
            </Pressable>
          </SheetCard>

          {/* Paiement + confirmation — dernière étape avant la mise en relation. */}
          <SheetCard style={[styles.lastCard, { paddingBottom: 16 + insets.bottom }]}>
            {/* Pastille de paiement et CTA côte à côte — maquette 531:1227,
                même motif que `transport/configure`. */}
            <View style={styles.payRow}>
              <TouchableOpacity
                style={styles.payThumb}
                onPress={openPay}
                activeOpacity={0.8}
                accessibilityLabel={`Moyen de paiement : ${payLabel}. Modifier`}
              >
                <Image source={payIllustration(selectedPayment)} style={styles.payLogo} />
              </TouchableOpacity>
              <Button
                label="Confirmer la livraison"
                onPress={confirmer}
                disabled={!destinataireOk}
                style={styles.flex1}
              />
            </View>
          </SheetCard>
        </ScrollView>
      </Animated.View>

      {/* Description du colis — feuille modale (clavier). */}
      {/* Décrire le colis (503:636) — un `Field` de type `zone`, libellé masqué,
          et la carte d'actions avec « Terminer ».

          ⚠️ La maquette n'a pas de compteur de caractères ; celui qui était là
          (`120/120`) disparaît. `maxLength` reste, il borne sans se montrer. */}
      {descOpen && (
        <BottomSheet
          title="Décrire le colis"
          onClose={() => setDescOpen(false)}
          actions={(close) => (
            <Button
              label="Terminer"
              onPress={() => { setDescription(descDraft.trim()); close(); }}
            />
          )}
        >
          <Field
            type="zone"
            value={descDraft}
            onChangeText={setDescDraft}
            placeholder="Ex. Dossier A4 sous enveloppe…"
            maxLength={120}
            autoFocus
          />
        </BottomSheet>
      )}

      {/* Moyen de paiement — feuille modale partagée. */}
      {payOpen && (
        <BottomSheet
          title="Modes de paiement"
          onClose={() => { setSelectedPayment(pendingPayment); setPayOpen(false); }}
          actions={(close) => <Button label="Confirmer" onPress={close} />}
        >
          <PaymentSheetContent value={pendingPayment} onChange={setPendingPayment} />
        </BottomSheet>
      )}

      {/* Destinataire — d'abord les contacts, la saisie manuelle en repli. */}
      {destOpen && (
        <BottomSheet
          title="Destinataire"
          onClose={() => setDestOpen(false)}
          /* Carte d'actions, relevée sur les deux variantes de la maquette :
             — saisie (503:657)   : « Terminer » primary + « Choisir dans mes
                                     contacts » secondary avec icône ;
             — contacts (504:653) : « Saisir un autre destinataire » secondary
                                     avec icône.
             Dans les deux cas le bouton secondaire est ce qui était un lien texte
             ou une rangée faite main dans le corps de la feuille. */
          actions={destMode === 'contacts' ? () => (
            <Button
              label="Saisir un autre destinataire"
              variant="secondary"
              icon="edit"
              onPress={() => { Haptics.selectionAsync(); setDestMode('manual'); }}
            />
          ) : (close) => (
            <>
              <Button
                label="Terminer"
                disabled={!destDraftOk}
                onPress={() => {
                  setDestinataireName(nameDraft);
                  setDestinatairePhone(phoneDraft);
                  close();
                }}
              />
              <Button
                label="Choisir dans mes contacts"
                variant="secondary"
                icon="contacts"
                onPress={() => { Keyboard.dismiss(); setDestMode('contacts'); }}
              />
            </>
          )}
        >
          {(close) => destMode === 'contacts' ? (
            <View>
              {/* Recherche dans le répertoire (réf. Careem). */}
              <SearchBar
                value={contactQuery}
                onChangeText={setContactQuery}
                onClear={() => setContactQuery('')}
                placeholder="Rechercher un nom ou un numéro…"
                style={styles.searchWrap}
              />
              {/* Filet pleine largeur : liste en feuille. */}
              <List style_="plat" inset={0}>
                {contactMatches.map((c) => (
                  <ListRow
                    key={c.id}
                    leading={<Avatar name={c.name} size={AVATAR_ROW} />}
                    title={c.name}
                    subtitle={c.phone}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setDestinataireName(c.name);
                      setDestinatairePhone(c.phone);
                      close();
                    }}
                  />
                ))}
              </List>
              {contactMatches.length === 0 && (
                <Text variant="bodySmall" color={Colors.textSecondary} align="center" style={styles.noContact}>
                  Aucun contact ne correspond.
                </Text>
              )}
            </View>
          ) : (
            /* Saisie manuelle — deux `Field` du design system, relevés sur
               `Modale · Destinataire (saisie)` : libellé AFFICHÉ (« Nom »,
               « Téléphone »), icône de tête, 80 de haut chacun. Les `TextInput`
               bruts qui étaient là ne venaient d'aucun composant : ni le liseré,
               ni le fond, ni le rayon, ni la hauteur n'étaient ceux du système.

               ⚠️ La maquette met « Nom du destinataire » en placeholder du champ
               TÉLÉPHONE — un reste de duplication du premier champ. On garde
               « 77 123 45 67 », qui dit ce qu'on attend. À corriger côté Figma. */
            <View style={styles.destForm}>
              <Field
                label="Nom"
                requis
                icon="user"
                value={nameDraft}
                onChangeText={setNameDraft}
                placeholder="Nom du destinataire"
                autoFocus
              />
              <Field
                label="Téléphone"
                icon="phone"
                value={phoneDraft}
                onChangeText={setPhoneDraft}
                placeholder="77 123 45 67"
                keyboardType="phone-pad"
              />
            </View>
          )}
        </BottomSheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  flex1: { flex: 1 },

  // Feuille à 3 crans — géométrie GroupedSheet (fond track, cartes pleine
  // largeur), hug-content, décalée par translateY pour se rétracter.
  snapSheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
  },
  // Contrôles flottants ancrés au-dessus de la feuille : ils la suivent quand
  // elle se rétracte (hors écran quand elle est étendue).
  floatControls: {
    position: 'absolute',
    top: -60, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerZone: { zIndex: 1 },
  handleFloat: {
    position: 'absolute',
    top: 6, left: 0, right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  lastCard: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  body: { backgroundColor: 'transparent' },
  // `CARD_GAP` EST l'espacement de section de la feuille : l'interstice `track`
  // entre deux cartes blanches. Pas de spacer supplémentaire à empiler dessus.
  bodyContent: { paddingTop: CARD_GAP, gap: CARD_GAP },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  closeBtn: {
    width: 36, height: 36, borderRadius: Radii.lg,
    backgroundColor: Colors.track,
    alignItems: 'center', justifyContent: 'center',
  },

  // Rappel de la méthode retenue — vignette illustrée sur plateforme `track`,
  // même langage que la carte gamme de l'étape précédente.

  // Ligne d'ouverture d'une saisie (description, destinataire) — cadre surfaceAlt.
  // Rangée de gammes — largeur naturelle des cartes (138), alignée à gauche.
  gRow: { flexDirection: 'row', gap: 10, paddingTop: 2 },

  // Feuille destinataire — contacts.
  // Géométrie du champ dans `SearchBar` — ici seule la marge de l'emplacement.
  searchWrap: { marginBottom: 8 },
  /** Les deux champs de saisie du destinataire : gouttière de 12, celle de la
   *  carte de feuille. */
  destForm: { gap: 12 },
  noContact: { paddingVertical: 18 },
  // Pied : moyen de paiement + confirmation (même gabarit que Transport).
  payRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2.5] },
  // 56 et non les 48 de la maquette Livraison : la boîte est invisible, seule sa
  // cible tactile compte, et Transport dit 56. La maquette diverge d'elle-même
  // sur ce point (56/pad8 contre 48/pad4) — signalé.
  payThumb: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  payLogo: { width: 40, height: 40, borderRadius: 11 },
});
