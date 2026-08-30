import { useRef } from 'react';
import { Dimensions } from 'react-native';
import { useSafeAreaFrame } from 'react-native-safe-area-context';

/**
 * Hauteur **réelle** de la vue — la référence de tous les niveaux de feuille.
 *
 * Et non `Dimensions.get('window').height`, qui était lu une fois au niveau
 * module dans six fichiers. Sur iOS les deux coïncident ; sur Android, pas
 * forcément — barres système, edge-to-edge activé par défaut depuis le SDK 54 —
 * et le plafond de 85 % cessait alors d'être 85 % de ce que l'utilisatrice voit.
 * C'est aussi ce qui décalait le bouton flottant de l'accueil : la feuille et lui
 * se mesuraient depuis deux repères différents.
 *
 * ⚠️ **On garde la PLUS GRANDE hauteur observée, pas la dernière.** Le cadre
 * mesuré rétrécit quand la fenêtre se redimensionne — ce que fait Android à
 * l'ouverture du clavier selon le mode de saisie. Or la géométrie d'une feuille
 * ne doit surtout pas en dépendre : ses crans et sa hauteur se recalculeraient,
 * pendant que son `translateY` continue de porter une valeur absolue calculée
 * dans l'ANCIEN repère. Résultat : la feuille entière saute. C'est un défaut réel,
 * introduit le 27 août 2026 en passant de `Dimensions` au cadre mesuré, et
 * signalé à l'écran sur Android.
 *
 * Le clavier ne peut que rétrécir le cadre, jamais l'agrandir : garder le maximum
 * suffit à immuniser la géométrie, et l'app est verrouillée en portrait donc
 * aucune rotation ne vient légitimement l'agrandir. La cause première est traitée
 * ailleurs — `_layout.tsx` met Android en `adjustNothing` — mais une géométrie qui
 * ne dépend pas du clavier reste juste quel que soit le mode.
 *
 * Le repli sur `Dimensions` n'est pas de la superstition : la position initiale
 * d'une feuille est lue **une seule fois** (`useSnapSheet` garde son
 * `Animated.Value` dans une ref), donc un cadre encore à zéro au premier rendu la
 * figerait pour de bon.
 */
export function useScreenHeight(): number {
  const { height } = useSafeAreaFrame();
  const measured = height || Dimensions.get('window').height;

  // Monotone croissant : `Math.max` est idempotent, donc sûr en phase de rendu.
  const tallest = useRef(measured);
  if (measured > tallest.current) tallest.current = measured;

  return tallest.current;
}
