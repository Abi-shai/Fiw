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
import { GroupedSheet, SheetCard } from '@/components/RideSheet';
import PaymentSheetContent from '@/components/PaymentSheet';
import { Colors, Radii, Poppins, Shadows } from '@/constants/tokens';
import { GAMMES, COVOITURAGE, COVOITURAGE_NODETOUR_PRICE, DAKAR_CENTER, WAIT_GRACE_MINUTES, WAIT_FEE_PER_MIN } from '@/constants/data';
import { gammeIllustration, type IlluKey } from '@/constants/illustrations';

// Séparateur de milliers façon FR/Sénégal (« 1.150 ») pour coller à la maquette.
const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/[\s  ]/g, '.');

// Ressort doux propre à la bascule de gamme : transition en fondu.
const GAMME_SPRING = { stiffness: 220, damping: 22, mass: 1 };

// Carte gamme (maquette 118-525) : plateforme colorée (bleue si choisie), badge
// ETA en débord, libellé + tarif. Sélection animée via `progress` (0 → 1).
function GammeCard({ gamme, selected, onPress }: {
  gamme: typeof GAMMES[number]; selected: boolean; onPress: () => void;
}) {
  const tag = gamme.badge;
  const progress = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: selected ? 1 : 0, ...GAMME_SPRING, useNativeDriver: false,
    }).start();
  }, [selected]);

  const cardBg = progress.interpolate({ inputRange: [0, 1], outputRange: [Colors.surfaceAlt, Colors.primarySubtle] });
  const cardOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const platformBg = progress.interpolate({ inputRange: [0, 1], outputRange: [Colors.track, Colors.primary] });
  const platformScale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const idleOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  return (
    <TouchableOpacity style={styles.gCard} onPress={onPress} activeOpacity={0.9}>
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.gCardBg, { backgroundColor: cardBg }]} />
      <Animated.View style={[styles.gContent, { opacity: cardOpacity }]}>
        <Animated.View style={[styles.gPlatform, { backgroundColor: platformBg, transform: [{ scale: platformScale }] }]}>
          <Image source={gammeIllustration(gamme.illu)} style={styles.gIllo} resizeMode="contain" />
          <View style={[styles.gEta, selected && styles.gEtaSel]}>
            <Icon name="timer" size={12} weight="bold" color={Colors.textPrimary} />
            <Text variant="caption" style={styles.gEtaText}>{gamme.eta}</Text>
          </View>
        </Animated.View>
        <View style={styles.gInfo}>
          <View style={styles.gLabelRow}>
            <Text variant="label" numberOfLines={1} style={styles.gLabel}>{gamme.label}</Text>
            {tag && (
              <View style={styles.gTag}>
                <Text variant="caption" style={styles.gTagText}>{tag}</Text>
              </View>
            )}
          </View>
          <View style={styles.gPrice}>
            <Animated.View style={{ opacity: idleOpacity }}>
              <Text variant="heading2" align="center" style={styles.gPriceText} color={Colors.textPrimary}>
                {fmt(gamme.basePrice)} FCFA
              </Text>
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: progress }]}>
              <Text variant="heading2" align="center" style={styles.gPriceText} color={Colors.primary}>
                {fmt(gamme.basePrice)} FCFA
              </Text>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

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
  const providerIcon = useMemo(
    () => Image.resolveAssetSource(gammeIllustration(gamme.illu)).uri,
    [gamme.illu],
  );
  const initialProviderIcon = useRef(providerIcon).current;

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

  // Change de gamme → échange l'illustration des prestataires (sans recharger).
  useEffect(() => { mapRef.current?.setProviderIcon(providerIcon); }, [providerIcon]);

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
        providerIcon={initialProviderIcon}
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

            <TouchableOpacity style={styles.routeCard} onPress={editItinerary} activeOpacity={0.85}>
              <View style={styles.routeRail}>
                <Icon name="walk" size={22} weight="bold" color={Colors.textPrimary} />
                <View style={styles.routeLine} />
                <Icon name="flag" size={22} weight="bold" color={Colors.textPrimary} />
              </View>
              <View style={styles.routeCol}>
                <View>
                  <Text variant="bodySmall" color={Colors.textSecondary}>Départ</Text>
                  <Text variant="label" numberOfLines={1}>{departureName}</Text>
                </View>
                <View>
                  <Text variant="bodySmall" color={Colors.textSecondary}>Arrivée</Text>
                  <Text variant="label" numberOfLines={1}>{params.destName}</Text>
                </View>
              </View>
              <View style={styles.routeEdit}>
                <Icon name="edit" size={18} color={Colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </SheetCard>

          {/* Carte 2 : switcher de catégorie + choix de l'offre. */}
          <SheetCard>
            <View style={styles.segment}>
              {([['course', 'Classique'], ['covoit', 'Covoiturage']] as const).map(([cat, label]) => {
                const active = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.segmentItem, active && styles.segmentItemActive]}
                    onPress={() => handleCategory(cat)}
                    activeOpacity={0.85}
                  >
                    <Text variant="label" color={active ? Colors.textPrimary : Colors.textSecondary} style={styles.segmentText}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Animated.View style={{
              opacity: switchAnim,
              transform: [{ translateX: switchAnim.interpolate({ inputRange: [0, 1], outputRange: [switchDir.current * 24, 0] }) }],
            }}>
              {category === 'covoit' ? (
                <>
                  <View style={styles.covoitRow}>
                    <GammeCard gamme={covoitGamme} selected onPress={() => {}} />
                    <View style={styles.covoitInfo}>
                      <Text variant="label" style={styles.covoitTitle}>
                        {noDetour ? 'Trajet sans détour' : 'Trajet partagé'}
                      </Text>
                      <Text variant="caption" color={Colors.textSecondary} style={styles.covoitDesc}>
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
                      <Text variant="label" style={styles.detourTitle}>Pas de détour</Text>
                      <Text variant="caption" color={Colors.textSecondary} style={styles.detourSub}>Uniquement les passagers déjà sur votre route</Text>
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
                    <GammeCard gamme={item} selected={selectedGamme === item.id} onPress={() => handleGammeSelect(item.id)} />
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
            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.payBtn} onPress={openPay} activeOpacity={0.85}>
                <Image source={payImg} style={styles.payImg} />
              </TouchableOpacity>
              <Button label="Confirmer la course" onPress={confirm} style={styles.cta} />
            </View>
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

  // Itinéraire.
  routeCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.lg,
    padding: 14,
  },
  routeRail: { alignItems: 'center', paddingVertical: 5, justifyContent: 'space-between' },
  routeLine: { flex: 1, width: 2, backgroundColor: Colors.border, marginVertical: 6, minHeight: 24 },
  routeCol: { flex: 1, justifyContent: 'space-between', gap: 14 },
  routeEdit: { alignSelf: 'flex-start', padding: 2 },

  // Switcher de catégorie (segmented control).
  segment: {
    flexDirection: 'row',
    backgroundColor: Colors.track,
    borderRadius: Radii.pill,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  segmentItemActive: { backgroundColor: Colors.surface, ...Shadows.sm },
  segmentText: { fontSize: 14 },

  // Covoiturage.
  covoitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginTop: 12 },
  covoitInfo: { flex: 1, gap: 5, paddingTop: 8 },
  covoitTitle: { fontFamily: Poppins.semibold, fontSize: 16, lineHeight: 22 },
  covoitDesc: { fontSize: 14, lineHeight: 19 },
  detourTitle: { fontSize: 14, lineHeight: 19 },
  detourSub: { fontSize: 12, lineHeight: 16 },
  detourRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginTop: 12,
    paddingVertical: 12, paddingHorizontal: 14,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.lg,
  },

  // Cartes gamme.
  gList: { gap: 10, paddingTop: 12, paddingRight: 4 },
  gCard: { width: 138, height: 133, padding: 8, borderRadius: Radii.lg },
  gCardBg: { borderRadius: Radii.lg },
  gContent: { flex: 1, gap: 12 },
  gPlatform: {
    flex: 1, width: '100%',
    borderRadius: Radii.md,
    alignItems: 'flex-end', justifyContent: 'center',
    paddingRight: 12,
    overflow: 'visible',
  },
  gIllo: { width: 68, height: 68 },
  gInfo: { gap: 4 },
  gLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  gLabel: { fontSize: 12 },
  gPrice: { width: '100%' },
  gPriceText: { fontFamily: Poppins.bold, width: '100%' },
  gTag: {
    backgroundColor: Colors.brandYellow,
    borderRadius: Radii.pill,
    borderWidth: 1, borderColor: Colors.primarySubtle,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  gTagText: { fontFamily: Poppins.medium, color: Colors.textPrimary },
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

  // Carte confirmation.
  confirmCard: { gap: 12 },
  waitNote: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payBtn: { padding: 4 },
  payImg: { width: 40, height: 40, borderRadius: 11 },
  cta: { flex: 1 },

  radio: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: Colors.textDisabled,
    alignItems: 'center', justifyContent: 'center',
  },
  radioSel: { backgroundColor: Colors.primary, borderColor: Colors.primary },
});
