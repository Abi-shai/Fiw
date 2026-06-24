import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/colors';
import { GAMMES, PAYMENT_METHODS, FRAIS_RAPPROCHEMENT } from '@/constants/data';
import Button from '@/components/Button';

type Option = 'none' | 'A' | 'B' | 'C';

function optionForGamme(gammeId: string): Option {
  if (gammeId === 'simple') return 'none';
  if (gammeId === 'moto') return 'C';
  return 'B';
}

export default function ConfigureScreen() {
  const params = useLocalSearchParams<{
    departureName: string;
    destName: string; destDetail: string; destLat: string; destLng: string;
  }>();

  const [selectedGamme, setSelectedGamme] = useState('simple');
  const [selectedOption, setSelectedOption] = useState<Option>('none');
  const [selectedPayment, setSelectedPayment] = useState('wave');

  const gamme = GAMMES.find(g => g.id === selectedGamme)!;

  const handleGammeSelect = (id: string) => {
    setSelectedGamme(id);
    setSelectedOption(optionForGamme(id));
  };

  const finalPrice = selectedOption === 'B'
    ? gamme.basePrice + FRAIS_RAPPROCHEMENT
    : gamme.basePrice;

  const confirm = () => {
    router.push({
      pathname: '/transport/searching',
      params: {
        ...params,
        gammeId: selectedGamme,
        gammeLabel: gamme.label,
        gammePrice: gamme.basePrice,
        selectedOption,
        finalPrice,
        paymentId: selectedPayment,
      },
    });
  };

  const needsOptionChoice = selectedGamme === 'confort' || selectedGamme === 'prestige';

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
        <Text style={styles.sectionTitle}>Votre course</Text>

        {GAMMES.map((g) => (
          <TouchableOpacity
            key={g.id}
            style={[styles.gammeCard, selectedGamme === g.id && styles.gammeCardSelected]}
            onPress={() => handleGammeSelect(g.id)}
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

        <Text style={styles.sectionTitle}>Frais de rapprochement</Text>

        {selectedGamme === 'simple' && (
          <View style={styles.noFraisCard}>
            <Text style={styles.noFraisIcon}>✅</Text>
            <View style={styles.noFraisText}>
              <Text style={styles.noFraisTitle}>Aucun frais de rapprochement</Text>
              <Text style={styles.noFraisDetail}>Un prestataire proche est disponible · Prix standard garanti</Text>
            </View>
          </View>
        )}

        {selectedGamme === 'moto' && (
          <View style={styles.optionCCard}>
            <View style={styles.optionHeader}>
              <View style={[styles.badge, { backgroundColor: Colors.warning }]}>
                <Text style={styles.badgeText}>Option C</Text>
              </View>
              <Text style={styles.optionEta}>~4 min</Text>
            </View>
            <Text style={styles.optionTitle}>Prestataire bientôt disponible</Text>
            <Text style={styles.optionDetail}>
              Un prestataire Moto est sur le point de terminer une course à proximité.
              Prix standard · Pas de frais de rapprochement.
            </Text>
            <Text style={styles.optionPrice}>{gamme.basePrice.toLocaleString()} F CFA</Text>
          </View>
        )}

        {needsOptionChoice && (
          <>
            <TouchableOpacity
              style={[styles.optionCard, selectedOption === 'A' && styles.optionCardSelectedA]}
              onPress={() => setSelectedOption('A')}
              activeOpacity={0.85}
            >
              <View style={styles.optionHeader}>
                <View style={[styles.badge, { backgroundColor: Colors.textSecondary }]}>
                  <Text style={styles.badgeText}>Option A</Text>
                </View>
                <Text style={styles.optionEta}>~12 min</Text>
              </View>
              <Text style={styles.optionTitle}>Attendre un prestataire proche</Text>
              <Text style={styles.optionDetail}>Prix standard · Pas de frais · Attente plus longue</Text>
              <Text style={styles.optionPrice}>{gamme.basePrice.toLocaleString()} F CFA</Text>
              {selectedOption === 'A' && <View style={styles.optionCheck}><Text style={styles.optionCheckText}>✓</Text></View>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, styles.optionBCard]}
              onPress={() => setSelectedOption('B')}
              activeOpacity={0.85}
            >
              <View style={styles.optionHeader}>
                <View style={[styles.badge, { backgroundColor: Colors.primary }]}>
                  <Text style={styles.badgeText}>Option B</Text>
                </View>
                <Text style={styles.optionEta}>~4 min</Text>
              </View>
              <Text style={[styles.optionTitle, { color: Colors.primary }]}>Prise en charge rapide</Text>
              <Text style={styles.optionDetail}>
                + {FRAIS_RAPPROCHEMENT.toLocaleString()} F frais de rapprochement · Prestataire plus éloigné
              </Text>
              <View style={styles.optionPriceRow}>
                <Text style={[styles.optionPrice, { color: Colors.primary }]}>
                  {(gamme.basePrice + FRAIS_RAPPROCHEMENT).toLocaleString()} F CFA
                </Text>
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Recommandé</Text>
                </View>
              </View>
              {selectedOption === 'B' && <View style={styles.optionCheck}><Text style={styles.optionCheckText}>✓</Text></View>}
            </TouchableOpacity>
          </>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🔒</Text>
          <Text style={styles.infoText}>Prix garanti — aucun surge pricing, jamais.</Text>
        </View>

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
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerTotalLabel}>Total estimé</Text>
          <Text style={styles.footerTotalAmount}>{finalPrice.toLocaleString()} F CFA</Text>
        </View>
        <Button label="Confirmer la course" onPress={confirm} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
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
  backIcon: { fontSize: 22, color: Colors.textPrimary },
  dest: { flex: 1 },
  destTo: { fontSize: 11, color: Colors.textTertiary, fontWeight: '600', textTransform: 'uppercase' },
  destName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
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
    backgroundColor: Colors.surface,
    gap: 12,
  },
  gammeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySubtle,
  },
  gammeIcon: { fontSize: 28, width: 36, textAlign: 'center' },
  gammeInfo: { flex: 1 },
  gammeName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  gammeDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  gammeRight: { alignItems: 'flex-end' },
  gammePrice: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  gammeEta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  selectedBadge: {
    width: 22, height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheck: { color: Colors.surface, fontSize: 12, fontWeight: '700' },
  noFraisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.primarySubtle,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  noFraisIcon: { fontSize: 22 },
  noFraisText: { flex: 1 },
  noFraisTitle: { fontSize: 14, fontWeight: '700', color: Colors.primaryPressed },
  noFraisDetail: { fontSize: 12, color: Colors.primaryPressed, marginTop: 2, lineHeight: 17 },
  optionCCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.warning,
    backgroundColor: Colors.warningSubtle,
    padding: 14,
    marginBottom: 12,
  },
  optionCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
    position: 'relative',
  },
  optionCardSelectedA: {
    borderColor: Colors.textSecondary,
    backgroundColor: Colors.bg,
  },
  optionBCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySubtle,
  },
  optionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: Colors.surface, fontSize: 11, fontWeight: '700' },
  optionEta: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  optionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  optionDetail: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17, marginBottom: 8 },
  optionPrice: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  optionPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  recommendedBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8,
  },
  recommendedText: { color: Colors.surface, fontSize: 11, fontWeight: '600' },
  optionCheck: {
    position: 'absolute',
    top: 12, right: 12,
    width: 22, height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionCheckText: { color: Colors.surface, fontSize: 12, fontWeight: '700' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.bg,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  infoIcon: { fontSize: 14 },
  infoText: { flex: 1, fontSize: 13, color: Colors.textSecondary },
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
    backgroundColor: Colors.surface,
  },
  paymentChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySubtle,
  },
  paymentIcon: { fontSize: 16 },
  paymentLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  footer: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  footerTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  footerTotalLabel: { fontSize: 14, color: Colors.textSecondary },
  footerTotalAmount: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
});
