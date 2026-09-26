import React from 'react';
import { Animated, StyleSheet } from 'react-native';

/**
 * Le voile des trois crans de feuille, relevé sur `Scrim state` (836:615) —
 * l'écran de 375×844 de la maquette, où la feuille mesure 220 / 430 / 717 px.
 *
 * **Le cran bas ne porte AUCUN voile.** C'est une décision, pas un oubli : à
 * 25 % la feuille ne fait qu'affleurer, et ce qu'elle laisse voir derrière elle
 * — la carte, le véhicule, l'itinéraire — doit rester franc. Le voile
 * n'apparaît qu'à partir du moment où la feuille prend la moitié de l'écran et
 * devient l'objet regardé.
 *
 * ⚠️ Ne pas confondre ces opacités avec les **niveaux** de `SHEET_LEVELS`
 * (25 / 50 / 85 %), qui sont des HAUTEURS de feuille. Deux échelles, deux
 * axes : un cran de 25 % de hauteur porte un voile de 0 %.
 */
export const ScrimLevels = {
  /** Cran bas (25 % de l'écran) : rien. Le fond doit se lire. */
  collapsed: 0,
  /** Mi-hauteur (50 %) — et par extension la feuille modale, qui mesure 44 à
   *  47 % dans la maquette. */
  half: 0.3,
  /** Cran haut (85 %), le maximum du système — et le tiroir, qui couvre 82 % de
   *  la largeur. */
  full: 0.5,
} as const;

/** Niveaux pris dans l'ordre des crans, du plus haut au plus bas. */
const LEVELS = [ScrimLevels.full, ScrimLevels.half, ScrimLevels.collapsed];

/**
 * Opacité du voile déduite de la position d'une feuille **à trois crans** — à
 * passer directement à `<Scrim opacity={…} />`.
 *
 * `snaps` est la liste des `translateY` de crans dans l'ordre CROISSANT (haut →
 * bas), telle que la reçoit `useSnapSheet` ; `offscreen` est le `translateY` de
 * la feuille absente (fermée ou escamotée), où le voile retombe à zéro. Le voile
 * suit donc le doigt pendant le glissement, sans qu'aucun écran n'ait à
 * réécrire l'interpolation.
 *
 * Une feuille à **position unique** — modale, tiroir, feuille figée — n'a pas de
 * cran à suivre : elle interpole vers le niveau nommé qui lui correspond
 * (`ScrimLevels.half` pour une modale, `ScrimLevels.full` pour un tiroir ou une
 * feuille figée haute), cf. `BottomSheet` et `transport/configure`. Le nombre de
 * crans ne suffit pas à choisir le niveau, d'où deux écritures et non une
 * abstraction de plus.
 *
 * _(Le troisième exemple était le tiroir de menu, qui portait `full` parce qu'il
 * couvrait 82 % de la largeur. Il est devenu la page `app/menu` le 4 septembre
 * 2026 : une page n'a pas de voile. La règle est inchangée — c'est un exemple
 * qu'elle a perdu, pas un cas.)_
 */
export function sheetScrimOpacity(
  ty: Animated.Value,
  snaps: number[],
  offscreen: number,
): Animated.AnimatedInterpolation<number> {
  const xs: number[] = [];
  const ys: number[] = [];
  // ⚠️ `interpolate` exige des abscisses STRICTEMENT croissantes. Les crans
  // mesurés au layout valent tous 0 avant la première mesure, et un cran peut
  // en rejoindre un autre sur un petit écran : on écarte les doublons plutôt
  // que de laisser planter le rendu.
  [...snaps, offscreen].forEach((x, i) => {
    if (xs.length && x <= xs[xs.length - 1]) return;
    xs.push(x);
    ys.push(i < LEVELS.length ? LEVELS[i] : 0);
  });
  if (xs.length < 2) return ty.interpolate({ inputRange: [0, 1], outputRange: [0, 0] });
  return ty.interpolate({ inputRange: xs, outputRange: ys, extrapolate: 'clamp' });
}

/** Voile sombre derrière une bottom sheet. S'assombrit à mesure que la feuille
 *  monte vers les niveaux hauts (`ScrimLevels`) pour concentrer l'attention sur
 *  la feuille et atténuer la carte/le fond. `opacity` est piloté par la position
 *  de la feuille — `sheetScrimOpacity` la construit. `pointerEvents="none"` :
 *  purement visuel, ne bloque jamais les interactions avec le fond ; une feuille
 *  qui se ferme au tap sur le voile pose un `Pressable` frère par-dessus. */
export default function Scrim({ opacity }: { opacity: Animated.AnimatedInterpolation<number> }) {
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.scrim, { opacity }]} />;
}

const styles = StyleSheet.create({
  scrim: { backgroundColor: '#000' },
});
