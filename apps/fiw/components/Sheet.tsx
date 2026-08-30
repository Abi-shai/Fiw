import React from 'react';
import { View, StyleSheet, Animated, ViewStyle, StyleProp, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radii, Shadows, Strokes } from '@/constants/tokens';
import Text from '@/components/Text';
import IconButton from '@/components/IconButton';

export const SHEET_RADIUS = Radii.xl;

/**
 * Les trois niveaux d'une feuille — sa hauteur VISIBLE en fraction d'écran.
 * Il n'y en a que trois, et **85 % est un plafond dur** : une feuille ne
 * grandit jamais au-delà, quel que soit son contenu. Du contenu qui ne tient
 * pas **scrolle dans la feuille** ; on ne gagne pas de hauteur en rognant la
 * carte, qui est ce que le Client garde sous les yeux.
 *
 * Miroir de `Scrim state` (836:615) : sur l'écran de 375×844 de la maquette, la
 * feuille mesure 220 (26 %), 430 (51 %) et 717 px (85 %).
 *
 * À ne pas confondre avec `ScrimLevels`, qui donne l'opacité du voile à chacun
 * de ces crans (0 / 30 / 50 %).
 */
export const SHEET_LEVELS = { collapsed: 0.25, half: 0.5, full: 0.85 } as const;

/** Hauteur maximale d'une feuille — le plafond de 85 %. Sert à borner le corps
 *  scrollable, pas à fixer la hauteur : une feuille plus courte que son plafond
 *  épouse toujours son contenu. */
export const sheetMaxH = (screenH: number) => Math.round(screenH * SHEET_LEVELS.full);

/**
 * `translateY` des trois crans d'une feuille de hauteur `sheetH` ancrée en bas,
 * dans l'ordre CROISSANT (haut → bas) attendu par `useSnapSheet`.
 *
 * Un cran, c'est « la feuille montre tel pourcentage de l'écran » : la feuille
 * est donc décalée de ce qui dépasse, `sheetH - screenH × niveau`. Une feuille
 * plus courte qu'un niveau ne peut pas l'atteindre — le cran vaut alors 0 (elle
 * est déjà entièrement visible), et deux crans peuvent se confondre. C'est
 * correct : une petite feuille n'a pas trois hauteurs à offrir.
 */
export function sheetSnaps(screenH: number, sheetH: number): number[] {
  return [SHEET_LEVELS.full, SHEET_LEVELS.half, SHEET_LEVELS.collapsed]
    .map((level) => Math.max(0, Math.round(sheetH - screenH * level)));
}

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

/**
 * Coins hauts de la PREMIÈRE carte d'une feuille groupée.
 *
 * La maquette obtient son arête autrement : ses 32 variantes sont en
 * `clipsContent`, et la première carte — pleine largeur, rayon 16 — est **coupée**
 * par l'arc de 28 du conteneur. Le rendu montre donc une carte qui suit l'arc de
 * la feuille.
 *
 * ⚠️ On ne peut pas reproduire ce mécanisme tel quel en React Native : sur iOS,
 * `overflow: 'hidden'` pose `clipsToBounds` sur la couche, et **une couche qui se
 * recadre rogne aussi sa propre ombre**. Recadrer la feuille fait donc disparaître
 * `Shadows.sheet` — c'est arrivé, et ça se voit tout de suite.
 *
 * D'où ce style : au lieu de couper la carte, on lui fait **suivre l'arc**. Mêmes
 * pixels, mécanisme différent, et l'ombre survit. À poser sur la première carte
 * de chaque feuille groupée ; `GroupedSheet` le fait pour vous.
 */
export const firstCardEdge: ViewStyle = {
  borderTopLeftRadius: SHEET_RADIUS,
  borderTopRightRadius: SHEET_RADIUS,
};

/**
 * Dernière carte d'une feuille à hauteur FIXE : elle **prend la hauteur restante**
 * au lieu d'épouser son contenu.
 *
 * Une feuille dont la hauteur est un cran (25 / 50 / 85 %) ne rétrécit pas quand
 * son contenu est court : le fond `track` gris apparaît alors sous la dernière
 * carte, et la feuille se lit comme une carte posée dans un vide gris plutôt que
 * comme une surface. C'est ce que la maquette corrige en donnant `layoutGrow: 1`
 * à sa dernière carte (`Scrim state`, `State=Half` → `Récemment`, 836:611) :
 * blanc jusqu'au bord, quelle que soit la quantité de contenu.
 *
 * ⚠️ Les rangées à l'intérieur, elles, continuent d'épouser leur contenu et
 * restent en haut de la carte — c'est la carte qui s'étire, pas ce qu'elle
 * contient (`Lignes` est en `AUTO` dans la maquette).
 *
 * À poser avec un conteneur de défilement en `flexGrow: 1` sur son
 * `contentContainerStyle`, pour que la carte puisse s'étirer quand le contenu est
 * court ET défiler quand il est long. Ne s'applique PAS à une feuille qui épouse
 * son contenu (`GroupedSheet` par défaut) : là, il n'y a pas d'espace restant.
 */
export const lastCardFill: ViewStyle = { flex: 1 };

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
/** Gouttière INTERNE d'une carte de feuille, entre ses blocs de contenu. À ne pas
 *  confondre avec `CARD_GAP`, qui sépare les cartes entre elles. Exposée parce
 *  qu'un bloc qui se replie à la fermeture doit l'annuler pour ne pas laisser un
 *  trou de 12 (cf. la bannière Affilié de l'accueil). */
export const CARD_CONTENT_GAP = 12;

/** Chrome du bottom sheet (coins hauts, ombre) mais fond `track` gris. */
export const groupedSheetSurface: ViewStyle = {
  ...sheetSurface,
  backgroundColor: Colors.track,
};

/** Carte blanche d'un groupe : surface, rayon `lg`, **padding 16 sur les quatre
 *  côtés**, gouttière 12. Les vingt instances de `SheetCard` de la maquette sont
 *  toutes à 16/16/16/16 — le py:20 d'avant ajoutait 8 de haut à CHAQUE carte du
 *  produit, soit 32 sur une feuille à quatre cartes. */
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
 *     latéral ; la respiration vient uniquement du padding 16 interne des cartes ;
 *   • cartes blanches PLEINE LARGEUR à padding 16, interstice de 6 (le `track`
 *     transparaît) ;
 *   • poignée flottante en absolu à 6px du haut, centrée, hors flux (elle
 *     n'occupe aucune hauteur — la 1re carte est donc collée au sommet) ;
 *   • la zone sûre du bas est absorbée EN BLANC par la dernière carte, jamais
 *     rendue en bande grise sous la feuille.
 *
 * Les deux cartes extrêmes sont reprises : la première suit l'arc de la feuille
 * (`firstCardEdge` — cf. son commentaire, c'est ce qui remplace le recadrage que
 * l'ombre interdit), la dernière a ses coins bas carrés et absorbe la zone sûre
 * en blanc.
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
          if (i === 0) Object.assign(edge, firstCardEdge);
          if (i === last) {
            edge.borderBottomLeftRadius = 0;
            edge.borderBottomRightRadius = 0;
            edge.paddingBottom = 16 + insets.bottom; // padding 16 de la maquette + zone sûre
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
    padding: 16,
    gap: CARD_CONTENT_GAP,
  },
});
