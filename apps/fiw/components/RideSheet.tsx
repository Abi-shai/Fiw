import React from 'react';
import {
  View, StyleSheet, TouchableOpacity, Image, Animated,
  type StyleProp, type ViewStyle, type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import { sheetSurface, SHEET_RADIUS, Handle } from '@/components/Sheet';
import { Colors, Radii, Poppins } from '@/constants/tokens';
import { gammeIllustration, type IlluKey } from '@/constants/illustrations';

/**
 * Composants de la feuille Transport — miroir 1:1 de la décomposition du design
 * system Figma (fichier « Fiw — Maquettes Client ») pour garder code ↔ Figma
 * synchronisés. Un seul langage : la feuille est un fond `track` gris d'où
 * émergent des cartes blanches (rayon 20, interstice 6). Chaque composant reprend
 * les mêmes tokens/rayons/espacements que son homologue Figma.
 *
 * Correspondance :
 *   BottomSheet (states)  → `groupedSheetSurface` + `SheetCard`
 *   ProgressBar (84:84)   → `ProgressBar`
 *   Badge (84:76 / 84:80) → `Badge` variant bienNote | suggere
 *   PlateChip (84:74)     → `PlateChip`
 *   DriverRow (87:74)     → `DriverRow`
 *   VehicleBlock (163:811)→ `VehicleBlock`
 *   (156:847 wrapper)     → `VehicleGroup`
 *   AltSuggestCard (89:*) → `AltSuggestCard`
 *   ActionPill (86:86)    → `ActionPill`
 */

// Rayon des cartes groupées : 20 dans les maquettes (palier propre à ce motif).
export const CARD_RADIUS = 20;
// Interstice gris entre cartes (= fond `track` qui transparaît).
export const CARD_GAP = 6;

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/[\s  ]/g, '.');

export type RideDriver = {
  name: string; vehicle: string; color: string; plate: string;
  rating: number; trips: number;
};

/** Chrome du bottom sheet (coins hauts, ombre) mais fond `track` gris. */
export const groupedSheetSurface: ViewStyle = {
  ...sheetSurface,
  backgroundColor: Colors.track,
};

/** Carte blanche d'un groupe (surface, rayon 20, px16 py20, gap 12). */
export function SheetCard({ children, style }: {
  children: React.ReactNode; style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
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
      style={[groupedSheetSurface, styles.groupedSheet, style, translateY ? { transform: [{ translateY }] } : null]}
      onLayout={onLayout}
    >
      <Animated.View style={[styles.groupedStack, contentStyle]}>
        {cards.map((child, i) => {
          // Aligne les coins extrêmes sur la feuille et absorbe la zone sûre en blanc.
          const edge: ViewStyle = {};
          if (i === 0) { edge.borderTopLeftRadius = SHEET_RADIUS; edge.borderTopRightRadius = SHEET_RADIUS; }
          if (i === last) {
            edge.borderBottomLeftRadius = 0;
            edge.borderBottomRightRadius = 0;
            edge.paddingBottom = 20 + insets.bottom; // py:20 des maquettes + zone sûre
          }
          return React.cloneElement(child, { style: [child.props.style, edge] });
        })}
      </Animated.View>

      {handle && (
        <View style={styles.groupedHandle} pointerEvents="none"><Handle /></View>
      )}
    </Animated.View>
  );
}

/** ProgressBar (Figma 84:84) — piste `track` h6, remplissage `primary`.
 *  `progress` (Animated.Value 0→1) anime la largeur ; sinon `value` statique. */
export function ProgressBar({ progress, value = 0.6 }: {
  progress?: Animated.Value; value?: number;
}) {
  const width = progress
    ? progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
    : `${Math.round(value * 100)}%`;
  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, { width } as any]} />
    </View>
  );
}

/** Pile d'avatars à initiale unique et teintes distinctes (Figma searching). */
export function AvatarStack({ items }: { items: { label: string; bg: string; fg: string }[] }) {
  return (
    <View style={styles.avatarStack}>
      {items.map((it, i) => (
        <View key={it.label + i} style={[styles.stackAvatar, { backgroundColor: it.bg }, i > 0 && styles.stackOverlap]}>
          <Text style={[styles.stackAvatarTxt, { color: it.fg }]}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}

/** Badge (Figma 84:76 « Bien noté » / 84:80 « Suggéré »). */
export function Badge({ variant, label }: { variant: 'bienNote' | 'suggere'; label?: string }) {
  if (variant === 'bienNote') {
    return (
      <View style={[styles.badge, styles.badgeSuccess]}>
        <Icon name="star" size={10} weight="fill" color={Colors.success} />
        <Text style={[styles.badgeTxt, { color: Colors.success }]}>{label ?? 'Bien noté'}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badge, styles.badgeInfo]}>
      <Text style={[styles.badgeTxt, { color: Colors.primary }]}>{label ?? 'Suggéré'}</Text>
    </View>
  );
}

/** PlateChip (Figma 84:74) — pastille plaque, bordure 1.5, Poppins Bold. */
export function PlateChip({ plate }: { plate: string }) {
  return (
    <View style={styles.plateChip}>
      <Text style={styles.plateText}>{plate}</Text>
    </View>
  );
}

/** Avatar prestataire des cartes (Figma) — 64, fond primarySubtle, liseré blanc,
 *  initiales primaryPressed. */
function DriverAvatar({ name, size = 64 }: { name: string; size?: number }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
  return (
    <View style={[styles.driverAvatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.driverAvatarTxt, { fontSize: size * 0.34 }]}>{initials}</Text>
    </View>
  );
}

/** DriverRow (Figma 87:74) — avatar + nom + note + chevron. */
export function DriverRow({ driver, onPress }: {
  driver: RideDriver; onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.driverRow}
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={!onPress}
    >
      <DriverAvatar name={driver.name} />
      <View style={styles.driverCol}>
        <Text variant="heading2" numberOfLines={1}>{driver.name}</Text>
        <View style={styles.ratingRow}>
          <Icon name="star" size={14} weight="fill" color={Colors.warning} />
          <Text variant="bodySmall" style={styles.ratingVal}>{driver.rating}</Text>
          <Text variant="bodySmall" color={Colors.textSecondary}>· {fmt(driver.trips)} courses</Text>
        </View>
      </View>
      {onPress && <Icon name="chevronRight" size={18} color={Colors.textTertiary} />}
    </TouchableOpacity>
  );
}

/** VehicleBlock (Figma 163:811) — bloc `track` : modèle·couleur + plaque + rendu. */
export function VehicleBlock({ driver, illu }: { driver: RideDriver; illu: IlluKey }) {
  return (
    <View style={styles.vehicleBlock}>
      <View style={styles.flex1}>
        <Text variant="label" numberOfLines={1}>{driver.vehicle} · {driver.color}</Text>
        <PlateChip plate={driver.plate} />
      </View>
      <View style={styles.vehicleRender}>
        <Image source={gammeIllustration(illu)} style={styles.vehicleRenderImg} resizeMode="contain" />
      </View>
    </View>
  );
}

/** Groupe véhicule + prestataire (Figma 156:847) — cadre `surfaceAlt`. */
export function VehicleGroup({ driver, illu, onPress }: {
  driver: RideDriver; illu: IlluKey; onPress?: () => void;
}) {
  return (
    <View style={styles.vehicleGroup}>
      <VehicleBlock driver={driver} illu={illu} />
      <DriverRow driver={driver} onPress={onPress} />
    </View>
  );
}

/** AltSuggestCard (Figma 118:357) — alternative suggérée (état « Aucun »). */
export function AltSuggestCard({ illu, title, subtitle, badgeLabel = 'Suggéré', onPress }: {
  illu: IlluKey; title: string; subtitle: string; badgeLabel?: string; onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.altCard} activeOpacity={0.9} onPress={onPress} disabled={!onPress}>
      <View style={styles.altThumb}>
        <Image source={gammeIllustration(illu)} style={styles.altThumbImg} resizeMode="contain" />
      </View>
      <View style={styles.flex1}>
        <View style={styles.altTitleRow}>
          <Text variant="label" numberOfLines={1} style={styles.altTitle}>{title}</Text>
          <Badge variant="suggere" label={badgeLabel} />
        </View>
        <Text style={styles.altSub} numberOfLines={1}>{subtitle}</Text>
      </View>
      {onPress && <Icon name="chevronRight" size={18} color={Colors.textTertiary} />}
    </TouchableOpacity>
  );
}

/** Carte itinéraire (Figma « Itinéraire » 179:812) — rail vertical marche →
 *  drapeau relié par un trait + Départ/Arrivée, dans un cadre `surfaceAlt` bordé.
 *  Partagée entre la configuration et le suivi de course. `onEdit` ajoute l'icône
 *  crayon (édition) et rend la carte tappable. */
export function RouteCard({ departure, destination, onEdit }: {
  departure: string; destination: string; onEdit?: () => void;
}) {
  const Wrapper: React.ComponentType<any> = onEdit ? TouchableOpacity : View;
  return (
    <Wrapper style={styles.routeCard} activeOpacity={onEdit ? 0.85 : 1} onPress={onEdit} disabled={!onEdit}>
      <View style={styles.routeRail}>
        <Icon name="walk" size={20} weight="bold" color={Colors.textPrimary} />
        <View style={styles.routeLine} />
        <Icon name="flag" size={20} weight="bold" color={Colors.textPrimary} />
      </View>
      <View style={styles.routeCol}>
        <View style={styles.routePoint}>
          <Text variant="bodySmall" color={Colors.textSecondary}>Départ</Text>
          <Text variant="label" numberOfLines={1}>{departure}</Text>
        </View>
        <View style={styles.routePoint}>
          <Text variant="bodySmall" color={Colors.textSecondary}>Arrivée</Text>
          <Text variant="label" numberOfLines={1}>{destination}</Text>
        </View>
      </View>
      {onEdit && (
        <View style={styles.routeEdit}><Icon name="edit" size={18} color={Colors.textSecondary} /></View>
      )}
    </Wrapper>
  );
}

/** ActionPill (Figma 86:86) — pilule neutre `track` (« J'arrive »). */
export function ActionPill({ label, icon, onPress }: {
  label: string; icon?: IconName; onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.pill} onPress={onPress} activeOpacity={0.85} disabled={!onPress}>
      {icon && <Icon name={icon} size={16} weight="bold" color={Colors.textPrimary} />}
      <Text style={styles.pillTxt}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Bandeau contextuel (frais d'attente / rapprochement). */
export function InfoBanner({ icon = 'coins', tone = 'info', children }: {
  icon?: IconName; tone?: 'info' | 'warn'; children: React.ReactNode;
}) {
  const warn = tone === 'warn';
  return (
    <View style={[styles.banner, warn ? styles.bannerWarn : styles.bannerInfo]}>
      <Icon name={icon} size={18} weight="bold" color={warn ? Colors.warning : Colors.primaryPressed} />
      <Text variant="label" color={warn ? Colors.warning : Colors.primaryPressed} style={styles.flex1}>
        {children}
      </Text>
    </View>
  );
}

/** Barre « Total » de bas de feuille (Figma 118:300 / 163:918). */
export function TotalBar({ amount, note, style }: {
  amount: number; note?: string; style?: StyleProp<ViewStyle>;
}) {
  return (
    <SheetCard style={[styles.totalBar, style]}>
      <View style={styles.flex1}>
        <Text variant="heading2">Total</Text>
        {note && <Text variant="caption" color={Colors.textSecondary} style={styles.totalNote}>{note}</Text>}
      </View>
      <Text style={styles.totalAmount}>{fmt(amount)} F</Text>
    </SheetCard>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },

  // GroupedSheet — géométrie fidèle aux maquettes (aucun padding de feuille).
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

  // ProgressBar.
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: Colors.track, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: Colors.primary },

  // AvatarStack (initiales tintées).
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  stackAvatar: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  stackOverlap: { marginLeft: -12 },
  stackAvatarTxt: { fontFamily: Poppins.semibold, fontSize: 11 },

  // Badge.
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    borderRadius: Radii.pill,
    paddingVertical: 2, paddingHorizontal: 8,
  },
  badgeSuccess: { backgroundColor: Colors.successSubtle },
  badgeInfo: { backgroundColor: Colors.primarySubtle },
  badgeTxt: { fontFamily: Poppins.semibold, fontSize: 11, lineHeight: 15 },

  // PlateChip.
  plateChip: {
    alignSelf: 'flex-start',
    marginTop: 6,
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radii.pill,
    paddingVertical: 4, paddingHorizontal: 10,
    backgroundColor: Colors.surface,
  },
  plateText: { fontFamily: Poppins.bold, fontSize: 15, letterSpacing: 1.5, color: Colors.textPrimary },

  // Avatar prestataire.
  driverAvatar: {
    backgroundColor: Colors.primarySubtle,
    borderWidth: 2, borderColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  driverAvatarTxt: { fontFamily: Poppins.semibold, color: Colors.primaryPressed },

  // DriverRow.
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  driverCol: { flex: 1, gap: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingVal: { fontFamily: Poppins.semibold, color: Colors.textPrimary },

  // VehicleBlock.
  vehicleBlock: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.track,
    borderRadius: CARD_RADIUS,
    padding: 12,
  },
  vehicleRender: {
    width: 64, height: 52, borderRadius: Radii.md,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  vehicleRenderImg: { width: 56, height: 56 },

  // VehicleGroup (cadre surfaceAlt).
  vehicleGroup: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: CARD_RADIUS,
    borderWidth: 1, borderColor: Colors.borderSubtle,
    padding: 6,
    gap: 12,
  },

  // AltSuggestCard.
  altCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.lg,
    padding: 12,
  },
  altThumb: {
    width: 48, height: 48, borderRadius: Radii.md,
    backgroundColor: Colors.track,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  altThumbImg: { width: 42, height: 42 },
  altTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  altTitle: { flexShrink: 1 },
  altSub: { fontFamily: Poppins.regular, fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  // RouteCard (Itinéraire).
  routeCard: {
    flexDirection: 'row', gap: 12,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.lg,
    borderWidth: 1, borderColor: Colors.borderSubtle,
    padding: 14,
  },
  routeRail: { alignItems: 'center', paddingVertical: 5, justifyContent: 'space-between' },
  routeLine: { flex: 1, width: 2, backgroundColor: Colors.border, marginVertical: 6, minHeight: 24 },
  routeCol: { flex: 1, justifyContent: 'space-between', gap: 24 },
  routePoint: { gap: 2 },
  routeEdit: { alignSelf: 'flex-start', padding: 2 },

  // ActionPill.
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.track,
    borderRadius: Radii.pill,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  pillTxt: { fontFamily: Poppins.medium, fontSize: 14, color: Colors.textPrimary },

  // InfoBanner.
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: CARD_RADIUS,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  bannerInfo: { backgroundColor: Colors.primarySubtle },
  bannerWarn: { backgroundColor: Colors.warningSubtle },

  // TotalBar.
  totalBar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  totalNote: { marginTop: 2 },
  totalAmount: { fontFamily: Poppins.bold, fontSize: 22, lineHeight: 29, color: Colors.primary },
});
