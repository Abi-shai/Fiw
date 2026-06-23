import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/colors';
import { GAMMES, PAYMENT_METHODS } from '@/constants/data';
import Button from '@/components/Button';

export default function SelectTypeScreen() {
  const params = useLocalSearchParams<{
    destName: string; destDetail: string; destLat: string; destLng: string;
  }>();

  const [selectedGamme, setSelectedGamme] = useState('simple');
  const [selectedPayment, setSelectedPayment] = useState('wave');

  const gamme = GAMMES.find(g => g.id === selectedGamme)!;

  const confirm = () => {
    router.push({
      pathname: '/transport/rapprochement',
      params: {
        ...params,
        gammeId: selectedGamme,
        gammeLabel: gamme.label,
        gammePrice: gamme.basePrice,
        paymentId: selectedPayment,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.dest}>
          <Text style={styles.destTo}>Vers</Text>
          <Text style={styles.destName} numberOfLines={1}>{params.destName}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Choisissez votre course</Text>

        {GAMMES.map((g) => (
          <TouchableOpacity
            key={g.id}
            style={[styles.gammeCard, selectedGamme === g.id && styles.gammeCardSelected]}
            onPress={() => setSelectedGamme(g.id)}
            activeOpacity={0.85}
          >
            <Text style={styles.gammeIcon}>{g.icon}</Text>
            <View style={styles.gammeInfo}>
              <Text style={[styles.gammeName, selectedGamme === g.id && { color: Colors.primary }]}>
                {g.label}
              </Text>
              <Text style={styles.gammeDesc}>{g.description}</Text>
            </View>
            <View style={styles.gammeRight}>
              <Text style={[styles.gammePrice, selectedGamme === g.id && { color: Colors.primary }]}>
                {g.basePrice.toLocaleString()} F
              </Text>
              <Text style={styles.gammeEta}>{g.eta}</Text>
            </View>
            {selectedGamme === g.id && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedCheck}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Paiement</Text>
        <View style={styles.paymentRow}>
          {PAYMENT_METHODS.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.paymentChip, selectedPayment === p.id && styles.paymentChipSelected]}
              onPress={() => setSelectedPayment(p.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.paymentIcon}>{p.icon}</Text>
              <Text style={[styles.paymentLabel, selectedPayment === p.id && { color: Colors.primary }]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.priceNote}>
          <Text style={styles.priceNoteIcon}>🔒</Text>
          <Text style={styles.priceNoteText}>
            Prix garanti — aucun surge pricing, jamais.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerTotalLabel}>Total estimé</Text>
          <Text style={styles.footerTotalAmount}>{gamme.basePrice.toLocaleString()} F CFA</Text>
        </View>
        <Button label="Confirmer la course" onPress={confirm} style={styles.confirmBtn} />
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  back: { padding: 4 },
  backIcon: { fontSize: 22, color: Colors.black },
  dest: { flex: 1 },
  destTo: { fontSize: 11, color: Colors.textTertiary, fontWeight: '600', textTransform: 'uppercase' },
  destName: { fontSize: 16, fontWeight: '700', color: Colors.black },
  scroll: { padding: 16, paddingBottom: 8 },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, marginTop: 8,
  },
  gammeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 10,
    backgroundColor: Colors.white,
    gap: 12,
  },
  gammeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  gammeIcon: { fontSize: 28, width: 36, textAlign: 'center' },
  gammeInfo: { flex: 1 },
  gammeName: { fontSize: 15, fontWeight: '700', color: Colors.black },
  gammeDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  gammeRight: { alignItems: 'flex-end' },
  gammePrice: { fontSize: 16, fontWeight: '700', color: Colors.black },
  gammeEta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  selectedBadge: {
    width: 22, height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheck: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  paymentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  paymentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  paymentChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  paymentIcon: { fontSize: 16 },
  paymentLabel: { fontSize: 13, fontWeight: '600', color: Colors.black },
  priceNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  priceNoteIcon: { fontSize: 14 },
  priceNoteText: { flex: 1, fontSize: 13, color: Colors.primaryDark, fontWeight: '500' },
  footer: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  footerTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  footerTotalLabel: { fontSize: 14, color: Colors.textSecondary },
  footerTotalAmount: { fontSize: 20, fontWeight: '700', color: Colors.black },
  confirmBtn: {},
});
