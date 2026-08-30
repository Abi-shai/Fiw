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
export default function Avatar({ name, size = AVATAR_ROW, bordered, style }: Props) {
  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
        bordered && styles.bordered,
        style,
      ]}
    >
      <Text color={Colors.primaryPressed} style={[styles.text, { fontSize: initialsSize(size) }]}>
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
  bordered: { borderColor: Colors.primary },
  text: { fontFamily: Outfit.semibold },
});
