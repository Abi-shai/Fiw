import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import IconButton from '@/components/IconButton';

/**
 * Contrôles flottants posés **au-dessus d'une feuille**, sur la carte : retour à
 * gauche, recentrage à droite.
 *
 * ⚠️ **Ce composant existe parce que son absence se voyait.** Le motif était
 * réimplémenté dans quatre écrans, de quatre façons différentes — `mapControls`
 * ancré en `bottom`, `floatControls` posé en `top: -60` DANS la feuille,
 * `controls` réduit au seul retour, et le cadre animé de l'accueil. Résultat :
 * `course-active` et `livraison/suivi` n'en avaient **aucun**, donc on ne pouvait
 * pas recentrer la carte pendant une course ni pendant une livraison — précisément
 * les deux moments où on en a le plus besoin. Une chose qui n'est pas un composant
 * finit par manquer quelque part sans que personne s'en aperçoive.
 *
 * **Ancré en `bottom` et frère de la feuille, jamais son enfant.** Un enfant posé
 * en `top` négatif déborde d'une vue à coins arrondis, et Android le rogne — c'est
 * le même piège que la pastille de fermeture de la bannière Affilié. En frère
 * ancré sur le même bord que la feuille, les deux vivent dans le même repère et le
 * décalage de 12 tient sur les deux OS (cf. `docs/style-guide.md` § Les deux OS,
 * « un repère, pas deux »).
 *
 * `translateY` sert aux feuilles à crans : les contrôles suivent la feuille quand
 * elle monte ou descend, sans que l'écran ait à recalculer quoi que ce soit.
 */
export default function MapControls({ sheetH, translateY, onBack, onRecenter }: {
  /** Hauteur mesurée de la feuille — les contrôles se posent 12 au-dessus. */
  sheetH: number;
  /** Translation de la feuille, pour qu'ils la suivent d'un cran à l'autre. */
  translateY?: Animated.Value | Animated.AnimatedInterpolation<number>;
  /** Absent = pas de retour. Une course en cours ne se quitte pas en arrière. */
  onBack?: () => void;
  /** Absent = pas de recentrage. */
  onRecenter?: () => void;
}) {
  // Tant que la feuille n'est pas mesurée, les poser serait les poser n'importe où.
  if (!sheetH || (!onBack && !onRecenter)) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.row,
        { bottom: sheetH + 12 },
        translateY ? { transform: [{ translateY }] } : null,
      ]}
    >
      {/* La vue vide garde le recentrage à DROITE quand il n'y a pas de retour :
          `space-between` a besoin de deux enfants pour tenir ses deux bords. */}
      {onBack ? <IconButton name="back" onPress={onBack} /> : <View />}
      {onRecenter ? <IconButton name="navigate" onPress={onRecenter} /> : <View />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'absolute',
    left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
});
