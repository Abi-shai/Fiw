import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Animated, ScrollView,
  PanResponder, FlatList, Keyboard, Image, Dimensions, PixelRatio,
  Easing, AccessibilityInfo, type EasingFunction, type LayoutChangeEvent,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import HandWithCash from '@/components/HandWithCash';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScreenHeight } from '@/hooks/useScreenHeight';
import * as Haptics from 'expo-haptics';
import LeafletMap, { LeafletMapHandle } from '@/components/LeafletMap';
import { useKeyboardState } from 'react-native-keyboard-controller';
import MenuDrawer from '@/components/MenuDrawer';
import IconButton from '@/components/IconButton';
import ListRow from '@/components/ListRow';
import Medallion from '@/components/Medallion';
import Divider from '@/components/Divider';
import PlaceField from '@/components/PlaceField';
import Button from '@/components/Button';
import Scrim, { sheetScrimOpacity } from '@/components/Scrim';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import { CARD_CONTENT_GAP, CARD_GAP as SHEET_GAP, Handle, SheetCard, SheetHeader, firstCardEdge, groupedSheetSurface, lastCardFill, sheetSnaps } from '@/components/Sheet';
import { useSnapSheet } from '@/hooks/useSnapSheet';
import { Colors, Motion, Radii, SectionLabel, Shadows, Spacing, Strokes } from '@/constants/tokens';

// Raccourcis locaux : les fenêtres de l'identité de mouvement sont citées une
// vingtaine de fois dans les timelines ci-dessous.
const M = Motion;
const D = Motion.duration;
import { DAKAR_CENTER, SUGGESTIONS, RECENT_PLACES } from '@/constants/data';
import { usePlaces } from '@/stores/places';


type Place = { name: string; detail: string; lat: number; lng: number };
type Field = 'departure' | 'destination';
type ResultRow = { key: string; icon: IconName; accent?: boolean; title: string; subtitle?: string; place: Place };

const RECENTS: Place[] = [SUGGESTIONS[2], SUGGESTIONS[0]]; // Almadies, Aéroport AIBD

const TAP_THRESHOLD = 6;

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
  { id: 'livraison', label: 'Livraison', blurb: 'Faites-vous livrer rapidement.' },
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
// 26 août 2026 : 6 + en-tête 39 + 10 + panneau 109 + 10 + pied 48 + 6 = 228.
// Écrite en pièces plutôt qu'en total, parce que la SORTIE s'en déduit — cf.
// `EXIT.panel` plus bas.
const CARD_PAD = 6;
const CARD_HEAD_H = 39;
const CARD_GUTTER = 10;
const CARD_FOOT_H = 48;
const CARD_H = CARD_PAD * 2 + CARD_HEAD_H + CARD_GUTTER * 2 + 109 + CARD_FOOT_H; // 228

// Feuille décorative posée derrière les véhicules : une forme unique, pivotée,
// centrée dans une boîte de 154.624. Remplace la bande bleue diagonale.
const LEAF_PATH = 'M44.2062 20.6341C74.0014 6.73435 134.078 -13.91 133.47 13.4098C133.004 34.3277 110.859 90.7533 51.8918 124.281C-24.408 167.664 -7.4579 44.7359 44.2062 20.6341Z';
const LEAF_SIZE = 133.474;
const LEAF_BOX = 154.624;
// Boîte rendue de la feuille pivotée, relevée sur 853:12 : (19 ; 28) dans le
// panneau, 154,62 de côté — soit exactement `LEAF_BOX`. Le 86 d'avant la posait
// 58 px trop bas, donc quasiment hors du panneau de 109.
const LEAF_TOP = 28;
const LEAF_ROTATE = '80deg';
const LEAF_OPACITY = 0.6;

// --- Motion (Figma Motion, timeline de 2 s relevée sur la frame 357:1685) ---
// Les trois courbes employées par la maquette, reprises telles quelles.
const EASE_QUART = Easing.bezier(0.25, 1, 0.5, 1);   // sorties douces
const EASE_BACK = Easing.bezier(0.34, 1.56, 0.64, 1); // léger dépassement
const EASE_QUINT = Easing.bezier(0.22, 1, 0.36, 1);   // traînées
// La courbe standard exportée par Figma Motion (`cubic-bezier(0.4, 0, 0.2, 1)`)
// EST la `Primary Ease` de l'identité de mouvement : elle porte toute la sortie
// de la tuile, sans exception. Elle passe donc par le jeton.
const EASE_STD = Motion.easing.primary;

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
  // Chaque piste est écrite comme la FENÊTRE de l'identité de mouvement
  // (`Motion.duration`), et les neuf valeurs qui en sortent sont **exactement**
  // celles que la timeline Figma Motion portait déjà — la planche
  // `motion-identity-system` généralise cette sortie, elle ne la corrige pas.
  headOpacity:  { ...M.window(D.textExitFade), ease: EASE_STD },
  headShift:    { ...M.window(D.textExitShift), ease: EASE_STD, to: -15 },
  footOpacity:  { ...M.window(D.textExitShift, D.anticipationHold), ease: EASE_STD },
  footShift:    { ...M.window(D.supportExit, D.anticipationHold), ease: EASE_STD, to: 10 },
  leaf:         { ...M.window(D.decorationExit), ease: EASE_STD },
  groupOpacity: { ...M.window(D.supportExit, D.anticipationHold), ease: EASE_STD },
  groupDrift:   { ...M.window(D.supportExit), ease: EASE_STD, scale: 0.92 },
  // **Le panneau DEVIENT la tuile.** C'est le mécanisme, pas un agrandissement :
  // il prend la hauteur entière de la tuile (`CARD_H`) et remonte jusqu'à son
  // bord haut — d'où un décalage égal à ce qui le surplombe, padding + en-tête +
  // gouttière. En perdant au même moment son rayon et son fond blanc, il laisse
  // le `primarySubtle` et le rayon 20 de la tuile prendre le relais.
  //
  // Les deux valeurs se DÉDUISENT de la géométrie : plus de rapport ajusté à la
  // main, plus de −55 magique. Elles suivent d'elles-mêmes si l'en-tête ou le
  // pied changent de hauteur.
  panelGrow: {
    ...M.window(D.containerMorph, D.anticipationHold), ease: EASE_STD,
    to: CARD_H,
    lift: -(CARD_PAD + CARD_HEAD_H + CARD_GUTTER),
  },
  // Sous-étape INTERNE au morph : elle occupe sa seconde moitié, donc elle finit
  // avec lui. Le panneau perd son rayon et son fond pendant qu'il grandit encore.
  panelFlat:    { ...M.window(D.containerMorph, D.containerMorph / 2), ease: EASE_STD },
} as const;

// Chaque véhicule est un cadre de découpe (`frame`) dans lequel l'image déborde
// (`img`) : Figma recadre l'illustration, on reproduit le même cadrage plutôt que
// de la contenir. Les calques fantômes sont des PNG déjà désaturés — React Native
// n'a pas de `mix-blend-mode`, et sur fond blanc un mélange « luminosity » revient
// exactement à un gris posé à la même opacité.
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
  // Course : la voiture seule. L'affinage de la maquette a retiré la traînée —
  // `Group 1` ne contient plus que le véhicule de tête.
  transport: {
    leafLeft: 19,
    exitDrift: { x: 4.88, y: 4 },
    layers: [
      { src: require('@/assets/home-auto.png'),
        frame: { x: 16, y: 5, w: 122, h: 100 },
        img: { x: 0, y: 0, w: 122, h: 100 },
        opFrom: 0,
        opSegs: [{ to: 1, dur: 150, ease: EASE_QUINT }],
        enter: { ...ENTER_FROM, scale: 0.88, dur: 800, ease: EASE_BACK } },
    ],
  },
  // Livraison : le vélo seul.
  livraison: {
    leafLeft: 19,
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

/**
 * Fin de la séquence d'atterrissage d'une tuile — **calculée**, pas devinée, sur
 * le même principe que `EXIT_MS`. Sur les valeurs actuelles : 900 ms (la feuille
 * décorative, delay 500 + dur 400).
 */
const ENTER_MS = Math.max(
  ...Object.values(CHROME).map((t) => t.delay + t.dur),
  ...Object.values(SERVICE_ART).flatMap((art) => art.layers.map((l) => l.enter.dur)),
);

/**
 * Latence avant l'arrivée de la bannière Affilié — **déduite** elle aussi : la fin
 * de l'atterrissage (`ENTER_MS`, 900) plus un temps de silence de `hero-reveal`
 * (600). Soit **1 500 ms**.
 *
 * Le silence n'est pas un jeton de l'identité — la planche n'a pas de « pause » —
 * mais il n'est pas non plus choisi à la main : il prend la **plus longue fenêtre
 * du système**, celle d'une séquence de contenu complexe qui se déploie. Autrement
 * dit, on laisse passer le temps qu'aurait pris un dévoilement entier avant que la
 * bannière se manifeste. La bannière arrive donc bien après que tout se soit posé,
 * ce qui est l'effet cherché : on la remarque parce qu'elle est **seule à bouger**,
 * et le silence qui la précède fait partie de l'accroche.
 *
 * ⚠️ `hero-reveal` est le **plafond** de l'échelle : il n'y a pas de palier
 * au-dessus. Allonger encore ne serait plus un changement de jeton mais une
 * décision de design system — un jeton de pause à poser dans la planche, pas un
 * nombre à écrire ici. Pour raccourcir, les paliers descendants sont
 * `container-morph` (500), `support-exit` (350), puis `stagger` (40).
 *
 * Déduite, elle suit d'elle-même si la timeline de la tuile change.
 *
 * _(940 ms au premier jet — trop rapproché du reste ; 1 400 le 27 août 2026 ;
 * 1 500 le 28 août 2026, les deux fois sur retour à l'écran de l'utilisatrice.)_
 */
const PROMO_INTRO_MS = ENTER_MS + Motion.duration.heroReveal;

/**
 * Décalages de l'arrivée et du départ de la bannière. **Aucune valeur inventée** :
 * les trois sont reprises de valeurs déjà relevées sur la maquette ailleurs dans
 * ce fichier, pour que la bannière bouge dans le même vocabulaire que le reste.
 */
/**
 * Géométrie de la bannière, écrite **en pièces** et partagée avec ses styles pour
 * qu'elle ne puisse pas dériver.
 *
 * Sa hauteur est **déduite, jamais mesurée** : elle est imposée par la vignette
 * d'illustration (64, fixe), pas par le texte — deux lignes de 20 plus une
 * gouttière de 3 font 43, donc plus court — plus le padding vertical de la carte.
 *
 * ⚠️ C'est le correctif d'un vrai défaut. La version d'avant mesurait la carte au
 * `onLayout` **pendant que son cadre était replié à zéro**, en supposant que Yoga
 * lui donnerait quand même sa hauteur naturelle. Faux : la hauteur remontée était
 * trop petite, le cadre restait court, et les tuiles se dessinaient PAR-DESSUS la
 * bannière. Une hauteur déduite ne peut pas se tromper — et supprime au passage un
 * état, un `onLayout` et deux branches de rendu.
 */
/**
 * Instrument de diagnostic de la bannière — **inactif**.
 *
 * Passer à `true` fait consigner dans la console la géométrie RÉELLEMENT rendue de
 * chaque partie du bloc, avec la valeur attendue en face. C'est ce qu'il faut quand
 * un écart de spacing ne se voit que sur un appareil : le relevé du 28 août 2026 a
 * montré que le code est fidèle à la maquette sur toutes les mesures de ce bloc, donc
 * un écart restant se lit dans les hauteurs rendues, pas dans les styles.
 *
 * À remettre à `false` une fois le diagnostic fait.
 */
const DEBUG_PROMO = false;

const PROMO_TILE = 64;   // vignette d'illustration, carrée
const PROMO_PAD_V = 6;   // padding vertical de la carte
/**
 * Hauteur **minimale** du bloc — celle qu'il a quand son titre tient sur une ligne,
 * c'est-à-dire à la largeur de la maquette (375 pt).
 *
 * ⚠️ Ce n'est PAS une hauteur fixe, et c'est le correctif d'un vrai défaut. Le bloc
 * la portait en dur, en supposant que le titre tenait toujours sur une ligne. Sur
 * un écran plus étroit — ou avec un réglage de police système plus grand — il passe
 * à deux lignes : le bloc de texte fait alors 40 + 3 + 40 = 83, crève la boîte de
 * contenu de 64, et le padding de 6 **disparaît**. C'est ce que l'utilisatrice
 * voyait sur son Android.
 *
 * En plancher, la carte grandit quand son texte grandit et le padding est toujours
 * respecté, quelle que soit la largeur d'écran et quel que soit le réglage de
 * police.
 */
const PROMO_MIN_H = PROMO_TILE + PROMO_PAD_V * 2;   // 76

/**
 * Hauteur réellement mesurée du bloc, gardée au niveau MODULE. Elle ne dépend que
 * de la largeur d'écran et du réglage de police, donc elle ne change pas d'un
 * montage à l'autre : la garder ici évite de repasser par la phase de mesure — et
 * donc de faire clignoter le bloc — à chaque retour sur l'écran.
 */
let promoMeasuredH: number | null = null;

const PROMO = {
  /** Elle monte de 10 pour se poser — la magnitude des `CHROME.*Shift`. */
  fromY: 10,
  /** Elle arrive à 0,88, l'échelle d'arrivée des calques véhicule. */
  fromScale: 0.88,
  /** Elle se retire à 0,92, l'échelle de recul de `EXIT.groupDrift`. */
  exitScale: 0.92,
} as const;

/**
 * Arrivée de la bannière : **le plan de séquence de l'identité appliqué tel quel**
 * (§ Motion, section 4), pour la première fois sur un bloc réel.
 *
 * Les couches partent toutes de 0 (ou du maintien d'anticipation) et se
 * distinguent par leur **durée**, pas par des délais empilés : elles finissent
 * l'une après l'autre au lieu de démarrer l'une après l'autre, et c'est ce qui
 * donne un mouvement d'un seul tenant plutôt qu'une cascade.
 *
 * L'ordre est celui de *Hierarchy Staging* — décoration, ancre de titre, corps,
 * supports — et le conteneur conclut, comme la planche le demande.
 */
const PROMO_IN = {
  /**
   * Décoration : elle part **la première** (délai 0), et elle seule porte le
   * ressort.
   *
   * ⚠️ Sa durée n'est donc PAS celle de la fenêtre `decoration-exit` : un ressort
   * n'a pas de durée, c'est sa physique qui décide. La fenêtre du plan ne dit ici
   * que son **rang**, pas son temps — et c'est la seule couche des cinq dans ce
   * cas. Le noter plutôt que de laisser croire à une application littérale.
   */
  illo:    { delay: 0 },
  /** Ancre de titre : 0 → 250. */
  title:   { ...M.window(D.textExitFade), ease: M.easing.primary },
  /** Corps de texte : 0 → 300. */
  body:    { ...M.window(D.textExitShift), ease: M.easing.primary },
  /** Supports (chevron, pastille) : 50 → 350. */
  support: { ...M.window(D.supportExit, D.anticipationHold), ease: M.easing.primary },
  /** La place qui s'ouvre : 50 → 500, la dernière à finir. Courbe symétrique,
   *  c'est la recette des conteneurs. */
  space:   { ...M.window(D.containerMorph, D.anticipationHold), ease: M.easing.hold },
} as const;

/**
 * L'intro de la bannière n'est jouée **qu'une fois par lancement d'app**.
 *
 * Le drapeau est au niveau MODULE et non dans un état React, et c'est ce qui donne
 * la portée demandée : un `useState` repartirait à zéro à chaque remontage de
 * l'écran — un `router.replace('/home')` depuis une clôture, par exemple — et
 * l'intro se rejouerait en cours de navigation. Un module vit aussi longtemps que
 * le bundle JS, donc jusqu'au prochain (re)démarrage.
 */
let promoIntroPlayed = false;

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
    // ⚠️ Le groupe véhicule est sur le driver **JS**, comme le panneau qui le
    // contient. Ce n'est pas une régression de performance, c'est le correctif
    // d'un bégaiement : la hauteur du panneau ne PEUT PAS être native (c'est une
    // propriété de mise en page), donc laisser le groupe en natif faisait tourner
    // deux horloges — le conteneur avançait par saccades du thread JS pendant que
    // son contenu glissait à 60 im/s sur le thread UI, et l'œil voit ce
    // décalage-là. Une seule horloge, même imparfaite, est fluide ; deux horloges
    // ne le sont jamais.
    //
    // Les autres pistes restent natives et ne PEUVENT pas descendre ici : elles
    // sont combinées aux valeurs d'ENTRÉE (`Animated.multiply` / `add` dans
    // `ServiceCard` et sur la feuille), et un même nœud animé ne peut pas vivre
    // sur les deux drivers. Elles sont de toute façon figées pendant la sortie.
    step(x.groupOp, 1, EXIT.groupOpacity, false),
    step(x.groupDrift, 1, EXIT.groupDrift, false),
    // Hauteur et fond : hors driver natif par nature.
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
      // La mesure ne sert qu'UNE fois. Garder le gestionnaire posé le ferait
      // rappeler à chaque image pendant que la hauteur s'anime — du travail JS
      // par image, sur le thread qui porte déjà l'animation.
      onLayout={baseH == null ? (e) => setBaseH(e.nativeEvent.layout.height) : undefined}
      style={[styles.illoPanel, baseH != null && {
        flex: 0,
        height: x.grow.interpolate({ inputRange: [0, 1], outputRange: [baseH, EXIT.panelGrow.to] }),
        transform: [{ translateY: x.grow.interpolate({ inputRange: [0, 1], outputRange: [0, EXIT.panelGrow.lift] }) }],
      }]}
    >
      {/* Le blanc du panneau est un CALQUE, pas la couleur de fond du panneau.
          Deux raisons, et les deux étaient des défauts visibles :

          • un `backgroundColor` animé s'interpole couleur par couleur sur le
            thread JS et invalide le fond à chaque image ;
          • un `borderRadius` animé sur une vue qui ROGNE (`overflow: hidden`)
            fait reconstruire le masque de clip à chaque image — c'est de là que
            venait le flash.

          En fondant un calque blanc, le rayon n'a plus à s'animer du tout : quand
          le blanc a disparu, il n'y a plus de coin à arrondir. Le panneau garde
          donc un rayon FIXE, son masque est stable, et le fondu est une simple
          opacité. */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, styles.illoPanelFill, { opacity: fade(x.flat) }]}
      />
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
          {/* `primarySubtle` et non `track` : la feuille est un bleu pâle posé
              sur le blanc du panneau, pas un gris. */}
          <Path d={LEAF_PATH} fill={Colors.primarySubtle} fillRule="evenodd" />
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
  // Une valeur par COUCHE du plan de séquence, plus la sortie. Les fenêtres
  // diffèrent d'une couche à l'autre, donc aucune ne peut en partager une.
  const at = promoIntroPlayed ? 1 : 0;
  const space = useRef(new Animated.Value(at)).current;   // la place qui s'ouvre
  const illo = useRef(new Animated.Value(at)).current;    // décoration
  const title = useRef(new Animated.Value(at)).current;   // ancre de titre
  const body = useRef(new Animated.Value(at)).current;    // corps de texte
  const support = useRef(new Animated.Value(at)).current; // chevron + pastille
  const exit = useRef(new Animated.Value(0)).current;

  // Le recadrage n'existe que PENDANT l'ouverture ou le repli : au repos il
  // rognerait la pastille de fermeture, qui déborde volontairement de 10.
  const [clipped, setClipped] = useState(!promoIntroPlayed);

  /**
   * Hauteur naturelle du bloc. Tant qu'elle est inconnue, le cadre est posé **hors
   * flux** (`promoProbing`) : la mise en page l'ignore donc totalement — ce qui est
   * l'effet voulu — ET il est mesurable à sa vraie hauteur.
   *
   * ⚠️ C'est ce qui manquait aux deux tentatives précédentes. Mesurer dans un cadre
   * replié à `height: 0` ne rend PAS la hauteur naturelle ; le déduire des styles
   * ne marche que si le texte tient sur le nombre de lignes prévu. Hors flux, la
   * mesure est juste dans tous les cas.
   */
  const [h, setH] = useState<number | null>(promoMeasuredH);

  // Le drapeau de module est posé au DÉMARRAGE de l'animation et non à sa
  // programmation, et la garde passe par une ref. Sans ça, un double appel de
  // l'effet (StrictMode en développement) annulerait le premier minuteur puis
  // ressortirait aussitôt sur le drapeau : l'intro ne jouerait jamais.
  const introDone = useRef(promoIntroPlayed);
  useEffect(() => {
    if (introDone.current) return;
    const t = setTimeout(() => {
      promoIntroPlayed = true;
      introDone.current = true;
      Animated.parallel([
        // La place s'ouvre : morph de conteneur, courbe symétrique — c'est la
        // recette des conteneurs, et la dernière couche à finir.
        step(space, 1, PROMO_IN.space, false),
        // La décoration porte le ressort : `HandWithCash` est l'actif de marque
        // de l'offre, et le dépassement est ce qui fait remarquer l'arrivée.
        Animated.spring(illo, {
          toValue: 1, delay: PROMO_IN.illo.delay,
          ...Motion.spring.gentle, useNativeDriver: false,
        }),
        step(title, 1, PROMO_IN.title, false),
        step(body, 1, PROMO_IN.body, false),
        step(support, 1, PROMO_IN.support, false),
      ]).start(({ finished }) => { if (finished) setClipped(false); });
    }, PROMO_INTRO_MS);
    return () => clearTimeout(t);
  }, [space, illo, title, body, support]);

  // Fermeture : `container-exit` (200 ms) — un bloc qu'on renvoie. Le repli
  // vertical accompagne le fondu pour que les tuiles reprennent la place sans
  // saut ; c'est le motif « fading and collapsing vertically » de l'identité.
  const dismiss = () => {
    setClipped(true);
    Animated.timing(exit, {
      toValue: 1,
      duration: Motion.duration.containerExit,
      easing: Motion.easing.primary,
      useNativeDriver: false,
    }).start(({ finished }) => { if (finished) onDismiss(); });
  };

  /** Fondu d'une couche : elle entre, et la sortie l'éteint. Bornée, parce que le
   *  ressort de la décoration dépasse 1 et qu'une opacité non. */
  const layerOpacity = (v: Animated.Value) => Animated.multiply(
    v.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' }),
    fade(exit),
  );
  /** Consigne la géométrie rendue d'une partie du bloc, avec l'attendu en face.
   *  N'existe que si `DEBUG_PROMO` est actif. */
  const probe = (part: string, expected: string) => DEBUG_PROMO
    ? (e: LayoutChangeEvent) => {
        const { x, y, width, height } = e.nativeEvent.layout;
        const r = (n: number) => Math.round(n * 100) / 100;
        // La largeur d'écran et l'échelle de police en tête : ce sont elles qui
        // décident si le titre tient sur une ligne, et donc toute la hauteur du
        // bloc. Les avoir dès la première ligne du journal aurait tranché du
        // premier coup — la maquette est dessinée à 375 pt et à l'échelle 1.
        console.log(
          `[promo] écran=${Math.round(Dimensions.get('window').width)}pt police=×${PixelRatio.getFontScale()} | ` +
          `${part.padEnd(12)} x=${r(x)} y=${r(y)} w=${r(width)} h=${r(height)}  attendu: ${expected}`,
        );
      }
    : undefined;

  /** Chaque couche monte de 10 pour se poser — la magnitude des `CHROME.*Shift`. */
  const layerRise = (v: Animated.Value) =>
    v.interpolate({ inputRange: [0, 1], outputRange: [PROMO.fromY, 0] });

  /**
   * **Ouverture du bloc** : 0 = il n'existe pas · 1 = il est à sa place. L'arrivée
   * l'ouvre, le départ la referme, et la hauteur COMME la gouttière en découlent —
   * une seule valeur, donc les deux ne peuvent pas se contredire.
   */
  const openness = Animated.multiply(
    space.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' }),
    fade(exit),
  );

  return (
    // ⚠️ Tout est sur le driver **JS**, ressort compris. La règle « une horloge,
    // pas deux » l'impose : la hauteur du cadre ne peut pas être native, et les
    // valeurs d'entrée se combinent à `exit` dans les mêmes opacités — un nœud de
    // style ne peut pas mélanger les deux drivers. Le coût est nul : la bannière
    // arrive quand tout le reste s'est posé, le thread JS est libre.
    <Animated.View
      style={[
        styles.promoWrap,
        clipped && styles.promoClip,
        // Phase de MESURE : hors flux et invisible. La mise en page ignore le bloc,
        // et il se mesure à sa hauteur réelle — ce qu'un cadre replié à 0 ne permet
        // pas. Une seule image, et seulement au premier lancement : la mesure est
        // ensuite gardée au niveau module.
        h == null ? styles.promoProbing : {
          // De 0 à la hauteur MESURÉE, donc juste même si le titre passe à deux
          // lignes sur un écran étroit.
          height: openness.interpolate({ inputRange: [0, 1], outputRange: [0, h] }),
          // ⚠️ La gouttière suit la même ouverture, et ce n'est pas un détail : un
          // enfant de hauteur 0 consomme quand même les 12 px de gouttière de la
          // carte. Sans ce `marginBottom` négatif, « la mise en page se comporte
          // comme si le bloc n'existait pas » serait faux — il resterait une bande
          // vide de 12. Fermé : 0 + 12 − 12 = 0. Ouvert : h + 12 − 0.
          marginBottom: openness.interpolate({
            inputRange: [0, 1], outputRange: [-CARD_CONTENT_GAP, 0],
          }),
          // Elle se retire en reculant légèrement — 0,92, l'échelle de recul de
          // `EXIT.groupDrift`.
          transform: [{
            scale: exit.interpolate({ inputRange: [0, 1], outputRange: [1, PROMO.exitScale] }),
          }],
        },
      ]}
      onLayout={h == null ? (e) => {
        const measured = e.nativeEvent.layout.height;
        promoMeasuredH = measured;
        setH(measured);
      } : undefined}
    >
      <TouchableOpacity
        style={styles.promoCard}
        activeOpacity={0.9}
        onPress={onPress}
        onLayout={probe('carte', `h≥${PROMO_MIN_H}`)}
      >
        {/* DÉCORATION — première couche du plan de séquence, et la seule à
            ressort. */}
        <Animated.View
          onLayout={probe('vignette', 'x=6 y=6 w=64 h=64')}
          style={[styles.promoTile, {
            opacity: layerOpacity(illo),
            transform: [{ scale: illo.interpolate({ inputRange: [0, 1], outputRange: [PROMO.fromScale, 1] }) }],
          }]}
        >
          {/* Illustration 52 × 64 pivotée de 30°, centrée sur (25.52 ; 40.71). */}
          <View style={styles.promoIllo}>
            <HandWithCash width={52} />
          </View>
        </Animated.View>
        <View style={styles.promoText} onLayout={probe('bloc texte', 'x=82 y=6.5 w=217 h=63')}>
          {/* ANCRE DE TITRE — deuxième couche.

              `numberOfLines={1}` : **une seule ligne, ellipse si ça ne tient pas.**
              Décision de l'utilisatrice le 28 août 2026, après avoir vu le titre
              passer à deux lignes sur Android.

              La raison est géométrique, pas typographique : ce bloc a une hauteur
              **contrainte** par sa vignette d'illustration. À 375 pt le titre tient
              à un pixel près ; sur un écran plus étroit il passait à deux lignes, le
              bloc de texte montait à 83 et écrasait le padding de la carte. Une
              ligne ferme rend la hauteur du bloc de nouveau déterministe :
              20 + 3 + 40 = 63, sous les 64 de la vignette, sur **toutes** les
              largeurs.

              ⚠️ Ça n'annule pas le plancher de la carte ni la mesure hors flux : un
              réglage de police système à ×2 donne une ligne de 40, et le bloc doit
              alors grandir plutôt qu'écraser son padding. La tolérance reste le
              filet, la ligne unique enlève simplement le cas courant. */}
          <Animated.View
            onLayout={probe('titre', 'h=20 (1 ligne)')}
            style={{ opacity: layerOpacity(title), transform: [{ translateY: layerRise(title) }] }}
          >
            <Text variant="bodyMedium" numberOfLines={1}>Gagnez de l’argent avec Fiw !</Text>
          </Animated.View>
          {/* CORPS DE TEXTE — troisième couche.

              `numberOfLines={2}` : relevé sur la maquette (`maxLines: 2`,
              `textTruncation: ENDING`). L'ellipse n'est pas déclarée parce que
              `tail` EST le défaut de React Native, et c'est exactement le `ENDING`
              de Figma — la poser serait du bruit.

              Ce plafond **borne** la hauteur du bloc sans la fixer : à la largeur
              de la maquette, titre 20 + gouttière 3 + corps 40 = 63, sous les 64 de
              la vignette. Sur un écran plus étroit le titre passe à deux lignes et
              le bloc monte à 83 — c'est légitime, et c'est pour ça que la carte a un
              PLANCHER et non une hauteur fixe. Sans le plafond de 2 lignes, en
              revanche, rien ne bornerait la croissance. */}
          <Animated.View
            onLayout={probe('corps', 'y=23 h=40 (2 lignes)')}
            style={{ opacity: layerOpacity(body), transform: [{ translateY: layerRise(body) }] }}
          >
            <Text variant="body" color={Colors.textSecondary} numberOfLines={2}>
              Et si vous deveniez un affilié réseau ?
            </Text>
          </Animated.View>
        </View>
        {/* SUPPORT — quatrième couche, avec la pastille de fermeture. */}
        <Animated.View style={{ opacity: layerOpacity(support) }}>
          <Icon name="chevronRight" size={18} color={Colors.textTertiary} />
        </Animated.View>
      </TouchableOpacity>
      <Animated.View style={[styles.promoClose, { opacity: layerOpacity(support) }]}>
        <TouchableOpacity
          style={styles.promoCloseHit}
          activeOpacity={0.85}
          onPress={dismiss}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="close" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
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
  const SCREEN_H = useScreenHeight();
  // Hauteur du clavier, publiée par `react-native-keyboard-controller`. Le
  // provider prend la main sur le mode de saisie : la fenêtre ne se
  // redimensionne plus, donc cette hauteur EST ce que le clavier recouvre — sur
  // les deux OS, sans branche `Platform`.
  //
  // Ici la valeur reste un nombre ordinaire et non un `Animated.Value` : elle ne
  // sert qu'à donner du mou de défilement en bas de la liste. Rien ne se déplace
  // à l'écran, il n'y a donc aucune synchro à tenir — la feuille, elle, est déjà
  // remontée par la transformation (cf. `BottomSheet`).
  const kbHeight = useKeyboardState((s) => s.height);
  // Crans exprimés en translateY de la feuille (0 = couvre tout l'écran).
  // translateY plus grand = plus bas / plus replié. La mécanique de drag/snap est
  // dans le primitif partagé `useSnapSheet` (même logique côté course active).
  // La feuille fait toute la hauteur de l'écran : ses trois crans sont donc les
  // trois niveaux du système (`SHEET_LEVELS`) appliqués à la hauteur mesurée —
  // 85 / 50 / 25 % de hauteur visible, soit 15 / 50 / 75 % de translateY.
  const SNAPS = useMemo(() => sheetSnaps(SCREEN_H, SCREEN_H), [SCREEN_H]);
  const [TY_EXPANDED, TY_DEFAULT, TY_COLLAPSED] = SNAPS;
  // Hauteur visible du sheet une fois étendu — c'est le plafond de 85 % du
  // système. Elle borne le contenu de recherche pour que la liste scrolle DANS la
  // feuille : on ne gagne pas de hauteur en rognant la carte.
  const SEARCH_H = SCREEN_H - TY_EXPANDED;
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

  // Paramètres reçus quand configure renvoie ici pour éditer l'itinéraire.
  const editParams = useLocalSearchParams<{
    editTs?: string; editDeparture?: string; editDest?: string; editService?: string;
  }>();

  // Entrée de l'écran. La feuille suit la recette « Modals / Sheets » de
  // l'identité (fenêtre `container-morph`, courbe `Hold / Anchor`) — c'est la
  // même que `snapTo` programmatique, écrite ici parce que le fondu l'accompagne.
  //
  // Le fondu de la feuille et celui des contrôles carte sont un dévoilement
  // échelonné : la feuille est le conteneur, les contrôles sont du support qui
  // arrive après. Le décalage entre les deux est le `stagger` de 40 de la
  // planche, et non deux nombres réglés à la main (360 / 480+120).
  useEffect(() => {
    const morph = M.window(D.containerMorph, D.anticipationHold);
    Animated.parallel([
      Animated.timing(ty, {
        toValue: TY_DEFAULT,
        delay: morph.delay, duration: morph.dur,
        easing: M.easing.hold, useNativeDriver: false,
      }),
      Animated.timing(fade, {
        toValue: 1, duration: D.supportExit,
        easing: M.easing.primary, useNativeDriver: false,
      }),
      Animated.timing(controlsFade, {
        toValue: 1, delay: M.stagger, duration: D.containerMorph,
        easing: M.easing.primary, useNativeDriver: false,
      }),
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

  // Voile : carte assombrie à mesure que la feuille monte — `ScrimLevels`, une
  // opacité par cran (0 au repli, 30 % à mi-hauteur, 50 % en haut). Il est donc
  // déjà nul au cran bas, et le reste en mode `mappick` où la feuille est
  // escamotée à SCREEN_H.
  const scrimOpacity = sheetScrimOpacity(ty, SNAPS, SCREEN_H);

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


  // **Seule la tuile touchée joue sa sortie.** La timeline Figma vit sur la
  // feuille et non sur une tuile, ce qui avait fait conclure que les deux
  // sortaient ensemble ; à l'écran ça se lit comme si on ouvrait les DEUX
  // services à la fois. La tuile touchée est celle qui devient l'écran suivant,
  // c'est donc la seule qui se transforme. _(Décision de l'utilisatrice,
  // 27 août 2026, sur signalement à l'écran.)_
  //
  // L'animation est passée par la tuile elle-même plutôt que retrouvée par index :
  // la tuile pressée tend sa propre `CardAnim`, il n'y a donc aucun appariement à
  // maintenir entre l'ordre de `SERVICES` et celui de `cardAnims`.
  //
  // On joue la sortie AVANT de basculer en mode recherche — l'inverse démonterait
  // la tuile avant qu'elle ait bougé.
  const exiting = useRef(false);
  const onService = (s: Service, anim: CardAnim) => {
    // « Réduire les animations » : on passe directement, sans jouer la sortie.
    if (reduceMotion.current) { openSearch(s.id); return; }
    // Un second tap pendant la sortie relancerait la timeline et empilerait deux
    // navigations.
    if (exiting.current) return;
    exiting.current = true;
    Haptics.selectionAsync();
    cardExit(anim).start();
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
          ferait couper. Il suit le cran par le même `ty`, moins 60.

          Le cadre `recenterFrame` n'est pas décoratif : il rejoue la géométrie
          EXACTE de la feuille pour que le `top` du bouton et le `ty` de la
          feuille se mesurent depuis le même bord. Cf. son commentaire. */}
      {mode === 'services' && (
        <View style={[styles.recenterFrame, { height: SCREEN_H }]} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.recenterWrap,
              { opacity: controlsFade, transform: [{ translateY: Animated.subtract(ty, 60) }] },
            ]}
          >
            <IconButton name="navigate" onPress={() => mapRef.current?.recenter(DAKAR_CENTER, 15)} />
          </Animated.View>
        </View>
      )}

      {/* Draggable bottom sheet — full height, anchored to screen bottom */}
      <Animated.View style={[groupedSheetSurface, styles.sheet, { height: SCREEN_H, transform: [{ translateY: ty }], opacity: fade }]}>
        {mode === 'search' ? (
          <View style={{ height: SEARCH_H }}>
            {/* CARTE 1 — en-tête et les deux champs, dans une seule carte comme
                `Transport / Adresse` (216). La poignée flotte au-dessus, hors
                flux ; toute la carte est zone de glissement. */}
            <View {...panHandlers} style={styles.headerZone}>
              <View style={styles.handleFloat} pointerEvents="none"><Handle /></View>
              <SheetCard style={firstCardEdge}>
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
                  // Pas de `gap` ici : sur une `FlatList`, chaque cellule
                  // enveloppe l'item AVEC son séparateur, donc une gouttière de
                  // conteneur espace les cellules et laisse le filet soudé à la
                  // rangée du dessus. C'est le SÉPARATEUR qui porte les 8, de
                  // part et d'autre — cf. `styles.sep`.
                  //
                  // Pas de `paddingTop` non plus : le padding 16 de la carte
                  // suffit, la maquette n'en ajoute pas.
                  // Le clavier REMPLACE la zone sûre quand il est ouvert : il
                  // couvre déjà la barre système, les additionner ajoutait sa
                  // hauteur en trop.
                  contentContainerStyle={{ paddingBottom: (kbHeight || insets.bottom) + 16 }}
                  renderItem={({ item }) => (
                    <ListRow
                      leading={<Medallion icon={item.icon} ton={item.accent ? 'accent' : 'neutre'} />}
                      title={item.title}
                      subtitle={item.subtitle}
                      trailing={null}
                      onPress={() => handleSelect(item.place)}
                    />
                  )}
                  ItemSeparatorComponent={() => (
                    <View style={styles.sep}><Divider /></View>
                  )}
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
              <SheetCard style={firstCardEdge}>
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
                  <ServiceCard service={course} onPress={() => onService(course, cardAnims[0])} anim={cardAnims[0]} />
                  <ServiceCard service={livraison} onPress={() => onService(livraison, cardAnims[1])} anim={cardAnims[1]} />
                </View>
              </SheetCard>
            </View>

            {/* CARTE 2 — les lieux récents. **Aucun libellé** : c'est
                l'interstice gris de 6 entre les deux cartes qui sépare, pas un
                titre de section (la maquette n'en a pas). */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.flex1}
              contentContainerStyle={styles.stack}
            >
              <SheetCard style={[styles.lastCard, lastCardFill, { paddingBottom: 16 + insets.bottom }]}>
                {/* Le bloc de rangées porte sa propre gouttière de 8 — sans lui,
                    les filets héritaient du 12 de la carte. */}
                <View style={styles.rows}>
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
                </View>
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
  // `height` est posée à l'exécution, depuis le cadre mesuré.
  sheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
  },
  /**
   * Cadre de repère du bouton flottant — MÊME géométrie que `sheet` (`bottom: 0`
   * et la hauteur mesurée), et c'est tout son rôle.
   *
   * La feuille est ancrée au BAS du conteneur ; le bouton, lui, se positionnait
   * en `top: 0` du conteneur avec `translateY = ty - 60`. Les deux ne
   * s'alignaient que si la hauteur réelle de la vue valait exactement
   * `Dimensions.get('window').height`. C'est vrai sur iOS ; ça ne l'est pas
   * garanti sur Android, où la hauteur de fenêtre rapportée et celle du conteneur
   * `flex: 1` ne coïncident pas forcément (barres système, edge-to-edge). Le
   * bouton se retrouvait alors décalé d'exactement cet écart.
   *
   * En posant le bouton dans un cadre qui a la géométrie de la feuille, son
   * `top` se mesure depuis le même bord que le `ty` de la feuille : le 60 tient
   * sur les deux OS, sans branche `Platform`.
   */
  recenterFrame: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
  },
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
  /** Bloc de rangées séparées par des filets : gouttière `space/2`. */
  rows: { gap: Spacing[2] },
  /** Séparateur de liste virtualisée : il porte lui-même les 8 de part et
   *  d'autre, une gouttière de conteneur ne le ferait pas (cf. la `FlatList`). */
  sep: { paddingVertical: Spacing[2] },
  // Interstice gris entre les cartes — le fond `track` de la feuille y passe.
  // `flexGrow: 1` : le conteneur de défilement fait au moins la hauteur du
  // cadre, donc la dernière carte peut s'y étirer (`lastCardFill`) quand le
  // contenu est court — et défiler quand il est long.
  stack: { paddingTop: SHEET_GAP, flexGrow: 1 },
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
  /** Recadrage ACTIF pendant l'ouverture et le repli seulement : la carte est
   *  rognée par le cadre qui grandit, donc elle se dévoile au lieu de déborder
   *  sur les tuiles. Au repos il est retiré, sinon il rognerait la pastille de
   *  fermeture qui déborde de 10. */
  promoClip: { overflow: 'hidden' },
  /** Phase de mesure : hors flux (la mise en page ignore le bloc) et invisible. */
  promoProbing: { position: 'absolute', left: 0, right: 0, opacity: 0 },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radii.card,
    backgroundColor: Colors.blue100,
    paddingLeft: 6,
    paddingRight: 14,
    paddingVertical: PROMO_PAD_V,
    // PLANCHER, pas hauteur fixe : la carte grandit si son titre passe à deux
    // lignes, et son padding de 6 est alors respecté au lieu d'être écrasé. Le
    // cadre s'ouvre sur la hauteur MESURÉE, donc les deux restent d'accord.
    minHeight: PROMO_MIN_H,
  },
  promoTile: {
    width: PROMO_TILE, height: PROMO_TILE,
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
  },
  /** Zone de frappe de la pastille : elle remplit le cadre animé, qui porte
   *  désormais l'opacité de la couche « support ». */
  promoCloseHit: {
    ...StyleSheet.absoluteFillObject,
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
    // Padding 6 plein : la tuile n'a **plus de liseré** depuis l'affinage de la
    // maquette, donc plus rien à compenser (c'était 5 + 1 de bord).
    padding: CARD_PAD,
    gap: CARD_GUTTER,
    backgroundColor: Colors.primarySubtle,
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
    justifyContent: 'center',
    padding: 4,
  },
  // Pas de surcharge d'interligne : le style `body` porte 20, et le pied de 48
  // (padding 4 + 40) tient exactement deux lignes de 20.
  cardBlurb: { flex: 1 },

  // Panneau illustré : fond blanc, calques positionnés en absolu et clipés.
  illoPanel: {
    flex: 1,
    width: '100%',
    // Rayon FIXE : il ne s'anime plus (cf. le calque de fond dans `IlloPanel`).
    borderRadius: Radii.lg,
    overflow: 'hidden',
  },
  /** Le blanc du panneau, porté par un calque qu'on fait fondre. */
  illoPanelFill: { backgroundColor: Colors.surface },
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
