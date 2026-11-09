import React, { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radii, Spacing, Strokes } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';

const DUREE = 900;

type Props = {
  label: string;
  /** Ce que le libellé devient pendant l'appui. */
  labelTenu?: string;
  icon?: IconName;
  onConfirm: () => void;
  style?: ViewStyle;
};

/**
 * **Bouton à appui maintenu.**
 *
 * Pour une action **fréquente** qu'un tap parasite ne doit pas déclencher. Le
 * pendant léger de `SlideToConfirm` : le glissé est pour ce qui ne se défait
 * pas (une course qu'on clôt), le maintien pour ce qu'on refait dix fois par
 * jour (se mettre hors ligne).
 *
 * ── D'où ça vient ─────────────────────────────────────────────────────────
 * Du benchmark de la bascule disponible / indisponible. Trois applications de
 * chauffeur règlent le problème de la même façon : **un seul contrôle, deux
 * efforts**. Un tap pour se rendre disponible — c'est l'action qu'on veut
 * faciliter. Un **maintien d'une seconde**, anneau qui se remplit et vibration,
 * pour en sortir ; un tap court ne fait rien.
 *
 * C'est ce qui corrige le vrai défaut de la version précédente : elle avait
 * **deux contrôles différents** — un gros bouton pour entrer, un petit
 * interrupteur pour sortir. Il fallait apprendre deux objets pour une seule
 * bascule, et le second était assez petit pour partir tout seul au volant.
 *
 * ── Le remplissage dit le temps qu'on investit ────────────────────────────
 * Même vocabulaire que `CountdownButton`, en sens inverse : là-bas le fond se
 * **vide** (le temps qui reste), ici il se **remplit** (le temps qu'on donne).
 * Un fond qui bouge dans un bouton veut toujours dire « une horloge tourne ».
 *
 * ⚠️ **Le libellé annonce le geste.** « Hors ligne » seul laisserait croire à
 * un tap, et un tap qui ne fait rien se lit comme une panne. Il dit donc
 * « Maintenir » dès le repos.
 */
export default function HoldButton({ label, labelTenu, icon, onConfirm, style }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const anim = useRef<Animated.CompositeAnimation | null>(null);
  const [tenu, setTenu] = useState(false);

  const commencer = () => {
    setTenu(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    anim.current = Animated.timing(progress, {
      toValue: 1, duration: DUREE, useNativeDriver: false,
    });
    anim.current.start(({ finished }) => {
      if (!finished) return;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTenu(false);
      progress.setValue(0);
      onConfirm();
    });
  };

  const annuler = () => {
    anim.current?.stop();
    setTenu(false);
    // Retour rapide à zéro : relâcher doit se voir, sinon on croit avoir réussi.
    Animated.timing(progress, { toValue: 0, duration: 140, useNativeDriver: false }).start();
  };

  return (
    <Pressable onPressIn={commencer} onPressOut={annuler} style={[styles.base, style]}>
      <Animated.View
        style={[
          styles.fill,
          { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
        ]}
      />
      <View style={styles.contenu}>
        {icon && <Icon name={icon} size={16} weight="bold" color={Colors.textPrimary} />}
        <Text variant="buttonSm" color={Colors.textPrimary}>
          {tenu ? (labelTenu ?? label) : label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Empreinte de `Button size="sm"` : 40 de haut, pilule, contour neutre — le
  // registre d'une action secondaire, pas d'un CTA.
  base: {
    height: 40,
    borderRadius: Radii.pill,
    borderWidth: Strokes.medium,
    borderColor: Colors.border,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    backgroundColor: Colors.border,
  },
  contenu: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6,
    paddingHorizontal: Spacing[4],
  },
});
