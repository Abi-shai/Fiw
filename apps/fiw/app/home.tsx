import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Animated, ScrollView,
  PanResponder, Dimensions, TextInput, FlatList, Keyboard, Image,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import LeafletMap, { LeafletMapHandle } from '@/components/LeafletMap';
import IconButton from '@/components/IconButton';
import PlaceRow from '@/components/PlaceRow';
import Button from '@/components/Button';
import Scrim from '@/components/Scrim';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import { Handle, SheetHeader, sheetSurface } from '@/components/Sheet';
import { Colors, Radii, Poppins, Shadows } from '@/constants/tokens';
import { DAKAR_CENTER, SUGGESTIONS, SAVED_PLACES, RECENT_PLACES } from '@/constants/data';

type Place = { name: string; detail: string; lat: number; lng: number };
type Field = 'departure' | 'destination';
type ResultRow = { key: string; icon: IconName; accent?: boolean; title: string; subtitle?: string; place: Place };

const RECENTS: Place[] = [SUGGESTIONS[2], SUGGESTIONS[0]]; // Almadies, Aéroport AIBD

const SCREEN_H = Dimensions.get('window').height;
// Snap points expressed as the sheet's translateY (0 = covers full screen).
// Larger translateY = lower / more collapsed.
const PEEK_VISIBLE = 140;                       // Waze-like: only handle + heading peek out
const TY_EXPANDED = Math.round(SCREEN_H * 0.08); // almost full
const TY_DEFAULT = Math.round(SCREEN_H * 0.40);  // services visible
const TY_COLLAPSED = SCREEN_H - PEEK_VISIBLE;    // collapsed to the bottom
const SNAPS = [TY_EXPANDED, TY_DEFAULT, TY_COLLAPSED]; // croissant : haut → bas
const TAP_THRESHOLD = 6;
const RUBBER = 0.4;   // résistance hors bornes (rubber-band façon Waze/Google Maps)
const FLICK_V = 0.32; // px/ms : au-delà, le flick envoie au cran suivant dans sa direction
// Ressort partagé (snap + entrée) : vif et légèrement sous-amorti pour un snap
// vivant et perceptible (settle rapide + petit dépassement).
const SPRING = { stiffness: 280, damping: 22, mass: 1 };

// Cran le plus proche d'une position (drag lent).
const nearestSnap = (pos: number) =>
  SNAPS.reduce((a, b) => (Math.abs(b - pos) < Math.abs(a - pos) ? b : a));
// Cran immédiatement au-dessus / en-dessous (flick décisif).
const snapAbove = (pos: number) => {
  const above = SNAPS.filter((s) => s < pos - 1);
  return above.length ? Math.max(...above) : SNAPS[0];
};
const snapBelow = (pos: number) => {
  const below = SNAPS.filter((s) => s > pos + 1);
  return below.length ? Math.min(...below) : SNAPS[SNAPS.length - 1];
};
// Hauteur visible du sheet une fois étendu : borne le contenu de recherche
// pour que la liste scrolle dans l'écran (le sheet fait toute la hauteur).
const SEARCH_H = SCREEN_H - TY_EXPANDED;

type Service = {
  id: string;
  label: string;
  tagline: string;
  icon: IconName;
  iconColor: string;
  active: boolean;
};

const SERVICES: Service[] = [
  { id: 'transport',  label: 'Transport',  tagline: 'Réservez une course', icon: 'car',       iconColor: Colors.primary,  active: true },
  { id: 'livraison',  label: 'Livraison',  tagline: 'Envoyez un colis',    icon: 'package',   iconColor: Colors.primary,  active: false },
  { id: 'location',   label: 'Location',   tagline: 'Louez un véhicule',   icon: 'handshake', iconColor: Colors.primary,  active: false },
  { id: 'assistance', label: 'Assistance', tagline: 'Dépannage & secours', icon: 'lifebuoy',  iconColor: Colors.gray700,  active: false },
];

// Illustrations 3D isométriques par service (maquette Figma) — rendent les
// tuiles plus expressives que les icônes ligne.
const SERVICE_ILLUSTRATIONS: Record<string, ReturnType<typeof require>> = {
  transport:  require('@/assets/serv-transport.png'),
  livraison:  require('@/assets/serv-livraison.png'),
  location:   require('@/assets/serv-location.png'),
  assistance: require('@/assets/serv-assistance.png'),
};

// Géométrie reprise EXACTEMENT de la maquette (node 62:96). La bande bleue est
// un grand carré translucide pivoté ; on donne le coin haut-gauche du carré
// (= position du wrapper Figma + (tailleWrapper − 249.505) / 2, le carré étant
// centré dans son wrapper) et l'angle. La rotation RN, comme Figma, se fait
// autour du centre du carré → même rendu.
const BAND_COLOR = 'rgba(0, 102, 255, 0.2)';
type BandCfg = { size: number; left: number; top: number; rotate: string; radius?: number };
const SERVICE_BANDS: Record<string, BandCfg> = {
  transport:  { size: 249.5, left: -88.34, top: 90.66, rotate: '30deg' },
  livraison:  { size: 249.5, left: -23.47, top: 54.03, rotate: '-30deg' },
  location:   { size: 249.5, left: -20.84, top: 39.66, rotate: '-30deg', radius: 58 },
  assistance: { size: 249.5, left: -139.91, top: 21.09, rotate: '31.91deg' },
};
// Illustration : `left`/`top` du wrapper (px ou « 50% ») et translation de base
// (centrage Figma via -translate-x/y et décalages calc()). Tailles Figma exactes.
type IlloCfg = { size: number; left: number | string; top: number | string; baseX: number; baseY: number; mirror?: boolean };
const SERVICE_ILLOS: Record<string, IlloCfg> = {
  transport:  { size: 132, left: -14,   top: '50%', baseX: 0,       baseY: -47.5 }, // top 50%+18.5, ty -50% (132/2)
  livraison:  { size: 112, left: 18.5,  top: 0,     baseX: 0,       baseY: 0 },
  location:   { size: 88,  left: '50%', top: '50%', baseX: -44.25,  baseY: -36 },   // center 50%-0.25 / 50%+8
  assistance: { size: 88,  left: '50%', top: '50%', baseX: -47,     baseY: -44, mirror: true }, // center 50%-3 / 50%, miroir
};

function openConfigure(place: Place, departureName: string) {
  router.push({
    pathname: '/transport/configure',
    params: {
      departureName,
      destName: place.name,
      destDetail: place.detail,
      destLat: place.lat,
      destLng: place.lng,
    },
  });
}

// Panneau illustré : fond blanc + bande bleue diagonale (carré pivoté clipé) +
// illustration positionnée EXACTEMENT comme la maquette. L'illustration glisse
// depuis le côté (`dx`) jusqu'à sa place quand `driveAnim` passe de 0 à 1 — effet
// « le véhicule arrive en roulant et se gare » (le `dx` s'ajoute à `baseX`, donc
// elle décélère pile sur sa position Figma).
function IlloPanel({ serviceId, panelStyle, driveAnim, dx }: {
  serviceId: string; panelStyle?: object; driveAnim: Animated.Value; dx: number;
}) {
  const band = SERVICE_BANDS[serviceId];
  const illo = SERVICE_ILLOS[serviceId];
  const translateX = driveAnim.interpolate({
    inputRange: [0, 1], outputRange: [illo.baseX + dx, illo.baseX],
  });
  return (
    <View style={[styles.illoPanel, panelStyle]}>
      <View
        style={[styles.band, {
          width: band.size, height: band.size, left: band.left, top: band.top,
          borderRadius: band.radius ?? 0, transform: [{ rotate: band.rotate }],
        }]}
      />
      <Animated.View
        style={{
          position: 'absolute',
          left: illo.left as any, top: illo.top as any,
          width: illo.size, height: illo.size,
          opacity: driveAnim,
          transform: [{ translateX }, { translateY: illo.baseY }],
        }}
      >
        <Image
          source={SERVICE_ILLUSTRATIONS[serviceId]}
          style={[{ width: illo.size, height: illo.size }, illo.mirror && styles.mirror]}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

function ServiceCard({ service, variant, onPress, driveAnim, dx }: {
  service: Service;
  variant: 'hero' | 'small' | 'wide';
  onPress: () => void;
  driveAnim: Animated.Value;
  dx: number;
}) {
  const props = {
    activeOpacity: service.active ? 0.9 : 1,
    disabled: !service.active,
    onPress,
  };

  // Assistance : tuile carrée (illustration sur bande bleue) + texte + chevron.
  if (variant === 'wide') {
    return (
      <TouchableOpacity style={[styles.card, styles.cardWide]} {...props}>
        <IlloPanel serviceId={service.id} panelStyle={styles.wideTile} driveAnim={driveAnim} dx={dx} />
        <View style={styles.flex1}>
          <Text variant="label">{service.label}</Text>
          <Text variant="caption" color={Colors.textSecondary} style={styles.cardTagline}>{service.tagline}</Text>
        </View>
        <Icon name="chevronRight" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>
    );
  }

  // Transport (hero) & Livraison/Location (small) : en-tête + panneau illustré.
  const hero = variant === 'hero';
  return (
    <TouchableOpacity
      style={[styles.card, hero ? styles.cardHero : styles.cardSmall]}
      {...props}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderText}>
          <Text variant={hero ? 'heading2' : 'label'}>{service.label}</Text>
          {hero && (
            <Text variant="caption" color={Colors.textSecondary} style={styles.cardTagline}>{service.tagline}</Text>
          )}
        </View>
        <Icon name="chevronRight" size={18} color={Colors.textTertiary} />
      </View>
      <IlloPanel
        serviceId={service.id}
        panelStyle={hero ? styles.illoPanelHero : styles.illoPanelSmall}
        driveAnim={driveAnim}
        dx={dx}
      />
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<LeafletMapHandle>(null);

  const ty = useRef(new Animated.Value(SCREEN_H)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const controlsFade = useRef(new Animated.Value(0)).current;
  const tyValue = useRef(SCREEN_H);
  const dragOffset = useRef(0);

  // Mode de l'écran : grille de services ↔ recherche d'itinéraire (morph
  // in-place) ↔ choix d'un point sur la carte (pin fixe, carte mobile dessous).
  const [mode, setMode] = useState<'services' | 'search' | 'mappick'>('services');
  const [activeField, setActiveField] = useState<Field>('destination');
  // Centre courant de la carte pendant le choix sur carte (suivi via le webview).
  const [pinCenter, setPinCenter] = useState(DAKAR_CENTER);
  const [departureName, setDepartureName] = useState('Ma position actuelle');
  const [departureQuery, setDepartureQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [kbHeight, setKbHeight] = useState(0);

  // Paramètres reçus quand configure renvoie ici pour éditer l'itinéraire.
  const editParams = useLocalSearchParams<{ editTs?: string; editDeparture?: string; editDest?: string }>();

  useEffect(() => {
    const id = ty.addListener(({ value }) => { tyValue.current = value; });
    return () => ty.removeListener(id);
  }, []);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => setKbHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKbHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(ty, { toValue: TY_DEFAULT, ...SPRING, useNativeDriver: false }),
      Animated.timing(fade, { toValue: 1, duration: 360, useNativeDriver: false }),
      Animated.timing(controlsFade, { toValue: 1, duration: 480, delay: 120, useNativeDriver: false }),
    ]).start();
  }, []);

  // Le ressort REPART à la vitesse exacte du doigt (continuité de vélocité) —
  // supprime le micro-arrêt au lâcher. Réglage vif et légèrement sous-amorti
  // (ratio ≈ 0,66) : settle rapide + petit dépassement qu'on PERÇOIT.
  const snapTo = (target: number, vy = 0) => {
    Animated.spring(ty, {
      toValue: target,
      velocity: vy * 1000, // vy gesture en px/ms → Animated en px/s
      ...SPRING,
      restDisplacementThreshold: 0.3,
      restSpeedThreshold: 0.3,
      useNativeDriver: false,
    }).start();
  };

  const resetSearch = () => {
    setActiveField('destination');
    setDepartureQuery('');
    setDestinationQuery('');
  };

  // Édition depuis configure : ouvre la recherche avec Départ/Arrivée préremplis.
  // `editTs` change à chaque appel pour re-déclencher l'effet à chaque édition.
  useEffect(() => {
    if (!editParams.editTs) return;
    if (editParams.editDeparture) setDepartureName(editParams.editDeparture);
    setDestinationQuery(editParams.editDest ?? '');
    setActiveField('destination');
    setMode('search');
    snapTo(TY_EXPANDED);
  }, [editParams.editTs]);

  // La tuile Transport se comporte comme la barre de recherche d'InDrive :
  // le sheet déjà présent monte en plein écran et bascule en mode recherche.
  const openSearch = () => {
    Haptics.selectionAsync();
    setMode('search');
    snapTo(TY_EXPANDED);
  };

  const closeSearch = () => {
    Keyboard.dismiss();
    resetSearch();
    setMode('services');
    snapTo(TY_DEFAULT);
  };

  const goToConfigure = (place: Place) => {
    Keyboard.dismiss();
    // Un Back/close depuis configure ramène à la page principale (grille de
    // services) : on réinitialise l'accueil avant de pousser configure.
    resetSearch();
    setMode('services');
    snapTo(TY_DEFAULT);
    openConfigure(place, departureName);
  };

  // Refs pour que le PanResponder (créé une seule fois) lise l'état courant.
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const actions = useRef({ closeSearch, snapTo });
  actions.current = { closeSearch, snapTo };

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
    onPanResponderGrant: () => { dragOffset.current = tyValue.current; },
    onPanResponderMove: (_, g) => {
      // Suit le doigt au 1:1 dans les bornes ; résiste (rubber-band) au-delà.
      let next = dragOffset.current + g.dy;
      if (next < TY_EXPANDED) next = TY_EXPANDED - (TY_EXPANDED - next) * RUBBER;
      else if (next > TY_COLLAPSED) next = TY_COLLAPSED + (next - TY_COLLAPSED) * RUBBER;
      ty.setValue(next);
    },
    onPanResponderRelease: (_, g) => {
      const v = g.vy; // px/ms (signe + = vers le bas)
      // En mode recherche : glisser vers le bas ferme la recherche.
      if (modeRef.current === 'search') {
        if (g.dy > 80 || v > 0.5) actions.current.closeSearch();
        else actions.current.snapTo(TY_EXPANDED, v);
        return;
      }
      // Tap sur l'en-tête : bascule entre replié et état par défaut.
      if (Math.abs(g.dy) < TAP_THRESHOLD && Math.abs(g.dx) < TAP_THRESHOLD) {
        const mid = (TY_DEFAULT + TY_COLLAPSED) / 2;
        actions.current.snapTo(tyValue.current >= mid ? TY_DEFAULT : TY_COLLAPSED);
        return;
      }
      // Flick franc → cran suivant dans la direction ; drag lent → cran le plus
      // proche (légère projection). La vélocité est transmise au ressort.
      const pos = tyValue.current;
      let target: number;
      if (v < -FLICK_V) target = snapAbove(pos);
      else if (v > FLICK_V) target = snapBelow(pos);
      else target = nearestSnap(pos + v * 120);
      actions.current.snapTo(target, v);
    },
  })).current;

  // Voile : carte assombrie à mesure que la feuille monte (collapsed→0,
  // default/medium léger, expanded/full marqué). Nul quand la feuille est
  // escamotée (mappick, ty ≈ SCREEN_H → clamp à 0).
  const scrimOpacity = ty.interpolate({
    inputRange: [TY_EXPANDED, TY_DEFAULT, TY_COLLAPSED],
    outputRange: [0.58, 0.38, 0],
    extrapolate: 'clamp',
  });

  const [transport, livraison, location, assistance] = SERVICES;

  const onService = (s: Service) => {
    if (!s.active) return;
    openSearch();
  };

  // Animation d'entrée « les véhicules arrivent en roulant et se garent » : chaque
  // illustration glisse depuis le côté (selon son sens) puis décélère (ressort).
  // Rejouée à chaque fois que la vue services (re)devient active — focus de
  // l'écran (premier lancement, retour de navigation, retour après absence) ou
  // retour au mode services depuis la recherche.
  const driveAnims = useRef(SERVICES.map(() => new Animated.Value(0))).current;
  // Sens d'arrivée par service : auto/scooter roulent vers la droite (entrent
  // par la gauche, dx<0) ; clé et dépanneuse (miroir) entrent par la droite.
  const DRIVE_DX = [-96, -96, 64, 96];
  const playDriveIn = useCallback(() => {
    driveAnims.forEach((a) => a.setValue(0));
    Animated.stagger(
      90,
      driveAnims.map((a) =>
        Animated.spring(a, { toValue: 1, useNativeDriver: true, damping: 15, stiffness: 110, mass: 1 }),
      ),
    ).start();
  }, [driveAnims]);

  useFocusEffect(
    useCallback(() => {
      if (mode === 'services') playDriveIn();
    }, [mode, playDriveIn]),
  );

  // --- Résultats de recherche : une seule liste qui suit la saisie du champ
  //     actif. Vide → lieux enregistrés + récents ; en train de saisir →
  //     correspondances filtrées. Plus d'onglets.
  const query = activeField === 'departure' ? departureQuery : destinationQuery;
  const matches = (text: string) => text.toLowerCase().includes(query.trim().toLowerCase());
  const searching = query.trim().length > 0;

  const results: ResultRow[] = searching
    ? SUGGESTIONS
        .filter((s) => matches(s.name) || matches(s.detail))
        .map((s) => ({ key: s.id, icon: 'location', title: s.name, subtitle: s.detail, place: s }))
    : [
        ...SAVED_PLACES.map((s) => ({
          key: s.id,
          icon: (s.kind === 'home' ? 'home' : 'work') as IconName,
          accent: true,
          title: s.label,
          subtitle: s.detail,
          place: { name: s.label, detail: s.detail, lat: s.lat, lng: s.lng },
        })),
        ...RECENT_PLACES.map((r) => ({
          key: r.id, icon: 'clock' as IconName, title: r.name, subtitle: r.detail, place: r,
        })),
      ];

  const handleSelect = (place: Place) => {
    Haptics.selectionAsync();
    if (activeField === 'departure') {
      setDepartureName(place.name);
      setDepartureQuery('');
      setActiveField('destination');
    } else {
      goToConfigure(place);
    }
  };

  // --- Choix d'un point sur la carte (in-place) ---
  // Faute de géocodage inverse dans le proto, on rattache le pin au lieu connu
  // le plus proche (distance euclidienne sur lat/lng — suffisant à l'échelle ville).
  const nearestPlace = (c: { lat: number; lng: number }) =>
    SUGGESTIONS.reduce((best, s) => {
      const d = (s.lat - c.lat) ** 2 + (s.lng - c.lng) ** 2;
      const bd = (best.lat - c.lat) ** 2 + (best.lng - c.lng) ** 2;
      return d < bd ? s : best;
    }, SUGGESTIONS[0]);
  const pinPlace = nearestPlace(pinCenter);

  const openMapPick = () => {
    Haptics.selectionAsync();
    Keyboard.dismiss();
    setMode('mappick');
    snapTo(SCREEN_H); // escamote le sheet : la carte occupe l'écran
  };

  const cancelMapPick = () => {
    setMode('search');
    snapTo(TY_EXPANDED);
  };

  const confirmMapPick = () => {
    Haptics.selectionAsync();
    const place: Place = { name: pinPlace.name, detail: pinPlace.detail, ...pinCenter };
    if (activeField === 'departure') {
      // Départ validé : on revient à la recherche pour saisir l'arrivée.
      setDepartureName(place.name);
      setDepartureQuery('');
      setActiveField('destination');
      setMode('search');
      snapTo(TY_EXPANDED);
    } else {
      // Arrivée validée : départ + arrivée prêts → étape suivante (configure).
      goToConfigure(place);
    }
  };

  return (
    <View style={styles.container}>
      <LeafletMap
        ref={mapRef}
        center={DAKAR_CENTER}
        zoom={14}
        markers={[{ lat: DAKAR_CENTER.lat, lng: DAKAR_CENTER.lng, type: 'user', heading: 25 }]}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        tintWater
        onCenterChange={mode === 'mappick' ? setPinCenter : undefined}
        style={styles.map}
      />

      {/* Voile : assombrit la carte quand la feuille monte */}
      <Scrim opacity={scrimOpacity} />

      {/* Menu — single control over the map; profile & account live inside it */}
      {mode !== 'mappick' && (
        <Animated.View
          style={[styles.topRow, { paddingTop: insets.top + 8, opacity: controlsFade }]}
          pointerEvents="box-none"
        >
          <IconButton name="menu" />
        </Animated.View>
      )}

      {/* Choix d'un point sur la carte : pin fixe au centre, carte mobile dessous */}
      {mode === 'mappick' && (
        <>
          {/* Pin fixe — décalé pour que la pointe vise le centre exact */}
          <View pointerEvents="none" style={styles.pinWrap}>
            <View style={styles.pinIcon}>
              <Icon name="pin" size={44} color={Colors.primary} weight="fill" />
            </View>
            <View style={styles.pinDot} />
          </View>

          {/* Retour vers la recherche */}
          <View style={[styles.topRow, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
            <IconButton name="back" onPress={cancelMapPick} />
          </View>

          {/* Recentrage géoloc + carte de confirmation, ancrés en bas */}
          <View style={styles.pickDock} pointerEvents="box-none">
            <View style={styles.recenterPick}>
              <IconButton name="navigate" onPress={() => mapRef.current?.recenter(DAKAR_CENTER, 15)} />
            </View>
            <View style={[styles.pickCard, { paddingBottom: insets.bottom + 16 }]}>
              <Text variant="caption" color={Colors.textTertiary} style={styles.pickKicker}>
                {activeField === 'departure' ? 'Point de départ' : 'Destination'}
              </Text>
              <View style={styles.pickRow}>
                <Icon name="location" size={22} color={Colors.primary} />
                <View style={styles.flex1}>
                  <Text variant="label" numberOfLines={1}>{pinPlace.name}</Text>
                  <Text variant="caption" color={Colors.textSecondary} numberOfLines={1}>{pinPlace.detail}</Text>
                </View>
              </View>
              <Button label="Confirmer" onPress={confirmMapPick} />
            </View>
          </View>
        </>
      )}

      {/* Draggable bottom sheet — full height, anchored to screen bottom */}
      <Animated.View style={[sheetSurface, styles.sheet, { transform: [{ translateY: ty }], opacity: fade }]}>
        {mode === 'search' ? (
          <View style={[styles.searchWrap, { height: SEARCH_H }]}>
            {/* Poignée déplaçable — glisser vers le bas ferme la recherche */}
            <View {...panResponder.panHandlers} style={styles.searchHandleArea}>
              <Handle />
            </View>

            <SheetHeader title="Indiquer votre itinéraire" onClose={closeSearch} />

            {/* Champ « De » — icône personne (le passager) + géoloc si actif */}
            <TouchableOpacity
              style={[styles.field, activeField === 'departure' && styles.fieldActive]}
              activeOpacity={0.85}
              onPress={() => setActiveField('departure')}
            >
              <View style={styles.fieldIcon}>
                <Icon name="walk" size={22} color={Colors.textSecondary} />
              </View>
              <View style={styles.fieldBody}>
                <Text variant="caption" color={Colors.textTertiary}>De</Text>
                {activeField === 'departure' ? (
                  <TextInput
                    style={styles.fieldInput}
                    value={departureQuery}
                    onChangeText={setDepartureQuery}
                    placeholder="Saisir un point de départ…"
                    placeholderTextColor={Colors.textTertiary}
                    autoFocus
                  />
                ) : (
                  <Text variant="body" style={styles.fieldValue} numberOfLines={1}>{departureName}</Text>
                )}
              </View>
              {activeField === 'departure' && (
                <TouchableOpacity style={styles.fieldBtn} onPress={openMapPick} activeOpacity={0.85}>
                  <Icon name="pin" size={20} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {/* Champ « À » — géoloc si actif */}
            <View style={[styles.field, styles.fieldA, activeField === 'destination' && styles.fieldActive]}>
              <View style={styles.fieldIcon}>
                <Icon name="search" size={20} color={Colors.textSecondary} />
              </View>
              <View style={styles.fieldBody}>
                <Text variant="caption" color={Colors.textTertiary}>À</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={destinationQuery}
                  onFocus={() => setActiveField('destination')}
                  onChangeText={setDestinationQuery}
                  placeholder="Où allez-vous ?"
                  placeholderTextColor={Colors.textTertiary}
                  autoFocus={activeField === 'destination'}
                />
              </View>
              {activeField === 'destination' && (
                <TouchableOpacity style={styles.fieldBtn} onPress={openMapPick} activeOpacity={0.85}>
                  <Icon name="pin" size={20} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Résultats — une seule liste, suit la saisie du champ actif */}
            <FlatList
              data={results}
              keyExtractor={(item) => item.key}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: kbHeight + insets.bottom + 16, paddingTop: 8 }}
              renderItem={({ item }) => (
                <PlaceRow
                  icon={item.icon}
                  accent={item.accent}
                  title={item.title}
                  subtitle={item.subtitle}
                  onPress={() => handleSelect(item.place)}
                />
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        ) : mode === 'services' ? (
          <>
            {/* Recenter floats just above the sheet, over the map */}
            <Animated.View style={[styles.recenterWrap, { opacity: controlsFade }]}>
              <IconButton name="navigate" onPress={() => mapRef.current?.recenter(DAKAR_CENTER, 15)} />
            </Animated.View>

            {/* Draggable header */}
            <View {...panResponder.panHandlers} style={styles.sheetHeader}>
              <Handle style={styles.handle} />
              <Text variant="heading1" style={styles.heading}>Que voulez-vous faire ?</Text>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.sheetContent, { paddingBottom: insets.bottom + 28 }]}
            >
              {/* Bento service grid */}
              <View style={styles.grid}>
                <ServiceCard service={transport} variant="hero" onPress={() => onService(transport)}
                  driveAnim={driveAnims[0]} dx={DRIVE_DX[0]} />
                <View style={styles.rightCol}>
                  <ServiceCard service={livraison} variant="small" onPress={() => onService(livraison)}
                    driveAnim={driveAnims[1]} dx={DRIVE_DX[1]} />
                  <ServiceCard service={location} variant="small" onPress={() => onService(location)}
                    driveAnim={driveAnims[2]} dx={DRIVE_DX[2]} />
                </View>
              </View>
              <ServiceCard service={assistance} variant="wide" onPress={() => onService(assistance)}
                driveAnim={driveAnims[3]} dx={DRIVE_DX[3]} />

              {/* Recents */}
              <Text variant="caption" color={Colors.textTertiary} style={styles.sectionLabel}>Récemment</Text>
              {RECENTS.map((r) => (
                <PlaceRow
                  key={r.name}
                  icon="clock"
                  title={r.name}
                  subtitle={r.detail}
                  trailing="chevronRight"
                  onPress={() => openConfigure(r, departureName)}
                />
              ))}
            </ScrollView>
          </>
        ) : null}
      </Animated.View>
    </View>
  );
}

const CARD_GAP = 12;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  map: { flex: 1 },

  topRow: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  sheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: SCREEN_H,
  },
  recenterWrap: {
    position: 'absolute',
    top: -60,
    right: 16,
  },
  sheetHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    marginBottom: 14,
  },
  heading: {
    letterSpacing: -0.4,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  grid: {
    flexDirection: 'row',
    gap: CARD_GAP,
    alignItems: 'stretch',
  },
  rightCol: {
    flex: 1,
    gap: CARD_GAP,
  },
  flex1: { flex: 1 },
  // Carte service : fond gris clair + liseré ténu, coins très arrondis (maquette).
  card: {
    borderRadius: 20,
    padding: 6,
    backgroundColor: '#F2F3F5',
    borderWidth: 1,
    borderColor: 'rgba(242, 243, 245, 0.5)',
  },
  cardHero: {
    flex: 1,
    gap: 10,
  },
  cardSmall: {
    width: '100%',
    gap: 8,
  },
  cardWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: CARD_GAP,
    paddingLeft: 6,
    paddingRight: 14,
    paddingVertical: 6,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    padding: 8,
  },
  cardHeaderText: { flex: 1 },
  cardTagline: { marginTop: 3 },

  // Panneau illustré : fond blanc, illustration centrée qui déborde (clipée).
  illoPanel: {
    width: '100%',
    borderRadius: Radii.lg,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  illoPanelHero: { flex: 1 },
  illoPanelSmall: { width: '100%', height: 104 },
  // Bande bleue diagonale (« rampe ») derrière l'illustration : grand carré
  // translucide pivoté (géométrie injectée par service), clipé par le panneau →
  // une seule arête diagonale visible.
  band: {
    position: 'absolute',
    backgroundColor: BAND_COLOR,
  },
  // Miroir horizontal pour la dépanneuse (Assistance) : elle « regarde » vers le texte.
  mirror: { transform: [{ scaleX: -1 }] },
  // Tuile carrée blanche de la carte Assistance (reçoit la bande + dépanneuse).
  wideTile: {
    width: 64, height: 64,
    borderRadius: Radii.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 24,
    marginBottom: 8,
  },

  // --- Mode recherche (morph in-place du sheet) ---
  searchWrap: {
    paddingHorizontal: 20,
  },
  searchHandleArea: {
    paddingTop: 10,
    paddingBottom: 12,
    alignItems: 'center',
  },
  // Champs De / À — coins arrondis (registre bouton, sans aller jusqu'au pill).
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.bg,
    borderRadius: Radii.lg,
    paddingLeft: 16,
    paddingRight: 8,
    minHeight: 60,
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginBottom: 12,
  },
  fieldA: { marginBottom: 4 },
  fieldIcon: { width: 28, alignItems: 'center' },
  fieldBody: { flex: 1, paddingVertical: 10 },
  fieldValue: { marginTop: 1, fontFamily: Poppins.medium },
  fieldInput: { fontSize: 15, color: Colors.textPrimary, fontFamily: Poppins.medium, marginTop: 1, padding: 0 },
  fieldActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },

  // Bouton « Choisir sur la carte », présent à droite du champ actif.
  fieldBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  separator: { height: 1, backgroundColor: Colors.borderSubtle, marginLeft: 56 },

  // --- Choix sur carte (overlay) ---
  pinWrap: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinIcon: { marginBottom: 44 }, // remonte la pointe du pin sur le centre exact
  pinDot: {
    position: 'absolute',
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: 'rgba(17, 24, 39, 0.25)',
  },
  pickDock: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
  },
  recenterPick: {
    alignSelf: 'flex-end',
    marginRight: 16,
    marginBottom: 12,
  },
  pickCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 14,
    ...Shadows.sheet,
  },
  pickKicker: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
