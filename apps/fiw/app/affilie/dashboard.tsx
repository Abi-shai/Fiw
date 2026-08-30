import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import IconButton from '@/components/IconButton';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Medallion from '@/components/Medallion';
import Icon, { type IconName } from '@/components/Icon';
import { Colors, Radii, SectionLabel, Shadows, Spacing, Strokes } from '@/constants/tokens';
import { AMBASSADEUR, COMMISSIONS, WITHDRAW_MIN, fcfa } from '@/constants/affilie';

type Stat = { key: string; icon: IconName; value: string; label: string };

const STATS: Stat[] = [
  { key: 'gains',        icon: 'coins',  value: '12 400 F', label: 'Gains cumulés' },
  { key: 'courses',      icon: 'flag',   value: '27',       label: 'Courses générées' },
  { key: 'prestataires', icon: 'car',    value: '3',        label: 'Chauffeurs actifs' },
  { key: 'clients',      icon: 'rider',  value: '8',        label: 'Clients actifs' },
];

function StatCard({ stat }: { stat: Stat }) {
  return (
    <View style={styles.statCard}>
      <Medallion icon={stat.icon} size="sm" ton="accent" />
      <Text variant="heading1" style={styles.statValue}>{stat.value}</Text>
      <Text variant="caption" color={Colors.textSecondary}>{stat.label}</Text>
    </View>
  );
}

export default function AffilieDashboard() {
  const insets = useSafeAreaInsets();
  const { state, balance } = AMBASSADEUR;

  const locked = state === 'gele';
  const lockCaption = state === 'gele'
    ? 'Retraits suspendus — contactez le support'
    : balance < WITHDRAW_MIN
    ? `Minimum ${fcfa(WITHDRAW_MIN)}`
    : null;

  const share = () => {
    Haptics.selectionAsync();
    router.push('/affilie/outils');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <IconButton name="back" variant="flat" color={Colors.textPrimary} onPress={() => router.back()} />
        <Text variant="heading2" style={styles.headerTitle}>Mon espace Affilié Réseau</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      >
        {/* Wallet Affilié — hero card bleue */}
        <View style={styles.walletCard}>
          <View style={styles.walletTop}>
            <View>
              <Text variant="caption" color={Colors.textOnPrimary} style={styles.kicker}>MON WALLET</Text>
              <Text variant="display" color={Colors.textOnPrimary} style={styles.walletBalance}>{fcfa(balance)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.retirerBtn, locked && styles.retirerBtnLocked]}
              activeOpacity={locked ? 1 : 0.85}
              onPress={locked ? undefined : () => router.push('/affilie/retrait-methode')}
            >
              <Text variant="label" color={locked ? Colors.textTertiary : Colors.primary}>Retirer</Text>
            </TouchableOpacity>
          </View>
          {lockCaption && (
            <View style={styles.lockNote}>
              <Icon name="info" size={16} color={Colors.textOnPrimary} />
              <Text variant="caption" color={Colors.textOnPrimary} style={styles.lockNoteText}>
                {lockCaption}
              </Text>
            </View>
          )}
        </View>

        {/* Statistiques du réseau */}
        <View style={styles.statsGrid}>
          {STATS.map((s) => <StatCard key={s.key} stat={s} />)}
        </View>

        {/* Appels à l'action */}
        <Button label="Partager mon code" icon="share" onPress={share} style={styles.cta} />
        <Button
          label="Voir mon réseau"
          variant="link"
          size="sm"
          trailingIcon="chevronRight"
          onPress={() => router.push('/affilie/reseau')}
          style={styles.linkRow}
        />

        {/* Commissions récentes */}
        <Text variant="caption" color={Colors.textTertiary} style={styles.sectionLabel}>COMMISSIONS RÉCENTES</Text>
        {COMMISSIONS.length === 0 ? (
          <Text variant="bodySmall" color={Colors.textSecondary} style={styles.emptyState}>
            Pas encore de gains — ils apparaîtront ici dès que les personnes de votre réseau commenceront à faire des courses.
          </Text>
        ) : (
          COMMISSIONS.map((c, i) => (
            <View key={c.id} style={[styles.commRow, i > 0 && styles.commBorder]}>
              <Medallion icon="coins" size="sm" ton="accent" />
              <Text variant="bodySmall" color={Colors.textSecondary} style={styles.flex1}>{c.date}</Text>
              <Text variant="label" color={Colors.success}>+{fcfa(c.amount)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const GAP = Spacing[3];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  flex1: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[3],
  },
  headerTitle: { flex: 1, marginLeft: Spacing[2] },
  headerSpacer: { width: 40 },

  content: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[2],
  },

  walletCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.lg,
    padding: Spacing[6],
    ...Shadows.md,
  },
  walletTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  kicker: { ...SectionLabel },
  walletBalance: { marginTop: Spacing[1], letterSpacing: -0.6 },
  retirerBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  retirerBtnLocked: {
    backgroundColor: Colors.onInverseSubtle,
  },
  lockNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing[4],
    paddingTop: Spacing[3],
    borderTopWidth: Strokes.thin,
    borderTopColor: Colors.onInverseMuted,
  },
  lockNoteText: { flex: 1, opacity: 0.9 },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    marginTop: Spacing[4],
  },
  statCard: {
    flexGrow: 1,
    flexBasis: '47%',
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    borderWidth: Strokes.thin,
    borderColor: Colors.borderSubtle,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  statValue: { letterSpacing: -0.4 },

  cta: { marginTop: Spacing[6] },
  linkRow: { alignSelf: 'center', marginTop: Spacing[4] },

  sectionLabel: {
    ...SectionLabel,
    marginTop: Spacing[8],
    marginBottom: Spacing[2],
  },
  emptyState: { lineHeight: 20 },
  commRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[3],
  },
  commBorder: {
    borderTopWidth: Strokes.thin,
    borderTopColor: Colors.borderSubtle,
  },
});
