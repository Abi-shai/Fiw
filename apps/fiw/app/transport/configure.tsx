import React, { useRef, useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity, FlatList, ScrollView, Animated, Dimensions, Image, PanResponder,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import LeafletMap, { LeafletMapHandle } from '@/components/LeafletMap';
import { Handle, SheetHeader, sheetSurface } from '@/components/Sheet';
import BottomSheet from '@/components/BottomSheet';
import IconButton from '@/components/IconButton';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import Button from '@/components/Button';
import { Colors, Radii, Poppins } from '@/constants/tokens';
import { GAMMES, PAYMENT_METHODS, DAKAR_CENTER } from '@/constants/data';

const SCREEN_H = Dimensions.get('window').height;
// Trois crans, déplaçables à la guise de l'utilisateur : rétracté (voir la
// carte) · medium (défaut) · étendu (haut). Le voile n'apparaît que vers le haut.
// Drag utilisateur limité à deux crans : rétracté (bas) · medium. Pas de cran
// élevé manuel. EXPANDED_H reste pour l'agrandissement auto pendant le paiement.
const COLLAPSED_H = Math.round(SCREEN_H * 0.42);
const MEDIUM_H = Math.round(SCREEN_H * 0.62);
const EXPANDED_H = Math.round(SCREEN_H * 0.9);
const SNAPS = [COLLAPSED_H, MEDIUM_H];
const MAX_SNAP = Math.max(...SNAPS);
const MIN_SNAP = Math.min(...SNAPS);
// Même ressort que le sheet de l'accueil : vif, légèrement sous-amorti.
const SHEET_SPRING = { stiffness: 280, damping: 26, mass: 1 };
const RUBBER = 0.4;          // résistance hors bornes (rubber-band)
const FLICK_V = 0.5;         // px/ms : au-delà, le flick décide du cran
const TAP_THRESHOLD = 6;     // tap sur la poignée → bascule du cran

const nearestSnapH = (h: number) => SNAPS.reduce((a, b) => (Math.abs(b - h) < Math.abs(a - h) ? b : a));
const snapAboveH = (h: number) => { const a = SNAPS.filter((s) => s > h + 1); return a.length ? Math.min(...a) : MAX_SNAP; };
const snapBelowH = (h: number) => { const b = SNAPS.filter((s) => s < h - 1); return b.length ? Math.max(...b) : MIN_SNAP; };

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

// Illustrations par moyen de paiement (espèces fournie ; les autres viendront).
// L'emoji teinté sert de remplacement tant qu'aucune illustration n'est fournie.
const PAY_ILLUSTRATIONS: Record<string, ReturnType<typeof require>> = {
  cash: require('@/assets/argent.png'),
  wave: require('@/assets/pay-wave.png'),
  orange: require('@/assets/pay-orange.png'),
};

// Ligne moyen de paiement (façon Yango) : illustration/logo + libellé +
// sous-titre + radio à droite.
function PayRow({ method, selected, onPress }: {
  method: typeof PAYMENT_METHODS[number]; selected: boolean; onPress: () => void;
}) {
  const illustration = PAY_ILLUSTRATIONS[method.id];
  return (
    <TouchableOpacity style={styles.payRow} activeOpacity={0.85} onPress={onPress}>
      {illustration ? (
        <View style={styles.payIlloWrap}>
          <Image source={illustration} style={styles.payIllo} />
        </View>
      ) : (
        <View style={[styles.payLogo, { backgroundColor: method.color + '1A' }]}>
          <Text style={styles.payEmoji}>{method.icon}</Text>
        </View>
      )}
      <Text variant="label" style={styles.payName}
        color={selected ? Colors.primary : Colors.textPrimary}>{method.label}</Text>
      <View style={[styles.radio, selected && styles.radioSel]}>
        {selected && <Icon name="tick" size={15} weight="bold" color={Colors.surface} />}
      </View>
    </TouchableOpacity>
  );
}

// Contenu de la feuille paiement : sélection « en attente » puis « Terminer »
// (le radio change sans fermer, comme Yango).
function PaymentSheetContent({ initial, onConfirm }: {
  initial: string; onConfirm: (id: string) => void;
}) {
  const [pending, setPending] = useState(initial);
  return (
    <View style={styles.payList}>
      {PAYMENT_METHODS.map((m, i) => (
        <View key={m.id}>
          <PayRow
            method={m}
            selected={pending === m.id}
            onPress={() => { Haptics.selectionAsync(); setPending(m.id); }}
          />
          {i < PAYMENT_METHODS.length - 1 && <View style={styles.payDivider} />}
        </View>
      ))}
      <Button label="Terminer" onPress={() => onConfirm(pending)} style={styles.payCta} />
    </View>
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

  // Entrée par le bas (slide-in) + hauteur animée (drag utilisateur + paiement).
  const mapRef = useRef<LeafletMapHandle>(null);
  const ty = useRef(new Animated.Value(SCREEN_H)).current;
  const sheetH = useRef(new Animated.Value(MEDIUM_H)).current;
  const hValue = useRef(MEDIUM_H);
  const dragStartH = useRef(MEDIUM_H);
  const payOpenRef = useRef(false);
  payOpenRef.current = payOpen;

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

  // Poignée déplaçable : l'utilisateur agrandit / rétracte la feuille à sa guise
  // entre les trois crans (désactivée pendant le choix paiement).
  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, g) => !payOpenRef.current && Math.abs(g.dy) > 4,
    onPanResponderGrant: () => { dragStartH.current = hValue.current; },
    onPanResponderMove: (_, g) => {
      let next = dragStartH.current - g.dy; // glisser vers le haut → agrandir
      if (next > MAX_SNAP) next = MAX_SNAP + (next - MAX_SNAP) * RUBBER;
      else if (next < MIN_SNAP) next = MIN_SNAP - (MIN_SNAP - next) * RUBBER;
      sheetH.setValue(next);
    },
    onPanResponderRelease: (_, g) => {
      const pos = hValue.current;
      if (Math.abs(g.dy) < TAP_THRESHOLD && Math.abs(g.dx) < TAP_THRESHOLD) {
        snapH(pos >= MEDIUM_H - 1 ? COLLAPSED_H : MEDIUM_H);
        return;
      }
      let target: number;
      if (g.vy < -FLICK_V) target = snapAboveH(pos);
      else if (g.vy > FLICK_V) target = snapBelowH(pos);
      else target = nearestSnapH(pos - g.vy * 120);
      snapH(target, -g.vy * 1000);
    },
  })).current;

  // Paiement = feuille modale au-dessus. Quand elle s'ouvre, la feuille de
  // configuration s'agrandit en fond (medium → étendu) pour rester visible et
  // signaler le lien ; elle revient en medium dès que le paiement se ferme
  // (réduction déclenchée au DÉBUT de la sortie → mouvement synchronisé).
  const openPay = () => { Haptics.selectionAsync(); setPayOpen(true); snapH(EXPANDED_H); };

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
        ref={mapRef}
        center={{ lat: (DAKAR_CENTER.lat + destLat) / 2, lng: (DAKAR_CENTER.lng + destLng) / 2 }}
        zoom={13}
        markers={[
          { lat: DAKAR_CENTER.lat, lng: DAKAR_CENTER.lng, type: 'origin' },
          { lat: destLat, lng: destLng, type: 'destination' },
        ]}
        route={{ from: DAKAR_CENTER, to: { lat: destLat, lng: destLng } }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        tintWater
        declutter
        style={StyleSheet.absoluteFillObject}
      />

      {/* Pas de voile au-dessus de la carte : le trajet doit rester lisible.
          (Le choix paiement, lui, a sa propre feuille modale avec voile.) */}

      {/* Contrôles flottants juste au-dessus de la feuille (façon Yango) : ils
          suivent le bord supérieur de la feuille quand elle s'agrandit/rétracte. */}
      <Animated.View
        style={[styles.mapControls, { bottom: Animated.add(sheetH, 12) }]}
        pointerEvents="box-none"
      >
        <IconButton name="back" onPress={() => router.back()} />
        <IconButton
          name="navigate"
          onPress={() => mapRef.current?.recenter(
            { lat: (DAKAR_CENTER.lat + destLat) / 2, lng: (DAKAR_CENTER.lng + destLng) / 2 }, 13)}
        />
      </Animated.View>

      <Animated.View
        style={[
          sheetSurface, styles.sheet,
          { height: sheetH, paddingBottom: insets.bottom + 16, transform: [{ translateY: ty }] },
        ]}
      >
        {/* Zone déplaçable : poignée + en-tête (glisser pour agrandir / rétracter) */}
        <View {...pan.panHandlers}>
          <View style={styles.handleArea}>
            <Handle />
          </View>

          {/* En-tête standard (pièce partagée du design system) */}
          <SheetHeader title="Votre course" onClose={() => router.back()} />
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
          <TouchableOpacity style={styles.payBtn} onPress={openPay} activeOpacity={0.85}>
            <Image
              source={PAY_ILLUSTRATIONS[selectedPayment] ?? PAY_ILLUSTRATIONS.cash}
              style={styles.payImg}
            />
          </TouchableOpacity>
          <Button label="Confirmer la course" onPress={confirm} style={styles.cta} />
        </View>
      </Animated.View>

      {/* Moyen de paiement — feuille modale au-dessus ; la config s'agrandit en
          fond, et se réduit dès le début de la sortie (mouvement synchronisé). */}
      {payOpen && (
        <BottomSheet
          title="Modes de paiement"
          onCloseStart={() => snapH(MEDIUM_H)}
          onClose={() => setPayOpen(false)}
        >
          {(close) => (
            <PaymentSheetContent
              initial={selectedPayment}
              onConfirm={(id) => { select(() => setSelectedPayment(id)); close(); }}
            />
          )}
        </BottomSheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  // Contrôles carte (retour + recentrage) posés juste au-dessus de la feuille.
  mapControls: {
    position: 'absolute',
    left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  sheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 8,
    overflow: 'hidden',
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

  // Paiement — affordance illustrée (zone d'action) + feuille de sélection.
  payBtn: { padding: 8 },
  payImg: { width: 40, height: 40, borderRadius: 11 },
  // Feuille moyen de paiement (façon Yango)
  payList: { paddingBottom: 4 },
  payDivider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.borderSubtle, marginLeft: 64 },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  payLogo: {
    width: 56, height: 56,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Slot transparent (même empreinte que la tuile logo) pour aligner le texte ;
  // l'illustration s'affiche sans fond.
  payIlloWrap: {
    width: 56, height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payIllo: { width: 52, height: 52, borderRadius: 14 },
  payEmoji: { fontSize: 28 },
  payName: { flex: 1, fontSize: 16 },
  radio: {
    width: 26, height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Colors.textDisabled,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSel: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  payCta: { marginTop: 16 },

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
