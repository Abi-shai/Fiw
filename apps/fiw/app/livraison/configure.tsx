import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity, TextInput, Animated, Keyboard,
  ScrollView, Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import LeafletMap, { LeafletMapHandle } from '@/components/LeafletMap';
import BottomSheet from '@/components/BottomSheet';
import IconButton from '@/components/IconButton';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import Button from '@/components/Button';
import Avatar from '@/components/Avatar';
import ChipGroup from '@/components/ChipGroup';
import { Handle, SHEET_RADIUS } from '@/components/Sheet';
import { groupedSheetSurface, SheetCard, RouteCard, CARD_GAP } from '@/components/RideSheet';
import { useSnapSheet } from '@/hooks/useSnapSheet';
import { Colors, Radii, Poppins } from '@/constants/tokens';
import { COLIS_TYPES, COLIS_TAILLES, CONTACTS, DAKAR_CENTER } from '@/constants/data';
import type { IconName } from '@/components/Icon';

const SCREEN_H = Dimensions.get('window').height;

/** Label de groupe requis — au-dessus du contrôle, astérisque `error` (le rouge
 *  est réservé au requis/erreur ; le bleu signale l'action). Réf. bench IA :
 *  Grab « Size* », Gojek « What kind of package?* », Shopee. */
function FieldLabel({ label }: { label: string }) {
  return (
    <Text variant="bodySmall" color={Colors.textSecondary}>
      {label} <Text variant="bodySmall" color={Colors.error}>*</Text>
    </Text>
  );
}

/**
 * Livraison — étape 1 : le colis et son destinataire (réf. benchmark : hub
 * « Delivery Details » de Grab, chips de type Gojek). L'expéditeur est le compte
 * connecté. Le destinataire vit AVEC les détails du colis (retour user test) et
 * se choisit d'abord dans les contacts, la saisie manuelle en repli.
 *
 * Feuille à 3 crans hug-content (pattern course-active/suivi) : le contenu est
 * plus haut qu'une feuille statique ne le permet — l'en-tête se glisse pour
 * rétracter la feuille et revoir la carte, le corps scrolle s'il dépasse l'écran.
 */
export default function LivraisonConfigureScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    departureName: string;
    destName: string; destDetail: string; destLat: string; destLng: string;
  }>();

  const departureName = params.departureName || 'Ma position actuelle';
  const destLat = parseFloat(params.destLat || String(DAKAR_CENTER.lat));
  const destLng = parseFloat(params.destLng || String(DAKAR_CENTER.lng));
  const mapCenter = { lat: (DAKAR_CENTER.lat + destLat) / 2, lng: (DAKAR_CENTER.lng + destLng) / 2 };

  // Colis : type requis (validation Gojek), taille pré-réglée S (friction minimale).
  const [typeId, setTypeId] = useState<string | null>(null);
  const [tailleId, setTailleId] = useState('s');
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

  // Les feuilles modales contiennent des champs : on remonte leur contenu au
  // clavier (même pattern que la recherche de l'accueil).
  const [kbHeight, setKbHeight] = useState(0);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => setKbHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKbHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const mapRef = useRef<LeafletMapHandle>(null);

  // Crans mesurés (cf. suivi/course-active) : hauteur totale + hauteur d'en-tête ;
  // le corps est borné à l'écran et scrolle au-delà.
  const [sheetH, setSheetH] = useState(0);
  const [headerH, setHeaderH] = useState(0);
  const [bodyContentH, setBodyContentH] = useState(0);
  const bodyMaxH = Math.max(160, SCREEN_H - insets.top - headerH - 12);
  const bodyH = Math.min(bodyContentH, bodyMaxH);
  const snaps = useMemo(() => {
    if (!sheetH || !headerH) return [0, 0, 0];
    const peek = Math.max(1, Math.round(sheetH - headerH));
    const mid = Math.min(peek - 1, Math.round(sheetH * 0.44));
    return [0, Math.max(1, mid), peek];
  }, [sheetH, headerH]);

  const { ty, snapTo, panHandlers } = useSnapSheet({ snaps, initial: SCREEN_H });

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

  const destinataireOk = destinataireName.trim().length > 0 && destinatairePhone.trim().length >= 9;
  const canContinue = typeId !== null && destinataireOk;

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

  const continuer = () => {
    Haptics.selectionAsync();
    const type = COLIS_TYPES.find((t) => t.id === typeId)!;
    const taille = COLIS_TAILLES.find((t) => t.id === tailleId)!;
    router.push({
      pathname: '/livraison/options',
      params: {
        ...params,
        departureName,
        colisType: type.label,
        colisTaille: taille.label,
        colisDesc: description,
        destinataireName: destinataireName.trim(),
        destinatairePhone: destinatairePhone.trim(),
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
        fitPadding={{ top: insets.top + 64, bottom: Math.round(SCREEN_H * 0.5), left: 56, right: 56 }}
        style={StyleSheet.absoluteFillObject}
      />

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
          <SheetCard style={styles.headerCard}>
            <View style={styles.headerRow}>
              <Text variant="heading1" style={styles.flex1} numberOfLines={1}>Votre livraison</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.85}>
                <Icon name="close" size={18} weight="bold" color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
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
          {/* Itinéraire Collecte → Livraison. */}
          <SheetCard>
            <RouteCard
              departure={departureName}
              destination={params.destName || ''}
              labels={{ from: 'Collecte', to: 'Livraison' }}
              icons={{ from: 'package', to: 'flag' }}
              onEdit={editItinerary}
            />
          </SheetCard>

          {/* Le colis ET son destinataire (une seule section — décision produit).
              IA issue du bench multi-agents (12 juil.) : les 3 requis d'abord
              (Type* → Taille* → Destinataire*), l'optionnel affaibli en dernier. */}
          <SheetCard>
            <Text variant="heading2">Votre colis</Text>

            {/* Type de colis (requis) — une seule ligne, coupée au bord (Grab/Shopee). */}
            <View style={styles.fieldBlock}>
              <FieldLabel label="Type de colis" />
              <ChipGroup
                items={COLIS_TYPES.map((t) => ({ id: t.id, label: t.label, icon: t.icon as IconName }))}
                value={typeId}
                onChange={setTypeId}
                scrollable
                bleed={16}
              />
            </View>

            {/* Taille (requis) — l'objet-repère vit DANS chaque tuile. */}
            <View style={styles.fieldBlock}>
              <FieldLabel label="Taille" />
              <View style={styles.tailleTiles}>
                {COLIS_TAILLES.map((t) => {
                  const active = tailleId === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.tailleTile, active && styles.tailleTileActive]}
                      activeOpacity={0.85}
                      onPress={() => { Haptics.selectionAsync(); setTailleId(t.id); }}
                    >
                      <Text variant="heading2" color={active ? Colors.primary : Colors.textPrimary}>
                        {t.label}
                      </Text>
                      <Text variant="caption" color={Colors.textSecondary} align="center" numberOfLines={2}>
                        {t.hint}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.hairline} />

            {/* Destinataire (requis) — rangée-ACTION tant que vide (Grab hub),
                résumé compact une fois rempli. La note SMS est SON helper. */}
            <TouchableOpacity style={styles.fieldRow} onPress={openDest} activeOpacity={0.85}>
              <Icon name="user" size={18} color={Colors.primary} />
              {destinataireOk ? (
                <View style={styles.flex1}>
                  <Text variant="label" numberOfLines={1}>{destinataireName}</Text>
                  <Text variant="caption" color={Colors.textSecondary}>{destinatairePhone}</Text>
                </View>
              ) : (
                <Text variant="label" color={Colors.primary} style={styles.flex1}>
                  Ajouter le destinataire <Text variant="label" color={Colors.error}>*</Text>
                </Text>
              )}
              <Icon name="chevronRight" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>
            <View style={styles.noteRow}>
              <Icon name="info" size={14} weight="bold" color={Colors.textTertiary} />
              <Text variant="caption" color={Colors.textSecondary} style={styles.flex1}>
                Le destinataire reçoit un SMS pour suivre sa livraison.
              </Text>
            </View>

            {/* Description (facultatif) — affaiblie, en dernier, sans chevron. */}
            <TouchableOpacity style={styles.fieldRow} onPress={openDesc} activeOpacity={0.85}>
              <Icon name="edit" size={18} color={description ? Colors.textSecondary : Colors.textTertiary} />
              {description ? (
                <>
                  <Text variant="label" style={styles.flex1} numberOfLines={1}>{description}</Text>
                  <Icon name="chevronRight" size={16} color={Colors.textTertiary} />
                </>
              ) : (
                <Text variant="body" color={Colors.textTertiary} style={styles.flex1}>
                  Ajouter une description (facultatif)
                </Text>
              )}
            </TouchableOpacity>
          </SheetCard>

          {/* Continuer vers les options (gamme, mode, paiement). */}
          <SheetCard style={[styles.lastCard, { paddingBottom: 20 + insets.bottom }]}>
            <Button label="Continuer" onPress={continuer} disabled={!canContinue} />
          </SheetCard>
        </ScrollView>
      </Animated.View>

      {/* Description du colis — feuille modale (clavier). */}
      {descOpen && (
        <BottomSheet title="Décrire le colis" onClose={() => setDescOpen(false)}>
          {(close) => (
            <View style={{ paddingBottom: kbHeight }}>
              <TextInput
                style={styles.descInput}
                value={descDraft}
                onChangeText={setDescDraft}
                placeholder="Ex. Dossier A4 sous enveloppe…"
                placeholderTextColor={Colors.textTertiary}
                multiline
                textAlignVertical="top"
                autoFocus
                maxLength={120}
              />
              <Text variant="caption" color={Colors.textTertiary} align="right" style={styles.descCount}>
                {descDraft.length}/120
              </Text>
              <Button
                label="Terminer"
                onPress={() => { setDescription(descDraft.trim()); close(); }}
              />
            </View>
          )}
        </BottomSheet>
      )}

      {/* Destinataire — d'abord les contacts, la saisie manuelle en repli. */}
      {destOpen && (
        <BottomSheet title="Destinataire" onClose={() => setDestOpen(false)}>
          {(close) => destMode === 'contacts' ? (
            <View style={{ paddingBottom: kbHeight }}>
              {/* Recherche dans le répertoire (réf. Careem). */}
              <View style={styles.searchWrap}>
                <Icon name="search" size={18} color={Colors.textTertiary} />
                <TextInput
                  style={styles.searchInput}
                  value={contactQuery}
                  onChangeText={setContactQuery}
                  placeholder="Rechercher un nom ou un numéro…"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
              {contactMatches.map((c, i) => (
                <View key={c.id}>
                  <TouchableOpacity
                    style={styles.contactRow}
                    activeOpacity={0.85}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setDestinataireName(c.name);
                      setDestinatairePhone(c.phone);
                      close();
                    }}
                  >
                    <Avatar name={c.name} size={44} />
                    <View style={styles.flex1}>
                      <Text variant="label" numberOfLines={1}>{c.name}</Text>
                      <Text variant="caption" color={Colors.textSecondary}>{c.phone}</Text>
                    </View>
                    <Icon name="chevronRight" size={16} color={Colors.textTertiary} />
                  </TouchableOpacity>
                  {i < contactMatches.length - 1 && <View style={styles.contactDivider} />}
                </View>
              ))}
              {contactMatches.length === 0 && (
                <Text variant="bodySmall" color={Colors.textSecondary} align="center" style={styles.noContact}>
                  Aucun contact ne correspond.
                </Text>
              )}
              <TouchableOpacity
                style={styles.manualRow}
                activeOpacity={0.85}
                onPress={() => { Haptics.selectionAsync(); setDestMode('manual'); }}
              >
                <View style={styles.manualIcon}>
                  <Icon name="edit" size={18} weight="bold" color={Colors.primary} />
                </View>
                <Text variant="label" color={Colors.primary} style={styles.flex1}>
                  Saisir un autre destinataire
                </Text>
                <Icon name="chevronRight" size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>
          ) : (
            (() => {
              const draftOk = nameDraft.trim().length > 0 && phoneDraft.trim().length >= 9;
              return (
                <View style={{ paddingBottom: kbHeight }}>
                  <View style={styles.inputWrap}>
                    <Icon name="user" size={18} color={Colors.textSecondary} />
                    <TextInput
                      style={styles.input}
                      value={nameDraft}
                      onChangeText={setNameDraft}
                      placeholder="Nom du destinataire"
                      placeholderTextColor={Colors.textTertiary}
                      autoFocus
                    />
                  </View>
                  <View style={styles.inputWrap}>
                    <Icon name="phone" size={18} color={Colors.textSecondary} />
                    <TextInput
                      style={styles.input}
                      value={phoneDraft}
                      onChangeText={setPhoneDraft}
                      placeholder="77 123 45 67"
                      placeholderTextColor={Colors.textTertiary}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <Button
                    label="Terminer"
                    disabled={!draftOk}
                    onPress={() => {
                      setDestinataireName(nameDraft);
                      setDestinatairePhone(phoneDraft);
                      close();
                    }}
                    style={styles.sheetCta}
                  />
                  <TouchableOpacity
                    style={styles.backToContacts}
                    activeOpacity={0.7}
                    onPress={() => { Keyboard.dismiss(); setDestMode('contacts'); }}
                  >
                    <Icon name="contacts" size={16} color={Colors.textSecondary} />
                    <Text variant="label" color={Colors.textSecondary}>Choisir dans mes contacts</Text>
                  </TouchableOpacity>
                </View>
              );
            })()
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
  headerCard: { borderTopLeftRadius: SHEET_RADIUS, borderTopRightRadius: SHEET_RADIUS },
  lastCard: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  body: { backgroundColor: 'transparent' },
  bodyContent: { paddingTop: CARD_GAP, gap: CARD_GAP },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  closeBtn: {
    width: 36, height: 36, borderRadius: Radii.lg,
    backgroundColor: Colors.track,
    alignItems: 'center', justifyContent: 'center',
  },

  // Bloc de champ : label de groupe au-dessus de son contrôle.
  fieldBlock: { gap: 8 },
  hairline: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border },

  // Tuiles de taille — lettre + objet-repère intégré (bench : Shopee/Kakao T).
  tailleTiles: { flexDirection: 'row', gap: 8 },
  tailleTile: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: Radii.lg,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tailleTileActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },

  // Ligne d'ouverture d'une saisie (description, destinataire) — cadre surfaceAlt.
  fieldRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.lg,
    borderWidth: 1, borderColor: Colors.borderSubtle,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  // Feuille destinataire — contacts.
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.bg,
    borderRadius: Radii.md,
    paddingHorizontal: 14,
    minHeight: 48,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: Poppins.regular,
    color: Colors.textPrimary,
    paddingVertical: 12,
  },
  noContact: { paddingVertical: 18 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  contactDivider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.borderSubtle, marginLeft: 58 },
  manualRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginTop: 10,
    paddingVertical: 10,
  },
  manualIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primarySubtle,
    alignItems: 'center', justifyContent: 'center',
  },
  backToContacts: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14,
  },

  // Feuilles modales de saisie.
  descInput: {
    backgroundColor: Colors.bg,
    borderRadius: Radii.md,
    padding: 14,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: Poppins.regular,
    color: Colors.textPrimary,
    minHeight: 84,
  },
  descCount: { marginTop: 6, marginBottom: 10 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.bg,
    borderRadius: Radii.lg,
    paddingHorizontal: 16,
    minHeight: 56,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: Poppins.medium,
    color: Colors.textPrimary,
    paddingVertical: 16,
  },
  sheetCta: { marginTop: 4 },
});
