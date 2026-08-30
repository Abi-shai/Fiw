import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, PanResponder, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScreenHeight } from '@/hooks/useScreenHeight';
import { CARD_GAP, Handle, SheetCard, SheetHeader, firstCardEdge, groupedSheetSurface } from '@/components/Sheet';
import Scrim, { ScrimLevels } from '@/components/Scrim';
import { Motion } from '@/constants/tokens';
import { useKeyboardAnimation } from 'react-native-keyboard-controller';

/**
 * Recette « Modals / Sheets » de l'identité de mouvement, mot pour mot : *les
 * modales entrent en 500 ms avec le maintien symétrique, pour des bords fermes,
 * et un maintien de 50 ms laisse la mise en page parente se terminer avant
 * l'ouverture.* D'où la fenêtre `container-morph` et la courbe `Hold / Anchor`
 * là où il y avait un ressort — la règle « Spring for Hero Only » ne laisse le
 * ressort qu'aux composants héros.
 */
const OPEN = Motion.window(Motion.duration.containerMorph, Motion.duration.anticipationHold);
/**
 * Sortie : `container-exit`. Une modale renvoyée est le cas canonique du principe
 * *Asymmetric Timing* — « clear space instantly when dismissed » — donc le bas de
 * la bande. Entrée 500, sortie 200 : l'asymétrie du principe est ici visible en
 * deux lignes de code.
 */
const CLOSE_MS = Motion.duration.containerExit;
/** Ressort du glissé : le lâcher de geste garde sa continuité de vélocité. */
const SPRING = Motion.spring.gentle;
const CLOSE_DY = 120;  // glissé vers le bas au-delà → fermeture
const CLOSE_V = 0.4;   // px/ms : flick vers le bas → fermeture

type Props = {
  /** Appelé une fois l'animation de sortie terminée (démontage). */
  onClose: () => void;
  /** Appelé dès le DÉBUT de la sortie — pour synchroniser une animation
   *  d'arrière-plan (ex. réduire la feuille de fond en même temps). */
  onCloseStart?: () => void;
  title?: string;
  /**
   * Actions de la modale. Elles vivent dans leur **propre carte**, séparée du
   * contenu par la gouttière de 6 — c'est la structure de la maquette
   * (`Modale · Annuler` 499:582, `Modale · SOS` 500:596, `Modale · Paiement`
   * 674:3375), et pas une variante décorative : le contenu explique, les actions
   * engagent, et l'interstice gris dit que ce sont deux natures différentes.
   *
   * Sans `actions`, la feuille n'a qu'une carte.
   */
  actions?: React.ReactNode | ((close: () => void) => React.ReactNode);
  /** Enfants, ou fonction recevant `close` pour fermer avec animation. */
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
};

/**
 * Feuille modale ancrée en bas : entrée par glissement, voile qui suit, fermeture
 * par glissé vers le bas (poignée/en-tête), par flick, ou par tap sur le voile.
 * À monter conditionnellement par le parent ; `onClose` est appelé en fin de
 * sortie. S'appuie sur `sheetSurface` + `Handle` (mêmes tokens que les autres
 * feuilles).
 */
export default function BottomSheet({ onClose, onCloseStart, title, actions, children }: Props) {
  const insets = useSafeAreaInsets();
  const SCREEN_H = useScreenHeight();
  // Toute feuille modale du produit peut contenir un champ : le décalage clavier
  // vit donc ICI, une fois, et non répété dans chaque écran qui en ouvre une.
  //
  // La hauteur du clavier est un `Animated.Value` publié image par image par
  // `react-native-keyboard-controller`, en NATIVE DRIVER — comme `ty`. Les deux
  // se composent donc dans le même `translateY` : la feuille monte s'asseoir sur
  // le clavier en parfaite synchro, et le glissé-pour-fermer continue d'écrire
  // dans `ty` sans rien savoir du clavier.
  //
  // C'est aussi pour ça que le décalage passe par la TRANSFORMATION et non par
  // `paddingBottom` : une valeur en native driver ne peut pas animer une
  // propriété de mise en page.
  const { height: kbHeight } = useKeyboardAnimation();
  const ty = useRef(new Animated.Value(SCREEN_H)).current;

  useEffect(() => {
    Animated.timing(ty, {
      toValue: 0,
      delay: OPEN.delay,
      duration: OPEN.dur,
      easing: Motion.easing.hold,
      useNativeDriver: true,
    }).start();
  }, []);

  const close = () => {
    onCloseStart?.();
    Animated.timing(ty, {
      toValue: SCREEN_H,
      duration: CLOSE_MS,
      easing: Motion.easing.hold,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  // Feuille modale : une seule position ouverte, donc le niveau `half` — pas de
  // cran à suivre, le voile monte et descend avec l'entrée/sortie.
  const scrim = ty.interpolate({
    inputRange: [0, SCREEN_H],
    outputRange: [ScrimLevels.half, 0],
    extrapolate: 'clamp',
  });

  /** Un emplacement accepte un nœud ou une fonction recevant `close`. */
  const slot = (node: React.ReactNode | ((c: () => void) => React.ReactNode)) =>
    typeof node === 'function' ? node(close) : node;

  /** Dernière carte : coins bas carrés (la feuille est ancrée au bord de l'écran)
   *  et zone sûre absorbée EN BLANC, jamais rendue en bande grise sous la feuille. */
  const lastCardStyle = [styles.lastCard, { paddingBottom: 16 + insets.bottom }];

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, g) => g.dy > 4 && Math.abs(g.dy) > Math.abs(g.dx),
    onPanResponderMove: (_, g) => { ty.setValue(Math.max(0, g.dy)); },
    onPanResponderRelease: (_, g) => {
      if (g.dy > CLOSE_DY || g.vy > CLOSE_V) close();
      else Animated.spring(ty, { toValue: 0, ...SPRING, useNativeDriver: true }).start();
    },
  })).current;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Le voile ne capte rien (`pointerEvents="none"`) : c'est le `Pressable`
          frère posé par-dessus qui ferme au tap, comme dans `CountryPicker`. */}
      <Scrim opacity={scrim} />
      <Pressable style={StyleSheet.absoluteFill} onPress={close} />

      <Animated.View
        style={[groupedSheetSurface, styles.sheet, {
          transform: [{ translateY: Animated.subtract(ty, kbHeight) }],
        }]}
      >
        {/* Zone de glissement : la poignée et la carte de contenu. La carte
            d'actions n'en fait PAS partie — on ne veut pas qu'un doigt posé sur un
            bouton commence à traîner la feuille. */}
        <View {...pan.panHandlers}>
          {/* Poignée hors flux, à 6 du haut : la première carte est donc collée
              au sommet de la feuille, comme dans la maquette. */}
          <View style={styles.handleFloat} pointerEvents="none"><Handle /></View>
          <SheetCard style={[firstCardEdge, actions ? null : lastCardStyle]}>
            {/* `marginBottom: 0` : c'est la gouttière de 12 de la carte qui espace
                l'en-tête du corps, pas la marge propre de `SheetHeader`. Les
                cumuler donnerait 28 là où la maquette met 12. */}
            {title ? <SheetHeader title={title} onClose={close} style={styles.headerFlush} /> : null}
            {slot(children)}
          </SheetCard>
        </View>

        {actions ? <SheetCard style={lastCardStyle}>{slot(actions)}</SheetCard> : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Aucun padding de feuille : dans la maquette la respiration vient du padding
  // 16 des cartes, et l'interstice de 6 laisse passer le fond `track`.
  sheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    gap: CARD_GAP,
  },
  handleFloat: {
    position: 'absolute',
    top: 6, left: 0, right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  headerFlush: { marginBottom: 0 },
  lastCard: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
});
