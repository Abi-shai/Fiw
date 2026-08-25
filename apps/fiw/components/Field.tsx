import React from 'react';
import { View, TextInput, StyleSheet, type StyleProp, type ViewStyle, type TextInputProps } from 'react-native';
import { Colors, Radii, Strokes, Typography, inputTypo } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';

export type FieldEtat = 'repos' | 'actif' | 'erreur' | 'désactivé';

type Props = Omit<TextInputProps, 'style' | 'editable'> & {
  /** Libellé au-dessus du champ. Absent = pas d'en-tête. */
  label?: string;
  /** Astérisque rouge après le libellé. */
  requis?: boolean;
  /** Zone de saisie multiligne (hauteur 96 au lieu de 56). */
  zone?: boolean;
  /** Glyphe 18 en tête de champ. */
  icon?: IconName;
  /** Fin de champ : croix d'effacement, cadenas, bouton… boîte de 32. */
  trailing?: React.ReactNode;
  /** Note sous le champ. Passe en rouge quand l'état est `erreur`. */
  aide?: string;
  état?: FieldEtat;
  style?: StyleProp<ViewStyle>;
};

/**
 * Champ de saisie du système (Figma `Field`). Trois types — texte, téléphone
 * (`PhoneField`, qui porte la logique des indicatifs) et zone — et quatre
 * états.
 *
 * **Un champ au repos n'est jamais bleu** : fond `surface`, liseré `border`. Le
 * bleu ne marque qu'un ÉTAT — le focus remplit en `primarySubtle` et double le
 * liseré en `primary`. L'erreur garde le fond blanc et passe le liseré en
 * `error`, ce qui laisse le texte saisi lisible.
 */
export default function Field({
  label, requis, zone, icon, trailing, aide, état = 'repos', style, ...input
}: Props) {
  const disabled = état === 'désactivé';
  return (
    <View style={[styles.wrap, style]}>
      {label ? (
        <View style={styles.header}>
          <Text variant="label" color={Colors.textSecondary}>{label}</Text>
          {requis ? <Text variant="caption" color={Colors.error}>*</Text> : null}
        </View>
      ) : null}

      <View style={[styles.control, zone && styles.controlZone, CONTROL[état]]}>
        {icon ? <Icon name={icon} size={18} color={Colors.textSecondary} /> : null}
        <TextInput
          {...input}
          multiline={zone}
          textAlignVertical={zone ? 'top' : undefined}
          editable={!disabled}
          placeholderTextColor={Colors.textTertiary}
          style={[
            styles.input,
            zone ? styles.inputZone : null,
            disabled && styles.inputDisabled,
          ]}
        />
        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>

      {aide ? (
        <Text variant="bodySmall" color={état === 'erreur' ? Colors.error : Colors.textSecondary}>
          {aide}
        </Text>
      ) : null}
    </View>
  );
}

/** Fond + liseré par état. C'est le seul endroit où le champ change de couleur. */
const CONTROL: Record<FieldEtat, ViewStyle> = {
  repos: { backgroundColor: Colors.surface, borderWidth: Strokes.thin, borderColor: Colors.border },
  actif: { backgroundColor: Colors.primarySubtle, borderWidth: Strokes.thick, borderColor: Colors.primary },
  erreur: { backgroundColor: Colors.surface, borderWidth: Strokes.thick, borderColor: Colors.error },
  désactivé: { backgroundColor: Colors.track, borderWidth: Strokes.thin, borderColor: Colors.border },
};

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 56,
    paddingHorizontal: 16,
    borderRadius: Radii.lg,
  },
  // La zone perd sa hauteur fixe et son centrage : le texte s'écrit depuis le
  // haut, avec un padding égal sur les quatre côtés.
  controlZone: {
    height: 96,
    alignItems: 'flex-start',
    padding: 14,
  },
  input: {
    flex: 1,
    ...inputTypo('body'),
    color: Colors.textPrimary,
    padding: 0,
  },
  // Multiligne : l'interligne de la variante est nécessaire pour respirer, là
  // où sur une ligne il décalerait le texte verticalement sur Android.
  inputZone: { ...Typography.body, height: '100%' },
  inputDisabled: { color: Colors.textDisabled },
  trailing: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
});
