import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Radii, Poppins, Shadows } from '@/constants/tokens';
import Text from '@/components/Text';

export type ReceiptLine = { label: string; value: string };

type Props = {
  title?: string;
  /** Lignes d'en-tête (destination, service, prestataire, plaque, paiement…). */
  rows: ReceiptLine[];
  /** Détail tarifaire (course, frais de rapprochement, frais d'attente…). */
  lines: ReceiptLine[];
  /** Total déjà formaté (ex. « 2.100 F CFA »). */
  total: string;
  totalLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/** Carte reçu partagée — clôture de course & détail d'historique. Sans logique
 *  métier : le parent construit les lignes. Source unique de l'aspect « reçu ». */
export default function ReceiptCard({
  title = 'Détail de la course', rows, lines, total, totalLabel = 'Total payé', style,
}: Props) {
  return (
    <View style={[styles.card, style]}>
      <Text variant="label" color={Colors.textSecondary} style={styles.cardTitle}>{title}</Text>
      {rows.map((r) => <Row key={r.label} label={r.label} value={r.value} />)}

      <View style={styles.divider} />

      {lines.map((l) => <Row key={l.label} label={l.label} value={l.value} />)}

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text variant="heading2">{totalLabel}</Text>
        <Text variant="heading1" color={Colors.primary}>{total}</Text>
      </View>
    </View>
  );
}

function Row({ label, value }: ReceiptLine) {
  return (
    <View style={styles.row}>
      <Text variant="body" color={Colors.textSecondary}>{label}</Text>
      <Text variant="body" style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: 20,
    ...Shadows.sm,
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
});
