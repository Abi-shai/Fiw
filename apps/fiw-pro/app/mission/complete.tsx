import React, { useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, Radii, Shadows, Poppins } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import Button from '@/components/Button';
import { MISSION_INCOMING, PRESTATAIRE, COMMISSION_RATE } from '@/constants/data';

export default function CompleteScreen() {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const montantBrut = MISSION_INCOMING.prixEstime;
  const commission = Math.round(montantBrut * COMMISSION_RATE);
  const netPercu = montantBrut - commission;

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => router.replace('/dashboard'), 1800);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.checkCircle}>
            <Icon name="tick" size={36} color={Colors.textOnPrimary} />
          </View>
          <Text variant="display" style={{ marginBottom: 4 }}>Mission terminée</Text>
          <Text variant="caption" color={Colors.textTertiary}>{MISSION_INCOMING.id}</Text>
        </View>

        {/* Récapitulatif financier */}
        <View style={styles.card}>
          <Text variant="label" style={styles.cardTitle}>Récapitulatif</Text>

          <View style={styles.lineRow}>
            <Text variant="bodySmall" color={Colors.textSecondary}>Montant brut</Text>
            <Text variant="label">{montantBrut.toLocaleString('fr-FR')} F CFA</Text>
          </View>
          <View style={styles.lineRow}>
            <Text variant="bodySmall" color={Colors.textSecondary}>Commission Fiw (14 %)</Text>
            <Text variant="label" color={Colors.error}>−{commission.toLocaleString('fr-FR')} F CFA</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.lineRow}>
            <Text variant="label" style={{ fontFamily: Poppins.semibold, fontSize: 16 }}>Net perçu</Text>
            <Text variant="heading2" color={Colors.primary}>{netPercu.toLocaleString('fr-FR')} F CFA</Text>
          </View>

          <View style={styles.walletNotice}>
            <Text variant="caption" color={Colors.primary}>
              Commission débitée de votre Wallet · Nouveau solde :{' '}
              <Text variant="caption" color={Colors.primary} style={{ fontFamily: Poppins.bold }}>
                {(PRESTATAIRE.walletSolde - commission).toLocaleString('fr-FR')} F
              </Text>
            </Text>
          </View>
        </View>

        {/* Trajet */}
        <View style={styles.card}>
          <Text variant="label" style={styles.cardTitle}>Trajet</Text>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
            <Text variant="bodySmall">{MISSION_INCOMING.pickup.name}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: Colors.error }]} />
            <Text variant="bodySmall">{MISSION_INCOMING.destination.name}</Text>
          </View>
          <Text variant="caption" color={Colors.textTertiary} style={{ marginTop: Spacing[2] }}>
            {MISSION_INCOMING.distance} · {MISSION_INCOMING.type}
          </Text>
        </View>

        {/* ÉvaluationClient — privée */}
        <View style={styles.card}>
          <View style={styles.evalHeader}>
            <Text variant="label" style={styles.cardTitle}>Évaluation client</Text>
            <View style={styles.privateBadge}>
              <Icon name="lock" size={11} color={Colors.textSecondary} />
              <Text variant="caption" color={Colors.textSecondary} style={{ marginLeft: 4 }}>Privée</Text>
            </View>
          </View>
          <Text variant="bodySmall" color={Colors.textTertiary} style={{ marginBottom: Spacing[4] }}>
            Non visible par {MISSION_INCOMING.clientName}. Utilisée pour améliorer l'expérience globale.
          </Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => !submitted && setRating(star)}
                activeOpacity={0.7}
                disabled={submitted}
              >
                <Icon
                  name="star"
                  size={32}
                  weight={star <= rating ? 'fill' : 'regular'}
                  color={star <= rating ? Colors.warning : Colors.border}
                />
              </TouchableOpacity>
            ))}
          </View>

          {rating > 0 && (
            <Text variant="bodySmall" color={Colors.textSecondary} align="center" style={{ marginTop: 4 }}>
              {['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent'][rating]}
            </Text>
          )}
        </View>

        {submitted ? (
          <View style={styles.successRow}>
            <Text variant="label" color={Colors.primary} align="center">
              Évaluation enregistrée · Retour au tableau de bord…
            </Text>
          </View>
        ) : (
          <Button
            label={rating === 0 ? 'Passer' : 'Valider et terminer'}
            onPress={handleSubmit}
            style={styles.submitBtn}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing[6], paddingBottom: 48 },
  header: { alignItems: 'center', marginBottom: Spacing[6] },
  checkCircle: {
    width: 72, height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[4],
    ...Shadows.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: 20,
    marginBottom: Spacing[4],
    ...Shadows.sm,
  },
  cardTitle: {
    fontFamily: Poppins.bold,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  walletNotice: {
    marginTop: 12,
    backgroundColor: Colors.primarySubtle,
    borderRadius: Radii.sm,
    padding: 10,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeLine: {
    width: 2, height: 12,
    backgroundColor: Colors.border,
    marginLeft: 4, marginBottom: 4,
  },
  evalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  privateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing[2],
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  starsRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  submitBtn: { marginTop: Spacing[2] },
  successRow: {
    backgroundColor: Colors.primarySubtle,
    borderRadius: Radii.md,
    padding: Spacing[4],
    alignItems: 'center',
    marginTop: Spacing[2],
  },
});
