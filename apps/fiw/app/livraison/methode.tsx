import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Animated, Image, ScrollView, Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import LeafletMap, { LeafletMapHandle } from '@/components/LeafletMap';
import IconButton from '@/components/IconButton';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import Button from '@/components/Button';
import GammeCard from '@/components/GammeCard';
import { Handle, SHEET_RADIUS } from '@/components/Sheet';
import { groupedSheetSurface, SheetCard, RouteCard, CARD_GAP } from '@/components/RideSheet';
import { useSnapSheet } from '@/hooks/useSnapSheet';
import { Colors, Radii } from '@/constants/tokens';
import { LIVRAISON_GAMMES, DAKAR_CENTER } from '@/constants/data';
import { topviewSprite } from '@/constants/illustrations';

const SCREEN_H = Dimensions.get('window').height;

/**
 * Livraison — étape 1 : la méthode (Vélo Express / Moto Livraison).
 *
 * Le véhicule se choisit AVANT les détails du colis (réf. Transport Fiw, Uber,
 * inDrive) : c'est lui qui porte le prix et la capacité, donc la décision
 * structurante. Les détails à renseigner ensuite (type, taille, destinataire,
 * paiement) dépendent d'un envoi déjà cadré — pas l'inverse.
 *
 * Le prix affiché sur les cartes est le prix standard ; le prix définitif se
 * joue en mise en relation (groupage détecté, frais de rapprochement).
 */
export default function LivraisonMethodeScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    departureName: string;
    destName: string; destDetail: string; destLat: string; destLng: string;
    preselectGamme?: string;
  }>();

  const departureName = params.departureName || 'Ma position actuelle';
  const destLat = parseFloat(params.destLat || String(DAKAR_CENTER.lat));
  const destLng = parseFloat(params.destLng || String(DAKAR_CENTER.lng));
  const mapCenter = { lat: (DAKAR_CENTER.lat + destLat) / 2, lng: (DAKAR_CENTER.lng + destLng) / 2 };

  const [gammeId, setGammeId] = useState(params.preselectGamme || 'velo');
  const gamme = LIVRAISON_GAMMES.find((g) => g.id === gammeId) ?? LIVRAISON_GAMMES[0];

  const select = (fn: () => void) => { Haptics.selectionAsync(); fn(); };

  // Prestataires Livraison dispersés autour de l'itinéraire — le marqueur suit
  // la gamme sélectionnée (vélo ou scooter).
  const mapRef = useRef<LeafletMapHandle>(null);
  const providers = useMemo(() => {
    const o = mapCenter;
    return [
      [0.010, -0.012], [-0.009, 0.011], [0.013, 0.006],
      [-0.012, -0.009], [0.004, 0.014], [-0.014, 0.003],
    ].map(([dlat, dlng]) => ({ lat: o.lat + dlat, lng: o.lng + dlng }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Sur la carte, le véhicule se lit du dessus (variante `top view` du jeu
  // `mobility option`) — le sprite pivote alors selon le cap de sa rue.
  const providerSprite = useMemo(() => topviewSprite(gamme.illu), [gamme.illu]);
  const initialProviderSprite = useRef(providerSprite).current;
  // Change de gamme → échange le sprite des prestataires (sans recharger).
  useEffect(() => { mapRef.current?.setProviderSprite(providerSprite); }, [providerSprite]);

  // Crans mesurés (même mécanique que configure/suivi) : l'en-tête se glisse
  // pour rétracter la feuille, le corps est borné à l'écran et scrolle au-delà.
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
    router.push({
      pathname: '/livraison/configure',
      params: {
        ...params,
        departureName,
        gammeId: gamme.id,
        gammeLabel: gamme.label,
        gammePrice: String(gamme.basePrice),
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
        providerSprite={initialProviderSprite}
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
              <Text variant="heading1" style={styles.flex1} numberOfLines={1}>Méthode de livraison</Text>
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
          {/* Itinéraire Collecte → Livraison — le cadre de la décision qui suit. */}
          <SheetCard>
            <RouteCard
              departure={departureName}
              destination={params.destName || ''}
              labels={{ from: 'Collecte', to: 'Livraison' }}
              icons={{ from: 'package', to: 'flag' }}
              onEdit={editItinerary}
            />
          </SheetCard>

          {/* Gamme Livraison — le prix standard vit sur les cartes. */}
          <SheetCard>
            <View style={styles.gRow}>
              {LIVRAISON_GAMMES.map((g) => (
                <GammeCard
                  key={g.id}
                  label={g.label}
                  eta={g.eta}
                  price={g.basePrice}
                  illu={g.illu}
                  description={`${g.description} · ${g.capacity.toLowerCase()}`}
                  selected={gammeId === g.id}
                  onPress={() => select(() => setGammeId(g.id))}
                  style={styles.gCard}
                />
              ))}
            </View>
          </SheetCard>

          <SheetCard style={[styles.lastCard, { paddingBottom: 20 + insets.bottom }]}>
            <Button label="Continuer" onPress={continuer} />
          </SheetCard>
        </ScrollView>
      </Animated.View>
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

  // Cartes gamme — deux gammes côte à côte (la largeur Figma fixe cède au flex).
  gRow: { flexDirection: 'row', gap: 10, paddingTop: 2 },
  gCard: { flex: 1, width: undefined },
});
