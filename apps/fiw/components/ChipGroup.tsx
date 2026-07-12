import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import { Colors, Radii, Poppins } from '@/constants/tokens';

export type ChipItem = { id: string; label: string; icon?: IconName; hint?: string };

type Props = {
  items: ChipItem[];
  value: string | null;
  onChange: (id: string) => void;
  /** Affiche le `hint` de l'élément sélectionné sous le groupe. */
  showHint?: boolean;
  /** Une seule ligne à défilement horizontal (au lieu du wrap). La dernière
   *  chip visible est coupée au bord pour signaler le scroll (réf. Grab/Shopee). */
  scrollable?: boolean;
  /** Débord horizontal jusqu'au bord du conteneur parent (= son padding),
   *  pour que la ligne scrollable se coupe au bord et non au padding. */
  bleed?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Groupe de chips à sélection unique (réf. benchmark Livraison : types de colis
 * Gojek, tailles S/M/L Grab). Chip active = fond primarySubtle + bordure primary,
 * même grammaire que les cartes Option A/B. Générique : types de colis, tailles,
 * types de problème Assistance…
 */
export default function ChipGroup({ items, value, onChange, showHint, scrollable, bleed = 0, style }: Props) {
  const selected = items.find((i) => i.id === value);

  const chips = items.map((item) => {
    const active = item.id === value;
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.chip, active && styles.chipActive]}
        activeOpacity={0.85}
        onPress={() => { Haptics.selectionAsync(); onChange(item.id); }}
      >
        {item.icon && (
          <Icon
            name={item.icon}
            size={15}
            weight={active ? 'fill' : 'bold'}
            color={active ? Colors.primary : Colors.textSecondary}
          />
        )}
        <Text
          variant="bodySmall"
          color={active ? Colors.primaryPressed : Colors.textPrimary}
          style={active ? styles.labelActive : undefined}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  });

  return (
    <View style={style}>
      {scrollable ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={bleed ? { marginHorizontal: -bleed } : undefined}
          contentContainerStyle={[styles.scrollRow, bleed ? { paddingHorizontal: bleed } : null]}
        >
          {chips}
        </ScrollView>
      ) : (
        <View style={styles.row}>{chips}</View>
      )}
      {showHint && selected?.hint ? (
        <Text variant="caption" color={Colors.textSecondary} style={styles.hint}>
          {selected.hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  scrollRow: { flexDirection: 'row', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: Radii.pill,
    backgroundColor: Colors.track,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  chipActive: { backgroundColor: Colors.primarySubtle, borderColor: Colors.primary },
  labelActive: { fontFamily: Poppins.semibold },
  hint: { marginTop: 8 },
});
