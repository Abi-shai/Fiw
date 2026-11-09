import React, { useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radii } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';

/** Durées du fondu, relevées sur les deux écrans qui le portaient. */
const IN = 180;
const HOLD = 1300;
const OUT = 280;

/**
 * Pilote d'un toast : l'état, l'opacité animée, et le geste qui le déclenche.
 * Le cycle complet vit ici — c'est ce qui était recopié dans `affilie/outils` et
 * `affilie/qr`, à l'identique.
 */
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;

  const flash = (msg: string) => {
    setMessage(msg);
    Haptics.selectionAsync();
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: IN, useNativeDriver: true }),
      Animated.delay(HOLD),
      Animated.timing(opacity, { toValue: 0, duration: OUT, useNativeDriver: true }),
    ]).start(() => setMessage(null));
  };

  return { message, opacity, flash };
}

type Props = {
  message: string | null;
  opacity: Animated.Value;
  icon?: IconName;
  /** Distance au bas de l'écran — 48 par défaut, plus haut quand un pied
   *  d'écran occupe déjà la zone. */
  bottom?: number;
};

/**
 * Confirmation fugace d'une action sans conséquence — « Code copié », « QR code
 * enregistré ». Pilule `textPrimary`, glyphe et libellé en `textOnPrimary`.
 *
 * Le registre le plus discret du système : il ne demande rien, ne se ferme pas,
 * il s'efface. Ce qui appelle une décision prend une modale ; ce qui doit rester
 * lisible prend un `InfoBanner`.
 *
 * **Jamais pour une erreur** : un échec se dit là où l'action a eu lieu, pas
 * dans une pilule qui disparaît.
 */
export default function Toast({ message, opacity, icon = 'tick', bottom = 48 }: Props) {
  if (!message) return null;
  return (
    <Animated.View style={[styles.toast, { opacity, bottom }]} pointerEvents="none">
      <Icon name={icon} size={16} weight="bold" color={Colors.textOnPrimary} />
      <Text variant="label" color={Colors.textOnPrimary}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Radii.pill,
  },
});
