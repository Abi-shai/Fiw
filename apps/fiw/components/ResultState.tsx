import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Colors, Radii, Spacing } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';

export type ResultTon = 'succès' | 'erreur' | 'accent';

/** Le glyphe est solidaire du ton, il ne se choisit pas : un succès porte la
 *  coche, un échec la croix, un remerciement les mains jointes. */
const TON: Record<ResultTon, { fond: string; encre: string; icon: IconName }> = {
  succès: { fond: Colors.successSubtle, encre: Colors.success, icon: 'check' },
  erreur: { fond: Colors.errorSubtle, encre: Colors.error, icon: 'xCircle' },
  accent: { fond: Colors.primarySubtle, encre: Colors.primary, icon: 'thanks' },
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
 * ⚠️ Le ton `marque` — plein `primary` avec un médaillon blanc translucide, celui
 * de `affilie/celebration` — n'existe pas encore : il attend un jeton d'opacité
 * sur fond primaire, qui manque aux fondations.
 */
export default function ResultState({ ton = 'succès', titre, corps, children, style }: Props) {
  const t = TON[ton];
  return (
    <View style={[styles.wrap, style]}>
      <View style={[styles.badge, { backgroundColor: t.fond }]}>
        <Icon name={t.icon} size={56} weight="fill" color={t.encre} />
      </View>
      <View style={styles.texte}>
        <Text variant="display" align="center">{titre}</Text>
        {corps ? (
          <Text variant="body" color={Colors.textSecondary} align="center" style={styles.corps}>
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
