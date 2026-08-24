import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Animated, ScrollView,
  PanResponder, Dimensions, TextInput, FlatList, Keyboard, Image,
  Easing, AccessibilityInfo, type EasingFunction,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import HandWithCash from '@/components/HandWithCash';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import LeafletMap, { LeafletMapHandle } from '@/components/LeafletMap';
import MenuDrawer from '@/components/MenuDrawer';
import IconButton from '@/components/IconButton';
import ListRow from '@/components/ListRow';
import Medallion from '@/components/Medallion';
import Button from '@/components/Button';
import Scrim from '@/components/Scrim';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import { Handle, SheetHeader, sheetSurface } from '@/components/Sheet';
import { useSnapSheet, SHEET_SPRING } from '@/hooks/useSnapSheet';
import { Colors, Radii, Shadows, inputTypo, Strokes } from '@/constants/tokens';
import { DAKAR_CENTER, SUGGESTIONS, RECENT_PLACES } from '@/constants/data';
import { usePlaces } from '@/stores/places';

type Place = { name: string; detail: string; lat: number; lng: number };
type Field = 'departure' | 'destination';
type ResultRow = { key: string; icon: IconName; accent?: boolean; title: string; subtitle?: string; place: Place };

const RECENTS: Place[] = [SUGGESTIONS[2], SUGGESTIONS[0]]; // Almadies, Aéroport AIBD

const SCREEN_H = Dimensions.get('window').height;
// Crans exprimés en translateY de la feuille (0 = couvre tout l'écran).
// translateY plus grand = plus bas / plus replié. La mécanique de drag/snap est
// dans le primitif partagé `useSnapSheet` (même logique côté course active).
const PEEK_VISIBLE = 140;                       // façon Waze : seuls poignée + titre dépassent
const TY_EXPANDED = Math.round(SCREEN_H * 0.08); // quasi plein écran
const TY_DEFAULT = Math.round(SCREEN_H * 0.40);  // services visibles
const TY_COLLAPSED = SCREEN_H - PEEK_VISIBLE;    // replié en bas
const SNAPS = [TY_EXPANDED, TY_DEFAULT, TY_COLLAPSED]; // croissant : haut → bas
const TAP_THRESHOLD = 6;
// Hauteur visible du sheet une fois étendu : borne le contenu de recherche
// pour que la liste scrolle dans l'écran (le sheet fait toute la hauteur).
const SEARCH_H = SCREEN_H - TY_EXPANDED;

type Service = {
  id: SearchService;
  label: string;
  /** Phrase de pied de tuile, sous l'illustration. */
  blurb: string;
};

// Seuls les deux services ouverts sont annoncés (maquette du 16 août 2026) :
// Location et Assistance ne sont pas lancés, ils ne figurent plus sur l'accueil.
const SERVICES: Service[] = [
  { id: 'transport', label: 'Course',    blurb: 'Rendez vous rapidement à votre destination.' },
  { id: 'livraison', label: 'Livraison', blurb: 'Faites vous livré, aussi vite que possible.' },
];

// Services dont la recherche d'itinéraire est câblée. La même feuille de
// recherche sert les deux : seuls les libellés et l'écran de configuration
// d'arrivée changent (Transport → course, Livraison → colis).
type SearchService = 'transport' | 'livraison';
const SEARCH_COPY: Record<SearchService, {
  title: string; fromLabel: string; toLabel: string;
  fromPlaceholder: string; toPlaceholder: string;
  pickFrom: string; pickTo: string;
}> = {
  transport: {
    title: 'Indiquer votre itinéraire',
    fromLabel: 'De', toLabel: 'À',
    fromPlaceholder: 'Saisir un point de départ…', toPlaceholder: 'Où allez-vous ?',
    pickFrom: 'Point de départ', pickTo: 'Destination',
  },
  livraison: {
    title: 'Envoyer un colis',
    fromLabel: 'Collecte', toLabel: 'Livraison',
    fromPlaceholder: 'Adresse de collecte…', toPlaceholder: 'Où livrer votre colis ?',
    pickFrom: 'Point de collecte', pickTo: 'Adresse de livraison',
  },
};

// Géométrie du panneau illustré, relevée EXACTEMENT sur la maquette
// (node 336:1175). La tuile fait 328 de haut : 6 + en-tête 39 + 10 + panneau 217
// + 10 + pied 40 + 6.
const CARD_H = 328;

// Feuille décorative posée derrière les véhicules : une forme unique, pivotée,
// centrée dans une boîte de 154.624. Remplace la bande bleue diagonale.
const LEAF_PATH = 'M44.2062 20.6341C74.0014 6.73435 134.078 -13.91 133.47 13.4098C133.004 34.3277 110.859 90.7533 51.8918 124.281C-24.408 167.664 -7.4579 44.7359 44.2062 20.6341Z';
const LEAF_SIZE = 133.474;
const LEAF_BOX = 154.624;
const LEAF_TOP = 86;
const LEAF_ROTATE = '80deg';
const LEAF_OPACITY = 0.6;

// --- Motion (Figma Motion, timeline de 2 s relevée sur la frame 357:1685) ---
// Les trois courbes employées par la maquette, reprises telles quelles.
const EASE_QUART = Easing.bezier(0.25, 1, 0.5, 1);   // sorties douces
const EASE_BACK = Easing.bezier(0.34, 1.56, 0.64, 1); // léger dépassement
const EASE_QUINT = Easing.bezier(0.22, 1, 0.36, 1);   // traînées

// L'habillage de la tuile (en-tête, feuille, pied) s'anime à l'identique sur les
// deux services : une seule définition, réutilisée.
const CHROME = {
  headOpacity: { delay: 400, dur: 250, ease: EASE_QUART },
  headShift: { delay: 400, dur: 250, ease: EASE_BACK, from: -10 },
  leaf: { delay: 500, dur: 400, ease: EASE_QUART, fromX: 12 },
  footOpacity: { delay: 600, dur: 250, ease: EASE_QUART },
  footShift: { delay: 600, dur: 250, ease: EASE_BACK, from: 10 },
};

// Chaque véhicule est un cadre de découpe (`frame`) dans lequel l'image déborde
// (`img`) : Figma recadre l'illustration, on reproduit le même cadrage plutôt que
// de la contenir. Les calques fantômes sont des PNG déjà désaturés — React Native
// n'a pas de `mix-blend-mode`, et sur fond blanc un mélange « luminosity » revient
// exactement à un gris posé à la même opacité.
const GHOST_MOTO = require('@/assets/home-ghost-moto.png');
const GHOST_AUTO = require('@/assets/home-ghost-auto.png');

// Un palier d'opacité : la valeur visée et la durée pour l'atteindre.
type Seg = { to: number; dur: number; ease: EasingFunction };
type ArtLayer = {
  src: ReturnType<typeof require>;
  frame: { x: number; y: number; w: number; h: number };
  img: { x: number; y: number; w: number; h: number };
  /** Opacité au premier keyframe, puis les paliers successifs (le dernier = repos). */
  opFrom: number;
  opSegs: Seg[];
  /** Arrivée du véhicule : décalage et échelle de départ, fenêtre et courbe. */
  enter: { dx: number; dy: number; scale: number; dur: number; ease: EasingFunction };
};
type ServiceArt = { leafLeft: number; layers: ArtLayer[] };

// Les traînées entrent de plus en plus tard et s'éteignent en se posant ; le
// véhicule de tête arrive en dernier, avec un léger dépassement d'échelle.
const ENTER_FROM = { dx: -55, dy: -150 };

const SERVICE_ART: Record<SearchService, ServiceArt> = {
  // Course : deux traînées (moto, puis berline) derrière la voiture de tête.
  transport: {
    leafLeft: 19,
    layers: [
      { src: GHOST_MOTO,
        frame: { x: 7, y: 22, w: 111, h: 92 },
        img: { x: 0, y: -46.52, w: 111, h: 138.25 },
        opFrom: 0.45,
        opSegs: [{ to: 0.35, dur: 350, ease: EASE_QUINT }, { to: 0.1, dur: 350, ease: EASE_QUART }],
        enter: { ...ENTER_FROM, scale: 1, dur: 500, ease: EASE_QUINT } },
      { src: GHOST_AUTO,
        frame: { x: 19, y: 52, w: 111, h: 89 },
        img: { x: -5.55, y: -12.24, w: 119.88, h: 120.15 },
        opFrom: 0.5,
        opSegs: [{ to: 0.45, dur: 450, ease: EASE_QUINT }, { to: 0.3, dur: 400, ease: EASE_QUART }],
        enter: { ...ENTER_FROM, scale: 1, dur: 650, ease: EASE_QUINT } },
      { src: require('@/assets/home-auto.png'),
        frame: { x: 31, y: 88, w: 111, h: 88 },
        img: { x: -16.05, y: -24, w: 144.43, h: 144 },
        opFrom: 0,
        opSegs: [{ to: 1, dur: 150, ease: EASE_QUINT }],
        enter: { ...ENTER_FROM, scale: 0.88, dur: 800, ease: EASE_BACK } },
    ],
  },
  // Livraison : une traînée moto derrière le vélo de tête.
  livraison: {
    leafLeft: 19.5,
    layers: [
      { src: GHOST_MOTO,
        frame: { x: 12.5, y: 36, w: 111.184, h: 91.848 },
        img: { x: 0, y: -46.45, w: 111.184, h: 138.03 },
        opFrom: 0.5,
        opSegs: [{ to: 0.45, dur: 400, ease: EASE_QUINT }, { to: 0.3, dur: 350, ease: EASE_QUART }],
        enter: { ...ENTER_FROM, scale: 1, dur: 550, ease: EASE_QUINT } },
      { src: require('@/assets/home-velo.png'),
        frame: { x: 24.684, y: 58.157, w: 111.141, h: 123.843 },
        img: { x: -5.48, y: -55.32, w: 120.74, h: 177.81 },
        opFrom: 0,
        opSegs: [{ to: 1, dur: 150, ease: EASE_QUINT }],
        enter: { ...ENTER_FROM, scale: 0.88, dur: 800, ease: EASE_BACK } },
    ],
  },
};

/** Valeurs animées d'une tuile : l'habillage + une paire par calque de véhicule. */
type CardAnim = {
  headOpacity: Animated.Value; headShift: Animated.Value;
  leaf: Animated.Value;
  footOpacity: Animated.Value; footShift: Animated.Value;
  layers: { op: Animated.Value; en: Animated.Value }[];
};

function makeCardAnim(layerCount: number): CardAnim {
  return {
    headOpacity: new Animated.Value(0), headShift: new Animated.Value(0),
    leaf: new Animated.Value(0),
    footOpacity: new Animated.Value(0), footShift: new Animated.Value(0),
    layers: Array.from({ length: layerCount }, () => ({
      op: new Animated.Value(0), en: new Animated.Value(0),
    })),
  };
}

const step = (v: Animated.Value, toValue: number, s: { delay?: number; dur: number; ease: EasingFunction }) =>
  Animated.sequence([
    Animated.delay(s.delay ?? 0),
    Animated.timing(v, { toValue, duration: s.dur, easing: s.ease, useNativeDriver: true }),
  ]);

/** Rejoue toute la timeline de la tuile depuis le début. */
function cardTimeline(art: ServiceArt, a: CardAnim) {
  const tracks: Animated.CompositeAnimation[] = [
    step(a.headOpacity, 1, CHROME.headOpacity),
    step(a.headShift, 1, CHROME.headShift),
    step(a.leaf, 1, CHROME.leaf),
    step(a.footOpacity, 1, CHROME.footOpacity),
    step(a.footShift, 1, CHROME.footShift),
  ];
  art.layers.forEach((layer, i) => {
    const { op, en } = a.layers[i];
    // Chaque palier d'opacité fait avancer la valeur d'un cran : 0 → 1 → 2…
    tracks.push(Animated.sequence(
      layer.opSegs.map((s, j) => Animated.timing(op, {
        toValue: j + 1, duration: s.dur, easing: s.ease, useNativeDriver: true,
      })),
    ));
    tracks.push(step(en, 1, layer.enter));
  });
  return Animated.parallel(tracks);
}

/** Pose la tuile à son état de repos, sans jouer l'animation. */
function settleCard(art: ServiceArt, a: CardAnim) {
  [a.headOpacity, a.headShift, a.leaf, a.footOpacity, a.footShift].forEach(v => v.setValue(1));
  art.layers.forEach((layer, i) => {
    a.layers[i].op.setValue(layer.opSegs.length);
    a.layers[i].en.setValue(1);
  });
}

function resetCard(art: ServiceArt, a: CardAnim) {
  [a.headOpacity, a.headShift, a.leaf, a.footOpacity, a.footShift].forEach(v => v.setValue(0));
  art.layers.forEach((_, i) => {
    a.layers[i].op.setValue(0);
    a.layers[i].en.setValue(0);
  });
}

function openConfigure(service: SearchService, place: Place, departureName: string) {
  router.push({
    pathname: service === 'livraison' ? '/livraison/configure' : '/transport/configure',
    params: {
      departureName,
      destName: place.name,
      destDetail: place.detail,
      destLat: place.lat,
      destLng: place.lng,
    },
  });
}

// Panneau illustré : fond blanc, feuille décorative, puis les véhicules empilés
// du plus lointain au plus proche. Chaque calque a sa propre entrée — les
// traînées arrivent avant le véhicule de tête et s'estompent en se posant, ce
// qui donne l'impression d'un sillage plutôt que d'un bloc qui glisse.
function IlloPanel({ art, anim }: { art: ServiceArt; anim: CardAnim }) {
  return (
    <View style={styles.illoPanel}>
      <Animated.View
        style={[styles.leafBox, {
          left: art.leafLeft,
          opacity: anim.leaf.interpolate({ inputRange: [0, 1], outputRange: [0, LEAF_OPACITY] }),
          transform: [{ translateX: anim.leaf.interpolate({ inputRange: [0, 1], outputRange: [CHROME.leaf.fromX, 0] }) }],
        }]}
        pointerEvents="none"
      >
        <Svg
          width={LEAF_SIZE}
          height={LEAF_SIZE}
          viewBox={`0 0 ${LEAF_SIZE} ${LEAF_SIZE}`}
          style={styles.leafRotate}
        >
          <Path d={LEAF_PATH} fill={Colors.track} fillRule="evenodd" />
        </Svg>
      </Animated.View>

      {art.layers.map((layer, i) => {
        const { op, en } = anim.layers[i];
        return (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={[styles.layerFrame, {
              left: layer.frame.x, top: layer.frame.y,
              width: layer.frame.w, height: layer.frame.h,
              opacity: op.interpolate({
                inputRange: layer.opSegs.map((_, j) => j).concat(layer.opSegs.length),
                outputRange: [layer.opFrom, ...layer.opSegs.map(s => s.to)],
              }),
              transform: [
                { translateX: en.interpolate({ inputRange: [0, 1], outputRange: [layer.enter.dx, 0] }) },
                { translateY: en.interpolate({ inputRange: [0, 1], outputRange: [layer.enter.dy, 0] }) },
                { scale: en.interpolate({ inputRange: [0, 1], outputRange: [layer.enter.scale, 1] }) },
              ],
            }]}
          >
            <Image
              source={layer.src}
              style={{
                position: 'absolute',
                left: layer.img.x, top: layer.img.y,
                width: layer.img.w, height: layer.img.h,
              }}
              resizeMode="stretch"
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

// Bannière Affilié Réseau, en tête de feuille. La pastille de fermeture déborde
// du coin haut-droit : elle est posée à côté de la carte, pas dedans, car un
// enfant qui dépasse d'une vue à coins arrondis se fait rogner sur Android.
function AffiliePromo({ onPress, onDismiss }: { onPress: () => void; onDismiss: () => void }) {
  return (
    <View style={styles.promoWrap}>
      <TouchableOpacity style={styles.promoCard} activeOpacity={0.9} onPress={onPress}>
        <View style={styles.promoTile}>
          {/* Illustration 52 × 64 pivotée de 30°, centrée sur (25.52 ; 40.71). */}
          <View style={styles.promoIllo}>
            <HandWithCash width={52} />
          </View>
        </View>
        <View style={styles.promoText}>
          <Text variant="bodyMedium">Gagnez de l’argent avec Fiw !</Text>
          <Text variant="body" color={Colors.textSecondary} style={styles.promoSubtitle}>
            Et si vous deveniez un affilié réseau ?
          </Text>
        </View>
        <Icon name="chevronRight" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.promoClose}
        activeOpacity={0.85}
        onPress={onDismiss}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Icon name="close" size={18} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

// Tuile de service : titre + chevron, panneau illustré, phrase en pied.
// L'en-tête descend, le pied remonte, les deux en fondu — comme la maquette.
function ServiceCard({ service, onPress, anim }: {
  service: Service;
  onPress: () => void;
  anim: CardAnim;
}) {
  const art = SERVICE_ART[service.id];
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <Animated.View
        style={[styles.cardHeader, {
          opacity: anim.headOpacity,
          transform: [{ translateY: anim.headShift.interpolate({ inputRange: [0, 1], outputRange: [CHROME.headShift.from, 0] }) }],
        }]}
      >
        <Text variant="heading2" style={styles.flex1} numberOfLines={1}>{service.label}</Text>
        <Icon name="chevronRight" size={18} color={Colors.textTertiary} />
      </Animated.View>
      <IlloPanel art={art} anim={anim} />
      <Animated.View
        style={[styles.cardFooter, {
          opacity: anim.footOpacity,
          transform: [{ translateY: anim.footShift.interpolate({ inputRange: [0, 1], outputRange: [CHROME.footShift.from, 0] }) }],
        }]}
      >
        <Text variant="bodySmall" style={styles.cardBlurb} numberOfLines={2}>
          {service.blurb}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<LeafletMapHandle>(null);

  // Feuille à 3 crans — primitif partagé (même logique côté course active).
  // L'accueil garde ses spécificités au lâcher : glisser-fermer en mode recherche
  // et tap sur l'en-tête pour basculer replié ↔ défaut ; le reste (flick, cran le
  // plus proche, rubber-band, continuité de vélocité) est géré par le primitif.
  const { ty, tyValue, snapTo, panHandlers } = useSnapSheet({
    snaps: SNAPS,
    initial: SCREEN_H,
    onRelease: ({ gesture: g, velocity: v, pos, snapTo: st }) => {
      if (modeRef.current === 'search') {
        if (g.dy > 80 || v > 0.5) closeSearch();
        else st(TY_EXPANDED, v);
        return true;
      }
      if (Math.abs(g.dy) < TAP_THRESHOLD && Math.abs(g.dx) < TAP_THRESHOLD) {
        const mid = (TY_DEFAULT + TY_COLLAPSED) / 2;
        st(pos >= mid ? TY_DEFAULT : TY_COLLAPSED);
        return true;
      }
      return false; // → flick / cran le plus proche (défaut du primitif)
    },
  });
  const fade = useRef(new Animated.Value(0)).current;
  const controlsFade = useRef(new Animated.Value(0)).current;

  // Mode de l'écran : grille de services ↔ recherche d'itinéraire (morph
  // in-place) ↔ choix d'un point sur la carte (pin fixe, carte mobile dessous).
  const [menuOpen, setMenuOpen] = useState(false);
  // Bannière Affilié refermée : le proto ne la persiste pas d'un lancement à l'autre.
  const [promoDismissed, setPromoDismissed] = useState(false);
  const [mode, setMode] = useState<'services' | 'search' | 'mappick'>('services');
  // Service porté par la recherche en cours (Transport ou Livraison).
  const [service, setService] = useState<SearchService>('transport');
  const [activeField, setActiveField] = useState<Field>('destination');
  // Centre courant de la carte pendant le choix sur carte (suivi via le webview).
  const [pinCenter, setPinCenter] = useState(DAKAR_CENTER);
  const [departureName, setDepartureName] = useState('Ma position actuelle');
  const [departureQuery, setDepartureQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [kbHeight, setKbHeight] = useState(0);

  // Paramètres reçus quand configure renvoie ici pour éditer l'itinéraire.
  const editParams = useLocalSearchParams<{
    editTs?: string; editDeparture?: string; editDest?: string; editService?: string;
  }>();

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => setKbHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKbHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(ty, { toValue: TY_DEFAULT, ...SHEET_SPRING, useNativeDriver: false }),
      Animated.timing(fade, { toValue: 1, duration: 360, useNativeDriver: false }),
      Animated.timing(controlsFade, { toValue: 1, duration: 480, delay: 120, useNativeDriver: false }),
    ]).start();
  }, []);

  const resetSearch = () => {
    setActiveField('destination');
    setDepartureQuery('');
    setDestinationQuery('');
  };

  // Édition depuis configure : ouvre la recherche avec Départ/Arrivée préremplis.
  // `editTs` change à chaque appel pour re-déclencher l'effet à chaque édition.
  useEffect(() => {
    if (!editParams.editTs) return;
    if (editParams.editService === 'livraison') setService('livraison');
    if (editParams.editDeparture) setDepartureName(editParams.editDeparture);
    setDestinationQuery(editParams.editDest ?? '');
    setActiveField('destination');
    setMode('search');
    snapTo(TY_EXPANDED);
  }, [editParams.editTs]);

  // Les tuiles Transport/Livraison se comportent comme la barre de recherche
  // d'InDrive : le sheet déjà présent monte en plein écran et bascule en mode
  // recherche, aux couleurs du service choisi.
  const openSearch = (svc: SearchService) => {
    Haptics.selectionAsync();
    setService(svc);
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
    openConfigure(service, place, departureName);
  };

  // Le `onRelease` du primitif lit le mode courant via cette ref.
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const menuOpenRef = useRef(menuOpen);
  menuOpenRef.current = menuOpen;
  const openMenu = useRef(() => setMenuOpen(true));

  // Zone de bord gauche : swipe gauche → droite pour ouvrir le drawer.
  const edgePan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, g) =>
      !menuOpenRef.current && g.dx > 10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
    onPanResponderRelease: (_, g) => {
      if (g.dx > 20) openMenu.current();
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

  const [course, livraison] = SERVICES;

  const onService = (s: Service) => openSearch(s.id);

  // Entrée des tuiles (Figma Motion, frame 357:1685) : les traînées arrivent du
  // coin haut-gauche et s'éteignent en se posant, le véhicule de tête suit avec
  // un dépassement d'échelle, puis l'en-tête descend et le pied remonte.
  // Rejouée quand la vue services (re)devient active — focus de l'écran ou
  // retour depuis la recherche. La timeline Figma boucle ; ici elle joue une
  // fois, c'est une animation d'arrivée et non un motif de fond.
  const cardAnims = useRef(SERVICES.map((s) => makeCardAnim(SERVICE_ART[s.id].layers.length))).current;
  const reduceMotion = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((on) => { reduceMotion.current = on; });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (on) => {
      reduceMotion.current = on;
      if (on) SERVICES.forEach((s, i) => settleCard(SERVICE_ART[s.id], cardAnims[i]));
    });
    return () => sub.remove();
  }, [cardAnims]);

  const playCardsIn = useCallback(() => {
    // « Réduire les animations » : on pose les tuiles à leur état final.
    if (reduceMotion.current) {
      SERVICES.forEach((s, i) => settleCard(SERVICE_ART[s.id], cardAnims[i]));
      return;
    }
    SERVICES.forEach((s, i) => {
      const art = SERVICE_ART[s.id];
      resetCard(art, cardAnims[i]);
      cardTimeline(art, cardAnims[i]).start();
    });
  }, [cardAnims]);

  useFocusEffect(
    useCallback(() => {
      if (mode === 'services') playCardsIn();
    }, [mode, playCardsIn]),
  );

  // --- Résultats de recherche : une seule liste qui suit la saisie du champ
  //     actif. Vide → lieux enregistrés + récents ; en train de saisir →
  //     correspondances filtrées. Plus d'onglets.
  // Les lieux viennent du store : ceux que le Client ajoute depuis son compte
  // apparaissent ici sans autre câblage.
  const savedPlaces = usePlaces();
  const query = activeField === 'departure' ? departureQuery : destinationQuery;
  const matches = (text: string) => text.toLowerCase().includes(query.trim().toLowerCase());
  const searching = query.trim().length > 0;

  const results: ResultRow[] = searching
    ? SUGGESTIONS
        .filter((s) => matches(s.name) || matches(s.detail))
        .map((s) => ({ key: s.id, icon: 'location', title: s.name, subtitle: s.detail, place: s }))
    : [
        // Un emplacement vidé de son adresse (Maison après un déménagement) n'a
        // rien à proposer ici — il ne réapparaît qu'une fois rempli.
        ...savedPlaces.filter((s) => s.detail).map((s) => ({
          key: s.id,
          icon: (s.kind === 'home' ? 'home' : s.kind === 'work' ? 'work' : 'location') as IconName,
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
        mapStyle="mapbox://styles/mapbox/light-v11"
        tintWater
        declutter
        onCenterChange={mode === 'mappick' ? setPinCenter : undefined}
        style={styles.map}
      />

      {/* Voile : assombrit la carte quand la feuille monte */}
      <Scrim opacity={scrimOpacity} />

      {/* Zone de bord gauche — swipe vers la droite pour ouvrir le drawer */}
      <View {...edgePan.panHandlers} style={styles.edgeZone} />

      {/* Menu — single control over the map; profile & account live inside it */}
      {mode !== 'mappick' && (
        <Animated.View
          style={[styles.topRow, { paddingTop: insets.top + 8, opacity: controlsFade }]}
          pointerEvents="box-none"
        >
          <IconButton name="menu" onPress={() => setMenuOpen(true)} />
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
                {activeField === 'departure' ? SEARCH_COPY[service].pickFrom : SEARCH_COPY[service].pickTo}
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
            <View {...panHandlers} style={styles.searchHandleArea}>
              <Handle />
            </View>

            <SheetHeader title={SEARCH_COPY[service].title} onClose={closeSearch} />

            {/* Champ « De » — passager (Transport) ou colis (Livraison) + géoloc si actif */}
            <TouchableOpacity
              style={[styles.field, activeField === 'departure' && styles.fieldActive]}
              activeOpacity={0.85}
              onPress={() => setActiveField('departure')}
            >
              <View style={styles.fieldIcon}>
                <Icon name={service === 'livraison' ? 'package' : 'walk'} size={22} color={Colors.textSecondary} />
              </View>
              <View style={styles.fieldBody}>
                <Text variant="caption" color={Colors.textTertiary}>{SEARCH_COPY[service].fromLabel}</Text>
                {activeField === 'departure' ? (
                  <TextInput
                    style={styles.fieldInput}
                    value={departureQuery}
                    onChangeText={setDepartureQuery}
                    placeholder={SEARCH_COPY[service].fromPlaceholder}
                    placeholderTextColor={Colors.textTertiary}
                    autoFocus
                  />
                ) : (
                  <Text variant="bodyMedium" style={styles.fieldValue} numberOfLines={1}>{departureName}</Text>
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
                <Text variant="caption" color={Colors.textTertiary}>{SEARCH_COPY[service].toLabel}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={destinationQuery}
                  onFocus={() => setActiveField('destination')}
                  onChangeText={setDestinationQuery}
                  placeholder={SEARCH_COPY[service].toPlaceholder}
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
                <ListRow
                  leading={<Medallion icon={item.icon} ton={item.accent ? 'accent' : 'neutre'} />}
                  title={item.title}
                  subtitle={item.subtitle}
                  trailing={null}
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
            <View {...panHandlers} style={styles.sheetHeader}>
              <Handle style={styles.handle} />
              <Text variant="heading1" style={styles.heading}>De quoi avez-vous besoin ?</Text>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.sheetContent, { paddingBottom: insets.bottom + 28 }]}
            >
              {/* Bannière Affilié Réseau — refermable */}
              {!promoDismissed && (
                <AffiliePromo
                  onPress={() => router.push('/affilie/presentation')}
                  onDismiss={() => setPromoDismissed(true)}
                />
              )}

              {/* Les deux services ouverts, à parts égales */}
              <View style={styles.grid}>
                <ServiceCard service={course} onPress={() => onService(course)} anim={cardAnims[0]} />
                <ServiceCard service={livraison} onPress={() => onService(livraison)} anim={cardAnims[1]} />
              </View>

              {/* Recents */}
              <Text variant="caption" color={Colors.textTertiary} style={styles.sectionLabel}>Récemment</Text>
              {RECENTS.map((r) => (
                <ListRow
                  key={r.name}
                  leading={<Medallion icon="clock" />}
                  title={r.name}
                  subtitle={r.detail}
                  onPress={() => openConfigure('transport', r, departureName)}
                />
              ))}
            </ScrollView>
          </>
        ) : null}
      </Animated.View>

      {/* Drawer latéral — au-dessus de tout */}
      <MenuDrawer visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </View>
  );
}

const CARD_GAP = 12;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  map: { flex: 1 },
  edgeZone: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 24,
  },

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
  flex1: { flex: 1 },

  // --- Bannière Affilié Réseau ---
  // Le wrapper n'a ni fond ni rayon : il ne rogne donc pas la pastille qui dépasse.
  promoWrap: { marginBottom: CARD_GAP },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    backgroundColor: Colors.blue100,
    paddingLeft: 6,
    paddingRight: 14,
    paddingVertical: 6,
  },
  promoTile: {
    width: 64, height: 64,
    borderRadius: Radii.md,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  // Position du carré non pivoté : la rotation RN se fait autour du centre, donc
  // on vise le centre (25.52 ; 40.71) relevé sur la maquette.
  promoIllo: {
    position: 'absolute',
    left: -0.48, top: 8.71,
    width: 52, height: 64,
    transform: [{ rotate: '30deg' }],
  },
  promoText: { flex: 1, gap: 3, overflow: 'hidden' },
  promoSubtitle: { lineHeight: 19 },
  promoClose: {
    position: 'absolute',
    top: -10, right: -10,
    width: 38, height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface,
    borderWidth: Strokes.thick,
    borderColor: Colors.blue100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tuile de service : fond gris clair + liseré ténu, coins très arrondis.
  // Le padding vaut 5 et non 6 : dans Figma le liseré est intérieur et chevauche
  // le padding (encart total 6), alors qu'en RN `borderWidth` s'y ajoute. 5 + 1
  // redonne les 6 de la maquette — donc un panneau de 149.5 × 217 exactement.
  card: {
    flex: 1,
    height: CARD_H,
    borderRadius: 20,
    padding: 5,
    gap: 10,
    backgroundColor: Colors.track,
    borderWidth: Strokes.thin,
    borderColor: 'rgba(242, 243, 245, 0.5)',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: 8,
    overflow: 'hidden',
  },
  // Pied de tuile : la phrase tient sur deux lignes, interligne serré (maquette).
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  cardBlurb: { flex: 1, lineHeight: 16 },

  // Panneau illustré : fond blanc, calques positionnés en absolu et clipés.
  illoPanel: {
    flex: 1,
    width: '100%',
    borderRadius: Radii.lg,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  // Feuille décorative : centrée dans sa boîte puis pivotée (rotation RN = Figma).
  leafBox: {
    position: 'absolute',
    top: LEAF_TOP,
    width: LEAF_BOX,
    height: LEAF_BOX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leafRotate: { transform: [{ rotate: LEAF_ROTATE }] },
  // Cadre de découpe d'un véhicule : l'image déborde et se fait couper ici.
  layerFrame: { position: 'absolute', overflow: 'hidden' },
  // Tuile carrée blanche de la carte Affilié Réseau.
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
    borderWidth: Strokes.medium,
    borderColor: 'transparent',
    marginBottom: 12,
  },
  fieldA: { marginBottom: 4 },
  fieldIcon: { width: 28, alignItems: 'center' },
  fieldBody: { flex: 1, paddingVertical: 10 },
  fieldValue: { marginTop: 1 },
  fieldInput: { ...inputTypo('bodyMedium'), color: Colors.textPrimary, marginTop: 1, padding: 0 },
  fieldActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },

  // Bouton « Choisir sur la carte », présent à droite du champ actif.
  fieldBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Strokes.thin,
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
