import React from 'react';
import { View, TextInput, StyleSheet, type StyleProp, type ViewStyle, type TextInputProps } from 'react-native';
import { Colors, Radii, Strokes, inputTypo } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import IconButton from '@/components/IconButton';

type Props = Omit<TextInputProps, 'style'> & {
  /** Libellé de la ligne — « De », « À », « Collecte », « Livraison ». */
  label: string;
  /** Glyphe 22 de tête, dans une gouttière de 28. */
  icon?: IconName;
  /** Action de fin de ligne — choisir le point sur la carte. Sans elle, pas de
   *  bouton. C'est le composant qui décide de son habillage, jamais l'écran :
   *  `flat` au repos, `link` quand la ligne est active (voir plus bas). */
  onAction?: () => void;
  /** Glyphe du bouton d'action. `location` par défaut, comme la maquette. */
  actionIcon?: IconName;
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
export default function PlaceField({
  label, icon, onAction, actionIcon = 'location', actif, style, ...input
}: Props) {
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
      {onAction ? (
        // La variante suit l'état de la ligne, et l'écran n'a pas son mot à dire :
        // au repos le bouton est une pastille `flat` à glyphe neutre ; sur la ligne
        // active il devient `link` — nu, glyphe `primary`. Un fond posé sur le
        // `primarySubtle` de la ligne active y ferait un disque blanc.
        <IconButton
          name={actionIcon}
          variant={actif ? 'link' : 'flat'}
          size="md"
          onPress={onAction}
        />
      ) : null}
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
