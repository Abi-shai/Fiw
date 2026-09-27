import React, { useEffect, useRef, useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Animated, ScrollView,
  PanResponder, Dimensions, FlatList, Keyboard,
} from 'react-native';
import HandWithCash from '@/components/HandWithCash';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import LeafletMap, { LeafletMapHandle } from '@/components/LeafletMap';
import IconButton from '@/components/IconButton';
import ListRow from '@/components/ListRow';
import Medallion from '@/components/Medallion';
import Divider from '@/components/Divider';
import PlaceField from '@/components/PlaceField';
import SearchBar from '@/components/SearchBar';
import Button from '@/components/Button';
import Scrim from '@/components/Scrim';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import { CARD_GAP as SHEET_GAP, Handle, SheetCard, SheetHeader, groupedSheetSurface } from '@/components/Sheet';
import { useSnapSheet, SHEET_SPRING } from '@/hooks/useSnapSheet';
import { Colors, Radii, SectionLabel, Shadows, Strokes } from '@/constants/tokens';
import { DAKAR_CENTER, SUGGESTIONS, RECENT_PLACES, PRESTATAIRE } from '@/constants/data';
import { usePlaces } from '@/stores/places';


type Place = { name: string; detail: string; lat: number; lng: number };
type Field = 'departure' | 'destination';
type ResultRow = { key: string; icon: IconName; accent?: boolean; title: string; subtitle?: string; place: Place };

const RECENTS: Place[] = [SUGGESTIONS[2], SUGGESTIONS[0]]; // Almadies, Aéroport AIBD

const SCREEN_H = Dimensions.get('window').height;
// Crans exprimés en translateY de la feuille (0 = couvre tout l'écran).
// translateY plus grand = plus bas / plus replié. La mécanique de drag/snap est
// dans le primitif partagé `useSnapSheet` (même logique côté course active).
// Cran REPLIÉ : le premier bloc dépasse en entier — la bannière Affilié et le
// raccourci « Où allez-vous ? ». 168 est la hauteur exacte de cette carte
// (16 + bannière 76 + gouttière 12 + barre 48 + 16), et 24 d'air la décollent de
// la barre d'accueil. La valeur disait 140 et son commentaire « poignée + titre
// dépassent » : il n'y a plus de titre, et 140 coupait le raccourci en deux.
const PEEK_VISIBLE = 168 + 24;
const TY_EXPANDED = Math.round(SCREEN_H * 0.08); // quasi plein écran
// Cran de REPOS : la feuille commence à 473 sur les 812 de la maquette
// (973:4464), soit 58 % — ses deux cartes font 339 et tiennent exactement dans
// ce qui reste. C'était 40 %, réglé pour une carte de services deux fois plus
// haute ; la feuille s'ouvrait désormais sur une large bande de gris.
const TY_DEFAULT = Math.round(SCREEN_H * 0.58);
const TY_COLLAPSED = SCREEN_H - PEEK_VISIBLE;    // replié en bas
const SNAPS = [TY_EXPANDED, TY_DEFAULT, TY_COLLAPSED]; // croissant : haut → bas
const TAP_THRESHOLD = 6;
// Hauteur de la carte « Course en cours » flottante, relevée sur la maquette
// (973:4610) : 97 = padding 16 × 2 + kicker 15 + 2 + `heading1` 28 + 2 +
// `bodySmall` 18. Elle est FIXE et non mesurée parce que ses trois lignes le
// sont — le nom du Prestataire et le véhicule tiennent sur une ligne tronquée.
// C'est elle qui décale la carte au-dessus de l'arête de la feuille.
const COURSE_CARD_H = 97;
// L'air entre la carte et l'arête de la feuille, relevé lui aussi : la carte
// finit à 457, la feuille commence à 473.
const COURSE_CARD_GAP = 16;

// Hauteur visible du sheet une fois étendu : borne le contenu de recherche
// pour que la liste scrolle dans l'écran (le sheet fait toute la hauteur).
const SEARCH_H = SCREEN_H - TY_EXPANDED;


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
          {/* Une SEULE ligne, ellipse comprise (14 septembre 2026). La phrase
              fait 38 signes là où la colonne en tient une trentaine : elle se
              coupe donc, et c'est assumé — la bannière gagne en compacité ce
              qu'elle perd en fin de phrase, et le point d'interrogation suffit
              à dire que c'en est une.
              ⚠️ Cette ligne est PARTAGÉE avec la bannière du Menu
              (`app/menu.tsx`) : toute retouche se fait des deux côtés. */}
          <Text variant="body" color={Colors.textSecondary} numberOfLines={1}>
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
  // Bannière Affilié refermée : le proto ne la persiste pas d'un lancement à l'autre.
  const [promoDismissed, setPromoDismissed] = useState(false);
  // Interrupteur de démo (facilitateur) : une Commande Transport est-elle en
  // cours pendant qu'on est revenu sur l'accueil ? Le cas était signalé comme
  // NON DESSINÉ au recap du 30 août 2026 (« l'utilisateur revient à l'accueil
  // pendant une course en cours ») ; il l'est désormais. Faute d'un store de
  // Commande dans le proto, c'est la pilule « Démo · … » qui le joue — le même
  // objet que sur `menu` et `searching`, et c'est cette constance qui le fait
  // reconnaître comme un facilitateur plutôt que comme un élément de l'app.
  const [courseEnCours, setCourseEnCours] = useState(false);
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

  // Le raccourci « Où allez-vous ? » se comporte comme la barre de recherche
  // d'InDrive : la feuille déjà présente monte en plein écran et bascule en mode
  // recherche. Il reste paramétré par service — les deux tuiles l'appelaient
  // chacune avec le sien, et le retour d'édition depuis `livraison/configure`
  // s'en sert encore.
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

  // Zone de bord gauche : le swipe gauche → droite ouvrait le drawer ; il pousse
  // maintenant la page Menu. Le geste est conservé — c'est le raccourci que le
  // Client connaît — mais il ne suit plus le doigt : il déclenche la transition
  // de pile, comme le bouton. Sur la page ouverte, c'est le geste de bord
  // inverse qui ramène ici (cf. style-guide, « Transitions & navigation »).
  const edgePan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, g) =>
      g.dx > 10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
    onPanResponderRelease: (_, g) => {
      if (g.dx > 20) router.push('/menu');
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
          <IconButton name="menu" onPress={() => router.push('/menu')} />
          {/* Interrupteur de démo (facilitateur) : bascule l'état « une course
              est en cours ». Invisible en production. Pilule blanche à liseré
              et ombre flottante — le même objet que le « Démo · … » de `menu`
              et de `searching`. */}
          <View style={styles.flex1} />
          <TouchableOpacity
            style={styles.demoChip}
            activeOpacity={0.85}
            onPress={() => { Haptics.selectionAsync(); setCourseEnCours((v) => !v); }}
          >
            <Icon name="lightning" size={12} weight="bold" color={Colors.textSecondary} />
            <Text variant="caption" color={Colors.textSecondary}>
              Démo · Course : {courseEnCours ? 'en cours' : 'aucune'}
            </Text>
          </TouchableOpacity>
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

      {/* ── Course en cours ───────────────────────────────────────────────
          La Commande Transport continue pendant qu'on est revenu sur
          l'accueil : la carte flottante le RAPPELLE et ramène au suivi.
          Maquette 973:4610.

          Quatre décisions y tiennent :

          · **Elle flotte sur la carto, elle n'entre pas dans la feuille.** Ce
            n'est pas un contenu de l'accueil, c'est un état de l'app qui le
            surplombe — et c'est aussi ce qui lui permet de rester visible
            quand la feuille est repliée. Elle prend donc le traitement des
            éléments flottants du style guide : liseré `hairline` + ombre
            `float`. La feuille recadre son contenu (`overflow: hidden`), un
            enfant hors bornes s'y ferait couper — même raison que le bouton de
            recentrage, qui vit dehors lui aussi.
          · **Elle suit le cran de la feuille** par le même `ty`, décalé de sa
            propre hauteur plus l'air de 16 : son bas reste collé à l'arête,
            quel que soit le cran.
          · **Ce qu'elle affiche, c'est l'heure d'arrivée** — pas « course en
            cours » en gros. Le kicker nomme l'état, le `heading1` porte la
            seule chose qu'on revient vérifier, et la troisième ligne dit qui
            vient. Le bleu du kicker est assumé : le bleu MARQUE UN ÉTAT dans
            l'app, et c'en est un. `SectionLabel` ne prescrit que la casse ; sa
            couleur se compose au point d'appel (tertiaire partout ailleurs, où
            il ne fait que coiffer une liste).
          · Elle est **tappable en entier** et ramène au suivi. */}
      {mode === 'services' && courseEnCours && (
        <Animated.View
          style={[
            styles.courseDock,
            {
              opacity: controlsFade,
              transform: [{ translateY: Animated.subtract(ty, COURSE_CARD_H + COURSE_CARD_GAP) }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.courseCard}
            activeOpacity={0.9}
            onPress={() => router.push('/transport/course-active')}
          >
            <View style={styles.courseText}>
              <Text variant="captionMedium" color={Colors.primary} style={styles.courseKicker}>
                Course en cours
              </Text>
              {/* Proto : l'heure est figée. Elle viendra du compte à rebours
                  réel de `course-active`. */}
              <Text variant="heading1" numberOfLines={1}>Arrivée vers 14:32</Text>
              {/* Lu depuis la SOURCE réelle — le Prestataire du proto — et non
                  réécrit ici : les deux écrans doivent dire le même nom. */}
              <Text variant="bodySmall" color={Colors.textSecondary} numberOfLines={1}>
                {PRESTATAIRE.name} · {PRESTATAIRE.vehicle}
              </Text>
            </View>
            <Icon name="chevronRight" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Recentrage géoloc — flotte 60 au-dessus de l'arête de la feuille, SUR la
          carte. Il vit hors de la feuille : celle-ci recadre son contenu (les 32
          variantes sont en `clipsContent`), donc un enfant en `top: -60` s'y
          ferait couper. Il suit le cran par le même `ty`, moins 60. */}
      {mode === 'services' && (
        <Animated.View
          style={[
            styles.recenterWrap,
            {
              opacity: controlsFade,
              // Il se pose 60 au-dessus de l'arête — ou au-dessus de la carte
              // « Course en cours » quand elle occupe cette place.
              transform: [{
                translateY: Animated.subtract(
                  ty,
                  courseEnCours ? COURSE_CARD_H + COURSE_CARD_GAP + 60 : 60,
                ),
              }],
            },
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
            {/* CARTE 1 — la bannière et le raccourci de recherche (maquette
                973:4464, « S2 — Où allez-vous ? en tête »). La poignée flotte
                hors flux ; toute la carte est zone de glissement.

                ── Ce que le 27 septembre 2026 a retiré ─────────────────────
                **Le titre « De quoi avez-vous besoin ? » et les deux tuiles de
                service.** Fiw entre sur le marché avec le seul **Transport** :
                une grille de services qui n'a qu'une case n'est plus une
                grille, et la question « de quoi avez-vous besoin ? » n'a plus
                de réponse à offrir. L'accueil redevient ce qu'il est chez tous
                les VTC — une carte et une destination à saisir.

                La Livraison n'est pas supprimée pour autant : `app/livraison/`
                reste en place et la feuille de recherche sait encore la servir
                (cf. `SEARCH_COPY`), elle n'a simplement plus de porte sur
                l'accueil. Le jour où elle ouvre, c'est ici que sa tuile revient
                — avec l'entrée animée, qui vit dans l'historique git. */}
            <View {...panHandlers} style={styles.headerZone}>
              <View style={styles.handleFloat} pointerEvents="none"><Handle /></View>
              <SheetCard>
                {/* Bannière Affilié Réseau — refermable */}
                {!promoDismissed && (
                  <AffiliePromo
                    onPress={() => router.push('/affilie/presentation')}
                    onDismiss={() => setPromoDismissed(true)}
                  />
                )}

                {/* Raccourci de recherche — un BOUTON qui a l'apparence d'une
                    barre : le tap fait monter la feuille et bascule en mode
                    recherche, où les vrais champs De/À prennent la main. Ce
                    n'est pas un champ qu'on remplirait ici, sinon la saisie
                    serait balayée au morph.
                    ⚠️ Écart signalé : la maquette pose ce raccourci SANS liseré.
                    Le composant garde celui de sa variante `sheet` (`border`
                    1 px), que le style guide documente comme le traitement du
                    champ au repos — sur une carte blanche, un `bg` nu ne se
                    détache pas assez pour se lire comme un contrôle. */}
                <SearchBar
                  placeholder="Où allez-vous ?"
                  onPress={() => openSearch('transport')}
                />
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
    </View>
  );
}

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

  // ── Carte « Course en cours » ────────────────────────────────────────────
  // Gouttière 16 de chaque côté (343 de large sur 375, comme la maquette), et
  // `top: 0` : c'est la translation animée qui la place, comme pour le
  // recentrage.
  courseDock: {
    position: 'absolute',
    top: 0,
    left: 16, right: 16,
  },
  // Géométrie d'une `SheetCard` (surface, rayon `lg`, padding 16) — mais posée
  // SUR la carto, donc avec le traitement des éléments flottants du style
  // guide : liseré `hairline` + ombre `float`. Ce n'en est pas une : une
  // `SheetCard` est une carte DANS une feuille groupée, celle-ci n'a pas de
  // feuille. Même dessin, deux emplois.
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: Strokes.hairline,
    borderColor: Colors.hairline,
    padding: 16,
    ...Shadows.float,
  },
  // 2 entre les trois lignes : elles forment un seul bloc de lecture, pas trois
  // rangées. Valeur de la maquette, sous le plancher des jetons d'espacement
  // (réglage optique interne à un bloc, comme le gap 3 de la bannière Affilié).
  courseText: { flex: 1, gap: 2 },
  // Seule la CASSE vient du jeton ; la couleur se compose au point d'appel —
  // `primary` ici, parce que le bleu marque un état.
  courseKicker: { ...SectionLabel },

  // Interrupteur de démo (facilitateur) : posé dans la barre haute, à droite du
  // bouton Menu. Invisible en production.
  demoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: Radii.pill,
    paddingVertical: 8, paddingHorizontal: 12,
    borderWidth: Strokes.hairline, borderColor: Colors.hairline,
    ...Shadows.float,
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
