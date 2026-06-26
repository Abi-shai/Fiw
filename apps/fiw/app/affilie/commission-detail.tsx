import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ScreenHeader from '@/components/ScreenHeader';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import { Colors, Radii, Spacing, Shadows } from '@/constants/tokens';
import { COMMISSIONS, fcfa, kindLabel, kindIcon } from '@/constants/affilie';

// JS3 — Détail d'une commission.

type Line = { icon: IconName; label: string; value: string };

export default function CommissionDetail() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const comm = COMMISSIONS.find((c) => c.id === id) ?? COMMISSIONS[0];

  const lines: Line[] = [
    { icon: 'clock', label: 'Date', value: comm.date },
    { icon: kindIcon(comm.kind), label: 'Affilié concerné', value: `${comm.name} · ${kindLabel(comm.kind)}` },
    { icon: 'flag', label: 'Courses générées', value: `${comm.courses} courses` },
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader title="Détail de la commission" />
      <View style={styles.content}>
        {/* Montant en avant */}
        <View style={styles.amountCard}>
          <Text variant="caption" color={Colors.textTertiary} style={styles.kicker}>COMMISSION PERÇUE</Text>
          <Text variant="display" color={Colors.success} style={styles.amount}>+{fcfa(comm.amount)}</Text>
          <Text variant="caption" color={Colors.textSecondary}>2 % du montant des courses</Text>
        </View>

        <View style={styles.lines}>
          {lines.map((l, i) => (
            <View key={l.label} style={[styles.line, i > 0 && styles.lineBorder]}>
              <View style={styles.lineIcon}>
                <Icon name={l.icon} size={18} color={Colors.primary} />
              </View>
              <Text variant="bodySmall" color={Colors.textSecondary} style={styles.flex1}>{l.label}</Text>
              <Text variant="label" style={styles.lineValue}>{l.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing[4] },
  flex1: { flex: 1 },

  amountCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: Spacing[6],
    alignItems: 'center',
    gap: 4,
    ...Shadows.sm,
  },
  kicker: { textTransform: 'uppercase', letterSpacing: 0.8 },
  amount: { letterSpacing: -0.6 },

  lines: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    paddingHorizontal: Spacing[4],
    marginTop: Spacing[4],
  },
  line: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], paddingVertical: Spacing[4] },
  lineBorder: { borderTopWidth: 1, borderTopColor: Colors.borderSubtle },
  lineIcon: {
    width: 32, height: 32, borderRadius: Radii.sm,
    backgroundColor: Colors.primarySubtle,
    alignItems: 'center', justifyContent: 'center',
  },
  lineValue: { textAlign: 'right', maxWidth: '55%' },
});
