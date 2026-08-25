import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Radii, Shadows, Typography } from '@/constants/tokens';
import {
  VELO_LIVREUR, MOTO_LIVREUR, PAYMENT_METHODS, FRAIS_RAPPROCHEMENT, GROUPEE_ECONOMIE,
} from '@/constants/data';
import Button from '@/components/Button';
import IconButton from '@/components/IconButton';
import ScreenFooter from '@/components/ScreenFooter';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import Avatar from '@/components/Avatar';
import ResultState from '@/components/ResultState';
import ReceiptCard from '@/components/ReceiptCard';

const QUICK_TAGS = [
  'Rapide', 'Soigneux', 'Ponctuel',
  'Aimable', 'Colis intact', 'Bonne communication',
];
const RATING_LABEL = ['', 'Mauvais', 'Passable', 'Bien', 'Très bien', 'Excellent !'];

/**
 * Clôture de Livraison — remise confirmée, reçu, avis (réf. benchmark : carte
 * « Delivered » Walmart/foodpanda avec notation dans la même vue).
 */
export default function LivraisonClotureScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    destName: string; gammeId: string; gammeLabel: string;
    finalPrice: string; paymentId: string; selectedOption: string; mode: string;
    colisDesc: string; destinataireName: string; tracking: string;
  }>();

  const prestataire = params.gammeId === 'velo' ? VELO_LIVREUR : MOTO_LIVREUR;
  const finalPrice = parseInt(params.finalPrice || '700', 10);
  const fraisRapprochement = params.selectedOption === 'B' ? FRAIS_RAPPROCHEMENT : 0;
  const groupee = params.mode === 'groupee';
  // Prix de la gamme avant réduction groupée et frais de rapprochement.
  const basePrice = finalPrice - fraisRapprochement + (groupee ? GROUPEE_ECONOMIE : 0);
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
        <ResultState
          ton="accent"
          titre="Merci pour votre avis !"
          corps="Votre retour aide toute la communauté Fiw."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* L'échappatoire d'un écran d'avis est le ✕ de l'en-tête, pas un lien
          gris sous le CTA — c'est ce que font Shopee, Grab, Grubhub, Gojek,
          Tesla et Walmart. Un lien gris jumeau du CTA lui dispute l'attention
          sans jamais gagner. */}
      <View style={[styles.dismiss, { top: insets.top + 8 }]}>
        <IconButton name="close" variant="flat" onPress={() => router.replace('/home')} />
      </View>

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
          <Text variant="display" style={styles.headerTitle}>Colis remis</Text>
          <Text variant="body" color={Colors.textSecondary}>
            à {params.destinataireName || 'votre destinataire'} · {dateStr} · {timeStr}
          </Text>
        </View>

        {/* Reçu. */}
        <ReceiptCard
          title="Détail de la livraison"
          rows={[
            { label: 'Destinataire', value: params.destinataireName || '—' },
            { label: 'N° de suivi', value: params.tracking || '—' },
            ...(params.colisDesc ? [{ label: 'Colis', value: params.colisDesc }] : []),
            { label: 'Service', value: params.gammeLabel },
            { label: 'Paiement', value: payment.label },
          ]}
          lines={[
            { label: 'Livraison', value: fmt(basePrice) },
            ...(groupee ? [{ label: 'Livraison groupée', value: `−${fmt(GROUPEE_ECONOMIE)}` }] : []),
            ...(fraisRapprochement > 0
              ? [{ label: 'Frais de rapprochement', value: fmt(fraisRapprochement) }]
              : []),
          ]}
          total={`${finalPrice.toLocaleString('fr-FR')} F CFA`}
        />

        {/* Notation (héros). */}
        <View style={styles.ratingCard}>
          <Avatar name={prestataire.name} size={72} bordered />
          <Text variant="heading1" align="center" style={styles.ratingTitle}>Comment était votre livraison ?</Text>
          <Text variant="bodySmall" color={Colors.textSecondary} align="center">
            {prestataire.name} · {prestataire.vehicle}
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
                    variant={on ? 'bodySmallSemibold' : 'bodySmall'}
                    color={on ? Colors.primaryPressed : Colors.textPrimary}

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

      <ScreenFooter rule>
        <Button label="Envoyer mon avis" onPress={handleSubmit} />
      </ScreenFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  dismiss: { position: 'absolute', right: 16, zIndex: 2 },
  scroll: { paddingHorizontal: 20, paddingBottom: 16, gap: 14 },

  header: { alignItems: 'center', paddingVertical: 12, gap: 6 },
  successBadge: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.successSubtle,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  headerTitle: {},

  ratingCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: 20,
    ...Shadows.sm,
    alignItems: 'center',
  },
  ratingTitle: { marginTop: 14 },
  starsRow: { flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 6 },
  ratingLabel: { marginBottom: 16 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 14 },
  tag: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: Radii.pill,
    backgroundColor: Colors.track,
  },
  tagActive: { backgroundColor: Colors.primarySubtle },
  addComment: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  commentInput: {
    alignSelf: 'stretch',
    backgroundColor: Colors.bg,
    borderRadius: Radii.md,
    padding: 14,
    ...Typography.body,
    color: Colors.textPrimary,
    minHeight: 84,
  },


  thankYou: {
    flex: 1, backgroundColor: Colors.surface,
    justifyContent: 'center', alignItems: 'center', padding: 40, gap: 10,
  },
});
