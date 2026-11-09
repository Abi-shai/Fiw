import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/tokens';

type Props = {
  /** `sm` 20 — dans un `Button` en chargement. `lg` 36 — attente plein écran. */
  size?: 'sm' | 'lg';
  /** Par défaut `primary`. Dans un bouton plein, passer l'encre du bouton. */
  color?: string;
};

/**
 * Indicateur d'attente indéterminée. Comme `Toggle`, il ne dessine rien : c'est
 * l'`ActivityIndicator` de la plateforme, dont ce composant nomme les deux
 * tailles réelles du produit et fixe la couleur par défaut.
 *
 * À distinguer de `ProgressBar` : celle-ci dit **combien** il reste, celui-ci
 * dit seulement que ça travaille. Si la durée est connue, c'est la barre.
 */
export default function Spinner({ size = 'lg', color = Colors.primary }: Props) {
  return <ActivityIndicator size={size === 'sm' ? 'small' : 'large'} color={color} />;
}
