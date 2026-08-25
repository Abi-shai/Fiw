import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  View, StyleSheet, TouchableOpacity, FlatList, Animated, Image,
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
import ListRow from '@/components/ListRow';
import SegmentedControl from '@/components/SegmentedControl';
import GammeCard from '@/components/GammeCard';
import { GroupedSheet, SheetCard } from '@/components/Sheet';
import RouteCard from '@/components/RouteCard';
import PaymentSheetContent from '@/components/PaymentSheet';
import { Colors, Radii, Shadows, Strokes } from '@/constants/tokens';
import { GAMMES, COVOITURAGE, COVOITURAGE_NODETOUR_PRICE, DAKAR_CENTER, PAYMENT_METHODS, WAIT_GRACE_MINUTES, WAIT_FEE_PER_MIN } from '@/constants/data';
import { topviewSprite } from '@/constants/illustrations';

// Carte gamme : composant partagé avec la Livraison (`components/GammeCard`).
// Les gammes Transport n'ont pas de ligne secondaire — libellé, pastille de
// gamme éventuelle, prix.
const gammeCardProps = (g: typeof GAMMES[number]) => ({
  label: g.label, eta: g.eta, price: g.basePrice, illu: g.illu, badge: g.badge,
});

// Illustrations par moyen de paiement (bouton de la barre de confirmation).
const PAY_ILLUSTRATIONS: Record<string, ReturnType<typeof require>> = {
  cash: require('@/assets/argent.png'),
  wave: require('@/assets/pay-wave.png'),
  orange: require('@/assets/pay-orange.png'),
};

export default function ConfigureScreen() {
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

  const [category, setCategory] = useState<'course' | 'covoit'>('course');
  const [selectedGamme, setSelectedGamme] = useState(params.preselectGamme || 'moto');
  const [noDetour, setNoDetour] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [pendingPayment, setPendingPayment] = useState('cash');
  const [payOpen, setPayOpen] = useState(false);

  const covoitGamme = {
    ...COVOITURAGE,
    badge: noDetour ? 'Direct' : 'Partagé',
    basePrice: noDetour ? COVOITURAGE_NODETOUR_PRICE : COVOITURAGE.basePrice,
    illu: (noDetour ? 'luxe' : 'covoiturage') as 'luxe' | 'covoiturage',
  };
  const gamme = category === 'covoit'
    ? covoitGamme
    : (GAMMES.find(g => g.id === selectedGamme) ?? GAMMES[0]);

  const select = (fn: () => void) => { Haptics.selectionAsync(); fn(); };
  const handleGammeSelect = (id: string) => select(() => setSelectedGamme(id));

  // Transition Classique ↔ Covoiturage : fondu + glissement latéral.
  const switchAnim = useRef(new Animated.Value(1)).current;
  const switchDir = useRef(0);
  const handleCategory = (cat: 'course' | 'covoit') => {
    if (cat === category) return;
    switchDir.current = cat === 'covoit' ? 1 : -1;
    select(() => setCategory(cat));
    switchAnim.setValue(0);
    Animated.spring(switchAnim, {
      toValue: 1, useNativeDriver: true, damping: 18, stiffness: 170, mass: 1,
    }).start();
  };

  // Prestataires dispersés sur la carte ; seule l'illustration change avec la gamme.
  const mapRef = useRef<LeafletMapHandle>(null);
  const providers = useMemo(() => {
    const o = mapCenter;
    return [
      [0.012, -0.014], [-0.010, 0.013], [0.015, 0.007],
      [-0.013, -0.011], [0.005, 0.016], [-0.016, 0.004],
      [0.017, -0.006], [-0.007, 0.015], [0.009, -0.017],
    ].map(([dlat, dlng]) => ({ lat: o.lat + dlat, lng: o.lng + dlng }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Sur la carte, le véhicule se lit du dessus (variante `top view` du jeu
  // `mobility option`) : c'est le point de vue de la carto, et le sprite peut
  // alors pivoter selon le cap de la rue qu'il suit.
  const providerSprite = useMemo(() => topviewSprite(gamme.illu), [gamme.illu]);
  const initialProviderSprite = useRef(providerSprite).current;

  // Entrée de la feuille par le bas + mesure de hauteur (pour les contrôles carte).
  const [sheetH, setSheetH] = useState(0);
  const ty = useRef(new Animated.Value(700)).current;
  const didEnter = useRef(false);
  useEffect(() => {
    if (sheetH > 0 && !didEnter.current) {
      didEnter.current = true;
      Animated.spring(ty, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }).start();
    }
  }, [sheetH]);

  // Change de gamme → échange le sprite des prestataires (sans recharger).
  useEffect(() => { mapRef.current?.setProviderSprite(providerSprite); }, [providerSprite]);

  const openPay = () => {
    Haptics.selectionAsync();
    setPendingPayment(selectedPayment);
    setPayOpen(true);
  };

  const editItinerary = () => {
    Haptics.selectionAsync();
    router.dismissTo({
      pathname: '/home',
      params: { editDeparture: departureName, editDest: params.destName ?? '' },
    });
  };

  const confirm = () => {
    Haptics.selectionAsync();
    router.push({
      pathname: '/transport/searching',
      params: {
        ...params,
        gammeId: gamme.id,
        gammeLabel: gamme.badge ? `${gamme.label} ${gamme.badge}` : gamme.label,
        gammePrice: gamme.basePrice,
        gammeIllu: gamme.illu,
        paymentId: selectedPayment,
      },
    });
  };

  const payImg = PAY_ILLUSTRATIONS[selectedPayment] ?? PAY_ILLUSTRATIONS.cash;
  const payLabel = (PAYMENT_METHODS.find((p) => p.id === selectedPayment) ?? PAYMENT_METHODS[0]).label;

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
        fitPadding={{ top: insets.top + 64, bottom: (sheetH || 420) + 24, left: 56, right: 56 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Contrôles flottants (retour + recentrage) juste au-dessus de la feuille. */}
      {sheetH > 0 && (
        <View style={[styles.mapControls, { bottom: sheetH + 12 }]} pointerEvents="box-none">
          <IconButton name="back" onPress={() => router.back()} />
          <IconButton name="navigate" onPress={() => mapRef.current?.recenter(mapCenter, 13)} />
        </View>
      )}

      <GroupedSheet
        translateY={ty}
        onLayout={(e) => setSheetH(e.nativeEvent.layout.height)}
      >
          {/* Carte 1 : en-tête + itinéraire. */}
          <SheetCard>
            <View style={styles.headerRow}>
              <Text variant="heading1" style={styles.flex1} numberOfLines={1}>Votre course</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.85}>
                <Icon name="close" size={18} weight="bold" color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Itinéraire à plat, comme la course active (maquette 118:525). */}
            <RouteCard
              departure={departureName}
              destination={params.destName}
              onEdit={editItinerary}
            />
          </SheetCard>

          {/* Carte 2 : switcher de catégorie + choix de l'offre. */}
          <SheetCard>
            <SegmentedControl
              items={[{ id: 'course', label: 'Classique' }, { id: 'covoit', label: 'Covoiturage' }]}
              value={category}
              onChange={(id) => handleCategory(id as 'course' | 'covoit')}
            />

            <Animated.View style={{
              opacity: switchAnim,
              transform: [{ translateX: switchAnim.interpolate({ inputRange: [0, 1], outputRange: [switchDir.current * 24, 0] }) }],
            }}>
              {category === 'covoit' ? (
                <>
                  <View style={styles.covoitRow}>
                    <GammeCard {...gammeCardProps(covoitGamme)} selected onPress={() => {}} />
                    <View style={styles.covoitInfo}>
                      <Text variant="bodySemibold">
                        {noDetour ? 'Trajet sans détour' : 'Trajet partagé'}
                      </Text>
                      <Text variant="bodySmall" color={Colors.textSecondary}>
                        {noDetour
                          ? 'Toujours partagé, mais seuls les passagers déjà sur votre route sont pris. Trajet plus direct.'
                          : 'Partagé avec d’autres passagers. Prix indiqué par passager.'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.detourRow}
                    onPress={() => select(() => setNoDetour(v => !v))}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.radio, noDetour && styles.radioSel]}>
                      {noDetour && <Icon name="tick" size={15} weight="bold" color={Colors.surface} />}
                    </View>
                    <View style={styles.flex1}>
                      <Text variant="label">Pas de détour</Text>
                      <Text variant="caption" color={Colors.textSecondary}>Uniquement les passagers déjà sur votre route</Text>
                    </View>
                  </TouchableOpacity>
                </>
              ) : (
                <FlatList
                  data={GAMMES}
                  extraData={selectedGamme}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={g => g.id}
                  contentContainerStyle={styles.gList}
                  renderItem={({ item }) => (
                    <GammeCard {...gammeCardProps(item)} selected={selectedGamme === item.id} onPress={() => handleGammeSelect(item.id)} />
                  )}
                />
              )}
            </Animated.View>
          </SheetCard>

          {/* Carte 3 : annonce frais d'attente + paiement + confirmation. */}
          <SheetCard style={styles.confirmCard}>
            {/* Frais d'attente annoncés dès la commande (cf. CONTEXT.md). */}
            <View style={styles.waitNote}>
              <Icon name="timer" size={15} weight="bold" color={Colors.textSecondary} />
              <Text variant="caption" color={Colors.textSecondary} style={styles.flex1}>
                {WAIT_GRACE_MINUTES} min d'attente offertes à l'arrivée, puis {WAIT_FEE_PER_MIN} F/min
              </Text>
            </View>
            {/* Le moyen de paiement se lit en rangée pleine largeur au-dessus du
                CTA — Uber, Careem, Gojek, Waymo et Grab le posent tous là. La
                pastille carrée d'avant ne disait ni lequel ni qu'on pouvait en
                changer. */}
            <ListRow
              leading={<Image source={payImg} style={styles.payLogo} />}
              title={payLabel}
              onPress={openPay}
            />
            <Button label="Confirmer la course" onPress={confirm} />
          </SheetCard>
      </GroupedSheet>

      {/* Moyen de paiement — feuille modale. */}
      {payOpen && (
        <BottomSheet
          title="Modes de paiement"
          onClose={() => { setSelectedPayment(pendingPayment); setPayOpen(false); }}
        >
          {(close) => (
            <PaymentSheetContent
              value={pendingPayment}
              onChange={setPendingPayment}
              onDone={close}
            />
          )}
        </BottomSheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  flex1: { flex: 1 },

  mapControls: {
    position: 'absolute',
    left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  // En-tête « Votre course » + fermeture.
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  closeBtn: {
    width: 36, height: 36, borderRadius: Radii.lg,
    backgroundColor: Colors.track,
    alignItems: 'center', justifyContent: 'center',
  },

  // Switcher de catégorie (segmented control).

  // Covoiturage.
  covoitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginTop: 12 },
  covoitInfo: { flex: 1, gap: 5, paddingTop: 8 },
  detourRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginTop: 12,
    paddingVertical: 12, paddingHorizontal: 14,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.lg,
  },

  // Rangée de gammes (la carte elle-même vit dans `components/GammeCard`).
  gList: { gap: 10, paddingTop: 12, paddingRight: 4 },

  // Carte confirmation.
  confirmCard: { gap: 12 },
  waitNote: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  payLogo: { width: 40, height: 40, borderRadius: 11 },

  radio: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: Strokes.thick, borderColor: Colors.textDisabled,
    alignItems: 'center', justifyContent: 'center',
  },
  radioSel: { backgroundColor: Colors.primary, borderColor: Colors.primary },
});
