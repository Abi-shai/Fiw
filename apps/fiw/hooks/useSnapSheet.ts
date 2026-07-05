import { useEffect, useRef } from 'react';
import { Animated, PanResponder, type PanResponderGestureState } from 'react-native';

export type SheetSpring = { stiffness: number; damping: number; mass: number };

// Ressort partagé (snap + entrée) : vif et légèrement sous-amorti (ratio ≈ 0,66)
// → settle rapide + petit dépassement qu'on PERÇOIT. Repris tel quel de l'accueil.
export const SHEET_SPRING: SheetSpring = { stiffness: 280, damping: 22, mass: 1 };

export type SnapReleaseCtx = {
  gesture: PanResponderGestureState;
  /** translateY courant au lâcher. */
  pos: number;
  /** vélocité verticale (px/ms, + = vers le bas). */
  velocity: number;
  snapTo: (target: number, vy?: number) => void;
  nearest: (pos: number) => number;
  above: (pos: number) => number;
  below: (pos: number) => number;
};

type Opts = {
  /** translateY des crans, ordre CROISSANT (haut → bas). Ex. [étendu, défaut, replié]. */
  snaps: number[];
  /** translateY initial (peut être hors écran pour jouer une entrée). */
  initial: number;
  spring?: SheetSpring;
  /** Résistance rubber-band hors bornes (défaut 0.4). */
  rubber?: number;
  /** Seuil de flick px/ms : au-delà, envoie au cran suivant dans la direction (défaut 0.32). */
  flickV?: number;
  /** Active/désactive le drag ; lu à chaud à chaque geste (défaut : toujours actif). */
  enabled?: () => boolean;
  /** Intercepte le lâcher ; retourner `true` = géré, on saute le snap par défaut. */
  onRelease?: (ctx: SnapReleaseCtx) => boolean | void;
  /** Notifie le cran atteint (index dans `snaps`) après un snap par défaut. */
  onSettle?: (index: number) => void;
};

/**
 * Feuille à crans — LA logique de bottom sheet réductible/extensible de Fiw,
 * extraite de l'accueil pour être partagée (accueil ↔ course active). Pattern de
 * référence (Uber/Bolt/Waze) : suit le doigt au 1:1 dans les bornes, résiste
 * (rubber-band) au-delà, et au lâcher snap au cran le plus proche (flick franc →
 * cran suivant dans la direction). La vélocité du doigt est transmise au ressort
 * pour une continuité parfaite (pas de micro-arrêt au lâcher).
 *
 * `snaps` peut changer après coup (crans mesurés au layout) : les bornes sont
 * relues à chaque geste, donc la feuille reste correcte même si les hauteurs
 * n'étaient pas connues au montage.
 */
export function useSnapSheet(opts: Opts) {
  const cfg = useRef(opts);
  cfg.current = opts;

  const ty = useRef(new Animated.Value(opts.initial)).current;
  const tyValue = useRef(opts.initial);
  const dragOffset = useRef(0);

  useEffect(() => {
    const id = ty.addListener(({ value }) => { tyValue.current = value; });
    return () => ty.removeListener(id);
  }, [ty]);

  const snapTo = (target: number, vy = 0) => {
    Animated.spring(ty, {
      toValue: target,
      velocity: vy * 1000, // geste px/ms → Animated px/s
      ...(cfg.current.spring ?? SHEET_SPRING),
      restDisplacementThreshold: 0.3,
      restSpeedThreshold: 0.3,
      useNativeDriver: false,
    }).start();
  };

  const nearest = (pos: number) =>
    cfg.current.snaps.reduce((a, b) => (Math.abs(b - pos) < Math.abs(a - pos) ? b : a));
  const above = (pos: number) => {
    const a = cfg.current.snaps.filter((s) => s < pos - 1);
    return a.length ? Math.max(...a) : cfg.current.snaps[0];
  };
  const below = (pos: number) => {
    const b = cfg.current.snaps.filter((s) => s > pos + 1);
    return b.length ? Math.min(...b) : cfg.current.snaps[cfg.current.snaps.length - 1];
  };

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, g) =>
      Math.abs(g.dy) > 4 && (cfg.current.enabled?.() ?? true),
    onPanResponderGrant: () => { dragOffset.current = tyValue.current; },
    onPanResponderMove: (_, g) => {
      const snaps = cfg.current.snaps;
      const lo = snaps[0];
      const hi = snaps[snaps.length - 1];
      const rubber = cfg.current.rubber ?? 0.4;
      // Suit le doigt au 1:1 dans les bornes ; résiste au-delà (rubber-band).
      let next = dragOffset.current + g.dy;
      if (next < lo) next = lo - (lo - next) * rubber;
      else if (next > hi) next = hi + (next - hi) * rubber;
      ty.setValue(next);
    },
    onPanResponderRelease: (_, g) => {
      const v = g.vy; // px/ms (+ = vers le bas)
      const pos = tyValue.current;
      if (cfg.current.onRelease?.({ gesture: g, pos, velocity: v, snapTo, nearest, above, below })) return;
      const flick = cfg.current.flickV ?? 0.32;
      let target: number;
      if (v < -flick) target = above(pos);
      else if (v > flick) target = below(pos);
      else target = nearest(pos + v * 120); // légère projection sur drag lent
      snapTo(target, v);
      cfg.current.onSettle?.(cfg.current.snaps.indexOf(target));
    },
  })).current;

  return { ty, tyValue, snapTo, nearest, above, below, panHandlers: pan.panHandlers };
}
