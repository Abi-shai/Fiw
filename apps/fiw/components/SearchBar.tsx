import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Radii, Shadows, inputTypo, Strokes } from '@/constants/tokens';
import Icon from '@/components/Icon';

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  /**
   * `sheet` — dans une feuille : fond `bg`, rayon `lg`, liseré `border`, h48.
   * C'est le traitement de champ au repos du style guide, le même que `Field`.
   * `floating` — posé SUR LA CARTE : blanc, même rayon `lg`, liseré `hairline`,
   * ombre `float`, h46. Même registre que les `IconButton` flottants qui
   * l'accompagnent.
   */
  variant?: 'sheet' | 'floating';
  /** Croix d'effacement — rendue seulement quand le champ n'est pas vide. */
  onClear?: () => void;
  onFocus?: () => void;
  autoFocus?: boolean;
  /** Slot en fin de champ (bouton carte, micro…), après la croix d'effacement. */
  trailing?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Barre de recherche. Un seul composant pour les trois emplacements qui la
 * rendaient chacun à sa façon : le `CountryPicker`, la feuille destinataire de
 * `livraison/configure` et le champ d'adresse posé sur la carte de `compte/lieu`.
 *
 * **Ne couvre pas les champs De/À de l'accueil** : ceux-là sont des rangées
 * d'itinéraire à deux lignes (libellé + valeur), pas une recherche — ils ont leur
 * propre grammaire et restent dans `home.tsx`.
 *
 * Le champ AU REPOS n'est jamais bleu : ni sélectionné, ni actif. Sur un écran de
 * formulaire le bleu n'appartient qu'aux CTA.
 */
export default function SearchBar({
  value, onChangeText, placeholder, variant = 'sheet',
  onClear, onFocus, autoFocus, trailing, style,
}: Props) {
  const floating = variant === 'floating';
  return (
    <View style={[styles.base, floating ? styles.floating : styles.sheet, style]}>
      <Icon name="search" size={18} color={Colors.textSecondary} />
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
      {value.length > 0 && onClear ? (
        <TouchableOpacity onPress={onClear} hitSlop={8}>
          <Icon name="close" size={16} color={Colors.textTertiary} />
        </TouchableOpacity>
      ) : null}
      {trailing}
    </View>
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
});
