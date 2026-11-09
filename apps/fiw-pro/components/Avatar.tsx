import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Outfit, Strokes } from '@/constants/tokens';
import Text from '@/components/Text';

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Tailles système de l'avatar. `AVATAR_ROW` est adossé à la géométrie de
 *  `ListRow` (retrait 76 = 16 padding + 48 avatar + 12 gap) ; `AVATAR_CARD` est
 *  celle de la carte prestataire. Au-delà, les avatars « héros » (clôture,
 *  profil, appel) restent des valeurs libres : ils sortent du système de
 *  rangées et cartes. */
export const AVATAR_ROW = 48;
export const AVATAR_CARD = 64;

type Props = {
  name: string;
  /** Diamètre en px. Volontairement numérique et non `sm|md|lg` : le rayon se
   *  déduit par formule et seules les deux tailles système portent une décision
   *  de design (leurs initiales sont typées par la maquette, cf. `TYPE`).
   *  Préférer `AVATAR_ROW` / `AVATAR_CARD`. */
  size?: number;
  /** Cercle accentué : le liseré passe de blanc à bleu marque (mise en avant du
   *  prestataire). */
  bordered?: boolean;
  /** Deux familles, celles que `Button` distingue déjà : **`plein`** (fond
   *  `primarySubtle`, initiales `primaryPressed`) et **`contour`** (fond
   *  `surface`, liseré `borderSubtle`, initiales `gray700`).
   *
   *  `contour` ne porte AUCUNE couleur de marque : ni l'aplat, ni les lettres.
   *  `gray700` est le gris foncé des glyphes neutres du système — celui de
   *  l'icône de retour de `ScreenHeader` et des boutons flottants sur la carte.
   *  Des initiales sont un glyphe plus qu'un texte courant, d'où ce palier
   *  plutôt que `textPrimary` ou `textSecondary`.
   *
   *  Ce n'est pas un axe de TON mais de REMPLISSAGE : en `contour`, la masse de
   *  couleur disparaît. C'est ce qui permet à un portrait de rester lisible
   *  sans tirer l'œil — cf. la règle du style guide « un portrait confirme, il
   *  n'appelle à rien ».
   *
   *  Le défaut reste `plein` : c'est ce que portent tous les avatars de
   *  prestataire, où la couleur désigne bien quelqu'un dont on attend quelque
   *  chose. */
  variant?: 'plein' | 'contour';
  style?: StyleProp<ViewStyle>;
};

/** Initiales : la maquette type les deux tailles système au lieu de les
 *  calculer — 48 en `bodySemibold` (16), 64 en `heading1` (22). Au-delà, les
 *  avatars « héros » (clôture 72, profil 88, appel 112) sortent du système et
 *  reprennent la proportion. */
const initialsSize = (size: number) =>
  size <= AVATAR_ROW ? 16 : size <= AVATAR_CARD ? 22 : Math.round(size * 0.38);

/** Avatar prestataire/client à initiales (remplace les emojis visage).
 *  Une vraie photo pourra être ajoutée plus tard sans changer l'API. */
export default function Avatar({ name, size = AVATAR_ROW, bordered, variant = 'plein', style }: Props) {
  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
        variant === 'contour' && styles.contour,
        bordered && styles.bordered,
        style,
      ]}
    >
      <Text
        color={variant === 'contour' ? Colors.gray700 : Colors.primaryPressed}
        style={[styles.text, { fontSize: initialsSize(size) }]}
      >
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    // Le liseré existe TOUJOURS (maquette) : blanc au repos, il ne se voit que
    // là où l'avatar chevauche autre chose — bloc véhicule, pile d'avatars.
    borderWidth: Strokes.thick,
    borderColor: Colors.surface,
  },
  // Le liseré est le même `Strokes.thick` que le blanc du défaut — seule sa
  // couleur change. Il cesse d'être un détourage et devient le contour du
  // cercle, puisqu'il n'y a plus d'aplat pour le dessiner.
  contour: { backgroundColor: Colors.surface, borderColor: Colors.borderSubtle },
  bordered: { borderColor: Colors.primary },
  text: { fontFamily: Outfit.semibold },
});
