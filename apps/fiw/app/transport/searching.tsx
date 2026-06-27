import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, StyleSheet, Animated, TouchableOpacity, Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import LeafletMap, { LeafletMapHandle } from '@/components/LeafletMap';
import Text from '@/components/Text';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import IconButton from '@/components/IconButton';
import RapprochementChoice, { type OptId } from '@/components/RapprochementChoice';
import { Handle, sheetSurface } from '@/components/Sheet';
import { Colors, Poppins, Radii } from '@/constants/tokens';
import { DAKAR_CENTER, FRAIS_RAPPROCHEMENT, PAYMENT_METHODS } from '@/constants/data';
import { gammeIllustration, type IlluKey } from '@/constants/illustrations';

// Durées de simulation (proto) — réglables pour mieux jauger l'attente.
const SEARCH_DURATION = 11000; // recherche d'un prestataire avant de proposer le choix
const MATCH_DURATION = 4200;   // mise en relation (prestataire trouvé → course active)

// Phases : on cherche un prestataire → s'il n'y en a pas tout près, on propose
// le choix frais de rapprochement → mise en relation → course active.
type Phase = 'searching' | 'choice' | 'matching';

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/[\s  ]/g, '.');
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

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
    destName: string; gammePrice: string; gammeId: string; gammeLabel: string;
    gammeIllu: string; paymentId: string; destLat: string; destLng: string;
  }>();

  const base = parseInt(params.gammePrice || '0', 10);
  const frais = FRAIS_RAPPROCHEMENT;

  const [phase, setPhase] = useState<Phase>('searching');
  const [option, setOption] = useState<OptId>('A');
  const [elapsed, setElapsed] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [sheetH, setSheetH] = useState(0); // hauteur mesurée de la feuille (pour le retour flottant)
  const finalPrice = option === 'B' ? base + frais : base;

  const illu = (params.gammeIllu || 'auto') as IlluKey;
  const payment = PAYMENT_METHODS.find(p => p.id === params.paymentId);

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

  // Overlay de chargement : fondu d'entrée, reste tant que l'écran est monté.
  const scrimFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scrimFade, { toValue: 1, duration: 450, useNativeDriver: true }).start();
    const tick = setInterval(() => setElapsed(e => e + 1), 1000);
    // Proto : on simule l'absence de prestataire tout près → on présente le choix.
    const timer = setTimeout(() => setPhase('choice'), SEARCH_DURATION);
    return () => { clearInterval(tick); clearTimeout(timer); };
  }, []);

  // Choix validé → mise en relation puis course active.
  const proceed = () => {
    Haptics.selectionAsync();
    setPhase('matching');
    setTimeout(() => {
      router.replace({
        pathname: '/transport/course-active',
        params: { ...params, selectedOption: option, finalPrice: String(finalPrice) },
      });
    }, MATCH_DURATION);
  };

  const cancel = () => router.replace('/home');

  const searchingLike = phase === 'searching' || phase === 'matching';

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

      {/* Overlay de chargement sur la carte : assombrit la carte tant que la
          course n'est pas validée → on comprend que l'écran est concentré sur
          le chargement. Reste affiché pendant toute la liaison. */}
      <Animated.View style={[styles.mapScrim, { opacity: scrimFade }]} pointerEvents="none" />

      {/* Radar centré sur le départ — pulse en continu jusqu'à validation. */}
      <View style={styles.mapCenterOverlay} pointerEvents="none">
        <Radar />
      </View>

      {/* Bannière haute : véhicule recherché + classe */}
      {searchingLike && (
        <View style={[styles.banner, { top: insets.top + 8 }]} pointerEvents="none">
          <View style={styles.bannerThumb}>
            <Image source={gammeIllustration(illu)} style={styles.bannerImg} resizeMode="contain" />
          </View>
          <Text variant="label" style={styles.bannerText} numberOfLines={2}>
            Recherche en cours pour {params.gammeLabel || 'votre course'}
          </Text>
        </View>
      )}

      {/* Retour flottant juste au-dessus de la feuille (comme les autres écrans) */}
      {phase === 'searching' && sheetH > 0 && (
        <View style={[styles.controls, { bottom: sheetH + 12 }]} pointerEvents="box-none">
          <IconButton name="back" onPress={cancel} />
        </View>
      )}

      <View
        style={[sheetSurface, styles.sheet, { paddingBottom: insets.bottom + 20 }]}
        onLayout={(e) => setSheetH(e.nativeEvent.layout.height)}
      >
        <View style={styles.handleArea}>
          <Handle />
        </View>

          {phase === 'choice' ? (
            <>
              <Text variant="heading2">Pas de prestataire tout près</Text>
              <Text variant="bodySmall" color={Colors.textSecondary} style={styles.choiceSub}>
                Choisissez comment être pris en charge :
              </Text>

              <RapprochementChoice base={base} frais={frais} value={option} onChange={setOption} />

              <Button label="Continuer" onPress={proceed} style={styles.cta} />
              <TouchableOpacity style={styles.cancelBtn} onPress={cancel} activeOpacity={0.7}>
                <Text variant="label" color={Colors.error}>Annuler</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* En-tête : statut + chrono */}
              <View style={styles.headRow}>
                <View style={styles.flex1}>
                  <Text variant="heading2" numberOfLines={1}>
                    {phase === 'matching' ? 'Mise en relation…' : 'Plusieurs prestataires à proximité'}
                  </Text>
                  <Text variant="caption" color={Colors.textSecondary}>
                    {phase === 'matching'
                      ? 'Un prestataire a accepté votre course'
                      : 'Recherche d’un véhicule disponible'}
                  </Text>
                </View>
                <Text variant="body" style={styles.timer}>{mmss(elapsed)}</Text>
              </View>

              {phase === 'searching' && (
                <>
                  {/* Actions : annuler + détails (façon Yango) */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionBtn} onPress={cancel} activeOpacity={0.85}>
                      <Icon name="close" size={20} weight="bold" color={Colors.textPrimary} />
                      <Text variant="label" style={styles.actionText}>Annuler la commande</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtnSm}
                      onPress={() => setShowDetails(v => !v)}
                      activeOpacity={0.85}
                    >
                      <Icon name="info" size={20} weight="bold" color={Colors.textPrimary} />
                      <Text variant="label" style={styles.actionText}>Détails</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Détails repliables : trajet, classe, prix, paiement */}
                  {showDetails && (
                    <View style={styles.details}>
                      <DetailRow icon="flag" label="Destination" value={params.destName} />
                      <DetailRow icon="car" label="Classe" value={params.gammeLabel} />
                      <DetailRow
                        icon="coins"
                        label="Prix"
                        value={payment ? `${fmt(base)} FCFA · ${payment.label}` : `${fmt(base)} FCFA`}
                      />
                    </View>
                  )}
                </>
              )}
            </>
          )}
      </View>
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: any; label: string; value?: string }) {
  return (
    <View style={styles.detailRow}>
      <Icon name={icon} size={18} color={Colors.textSecondary} />
      <Text variant="caption" color={Colors.textSecondary} style={styles.detailLabel}>{label}</Text>
      <Text variant="label" style={styles.detailValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  flex1: { flex: 1 },

  // Overlay de chargement (assombrit la carte pendant la liaison).
  mapScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(17, 24, 39, 0.22)' },
  // Radar, centré sur le centre de la carte (= départ).
  mapCenterOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  radarWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 102, 255, 0.06)',
  },

  // Bannière haute « Recherche en cours pour … »
  banner: {
    position: 'absolute', left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    paddingVertical: 10, paddingHorizontal: 12,
    ...{ shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  },
  bannerThumb: {
    width: 48, height: 48, borderRadius: Radii.md,
    backgroundColor: '#F2F3F5',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  bannerImg: { width: 44, height: 44 },
  bannerText: { flex: 1, fontSize: 15, lineHeight: 20 },

  // Contrôles flottants (retour) juste au-dessus de la feuille, comme configure.
  controls: { position: 'absolute', left: 16 },

  sheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  handleArea: { paddingTop: 6, paddingBottom: 16, alignItems: 'center' },

  headRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  timer: { fontFamily: Poppins.semibold, fontVariant: ['tabular-nums'] },

  // Actions (boutons pilule gris, façon Yango)
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#F2F3F5',
    borderRadius: Radii.md,
    paddingVertical: 14, paddingHorizontal: 12,
  },
  actionBtnSm: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#F2F3F5',
    borderRadius: Radii.md,
    paddingVertical: 14, paddingHorizontal: 18,
  },
  actionText: { fontSize: 14 },

  // Détails repliables
  details: {
    marginTop: 14,
    backgroundColor: '#FBFBFC',
    borderRadius: Radii.lg,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  detailLabel: { width: 86 },
  detailValue: { flex: 1, textAlign: 'right' },

  // Phase choix frais de rapprochement
  choiceSub: { marginTop: 4, marginBottom: 16 },
  cta: { marginTop: 8 },
  cancelBtn: { alignItems: 'center', paddingVertical: 14 },
});
