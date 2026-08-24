import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Shadows, Strokes } from '@/constants/tokens';
import Icon, { type IconName } from '@/components/Icon';

export type IconButtonVariant = 'floating' | 'flat' | 'secondary' | 'link';
export type IconButtonSize = 'lg' | 'md' | 'sm';

type Props = {
  name: IconName;
  onPress?: () => void;
  /** `floating` : blanc + ombre, posé sur la carte. `flat` : fond gris discret.
   *  `secondary` : transparent + liseré. `link` : nu, ni fond ni liseré. */
  variant?: IconButtonVariant;
  /** `lg` 46 · `md` 40 · `sm` 32. Par défaut : `lg` en floating, `md` ailleurs. */
  size?: IconButtonSize;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

/** Empreintes — miroir du set Figma `IconButton` (Variant × Size). */
const BOX: Record<IconButtonSize, number> = { lg: 46, md: 40, sm: 32 };
const GLYPH: Record<IconButtonSize, number> = { lg: 24, md: 22, sm: 18 };

/** Bouton rond à icône, taille et style unifiés.
 *  `floating` pour les commandes flottant sur la carte (menu, retour,
 *  recentrage) — icône grise neutre par défaut, pour ne pas tirer l'œil ;
 *  `flat` pour les actions intégrées à une feuille (fermer), icône bleu marque ;
 *  `secondary` pour une action de second rang qui doit rester lisible sur un
 *  fond teinté (bouton carte d'un `PlaceField`) ; `link` pour les actions
 *  inline d'un champ (effacer, afficher le mot de passe) — aucune empreinte
 *  visible, seule l'icône se voit.
 *
 *  ⚠️ `sm` fait 32 px : sous la cible tactile de 48. À n'utiliser qu'à
 *  l'intérieur d'un contrôle qui porte déjà la zone de frappe (champ, rangée). */
export default function IconButton({
  name, onPress, variant = 'floating', size, color, style,
}: Props) {
  const s: IconButtonSize = size ?? (variant === 'floating' ? 'lg' : 'md');
  const box = BOX[s];
  const iconColor = color ?? (variant === 'link' ? Colors.primary
    : variant === 'secondary' ? Colors.textPrimary
    : Colors.gray700);
  return (
    <TouchableOpacity
      style={[
        styles.base,
        { width: box, height: box, borderRadius: box / 2 },
        styles[variant],
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Icon name={name} size={GLYPH[s]} color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  // Pas de liseré : c'est l'ombre `float` seule qui détache le bouton du fond
  // carto (maquette). Un liseré en plus refermait la pastille.
  floating: {
    backgroundColor: Colors.surface,
    ...Shadows.float,
  },
  flat: { backgroundColor: Colors.bg },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: Strokes.thin,
    borderColor: Colors.border,
  },
  link: { backgroundColor: 'transparent' },
});
