import React, { useRef, useState, useEffect, useMemo } from 'react';
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
import Icon from '@/components/Icon';
import Button from '@/components/Button';
import { Colors, Radii, Poppins } from '@/constants/tokens';
import { GAMMES, COVOITURAGE, COVOITURAGE_SOLO_PRICE, PAYMENT_METHODS, DAKAR_CENTER } from '@/constants/data';
import { gammeIllustration, type IlluKey } from '@/constants/illustrations';

const SCREEN_H = Dimensions.get('window').height;
// Trois crans déplaçables : rétracté (bas, voir la carte) · medium (défaut) ·
// élevé (haut). Le voile (overlay) n'apparaît qu'au cran élevé. EXPANDED_H sert
// aussi à l'agrandissement auto pendant le paiement.
const COLLAPSED_H = Math.round(SCREEN_H * 0.42);
const MEDIUM_H = Math.round(SCREEN_H * 0.62);
const EXPANDED_H = Math.round(SCREEN_H * 0.9);
const SNAPS = [COLLAPSED_H, MEDIUM_H, EXPANDED_H];
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

// Illustrations 3D isométriques des moyens de transport (maquette Figma) : moto
// Séparateur de milliers façon FR/Sénégal (« 1.150 ») pour coller à la maquette.
const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/[\s  ]/g, '.');

// Ressort doux propre à la bascule de gamme : la transition d'une option active
// à une autre se fait en fondu (couleurs, opacité, icône, tarif) plutôt qu'en
// saut sec.
const GAMME_SPRING = { stiffness: 220, damping: 22, mass: 1 };

// Carte gamme : plateforme colorée (bleue si choisie), badge ETA en débord,
// libellé + tarif. Les cartes non choisies sont estompées (emphase sélection).
// La sélection est animée via une valeur `progress` (0 → 1) qui interpole tous
// les attributs visuels, et qui croise en fondu l'icône et le tarif (deux états
// superposés) pour un changement de poids/couleur fluide.
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

  const cardBg = progress.interpolate({ inputRange: [0, 1], outputRange: ['#FBFBFC', '#E6F0FF'] });
  const cardOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const platformBg = progress.interpolate({ inputRange: [0, 1], outputRange: ['#F2F3F5', '#3B82F6'] });
  const platformScale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const idleOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  return (
    <TouchableOpacity style={styles.gCard} onPress={onPress} activeOpacity={0.9}>
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.gCardBg, { backgroundColor: cardBg }]} />
      <Animated.View style={[styles.gContent, { opacity: cardOpacity }]}>
        <Animated.View style={[styles.gPlatform, { backgroundColor: platformBg, transform: [{ scale: platformScale }] }]}>
          {/* Illustration 3D du véhicule, alignée à droite dans la plateforme. */}
          <Image source={gammeIllustration(gamme.illu)} style={styles.gIllo} resizeMode="contain" />
          {/* Badge ETA en débord, chevauchant le bas de la plateforme */}
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
          {/* Tarif : deux teintes superposées, croisées en fondu (idem icône). */}
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
  // Centre de la carte = milieu départ/arrivée (réutilisé pour le cadrage,
  // le recentrage et la dispersion des prestataires).
  const mapCenter = { lat: (DAKAR_CENTER.lat + destLat) / 2, lng: (DAKAR_CENTER.lng + destLng) / 2 };

  // Catégorie Transport (switcher façon Yango) : Course = grille de gammes
  // (Moto/Simple/Confort/Prestige) · Covoiturage = une offre + option Pas de détour.
  const [category, setCategory] = useState<'course' | 'covoit'>('course');
  const [selectedGamme, setSelectedGamme] = useState('moto');
  const [noDetour, setNoDetour] = useState(false); // « Pas de détour » : solo, prix plein
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [payOpen, setPayOpen] = useState(false);

  // Offre covoiturage dérivée de l'option « Pas de détour » : partagé (prix par
  // passager) ↔ solo (prix plein). Réutilise la forme GAMMES pour GammeCard.
  const covoitGamme = {
    ...COVOITURAGE,
    badge: noDetour ? 'Solo' : 'Partagé',
    basePrice: noDetour ? COVOITURAGE_SOLO_PRICE : COVOITURAGE.basePrice,
    // « Pas de détour » bascule sur l'auto noire (luxe) ; sinon orange (partagé).
    illu: (noDetour ? 'luxe' : 'covoiturage') as IlluKey,
  };
  const gamme = category === 'covoit'
    ? covoitGamme
    : (GAMMES.find(g => g.id === selectedGamme) ?? GAMMES[0]);

  const select = (fn: () => void) => { Haptics.selectionAsync(); fn(); };

  const handleGammeSelect = (id: string) => select(() => setSelectedGamme(id));

  // Transition entre vues Classique ↔ Covoiturage : le contenu fond et glisse
  // depuis le côté du segment choisi (vers la droite pour Covoiturage).
  const switchAnim = useRef(new Animated.Value(1)).current;
  const switchDir = useRef(0);

  // Bascule de catégorie (la sélection « Classique » est conservée au retour).
  const handleCategory = (cat: 'course' | 'covoit') => {
    if (cat === category) return;
    switchDir.current = cat === 'covoit' ? 1 : -1;
    select(() => setCategory(cat));
    switchAnim.setValue(0);
    Animated.spring(switchAnim, {
      toValue: 1, useNativeDriver: true, damping: 18, stiffness: 170, mass: 1,
    }).start();
  };

  // Prestataires disponibles, dispersés sur toute la carte autour du centre
  // (façon Yango) ; seule l'illustration change avec le moyen de transport
  // actif. Positions de départ générées une fois — ils se déplacent ensuite.
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
  // Seul l'icône INITIAL est injecté dans le HTML de la carte ; les changements
  // passent par `setProviderIcon` (message) pour ne pas régénérer le HTML et
  // donc recharger la carte à chaque changement de gamme.
  const initialProviderIcon = useRef(providerIcon).current;

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

  // Change de moyen de transport → échange l'illustration des prestataires sur
  // la carte (sans la recharger).
  useEffect(() => { mapRef.current?.setProviderIcon(providerIcon); }, [providerIcon]);

  const snapH = (to: number, vy = 0) =>
    Animated.spring(sheetH, {
      toValue: to, velocity: vy, ...SHEET_SPRING,
      restDisplacementThreshold: 0.3, restSpeedThreshold: 0.3, useNativeDriver: false,
    }).start();

  // Voile derrière la feuille : nul du cran rétracté au medium, apparaît
  // seulement en montant vers l'élevé (clamp).
  const scrimOpacity = sheetH.interpolate({
    inputRange: [MEDIUM_H, EXPANDED_H],
    outputRange: [0, 0.5],
    extrapolate: 'clamp',
  });

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
        // Tap sur la poignée : monte d'un cran (rétracté→medium→élevé), et
        // redescend à medium depuis l'élevé.
        const t = pos >= EXPANDED_H - 1 ? MEDIUM_H : pos >= MEDIUM_H - 1 ? EXPANDED_H : MEDIUM_H;
        snapH(t);
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
        gammeId: gamme.id,
        gammeLabel: gamme.badge ? `${gamme.label} ${gamme.badge}` : gamme.label,
        gammePrice: gamme.basePrice,
        gammeIllu: gamme.illu,
        paymentId: selectedPayment,
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
        // Prestataires disponibles aux alentours, illustrés selon le moyen de
        // transport actif (moto/auto) — façon Yango.
        providers={providers}
        providerIcon={initialProviderIcon}
        // Cadrage du trajet dans la zone visible : on réserve la hauteur de la
        // feuille (cran medium par défaut) en bas + les contrôles flottants en
        // haut, pour que le trajet soit centré et non décalé sous la feuille.
        fitPadding={{ top: insets.top + 64, bottom: MEDIUM_H + 24, left: 56, right: 56 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Voile derrière la feuille — visible uniquement au cran élevé (nul du
          rétracté au medium). Masqué pendant le paiement (la feuille modale a
          déjà son propre voile). Non interactif : la carte reste lisible. */}
      {!payOpen && (
        <Animated.View
          style={[styles.scrim, { opacity: scrimOpacity }]}
          pointerEvents="none"
        />
      )}

      {/* Contrôles flottants juste au-dessus de la feuille (façon Yango) : ils
          suivent le bord supérieur de la feuille quand elle s'agrandit/rétracte. */}
      <Animated.View
        style={[styles.mapControls, { bottom: Animated.add(sheetH, 12) }]}
        pointerEvents="box-none"
      >
        <IconButton name="back" onPress={() => router.back()} />
        <IconButton
          name="navigate"
          onPress={() => mapRef.current?.recenter(mapCenter, 13)}
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

        {/* Switcher de catégorie Transport (Classique / Covoiturage), façon Yango */}
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

        {/* Choix de l'offre — gammes (Classique) ou covoiturage (offre + option).
            Enveloppé dans un Animated.View qui fond/glisse à chaque bascule. */}
        <Animated.View style={{
          opacity: switchAnim,
          transform: [{ translateX: switchAnim.interpolate({ inputRange: [0, 1], outputRange: [switchDir.current * 24, 0] }) }],
        }}>
        {category !== 'covoit' && (
          <Text variant="caption" color={Colors.textSecondary} style={styles.sectionLabel}>
            Moyens de déplacement
          </Text>
        )}
        {category === 'covoit' ? (
          <>
            {/* Offre unique covoiturage + descriptif (prix par passager) */}
            <View style={styles.covoitRow}>
              <GammeCard gamme={covoitGamme} selected onPress={() => {}} />
              <View style={styles.covoitInfo}>
                <Text variant="label" style={styles.covoitTitle}>
                  {noDetour ? 'Trajet solo' : 'Trajet partagé'}
                </Text>
                <Text variant="caption" color={Colors.textSecondary} style={styles.covoitDesc}>
                  {noDetour
                    ? 'Vous voyagez seul, sans détour. Prix plein.'
                    : 'Partagé avec d’autres passagers. Prix indiqué par passager.'}
                </Text>
              </View>
            </View>

            {/* Option « Pas de détour » (solo, prix plein) — case à cocher */}
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
                <Text variant="caption" color={Colors.textSecondary} style={styles.detourSub}>Solo, sans détour — prix plein</Text>
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

  // Voile (overlay) derrière la feuille au cran élevé.
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' },

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

  // Switcher de catégorie (Course / Covoiturage) — segmented control façon Yango :
  // piste grise, segment actif en pastille blanche ombrée.
  segment: {
    flexDirection: 'row',
    backgroundColor: '#F2F3F5',
    borderRadius: Radii.pill,
    padding: 4,
    marginTop: 16,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  segmentItemActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  segmentText: { fontSize: 14 },

  // Covoiturage : carte d'offre unique + descriptif à droite.
  flex1: { flex: 1 },
  covoitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginTop: 16 },
  covoitInfo: { flex: 1, gap: 5, paddingTop: 14 },
  covoitTitle: { fontFamily: Poppins.semibold, fontSize: 16, lineHeight: 22 },
  covoitDesc: { fontSize: 14, lineHeight: 19 },
  detourTitle: { fontSize: 14, lineHeight: 19 },
  detourSub: { fontSize: 12, lineHeight: 16 },
  // Option « Pas de détour » — case à cocher pleine largeur.
  detourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FBFBFC',
    borderRadius: Radii.lg,
  },

  // Cartes gamme : plateforme colorée + badge ETA en débord + tarif
  gList: { gap: 10, paddingRight: 4 },
  gCard: {
    width: 138,
    height: 133,
    padding: 8,
    borderRadius: Radii.lg,
  },
  // Fond animé de la carte (couleur interpolée) posé sous le contenu.
  gCardBg: { borderRadius: Radii.lg },
  // Contenu (au-dessus du fond) : plateforme extensible + infos, estompé en repos.
  gContent: { flex: 1, gap: 12 },
  // Plateforme : remplit la hauteur dispo ; illustration alignée à droite, qui
  // déborde légèrement vers le haut (effet « véhicule posé », façon maquette).
  gPlatform: {
    flex: 1,
    width: '100%',
    borderRadius: Radii.md,
    alignItems: 'flex-end',
    justifyContent: 'center',
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
