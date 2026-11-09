import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { Colors, Radii, Shadows, Spacing } from '@/constants/tokens';
import Text from '@/components/Text';

type Props = {
  label: string;
  /** Durée du compte à rebours, en secondes. */
  seconds: number;
  /** Appelé si le temps s'épuise avant l'appui. */
  onExpire: () => void;
  onPress: () => void;
  style?: ViewStyle;
};

/**
 * **Bouton à compte à rebours — le minuteur vit DANS le bouton.**
 *
 * C'est l'accord le plus net du benchmark Fiw Pro (D3) : Uber et Yango posent
 * un seul bouton « Accept » pleine largeur dont le fond **se vide** de gauche à
 * droite. Pas de chiffre qui décompte à côté, pas d'anneau de progression.
 *
 * Le pourquoi tient à la situation : le Prestataire est **au volant**. Il a
 * deux secondes et un coup d'œil. Un minuteur posé ailleurs demande un
 * deuxième point de fixation ; un fond qui se vide se lit en vision
 * périphérique, sans quitter la route.
 *
 * ── Pourquoi un composant distinct et non un prop de `Button` ─────────────
 * Le style guide demande, avant d'ajouter un prop à un composant partagé, de
 * se demander si ce n'est pas un composant distinct qui manque. C'en est un :
 * celui-ci porte une **durée** et un **événement d'expiration**, il agit tout
 * seul si on ne le touche pas. Un bouton n'a pas d'horloge.
 *
 * ── Géométrie ─────────────────────────────────────────────────────────────
 * Strictement celle de `Button size="lg" variant="primary"` — hauteur 56,
 * padding horizontal 28, rayon pilule, `shadow-sm`, libellé `bodySemibold`.
 * Ces valeurs viennent du tableau « Tailles » du style guide, pas d'un relevé
 * à l'œil : les deux objets doivent être indiscernables au repos.
 *
 * ⚠️ **Le chiffre des secondes reste affiché**, à droite du libellé, malgré le
 * fond qui se vide. Les deux ne font pas double emploi : le fond donne
 * l'**urgence** sans lecture, le chiffre donne le **fait** quand on regarde.
 * Uber et Yango s'en passent ; Fiw le garde parce que son délai (15 s) est plus
 * court que celui d'Uber et qu'un fond presque plein ne dit pas s'il reste
 * douze secondes ou trois.
 */
export default function CountdownButton({ label, seconds, onExpire, onPress, style }: Props) {
  const progress = useRef(new Animated.Value(1)).current;
  const [restant, setRestant] = React.useState(seconds);
  const expired = useRef(false);

  useEffect(() => {
    // Le fond se vide en continu — c'est une durée, pas des paliers.
    Animated.timing(progress, {
      toValue: 0,
      duration: seconds * 1000,
      useNativeDriver: false,
    }).start();

    // Le chiffre, lui, décompte à la seconde.
    const t = setInterval(() => {
      setRestant((v) => {
        if (v <= 1) {
          clearInterval(t);
          if (!expired.current) { expired.current = true; onExpire(); }
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // Monté une fois par mission : la durée ne change pas en cours de route.
  }, []);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.base,
      pressed && styles.pressed,
      style,
    ]}>
      {/* La piste est le bleu PRESSÉ, pas un gris : ce qui reste du temps est
          toujours du bouton. En gris, le bouton aurait l'air à moitié
          désactivé alors qu'il est pleinement actionnable jusqu'au bout. */}
      <View style={styles.track} />
      <Animated.View
        style={[
          styles.fill,
          { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
        ]}
      />
      <View style={styles.content}>
        <Text variant="bodySemibold" color={Colors.textOnPrimary}>{label}</Text>
        <Text variant="bodySemibold" color={Colors.textOnPrimary} style={styles.secondes}>
          {restant}s
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Géométrie de `Button size="lg"` : 56 de haut, 28 de padding, pilule.
  base: {
    height: 56,
    borderRadius: Radii.pill,
    overflow: 'hidden',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  pressed: { transform: [{ scale: 0.97 }] },
  track: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.primaryPressed },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: Colors.primary },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingHorizontal: 28,
  },
  // Les secondes sont légèrement en retrait : elles accompagnent le libellé,
  // elles ne le concurrencent pas.
  secondes: { opacity: 0.75 },
});
