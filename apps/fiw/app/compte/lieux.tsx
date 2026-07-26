import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radii } from '@/constants/tokens';
import ScreenHeader from '@/components/ScreenHeader';
import PlaceRow from '@/components/PlaceRow';
import Button from '@/components/Button';
import Text from '@/components/Text';
import { SAVED_PLACES } from '@/constants/data';
import type { IconName } from '@/components/Icon';

type Place = { id: string; kind: string; label: string; detail: string; lat: number; lng: number };

// Maison + Travail = emplacements permanents ; les autres sont des lieux libres
// nommés par le Client (décision D2). Icône par type.
const iconFor = (kind: string): IconName =>
  kind === 'home' ? 'home' : kind === 'work' ? 'work' : 'location';

// Démo de lieu libre ajouté par le Client (le proto ne saisit pas d'adresse).
const DEMO_LIBRE: Place = {
  id: `c-${Date.now()}`, kind: 'custom',
  label: 'Salle de sport', detail: 'Ngor, Route de la Corniche', lat: 14.749, lng: -17.513,
};

export default function LieuxScreen() {
  const insets = useSafeAreaInsets();
  const [places, setPlaces] = useState<Place[]>(SAVED_PLACES);

  const edit = (p: Place) =>
    Alert.alert(p.label, "Édition d'un lieu enregistré à venir dans le proto.");

  const add = () =>
    setPlaces((list) => [...list, { ...DEMO_LIBRE, id: `c-${list.length}-${DEMO_LIBRE.label}` }]);

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
              subtitle={p.detail}
              trailing="chevronRight"
              onPress={() => edit(p)}
              style={styles.row}
            />
          ))}
        </View>

        <Text variant="caption" color={Colors.textTertiary} style={styles.hint}>
          Maison et Travail sont toujours présents ; ajoutez autant de lieux libres que vous voulez.
        </Text>

        <Button label="Ajouter un lieu" variant="secondary" icon="add" onPress={add} style={styles.add} />
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
