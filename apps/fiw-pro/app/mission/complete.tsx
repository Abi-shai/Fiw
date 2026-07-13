import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
          <Text style={styles.title}>Mission terminée</Text>
          <Text style={styles.missionId}>{MISSION_INCOMING.id}</Text>
        </View>

        {/* Récapitulatif financier */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Récapitulatif</Text>

          <View style={styles.lineRow}>
            <Text style={styles.lineLabel}>Montant brut</Text>
            <Text style={styles.lineValue}>{montantBrut.toLocaleString('fr-FR')} F CFA</Text>
          </View>
          <View style={styles.lineRow}>
            <Text style={styles.lineLabel}>Commission Fiw (14 %)</Text>
            <Text style={styles.lineValueNeg}>−{commission.toLocaleString('fr-FR')} F CFA</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.lineRow}>
            <Text style={styles.lineLabelBold}>Net perçu</Text>
            <Text style={styles.lineValueBold}>{netPercu.toLocaleString('fr-FR')} F CFA</Text>
          </View>

          <View style={styles.walletNotice}>
            <Text style={styles.walletNoticeText}>
              Commission débité de votre Wallet · Nouveau solde :{' '}
              <Text style={styles.walletSoldeNew}>
                {(PRESTATAIRE.walletSolde - commission).toLocaleString('fr-FR')} F
              </Text>
            </Text>
          </View>
        </View>

        {/* Trajet */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trajet</Text>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.routeText}>{MISSION_INCOMING.pickup.name}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: Colors.error }]} />
            <Text style={styles.routeText}>{MISSION_INCOMING.destination.name}</Text>
          </View>
          <Text style={styles.routeMeta}>{MISSION_INCOMING.distance} · {MISSION_INCOMING.type}</Text>
        </View>

        {/* ÉvaluationClient — privée */}
        <View style={styles.card}>
          <View style={styles.evalHeader}>
            <Text style={styles.cardTitle}>Évaluation client</Text>
            <View style={styles.privateBadge}>
              <Text style={styles.privateText}>🔒 Privée</Text>
            </View>
          </View>
          <Text style={styles.evalHint}>
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
                <Text style={[styles.star, star <= rating && styles.starActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>

          {rating > 0 && (
            <Text style={styles.ratingLabel}>
              {['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent'][rating]}
            </Text>
          )}
        </View>

        {submitted ? (
          <View style={styles.successRow}>
            <Text style={styles.successText}>Évaluation enregistrée · Retour au tableau de bord…</Text>
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
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 24, paddingBottom: 48 },
  header: { alignItems: 'center', marginBottom: 24 },
  checkCircle: {
    width: 72, height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  checkIcon: { fontSize: 36, color: Colors.white, fontWeight: '700' },
  title: { fontSize: 24, fontWeight: '800', color: Colors.black, marginBottom: 4 },
  missionId: { fontSize: 13, color: Colors.textTertiary },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.black, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  lineLabel: { fontSize: 14, color: Colors.textSecondary },
  lineValue: { fontSize: 14, fontWeight: '600', color: Colors.black },
  lineValueNeg: { fontSize: 14, fontWeight: '600', color: Colors.error },
  lineLabelBold: { fontSize: 16, fontWeight: '700', color: Colors.black },
  lineValueBold: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  walletNotice: {
    marginTop: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    padding: 10,
  },
  walletNoticeText: { fontSize: 12, color: Colors.primaryMid },
  walletSoldeNew: { fontWeight: '700', color: Colors.primary },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeText: { fontSize: 14, fontWeight: '500', color: Colors.black },
  routeLine: {
    width: 2, height: 12,
    backgroundColor: Colors.border,
    marginLeft: 4, marginBottom: 4,
  },
  routeMeta: { fontSize: 12, color: Colors.textTertiary, marginTop: 8 },
  evalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  privateBadge: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  privateText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  evalHint: { fontSize: 13, color: Colors.textTertiary, marginBottom: 16, lineHeight: 18 },
  starsRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 8 },
  star: { fontSize: 36, color: Colors.border },
  starActive: { color: Colors.star },
  ratingLabel: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  submitBtn: { marginTop: 8 },
  successRow: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  successText: { fontSize: 14, color: Colors.primary, fontWeight: '600', textAlign: 'center' },
});
