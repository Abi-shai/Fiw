import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radii } from '@/constants/tokens';
import Icon, { type IconName } from '@/components/Icon';
import Text from '@/components/Text';

/** Tuile carrée icône + libellé d'une rangée d'actions de feuille (appeler,
 *  chat, partager, urgence) — Figma `ActionTile`. `danger` bascule le fond sur
 *  `errorSubtle` et l'icône en `fill`. */
export default function ActionTile({ icon, label, danger, onPress }: {
  icon: IconName; label: string; danger?: boolean; onPress?: () => void;
}) {
  const color = danger ? Colors.error : Colors.primary;
  return (
    <TouchableOpacity
      style={[styles.tile, danger && styles.tileDanger]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Icon name={icon} size={20} color={color} weight={danger ? 'fill' : 'bold'} />
      <Text variant="caption" color={danger ? Colors.error : Colors.textPrimary}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Rangée de tuiles d'action — quatre au plus, à parts égales
 *  (Figma `ActionTileRow`, slot `Tuiles`). */
export function ActionTileRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.tilesRow}>{children}</View>;
}

const styles = StyleSheet.create({
  tilesRow: { flexDirection: 'row', gap: 8 },
  tile: {
    flex: 1, alignItems: 'center', gap: 8,
    paddingVertical: 12,
    backgroundColor: Colors.bg,
    borderRadius: Radii.lg,
  },
  tileDanger: { backgroundColor: Colors.errorSubtle },
});
