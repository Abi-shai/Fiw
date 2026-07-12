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
  VehicleGroup, TotalBar, InfoBanner,
} from '@/components/RideSheet';
import LivraisonModeChoice, { type LivraisonMode } from '@/components/LivraisonModeChoice';
import { Colors, Poppins, Radii, Shadows } from '@/constants/tokens';
import {
  DAKAR_CENTER, FRAIS_RAPPROCHEMENT, VELO_LIVREUR, MOTO_LIVREUR,
  complementaryLivraisonGamme, GROUPEE_ECONOMIE, GROUPAGE_MIN_COMMANDES,
  GROUPAGE_DELAI_MAX_MIN,
} from '@/constants/data';
import { gammeIllustration } from '@/constants/illustrations';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Hub de mise en relation Livraison — 4 issues : near / far (frais de
// rapprochement) / groupage (détection automatique, Product Doc B) / none.
// Le groupage est une PROPOSITION de l'algorithme quand d'autres Commandes
// existent dans le même cluster : Option A (normale, départ immédiat) vs
// Option B (groupée, prix réduit, départ dès 2 commandes confirmées) ; si le
// seuil n'est pas atteint dans le délai → livraison simple au prix normal.
const SHEET_LAYOUT = {
  duration: 280,
  update: { type: LayoutAnimation.Types.easeInEaseOut },
  create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
  delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
};

const SEARCH_DURATION = 11000;
const REVEAL_DURATION = 2600;
// Attente simulée du 2e colis (règle réelle : GROUPAGE_DELAI_MAX_MIN).
const GROUPAGE_WAIT_SIM = 6500;

type Outcome = 'near' | 'far' | 'groupage' | 'none';
type Phase = 'searching' | 'frais' | 'groupage' | 'groupage_wait' | 'reveal' | 'none';

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/[\s  ]/g, '.');

const NEARBY = [
  { label: 'M', bg: '#e7ecff', fg: Colors.primaryPressed },
  { label: 'S', bg: Colors.warningSubtle, fg: '#b45309' },
  { label: 'K', bg: Colors.successSubtle, fg: '#047857' },
];

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

export default function LivraisonSearchingScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    departureName?: string; destName: string; destDetail?: string;
    destLat: string; destLng: string;
    colisType: string; colisTaille: string; colisDesc: string;
    destinataireName: string; destinatairePhone: string;
    gammeId: string; gammeLabel: string; gammePrice: string;
    paymentId: string; tracking: string; codeRemise: string;
  }>();

  const base = parseInt(params.gammePrice || '0', 10);
  const frais = FRAIS_RAPPROCHEMENT;

  const [phase, setPhaseState] = useState<Phase>('searching');
  const setPhase = (p: Phase) => { LayoutAnimation.configureNext(SHEET_LAYOUT); setPhaseState(p); };
  // Issue par défaut : groupage — LA mécanique distinctive de la Livraison.
  const [outcome, setOutcome] = useState<Outcome>('groupage');
  const outcomeRef = useRef<Outcome>('groupage');
  outcomeRef.current = outcome;
  const [elapsed, setElapsed] = useState(0);
  const [sheetH, setSheetH] = useState(0);
  const [runId, setRunId] = useState(0);
  // Proposition groupage : choix du client (A par défaut, jamais biaisé) puis
  // dénouement de l'attente du seuil (2e commande confirmée ou non).
  const [modeChoice, setModeChoice] = useState<LivraisonMode>('express');
  const [groupResult, setGroupResult] = useState<'success' | 'fail' | null>(null);

  const isFar = outcome === 'far';
  const selectedOption = isFar ? 'B' : 'A';
  const groupee = groupResult === 'success';
  const finalPrice = (isFar ? base + frais : base) - (groupee ? GROUPEE_ECONOMIE : 0);

  const driver = params.gammeId === 'velo' ? VELO_LIVREUR : MOTO_LIVREUR;
  const alt = complementaryLivraisonGamme(params.gammeId || 'velo');

  const revealEta = isFar ? '5 min' : '4 min';

  const statusLine = elapsed < 4
    ? 'On repère les prestataires autour du point de collecte.'
    : elapsed < 8
      ? 'Votre demande part vers les plus proches.'
      : 'En attente d’une confirmation…';

  const mapRef = useRef<LeafletMapHandle>(null);
  const providers = useMemo(() => {
    const o = DAKAR_CENTER;
    return [
      [0.0065, -0.0042], [-0.0048, 0.0060], [0.0030, 0.0072],
      [-0.0070, -0.0030], [0.0052, 0.0020], [-0.0024, -0.0066],
    ].map(([dlat, dlng]) => ({ lat: o.lat + dlat, lng: o.lng + dlng }));
  }, []);
  // Tous les prestataires Livraison sont rendus avec le scooter (le vélo n'a pas
  // encore d'illustration isométrique).
  const providerIcon = useMemo(
    () => Image.resolveAssetSource(gammeIllustration('livraison')).uri,
    [],
  );

  // Rendu véhicule : scooter illustré ; vélo en icône sur fond neutre.
  const vehicleArt = params.gammeId === 'velo'
    ? <Icon name="bicycle" size={34} weight="fill" color={Colors.gray600} />
    : undefined;

  const scrimFade = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(700)).current;
  const didEnter = useRef(false);
  const contentAnim = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scrimFade, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (sheetH > 0 && !didEnter.current) {
      didEnter.current = true;
      Animated.spring(sheetY, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }).start();
    }
  }, [sheetH]);

  useEffect(() => {
    contentAnim.setValue(0);
    Animated.timing(contentAnim, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [phase]);

  const resolve = (o: Outcome) => {
    setGroupResult(null);
    if (o === 'none') setPhase('none');
    else if (o === 'near') { Haptics.selectionAsync(); setPhase('reveal'); }
    else if (o === 'groupage') { Haptics.selectionAsync(); setPhase('groupage'); }
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
        pathname: '/livraison/suivi',
        params: {
          ...params,
          selectedOption,
          finalPrice: String(finalPrice),
          mode: groupee ? 'groupee' : 'express',
        },
      });
    }, REVEAL_DURATION);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Attente du 2e colis (Option B choisie) : seuil atteint dans le délai →
  // groupage confirmé ; l'interrupteur de démo permet de forcer l'échec.
  const groupProgress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (phase !== 'groupage_wait') return;
    groupProgress.setValue(0);
    const anim = Animated.timing(groupProgress, {
      toValue: 1, duration: GROUPAGE_WAIT_SIM, useNativeDriver: false,
    });
    anim.start();
    const t = setTimeout(() => {
      Haptics.selectionAsync();
      setGroupResult('success');
      setPhase('reveal');
    }, GROUPAGE_WAIT_SIM);
    return () => { clearTimeout(t); anim.stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const proceed = () => { Haptics.selectionAsync(); setPhase('reveal'); };

  const proceedGroupage = () => {
    Haptics.selectionAsync();
    if (modeChoice === 'groupee') setPhase('groupage_wait');
    else setPhase('reveal');
  };

  // Démo : force « seuil non atteint » → départ en livraison simple, prix normal.
  const forceGroupFail = () => {
    Haptics.selectionAsync();
    setGroupResult('fail');
    setPhase('reveal');
  };

  const cycleOutcome = () => {
    Haptics.selectionAsync();
    const order: Outcome[] = ['near', 'far', 'groupage', 'none'];
    const next = order[(order.indexOf(outcomeRef.current) + 1) % order.length];
    outcomeRef.current = next;
    setOutcome(next);
    if (phase !== 'searching') resolve(next);
  };

  const retry = () => {
    Haptics.selectionAsync();
    setGroupResult(null);
    setPhase('searching');
    setRunId((r) => r + 1);
  };

  const changeGamme = () => {
    Haptics.selectionAsync();
    router.replace({
      pathname: '/livraison/options',
      params: { ...params, preselectGamme: alt.id },
    });
  };

  const cancel = () => router.replace('/home');

  const DEMO_LABEL: Record<Outcome, string> = { near: 'Proche', far: 'Loin', groupage: 'Groupage', none: 'Aucun' };

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
            <Image source={gammeIllustration('livraison')} style={styles.bannerImg} resizeMode="contain" />
          </View>
          <Text variant="label" style={styles.bannerText} numberOfLines={2}>
            Recherche en cours pour votre livraison {params.gammeLabel || ''}
          </Text>
        </View>
      )}

      {phase === 'searching' && sheetH > 0 && (
        <View style={[styles.controls, { bottom: sheetH + 12 }]} pointerEvents="box-none">
          <IconButton name="back" onPress={cancel} />
        </View>
      )}

      {/* Interrupteur de démo (facilitateur) : cycle les 4 issues ; pendant
          l'attente du groupage, force « seuil non atteint ». */}
      {phase !== 'reveal' && sheetH > 0 && (
        <View style={[styles.demoControls, { bottom: sheetH + 12 }]} pointerEvents="box-none">
          {phase === 'groupage_wait' ? (
            <TouchableOpacity style={styles.demoChip} onPress={forceGroupFail} activeOpacity={0.85}>
              <Icon name="lightning" size={12} weight="bold" color={Colors.textSecondary} />
              <Text variant="caption" color={Colors.textSecondary}>Démo · Seuil non atteint</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.demoChip} onPress={cycleOutcome} activeOpacity={0.85}>
              <Icon name="lightning" size={12} weight="bold" color={Colors.textSecondary} />
              <Text variant="caption" color={Colors.textSecondary}>Démo · {DEMO_LABEL[outcome]}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <GroupedSheet
        translateY={sheetY}
        contentStyle={contentStyle}
        onLayout={(e) => setSheetH(e.nativeEvent.layout.height)}
      >
        {phase === 'frais' ? (
            <>
              <SheetCard>
                <View style={styles.head}>
                  <Text variant="heading2">Les prestataires sont un peu loin…</Text>
                  <Text variant="body" color={Colors.textSecondary}>
                    Un frais de rapprochement couvre leur trajet jusqu'au point de collecte.
                  </Text>
                </View>
                <View style={styles.totalCard}>
                  <View style={styles.flex1}>
                    <Text variant="heading2" color={Colors.primaryPressed}>Total à payer</Text>
                    <Text variant="bodySmall" color={Colors.textSecondary} style={styles.breakdown}>
                      <Text variant="bodySmall" style={styles.breakdownStrong}>{fmt(base)} F</Text>
                      {' de livraison + '}
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
          ) : phase === 'groupage' ? (
            /* Groupage détecté (Product Doc B) — proposition Option A / B. */
            <>
              <SheetCard>
                <View style={styles.head}>
                  <Text variant="heading2">Un colis voisin part bientôt</Text>
                  <Text variant="body" color={Colors.textSecondary}>
                    Partagez le trajet pour payer moins, ou partez tout de suite.
                  </Text>
                </View>
                <LivraisonModeChoice
                  base={base}
                  value={modeChoice}
                  onChange={(m) => { Haptics.selectionAsync(); setModeChoice(m); }}
                />
              </SheetCard>

              <SheetCard style={styles.actionCard}>
                <Button label="Continuer" onPress={proceedGroupage} />
                <Button label="Annuler la commande" variant="destructive" onPress={cancel} />
              </SheetCard>
            </>
          ) : phase === 'groupage_wait' ? (
            /* Option B choisie — attente du seuil (Product Doc C). */
            <>
              <SheetCard>
                <View style={styles.head}>
                  <Text variant="heading2">On attend votre colis voisin…</Text>
                  <Text variant="body" color={Colors.textSecondary}>
                    Départ dès qu'il confirme — {GROUPAGE_DELAI_MAX_MIN} min max. Sinon, le vôtre part seul au prix normal.
                  </Text>
                </View>
                <ProgressBar progress={groupProgress} />
                <View style={styles.social}>
                  <AvatarStack items={[NEARBY[0]]} />
                  <Text variant="label" style={styles.flex1}>
                    1/{GROUPAGE_MIN_COMMANDES} colis confirmé
                  </Text>
                </View>
              </SheetCard>

              <SheetCard style={styles.actionCard}>
                <Button label="Annuler la commande" variant="destructive" onPress={cancel} />
              </SheetCard>
            </>
          ) : phase === 'none' ? (
            <>
              <SheetCard>
                <View style={styles.head}>
                  <Text variant="heading2">Aucun prestataire disponible</Text>
                  <Text variant="body" color={Colors.textSecondary}>
                    Aucun prestataire n'est libre tout près pour l'instant. C'est fréquent aux heures de pointe, mais ça se libère vite.
                  </Text>
                </View>
                <AltSuggestCard
                  illu="livraison"
                  title={`Passer en ${alt.label}`}
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
            <>
              <SheetCard>
                {groupResult === 'success' && (
                  <InfoBanner icon="group">
                    Colis voisin confirmé — vous économisez {fmt(GROUPEE_ECONOMIE)} F.
                  </InfoBanner>
                )}
                {groupResult === 'fail' && (
                  <InfoBanner icon="info" tone="warn">
                    Pas de colis voisin — le vôtre part seul, au prix normal.
                  </InfoBanner>
                )}
                <Text variant="heading2">Votre prestataire arrive dans environ {revealEta}</Text>
                <VehicleGroup driver={driver} illu="livraison" art={vehicleArt} />
              </SheetCard>
              <TotalBar amount={finalPrice} />
            </>
          ) : (
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
