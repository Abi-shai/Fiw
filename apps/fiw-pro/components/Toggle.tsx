import React from 'react';
import { Switch } from 'react-native';
import { Colors } from '@/constants/tokens';

type Props = {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
};

/**
 * Interrupteur binaire — le seul contrôle du système que l'app ne dessine pas :
 * elle rend le `Switch` natif. La maquette en reprend la géométrie iOS
 * (51 × 31, pouce 27, marge 2) plutôt que d'en inventer une, et n'y applique
 * que les couleurs Fiw. Ce composant ne fait donc qu'une chose : **poser les
 * couleurs à un seul endroit**, au lieu de les répéter à chaque rangée.
 *
 * À n'employer que pour un réglage qui s'applique **immédiatement** —
 * notifications, partage de trajet. Un choix qui attend une validation prend un
 * `Checkbox`.
 */
export default function Toggle({ value, onValueChange, disabled }: Props) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ true: Colors.primary, false: Colors.border }}
      thumbColor={Colors.surface}
      // Android ignore `trackColor.false` sur la piste éteinte : c'est
      // `ios_backgroundColor` qui la porte des deux côtés.
      ios_backgroundColor={Colors.border}
    />
  );
}
