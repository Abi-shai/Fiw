import React from 'react';
import { View, TextInput, StyleSheet, type StyleProp, type ViewStyle, type TextInputProps } from 'react-native';
import { Colors, Radii, Strokes, inputTypo } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';

type Props = Omit<TextInputProps, 'style'> & {
  /** Libellé de la ligne — « De », « À », « Collecte », « Livraison ». */
  label: string;
  /** Glyphe 22 de tête, dans une gouttière de 28. */
  icon?: IconName;
  /** Bouton de fin de ligne (choisir sur la carte). Boîte de 40. */
  action?: React.ReactNode;
  /** Ligne en cours de saisie : fond `primarySubtle`, liseré `primary`. */
  actif?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Rangée d'itinéraire (Figma `PlaceField`) : libellé au-dessus de la valeur, sur
 * deux lignes serrées, dans une boîte de 60.
 *
 * Ce n'est **pas** une `SearchBar` — la barre de recherche cherche, celle-ci
 * porte un point d'un trajet et garde son libellé visible pendant la saisie.
 * C'est la grammaire des champs De/À de l'accueil.
 */
export default function PlaceField({ label, icon, action, actif, style, ...input }: Props) {
  return (
    <View style={[styles.field, actif && styles.fieldActif, style]}>
      {icon ? (
        <View style={styles.icon}>
          <Icon name={icon} size={22} color={Colors.textSecondary} />
        </View>
      ) : null}
      <View style={styles.body}>
        <Text variant="caption" color={actif ? Colors.textSecondary : Colors.textTertiary}>{label}</Text>
        <TextInput
          {...input}
          placeholderTextColor={Colors.textTertiary}
          style={styles.input}
        />
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 60,
    paddingLeft: 16,
    paddingRight: 8,
    borderRadius: Radii.lg,
    backgroundColor: Colors.bg,
  },
  fieldActif: {
    backgroundColor: Colors.primarySubtle,
    borderWidth: Strokes.thick,
    borderColor: Colors.primary,
    // Le liseré s'ajoute à l'empreinte en RN : le padding le compense pour que
    // la rangée ne bouge pas d'un état à l'autre.
    paddingLeft: 16 - Strokes.thick,
    paddingRight: 8 - Strokes.thick,
  },
  icon: { width: 28, alignItems: 'center' },
  body: { flex: 1, gap: 1 },
  input: {
    ...inputTypo('bodyMedium'),
    color: Colors.textPrimary,
    padding: 0,
  },
});
