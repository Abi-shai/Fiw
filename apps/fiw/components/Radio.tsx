import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Strokes } from '@/constants/tokens';
import Icon from '@/components/Icon';

/** Pastille de sélection unique : coché = fond bleu marque + tick blanc, décoché
 *  = cercle vide au liseré neutre. Marque « l'élu » d'un ensemble dont un seul
 *  membre peut l'être (moyen de paiement par défaut, choix d'une feuille…).
 *  N'est pas tappable en propre : c'est la rangée qui porte l'action. */
export default function Radio({ selected, size = 26, disabled }: {
  selected: boolean; size?: number; disabled?: boolean;
}) {
  return (
    <View
      style={[
        styles.radio,
        { width: size, height: size, borderRadius: size / 2 },
        selected && styles.selected,
        disabled && (selected ? styles.selectedDisabled : styles.disabled),
      ]}
    >
      {selected && <Icon name="tick" size={Math.round(size * 0.58)} weight="bold" color={Colors.surface} />}
    </View>
  );
}

const styles = StyleSheet.create({
  radio: {
    borderWidth: Strokes.thick,
    borderColor: Colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  // État désactivé : le liseré descend d'un palier (`textDisabled`), le plein
  // sélectionné s'éteint en gris.
  disabled: { borderColor: Colors.textDisabled },
  selectedDisabled: { backgroundColor: Colors.textDisabled, borderColor: Colors.textDisabled },
});
