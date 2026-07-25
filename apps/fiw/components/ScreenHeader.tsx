import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IconButton from '@/components/IconButton';
import Text from '@/components/Text';
import { Colors, Spacing } from '@/constants/tokens';

type Props = {
  title?: string;
  /** Action de retour ; par défaut router.back(). */
  onBack?: () => void;
  /** Élément optionnel à droite (action contextuelle). */
  right?: React.ReactNode;
};

/** En-tête d'écran standard : bouton retour + titre + action optionnelle.
 *  Aligné sur le registre des feuilles (bouton plat, titre heading2). */
export default function ScreenHeader({ title, onBack, right }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <IconButton name="back" variant="flat" color={Colors.textPrimary} onPress={onBack ?? (() => router.back())} />
      {title ? (
        <Text variant="heading2" style={styles.title} numberOfLines={1}>{title}</Text>
      ) : (
        <View style={styles.title} />
      )}
      {right ?? <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[3],
  },
  title: { flex: 1, marginLeft: Spacing[2] },
  spacer: { width: 40 },
});
