import React, { useState } from 'react';
import {
  View, StyleSheet, TextInput, TouchableOpacity, FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import LeafletMap from '@/components/LeafletMap';
import IconButton from '@/components/IconButton';
import PlaceRow from '@/components/PlaceRow';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import { sheetSurface } from '@/components/Sheet';
import { Colors, Radii, Poppins } from '@/constants/tokens';
import { DAKAR_CENTER, SUGGESTIONS, SAVED_PLACES, RECENT_PLACES } from '@/constants/data';

type Field = 'departure' | 'destination';
type Tab = 'suggested' | 'saved';
type Place = { name: string; detail: string; lat: number; lng: number };

export default function DestinationScreen() {
  const insets = useSafeAreaInsets();

  const [activeField, setActiveField] = useState<Field>('destination');
  const [tab, setTab] = useState<Tab>('suggested');
  const [departureName, setDepartureName] = useState('Ma position actuelle');
  const [departureQuery, setDepartureQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');

  const query = activeField === 'departure' ? departureQuery : destinationQuery;

  const goToConfigure = (place: Place) => {
    router.push({
      pathname: '/transport/configure',
      params: {
        departureName,
        destName: place.name,
        destDetail: place.detail,
        destLat: String(place.lat),
        destLng: String(place.lng),
      },
    });
  };

  const handleSelect = (place: Place) => {
    Haptics.selectionAsync();
    if (activeField === 'departure') {
      setDepartureName(place.name);
      setDepartureQuery('');
      setActiveField('destination');
    } else {
      goToConfigure(place);
    }
  };

  const pickOnMap = () => {
    Haptics.selectionAsync();
    goToConfigure({ name: 'Position sur la carte', detail: 'Point sélectionné', ...DAKAR_CENTER });
  };

  // --- Liste affichée selon l'onglet + la recherche ---
  const matches = (name: string, detail: string) =>
    name.toLowerCase().includes(query.toLowerCase()) ||
    detail.toLowerCase().includes(query.toLowerCase());

  const searching = query.length > 0;

  const suggestedData: Place[] = searching
    ? SUGGESTIONS.filter(s => matches(s.name, s.detail))
    : [...RECENT_PLACES];

  const savedData = searching
    ? SAVED_PLACES.filter(s => matches(s.label, s.detail))
    : SAVED_PLACES;

  return (
    <View style={styles.container}>
      <LeafletMap
        center={DAKAR_CENTER}
        zoom={14}
        markers={[{ lat: DAKAR_CENTER.lat, lng: DAKAR_CENTER.lng, type: 'user', heading: 25 }]}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        tintWater
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[sheetSurface, styles.sheet, { marginTop: insets.top + 64, paddingBottom: insets.bottom + 8 }]}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text variant="heading1" style={styles.title}>Indiquer votre itinéraire</Text>
          <IconButton name="close" variant="flat" color={Colors.textPrimary} onPress={() => router.back()} />
        </View>

        {/* Champ « De » */}
        <TouchableOpacity
          style={[styles.fieldDe, activeField === 'departure' && styles.fieldActive]}
          activeOpacity={0.85}
          onPress={() => setActiveField('departure')}
        >
          <View style={styles.deIcon}>
            <Icon name="hail" size={22} color={Colors.textPrimary} />
          </View>
          <View style={styles.fieldBody}>
            <Text variant="caption" color={Colors.textTertiary}>De</Text>
            {activeField === 'departure' ? (
              <TextInput
                style={styles.fieldInput}
                value={departureQuery}
                onChangeText={setDepartureQuery}
                placeholder="Saisir un point de départ…"
                placeholderTextColor={Colors.textTertiary}
                autoFocus
              />
            ) : (
              <Text variant="body" style={styles.fieldValue} numberOfLines={1}>{departureName}</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Champ « À » + sélecteur carte */}
        <View style={[styles.fieldA, activeField === 'destination' && styles.fieldActive]}>
          <Icon name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.aInput}
            value={destinationQuery}
            onFocus={() => setActiveField('destination')}
            onChangeText={setDestinationQuery}
            placeholder="À"
            placeholderTextColor={Colors.textTertiary}
            autoFocus
          />
          <TouchableOpacity style={styles.mapBtn} onPress={pickOnMap} activeOpacity={0.85}>
            <Icon name="pin" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Onglets Suggéré / Enregistré */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'suggested' && styles.tabActive]}
            onPress={() => setTab('suggested')}
            activeOpacity={0.85}
          >
            <Text variant="label" color={tab === 'suggested' ? Colors.surface : Colors.textSecondary}>Suggéré</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'saved' && styles.tabActive]}
            onPress={() => setTab('saved')}
            activeOpacity={0.85}
          >
            <Text variant="label" color={tab === 'saved' ? Colors.surface : Colors.textSecondary}>Enregistré</Text>
          </TouchableOpacity>
        </View>

        {/* Résultats */}
        {tab === 'suggested' ? (
          <FlatList
            data={suggestedData}
            keyExtractor={(item) => item.name}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <PlaceRow
                icon="location"
                accent
                title="Choisir sur la carte"
                subtitle="Positionner le point précisément"
                trailing="chevronRight"
                onPress={pickOnMap}
              />
            }
            renderItem={({ item }) => (
              <PlaceRow
                icon={searching ? 'location' : 'clock'}
                title={item.name}
                subtitle={item.detail}
                onPress={() => handleSelect(item)}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <FlatList
            data={savedData}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <PlaceRow
                icon={item.kind === 'home' ? 'home' : 'work'}
                accent
                title={item.label}
                subtitle={item.detail}
                onPress={() => handleSelect({ name: item.label, detail: item.detail, lat: item.lat, lng: item.lng })}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListFooterComponent={
              <PlaceRow icon="add" title="Ajouter une adresse" />
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  sheet: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 22,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: { flex: 1, letterSpacing: -0.4 },

  fieldDe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.bg,
    borderRadius: Radii.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginBottom: 12,
  },
  deIcon: { width: 28, alignItems: 'center' },
  fieldBody: { flex: 1 },
  fieldValue: { marginTop: 1, fontFamily: Poppins.medium },
  fieldInput: { fontSize: 15, color: Colors.textPrimary, fontFamily: Poppins.medium, marginTop: 1, padding: 0 },

  fieldA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.bg,
    borderRadius: Radii.md,
    paddingLeft: 16,
    paddingRight: 8,
    height: 56,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  fieldActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },
  aInput: { flex: 1, fontSize: 17, color: Colors.textPrimary, fontFamily: Poppins.medium, padding: 0 },
  mapBtn: {
    width: 40, height: 40,
    borderRadius: Radii.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  tabs: { flexDirection: 'row', gap: 10, marginTop: 22, marginBottom: 8 },
  tab: {
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: Radii.pill,
    backgroundColor: Colors.bg,
  },
  tabActive: { backgroundColor: Colors.textPrimary },

  separator: { height: 1, backgroundColor: Colors.borderSubtle, marginLeft: 56 },
});
