import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Animated, ScrollView, Image,
  Share, LayoutAnimation, Platform, UIManager, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import LeafletMap, { LeafletMapHandle } from '@/components/LeafletMap';
import { Handle, SHEET_RADIUS } from '@/components/Sheet';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import Button from '@/components/Button';
import BottomSheet from '@/components/BottomSheet';
import {
  groupedSheetSurface, SheetCard, VehicleGroup, RouteCard, InfoBanner, ActionPill, CARD_GAP,
} from '@/components/RideSheet';
import { useSnapSheet } from '@/hooks/useSnapSheet';
import { Colors, Radii, Poppins } from '@/constants/tokens';
import { DRIVER, MOTO_DRIVER, DAKAR_CENTER, WAIT_FEE_PER_MIN } from '@/constants/data';
import { payIllustration, type IlluKey } from '@/constants/illustrations';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Motion : la feuille lisse sa hauteur quand on passe d'une étape à l'autre.
const SHEET_LAYOUT = {
  duration: 300,
  update: { type: LayoutAnimation.Types.easeInEaseOut },
  create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
  delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
};

type StepKey = 'en_route' | 'arrived' | 'in_progress' | 'finished';

const STEPS: { key: StepKey; duration: number }[] = [
  { key: 'en_route', duration: 55000 },
  { key: 'arrived', duration: 12000 },
  { key: 'in_progress', duration: 60000 },
  { key: 'finished', duration: 0 },
];

const DRIVER_START = { lat: 14.7100, lng: -17.4500 };
// Délai gratuit COMPRESSÉ pour la démo (règle réelle : WAIT_GRACE_MINUTES).
const GRACE_SECONDS_SIM = 3;

const SCREEN_H = Dimensions.get('window').height;
// Feuille de suivi à 3 crans, HUG-CONTENT : elle épouse exactement son contenu —
// AUCUN vide gris sous la dernière carte. `translateY` la décale vers le bas pour
// la replier (glisser l'en-tête = redimensionner). Le corps ne scrolle QUE si le
// contenu dépasse l'écran (borne `bodyMaxH`). Crans mesurés au layout, cf. `snaps`.

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/[\s  ]/g, '.');

function getMapConfig(stepKey: StepKey, destLat: number, destLng: number) {
  switch (stepKey) {
    case 'en_route':
      return {
        center: { lat: (DRIVER_START.lat + DAKAR_CENTER.lat) / 2, lng: (DRIVER_START.lng + DAKAR_CENTER.lng) / 2 },
        zoom: 13,
        markers: [
          { lat: DAKAR_CENTER.lat, lng: DAKAR_CENTER.lng, type: 'origin' as const },
          { lat: DRIVER_START.lat, lng: DRIVER_START.lng, type: 'driver' as const },
        ],
        route: { from: DRIVER_START, to: DAKAR_CENTER, animateDuration: 54000 },
      };
    case 'arrived':
      return {
        center: DAKAR_CENTER, zoom: 16,
        markers: [{ lat: DAKAR_CENTER.lat, lng: DAKAR_CENTER.lng, type: 'driver' as const }],
        route: undefined,
      };
    case 'in_progress':
      return {
        center: { lat: (DAKAR_CENTER.lat + destLat) / 2, lng: (DAKAR_CENTER.lng + destLng) / 2 },
        zoom: 13,
        markers: [
          { lat: DAKAR_CENTER.lat, lng: DAKAR_CENTER.lng, type: 'driver' as const },
          { lat: destLat, lng: destLng, type: 'destination' as const },
        ],
        route: { from: DAKAR_CENTER, to: { lat: destLat, lng: destLng }, animateDuration: 59000 },
      };
    default:
      return { center: DAKAR_CENTER, zoom: 14, markers: [], route: undefined };
  }
}

export default function CourseActiveScreen() {
  const params = useLocalSearchParams<{
    destName: string; gammeLabel: string; gammeId: string; gammeIllu?: string;
    finalPrice: string; paymentId: string; selectedOption: string;
    destLat: string; destLng: string;
  }>();

  const driver = params.gammeId === 'moto' ? MOTO_DRIVER : DRIVER;
  const illu = (params.gammeIllu || (params.gammeId === 'moto' ? 'moto' : 'auto')) as IlluKey;
  const basePrice = parseInt(params.finalPrice || '1500');
  const destLat = parseFloat(params.destLat || String(DAKAR_CENTER.lat));
  const destLng = parseFloat(params.destLng || String(DAKAR_CENTER.lng));

  const insets = useSafeAreaInsets();
  const [stepIndex, setStepIndex] = useState(0);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const [etaSeconds, setEtaSeconds] = useState(Math.round(STEPS[0].duration / 1000));
  const [sosOpen, setSosOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const mapRef = useRef<LeafletMapHandle>(null);

  // Actions de comm/sécurité — aucun numéro brut du prestataire n'est exposé.
  const onCall = () => router.push({ pathname: '/transport/call', params: { name: driver.name } });
  const onChat = () => router.push({ pathname: '/transport/chat', params: { name: driver.name } });
  const onShare = () => {
    Share.share({ message: `Suivez ma course Fiw en direct : https://fiw.sn/suivi/${driver.plate.replace(/-/g, '')}` });
  };
  const onSos = () => setSosOpen(true);

  const step = STEPS[stepIndex];
  const waitFrais = waitSeconds > GRACE_SECONDS_SIM ? (waitSeconds - GRACE_SECONDS_SIM) * WAIT_FEE_PER_MIN : 0;
  const currentPrice = basePrice + waitFrais;
  const mapConfig = getMapConfig(step.key, destLat, destLng);

  // Crans mesurés : hauteur totale (hug-content) + hauteur de l'en-tête (contenu
  // du cran replié). Le corps est borné à `bodyMaxH` pour que la feuille pleine ne
  // dépasse jamais l'écran ; au-delà, le corps scrolle.
  const [sheetH, setSheetH] = useState(0);
  const [headerH, setHeaderH] = useState(0);
  const [bodyContentH, setBodyContentH] = useState(0);
  const bodyMaxH = Math.max(160, SCREEN_H - insets.top - headerH - 12);
  // Le corps épouse son contenu (borné à l'écran) — un ScrollView ne se
  // dimensionne pas seul dans un parent hug, on lui fixe donc min(contenu, max).
  const bodyH = Math.min(bodyContentH, bodyMaxH);
  const snaps = useMemo(() => {
    if (!sheetH || !headerH) return [0, 0, 0];
    const peek = Math.max(1, Math.round(sheetH - headerH));   // ne montre que l'en-tête
    const mid = Math.min(peek - 1, Math.round(sheetH * 0.44)); // ~ moitié haute
    return [0, Math.max(1, mid), peek];                       // [étendu · milieu · replié]
  }, [sheetH, headerH]);

  const { ty, snapTo, panHandlers } = useSnapSheet({ snaps, initial: SCREEN_H });
  const expand = () => snapTo(0); // chevron prestataire → cran étendu

  // Entrée : une fois tout mesuré, la feuille monte au cran milieu.
  const didEnter = useRef(false);
  useEffect(() => {
    if (sheetH > 0 && headerH > 0 && bodyContentH > 0 && !didEnter.current) {
      didEnter.current = true;
      snapTo(snaps[1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetH, headerH, bodyContentH]);

  // Progression des étapes — chaque avance lisse la hauteur de la feuille.
  useEffect(() => {
    if (step.duration === 0) return;
    const timer = setTimeout(() => {
      LayoutAnimation.configureNext(SHEET_LAYOUT);
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, step.duration);
    return () => clearTimeout(timer);
  }, [stepIndex]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (step.key === 'arrived') {
      timer = setInterval(() => setWaitSeconds((s) => s + 1), 1000);
    } else {
      setWaitSeconds(0);
    }
    return () => clearInterval(timer);
  }, [stepIndex]);

  useEffect(() => {
    if (step.key !== 'en_route') return;
    const timer = setInterval(() => setEtaSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [stepIndex]);

  useEffect(() => {
    if (step.key === 'finished') {
      setTimeout(() => {
        router.replace({
          pathname: '/transport/cloture',
          params: {
            destName: params.destName, gammeLabel: params.gammeLabel, gammeId: params.gammeId,
            finalPrice: currentPrice, paymentId: params.paymentId,
            selectedOption: params.selectedOption, waitFrais,
          },
        });
      }, 1200);
    }
  }, [stepIndex]);

  const mm = Math.floor(etaSeconds / 60);
  const etaLabel = mm >= 1 ? `environ ${mm} min` : "moins d'une minute";
  const inGrace = waitSeconds <= GRACE_SECONDS_SIM;
  const graceRemaining = Math.max(0, GRACE_SECONDS_SIM - waitSeconds);
  const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <LeafletMap
        key={`map-${step.key}`}
        ref={mapRef}
        center={mapConfig.center}
        zoom={mapConfig.zoom}
        markers={mapConfig.markers}
        route={mapConfig.route}
        mapStyle="mapbox://styles/mapbox/light-v11"
        tintWater
        declutter
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View
        style={[groupedSheetSurface, styles.snapSheet, { transform: [{ translateY: ty }] }]}
        onLayout={(e) => setSheetH(e.nativeEvent.layout.height)}
      >
        {/* EN-TÊTE — zone de glissement (redimensionne) ; visible au cran replié. */}
        <View
          style={styles.headerZone}
          {...panHandlers}
          onLayout={(e) => setHeaderH(e.nativeEvent.layout.height)}
        >
          <View style={styles.handleFloat} pointerEvents="none"><Handle /></View>
          <SheetCard style={styles.headerCard}>
            {step.key === 'en_route' && (
              <Text variant="heading2">Votre prestataire arrive dans {etaLabel}</Text>
            )}
            {step.key === 'arrived' && (
              <View style={styles.titleRow}>
                <Text variant="heading2" style={styles.flex1} numberOfLines={1}>Votre prestataire est arrivé</Text>
                <ActionPill label="J'arrive" icon="walk" onPress={() => {}} />
              </View>
            )}
            {step.key === 'in_progress' && (
              <Text variant="heading2">En route vers votre destination</Text>
            )}
          </SheetCard>
        </View>

        {/* CORPS — hug-content ; scrolle uniquement si le contenu dépasse l'écran. */}
        <ScrollView
          style={[styles.body, { height: bodyH }]}
          contentContainerStyle={styles.bodyContent}
          onContentSizeChange={(_w, h) => setBodyContentH(h)}
          scrollEnabled={bodyContentH > bodyMaxH}
          showsVerticalScrollIndicator={false}
        >
          {/* En-tête prestataire (+ bannière frais d'attente à l'arrivée, DANS la
              carte comme la maquette 163:903, pas flottante sur le fond). */}
          <SheetCard>
            {step.key === 'arrived' && (
              inGrace ? (
                <InfoBanner icon="coins">
                  Vous payez {WAIT_FEE_PER_MIN}F de frais d'attente dans {mmss(graceRemaining)}
                </InfoBanner>
              ) : (
                <InfoBanner icon="coins" tone="warn">
                  Frais d'attente en cours · {fmt(waitFrais)} F
                </InfoBanner>
              )
            )}
            <VehicleGroup driver={driver} illu={illu} onPress={expand} />
          </SheetCard>

          {/* InfosCourse — itinéraire + paiement (maquette 173:691). */}
          <SheetCard>
            <RouteCard departure="Ma position actuelle" destination={params.destName} />
            <View style={styles.paymentRow}>
              <View style={styles.paymentLeft}>
                <Icon name="coins" size={20} color={Colors.textSecondary} />
                <Text variant="label">Paiement</Text>
              </View>
              <View style={styles.paymentRight}>
                <Text style={styles.paymentAmount}>{fmt(currentPrice)} F</Text>
                <Image source={payIllustration(params.paymentId)} style={styles.paymentIllu} />
              </View>
            </View>
          </SheetCard>

          {/* Actions — contacts, urgence, annulation. Dernière carte : blanc
              jusqu'en bas (zone sûre absorbée), pas de vide gris. */}
          <SheetCard style={[styles.lastCard, { paddingBottom: 20 + insets.bottom }]}>
            <View style={styles.tilesRow}>
              <ActionTile icon="phone" label="Appeler" onPress={onCall} />
              <ActionTile icon="chat" label="Chat" onPress={onChat} />
              <ActionTile icon="share" label="Partager" onPress={onShare} />
              <ActionTile icon="sos" label="Urgence" danger onPress={onSos} />
            </View>
            <Button
              label="Annuler la course"
              variant="destructive"
              onPress={() => setCancelOpen(true)}
            />
          </SheetCard>
        </ScrollView>
      </Animated.View>

      {/* Confirmation d'annulation — dissuade (prestataire déjà en route),
          action primaire = garder, action destructive = annuler (façon Bolt/Uber). */}
      {cancelOpen && (
        <BottomSheet onClose={() => setCancelOpen(false)}>
          {(close) => (
            <View style={styles.cancelSheet}>
              <View style={styles.cancelBadge}>
                <Icon name="car" size={28} weight="bold" color={Colors.error} />
              </View>
              <Text variant="heading1" align="center">Annuler la course ?</Text>
              <Text variant="body" color={Colors.textSecondary} align="center" style={styles.cancelText}>
                Votre prestataire est déjà en route vers vous. Annuler maintenant peut allonger votre prochaine attente.
              </Text>
              <Button label="Garder ma course" onPress={close} style={styles.cancelBtn} />
              <Button
                label="Annuler la course"
                variant="destructive"
                onPress={() => { close(); router.replace('/home'); }}
                style={styles.cancelBtn}
              />
            </View>
          )}
        </BottomSheet>
      )}

      {/* Confirmation SOS. */}
      {sosOpen && (
        <BottomSheet title="Alerte SOS envoyée" onClose={() => setSosOpen(false)}>
          {(close) => (
            <View style={styles.sosSheet}>
              <View style={styles.sosBadge}>
                <Icon name="sos" size={28} weight="fill" color={Colors.error} />
              </View>
              <Text variant="body" color={Colors.textSecondary} align="center" style={styles.sosText}>
                Votre position a été partagée avec vos contacts de confiance et le service de sécurité Fiw. Un agent vous contacte immédiatement.
              </Text>
              <Button label="J'ai compris" onPress={close} style={styles.sosCta} />
            </View>
          )}
        </BottomSheet>
      )}
    </View>
  );
}

/* Tuile d'action (contact / sécurité) — icône + libellé, fond `bg` (maquette). */
function ActionTile({ icon, label, danger, onPress }: {
  icon: IconName; label: string; danger?: boolean; onPress?: () => void;
}) {
  const color = danger ? Colors.error : Colors.primary;
  return (
    <TouchableOpacity style={[styles.tile, danger && styles.tileDanger]} onPress={onPress} activeOpacity={0.85}>
      <Icon name={icon} size={20} color={color} weight={danger ? 'fill' : 'bold'} />
      <Text variant="caption" color={danger ? Colors.error : Colors.textPrimary}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex1: { flex: 1 },

  // Feuille de suivi à 3 crans — géométrie GroupedSheet (fond track, aucun padding
  // de feuille, cartes pleine largeur), HUG-CONTENT (pas de hauteur fixe → aucun
  // vide gris), décalée par `translateY` pour se replier.
  snapSheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
  },
  headerZone: { zIndex: 1 },
  // Poignée flottante décorative (le drag est capté par toute la zone d'en-tête).
  handleFloat: {
    position: 'absolute',
    top: 6, left: 0, right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  // 1re carte : coins hauts alignés sur la feuille (28), comme GroupedSheet.
  headerCard: { borderTopLeftRadius: SHEET_RADIUS, borderTopRightRadius: SHEET_RADIUS },
  // Dernière carte : coins bas carrés, blanc jusqu'au bord de l'écran.
  lastCard: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  // Corps — fond transparent pour laisser transparaître le `track` dans les gaps.
  body: { backgroundColor: 'transparent' },
  bodyContent: { paddingTop: CARD_GAP, gap: CARD_GAP },

  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  // Paiement (maquette 177:750) — libellé à gauche, montant + illustration à droite.
  paymentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  paymentLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  paymentRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  paymentAmount: { fontFamily: Poppins.bold, fontSize: 18, color: Colors.primary },
  paymentIllu: { width: 24, height: 24, borderRadius: 6 },

  tilesRow: { flexDirection: 'row', gap: 8 },
  tile: {
    flex: 1, alignItems: 'center', gap: 8,
    paddingVertical: 12,
    backgroundColor: Colors.bg,
    borderRadius: Radii.md,
  },
  tileDanger: { backgroundColor: Colors.errorSubtle },

  // Confirmation d'annulation.
  cancelSheet: { alignItems: 'center', gap: 10, paddingTop: 4, paddingBottom: 8 },
  cancelBadge: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.errorSubtle,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  cancelText: { maxWidth: 320, marginBottom: 6 },
  cancelBtn: { alignSelf: 'stretch' },

  // SOS.
  sosSheet: { alignItems: 'center', gap: 14, paddingTop: 4, paddingBottom: 8 },
  sosBadge: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.errorSubtle,
    alignItems: 'center', justifyContent: 'center',
  },
  sosText: { maxWidth: 300 },
  sosCta: { alignSelf: 'stretch', marginTop: 4 },
});
