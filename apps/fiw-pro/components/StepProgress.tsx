import React from 'react';
import { View, StyleSheet, Animated, type StyleProp, type ViewStyle } from 'react-native';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import { Colors, Strokes } from '@/constants/tokens';

export type Step = { icon: IconName; label: string };

type Props = {
  steps: Step[];
  /** Index du jalon courant (0-based). Les jalons antérieurs sont « faits ». */
  activeIndex: number;
  /** Remplissage animé (0→1) du segment vers le jalon SUIVANT — la barre grise
   *  se remplit progressivement pendant l'étape jusqu'à atteindre le jalon. */
  segmentProgress?: Animated.Value;
  style?: StyleProp<ViewStyle>;
};

/**
 * Jalons segmentés horizontaux (réf. benchmark Livraison : Shopee SPX, Walmart,
 * Gopuff) : pastilles-icônes reliées par des segments, remplies en primary au
 * fil de la progression ; le segment courant se remplit en continu via
 * `segmentProgress`. Réutilisable : suivi Livraison, legs Yobanté, Assistance.
 *
 * **Un jalon garde toujours son propre glyphe** — la maquette ne le remplace
 * jamais par une coche. Ce qui dit qu'une étape est acquise, c'est la GRAISSE :
 * `fill` dès que le jalon est atteint (fait ou courant), `bold` tant qu'il est à
 * venir. Un `tick` effacerait l'étape dont on parle au moment où elle compte le
 * plus — juste après l'avoir franchie.
 */
export default function StepProgress({ steps, activeIndex, segmentProgress, style }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.track}>
        {steps.map((step, i) => {
          const done = i < activeIndex;
          const current = i === activeIndex;
          // Le segment i relie le jalon i-1 au jalon i : plein jusqu'au jalon
          // courant, en remplissage animé vers le jalon suivant, gris au-delà.
          const filling = i === activeIndex + 1 && segmentProgress;
          return (
            <React.Fragment key={step.label}>
              {i > 0 && (
                <View style={[styles.segment, i <= activeIndex && styles.segmentOn]}>
                  {filling ? (
                    <Animated.View
                      style={[styles.segmentFill, {
                        width: segmentProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                          extrapolate: 'clamp',
                        }),
                      }]}
                    />
                  ) : null}
                </View>
              )}
              <View style={[styles.dot, done && styles.dotDone, current && styles.dotCurrent]}>
                <Icon
                  name={step.icon}
                  size={20}
                  weight={done || current ? 'fill' : 'bold'}
                  color={current ? Colors.surface : done ? Colors.primary : Colors.textTertiary}
                />
              </View>
            </React.Fragment>
          );
        })}
      </View>
      <View style={styles.labels}>
        {steps.map((step, i) => {
          const current = i === activeIndex;
          const done = i < activeIndex;
          return (
            <Text
              key={step.label}
              variant={current ? 'captionSemibold' : 'caption'}
              align={i === 0 ? 'left' : i === steps.length - 1 ? 'right' : 'center'}
              color={current ? Colors.primary : done ? Colors.textPrimary : Colors.textTertiary}
              style={styles.label}
              numberOfLines={1}
            >
              {step.label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const DOT = 44;

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  track: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: {
    width: DOT, height: DOT, borderRadius: DOT / 2,
    backgroundColor: Colors.track,
    alignItems: 'center', justifyContent: 'center',
  },
  // Jalon fait : `blue100` et non le plein — c'est le jalon COURANT qui porte le
  // bleu de marque, ce qui le distingue au premier coup d'œil de ce qui est déjà
  // franchi.
  dotDone: { backgroundColor: Colors.blue100 },
  // Jalon courant : plein `primary` + anneau subtil intérieur, qui le détache
  // des jalons faits sans changer l'empreinte de la pastille.
  dotCurrent: {
    backgroundColor: Colors.primary,
    borderWidth: Strokes.heavy, borderColor: Colors.primarySubtle,
  },
  segment: {
    flex: 1, height: 3, borderRadius: 1.5,
    backgroundColor: Colors.track,
    overflow: 'hidden',
  },
  segmentOn: { backgroundColor: Colors.blue100 },
  segmentFill: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    borderRadius: 1.5,
    backgroundColor: Colors.primary,
  },
  labels: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  label: { flex: 1 },
});
