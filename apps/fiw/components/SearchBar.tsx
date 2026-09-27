import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Radii, Shadows, inputTypo, Strokes } from '@/constants/tokens';
import Icon from '@/components/Icon';
import Text from '@/components/Text';

type Props = {
  placeholder: string;
  /** Saisie. Requis **sauf en raccourci** (`onPress`), qui n'a rien à saisir. */
  value?: string;
  onChangeText?: (t: string) => void;
  /**
   * `sheet` — dans une feuille : fond `bg`, rayon `lg`, liseré `border`, h48.
   * C'est le traitement de champ au repos du style guide, le même que `Field`.
   * `floating` — posé SUR LA CARTE : blanc, même rayon `lg`, liseré `hairline`,
   * ombre `float`, h46. Même registre que les `IconButton` flottants qui
   * l'accompagnent.
   */
  variant?: 'sheet' | 'floating';
  /**
   * **Raccourci.** La barre cesse d'être un champ et devient un BOUTON qui en a
   * l'apparence : plus de `TextInput`, un `Text` en `textTertiary` à la place du
   * placeholder, et le tap ouvre l'écran ou le mode où la vraie saisie a lieu.
   * Miroir de `SearchBar · raccourci` dans la maquette.
   *
   * Pourquoi un prop et non un composant distinct : c'est le MÊME objet à
   * l'écran, à la mesure près, et c'est justement ce qui le fait marcher — le
   * Client tape là où il tapera encore une fois la barre ouverte. Deux
   * composants, c'était deux géométries à tenir en phase pour un seul dessin.
   */
  onPress?: () => void;
  /** Croix d'effacement — rendue seulement quand le champ n'est pas vide. */
  onClear?: () => void;
  onFocus?: () => void;
  autoFocus?: boolean;
  /** Slot en fin de champ (bouton carte, micro…), après la croix d'effacement. */
  trailing?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Barre de recherche. Un seul composant pour les emplacements qui la rendaient
 * chacun à sa façon : le `CountryPicker`, la feuille destinataire de
 * `livraison/configure`, le champ d'adresse posé sur la carte de `compte/lieu`
 * — et, depuis le 27 septembre 2026, le **raccourci « Où allez-vous ? »** en
 * tête de l'accueil.
 *
 * **Ne couvre pas les champs De/À de l'accueil** : ceux-là sont des rangées
 * d'itinéraire à deux lignes (libellé + valeur), pas une recherche — ils ont leur
 * propre grammaire et restent dans `home.tsx`.
 *
 * Le champ AU REPOS n'est jamais bleu : ni sélectionné, ni actif. Sur un écran de
 * formulaire le bleu n'appartient qu'aux CTA.
 */
export default function SearchBar({
  placeholder, value, onChangeText, variant = 'sheet',
  onPress, onClear, onFocus, autoFocus, trailing, style,
}: Props) {
  const floating = variant === 'floating';
  const Wrapper: React.ComponentType<any> = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      style={[styles.base, floating ? styles.floating : styles.sheet, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon name="search" size={18} color={Colors.textSecondary} />
      {onPress ? (
        // Raccourci : le placeholder devient un vrai texte. Même famille, même
        // corps et même gris que le `placeholderTextColor` du champ — ce qui est
        // dessous ne doit pas se voir.
        <Text variant="body" color={Colors.textTertiary} numberOfLines={1} style={styles.flex1}>
          {placeholder}
        </Text>
      ) : (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          onFocus={onFocus}
          autoFocus={autoFocus}
          autoCorrect={false}
        />
      )}
      {!onPress && value && value.length > 0 && onClear ? (
        <TouchableOpacity onPress={onClear} hitSlop={8}>
          <Icon name="close" size={16} color={Colors.textTertiary} />
        </TouchableOpacity>
      ) : null}
      {trailing}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  sheet: {
    height: 48,
    borderRadius: Radii.lg,
    backgroundColor: Colors.bg,
    borderWidth: Strokes.thin,
    borderColor: Colors.border,
  },
  floating: {
    height: 46,
    borderRadius: Radii.lg,
    backgroundColor: Colors.surface,
    borderWidth: Strokes.thin,
    borderColor: Colors.hairline,
    ...Shadows.float,
  },
  input: {
    flex: 1,
    ...inputTypo('body'),
    color: Colors.textPrimary,
    padding: 0,
  },
  flex1: { flex: 1 },
});
