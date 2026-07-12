import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Animated, ScrollView, Image,
  Share, LayoutAnimation, Platform, UIManager, Dimensions, Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import LeafletMap, { LeafletMapHandle } from '@/components/LeafletMap';
import { Handle, SHEET_RADIUS } from '@/components/Sheet';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import Button from '@/components/Button';
import BottomSheet from '@/components/BottomSheet';
import StepProgress, { type Step } from '@/components/StepProgress';
import CodePill from '@/components/CodePill';
import {
  groupedSheetSurface, SheetCard, VehicleGroup, RouteCard, InfoBanner, ActionPill, CARD_GAP,
} from '@/components/RideSheet';
import { useSnapSheet } from '@/hooks/useSnapSheet';
import { Colors, Radii, Poppins } from '@/constants/tokens';
import { VELO_LIVREUR, MOTO_LIVREUR, DAKAR_CENTER } from '@/constants/data';
import { payIllustration } from '@/constants/illustrations';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SHEET_LAYOUT = {
  duration: 300,
  update: { type: LayoutAnimation.Types.easeInEaseOut },
  create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
  delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
};

// Étapes du suivi (proto : progression automatique, comme la course active) :
// vers la collecte → remise du colis au prestataire → trajet → remise finale.
type StepKey = 'vers_collecte' | 'collecte' | 'vers_livraison' | 'remise' | 'finished';

const STEPS: { key: StepKey; duration: number }[] = [
  { key: 'vers_collecte', duration: 45000 },
  { key: 'collecte', duration: 12000 },
  { key: 'vers_livraison', duration: 55000 },
  { key: 'remise', duration: 12000 },
  { key: 'finished', duration: 0 },
];

// Jalons affichés (réf. benchmark : barre segmentée Shopee SPX / Walmart).
const JALONS: Step[] = [
  { icon: 'package', label: 'Collecte' },
  { icon: 'navigate', label: 'En route' },
  { icon: 'flag', label: 'Livraison' },
  { icon: 'shield', label: 'Remis' },
];
const JALON_INDEX: Record<StepKey, number> = {
  vers_collecte: 0, collecte: 0, vers_livraison: 1, remise: 2, finished: 3,
};

// Remplissage du segment vers le jalon suivant, par étape de simulation : la
// barre grise se remplit en continu jusqu'à atteindre le jalon. Les deux
// premières étapes vivent sur le jalon Collecte → elles se partagent le même
// segment (trajet ≈ 78 % du temps, remise du colis le reste).
const SEG_PLAN: Record<StepKey, { from: number; to: number } | null> = {
  vers_collecte: { from: 0, to: 0.78 },
  collecte: { from: 0.78, to: 1 },
  vers_livraison: { from: 0, to: 1 },
  remise: { from: 0, to: 1 },
  finished: null,
};

const DRIVER_START = { lat: 14.7100, lng: -17.4500 };
const SCREEN_H = Dimensions.get('window').height;

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/[\s  ]/g, '.');

function getMapConfig(stepKey: StepKey, destLat: number, destLng: number) {
  switch (stepKey) {
    case 'vers_collecte':
      return {
        center: { lat: (DRIVER_START.lat + DAKAR_CENTER.lat) / 2, lng: (DRIVER_START.lng + DAKAR_CENTER.lng) / 2 },
        zoom: 13,
        markers: [
          { lat: DAKAR_CENTER.lat, lng: DAKAR_CENTER.lng, type: 'origin' as const },
          { lat: DRIVER_START.lat, lng: DRIVER_START.lng, type: 'driver' as const },
        ],
        route: { from: DRIVER_START, to: DAKAR_CENTER, animateDuration: 44000 },
      };
    case 'collecte':
      return {
        center: DAKAR_CENTER, zoom: 16,
        markers: [{ lat: DAKAR_CENTER.lat, lng: DAKAR_CENTER.lng, type: 'driver' as const }],
        route: undefined,
      };
    case 'vers_livraison':
      return {
        center: { lat: (DAKAR_CENTER.lat + destLat) / 2, lng: (DAKAR_CENTER.lng + destLng) / 2 },
        zoom: 13,
        markers: [
          { lat: DAKAR_CENTER.lat, lng: DAKAR_CENTER.lng, type: 'driver' as const },
          { lat: destLat, lng: destLng, type: 'destination' as const },
        ],
        route: { from: DAKAR_CENTER, to: { lat: destLat, lng: destLng }, animateDuration: 54000 },
      };
    case 'remise':
      return {
        center: { lat: destLat, lng: destLng }, zoom: 16,
        markers: [{ lat: destLat, lng: destLng, type: 'driver' as const }],
        route: undefined,
      };
    default:
      return { center: DAKAR_CENTER, zoom: 14, markers: [], route: undefined };
  }
}

/**
 * Suivi de Livraison active — feuille à 3 crans hug-content (pattern course
 * active) : statut + jalons en tête, prestataire, colis (n° de suivi + code de
 * remise), détails, actions. L'annulation n'est possible qu'avant la collecte
 * (sans frais, cf. sitemap 4.3).
 */
export default function LivraisonSuiviScreen() {
  const params = useLocalSearchParams<{
    departureName?: string; destName: string; destLat: string; destLng: string;
    colisType: string; colisTaille: string; colisDesc: string;
    destinataireName: string; destinatairePhone: string;
    gammeId: string; gammeLabel: string; finalPrice: string; paymentId: string;
    selectedOption: string; mode: string; tracking: string; codeRemise: string;
  }>();

  const driver = params.gammeId === 'velo' ? VELO_LIVREUR : MOTO_LIVREUR;
  const price = parseInt(params.finalPrice || '700', 10);
  const destLat = parseFloat(params.destLat || String(DAKAR_CENTER.lat));
  const destLng = parseFloat(params.destLng || String(DAKAR_CENTER.lng));

  const insets = useSafeAreaInsets();
  const [stepIndex, setStepIndex] = useState(0);
  const [etaSeconds, setEtaSeconds] = useState(Math.round(STEPS[0].duration / 1000));
  const [sosOpen, setSosOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const mapRef = useRef<LeafletMapHandle>(null);

  const onCall = () => router.push({ pathname: '/transport/call', params: { name: driver.name } });
  const onChat = () => router.push({ pathname: '/transport/chat', params: { name: driver.name } });
  const onShare = () => {
    Share.share({ message: `Suivez mon colis Fiw en direct : https://fiw.sn/colis/${params.tracking}` });
  };
  // Partage du code de remise au destinataire via les applis externes
  // (réf. benchmark : carte code + bouton Partager, Airalo/Hopper/Klook).
  const onShareCode = () => {
    Share.share({
      message: `Votre colis Fiw ${params.tracking} arrive ! Code de remise : ${params.codeRemise} — le prestataire vous le demandera à la remise.`,
    });
  };
  const onSos = () => setSosOpen(true);

  const step = STEPS[stepIndex];
  const mapConfig = getMapConfig(step.key, destLat, destLng);

  // Rendu véhicule : scooter illustré ; vélo en icône (pas encore d'asset).
  const vehicleArt = params.gammeId === 'velo'
    ? <Icon name="bicycle" size={34} weight="fill" color={Colors.gray600} />
    : undefined;

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
  const expand = () => snapTo(0);

  const didEnter = useRef(false);
  useEffect(() => {
    if (sheetH > 0 && headerH > 0 && bodyContentH > 0 && !didEnter.current) {
      didEnter.current = true;
      snapTo(snaps[1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetH, headerH, bodyContentH]);

  useEffect(() => {
    if (step.duration === 0) return;
    const timer = setTimeout(() => {
      LayoutAnimation.configureNext(SHEET_LAYOUT);
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, step.duration);
    return () => clearTimeout(timer);
  }, [stepIndex]);

  // Remplissage continu du segment de jalons courant, calé sur la durée de
  // l'étape (linéaire — c'est une barre de progression, pas un mouvement).
  const segFill = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const plan = SEG_PLAN[step.key];
    if (!plan) return;
    segFill.setValue(plan.from);
    const anim = Animated.timing(segFill, {
      toValue: plan.to,
      duration: step.duration,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  useEffect(() => {
    if (step.key !== 'vers_collecte' && step.key !== 'vers_livraison') return;
    setEtaSeconds(Math.round(step.duration / 1000));
    const timer = setInterval(() => setEtaSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [stepIndex]);

  useEffect(() => {
    if (step.key === 'finished') {
      setTimeout(() => {
        router.replace({
          pathname: '/livraison/cloture',
          params: {
            destName: params.destName, gammeId: params.gammeId, gammeLabel: params.gammeLabel,
            finalPrice: String(price), paymentId: params.paymentId,
            selectedOption: params.selectedOption, mode: params.mode,
            colisType: params.colisType, colisTaille: params.colisTaille,
            destinataireName: params.destinataireName, tracking: params.tracking,
          },
        });
      }, 1200);
    }
  }, [stepIndex]);

  const mm = Math.floor(etaSeconds / 60);
  const etaLabel = mm >= 1 ? `environ ${mm} min` : "moins d'une minute";
  // Le code de remise devient utile dès que le colis roule vers le destinataire.
  const showCode = step.key === 'vers_livraison' || step.key === 'remise';
  const canCancel = step.key === 'vers_collecte';

  const headerTitle = step.key === 'vers_collecte'
    ? `Votre prestataire arrive dans ${etaLabel}`
    : step.key === 'collecte'
      ? 'Remettez votre colis'
      : step.key === 'vers_livraison'
        ? `Colis en route · arrivée dans ${etaLabel}`
        : 'Remise au destinataire…';

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
        {/* EN-TÊTE — statut + jalons ; zone de glissement, visible replié. */}
        <View
          style={styles.headerZone}
          {...panHandlers}
          onLayout={(e) => setHeaderH(e.nativeEvent.layout.height)}
        >
          <View style={styles.handleFloat} pointerEvents="none"><Handle /></View>
          <SheetCard style={styles.headerCard}>
            {step.key === 'collecte' ? (
              <View style={styles.titleRow}>
                <Text variant="heading2" style={styles.flex1} numberOfLines={1}>{headerTitle}</Text>
                <ActionPill label="J'arrive" icon="walk" onPress={() => {}} />
              </View>
            ) : (
              <Text variant="heading2">{headerTitle}</Text>
            )}
            <StepProgress
              steps={JALONS}
              activeIndex={JALON_INDEX[step.key]}
              segmentProgress={segFill}
            />
          </SheetCard>
        </View>

        {/* CORPS — hug-content ; scrolle si le contenu dépasse l'écran. */}
        <ScrollView
          style={[styles.body, { height: bodyH }]}
          contentContainerStyle={styles.bodyContent}
          onContentSizeChange={(_w, h) => setBodyContentH(h)}
          scrollEnabled={bodyContentH > bodyMaxH}
          showsVerticalScrollIndicator={false}
        >
          {/* Prestataire (+ consigne à la collecte). */}
          <SheetCard>
            {step.key === 'collecte' && (
              <InfoBanner icon="package">
                Remettez le colis au prestataire — il enregistre le n° de suivi.
              </InfoBanner>
            )}
            <VehicleGroup driver={driver} illu="livraison" art={vehicleArt} onPress={expand} />
          </SheetCard>

          {/* Colis — type · taille, n° de suivi, code de remise. */}
          <SheetCard>
            <Text variant="heading2">Votre colis</Text>
            {params.mode === 'groupee' && (
              <InfoBanner icon="group">
                Livraison groupée — votre colis voyage avec un colis voisin.
              </InfoBanner>
            )}
            <View style={styles.colisRow}>
              <View style={styles.colisThumb}>
                <Icon name="package" size={22} weight="bold" color={Colors.primary} />
              </View>
              <View style={styles.flex1}>
                <Text variant="label" numberOfLines={1}>
                  {params.colisType} · Taille {params.colisTaille}
                </Text>
                {params.colisDesc ? (
                  <Text variant="caption" color={Colors.textSecondary} numberOfLines={1}>{params.colisDesc}</Text>
                ) : null}
              </View>
            </View>
            <View style={styles.trackingRow}>
              <Icon name="barcode" size={18} color={Colors.textSecondary} />
              <Text variant="caption" color={Colors.textSecondary}>N° de suivi</Text>
              <Text style={styles.trackingNum}>{params.tracking}</Text>
            </View>
            {showCode && (
              <View style={styles.codeWrap}>
                <CodePill code={params.codeRemise || '0000'} />
                <Text variant="caption" color={Colors.textSecondary} align="center">
                  Communiquez ce code à {params.destinataireName || 'votre destinataire'} — le prestataire le demandera à la remise.
                </Text>
                <Button label="Partager le code" icon="share" size="md" onPress={onShareCode} />
              </View>
            )}
          </SheetCard>

          {/* Détails — itinéraire + paiement. */}
          <SheetCard>
            <RouteCard
              departure={params.departureName || 'Ma position actuelle'}
              destination={`${params.destName} · ${params.destinataireName}`}
              labels={{ from: 'Collecte', to: 'Livraison' }}
              icons={{ from: 'package', to: 'flag' }}
            />
            <View style={styles.paymentRow}>
              <View style={styles.paymentLeft}>
                <Icon name="coins" size={20} color={Colors.textSecondary} />
                <Text variant="label">Paiement</Text>
              </View>
              <View style={styles.paymentRight}>
                <Text style={styles.paymentAmount}>{fmt(price)} F</Text>
                <Image source={payIllustration(params.paymentId)} style={styles.paymentIllu} />
              </View>
            </View>
          </SheetCard>

          {/* Actions — contacts, urgence, annulation (avant collecte uniquement). */}
          <SheetCard style={[styles.lastCard, { paddingBottom: 20 + insets.bottom }]}>
            <View style={styles.tilesRow}>
              <ActionTile icon="phone" label="Appeler" onPress={onCall} />
              <ActionTile icon="chat" label="Chat" onPress={onChat} />
              <ActionTile icon="share" label="Partager" onPress={onShare} />
              <ActionTile icon="sos" label="Urgence" danger onPress={onSos} />
            </View>
            {canCancel && (
              <Button
                label="Annuler la livraison"
                variant="destructive"
                onPress={() => setCancelOpen(true)}
              />
            )}
          </SheetCard>
        </ScrollView>
      </Animated.View>

      {/* Confirmation d'annulation — gratuite avant la collecte. */}
      {cancelOpen && (
        <BottomSheet onClose={() => setCancelOpen(false)}>
          {(close) => (
            <View style={styles.cancelSheet}>
              <View style={styles.cancelBadge}>
                <Icon name="package" size={28} weight="bold" color={Colors.error} />
              </View>
              <Text variant="heading1" align="center">Annuler la livraison ?</Text>
              <Text variant="body" color={Colors.textSecondary} align="center" style={styles.cancelText}>
                Votre prestataire est en route vers le point de collecte. L'annulation est gratuite tant que le colis n'a pas été collecté.
              </Text>
              <Button label="Garder ma livraison" onPress={close} style={styles.cancelBtn} />
              <Button
                label="Annuler la livraison"
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

  snapSheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
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

  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  // Colis.
  colisRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  colisThumb: {
    width: 44, height: 44, borderRadius: Radii.md,
    backgroundColor: Colors.primarySubtle,
    alignItems: 'center', justifyContent: 'center',
  },
  trackingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trackingNum: {
    fontFamily: Poppins.semibold, fontSize: 13, color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  codeWrap: {
    gap: 10,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.lg,
    borderWidth: 1, borderColor: Colors.borderSubtle,
    padding: 14,
  },

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

  cancelSheet: { alignItems: 'center', gap: 10, paddingTop: 4, paddingBottom: 8 },
  cancelBadge: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.errorSubtle,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  cancelText: { maxWidth: 320, marginBottom: 6 },
  cancelBtn: { alignSelf: 'stretch' },

  sosSheet: { alignItems: 'center', gap: 14, paddingTop: 4, paddingBottom: 8 },
  sosBadge: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.errorSubtle,
    alignItems: 'center', justifyContent: 'center',
  },
  sosText: { maxWidth: 300 },
  sosCta: { alignSelf: 'stretch', marginTop: 4 },
});
