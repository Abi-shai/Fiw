import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Radii, Poppins, Shadows } from '@/constants/tokens';
import { DRIVER, MOTO_DRIVER, PAYMENT_METHODS, FRAIS_RAPPROCHEMENT } from '@/constants/data';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import Avatar from '@/components/Avatar';
import ReceiptCard from '@/components/ReceiptCard';

const QUICK_TAGS = [
  'Très sympa', 'Bonne conduite', 'Ponctuel',
  'Discret', 'Véhicule propre', 'Bon itinéraire',
];
// Libellé de note (index = nombre d'étoiles).
const RATING_LABEL = ['', 'Mauvais', 'Passable', 'Bien', 'Très bien', 'Excellent !'];

export default function ClotureScreen() {
  const insets = useSafeAreaInsets();
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
  const fmt = (n: number) => `${n.toLocaleString('fr-FR')} F`;

  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag: string) =>
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => router.replace('/home'), 1800);
  };

  if (submitted) {
    return (
      <View style={styles.thankYou}>
        <View style={styles.thankYouBadge}>
          <Icon name="thanks" size={40} color={Colors.primary} weight="fill" />
        </View>
        <Text variant="display" style={styles.thankYouTitle}>Merci pour votre avis !</Text>
        <Text variant="body" color={Colors.textSecondary} align="center">
          Votre retour aide toute la communauté Fiw.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Confirmation — pastille succès + date. */}
        <View style={styles.header}>
          <View style={styles.successBadge}>
            <Icon name="check" size={34} weight="fill" color={Colors.success} />
          </View>
          <Text variant="display" style={styles.headerTitle}>Course terminée</Text>
          <Text variant="body" color={Colors.textSecondary}>{dateStr} · {timeStr}</Text>
        </View>

        {/* Reçu. */}
        <ReceiptCard
          rows={[
            { label: 'Destination', value: params.destName },
            { label: 'Service', value: params.gammeLabel },
            { label: 'Paiement', value: payment.label },
          ]}
          lines={[
            { label: 'Course', value: fmt(basePrice) },
            ...(params.selectedOption === 'B'
              ? [{ label: 'Frais de rapprochement', value: fmt(FRAIS_RAPPROCHEMENT) }]
              : []),
            ...(waitFrais > 0 ? [{ label: "Frais d'attente", value: fmt(waitFrais) }] : []),
          ]}
          total={`${finalPrice.toLocaleString('fr-FR')} F CFA`}
        />

        {/* Notation (héros). */}
        <View style={styles.ratingCard}>
          <Avatar name={driver.name} size={72} bordered />
          <Text variant="heading1" align="center" style={styles.ratingTitle}>Comment était votre course ?</Text>
          <Text variant="bodySmall" color={Colors.textSecondary} align="center">
            {driver.name} · {driver.vehicle}
          </Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setStars(s)} activeOpacity={0.7} hitSlop={6}>
                <Icon
                  name="star"
                  size={38}
                  weight={s <= stars ? 'fill' : 'bold'}
                  color={s <= stars ? Colors.warning : Colors.border}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text variant="label" color={Colors.textPrimary} align="center" style={styles.ratingLabel}>
            {RATING_LABEL[stars]}
          </Text>

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
                  <Text
                    variant="bodySmall"
                    color={on ? Colors.primaryPressed : Colors.textPrimary}
                    style={on ? styles.tagTextActive : undefined}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {showComment ? (
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Votre commentaire…"
              placeholderTextColor={Colors.textTertiary}
              multiline
              textAlignVertical="top"
              autoFocus
            />
          ) : (
            <TouchableOpacity style={styles.addComment} onPress={() => setShowComment(true)} activeOpacity={0.7}>
              <Icon name="edit" size={16} color={Colors.primary} />
              <Text variant="label" color={Colors.primary}>Ajouter un commentaire</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button label="Envoyer mon avis" onPress={handleSubmit} />
        <TouchableOpacity style={styles.passerBtn} onPress={() => router.replace('/home')} activeOpacity={0.7}>
          <Text variant="body" color={Colors.textSecondary}>Passer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 16, gap: 14 },

  // En-tête succès.
  header: { alignItems: 'center', paddingVertical: 12, gap: 6 },
  successBadge: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.successSubtle,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  headerTitle: {},

  // Carte notation.
  ratingCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: 20,
    ...Shadows.sm,
    alignItems: 'center',
  },
  ratingTitle: { marginTop: 14 },
  starsRow: { flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 6 },
  ratingLabel: { fontFamily: Poppins.medium, marginBottom: 16 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 14 },
  tag: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: Radii.pill,
    backgroundColor: Colors.track,
  },
  tagActive: { backgroundColor: Colors.primarySubtle },
  tagTextActive: { fontFamily: Poppins.semibold },
  addComment: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  commentInput: {
    alignSelf: 'stretch',
    backgroundColor: Colors.bg,
    borderRadius: Radii.md,
    padding: 14,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: Poppins.regular,
    color: Colors.textPrimary,
    minHeight: 84,
  },

  // Bas de page.
  footer: {
    paddingHorizontal: 20, paddingTop: 12,
    gap: 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  passerBtn: { alignItems: 'center', paddingVertical: 12 },

  // Écran de remerciement.
  thankYou: {
    flex: 1, backgroundColor: Colors.surface,
    justifyContent: 'center', alignItems: 'center', padding: 40, gap: 10,
  },
  thankYouBadge: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.primarySubtle,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  thankYouTitle: { marginBottom: 2 },
});
