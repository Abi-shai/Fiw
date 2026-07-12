import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Animated, Image, ScrollView, Dimensions,
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
import PaymentSheetContent from '@/components/PaymentSheet';
import { Handle, SHEET_RADIUS } from '@/components/Sheet';
import { groupedSheetSurface, SheetCard, CARD_GAP } from '@/components/RideSheet';
import { useSnapSheet } from '@/hooks/useSnapSheet';
import { Colors, Radii, Poppins } from '@/constants/tokens';
import {
  LIVRAISON_GAMMES, DAKAR_CENTER,
  makeTrackingNumber, makeCodeRemise,
} from '@/constants/data';
import { gammeIllustration, payIllustration } from '@/constants/illustrations';

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/[\s  ]/g, '.');
const GAMME_SPRING = { stiffness: 220, damping: 22, mass: 1 };
const SCREEN_H = Dimensions.get('window').height;

/**
 * Carte gamme Livraison (Vélo Express / Moto Livraison) — même langage que la
 * carte gamme Transport (plateforme colorée, badge ETA en débord, prix). Le vélo
 * n'a pas encore d'illustration isométrique : rendu en icône `bicycle` sur la
 * plateforme (asset à remplacer).
 */
function LivGammeCard({ gamme, selected, onPress }: {
  gamme: typeof LIVRAISON_GAMMES[number]; selected: boolean; onPress: () => void;
}) {
  const progress = useRef(new Animated.Value(selected ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(progress, { toValue: selected ? 1 : 0, ...GAMME_SPRING, useNativeDriver: false }).start();
  }, [selected]);

  const cardBg = progress.interpolate({ inputRange: [0, 1], outputRange: [Colors.surfaceAlt, Colors.primarySubtle] });
  const cardOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
  const platformBg = progress.interpolate({ inputRange: [0, 1], outputRange: [Colors.track, Colors.primary] });
  const platformScale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });

  return (
    <TouchableOpacity style={styles.gCard} onPress={onPress} activeOpacity={0.9}>
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.gCardBg, { backgroundColor: cardBg }]} />
      <Animated.View style={[styles.gContent, { opacity: cardOpacity }]}>
        <Animated.View style={[styles.gPlatform, { backgroundColor: platformBg, transform: [{ scale: platformScale }] }]}>
          {gamme.illu ? (
            <Image source={gammeIllustration(gamme.illu)} style={styles.gIllo} resizeMode="contain" />
          ) : (
            <Icon name={gamme.icon} size={46} weight="fill" color={selected ? Colors.surface : Colors.gray600} />
          )}
          <View style={[styles.gEta, selected && styles.gEtaSel]}>
            <Icon name="timer" size={12} weight="bold" color={Colors.textPrimary} />
            <Text variant="caption" style={styles.gEtaText}>{gamme.eta}</Text>
          </View>
        </Animated.View>
        <View style={styles.gInfo}>
          <Text variant="label" numberOfLines={1} align="center">{gamme.label}</Text>
          <Text variant="caption" color={Colors.textSecondary} align="center" numberOfLines={1}>
            {gamme.description} · {gamme.capacity.toLowerCase()}
          </Text>
          <Text variant="heading2" align="center" color={selected ? Colors.primary : Colors.textPrimary}>
            {fmt(gamme.basePrice)} FCFA
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

/**
 * Livraison — étape 2 : gamme, mode Express/Groupée, créneau, paiement, total
 * (réf. benchmark : Grab « Review Order », tiers tarifés Kakao T, créneaux
 * différés Grab « When should we pick it up? »).
 */
export default function LivraisonOptionsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    departureName: string;
    destName: string; destDetail: string; destLat: string; destLng: string;
    colisType: string; colisTaille: string; colisDesc: string;
    destinataireName: string; destinatairePhone: string;
    preselectGamme?: string;
  }>();

  const destLat = parseFloat(params.destLat || String(DAKAR_CENTER.lat));
  const destLng = parseFloat(params.destLng || String(DAKAR_CENTER.lng));
  const mapCenter = { lat: (DAKAR_CENTER.lat + destLat) / 2, lng: (DAKAR_CENTER.lng + destLng) / 2 };

  const [gammeId, setGammeId] = useState(params.preselectGamme || 'velo');
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [pendingPayment, setPendingPayment] = useState('cash');
  const [payOpen, setPayOpen] = useState(false);

  // Le prix vit sur les cartes gamme (prix standard) ; le prix définitif se
  // joue pendant la mise en relation (groupage détecté, frais de rapprochement
  // — Product Doc « B — Détection automatique »). Ni total figé, ni « Quand ? » :
  // le départ est immédiat, le différé n'existe pas dans ce modèle.
  const gamme = LIVRAISON_GAMMES.find((g) => g.id === gammeId) ?? LIVRAISON_GAMMES[0];

  const select = (fn: () => void) => { Haptics.selectionAsync(); fn(); };

  // Prestataires Livraison dispersés autour de l'itinéraire (scooter bleu).
  const mapRef = useRef<LeafletMapHandle>(null);
  const providers = useMemo(() => {
    const o = mapCenter;
    return [
      [0.010, -0.012], [-0.009, 0.011], [0.013, 0.006],
      [-0.012, -0.009], [0.004, 0.014], [-0.014, 0.003],
    ].map(([dlat, dlng]) => ({ lat: o.lat + dlat, lng: o.lng + dlng }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const providerIcon = useMemo(
    () => Image.resolveAssetSource(gammeIllustration('livraison')).uri,
    [],
  );

  // Crans mesurés (même mécanique que configure/suivi) : le contenu dépasse une
  // feuille statique — l'en-tête se glisse pour rétracter la feuille, le corps
  // est borné à l'écran et scrolle au-delà.
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

  const didEnter = useRef(false);
  useEffect(() => {
    if (sheetH > 0 && headerH > 0 && bodyContentH > 0 && !didEnter.current) {
      didEnter.current = true;
      snapTo(snaps[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetH, headerH, bodyContentH]);

  const openPay = () => {
    Haptics.selectionAsync();
    setPendingPayment(selectedPayment);
    setPayOpen(true);
  };

  const confirm = () => {
    Haptics.selectionAsync();
    router.push({
      pathname: '/livraison/searching',
      params: {
        ...params,
        gammeId: gamme.id,
        gammeLabel: gamme.label,
        gammePrice: String(gamme.basePrice),
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
        providers={providers}
        providerIcon={providerIcon}
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
              <Text variant="heading1" style={styles.flex1} numberOfLines={1}>Options de livraison</Text>
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
          {/* Gamme Livraison — le prix standard vit sur les cartes. */}
          <SheetCard>
            <View style={styles.gRow}>
              {LIVRAISON_GAMMES.map((g) => (
                <LivGammeCard
                  key={g.id}
                  gamme={g}
                  selected={gammeId === g.id}
                  onPress={() => select(() => setGammeId(g.id))}
                />
              ))}
            </View>
          </SheetCard>

          {/* Paiement + confirmation. */}
          <SheetCard style={[styles.lastCard, { paddingBottom: 20 + insets.bottom }]}>
            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.payBtn} onPress={openPay} activeOpacity={0.85}>
                <Image source={payIllustration(selectedPayment)} style={styles.payImg} />
              </TouchableOpacity>
              <Button label="Confirmer la livraison" onPress={confirm} style={styles.cta} />
            </View>
          </SheetCard>
        </ScrollView>
      </Animated.View>

      {/* Moyen de paiement — feuille modale partagée. */}
      {payOpen && (
        <BottomSheet
          title="Modes de paiement"
          onClose={() => { setSelectedPayment(pendingPayment); setPayOpen(false); }}
        >
          {(close) => (
            <PaymentSheetContent value={pendingPayment} onChange={setPendingPayment} onDone={close} />
          )}
        </BottomSheet>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  flex1: { flex: 1 },

  // Feuille à 3 crans — géométrie GroupedSheet, hug-content, rétractable.
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

  // Cartes gamme — deux gammes côte à côte.
  gRow: { flexDirection: 'row', gap: 10, paddingTop: 2 },
  gCard: { flex: 1, height: 168, padding: 8, borderRadius: Radii.lg },
  gCardBg: { borderRadius: Radii.lg },
  gContent: { flex: 1, gap: 12 },
  gPlatform: {
    height: 76, width: '100%',
    borderRadius: Radii.md,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'visible',
  },
  gIllo: { width: 64, height: 64 },
  gInfo: { gap: 3 },
  gEta: {
    position: 'absolute',
    bottom: -8, left: 0,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.surface,
    borderRadius: Radii.pill,
    borderWidth: 1, borderColor: Colors.borderSubtle,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  gEtaSel: { borderColor: Colors.primarySubtle },
  gEtaText: { fontFamily: Poppins.medium, color: Colors.textPrimary },

  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payBtn: { padding: 4 },
  payImg: { width: 40, height: 40, borderRadius: 11 },
  cta: { flex: 1 },
});
