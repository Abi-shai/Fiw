import React from 'react';
import { View, StyleSheet, Animated, type StyleProp, type ViewStyle } from 'react-native';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import { Colors, Poppins } from '@/constants/tokens';

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
 */
export default function StepProgress({ steps, activeIndex, segmentProgress, style }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.track}>
        {steps.map((step, i) => {
          const done = i < activeIndex;
          const current = i === activeIndex;
          const on = done || current;
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
              <View style={[styles.dot, on && styles.dotOn, current && styles.dotCurrent]}>
                <Icon
                  name={done ? 'tick' : step.icon}
                  size={13}
                  weight="bold"
                  color={on ? Colors.surface : Colors.textTertiary}
                />
              </View>
            </React.Fragment>
          );
        })}
      </View>
      <View style={styles.labels}>
        {steps.map((step, i) => {
          const current = i === activeIndex;
          return (
            <Text
              key={step.label}
              variant="caption"
              align={i === 0 ? 'left' : i === steps.length - 1 ? 'right' : 'center'}
              color={current ? Colors.textPrimary : Colors.textTertiary}
              style={[styles.label, current && styles.labelCurrent]}
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

const DOT = 28;

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  track: { flexDirection: 'row', alignItems: 'center' },
  dot: {
    width: DOT, height: DOT, borderRadius: DOT / 2,
    backgroundColor: Colors.track,
    alignItems: 'center', justifyContent: 'center',
  },
  dotOn: { backgroundColor: Colors.primary },
  // Jalon courant : anneau subtil qui le détache des jalons faits.
  dotCurrent: {
    borderWidth: 3, borderColor: Colors.primarySubtle,
    width: DOT + 6, height: DOT + 6, borderRadius: (DOT + 6) / 2,
    marginVertical: -3,
  },
  segment: {
    flex: 1, height: 3, borderRadius: 1.5,
    backgroundColor: Colors.track,
    marginHorizontal: 4,
    overflow: 'hidden',
  },
  segmentOn: { backgroundColor: Colors.primary },
  segmentFill: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    borderRadius: 1.5,
    backgroundColor: Colors.primary,
  },
  labels: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  label: { flex: 1 },
  labelCurrent: { fontFamily: Poppins.semibold },
});
