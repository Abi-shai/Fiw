import React, { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radii, Shadows, Spacing } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon from '@/components/Icon';

const H = 56;          // hauteur de `Button size="lg"`
const KNOB = 48;       // le curseur, 4 de marge de chaque côté
const MARGE = (H - KNOB) / 2;

type Props = {
  label: string;
  onConfirm: () => void;
  /** Rouge pour ce qui clôt — « Terminer la course ». */
  ton?: 'marque' | 'destructif';
  style?: ViewStyle;
};

/**
 * **Glisser pour confirmer.**
 *
 * Pour les actes qu'un tap parasite au volant ne doit pas déclencher, et qui ne
 * se défont pas : « Je suis arrivé » **démarre la facturation de l'attente du
 * Client**, « Démarrer la course » engage la course, « Terminer » la clôt.
 *
 * Motif relevé chez **Wolt Courier**, qui l'emploie exactement là — « Slide to
 * go online », « Delivered ». Aucune des six apps de VTC du premier corpus ne
 * le fait, et c'est cohérent : leurs boutons de mission n'engagent pas d'argent
 * côté Client. Le compteur de frais d'attente de Fiw, si.
 *
 * ── Géométrie ─────────────────────────────────────────────────────────────
 * Celle de `Button size="lg"` — 56 de haut, rayon pilule, `shadow-sm` — pour
 * que le glissé se lise comme un bouton de même rang, pas comme un objet
 * étranger. Le curseur fait 48 : un pouce le couvre entièrement.
 *
 * ⚠️ **Le retour haptique ponctue les trois moments** : la prise (léger), le
 * franchissement du seuil (moyen), la confirmation (succès). Sans lui, le
 * glissé est moins sûr qu'un tap — on ne sait pas quand on a réussi. C'est
 * l'haptique qui rend le motif supportable, pas l'animation.
 */
export default function SlideToConfirm({ label, onConfirm, ton = 'marque', style }: Props) {
  const x = useRef(new Animated.Value(0)).current;
  const largeur = useRef(0);
  const franchi = useRef(false);

  const fond = ton === 'destructif' ? Colors.error : Colors.primary;

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 4,
      onPanResponderGrant: () => {
        franchi.current = false;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, g) => {
        const max = Math.max(0, largeur.current - KNOB - MARGE * 2);
        const v = Math.min(Math.max(0, g.dx), max);
        x.setValue(v);
        // Le seuil est à 85 % : exiger la course entière rend le geste
        // pénible, s'arrêter plus tôt le rend déclenchable par accident.
        if (!franchi.current && v > max * 0.85) {
          franchi.current = true;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      },
      onPanResponderRelease: (_, g) => {
        const max = Math.max(0, largeur.current - KNOB - MARGE * 2);
        if (g.dx > max * 0.85) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Animated.timing(x, { toValue: max, duration: 120, useNativeDriver: false }).start(onConfirm);
        } else {
          Animated.spring(x, { toValue: 0, useNativeDriver: false, speed: 20, bounciness: 6 }).start();
        }
      },
    }),
  ).current;

  return (
    <View
      style={[styles.piste, { backgroundColor: fond }, style]}
      onLayout={(e) => { largeur.current = e.nativeEvent.layout.width; }}
    >
      {/* Le libellé s'efface à mesure que le curseur avance : il a dit ce qu'il
          avait à dire, et il gênerait sous le pouce. */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.centre,
          { opacity: x.interpolate({ inputRange: [0, 90], outputRange: [1, 0], extrapolate: 'clamp' }) },
        ]}
        pointerEvents="none"
      >
        <Text variant="bodySemibold" color={Colors.textOnPrimary}>{label}</Text>
      </Animated.View>

      <Animated.View style={[styles.curseur, { transform: [{ translateX: x }] }]} {...pan.panHandlers}>
        <Icon name="chevronRight" size={22} weight="bold" color={fond} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  piste: {
    height: H,
    borderRadius: Radii.pill,
    justifyContent: 'center',
    ...Shadows.sm,
  },
  centre: { alignItems: 'center', justifyContent: 'center' },
  curseur: {
    width: KNOB, height: KNOB, borderRadius: Radii.pill,
    marginLeft: MARGE,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
});
