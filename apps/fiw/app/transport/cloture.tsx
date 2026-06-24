import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, ScrollView
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/colors';
import { DRIVER, MOTO_DRIVER, PAYMENT_METHODS, FRAIS_RAPPROCHEMENT } from '@/constants/data';
import Button from '@/components/Button';

const QUICK_TAGS = [
  '😊 Très sympa', '🚗 Bonne conduite', '⏱️ Ponctuel',
  '🗣️ Discret', '🧹 Véhicule propre', '📍 Bon itinéraire',
];

export default function ClotureScreen() {
  const params = useLocalSearchParams<{
    destName: string; gammeLabel: string; gammeId: string;
    finalPrice: string; paymentId: string; selectedOption: string; waitFrais: string;
  }>();

  const driver = params.gammeId === 'moto' ? MOTO_DRIVER : DRIVER;
  const finalPrice = parseInt(params.finalPrice || '1500');
  const waitFrais = parseInt(params.waitFrais || '0');
  const basePrice = params.selectedOption === 'B'
    ? finalPrice - FRAIS_RAPPROCHEMENT - waitFrais
    : finalPrice - waitFrais;
  const payment = PAYMENT_METHODS.find(p => p.id === params.paymentId) || PAYMENT_METHODS[0];

  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => router.replace('/home'), 1800);
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.thankYouContainer}>
        <Text style={styles.thankYouEmoji}>🙏</Text>
        <Text style={styles.thankYouTitle}>Merci pour votre avis !</Text>
        <Text style={styles.thankYouSub}>Votre retour aide toute la communauté Fiw.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successBadge}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successTitle}>Course terminée</Text>
          <Text style={styles.successSub}>{dateStr} à {timeStr}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Détail de la course</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Destination</Text>
            <Text style={styles.rowValue}>{params.destName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Service</Text>
            <Text style={styles.rowValue}>{params.gammeLabel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Prestataire</Text>
            <Text style={styles.rowValue}>{driver.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Paiement</Text>
            <Text style={styles.rowValue}>{payment.icon} {payment.label}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Course</Text>
            <Text style={styles.rowValue}>{basePrice.toLocaleString()} F</Text>
          </View>
          {params.selectedOption === 'B' && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Frais de rapprochement</Text>
              <Text style={styles.rowValue}>{FRAIS_RAPPROCHEMENT.toLocaleString()} F</Text>
            </View>
          )}
          {waitFrais > 0 && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Frais d'attente</Text>
              <Text style={styles.rowValue}>{waitFrais.toLocaleString()} F</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total payé</Text>
            <Text style={styles.totalValue}>{finalPrice.toLocaleString()} F CFA</Text>
          </View>
        </View>

        <View style={styles.avisCard}>
          <View style={styles.avisHeader}>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarSmallEmoji}>{driver.emoji}</Text>
            </View>
            <View>
              <Text style={styles.avisTitle}>Comment était votre course ?</Text>
              <Text style={styles.avisSub}>{driver.name} · {driver.vehicle}</Text>
            </View>
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

          <Text style={styles.sectionLabel}>Points positifs</Text>
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

          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Commentaire optionnel…"
            placeholderTextColor={Colors.textTertiary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Envoyer mon avis" onPress={handleSubmit} style={styles.submitBtn} />
        <TouchableOpacity style={styles.passerBtn} onPress={() => router.replace('/home')}>
          <Text style={styles.passerText}>Passer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20, paddingBottom: 8 },
  successBadge: { alignItems: 'center', paddingVertical: 24, marginBottom: 4 },
  successEmoji: { fontSize: 48, marginBottom: 10 },
  successTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  successSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: 13, fontWeight: '700', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowLabel: { fontSize: 14, color: Colors.textSecondary },
  rowValue: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, maxWidth: '60%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  totalValue: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  avisCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avisHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  avatarSmall: {
    width: 48, height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarSmallEmoji: { fontSize: 24 },
  avisTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  avisSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  star: { fontSize: 40, color: Colors.border },
  starActive: { color: Colors.warning },
  starsLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center', marginBottom: 20 },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tag: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tagActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },
  tagText: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  tagTextActive: { color: Colors.primaryPressed, fontWeight: '700' },
  commentInput: {
    backgroundColor: Colors.bg,
    borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.border,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    minHeight: 80,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  submitBtn: { marginBottom: 10 },
  passerBtn: { alignItems: 'center', paddingVertical: 10 },
  passerText: { fontSize: 15, color: Colors.textSecondary, fontWeight: '500' },
  thankYouContainer: {
    flex: 1, backgroundColor: Colors.surface,
    justifyContent: 'center', alignItems: 'center', padding: 40,
  },
  thankYouEmoji: { fontSize: 56, marginBottom: 20 },
  thankYouTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 },
  thankYouSub: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
