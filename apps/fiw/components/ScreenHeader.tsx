import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/tokens';
import Text from '@/components/Text';
import IconButton from '@/components/IconButton';

/** En-tête de page (route poussée dans la pile) : bouton retour + titre, gère la
 *  safe-area. Pendant `SheetHeader` (feuilles) ; `ScreenHeader` pour les pages
 *  pleines (Historique, détail…). Réutilise le bouton retour flottant du DS. */
export default function ScreenHeader({ title, onBack, right, style }: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + 8 }, style]}>
      <IconButton name="back" variant="floating" onPress={onBack ?? (() => router.back())} />
      <Text variant="heading1" style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: { flex: 1, letterSpacing: -0.4 },
  // Réserve la largeur d'un bouton pour équilibrer le titre quand il n'y a pas
  // d'action à droite.
  right: { minWidth: 46, alignItems: 'flex-end' },
});
