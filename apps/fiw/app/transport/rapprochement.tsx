import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Modal
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/colors';
import { FRAIS_RAPPROCHEMENT } from '@/constants/data';
import Button from '@/components/Button';

export default function RapprochementScreen() {
  const params = useLocalSearchParams<{
    destName: string; gammeId: string; gammeLabel: string;
    gammePrice: string; paymentId: string;
    destLat: string; destLng: string;
  }>();

  const price = parseInt(params.gammePrice || '1500');
  const isMoto = params.gammeId === 'moto';
  const isCovoiturage = params.gammeId === 'covoiturage';

  const totalWithFrais = price + FRAIS_RAPPROCHEMENT;

  const proceed = (option: 'A' | 'B' | 'C') => {
    router.push({
      pathname: '/transport/searching',
      params: { ...params, option, finalPrice: option === 'B' ? totalWithFrais : price },
    });
  };

  if (isMoto) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconBig}><Text style={styles.iconEmoji}>⏱️</Text></View>
          <Text style={styles.cardTitle}>Option C disponible</Text>
          <Text style={styles.cardSubtitle}>
            Un prestataire Moto est sur le point de terminer une course à proximité.
          </Text>

          <View style={styles.optionBox}>
            <View style={styles.optionHeader}>
              <View style={[styles.badge, { backgroundColor: Colors.warning }]}>
                <Text style={styles.badgeText}>Option C</Text>
              </View>
              <Text style={styles.optionEta}>~4 min</Text>
            </View>
            <Text style={styles.optionTitle}>Attendre ce prestataire</Text>
            <Text style={styles.optionDetail}>Prix standard · Pas de frais de rapprochement</Text>
            <Text style={styles.optionPrice}>{price.toLocaleString()} F CFA</Text>
          </View>

          <View style={styles.altBox}>
            <Text style={styles.altText}>Ou chercher un autre prestataire disponible maintenant</Text>
            <Text style={styles.altEta}>~9 min</Text>
          </View>

          <Button label="Attendre ce prestataire (Option C)" onPress={() => proceed('C')} style={styles.btn} />
          <Button label="Chercher maintenant" onPress={() => proceed('A')} variant="outline" style={styles.btn2} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconBig}><Text style={styles.iconEmoji}>🚗</Text></View>
        <Text style={styles.cardTitle}>Frais de rapprochement</Text>
        <Text style={styles.cardSubtitle}>
          Le prestataire le plus proche est à 3,2 km. Choisissez votre option :
        </Text>

        <TouchableOpacity style={[styles.optionBox, styles.optionA]} activeOpacity={0.85} onPress={() => proceed('A')}>
          <View style={styles.optionHeader}>
            <View style={[styles.badge, { backgroundColor: Colors.textSecondary }]}>
              <Text style={styles.badgeText}>Option A</Text>
            </View>
            <Text style={styles.optionEta}>~12 min</Text>
          </View>
          <Text style={styles.optionTitle}>Attendre un prestataire proche</Text>
          <Text style={styles.optionDetail}>Prix standard · Pas de frais · Attente plus longue</Text>
          <Text style={styles.optionPrice}>{price.toLocaleString()} F CFA</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.optionBox, styles.optionB]} activeOpacity={0.85} onPress={() => proceed('B')}>
          <View style={styles.optionHeader}>
            <View style={[styles.badge, { backgroundColor: Colors.primary }]}>
              <Text style={styles.badgeText}>Option B</Text>
            </View>
            <Text style={styles.optionEta}>~4 min</Text>
          </View>
          <Text style={styles.optionTitle}>Prise en charge rapide</Text>
          <Text style={styles.optionDetail}>
            + {FRAIS_RAPPROCHEMENT.toLocaleString()} F frais de rapprochement · Prestataire plus éloigné
          </Text>
          <View style={styles.optionPriceRow}>
            <Text style={[styles.optionPrice, { color: Colors.primary }]}>{totalWithFrais.toLocaleString()} F CFA</Text>
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>Recommandé</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Le montant total est prélevé à la fin de la course. Le temps estimé est garanti.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  iconBig: {
    width: 56, height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconEmoji: { fontSize: 28 },
  cardTitle: { fontSize: 22, fontWeight: '700', color: Colors.black, marginBottom: 8 },
  cardSubtitle: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 20 },
  optionBox: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
  },
  optionA: { borderColor: Colors.border },
  optionB: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  optionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  optionEta: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  optionTitle: { fontSize: 16, fontWeight: '700', color: Colors.black, marginBottom: 4 },
  optionDetail: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, marginBottom: 8 },
  optionPrice: { fontSize: 18, fontWeight: '700', color: Colors.black },
  optionPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  recommendedBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8,
  },
  recommendedText: { color: Colors.white, fontSize: 11, fontWeight: '600' },
  altBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginBottom: 16,
  },
  altText: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  altEta: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  infoIcon: { fontSize: 14 },
  infoText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  btn: { marginBottom: 10 },
  btn2: {},
});
