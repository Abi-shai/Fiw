import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, StyleSheet, Animated, TouchableOpacity, Image,
  LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import LeafletMap, { LeafletMapHandle } from '@/components/LeafletMap';
import Text from '@/components/Text';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import IconButton from '@/components/IconButton';
import {
  GroupedSheet, SheetCard, ProgressBar, AvatarStack, AltSuggestCard,
  VehicleGroup, TotalBar,
} from '@/components/RideSheet';
import { Colors, Poppins, Radii, Shadows } from '@/constants/tokens';
import { DAKAR_CENTER, FRAIS_RAPPROCHEMENT, DRIVER, MOTO_DRIVER, complementaryGamme } from '@/constants/data';
import { gammeIllustration, type IlluKey } from '@/constants/illustrations';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Motion : lissage de la hauteur de la feuille quand son contenu change d'état
// (standard mobile — la feuille « respire » au lieu d'un saut sec).
const SHEET_LAYOUT = {
  duration: 280,
  update: { type: LayoutAnimation.Types.easeInEaseOut },
  create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
  delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
};

// Durées de simulation (proto) — réglables pour mieux jauger l'attente.
const SEARCH_DURATION = 11000; // recherche avant de résoudre l'issue
const REVEAL_DURATION = 2600;  // carte « Prestataire trouvé » avant la course active

// Trois issues de la mise en relation (cf. CONTEXT.md) : prestataire proche
// (chemin heureux, sans frais) · un peu loin (frais de rapprochement à accepter)
// · aucun prestataire dans le périmètre (cul-de-sac).
type Outcome = 'near' | 'far' | 'none';
// Phases d'écran : recherche → (frais | aucun) → révélation → course.
type Phase = 'searching' | 'frais' | 'reveal' | 'none';

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/[\s  ]/g, '.');

// Pile d'avatars (preuve sociale) — initiales tintées, façon maquette 118-328.
const NEARBY = [
  { label: 'A', bg: '#e7ecff', fg: Colors.primaryPressed },
  { label: 'C', bg: Colors.warningSubtle, fg: '#b45309' },
  { label: 'F', bg: Colors.successSubtle, fg: '#047857' },
];

// Radar : anneaux concentriques qui s'étendent en boucle depuis le départ.
function Radar() {
  const rings = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  useEffect(() => {
    const anims = rings.map((v, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 900),
        Animated.timing(v, { toValue: 1, duration: 2700, useNativeDriver: true }),
      ])),
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, []);
  return (
    <View style={styles.radarWrap} pointerEvents="none">
      {rings.map((v, i) => (
        <Animated.View
          key={i}
          style={[styles.ring, {
            opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.32, 0] }),
            transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.3, 3.4] }) }],
          }]}
        />
      ))}
    </View>
  );
}

export default function SearchingScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    departureName?: string; destName: string; destDetail?: string;
    gammePrice: string; gammeId: string; gammeLabel: string;
    gammeIllu: string; paymentId: string; destLat: string; destLng: string;
  }>();

  const base = parseInt(params.gammePrice || '0', 10);
  const frais = FRAIS_RAPPROCHEMENT;

  const [phase, setPhaseState] = useState<Phase>('searching');
  // Toute transition de phase anime la hauteur de la feuille (motion mobile).
  const setPhase = (p: Phase) => { LayoutAnimation.configureNext(SHEET_LAYOUT); setPhaseState(p); };
  // Issue présentée — pilotée par l'interrupteur de démo (facilitateur), invisible
  // en production. Défaut « far » (frais de rapprochement).
  const [outcome, setOutcome] = useState<Outcome>('far');
  const outcomeRef = useRef<Outcome>('far');
  outcomeRef.current = outcome;
  const [elapsed, setElapsed] = useState(0);
  const [sheetH, setSheetH] = useState(0); // hauteur mesurée de la feuille (pour le retour flottant)
  const [runId, setRunId] = useState(0);   // relance de recherche (« Réessayer »)

  // Reframe frais de rapprochement : quand les prestataires libres sont tous un
  // peu loin (« far »), le Client paie +frais pour en rapprocher un — accepté via
  // « Continuer », jamais imposé. Plus de choix binaire Option A/B.
  const isFar = outcome === 'far';
  const selectedOption = isFar ? 'B' : 'A'; // 'B' → cloture affiche la ligne frais
  const finalPrice = isFar ? base + frais : base;

  const illu = (params.gammeIllu || 'auto') as IlluKey;
  const driver = params.gammeId === 'moto' ? MOTO_DRIVER : DRIVER;
  // Gamme complémentaire suggérée à l'état « Aucun prestataire ».
  const alt = complementaryGamme(params.gammeId || 'simple');

  const revealEta = isFar ? '4 min' : '3 min';

  // Statut de recherche qui évolue — donne du sens à l'attente.
  const statusLine = elapsed < 4
    ? 'On repère les prestataires autour de vous.'
    : elapsed < 8
      ? 'Votre demande part vers les plus proches.'
      : 'En attente d’une confirmation…';

  // Prestataires aux alentours, illustrés selon le moyen de transport choisi.
  const mapRef = useRef<LeafletMapHandle>(null);
  const providers = useMemo(() => {
    const o = DAKAR_CENTER;
    return [
      [0.0065, -0.0042], [-0.0048, 0.0060], [0.0030, 0.0072],
      [-0.0070, -0.0030], [0.0052, 0.0020], [-0.0024, -0.0066],
    ].map(([dlat, dlng]) => ({ lat: o.lat + dlat, lng: o.lng + dlng }));
  }, []);
  const providerIcon = useMemo(
    () => Image.resolveAssetSource(gammeIllustration(illu)).uri,
    [illu],
  );

  const scrimFade = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(700)).current;
  const didEnter = useRef(false);
  const contentAnim = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scrimFade, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, []);

  // Entrée de la feuille : glissement façon bottom-sheet natif.
  useEffect(() => {
    if (sheetH > 0 && !didEnter.current) {
      didEnter.current = true;
      Animated.spring(sheetY, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }).start();
    }
  }, [sheetH]);

  // Fondu + relèvement du contenu à chaque changement de phase.
  useEffect(() => {
    contentAnim.setValue(0);
    Animated.timing(contentAnim, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [phase]);

  const resolve = (o: Outcome) => {
    if (o === 'none') setPhase('none');
    else if (o === 'near') { Haptics.selectionAsync(); setPhase('reveal'); }
    else setPhase('frais');
  };

  useEffect(() => {
    if (phase !== 'searching') return;
    setElapsed(0);
    progress.setValue(0);
    const anim = Animated.timing(progress, {
      toValue: 0.92, duration: SEARCH_DURATION, useNativeDriver: false,
    });
    anim.start();
    const tick = setInterval(() => setElapsed((e) => e + 1), 1000);
    const timer = setTimeout(() => resolve(outcomeRef.current), SEARCH_DURATION);
    return () => { clearInterval(tick); clearTimeout(timer); anim.stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, runId]);

  useEffect(() => {
    if (phase !== 'reveal') return;
    Animated.timing(scrimFade, { toValue: 0, duration: 600, useNativeDriver: true }).start();
    Animated.timing(progress, { toValue: 1, duration: 350, useNativeDriver: false }).start();
    mapRef.current?.recenter(DAKAR_CENTER, 15);
    const t = setTimeout(() => {
      router.replace({
        pathname: '/transport/course-active',
        params: { ...params, selectedOption, finalPrice: String(finalPrice) },
      });
    }, REVEAL_DURATION);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const proceed = () => { Haptics.selectionAsync(); setPhase('reveal'); };

  const cycleOutcome = () => {
    Haptics.selectionAsync();
    const order: Outcome[] = ['near', 'far', 'none'];
    const next = order[(order.indexOf(outcomeRef.current) + 1) % order.length];
    outcomeRef.current = next;
    setOutcome(next);
    if (phase !== 'searching') resolve(next);
  };

  const retry = () => { Haptics.selectionAsync(); setPhase('searching'); setRunId((r) => r + 1); };

  const changeGamme = () => {
    Haptics.selectionAsync();
    router.replace({
      pathname: '/transport/configure',
      params: {
        departureName: params.departureName ?? 'Ma position actuelle',
        destName: params.destName,
        destDetail: params.destDetail ?? '',
        destLat: params.destLat,
        destLng: params.destLng,
        preselectGamme: alt.id,
      },
    });
  };

  const cancel = () => router.replace('/home');

  const DEMO_LABEL: Record<Outcome, string> = { near: 'Proche', far: 'Loin', none: 'Aucun' };

  const contentStyle = {
    opacity: contentAnim,
    transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
  };

  return (
    <View style={styles.container}>
      <LeafletMap
        ref={mapRef}
        center={DAKAR_CENTER}
        zoom={14}
        markers={[{ lat: DAKAR_CENTER.lat, lng: DAKAR_CENTER.lng, type: 'origin' }]}
        mapStyle="mapbox://styles/mapbox/light-v11"
        tintWater
        declutter
        providers={providers}
        providerIcon={providerIcon}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.mapScrim, { opacity: scrimFade }]} pointerEvents="none" />

      {phase === 'searching' && (
        <View style={styles.mapCenterOverlay} pointerEvents="none">
          <Radar />
        </View>
      )}

      {phase === 'searching' && (
        <View style={[styles.banner, { top: insets.top + 8 }]} pointerEvents="none">
          <View style={styles.bannerThumb}>
            <Image source={gammeIllustration(illu)} style={styles.bannerImg} resizeMode="contain" />
          </View>
          <Text variant="label" style={styles.bannerText} numberOfLines={2}>
            Recherche en cours pour {params.gammeLabel || 'votre course'}
          </Text>
        </View>
      )}

      {phase === 'searching' && sheetH > 0 && (
        <View style={[styles.controls, { bottom: sheetH + 12 }]} pointerEvents="box-none">
          <IconButton name="back" onPress={cancel} />
        </View>
      )}

      {/* Interrupteur de démo (facilitateur) : cycle les 3 issues. */}
      {phase !== 'reveal' && sheetH > 0 && (
        <View style={[styles.demoControls, { bottom: sheetH + 12 }]} pointerEvents="box-none">
          <TouchableOpacity style={styles.demoChip} onPress={cycleOutcome} activeOpacity={0.85}>
            <Icon name="lightning" size={12} weight="bold" color={Colors.textSecondary} />
            <Text variant="caption" color={Colors.textSecondary}>Démo · {DEMO_LABEL[outcome]}</Text>
          </TouchableOpacity>
        </View>
      )}

      <GroupedSheet
        translateY={sheetY}
        contentStyle={contentStyle}
        onLayout={(e) => setSheetH(e.nativeEvent.layout.height)}
      >
        {phase === 'frais' ? (
            /* Un peu loin — frais de rapprochement à accepter (maquette 118-345). */
            <>
              <SheetCard>
                <View style={styles.head}>
                  <Text variant="heading2">Les prestataires sont un peu loin…</Text>
                  <Text variant="body" color={Colors.textSecondary}>
                    Un frais de rapprochement couvre leur trajet jusqu'à vous.
                  </Text>
                </View>
                <View style={styles.totalCard}>
                  <View style={styles.flex1}>
                    <Text variant="heading2" color={Colors.primaryPressed}>Total à payer</Text>
                    <Text variant="bodySmall" color={Colors.textSecondary} style={styles.breakdown}>
                      <Text variant="bodySmall" style={styles.breakdownStrong}>{fmt(base)} F</Text>
                      {' de course + '}
                      <Text variant="bodySmall" style={styles.breakdownStrong}>{fmt(frais)} F</Text>
                      {' de frais de rapprochement.'}
                    </Text>
                  </View>
                  <Text style={styles.totalCardAmount}>{fmt(finalPrice)} F</Text>
                </View>
              </SheetCard>

              <SheetCard style={styles.actionCard}>
                <Button label="Continuer" onPress={proceed} />
                <Button label="Annuler la commande" variant="destructive" onPress={cancel} />
              </SheetCard>
            </>
          ) : phase === 'none' ? (
            /* Aucun prestataire (maquette 118-362). */
            <>
              <SheetCard>
                <View style={styles.head}>
                  <Text variant="heading2">Aucun prestataire disponible</Text>
                  <Text variant="body" color={Colors.textSecondary}>
                    Aucun prestataire n'est libre tout près pour l'instant. C'est fréquent aux heures de pointe, mais ça se libère vite.
                  </Text>
                </View>
                <AltSuggestCard
                  illu={alt.illu}
                  title={`Prendre un ${alt.label}`}
                  subtitle={`Souvent disponible · dès ${fmt(alt.basePrice)} F`}
                  onPress={changeGamme}
                />
              </SheetCard>

              <SheetCard style={styles.actionCard}>
                <Button label="Réessayer" onPress={retry} />
                <Button label="Annuler la commande" variant="destructive" onPress={cancel} />
              </SheetCard>
            </>
          ) : phase === 'reveal' ? (
            /* Révélation « Prestataire trouvé » — carte véhicule (maquette 118-305). */
            <>
              <SheetCard>
                <Text variant="heading2">Votre prestataire arrive dans environ {revealEta}</Text>
                <VehicleGroup driver={driver} illu={illu} />
              </SheetCard>
              <TotalBar amount={finalPrice} />
            </>
          ) : (
            /* Recherche en cours (maquette 118-328). */
            <>
              <SheetCard>
                <View style={styles.head}>
                  <Text variant="heading2" numberOfLines={2}>Recherche du prestataire le plus proche…</Text>
                  <Text variant="body" color={Colors.textSecondary}>{statusLine}</Text>
                </View>
                <ProgressBar progress={progress} />
                <View style={styles.social}>
                  <AvatarStack items={NEARBY} />
                  <Text variant="label" style={styles.flex1}>
                    {providers.length} prestataires à proximité
                  </Text>
                </View>
              </SheetCard>

              <SheetCard style={styles.actionCard}>
                <Button label="Annuler la commande" variant="destructive" onPress={cancel} />
              </SheetCard>
            </>
          )}
      </GroupedSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  flex1: { flex: 1 },

  mapScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(17, 24, 39, 0.22)' },
  mapCenterOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  radarWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2, borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 102, 255, 0.06)',
  },

  banner: {
    position: 'absolute', left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    paddingVertical: 10, paddingHorizontal: 12,
    ...Shadows.float,
  },
  bannerThumb: {
    width: 48, height: 48, borderRadius: Radii.md,
    backgroundColor: Colors.track,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  bannerImg: { width: 44, height: 44 },
  bannerText: { flex: 1, fontSize: 15, lineHeight: 20 },

  controls: { position: 'absolute', left: 16 },

  head: { gap: 8 },
  actionCard: { gap: 12 },

  social: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  // Frais de rapprochement : carte « Total à payer » (primarySubtle).
  totalCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: Colors.primarySubtle,
    borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  breakdown: { marginTop: 4, lineHeight: 21 },
  breakdownStrong: { fontFamily: Poppins.semibold, color: Colors.textPrimary },
  totalCardAmount: { fontFamily: Poppins.bold, fontSize: 22, lineHeight: 29, color: Colors.primary },

  demoControls: { position: 'absolute', right: 16 },
  demoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: Radii.pill,
    paddingVertical: 8, paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.hairline,
    ...Shadows.float,
  },
});
