import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, SafeAreaView
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { SUGGESTIONS } from '@/constants/data';

export default function DestinationScreen() {
  const [query, setQuery] = useState('');

  const filtered = query.length > 0
    ? SUGGESTIONS.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.detail.toLowerCase().includes(query.toLowerCase())
      )
    : SUGGESTIONS;

  const selectDestination = (item: typeof SUGGESTIONS[0]) => {
    router.push({
      pathname: '/transport/select-type',
      params: {
        destName: item.name,
        destDetail: item.detail,
        destLat: item.lat,
        destLng: item.lng,
      },
    });
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
        <View style={styles.inputRow}>
          <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>Départ</Text>
            <Text style={styles.inputValue}>Ma position actuelle</Text>
          </View>
        </View>
        <View style={styles.dividerLine} />
        <View style={styles.inputRow}>
          <View style={[styles.dot, { backgroundColor: Colors.error }]} />
          <View style={[styles.inputBox, styles.inputBoxActive]}>
            <Text style={styles.inputLabel}>Destination</Text>
            <TextInput
              style={styles.inputField}
              value={query}
              onChangeText={setQuery}
              placeholder="Plateau, Almadies, Yoff…"
              placeholderTextColor={Colors.textTertiary}
              autoFocus
            />
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        {query ? `Résultats pour "${query}"` : 'Destinations populaires'}
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.suggestion} onPress={() => selectDestination(item)}>
            <View style={styles.suggestionIcon}>
              <Text style={styles.suggestionEmoji}>📍</Text>
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
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  back: { padding: 4 },
  backIcon: { fontSize: 22, color: Colors.black },
  title: { fontSize: 18, fontWeight: '700', color: Colors.black },
  inputs: {
    marginHorizontal: 16,
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 2 },
  inputBox: { flex: 1 },
  inputBoxActive: {},
  inputLabel: { fontSize: 11, color: Colors.textTertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  inputValue: { fontSize: 15, color: Colors.textSecondary, paddingVertical: 4 },
  inputField: { fontSize: 15, color: Colors.black, paddingVertical: 4 },
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
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionEmoji: { fontSize: 18 },
  suggestionText: { flex: 1 },
  suggestionName: { fontSize: 15, fontWeight: '600', color: Colors.black },
  suggestionDetail: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  separator: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 70 },
});
