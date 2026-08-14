import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, Animated, Dimensions, TextInput, FlatList, TouchableOpacity, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radii, Outfit } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import FlagChip from '@/components/FlagChip';
import { Handle, sheetSurface } from '@/components/Sheet';
import { useSnapSheet } from '@/hooks/useSnapSheet';
import { COUNTRIES, type Country } from '@/constants/countries';

const SCREEN_H = Dimensions.get('window').height;
// Crans en translateY (0 = couvre tout). Feuille à 3 niveaux comme l'accueil :
// étendu (recherche + longue liste) / moitié (défaut) / replié (peek). Glissé
// sous le replié → fermeture.
const TY_EXPANDED = Math.round(SCREEN_H * 0.08);
const TY_HALF = Math.round(SCREEN_H * 0.45);
const TY_COLLAPSED = Math.round(SCREEN_H * 0.78);
const SNAPS = [TY_EXPANDED, TY_HALF, TY_COLLAPSED];
const SHEET_H = SCREEN_H - TY_EXPANDED;

// Insensible casse + accents (« senegal » trouve « Sénégal »).
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const SORTED = [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name, 'fr'));

type Props = {
  visible: boolean;
  selectedCode: string;
  onSelect: (c: Country) => void;
  onClose: () => void;
};

/** Sélecteur de pays en bottom sheet 3 niveaux (primitif `useSnapSheet`, comme
 *  l'accueil). Barre de recherche (pays ou indicatif) + liste triée. */
export default function CountryPicker({ visible, selectedCode, onSelect, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');

  const { ty, snapTo, panHandlers } = useSnapSheet({
    snaps: SNAPS,
    initial: SCREEN_H,
    onRelease: ({ pos, velocity: v, snapTo: st }) => {
      // Fermeture : tiré nettement sous le cran le plus bas, ou flick vers le bas
      // depuis la zone repliée.
      if (pos > TY_COLLAPSED + 50 || (v > 0.5 && pos > TY_COLLAPSED - 40)) {
        onClose();
        st(SCREEN_H, v);
        return true;
      }
      return false; // → snap au cran le plus proche
    },
  });

  useEffect(() => {
    if (visible) { setQ(''); snapTo(TY_HALF); }
    else snapTo(SCREEN_H);
  }, [visible]);

  const query = norm(q.trim());
  const data = query
    ? SORTED.filter((c) => norm(c.name).includes(query) || c.dial.includes(query))
    : SORTED;

  const scrimOpacity = ty.interpolate({
    inputRange: [TY_EXPANDED, TY_HALF, TY_COLLAPSED],
    outputRange: [0.5, 0.4, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, { opacity: scrimOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[sheetSurface, styles.sheet, { transform: [{ translateY: ty }] }]}>
        <View style={styles.inner}>
          {/* Zone de glissement : poignée + titre */}
          <View {...panHandlers} style={styles.dragZone}>
            <Handle style={styles.handle} />
            <Text variant="heading1">Indicatif pays</Text>
          </View>

          <View style={styles.search}>
            <Icon name="search" size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              value={q}
              onChangeText={setQ}
              onFocus={() => snapTo(TY_EXPANDED)}
              placeholder="Rechercher un pays ou un indicatif"
              placeholderTextColor={Colors.textTertiary}
              autoCorrect={false}
            />
            {q.length > 0 && (
              <TouchableOpacity onPress={() => setQ('')} hitSlop={8}>
                <Icon name="close" size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={data}
            keyExtractor={(c) => c.code}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => onSelect(item)}>
                <FlagChip code={item.code} />
                <Text variant="body" style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text variant="body" color={Colors.textSecondary}>{item.dial}</Text>
                {item.code === selectedCode && <Icon name="tick" size={18} color={Colors.primary} />}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            ListEmptyComponent={
              <Text variant="body" color={Colors.textTertiary} align="center" style={styles.empty}>Aucun pays trouvé</Text>
            }
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: { backgroundColor: '#000' },
  sheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: SCREEN_H,
    paddingHorizontal: 20,
  },
  inner: { height: SHEET_H },
  dragZone: { paddingTop: 10, paddingBottom: 10 },
  handle: { marginBottom: 14 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.bg,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 48,
    marginTop: 12,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontFamily: Outfit.regular, padding: 0 },
  list: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  name: { flex: 1, fontFamily: Outfit.medium },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.borderSubtle },
  empty: { marginTop: 40 },
});
