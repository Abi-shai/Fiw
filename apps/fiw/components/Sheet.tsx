import React from 'react';
import { View, StyleSheet, Animated, ViewStyle, StyleProp, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radii, Shadows, Strokes } from '@/constants/tokens';
import Text from '@/components/Text';
import IconButton from '@/components/IconButton';

export const SHEET_RADIUS = Radii.xl;

/**
 * Habillage visuel commun à toutes les feuilles (bottom sheets) de l'app :
 * coins arrondis en haut, fond surface, ombre portée vers le haut.
 * Source unique de vérité — à appliquer aussi sur les `Animated.View`
 * des feuilles déplaçables pour qu'elles restent identiques.
 */
export const sheetSurface: ViewStyle = {
  backgroundColor: Colors.surface,
  borderTopLeftRadius: SHEET_RADIUS,
  borderTopRightRadius: SHEET_RADIUS,
  // Liseré fin sur l'arête haute : détache la feuille du fond carto.
  borderTopWidth: Strokes.hairline,
  borderColor: Colors.hairline,
  ...Shadows.sheet,
};

/** Poignée de glissement standard, alignée au centre. */
export function Handle({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.handle, style]} />;
}

/**
 * En-tête standard des feuilles : titre `heading1` à gauche + croix (close)
 * optionnelle à droite. Source unique de vérité pour que toutes les feuilles
 * (configure, recherche accueil, feuilles modales) partagent exactement le même
 * placement et la même typo.
 */
export function SheetHeader({ title, onClose, style }: {
  title: string; onClose?: () => void; style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.headerRow, style]}>
      <Text variant="heading1" style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      {onClose && (
        <IconButton name="close" variant="flat" color={Colors.textPrimary} onPress={onClose} />
      )}
    </View>
  );
}

type SheetProps = {
  children: React.ReactNode;
  /** Ancre la feuille en bas de l'écran (position absolue). */
  floating?: boolean;
  /** Affiche la poignée de glissement en haut. */
  handle?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Feuille statique (non déplaçable). Pour les feuilles animées, appliquer
 *  `sheetSurface` directement sur l'`Animated.View`. */
export default function Sheet({ children, floating, handle, style }: SheetProps) {
  return (
    <View style={[sheetSurface, floating && styles.floating, style]}>
      {handle && (
        <View style={styles.handleArea}>
          <Handle />
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  floating: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
  },
  handleArea: {
    paddingTop: 10,
    paddingBottom: 14,
    alignItems: 'center',
  },
  handle: {
    width: 40, height: 5,
    borderRadius: 3,
    backgroundColor: Colors.border,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: { flex: 1 },
});


/* ------------------------------------------------------------------ *
 *  Feuille groupée — le second motif de feuille du produit.
 *
 *  Là où `Sheet` est une surface blanche unique, la feuille groupée est un
 *  fond `track` gris d'où émergent des cartes blanches pleine largeur
 *  séparées d'un interstice de 6. Les deux motifs partagent le même chrome
 *  (coins hauts, ombre, poignée), d'où leur cohabitation ici.
 * ------------------------------------------------------------------ */

/** Rayon des cartes de feuille : `lg`. Le palier `card` (20) reste celui des
 *  cartes de CONTENU posées dans la feuille (bloc véhicule, groupe véhicule) ;
 *  la carte de feuille elle-même, qui porte la largeur pleine, est à 16. */
export const CARD_RADIUS = Radii.lg;
/** Interstice gris entre cartes (= fond `track` qui transparaît). */
export const CARD_GAP = 6;

/** Chrome du bottom sheet (coins hauts, ombre) mais fond `track` gris. */
export const groupedSheetSurface: ViewStyle = {
  ...sheetSurface,
  backgroundColor: Colors.track,
};

/** Carte blanche d'un groupe (surface, rayon 20, px16 py20, gap 12). */
export function SheetCard({ children, style }: {
  children: React.ReactNode; style?: StyleProp<ViewStyle>;
}) {
  return <View style={[groupedStyles.card, style]}>{children}</View>;
}

/** Aplati les enfants en cartes réelles : `React.Children.toArray` ne descend PAS
 *  dans les fragments, or les écrans passent souvent un `<>…</>` (branches de
 *  ternaire). On déplie donc les fragments pour atteindre les vraies cartes —
 *  sinon l'injection d'arêtes tomberait sur le fragment (« Invalid prop `style`
 *  supplied to React.Fragment »). */
function flattenCards(children: React.ReactNode): React.ReactElement<{ style?: StyleProp<ViewStyle> }>[] {
  const out: React.ReactElement<{ style?: StyleProp<ViewStyle> }>[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === React.Fragment) {
      out.push(...flattenCards((child.props as { children?: React.ReactNode }).children));
    } else {
      out.push(child as React.ReactElement<{ style?: StyleProp<ViewStyle> }>);
    }
  });
  return out;
}

/**
 * Conteneur de feuille groupée — miroir EXACT du bottom sheet Figma
 * (« Fiw — Maquettes Client », frame 118:305 et dérivés). Source unique de
 * vérité : toutes les feuilles Transport (searching, configure, course) passent
 * par ici pour rester pixel-fidèles aux maquettes.
 *
 * Géométrie reprise telle quelle des maquettes :
 *   • fond `track`, coins hauts rayon 28, ancré en bas, AUCUN padding de
 *     feuille — dans Figma le conteneur n'a ni padding haut/bas ni padding
 *     latéral ; la respiration vient uniquement du py:20 interne des cartes ;
 *   • cartes blanches PLEINE LARGEUR, interstice de 6 (le `track` transparaît) ;
 *   • poignée flottante en absolu à 6px du haut, centrée, hors flux (elle
 *     n'occupe aucune hauteur — la 1re carte est donc collée au sommet) ;
 *   • la zone sûre du bas est absorbée EN BLANC par la dernière carte, jamais
 *     rendue en bande grise sous la feuille.
 *
 * Les coins de la 1re carte (haut) et de la dernière (bas) sont alignés sur la
 * feuille (28 en haut, carrés en bas) pour épouser le conteneur sans liseré gris.
 */
export function GroupedSheet({
  children, translateY, contentStyle, onLayout, handle = true, style,
}: {
  children: React.ReactNode;
  /** Valeur animée de translation verticale (entrée/sortie), pilotée par l'écran. */
  translateY?: Animated.Value;
  /** Style animé appliqué à la pile de cartes (ex. fondu de contenu par phase). */
  contentStyle?: StyleProp<ViewStyle>;
  onLayout?: (e: LayoutChangeEvent) => void;
  handle?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const cards = flattenCards(children);
  const last = cards.length - 1;

  return (
    <Animated.View
      style={[groupedSheetSurface, groupedStyles.groupedSheet, style, translateY ? { transform: [{ translateY }] } : null]}
      onLayout={onLayout}
    >
      <Animated.View style={[groupedStyles.groupedStack, contentStyle]}>
        {cards.map((child, i) => {
          // Aligne les coins extrêmes sur la feuille et absorbe la zone sûre en blanc.
          // La maquette laisse les quatre coins de CHAQUE carte à `lg` : le fond
          // `track` de la feuille transparaît donc dans les coins hauts, c'est
          // la lèvre grise du motif. Seul le bas est repris ici — la feuille est
          // ancrée au bord de l'écran, ce que la maquette flottante ne dit pas.
          const edge: ViewStyle = {};
          if (i === last) {
            edge.borderBottomLeftRadius = 0;
            edge.borderBottomRightRadius = 0;
            edge.paddingBottom = 20 + insets.bottom; // py:20 des maquettes + zone sûre
          }
          return React.cloneElement(child, { style: [child.props.style, edge] });
        })}
      </Animated.View>

      {handle && (
        <View style={groupedStyles.groupedHandle} pointerEvents="none"><Handle /></View>
      )}
    </Animated.View>
  );
}

const groupedStyles = StyleSheet.create({
  // Géométrie fidèle aux maquettes (aucun padding de feuille).
  groupedSheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
  },
  groupedStack: { gap: CARD_GAP },
  groupedHandle: {
    position: 'absolute',
    top: 6, left: 0, right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: CARD_RADIUS,
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
});
