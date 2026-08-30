import React, { useRef } from 'react';
import { Pressable, Animated, StyleSheet, ViewStyle, View } from 'react-native';
import { Colors, Radii, Shadows, type TextVariant, Strokes } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import Spinner from '@/components/Spinner';

// Système de boutons Fiw :
// · primary          — plein bleu marque (CTA principal).
// · secondary        — contour neutre (bordure grise, sans fond) : action
//                      secondaire à la même empreinte que le primary.
// · destructive      — sans fond ni bordure, texte rouge Error : action
//                      dangereuse secondaire (ex. « Annuler la commande »).
//                      Même typo/spacing/empreinte pilule, juste sans bordure.
// · destructiveFilled — plein rouge : réservé au cas où l'action destructive EST
//                      le CTA de l'écran (ex. « Raccrocher »).
// · link             — texte-action bleu primary, sans fond ni bordure ni pilule
//                      (ex. « Modifier », « Renvoyer le code »). Icône optionnelle,
//                      empreinte compacte (inline dans une rangée, pas un CTA).
// · linkDestructive  — même empreinte que `link`, texte rouge Error : action-lien
//                      inline qui retire/supprime (ex. « Retirer » un compte
//                      Mobile Money). Le pendant rouge de `link`, comme
//                      `destructive` est le pendant rouge de `secondary`.
// · linkInverse      — le lien posé sur un fond sombre ou `primary`, en
//                      `textOnPrimary` (ex. « Fermer » de la célébration).
//                      Un septième rôle et non un axe de ton : un axe aurait
//                      obligé les six autres variantes à déclarer une valeur qui
//                      n'a aucun sens pour un bouton plein. Il ne peint pas de
//                      fond — c'est l'écran qui porte le bleu, le bouton s'y pose.
type Variant = 'primary' | 'secondary' | 'destructive' | 'destructiveFilled' | 'link' | 'linkDestructive' | 'linkInverse';
type Size = 'lg' | 'md' | 'sm';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  /** Icône Phosphor en tête de label. */
  icon?: IconName;
  /** Icône Phosphor en fin de label. */
  trailingIcon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

// Couleurs de fond par variante et par état (repos / pressé).
const BG: Record<Variant, { rest: string; pressed: string }> = {
  primary:          { rest: Colors.primary, pressed: Colors.primaryPressed },
  secondary:        { rest: 'transparent',  pressed: Colors.bg },
  destructive:      { rest: 'transparent',  pressed: Colors.errorSubtle },
  destructiveFilled:{ rest: Colors.error,   pressed: Colors.errorPressed },
  link:             { rest: 'transparent',  pressed: 'transparent' },
  linkDestructive:  { rest: 'transparent',  pressed: 'transparent' },
  linkInverse:      { rest: 'transparent',  pressed: 'transparent' },
};

// Couleur du texte + icône par variante.
const FG: Record<Variant, string> = {
  primary: Colors.textOnPrimary,
  secondary: Colors.textPrimary,
  destructive: Colors.error,
  destructiveFilled: Colors.textOnPrimary,
  link: Colors.primary,
  linkDestructive: Colors.error,
  linkInverse: Colors.textOnPrimary,
};

// Bordure : seul `secondary` porte un contour (neutre gris). `destructive` est
// sans bordure (texte rouge sur fond transparent) ; `destructiveFilled` est plein.
const BORDER: Partial<Record<Variant, string>> = {
  secondary: Colors.border,
};

// Hauteurs « pouce-friendly » (cibles tactiles ≥ 48px) + géométrie par taille.
const SIZING: Record<Size, { height: number; padX: number; icon: number; gap: number }> = {
  lg: { height: 56, padX: 28, icon: 20, gap: 10 },
  md: { height: 48, padX: 20, icon: 18, gap: 8 },
  sm: { height: 40, padX: 16, icon: 16, gap: 6 },
};

// Typo du libellé : une variante par (taille × lien). Les variantes `link`
// descendent d'une graisse — le lien se lit comme du texte, pas comme un plein.
// `sm` est déjà en Medium, les deux colonnes y coïncident.
const LABEL: Record<Size, { plain: TextVariant; link: TextVariant }> = {
  lg: { plain: 'bodySemibold', link: 'bodyMedium' },
  md: { plain: 'buttonMd',     link: 'buttonMdLink' },
  sm: { plain: 'buttonSm',     link: 'buttonSm' },
};

export default function Button({
  label, onPress, variant = 'primary', size = 'lg',
  icon, trailingIcon, loading, disabled, style,
}: Props) {
  const isDisabled = disabled || loading;
  const fg = FG[variant];
  const s = SIZING[size];
  const filled = variant === 'primary' || variant === 'destructiveFilled';
  const isLink = variant === 'link' || variant === 'linkDestructive' || variant === 'linkInverse';

  const scale = useRef(new Animated.Value(1)).current;
  const press = (to: number) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 50, bounciness: 0 }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => press(0.97)}
        onPressOut={() => press(1)}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          isLink
            ? styles.linkBox
            : { height: s.height, paddingHorizontal: s.padX, borderRadius: Radii.pill },
          { backgroundColor: pressed ? BG[variant].pressed : BG[variant].rest },
          // Contour des variantes à fond transparent (secondary = gris neutre,
          // destructive = rouge Error).
          BORDER[variant] && { borderWidth: Strokes.medium, borderColor: BORDER[variant] },
          // L'ombre reste dans les TROIS états : la maquette la porte aussi sur
          // `désactivé` et `chargement` (les six variantes pleines de
          // `Button · États` ont le même style d'effet). En désactivé c'est
          // l'opacité 0,45 qui la fait pâlir avec le reste, pas son retrait.
          filled && Shadows.sm,
          isDisabled && styles.disabled,
          isLink && pressed && styles.linkPressed,
        ]}
      >
        {loading ? (
          <Spinner size="sm" color={fg} />
        ) : (
          <View style={[styles.content, { gap: s.gap }]}>
            {icon && <Icon name={icon} size={s.icon} color={fg} />}
            <Text variant={LABEL[size][isLink ? 'link' : 'plain']} color={fg}>{label}</Text>
            {trailingIcon && <Icon name={trailingIcon} size={s.icon} color={fg} />}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center' },
  disabled: { opacity: 0.45 },
  // Variante `link` : texte-action sans fond ni pilule, empreinte compacte.
  linkBox: { paddingVertical: 4 },
  linkPressed: { opacity: 0.55 },
});
