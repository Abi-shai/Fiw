import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import IconButton from '@/components/IconButton';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import { Colors, Radii, Spacing, Shadows } from '@/constants/tokens';

// Écran témoin — Tableau de bord Ambassadeur (terme système : Affilié Réseau),
// état « Membre Fondateur » : les gains sont comptabilisés mais le retrait reste
// bloqué jusqu'au lancement officiel. Voir docs/breadboard-affilie-reseau.md (JS1).
// Données factices : ce proto sert à caler le style, pas la logique.

type Stat = { key: string; icon: IconName; value: string; label: string };

const STATS: Stat[] = [
  { key: 'gains',        icon: 'coins',     value: '12 400 F', label: 'Gains cumulés' },
  { key: 'courses',      icon: 'flag',      value: '27',       label: 'Courses générées' },
  { key: 'prestataires', icon: 'car',       value: '3',        label: 'Chauffeurs actifs' },
  { key: 'clients',      icon: 'rider',     value: '8',        label: 'Clients actifs' },
];

function StatCard({ stat }: { stat: Stat }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Icon name={stat.icon} size={20} color={Colors.primary} />
      </View>
      <Text variant="heading1" style={styles.statValue}>{stat.value}</Text>
      <Text variant="caption" color={Colors.textSecondary}>{stat.label}</Text>
    </View>
  );
}

export default function AffilieDashboard() {
  const insets = useSafeAreaInsets();

  const share = () => {
    Haptics.selectionAsync();
    router.push('/affilie/outils');
  };

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <IconButton name="back" variant="flat" color={Colors.textPrimary} onPress={() => router.back()} />
        <Text variant="heading2" style={styles.headerTitle}>Mon espace Ambassadeur</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      >
        {/* Bannière Membre Fondateur — gains comptabilisés, retrait différé */}
        <View style={styles.banner}>
          <View style={styles.bannerPill}>
            <Icon name="flag" size={14} color={Colors.textOnPrimary} weight="fill" />
            <Text variant="caption" color={Colors.textOnPrimary} style={styles.bannerPillText}>
              MEMBRE FONDATEUR
            </Text>
          </View>
          <Text variant="heading2" color={Colors.textOnPrimary} style={styles.bannerTitle}>
            Vous faites partie des fondateurs
          </Text>
          <Text variant="bodySmall" color={Colors.textOnPrimary} style={styles.bannerBody}>
            Vos gains sont comptabilisés dès maintenant et seront débloqués au lancement officiel.
          </Text>
        </View>

        {/* Statistiques du réseau */}
        <View style={styles.statsGrid}>
          {STATS.map((s) => <StatCard key={s.key} stat={s} />)}
        </View>

        {/* Aperçu Wallet Affilié — solde visible, retrait verrouillé */}
        <TouchableOpacity style={styles.walletCard} activeOpacity={0.9} onPress={() => router.push('/affilie/wallet')}>
          <View style={styles.walletTop}>
            <View>
              <Text variant="caption" color={Colors.textTertiary} style={styles.kicker}>MON WALLET</Text>
              <Text variant="display" style={styles.walletBalance}>12 400 F</Text>
            </View>
            <View style={styles.walletIcon}>
              <Icon name="coins" size={24} color={Colors.primary} weight="fill" />
            </View>
          </View>
          <View style={styles.lockNote}>
            <Icon name="info" size={16} color={Colors.textSecondary} />
            <Text variant="caption" color={Colors.textSecondary} style={styles.lockNoteText}>
              Retrait disponible au lancement officiel.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Appels à l'action */}
        <Button label="Partager mon code" icon="share" onPress={share} style={styles.cta} />
        <TouchableOpacity style={styles.linkRow} activeOpacity={0.7} onPress={() => router.push('/affilie/reseau')}>
          <Text variant="label" color={Colors.primary}>Voir mon réseau</Text>
          <Icon name="chevronRight" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const GAP = Spacing[3];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

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

  // Bannière fondateur — carte pleine couleur marque, emphase maximale.
  banner: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.lg,
    padding: Spacing[6],
    ...Shadows.md,
  },
  bannerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.pill,
    marginBottom: Spacing[3],
  },
  bannerPillText: { letterSpacing: 0.8 },
  bannerTitle: { letterSpacing: -0.3 },
  bannerBody: { marginTop: Spacing[2], opacity: 0.9 },

  // Grille de stats 2×2.
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
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  statIcon: {
    width: 36, height: 36,
    borderRadius: Radii.sm,
    backgroundColor: Colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { letterSpacing: -0.4 },

  // Carte Wallet.
  walletCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: Spacing[6],
    marginTop: GAP,
    ...Shadows.sm,
  },
  walletTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  kicker: { textTransform: 'uppercase', letterSpacing: 0.8 },
  walletBalance: { marginTop: Spacing[1], letterSpacing: -0.6 },
  walletIcon: {
    width: 48, height: 48,
    borderRadius: Radii.md,
    backgroundColor: Colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing[4],
    paddingTop: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  lockNoteText: { flex: 1 },

  cta: { marginTop: Spacing[6] },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: Spacing[4],
  },
});
