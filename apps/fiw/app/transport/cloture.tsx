import React, { useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, ScrollView
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Radii, Poppins } from '@/constants/tokens';
import { DRIVER, MOTO_DRIVER, PAYMENT_METHODS, FRAIS_RAPPROCHEMENT } from '@/constants/data';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import Avatar from '@/components/Avatar';

const QUICK_TAGS = [
  'Très sympa', 'Bonne conduite', 'Ponctuel',
  'Discret', 'Véhicule propre', 'Bon itinéraire',
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
        <Icon name="thanks" size={56} color={Colors.primary} weight="fill" />
        <Text variant="display" style={styles.thankYouTitle}>Merci pour votre avis !</Text>
        <Text variant="body" color={Colors.textSecondary} align="center">Votre retour aide toute la communauté Fiw.</Text>
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
          <Icon name="check" size={48} color={Colors.success} weight="fill" />
          <Text variant="display" style={styles.successTitle}>Course terminée</Text>
          <Text variant="body" color={Colors.textSecondary}>{dateStr} à {timeStr}</Text>
        </View>

        <View style={styles.card}>
          <Text variant="label" color={Colors.textSecondary} style={styles.cardTitle}>Détail de la course</Text>
          <Row label="Destination" value={params.destName} />
          <Row label="Service" value={params.gammeLabel} />
          <Row label="Prestataire" value={driver.name} />
          <Row label="Paiement" value={payment.label} />

          <View style={styles.divider} />

          <Row label="Course" value={`${basePrice.toLocaleString()} F`} />
          {params.selectedOption === 'B' && (
            <Row label="Frais de rapprochement" value={`${FRAIS_RAPPROCHEMENT.toLocaleString()} F`} />
          )}
          {waitFrais > 0 && (
            <Row label="Frais d'attente" value={`${waitFrais.toLocaleString()} F`} />
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text variant="heading2">Total payé</Text>
            <Text variant="heading1" color={Colors.primary}>{finalPrice.toLocaleString()} F CFA</Text>
          </View>
        </View>

        <View style={styles.avisCard}>
          <View style={styles.avisHeader}>
            <Avatar name={driver.name} size={48} bordered />
            <View style={styles.flex1}>
              <Text variant="heading2">Comment était votre course ?</Text>
              <Text variant="bodySmall" color={Colors.textSecondary}>{driver.name} · {driver.vehicle}</Text>
            </View>
          </View>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setStars(s)} activeOpacity={0.7}>
                <Icon
                  name="star"
                  size={40}
                  weight={s <= stars ? 'fill' : 'bold'}
                  color={s <= stars ? Colors.warning : Colors.border}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text variant="body" align="center" style={styles.starsLabel}>
            {stars === 5 ? 'Excellent !' : stars === 4 ? 'Très bien' : stars === 3 ? 'Bien' : stars === 2 ? 'Passable' : 'Mauvais'}
          </Text>

          <Text variant="label" color={Colors.textSecondary} style={styles.sectionLabel}>Points positifs</Text>
          <View style={styles.tagsRow}>
            {QUICK_TAGS.map((tag) => {
              const on = tags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tag, on && styles.tagActive]}
                  onPress={() => toggleTag(tag)}
                  activeOpacity={0.8}
                >
                  <Text variant="bodySmall" color={on ? Colors.primaryPressed : Colors.textPrimary} style={on ? styles.tagTextActive : undefined}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
          <Text variant="body" color={Colors.textSecondary}>Passer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text variant="body" color={Colors.textSecondary}>{label}</Text>
      <Text variant="body" style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20, paddingBottom: 8 },
  flex1: { flex: 1 },
  successBadge: { alignItems: 'center', paddingVertical: 24, marginBottom: 4 },
  successTitle: { marginTop: 10 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: { textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowValue: { fontFamily: Poppins.medium, maxWidth: '60%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 },
  avisCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avisHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  starsLabel: { fontFamily: Poppins.medium, marginBottom: 20 },
  sectionLabel: { textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tag: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: Radii.pill,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tagActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },
  tagTextActive: { fontFamily: Poppins.semibold },
  commentInput: {
    backgroundColor: Colors.bg,
    borderRadius: Radii.md,
    borderWidth: 1.5, borderColor: Colors.border,
    padding: 14,
    fontSize: 15,
    fontFamily: Poppins.regular,
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
  thankYouContainer: {
    flex: 1, backgroundColor: Colors.surface,
    justifyContent: 'center', alignItems: 'center', padding: 40,
  },
  thankYouTitle: { marginTop: 20, marginBottom: 8 },
});
