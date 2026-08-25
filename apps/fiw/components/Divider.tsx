import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/tokens';

/** Filet de séparation entre rangées (Figma `Divider`). `inset` = décalage
 *  gauche en pixels, miroir de l'axe `Retrait` : `0` pleine largeur · `50`
 *  aligné sur un contenu à leading 22 (padding 16 + 22 + gap 12) · `76` sur un
 *  leading 48. Valeurs géométriques et non nominales : la primitive ne connaît
 *  pas les tailles de leading de `ListRow`, elle ne connaît que des pixels. */
export default function Divider({ inset = 0 }: { inset?: number }) {
  return <View style={[styles.divider, inset ? { marginLeft: inset } : null]} />;
}

const styles = StyleSheet.create({
  divider: { height: 1, backgroundColor: Colors.border },
});
