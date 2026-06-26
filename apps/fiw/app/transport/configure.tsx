import React, { useRef, useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Pressable, FlatList, ScrollView, Animated, Dimensions, Image, PanResponder,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import LeafletMap from '@/components/LeafletMap';
import { Handle, sheetSurface } from '@/components/Sheet';
import IconButton from '@/components/IconButton';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import Button from '@/components/Button';
import Scrim from '@/components/Scrim';
import { Colors, Radii, Poppins } from '@/constants/tokens';
import { GAMMES, PAYMENT_METHODS, DAKAR_CENTER } from '@/constants/data';

const SCREEN_H = Dimensions.get('window').height;
// Deux crans : « medium » par défaut (laisse voir la carte/itinéraire) et
// « étendu » pour le confort. On peut monter mais jamais descendre sous medium.
const MEDIUM_H = Math.round(SCREEN_H * 0.58);
const EXPANDED_H = Math.round(SCREEN_H * 0.9);
// Même ressort que le sheet de l'accueil : vif, légèrement sous-amorti.
const SHEET_SPRING = { stiffness: 280, damping: 26, mass: 1 };
const RUBBER = 0.4;          // résistance hors bornes (rubber-band)
const FLICK_V = 0.5;         // px/ms : au-delà, le flick décide du cran
const TAP_THRESHOLD = 6;     // tap sur la poignée → bascule du cran

const gammeIcon = (id: string): IconName => (id === 'moto' ? 'moto' : 'car');

// Séparateur de milliers façon FR/Sénégal (« 1.150 ») pour coller à la maquette.
const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/[\s  ]/g, '.');

// Carte gamme : plateforme colorée (bleue si choisie), badge ETA en débord,
// libellé + tarif. Les cartes non choisies sont estompées (emphase sélection).
function GammeCard({ gamme, selected, onPress }: {
  gamme: typeof GAMMES[number]; selected: boolean; onPress: () => void;
}) {
  const tag = gamme.badge;
  return (
    <TouchableOpacity
      style={[styles.gCard, selected ? styles.gCardSel : styles.gCardIdle]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={[styles.gPlatform, selected && styles.gPlatformSel]}>
        <Icon name={gammeIcon(gamme.id)} size={28} weight={selected ? 'fill' : 'bold'}
          color={selected ? Colors.surface : Colors.textSecondary} />
        {/* Badge ETA en débord, chevauchant le bas de la plateforme */}
        <View style={[styles.gEta, selected && styles.gEtaSel]}>
          <Icon name="timer" size={12} weight="bold" color={Colors.textPrimary} />
          <Text variant="caption" style={styles.gEtaText}>{gamme.eta}</Text>
        </View>
      </View>
      <View style={styles.gInfo}>
        <View style={styles.gLabelRow}>
          <Text variant="label" numberOfLines={1} style={styles.gLabel}>{gamme.label}</Text>
          {tag && (
            <View style={styles.gTag}>
              <Text variant="caption" style={styles.gTagText}>{tag}</Text>
            </View>
          )}
        </View>
        <Text variant="heading2" align="center" style={styles.gPrice}
          color={selected ? Colors.primary : Colors.textPrimary}>
          {fmt(gamme.basePrice)} FCFA
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ConfigureScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    departureName: string;
    destName: string; destDetail: string; destLat: string; destLng: string;
  }>();

  const departureName = params.departureName || 'Ma position actuelle';
  const destLat = parseFloat(params.destLat || String(DAKAR_CENTER.lat));
  const destLng = parseFloat(params.destLng || String(DAKAR_CENTER.lng));

  const [selectedGamme, setSelectedGamme] = useState('moto');
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [payOpen, setPayOpen] = useState(false);

  const gamme = GAMMES.find(g => g.id === selectedGamme)!;

  const select = (fn: () => void) => { Haptics.selectionAsync(); fn(); };

  const handleGammeSelect = (id: string) => select(() => setSelectedGamme(id));

  // Entrée par le bas (slide-in) + hauteur animée entre les deux crans.
  const ty = useRef(new Animated.Value(SCREEN_H)).current;
  const sheetH = useRef(new Animated.Value(MEDIUM_H)).current;
  const hValue = useRef(MEDIUM_H);
  const dragStartH = useRef(MEDIUM_H);

  // Voile : carte assombrie quand la feuille est en place ; suit l'entrée.
  const scrimOpacity = ty.interpolate({
    inputRange: [0, SCREEN_H],
    outputRange: [0.5, 0],
    extrapolate: 'clamp',
  });

  React.useEffect(() => {
    const id = sheetH.addListener(({ value }) => { hValue.current = value; });
    Animated.spring(ty, { toValue: 0, ...SHEET_SPRING, useNativeDriver: false }).start();
    return () => sheetH.removeListener(id);
  }, []);

  const snapH = (to: number, vy = 0) =>
    Animated.spring(sheetH, {
      toValue: to, velocity: vy, ...SHEET_SPRING,
      restDisplacementThreshold: 0.3, restSpeedThreshold: 0.3, useNativeDriver: false,
    }).start();

  // Poignée déplaçable : monte vers « étendu », redescend vers « medium » — mais
  // jamais sous medium (rubber-band qui re-snappe). Tap = bascule du cran.
  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
    onPanResponderGrant: () => { dragStartH.current = hValue.current; },
    onPanResponderMove: (_, g) => {
      let next = dragStartH.current - g.dy; // glisser vers le haut → agrandir
      if (next > EXPANDED_H) next = EXPANDED_H + (next - EXPANDED_H) * RUBBER;
      else if (next < MEDIUM_H) next = MEDIUM_H - (MEDIUM_H - next) * RUBBER;
      sheetH.setValue(next);
    },
    onPanResponderRelease: (_, g) => {
      const pos = hValue.current;
      const mid = (MEDIUM_H + EXPANDED_H) / 2;
      if (Math.abs(g.dy) < TAP_THRESHOLD && Math.abs(g.dx) < TAP_THRESHOLD) {
        snapH(pos > mid ? MEDIUM_H : EXPANDED_H);
        return;
      }
      let target: number;
      if (g.vy < -FLICK_V) target = EXPANDED_H;
      else if (g.vy > FLICK_V) target = MEDIUM_H;
      else target = pos >= mid ? EXPANDED_H : MEDIUM_H;
      snapH(target, -g.vy * 1000);
    },
  })).current;

  // Éditer l'itinéraire : revient à l'étape de recherche (home en mode
  // « search », champs Départ/Arrivée préremplis et modifiables).
  const editItinerary = () => {
    Haptics.selectionAsync();
    router.dismissTo({
      pathname: '/home',
      params: {
        editTs: String(Date.now()),
        editDeparture: departureName,
        editDest: params.destName ?? '',
      },
    });
  };

  const confirm = () => {
    Haptics.selectionAsync();
    router.push({
      pathname: '/transport/searching',
      params: {
        ...params,
        gammeId: selectedGamme,
        gammeLabel: gamme.badge ? `${gamme.label} ${gamme.badge}` : gamme.label,
        gammePrice: gamme.basePrice,
        paymentId: selectedPayment,
      },
    });
  };

  return (
    <View style={styles.container}>
      <LeafletMap
        center={{ lat: (DAKAR_CENTER.lat + destLat) / 2, lng: (DAKAR_CENTER.lng + destLng) / 2 }}
        zoom={13}
        markers={[
          { lat: DAKAR_CENTER.lat, lng: DAKAR_CENTER.lng, type: 'origin' },
          { lat: destLat, lng: destLng, type: 'destination' },
        ]}
        route={{ from: DAKAR_CENTER, to: { lat: destLat, lng: destLng } }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Voile : assombrit la carte pour concentrer sur la feuille (full) */}
      <Scrim opacity={scrimOpacity} />

      {/* Flèche Retour flottante sur la carte (en plus du close du sheet) */}
      <View style={[styles.topRow, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <IconButton name="back" onPress={() => router.back()} />
      </View>

      <Animated.View
        style={[
          sheetSurface, styles.sheet,
          { height: sheetH, paddingBottom: insets.bottom + 16, transform: [{ translateY: ty }] },
        ]}
      >
        {/* Zone déplaçable : poignée + en-tête (glisser pour étendre / replier) */}
        <View {...pan.panHandlers}>
          <View style={styles.handleArea}>
            <Handle />
          </View>

          {/* Header : titre + close, comme l'étape recherche */}
          <View style={styles.header}>
            <Text variant="heading1" style={styles.headerTitle}>Votre course</Text>
            <IconButton name="close" variant="flat" color={Colors.textPrimary} onPress={() => router.back()} />
          </View>
        </View>

        {/* Contenu défilant — pas de compression : si ça dépasse, on scrolle */}
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
        {/* Itinéraire de bout en bout — toute la carte édite l'itinéraire */}
        <TouchableOpacity style={styles.routeCard} onPress={editItinerary} activeOpacity={0.85}>
          <View style={styles.routeRail}>
            <Icon name="walk" size={24} weight="bold" color={Colors.textPrimary} />
            <View style={styles.routeLine} />
            <Icon name="flag" size={24} weight="bold" color={Colors.textPrimary} />
          </View>
          <View style={styles.routeCol}>
            <View>
              <Text variant="caption" color={Colors.textSecondary}>Départ</Text>
              <Text variant="label" numberOfLines={1}>{departureName}</Text>
            </View>
            <View>
              <Text variant="caption" color={Colors.textSecondary}>Arrivée</Text>
              <Text variant="label" numberOfLines={1}>{params.destName}</Text>
              {!!params.destDetail && (
                <Text variant="caption" color={Colors.textSecondary} numberOfLines={1}>{params.destDetail}</Text>
              )}
            </View>
          </View>
          {/* Affordance « modifier » (toute la carte est cliquable) */}
          <View style={styles.routeEdit}>
            <Icon name="edit" size={18} color={Colors.textSecondary} />
          </View>
        </TouchableOpacity>

        {/* Choix du moyen de transport */}
        <Text variant="caption" color={Colors.textSecondary} style={styles.sectionLabel}>Moyen de transport</Text>
        <FlatList
          data={GAMMES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={g => g.id}
          contentContainerStyle={styles.gList}
          renderItem={({ item }) => (
            <GammeCard gamme={item} selected={selectedGamme === item.id} onPress={() => handleGammeSelect(item.id)} />
          )}
        />

        </ScrollView>

        {/* Zone d'action épinglée : moyen de paiement + confirmation */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.payBtn} onPress={() => setPayOpen(true)} activeOpacity={0.85}>
            <Image source={require('@/assets/argent.png')} style={styles.payImg} />
          </TouchableOpacity>
          <Button label="Confirmer la course" onPress={confirm} style={styles.cta} />
        </View>
      </Animated.View>

      {/* Sélecteur de moyen de paiement (mini-feuille) */}
      {payOpen && (
        <View style={styles.payOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPayOpen(false)} />
          <View style={[styles.paySheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.paySheetHandle}><Handle /></View>
            <Text variant="heading2" style={styles.paySheetTitle}>Moyen de paiement</Text>
            {PAYMENT_METHODS.map((m) => {
              const sel = selectedPayment === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={styles.payRow}
                  onPress={() => { select(() => setSelectedPayment(m.id)); setPayOpen(false); }}
                  activeOpacity={0.85}
                >
                  <View style={[styles.payDot, { backgroundColor: m.color }]} />
                  <Text variant="label" style={styles.payRowLabel}
                    color={sel ? Colors.primary : Colors.textPrimary}>{m.label}</Text>
                  {sel && <Icon name="check" size={18} weight="fill" color={Colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  topRow: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitle: { flex: 1, letterSpacing: -0.4 },

  sheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  handleArea: {
    paddingTop: 6,
    paddingBottom: 12,
    alignItems: 'center',
  },
  // flex: 1 → la zone défilante remplit la hauteur fixe (medium) et épingle le
  // footer en bas ; si le contenu dépasse, il scrolle au lieu d'être compressé.
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 4 },

  // Itinéraire
  routeCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FBFBFC',
    borderRadius: Radii.lg,
    padding: 14,
  },
  routeRail: { alignItems: 'center', paddingVertical: 5, justifyContent: 'space-between' },
  routeLine: { flex: 1, width: 2, backgroundColor: Colors.border, marginVertical: 6, minHeight: 24 },
  routeCol: { flex: 1, justifyContent: 'space-between', gap: 14 },
  routeEdit: { alignSelf: 'flex-start', padding: 2 },

  sectionLabel: {
    fontSize: 12,
    marginTop: 16,
    marginBottom: 10,
  },

  // Cartes gamme : plateforme colorée + badge ETA en débord + tarif
  gList: { gap: 10, paddingRight: 4 },
  gCard: {
    width: 138,
    height: 133,
    padding: 8,
    borderRadius: Radii.lg,
  },
  gCardIdle: { backgroundColor: '#FBFBFC', opacity: 0.5 },
  gCardSel: { backgroundColor: '#E6F0FF' },
  gPlatform: {
    width: '100%', height: 53,
    borderRadius: Radii.md,
    backgroundColor: '#F2F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gPlatformSel: { backgroundColor: '#3B82F6' },
  gInfo: { marginTop: 12, gap: 4 },
  gLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  gLabel: { fontSize: 12 },
  gPrice: { fontFamily: Poppins.bold, width: '100%' },
  gTag: {
    backgroundColor: '#FFE347',
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: '#E6F0FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  gTagText: { fontFamily: Poppins.medium, color: Colors.textPrimary },
  // Badge ETA : pastille blanche en débord, chevauchant le bas de la plateforme.
  gEta: {
    position: 'absolute',
    bottom: -8, left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.surface,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: '#F0F0F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  gEtaSel: { borderColor: '#E6F0FF' },
  gEtaText: { fontFamily: Poppins.medium, color: Colors.textPrimary },

  // Paiement — affordance illustrée (zone d'action) + mini-feuille de sélection.
  payDot: { width: 10, height: 10, borderRadius: 5 },
  payBtn: { padding: 8 },
  payImg: { width: 40, height: 40 },
  payOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  paySheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  paySheetHandle: { alignItems: 'center', paddingBottom: 10 },
  paySheetTitle: { marginBottom: 8 },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
  },
  payRowLabel: { flex: 1 },

  // Footer : paiement + confirmation
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  cta: { flex: 1 },
});
