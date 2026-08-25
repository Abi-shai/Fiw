import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, Animated, Dimensions, FlatList, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import SearchBar from '@/components/SearchBar';
import FlagChip from '@/components/FlagChip';
import ListRow from '@/components/ListRow';
import Divider from '@/components/Divider';
import Scrim from '@/components/Scrim';
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
      <Animated.View style={StyleSheet.absoluteFill}>
        <Scrim opacity={scrimOpacity} />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[sheetSurface, styles.sheet, { transform: [{ translateY: ty }] }]}>
        <View style={styles.inner}>
          {/* Zone de glissement : poignée + titre */}
          <View {...panHandlers} style={styles.dragZone}>
            <Handle style={styles.handle} />
            <Text variant="heading1">Indicatif pays</Text>
          </View>

          <SearchBar
            value={q}
            onChangeText={setQ}
            onClear={() => setQ('')}
            onFocus={() => snapTo(TY_EXPANDED)}
            placeholder="Rechercher un pays ou un indicatif"
            style={styles.search}
          />

          <FlatList
            data={data}
            keyExtractor={(c) => c.code}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            renderItem={({ item }) => (
              <ListRow
                leading={<FlagChip code={item.code} />}
                title={item.name}
                value={item.dial}
                trailing={item.code === selectedCode
                  ? <Icon name="tick" size={18} color={Colors.primary} />
                  : null}
                onPress={() => onSelect(item)}
              />
            )}
            ItemSeparatorComponent={() => <Divider />}
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
  sheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: SCREEN_H,
    paddingHorizontal: 20,
  },
  inner: { height: SHEET_H },
  dragZone: { paddingTop: 10, paddingBottom: 10 },
  handle: { marginBottom: 14 },
  // Géométrie du champ dans `SearchBar` — ici seules les marges de l'emplacement.
  search: { marginTop: 12, marginBottom: 8 },
  list: { flex: 1 },
  empty: { marginTop: 40 },
});
