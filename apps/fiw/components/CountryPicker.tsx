import React, { useEffect, useMemo, useState } from 'react';
import {
  View, StyleSheet, Animated, FlatList, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScreenHeight } from '@/hooks/useScreenHeight';
import { Colors, Spacing } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import SearchBar from '@/components/SearchBar';
import FlagChip from '@/components/FlagChip';
import ListRow from '@/components/ListRow';
import Divider from '@/components/Divider';
import Scrim, { sheetScrimOpacity } from '@/components/Scrim';
import { Handle, sheetSurface, sheetSnaps } from '@/components/Sheet';
import { useSnapSheet } from '@/hooks/useSnapSheet';
import { useKeyboardState } from 'react-native-keyboard-controller';
import { COUNTRIES, type Country } from '@/constants/countries';


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
  const SCREEN_H = useScreenHeight();
  // Feuille pleine hauteur à 3 crans comme l'accueil — les trois niveaux du
  // système (85 / 50 / 25 % de hauteur visible). Glissé sous le replié →
  // fermeture.
  const SNAPS = useMemo(() => sheetSnaps(SCREEN_H, SCREEN_H), [SCREEN_H]);
  const [TY_EXPANDED, TY_HALF, TY_COLLAPSED] = SNAPS;
  const SHEET_H = SCREEN_H - TY_EXPANDED; // le plafond de 85 %
  const [q, setQ] = useState('');
  // La feuille ne bouge PAS à l'ouverture du clavier (elle monte au cran haut au
  // focus, sa barre de recherche est donc déjà en haut) : c'est la LISTE qui doit
  // se dégager. Sans ça les derniers pays restent sous le clavier — Android ne
  // redimensionne plus la fenêtre (`adjustNothing`, cf. `app/_layout.tsx`).
  const kbHeight = useKeyboardState((s) => s.height);

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

  // Voile aux trois niveaux, plus le zéro de la feuille fermée (SCREEN_H) : sans
  // ce dernier point, le cran replié tiendrait le voile à 25 % feuille fermée.
  const scrimOpacity = sheetScrimOpacity(ty, SNAPS, SCREEN_H);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={StyleSheet.absoluteFill}>
        <Scrim opacity={scrimOpacity} />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[sheetSurface, styles.sheet, { height: SCREEN_H, transform: [{ translateY: ty }] }]}>
        <View style={{ height: SHEET_H }}>
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
            contentContainerStyle={{ paddingBottom: (kbHeight || insets.bottom) + 24 }}
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
            // Les 8 du bloc de listing sont portés par le séparateur : sur une
            // `FlatList`, la cellule enveloppe l'item avec son séparateur, donc
            // un `gap` de conteneur laisserait le filet collé à sa rangée.
            ItemSeparatorComponent={() => (
              <View style={styles.sep}><Divider /></View>
            )}
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
  // `height` est posée à l'exécution : elle vient du cadre mesuré, pas d'une
  // constante de module.
  sheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    paddingHorizontal: 20,
  },
  dragZone: { paddingTop: 10, paddingBottom: 10 },
  handle: { marginBottom: 14 },
  // Géométrie du champ dans `SearchBar` — ici seules les marges de l'emplacement.
  search: { marginTop: 12, marginBottom: 8 },
  list: { flex: 1 },
  sep: { paddingVertical: Spacing[2] },
  empty: { marginTop: 40 },
});
