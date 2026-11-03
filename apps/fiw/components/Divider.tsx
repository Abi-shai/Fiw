import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/tokens';

/** Filet de séparation entre rangées (Figma `Divider`). `inset` = décalage
 *  gauche en pixels, depuis le début de la rangée : `0` pleine largeur · `34`
 *  sous le texte d'une rangée à icône 22 (22 + gouttière 12) · `60` sous celui
 *  d'une rangée à avatar 48. Valeurs géométriques et non nominales : la
 *  primitive ne connaît pas les tailles de leading de `ListRow`, elle ne connaît
 *  que des pixels.
 *
 *  Jusqu'au 29 septembre 2026, l'axe `Retrait` de Figma disait 50 et 76, en
 *  comptant un padding 16 que porte déjà le contenu de `List` — dans Figma
 *  comme dans le code, tous les filets partaient 16 à droite du texte. Les deux
 *  ont été corrigés le même jour : `Retrait` = 0 · 34 · 54 · 60, puis 68 (logo
 *  de paiement 56) le 3 novembre 2026. */
export default function Divider({ inset = 0 }: { inset?: number }) {
  return <View style={[styles.divider, inset ? { marginLeft: inset } : null]} />;
}

const styles = StyleSheet.create({
  divider: { height: 1, backgroundColor: Colors.border },
});
