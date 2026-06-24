import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, SafeAreaView
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { SUGGESTIONS } from '@/constants/data';

type Field = 'departure' | 'destination';

export default function DestinationScreen() {
  const [activeField, setActiveField] = useState<Field>('destination');
  const [departureQuery, setDepartureQuery] = useState('');
  const [departureName, setDepartureName] = useState('Ma position actuelle');
  const [destinationQuery, setDestinationQuery] = useState('');

  const query = activeField === 'departure' ? departureQuery : destinationQuery;
  const setQuery = activeField === 'departure' ? setDepartureQuery : setDestinationQuery;

  const filtered = query.length > 0
    ? SUGGESTIONS.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.detail.toLowerCase().includes(query.toLowerCase())
      )
    : SUGGESTIONS;

  const handleSelect = (item: typeof SUGGESTIONS[0]) => {
    if (activeField === 'departure') {
      setDepartureName(item.name);
      setDepartureQuery('');
      setActiveField('destination');
    } else {
      router.push({
        pathname: '/transport/configure',
        params: {
          departureName,
          destName: item.name,
          destDetail: item.detail,
          destLat: item.lat,
          destLng: item.lng,
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Où allons-nous ?</Text>
      </View>

      <View style={styles.inputs}>
        <TouchableOpacity
          style={styles.inputRow}
          onPress={() => setActiveField('departure')}
          activeOpacity={0.7}
        >
          <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>Départ</Text>
            {activeField === 'departure' ? (
              <TextInput
                style={styles.inputField}
                value={departureQuery}
                onChangeText={setDepartureQuery}
                placeholder="Saisir un point de départ…"
                placeholderTextColor={Colors.textTertiary}
                autoFocus
              />
            ) : (
              <Text style={styles.inputValue}>{departureName}</Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.dividerLine} />

        <TouchableOpacity
          style={styles.inputRow}
          onPress={() => setActiveField('destination')}
          activeOpacity={0.7}
        >
          <View style={[styles.dot, { backgroundColor: Colors.error }]} />
          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>Destination</Text>
            {activeField === 'destination' ? (
              <TextInput
                style={styles.inputField}
                value={destinationQuery}
                onChangeText={setDestinationQuery}
                placeholder="Plateau, Almadies, Yoff…"
                placeholderTextColor={Colors.textTertiary}
                autoFocus={activeField === 'destination'}
              />
            ) : (
              <Text style={styles.inputValue}>
                {destinationQuery || 'Saisir une destination…'}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>
        {query.length > 0
          ? `Résultats pour "${query}"`
          : activeField === 'departure' ? 'Choisir un départ' : 'Destinations populaires'}
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.suggestion} onPress={() => handleSelect(item)}>
            <View style={styles.suggestionIcon}>
              <Text style={styles.suggestionEmoji}>
                {activeField === 'departure' ? '🟢' : '📍'}
              </Text>
            </View>
            <View style={styles.suggestionText}>
              <Text style={styles.suggestionName}>{item.name}</Text>
              <Text style={styles.suggestionDetail}>{item.detail}</Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  back: { padding: 4 },
  backIcon: { fontSize: 22, color: Colors.textPrimary },
  title: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  inputs: {
    marginHorizontal: 16,
    backgroundColor: Colors.bg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 2 },
  inputBox: { flex: 1 },
  inputLabel: {
    fontSize: 11, color: Colors.textTertiary, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  inputValue: { fontSize: 15, color: Colors.textSecondary, paddingVertical: 4 },
  inputField: { fontSize: 15, color: Colors.textPrimary, paddingVertical: 4 },
  dividerLine: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
    marginLeft: 22,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    paddingHorizontal: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  suggestionIcon: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionEmoji: { fontSize: 18 },
  suggestionText: { flex: 1 },
  suggestionName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  suggestionDetail: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  separator: { height: 1, backgroundColor: Colors.borderSubtle, marginLeft: 70 },
});
