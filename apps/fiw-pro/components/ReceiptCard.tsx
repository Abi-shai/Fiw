import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Radii, Shadows } from '@/constants/tokens';
import Text from '@/components/Text';
import Divider from '@/components/Divider';
import InfoRow from '@/components/InfoRow';

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
      <Text variant="heading2" style={styles.cardTitle}>{title}</Text>

      <View style={styles.group}>
        {rows.map((r) => <InfoRow key={r.label} label={r.label} value={r.value} />)}
      </View>

      <View style={styles.rule}><Divider /></View>

      <View style={styles.group}>
        {lines.map((l) => <InfoRow key={l.label} label={l.label} value={l.value} />)}
      </View>

      <View style={styles.rule}><Divider /></View>

      <View style={styles.totalRow}>
        <Text variant="heading2">{totalLabel}</Text>
        <Text variant="heading1" color={Colors.primary}>{total}</Text>
      </View>
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
  // Titre de reçu et non libellé de section : la maquette l'écrit en `heading2`
  // encre pleine, pas en capitales tertiaires — un reçu s'ouvre sur son objet.
  cardTitle: { marginBottom: 16 },
  group: { gap: 12 },
  rule: { paddingVertical: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingTop: 4 },
});
