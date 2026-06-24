import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, ScrollView
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/colors';
import { DRIVER } from '@/constants/data';
import Button from '@/components/Button';

const QUICK_TAGS = [
  '😊 Très sympa', '🚗 Bonne conduite', '⏱️ Ponctuel',
  '🗣️ Discret', '🧹 Véhicule propre', '📍 Bon itinéraire',
];

export default function RatingScreen() {
  const params = useLocalSearchParams();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const submit = () => {
    setSubmitted(true);
    setTimeout(() => router.replace('/home'), 1800);
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <Text style={styles.successEmoji}>🙏</Text>
        <Text style={styles.successTitle}>Merci pour votre avis !</Text>
        <Text style={styles.successSub}>Votre retour aide toute la communauté Fiw.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Comment était votre course ?</Text>

        <View style={styles.driverCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>{DRIVER.emoji}</Text>
          </View>
          <Text style={styles.driverName}>{DRIVER.name}</Text>
          <Text style={styles.driverSub}>{DRIVER.vehicle} · {DRIVER.plate}</Text>
        </View>

        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <TouchableOpacity key={s} onPress={() => setStars(s)} activeOpacity={0.7}>
              <Text style={[styles.star, s <= stars && styles.starActive]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.starsLabel}>
          {stars === 5 ? 'Excellent !' : stars === 4 ? 'Très bien' : stars === 3 ? 'Bien' : stars === 2 ? 'Passable' : 'Mauvais'}
        </Text>

        <Text style={styles.sectionTitle}>Points positifs</Text>
        <View style={styles.tagsRow}>
          {QUICK_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[styles.tag, tags.includes(tag) && styles.tagActive]}
              onPress={() => toggleTag(tag)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tagText, tags.includes(tag) && styles.tagTextActive]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Commentaire (optionnel)</Text>
        <TextInput
          style={styles.commentInput}
          value={comment}
          onChangeText={setComment}
          placeholder="Partagez votre expérience…"
          placeholderTextColor={Colors.textTertiary}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <Button
          label="Envoyer mon avis"
          onPress={submit}
          style={styles.submitBtn}
        />

        <TouchableOpacity style={styles.skipLink} onPress={() => router.replace('/home')}>
          <Text style={styles.skipText}>Passer cette étape</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.black, marginBottom: 24, textAlign: 'center' },
  driverCard: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: Colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2, borderColor: Colors.primary,
  },
  avatarEmoji: { fontSize: 32 },
  driverName: { fontSize: 18, fontWeight: '700', color: Colors.black },
  driverSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  star: { fontSize: 44, color: Colors.border },
  starActive: { color: Colors.star },
  starsLabel: {
    fontSize: 16, fontWeight: '600', color: Colors.black,
    textAlign: 'center', marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  tag: {
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  tagActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  tagText: { fontSize: 13, fontWeight: '500', color: Colors.black },
  tagTextActive: { color: Colors.primaryDark, fontWeight: '700' },
  commentInput: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.border,
    padding: 14,
    fontSize: 15,
    color: Colors.black,
    minHeight: 90,
    marginBottom: 24,
  },
  submitBtn: {},
  skipLink: { alignItems: 'center', paddingVertical: 14 },
  skipText: { fontSize: 14, color: Colors.textSecondary },
  successContainer: {
    flex: 1, backgroundColor: Colors.white,
    justifyContent: 'center', alignItems: 'center',
    padding: 40,
  },
  successEmoji: { fontSize: 56, marginBottom: 20 },
  successTitle: { fontSize: 26, fontWeight: '800', color: Colors.black, marginBottom: 8 },
  successSub: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
