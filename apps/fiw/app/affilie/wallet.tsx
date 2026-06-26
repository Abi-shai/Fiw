import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import ScreenHeader from '@/components/ScreenHeader';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import { Colors, Radii, Spacing, Shadows } from '@/constants/tokens';
import { AMBASSADEUR, COMMISSIONS, WITHDRAW_MIN, fcfa, kindLabel } from '@/constants/affilie';

// JS3 — Mon Wallet : solde, règle de calcul, historique, retrait selon l'état.

export default function Wallet() {
  const { state, balance } = AMBASSADEUR;
  const [notice, setNotice] = useState<{ text: string; support?: boolean } | null>(null);

  const onWithdraw = () => {
    Haptics.selectionAsync();
    if (state === 'fondateur') {
      setNotice({ text: 'Vos gains seront retirables au lancement officiel.' });
    } else if (state === 'gele') {
      setNotice({ text: 'Retraits momentanément suspendus — contactez le support.', support: true });
    } else if (balance < WITHDRAW_MIN) {
      setNotice({ text: `Minimum ${fcfa(WITHDRAW_MIN)} pour retirer — il vous manque ${fcfa(WITHDRAW_MIN - balance)}.` });
    } else {
      router.push('/affilie/retrait-recap');
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Mon Wallet" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Solde */}
        <View style={styles.balanceCard}>
          <Text variant="caption" color={Colors.textTertiary} style={styles.kicker}>SOLDE DISPONIBLE</Text>
          <Text variant="display" style={styles.balance}>{fcfa(balance)}</Text>
          <Button label="Retirer" icon="bank" onPress={onWithdraw} style={styles.withdrawBtn} />
        </View>

        {notice && (
          <View style={styles.notice}>
            <Icon name="info" size={18} color={Colors.warning} />
            <View style={styles.flex1}>
              <Text variant="bodySmall" color={Colors.gray700}>{notice.text}</Text>
              {notice.support && (
                <TouchableOpacity onPress={() => Haptics.selectionAsync()} style={styles.supportLink}>
                  <Text variant="label" color={Colors.primary}>Contacter le support</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Règle de calcul */}
        <View style={styles.ruleCard}>
          <Icon name="coins" size={20} color={Colors.primary} />
          <Text variant="bodySmall" color={Colors.textSecondary} style={styles.flex1}>
            Vous gagnez <Text variant="bodySmall" color={Colors.textPrimary}>2 %</Text> du prix de chaque course faite par vos affiliés.
          </Text>
        </View>

        {/* Historique */}
        <Text variant="caption" color={Colors.textTertiary} style={styles.sectionLabel}>HISTORIQUE DES COMMISSIONS</Text>
        {COMMISSIONS.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={styles.commRow}
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/affilie/commission-detail', params: { id: c.id } })}
          >
            <Avatar name={c.name} size={40} />
            <View style={styles.flex1}>
              <Text variant="label">{c.name}</Text>
              <Text variant="caption" color={Colors.textSecondary}>{kindLabel(c.kind)} · {c.date}</Text>
            </View>
            <Text variant="label" color={Colors.success}>+{fcfa(c.amount)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing[4], paddingBottom: Spacing[8] },
  flex1: { flex: 1 },

  balanceCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: Spacing[6],
    ...Shadows.sm,
  },
  kicker: { textTransform: 'uppercase', letterSpacing: 0.8 },
  balance: { marginTop: Spacing[1], letterSpacing: -0.6 },
  withdrawBtn: { marginTop: Spacing[4] },

  notice: {
    flexDirection: 'row',
    gap: Spacing[2],
    alignItems: 'flex-start',
    backgroundColor: Colors.warningSubtle,
    borderRadius: Radii.md,
    padding: Spacing[4],
    marginTop: Spacing[3],
  },
  supportLink: { marginTop: Spacing[2] },

  ruleCard: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'center',
    backgroundColor: Colors.primarySubtle,
    borderRadius: Radii.md,
    padding: Spacing[4],
    marginTop: Spacing[3],
  },

  sectionLabel: { textTransform: 'uppercase', letterSpacing: 0.8, marginTop: Spacing[8], marginBottom: Spacing[2] },
  commRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], paddingVertical: Spacing[3] },
});
