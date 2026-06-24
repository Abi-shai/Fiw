import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/colors';
import { DRIVER, PAYMENT_METHODS } from '@/constants/data';
import Button from '@/components/Button';

export default function ReceiptScreen() {
  const params = useLocalSearchParams<{
    destName: string; gammeLabel: string; finalPrice: string;
    paymentId: string; option: string;
  }>();

  const price = parseInt(params.finalPrice || '1500');
  const commission = Math.round(price * 0.14);
  const payment = PAYMENT_METHODS.find(p => p.id === params.paymentId) || PAYMENT_METHODS[0];

  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.successBadge}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successTitle}>Course terminée</Text>
          <Text style={styles.successSub}>{dateStr} à {timeStr}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Détail de la course</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>De</Text>
            <Text style={styles.rowValue}>Ma position</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Vers</Text>
            <Text style={styles.rowValue}>{params.destName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Service</Text>
            <Text style={styles.rowValue}>{params.gammeLabel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Prestataire</Text>
            <Text style={styles.rowValue}>{DRIVER.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Paiement</Text>
            <Text style={styles.rowValue}>{payment.icon} {payment.label}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Course</Text>
            <Text style={styles.rowValue}>{(price - (params.option === 'B' ? 350 : 0)).toLocaleString()} F</Text>
          </View>
          {params.option === 'B' && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Frais de rapprochement</Text>
              <Text style={styles.rowValue}>350 F</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total payé</Text>
            <Text style={styles.totalValue}>{price.toLocaleString()} F CFA</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Votre prestataire</Text>
          <View style={styles.driverRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>{DRIVER.emoji}</Text>
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{DRIVER.name}</Text>
              <Text style={styles.driverSub}>{DRIVER.vehicle} · {DRIVER.plate}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingEmoji}>★</Text>
              <Text style={styles.ratingVal}>{DRIVER.rating}</Text>
            </View>
          </View>
        </View>

        <Button
          label="Donner un avis →"
          onPress={() => router.replace({ pathname: '/transport/rating', params })}
          style={styles.rateBtn}
        />

        <TouchableOpacity style={styles.homeLink} onPress={() => router.replace('/home')}>
          <Text style={styles.homeLinkText}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  successBadge: {
    alignItems: 'center',
    paddingVertical: 28,
    marginBottom: 8,
  },
  successEmoji: { fontSize: 48, marginBottom: 12 },
  successTitle: { fontSize: 26, fontWeight: '800', color: Colors.black },
  successSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: Colors.white,
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
  rowValue: { fontSize: 14, fontWeight: '600', color: Colors.black, maxWidth: '60%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: Colors.black },
  totalValue: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarEmoji: { fontSize: 24 },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 16, fontWeight: '700', color: Colors.black },
  driverSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20,
  },
  ratingEmoji: { color: Colors.star, fontSize: 14 },
  ratingVal: { fontSize: 14, fontWeight: '700', color: Colors.black },
  rateBtn: { marginBottom: 12 },
  homeLink: { alignItems: 'center', paddingVertical: 12 },
  homeLinkText: { fontSize: 15, color: Colors.textSecondary, fontWeight: '500' },
});
