import React from 'react';
import { Text as RNText, StyleSheet, TextProps as RNTextProps, TextStyle } from 'react-native';
import { Colors, Typography, type TextVariant } from '@/constants/tokens';

type Props = RNTextProps & {
  /** Variante typographique sémantique (mappe taille + graisse Outfit + line-height). */
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
      style={[base, styles[variant], { color }, align ? { textAlign: align } : null, style]}
    />
  );
}

/**
 * Réglage de base de TOUT texte du produit — la seule raison d'être de cet objet
 * est `includeFontPadding`, et elle vaut d'être écrite.
 *
 * **Android réserve un espace supplémentaire au-dessus de l'ascendante et sous la
 * descendante de la police** (`includeFontPadding`, actif par défaut) ; iOS non.
 * Chaque texte y est donc plus haut que sur iOS de quelques points en haut ET en
 * bas — et comme la hauteur d'un texte participe à la mise en page (rangées,
 * cartes, gouttières), l'écart se propage partout. À l'écran ça se lit comme du
 * **padding en trop autour du texte**, alors que rien dans les styles ne l'a
 * demandé.
 *
 * L'effet est d'autant plus net avec **Outfit**, dont les métriques déclarées sont
 * généreuses. Le mettre à `false` fait mesurer Android sur l'interligne réel — donc
 * comme iOS, et comme la maquette, qui est dessinée sur un cadre iPhone.
 *
 * Pas de branche `Platform` : la propriété est ignorée sur iOS.
 */
const base: TextStyle = { includeFontPadding: false };

const styles = StyleSheet.create(
  Object.fromEntries(
    Object.entries(Typography).map(([k, v]) => [k, v as TextStyle])
  ) as Record<TextVariant, TextStyle>
);
