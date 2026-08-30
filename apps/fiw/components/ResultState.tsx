import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Colors, Radii, Spacing } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';

export type ResultTon = 'succès' | 'erreur' | 'accent' | 'marque';

/** Le glyphe est solidaire du ton, il ne se choisit pas : un succès porte la
 *  coche, un échec la croix, un remerciement les mains jointes. */
const TON: Record<ResultTon, { fond: string; encre: string; icon: IconName }> = {
  succès: { fond: Colors.successSubtle, encre: Colors.success, icon: 'check' },
  erreur: { fond: Colors.errorSubtle, encre: Colors.error, icon: 'xCircle' },
  accent: { fond: Colors.primarySubtle, encre: Colors.primary, icon: 'thanks' },
  // Sur un écran plein `primary` : le médaillon devient un blanc translucide et
  // les encres se renversent. Le fond bleu est peint par l'ÉCRAN, pas ici — un
  // état de résultat ne peint pas son fond, il s'y pose.
  marque: { fond: Colors.onInverseSubtle, encre: Colors.textOnPrimary, icon: 'users' },
};

type Props = {
  ton?: ResultTon;
  titre: string;
  corps?: string;
  /** Ce qui s'ajoute sous le corps — un montant, une pastille d'état, un
   *  encart qui rassure. Les ACTIONS n'ont rien à faire ici : elles vivent dans
   *  un `ScreenFooter` posé dessous. */
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * État de résultat plein écran — médaillon 112, titre `display`, corps `body`
 * centré à 300 de large. Cinq écrans le refaisaient : les deux « Merci pour
 * votre avis », la confirmation et l'échec de retrait, la célébration Affilié.
 *
 * Un état de résultat **dit ce qui s'est passé** ; ce qu'on peut faire ensuite
 * est du ressort du pied d'écran, d'où l'absence d'actions dans le composant.
 *
 * Le ton `marque` est celui d'un écran plein `primary` (`affilie/celebration`) :
 * médaillon `onInverseSubtle`, titre blanc, corps `textOnInverseSecondary`.
 */
export default function ResultState({ ton = 'succès', titre, corps, children, style }: Props) {
  const t = TON[ton];
  const inverse = ton === 'marque';
  return (
    <View style={[styles.wrap, style]}>
      <View style={[styles.badge, { backgroundColor: t.fond }]}>
        <Icon name={t.icon} size={56} weight="fill" color={t.encre} />
      </View>
      <View style={styles.texte}>
        <Text variant="display" align="center" color={inverse ? Colors.textOnPrimary : Colors.textPrimary}>
          {titre}
        </Text>
        {corps ? (
          <Text
            variant="body"
            color={inverse ? Colors.textOnInverseSecondary : Colors.textSecondary}
            align="center"
            style={styles.corps}
          >
            {corps}
          </Text>
        ) : null}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: Spacing[6],
    paddingHorizontal: Spacing[6],
  },
  badge: {
    width: 112, height: 112,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texte: { alignItems: 'center', gap: Spacing[3] },
  corps: { maxWidth: 300 },
});
