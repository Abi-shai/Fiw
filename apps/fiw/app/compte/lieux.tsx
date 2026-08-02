import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radii } from '@/constants/tokens';
import ScreenHeader from '@/components/ScreenHeader';
import PlaceRow from '@/components/PlaceRow';
import Button from '@/components/Button';
import Text from '@/components/Text';
import { usePlaces } from '@/stores/places';
import type { IconName } from '@/components/Icon';

// Maison + Travail = emplacements permanents ; les autres sont des lieux libres
// nommés par le Client (décision D2). Icône par type.
const iconFor = (kind: string): IconName =>
  kind === 'home' ? 'home' : kind === 'work' ? 'work' : 'location';

export default function LieuxScreen() {
  const insets = useSafeAreaInsets();
  const places = usePlaces();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Lieux enregistrés" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {places.map((p) => (
            <PlaceRow
              key={p.id}
              icon={iconFor(p.kind)}
              accent
              title={p.label}
              // Maison et Travail restent dans la liste même vidés de leur
              // adresse : la seconde ligne devient alors l'invitation à la
              // remplir (cf. Bolt, Uber, Freenow).
              subtitle={p.detail || 'Ajouter une adresse'}
              subtitleAccent={!p.detail}
              trailing="chevronRight"
              onPress={() => router.push(`/compte/lieu?id=${p.id}`)}
              style={styles.row}
            />
          ))}
        </View>

        <Text variant="caption" color={Colors.textTertiary} style={styles.hint}>
          Maison et Travail sont toujours présents ; ajoutez autant de lieux libres que vous voulez.
        </Text>

        <Button
          label="Ajouter un lieu"
          icon="add"
          onPress={() => router.push('/compte/lieu')}
          style={styles.add}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  row: { paddingHorizontal: 4 },
  hint: { marginTop: 8, marginLeft: 4, lineHeight: 16 },
  add: { marginTop: 16 },
});
