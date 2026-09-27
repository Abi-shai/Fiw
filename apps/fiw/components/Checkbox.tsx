import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Colors, Radii, Strokes } from '@/constants/tokens';
import Icon from '@/components/Icon';

type Props = {
  checked: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Case à cocher — le pendant multi-choix du `Radio`, et son jumeau géométrique :
 * 24 px, liseré `thick`, rayon `sm`.
 *
 * Le code en portait deux versions divergentes (22 / rayon 6 dans
 * `affilie/presentation.tsx`, 24 / `radius/sm` dans `affilie/conditions.tsx`).
 * La maquette a tranché pour la seconde : à côté du `Radio` (26, même poids de
 * trait) elle se lit comme un membre de la même famille, et son rayon reste dans
 * l'échelle.
 *
 * Au repos le liseré est `textTertiary`, comme celui du `Radio` — pas `border`,
 * qui est le liseré des surfaces, pas des contrôles.
 *
 * N'est pas tappable en propre : c'est la rangée qui porte l'action.
 *
 * ⚠️ **Sans emploi dans l'app depuis le 27 septembre 2026**, et c'est voulu :
 * ses deux sites étaient les deux acceptations du contrat d'affiliation, qui
 * n'en font plus qu'une, portée par le CTA et annoncée par une mention (cf.
 * `affilie/presentation.tsx`). Le composant reste — il est dans la maquette, et
 * la case à cocher garde sa place le jour où un écran EST un contrat à
 * signer — mais il ne faut pas le reprendre pour un consentement promotionnel.
 */
export default function Checkbox({ checked, disabled, style }: Props) {
  return (
    <View
      style={[
        styles.box,
        checked && styles.checked,
        disabled && (checked ? styles.checkedDisabled : styles.disabled),
        style,
      ]}
    >
      {checked && <Icon name="tick" size={15} weight="bold" color={Colors.surface} />}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 24, height: 24,
    borderRadius: Radii.sm,
    borderWidth: Strokes.thick,
    borderColor: Colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  disabled: { borderColor: Colors.textDisabled },
  checkedDisabled: { backgroundColor: Colors.textDisabled, borderColor: Colors.textDisabled },
});
