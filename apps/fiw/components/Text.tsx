import React from 'react';
import { Text as RNText, StyleSheet, TextProps as RNTextProps, TextStyle } from 'react-native';
import { Colors, Typography, type TextVariant } from '@/constants/tokens';

type Props = RNTextProps & {
  /** Variante typographique sémantique (mappe taille + graisse Poppins + line-height). */
  variant?: TextVariant;
  /** Couleur du token de texte (défaut : primaire). */
  color?: string;
  /** Alignement rapide. */
  align?: TextStyle['textAlign'];
};

/** Seul point d'entrée typographique de l'app. Interdit le fontSize/fontWeight
 *  brut dans les écrans : toute taille/graisse passe par une variante. */
export default function Text({
  variant = 'body',
  color = Colors.textPrimary,
  align,
  style,
  ...rest
}: Props) {
  return (
    <RNText
      {...rest}
      style={[styles[variant], { color }, align ? { textAlign: align } : null, style]}
    />
  );
}

const styles = StyleSheet.create(
  Object.fromEntries(
    Object.entries(Typography).map(([k, v]) => [k, v as TextStyle])
  ) as Record<TextVariant, TextStyle>
);
