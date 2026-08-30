import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Animated, ScrollView,
  PanResponder, Dimensions, FlatList, Keyboard, Image,
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
import Divider from '@/components/Divider';
import PlaceField from '@/components/PlaceField';
import Button from '@/components/Button';
import Scrim from '@/components/Scrim';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import { CARD_GAP as SHEET_GAP, Handle, SheetCard, SheetHeader, groupedSheetSurface } from '@/components/Sheet';
import { useSnapSheet, SHEET_SPRING } from '@/hooks/useSnapSheet';
import { Colors, Radii, SectionLabel, Shadows, Strokes } from '@/constants/tokens';
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
  { id: 'transport', label: 'Course',    blurb: 'Déplacez-vous en toute sécurité.' },
  { id: 'livraison', label: 'Livraison', blurb: 'Faites-vous livrer, aussi vite que possible.' },
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

// Géométrie de la tuile, relevée sur `BottomSheet / Accueil` (507:778) le
// 26 août 2026. Elle fait **228** de haut : 6 + en-tête 39 + 10 + panneau 109
// + 10 + pied 48 + 6.
//
// Le code citait encore le nœud 336:1175 et un panneau de 217 — la maquette a
// depuis réduit le panneau de moitié et allongé le pied de 40 à 48. La tuile
// était donc 100 px trop haute.
const CARD_H = 228;

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
// Courbe standard exportée par Figma Motion (`cubic-bezier(0.4, 0, 0.2, 1)`) :
// elle porte TOUTE la sortie de la tuile, sans exception.
const EASE_STD = Easing.bezier(0.4, 0, 0.2, 1);

// L'habillage de la tuile (en-tête, feuille, pied) s'anime à l'identique sur les
// deux services : une seule définition, réutilisée.
const CHROME = {
  headOpacity: { delay: 400, dur: 250, ease: EASE_QUART },
  headShift: { delay: 400, dur: 250, ease: EASE_BACK, from: -10 },
  leaf: { delay: 500, dur: 400, ease: EASE_QUART, fromX: 12 },
  footOpacity: { delay: 600, dur: 250, ease: EASE_QUART },
  footShift: { delay: 600, dur: 250, ease: EASE_BACK, from: 10 },
};

/**
 * SORTIE de la tuile de service — transcrite de la timeline Figma Motion posée
 * sur `BottomSheet / Parcours=Accueil, État=Services` (2 000 ms, en boucle sur
 * la maquette ; jouée une fois ici, sur 600 ms). Les pourcentages de la timeline
 * deviennent des délais et des durées : 2,5 % = 50 ms, 12,5 % = 250 ms,
 * 25 % = 500 ms.
 *
 * **Ce n'est pas le miroir de `CHROME`.** L'entrée fait descendre l'en-tête de
 * 10 et remonter le pied de 10 ; la sortie pousse l'en-tête à −15, le pied à
 * +10, et surtout elle DÉFAIT le panneau — il grandit, perd son rayon et son
 * fond blanc, et laisse l'illustration occuper l'écran. C'est une dissolution,
 * pas un départ.
 */
const EXIT = {
  headOpacity:  { dur: 250, ease: EASE_STD },
  headShift:    { dur: 300, ease: EASE_STD, to: -15 },
  footOpacity:  { delay: 50, dur: 250, ease: EASE_STD },
  footShift:    { delay: 50, dur: 300, ease: EASE_STD, to: 10 },
  leaf:         { dur: 200, ease: EASE_STD },
  groupOpacity: { delay: 50, dur: 300, ease: EASE_STD },
  groupDrift:   { dur: 350, ease: EASE_STD, scale: 0.92 },
  // La maquette fait passer le panneau de 109 à 228 de haut et le remonte de 55.
  // La hauteur est gardée en RAPPORT et non en pixels : la tuile est en
  // `flex: 1`, sa hauteur au repos dépend de la largeur de l'écran.
  panelGrow:    { delay: 50, dur: 450, ease: EASE_STD, ratio: 228 / 109, lift: -55 },
  panelFlat:    { delay: 250, dur: 250, ease: EASE_STD },
} as const;

// Chaque véhicule est un cadre de découpe (`frame`) dans lequel l'image déborde
// (`img`) : Figma recadre l'illustration, on reproduit le même cadrage plutôt que
// de la contenir. Les calques fantômes sont des PNG déjà désaturés — React Native
// n'a pas de `mix-blend-mode`, et sur fond blanc un mélange « luminosity » revient
// exactement à un gris posé à la même opacité.
// Traînée de la tuile Course. ⚠️ Encore dans l'ANCIEN style à plat : la maquette
// n'a refait que le véhicule de tête, pas son sillage. Elle s'éteint à 30 %
// d'opacité, donc l'écart de style se voit peu — mais il est là.
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
/** `exitDrift` : le déplacement de quelques pixels que la maquette applique au
 *  groupe de véhicules en le réduisant à 0,92 — le contrecoup d'une réduction
 *  qui ne part pas du centre. Deux valeurs voisines mais distinctes, relevées
 *  telles quelles sur `Group 1` et `Group 2`. */
type ServiceArt = { leafLeft: number; exitDrift: { x: number; y: number }; layers: ArtLayer[] };

// Les traînées entrent de plus en plus tard et s'éteignent en se posant ; le
// véhicule de tête arrive en dernier, avec un léger dépassement d'échelle.
const ENTER_FROM = { dx: -55, dy: -150 };

// Composition reprise de `BottomSheet / Accueil` (507:778), passe du 25 août
// 2026 : la maquette a **réduit le sillage**. La tuile Course garde UNE traînée
// (elle en avait deux), la tuile Livraison n'en a plus du tout — son vélo est
// seul dans le panneau.
//
// Les assets sont désormais recadrés au pixel sur le dessin, donc l'image
// remplit sa boîte : plus d'`img` en débord négatif, `frame` et `img` coïncident.
const SERVICE_ART: Record<SearchService, ServiceArt> = {
  // Course : une traînée derrière la voiture de tête (`hayon 2` puis `hayon 1`).
  transport: {
    leafLeft: 19,
    exitDrift: { x: 4.88, y: 4 },
    layers: [
      { src: GHOST_AUTO,
        frame: { x: 20, y: 25, w: 111, h: 88 },
        img: { x: 0, y: 0, w: 111, h: 88 },
        opFrom: 0.5,
        opSegs: [{ to: 0.45, dur: 450, ease: EASE_QUINT }, { to: 0.3, dur: 400, ease: EASE_QUART }],
        enter: { ...ENTER_FROM, scale: 1, dur: 650, ease: EASE_QUINT } },
      { src: require('@/assets/home-auto.png'),
        frame: { x: 16, y: 5, w: 122, h: 100 },
        img: { x: 0, y: 0, w: 122, h: 100 },
        opFrom: 0,
        opSegs: [{ to: 1, dur: 150, ease: EASE_QUINT }],
        enter: { ...ENTER_FROM, scale: 0.88, dur: 800, ease: EASE_BACK } },
    ],
  },
  // Livraison : le vélo seul — la maquette a retiré la traînée moto.
  livraison: {
    leafLeft: 19.5,
    exitDrift: { x: 4.32, y: 4.8 },
    layers: [
      { src: require('@/assets/home-velo.png'),
        frame: { x: 22.5, y: -5, w: 102, h: 114 },
        img: { x: 0, y: 0, w: 102, h: 114 },
        opFrom: 0,
        opSegs: [{ to: 1, dur: 150, ease: EASE_QUINT }],
        enter: { ...ENTER_FROM, scale: 0.88, dur: 800, ease: EASE_BACK } },
    ],
  },
};

/** Une valeur par PISTE de la timeline de sortie : les délais et les durées
 *  diffèrent d'une piste à l'autre, donc aucune ne peut en partager une.
 *  `grow` et `flat` pilotent hauteur, rayon et fond — trois propriétés que le
 *  driver natif ne sait pas animer : elles restent donc en JS, et comme elles
 *  vivent sur la même vue que la translation du panneau, celle-ci les suit. */
type CardExit = {
  headOp: Animated.Value; headY: Animated.Value;
  footOp: Animated.Value; footY: Animated.Value;
  leaf: Animated.Value;
  groupOp: Animated.Value; groupDrift: Animated.Value;
  grow: Animated.Value; flat: Animated.Value;
};

/** Valeurs animées d'une tuile : l'habillage + une paire par calque de véhicule,
 *  et la timeline de sortie. */
type CardAnim = {
  headOpacity: Animated.Value; headShift: Animated.Value;
  leaf: Animated.Value;
  footOpacity: Animated.Value; footShift: Animated.Value;
  layers: { op: Animated.Value; en: Animated.Value }[];
  exit: CardExit;
};

function makeCardAnim(layerCount: number): CardAnim {
  return {
    headOpacity: new Animated.Value(0), headShift: new Animated.Value(0),
    leaf: new Animated.Value(0),
    footOpacity: new Animated.Value(0), footShift: new Animated.Value(0),
    layers: Array.from({ length: layerCount }, () => ({
      op: new Animated.Value(0), en: new Animated.Value(0),
    })),
    exit: {
      headOp: new Animated.Value(0), headY: new Animated.Value(0),
      footOp: new Animated.Value(0), footY: new Animated.Value(0),
      leaf: new Animated.Value(0),
      groupOp: new Animated.Value(0), groupDrift: new Animated.Value(0),
      grow: new Animated.Value(0), flat: new Animated.Value(0),
    },
  };
}

const step = (
  v: Animated.Value,
  toValue: number,
  s: { delay?: number; dur: number; ease: EasingFunction },
  native = true,
) =>
  Animated.sequence([
    Animated.delay(s.delay ?? 0),
    Animated.timing(v, { toValue, duration: s.dur, easing: s.ease, useNativeDriver: native }),
  ]);

/** Opacité qui s'éteint : une piste de sortie va de 0 à 1, l'opacité de 1 à 0. */
const fade = (v: Animated.Value) => v.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

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

/**
 * Joue la sortie de la tuile — les neuf pistes de la timeline Figma.
 *
 * La maquette porte une dixième piste, `Illustration` : un blow-up ×2,5 vers
 * (−99, −99) en ressort, **sur la seule tuile Course**. Elle n'est pas reprise
 * ici : elle suppose un calque héros distinct du groupe qui s'en va (dans la
 * maquette, `Illustration` et `Group 1` sont frères et jouent l'un contre
 * l'autre), et le code n'en a pas. À trancher avant de l'ajouter — cf. Partie
 * XLII de l'inventaire.
 */
function cardExit(a: CardAnim) {
  const x = a.exit;
  return Animated.parallel([
    step(x.headOp, 1, EXIT.headOpacity),
    step(x.headY, 1, EXIT.headShift),
    step(x.footOp, 1, EXIT.footOpacity),
    step(x.footY, 1, EXIT.footShift),
    step(x.leaf, 1, EXIT.leaf),
    step(x.groupOp, 1, EXIT.groupOpacity),
    step(x.groupDrift, 1, EXIT.groupDrift),
    // Hauteur, rayon et fond : hors driver natif.
    step(x.grow, 1, EXIT.panelGrow, false),
    step(x.flat, 1, EXIT.panelFlat, false),
  ]);
}

/** Durée totale de la sortie, pour enchaîner sans deviner. */
const EXIT_MS = Math.max(
  ...Object.values(EXIT).map((t: any) => (t.delay ?? 0) + (t.dur ?? 0)),
);

function resetCardExit(a: CardAnim) {
  Object.values(a.exit).forEach((v) => v.setValue(0));
}

/** Pose la tuile à son état de repos, sans jouer l'animation. */
function settleCard(art: ServiceArt, a: CardAnim) {
  resetCardExit(a);
  [a.headOpacity, a.headShift, a.leaf, a.footOpacity, a.footShift].forEach(v => v.setValue(1));
  art.layers.forEach((layer, i) => {
    a.layers[i].op.setValue(layer.opSegs.length);
    a.layers[i].en.setValue(1);
  });
}

function resetCard(art: ServiceArt, a: CardAnim) {
  resetCardExit(a);
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
  const x = anim.exit;
  // La hauteur au repos vient du `flex: 1` de la tuile. On la mesure une fois
  // pour pouvoir l'animer en rapport (× 2,09), comme la maquette de 109 à 228 :
  // en dur, la tuile serait fausse dès qu'on change de largeur d'écran.
  const [baseH, setBaseH] = useState<number | null>(null);
  return (
    <Animated.View
      onLayout={(e) => {
        const h = e.nativeEvent.layout.height;
        setBaseH((prev) => prev ?? h);
      }}
      style={[styles.illoPanel, baseH != null && {
        flex: 0,
        height: x.grow.interpolate({ inputRange: [0, 1], outputRange: [baseH, baseH * EXIT.panelGrow.ratio] }),
        borderRadius: x.flat.interpolate({ inputRange: [0, 1], outputRange: [Radii.lg, 0] }),
        backgroundColor: x.flat.interpolate({
          inputRange: [0, 1],
          outputRange: [Colors.surface, 'rgba(255,255,255,0)'],
        }),
        transform: [{ translateY: x.grow.interpolate({ inputRange: [0, 1], outputRange: [0, EXIT.panelGrow.lift] }) }],
      }]}
    >
      <Animated.View
        style={[styles.leafBox, {
          left: art.leafLeft,
          opacity: Animated.multiply(
            anim.leaf.interpolate({ inputRange: [0, 1], outputRange: [0, LEAF_OPACITY] }),
            fade(x.leaf),
          ),
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

      {/* Enrobage du groupe de véhicules — il n'existait pas, la maquette l'a
          (`Group 1` / `Group 2`) et c'est lui qui porte la sortie du groupe :
          fondu, dérive de quelques pixels et réduction à 0,92. Les calques
          gardent leurs coordonnées absolues à l'intérieur. */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, {
          opacity: fade(x.groupOp),
          transform: [
            { translateX: x.groupDrift.interpolate({ inputRange: [0, 1], outputRange: [0, art.exitDrift.x] }) },
            { translateY: x.groupDrift.interpolate({ inputRange: [0, 1], outputRange: [0, art.exitDrift.y] }) },
            { scale: x.groupDrift.interpolate({ inputRange: [0, 1], outputRange: [1, EXIT.groupDrift.scale] }) },
          ],
        }]}
      >
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
      </Animated.View>
    </Animated.View>
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
          <Text variant="body" color={Colors.textSecondary}>
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
          opacity: Animated.multiply(anim.headOpacity, fade(anim.exit.headOp)),
          transform: [{
            translateY: Animated.add(
              anim.headShift.interpolate({ inputRange: [0, 1], outputRange: [CHROME.headShift.from, 0] }),
              anim.exit.headY.interpolate({ inputRange: [0, 1], outputRange: [0, EXIT.headShift.to] }),
            ),
          }],
        }]}
      >
        <Text variant="heading2" style={styles.flex1} numberOfLines={1}>{service.label}</Text>
        <Icon name="chevronRight" size={18} color={Colors.textTertiary} />
      </Animated.View>
      <IlloPanel art={art} anim={anim} />
      <Animated.View
        style={[styles.cardFooter, {
          opacity: Animated.multiply(anim.footOpacity, fade(anim.exit.footOp)),
          transform: [{
            translateY: Animated.add(
              anim.footShift.interpolate({ inputRange: [0, 1], outputRange: [CHROME.footShift.from, 0] }),
              anim.exit.footY.interpolate({ inputRange: [0, 1], outputRange: [0, EXIT.footShift.to] }),
            ),
          }],
        }]}
      >
        <Text variant="body" color={Colors.textSecondary} style={styles.cardBlurb} numberOfLines={2}>
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


  // La maquette fait sortir les DEUX tuiles ensemble : la timeline vit sur la
  // feuille, pas sur une tuile. On joue donc la sortie complète, puis on bascule
  // en mode recherche — l'inverse (basculer puis animer) démonterait les tuiles
  // avant qu'elles aient bougé.
  const exiting = useRef(false);
  const onService = (s: Service) => {
    // « Réduire les animations » : on passe directement, sans jouer la sortie.
    if (reduceMotion.current) { openSearch(s.id); return; }
    // Un second tap pendant la sortie relancerait la timeline et empilerait deux
    // navigations.
    if (exiting.current) return;
    exiting.current = true;
    Haptics.selectionAsync();
    Animated.parallel(cardAnims.map((a) => cardExit(a))).start();
    setTimeout(() => { exiting.current = false; openSearch(s.id); }, EXIT_MS);
  };

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

      {/* Recentrage géoloc — flotte 60 au-dessus de l'arête de la feuille, SUR la
          carte. Il vit hors de la feuille : celle-ci recadre son contenu (les 32
          variantes sont en `clipsContent`), donc un enfant en `top: -60` s'y
          ferait couper. Il suit le cran par le même `ty`, moins 60. */}
      {mode === 'services' && (
        <Animated.View
          style={[
            styles.recenterWrap,
            { opacity: controlsFade, transform: [{ translateY: Animated.subtract(ty, 60) }] },
          ]}
        >
          <IconButton name="navigate" onPress={() => mapRef.current?.recenter(DAKAR_CENTER, 15)} />
        </Animated.View>
      )}

      {/* Draggable bottom sheet — full height, anchored to screen bottom */}
      <Animated.View style={[groupedSheetSurface, styles.sheet, { transform: [{ translateY: ty }], opacity: fade }]}>
        {mode === 'search' ? (
          <View style={{ height: SEARCH_H }}>
            {/* CARTE 1 — en-tête et les deux champs, dans une seule carte comme
                `Transport / Adresse` (216). La poignée flotte au-dessus, hors
                flux ; toute la carte est zone de glissement. */}
            <View {...panHandlers} style={styles.headerZone}>
              <View style={styles.handleFloat} pointerEvents="none"><Handle /></View>
              <SheetCard>
                <SheetHeader title={SEARCH_COPY[service].title} onClose={closeSearch} style={styles.sheetHeaderTight} />

                {/* Champ « De » — passager (Transport) ou colis (Livraison) + géoloc si actif.
                    La `key` bascule quand le champ devient actif : elle remonte la saisie,
                    donc `autoFocus` reprend la main comme le faisait le rendu conditionnel
                    d'avant. Elle ne bouge pas pendant la frappe. */}
                <PlaceField
                  key={`dep-${activeField === 'departure'}`}
                  label={SEARCH_COPY[service].fromLabel}
                  icon={service === 'livraison' ? 'package' : 'walk'}
                  actif={activeField === 'departure'}
                  value={activeField === 'departure' ? departureQuery : departureName}
                  onChangeText={setDepartureQuery}
                  onFocus={() => setActiveField('departure')}
                  placeholder={SEARCH_COPY[service].fromPlaceholder}
                  autoFocus={activeField === 'departure'}
                  onAction={openMapPick}
                />

                {/* Champ « À » — géoloc si actif */}
                <PlaceField
                  label={SEARCH_COPY[service].toLabel}
                  icon="search"
                  actif={activeField === 'destination'}
                  value={destinationQuery}
                  onChangeText={setDestinationQuery}
                  onFocus={() => setActiveField('destination')}
                  placeholder={SEARCH_COPY[service].toPlaceholder}
                  autoFocus={activeField === 'destination'}
                  onAction={openMapPick}
                />
              </SheetCard>
            </View>

            {/* CARTE 2 — les résultats. Séparée de la première par l'interstice
                gris de 6, comme `Frame 26` (208) de la maquette. */}
            <SheetCard style={styles.resultsCard}>
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
                  ItemSeparatorComponent={() => <Divider />}
                />
            </SheetCard>
          </View>
        ) : mode === 'services' ? (
          <>
            {/* CARTE 1 — titre, bannière et les deux tuiles, dans UNE carte
                (`Frame 3`, 388). La poignée flotte hors flux ; toute la carte
                est zone de glissement. */}
            <View {...panHandlers} style={styles.headerZone}>
              <View style={styles.handleFloat} pointerEvents="none"><Handle /></View>
              <SheetCard>
                <Text variant="heading1">De quoi avez-vous besoin ?</Text>

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
              </SheetCard>
            </View>

            {/* CARTE 2 — les lieux récents. **Aucun libellé** : c'est
                l'interstice gris de 6 entre les deux cartes qui sépare, pas un
                titre de section (la maquette n'en a pas). */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.stack}
            >
              <SheetCard style={[styles.lastCard, { paddingBottom: 16 + insets.bottom }]}>
                {RECENTS.map((r, i) => (
                  <React.Fragment key={r.name}>
                    {i > 0 ? <Divider /> : null}
                    <ListRow
                      leading={<Medallion icon="clock" />}
                      title={r.name}
                      subtitle={r.detail}
                      // La maquette ne met pas de chevron sur ces rangées : le
                      // slot Trailing de ses `ListRow` est vide.
                      trailing={null}
                      onPress={() => openConfigure('transport', r, departureName)}
                    />
                  </React.Fragment>
                ))}
              </SheetCard>
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
  // `top: 0` — le décalage de 60 au-dessus de l'arête est porté par la
  // translation animée, qui suit le cran de la feuille.
  recenterWrap: {
    position: 'absolute',
    top: 0,
    right: 16,
  },
  // Zone de glissement : la première carte. Elle porte le `zIndex` pour que la
  // poignée flottante passe au-dessus.
  headerZone: { zIndex: 1 },
  // Poignée hors flux, à 6 du haut — la 1re carte est donc collée au sommet de
  // la feuille, comme dans la maquette.
  handleFloat: {
    position: 'absolute',
    top: 6, left: 0, right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  // En-tête de carte sans sa marge basse : c'est la gouttière 12 de la carte qui
  // espace, comme dans la maquette.
  sheetHeaderTight: { marginBottom: 0 },
  // Interstice gris entre les cartes — le fond `track` de la feuille y passe.
  stack: { paddingTop: SHEET_GAP },
  // Dernière carte : coins bas carrés, blanc jusqu'au bord de l'écran.
  lastCard: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  // Carte des résultats de recherche : elle prend la hauteur restante.
  resultsCard: { flex: 1, marginTop: SHEET_GAP },

  grid: {
    flexDirection: 'row',
    gap: CARD_GAP,
    alignItems: 'stretch',
  },
  flex1: { flex: 1 },

  // --- Bannière Affilié Réseau ---
  // Le wrapper n'a ni fond ni rayon : il ne rogne donc pas la pastille qui dépasse.
  // Pas de marge basse : la gouttière 12 de la `SheetCard` espace déjà.
  promoWrap: {},
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radii.card,
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
  promoClose: {
    position: 'absolute',
    top: -10, right: -10,
    width: 38, height: 38,
    borderRadius: Radii.pill,
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
    borderRadius: Radii.card,
    padding: 5,
    gap: 10,
    // La tuile est BLEUE, pas grise : `primarySubtle` avec un liseré `track`.
    // Le gris sur gris d'avant venait d'un relevé plus ancien.
    backgroundColor: Colors.primarySubtle,
    borderWidth: Strokes.thin,
    borderColor: Colors.track,
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
  // Pas de surcharge d'interligne : le style `body` porte 20, et le pied de 48
  // (padding 4 + 40) tient exactement deux lignes de 20.
  cardBlurb: { flex: 1 },

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

  // --- Mode recherche (morph in-place du sheet) ---
  // Champs De / À — coins arrondis (registre bouton, sans aller jusqu'au pill).

  // Bouton « Choisir sur la carte », présent à droite du champ actif.


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
    backgroundColor: Colors.scrim,
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
  pickKicker: { ...SectionLabel },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
