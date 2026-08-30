import { useEffect, useRef } from 'react';
import { Animated, PanResponder, type PanResponderGestureState } from 'react-native';
import { Motion } from '@/constants/tokens';

export type SheetSpring = { stiffness: number; damping: number; mass: number };

/**
 * Ressort du LÂCHER DE GESTE — le `Spring Gentle` de l'identité de mouvement.
 *
 * Il valait `damping: 22` (ratio ≈ 0,66, soit un `bounce` ≈ 0,34) ; il prend
 * maintenant le 0,25 de la planche, donc `damping: 25`. La raideur ne change pas :
 * la feuille rebondit un peu moins, elle ne va pas plus lentement.
 */
export const SHEET_SPRING: SheetSpring = Motion.spring.gentle;

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

  /**
   * Deux régimes, et c'est l'identité de mouvement qui les sépare.
   *
   * • **Lâcher de geste** (`vy` ≠ 0) → **ressort**. Une courbe de timing ne sait
   *   pas accepter une vélocité initiale : il y aurait un micro-arrêt au lâcher,
   *   et c'est précisément la continuité de vélocité qui fait qu'une feuille
   *   *suit le doigt*. Le ressort est ici de la **physique**, pas un rebond
   *   décoratif — c'est ce qui le fait survivre à la règle « Spring for Hero
   *   Only », et il prend le `Spring Gentle` de la planche.
   *
   * • **Snap programmatique** (`vy` = 0 : entrée, ouverture, fermeture, retour à
   *   un cran) → courbe `Hold / Anchor`, et une durée qui dépend du **sens**,
   *   parce que c'est tout le principe *Asymmetric Timing* :
   *
   *   - la feuille **monte** → elle s'installe : recette « Modals / Sheets »,
   *     fenêtre `container-morph` (50 → 500). Le maintien de 50 laisse la mise en
   *     page parente se terminer avant qu'elle bouge.
   *   - la feuille **descend** → elle rend la place : `container-exit` (200), sans
   *     maintien. Rien n'attend qu'elle s'en aille.
   *
   *   Le sens suffit à trancher, et c'est ce qui évite d'ajouter un paramètre que
   *   chaque appelant devrait penser à passer.
   */
  const snapTo = (target: number, vy = 0) => {
    if (vy === 0) {
      const retreating = target > tyValue.current;
      const { delay, dur } = retreating
        ? { delay: 0, dur: Motion.duration.containerExit }
        : Motion.window(Motion.duration.containerMorph, Motion.duration.anticipationHold);
      Animated.timing(ty, {
        toValue: target,
        delay,
        duration: dur,
        easing: Motion.easing.hold,
        useNativeDriver: false,
      }).start();
      return;
    }
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
