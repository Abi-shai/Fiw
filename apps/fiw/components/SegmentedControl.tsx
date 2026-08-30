import React from 'react';
import { View, TouchableOpacity, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radii, Shadows } from '@/constants/tokens';
import Text from '@/components/Text';

export type Segment = { id: string; label: string };

type Props = {
  /** Deux ou trois segments, pas plus : au-delà, c'est une liste ou un
   *  `ChipGroup` à défilement. */
  items: Segment[];
  value: string;
  onChange: (id: string) => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Contrôle segmenté — piste `track`, pastille active `surface` posée sur
 * `Shadows.sm`, libellé `label` en encre pleine quand il est actif.
 *
 * Le code en portait deux traitements : celui-ci (`transport/configure`) et une
 * piste blanche à liseré avec pastille `primarySubtle` (`affilie/reseau`). La
 * maquette a tranché pour celui-ci — il réemploie la piste `track` déjà tenue
 * par `Chip` et `ActionPill`, et il laisse le bleu à ce qui **sélectionne une
 * valeur** plutôt qu'à ce qui **filtre une vue**.
 */
export default function SegmentedControl({ items, value, onChange, style }: Props) {
  return (
    <View style={[styles.track, style]}>
      {items.map((item) => {
        const active = item.id === value;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.item, active && styles.itemActive]}
            activeOpacity={0.85}
            onPress={() => { Haptics.selectionAsync(); onChange(item.id); }}
          >
            <Text variant="label" color={active ? Colors.textPrimary : Colors.textSecondary}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: Colors.track,
    borderRadius: Radii.pill,
    padding: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: Radii.pill,
  },
  itemActive: { backgroundColor: Colors.surface, ...Shadows.sm },
});
