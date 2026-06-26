import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Shadows } from '@/constants/tokens';
import Icon, { type IconName } from '@/components/Icon';

type Props = {
  name: IconName;
  onPress?: () => void;
  /** `floating` : blanc + ombre, posé sur la carte. `flat` : fond gris discret. */
  variant?: 'floating' | 'flat';
  color?: string;
  style?: StyleProp<ViewStyle>;
};

/** Bouton rond à icône, taille et style unifiés.
 *  `floating` pour les commandes flottant sur la carte (menu, retour,
 *  recentrage) — icône grise neutre par défaut, pour ne pas tirer l'œil ;
 *  `flat` pour les actions intégrées à une feuille (fermer), icône bleu marque. */
export default function IconButton({ name, onPress, variant = 'floating', color, style }: Props) {
  const floating = variant === 'floating';
  // Les contrôles flottants sur la carte restent neutres (gris) pour ne pas
  // tirer l'œil ; le bleu marque est réservé aux actions intégrées aux feuilles.
  const iconColor = color ?? (floating ? Colors.gray700 : Colors.primary);
  return (
    <TouchableOpacity
      style={[styles.base, floating ? styles.floating : styles.flat, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Icon name={name} size={floating ? 24 : 22} color={iconColor} />
    </TouchableOpacity>
  );
}

const SIZE = 46;
const SIZE_FLAT = 40;

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  floating: {
    width: SIZE, height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: Colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.hairline,
    ...Shadows.float,
  },
  flat: {
    width: SIZE_FLAT, height: SIZE_FLAT,
    borderRadius: SIZE_FLAT / 2,
    backgroundColor: Colors.bg,
  },
});
