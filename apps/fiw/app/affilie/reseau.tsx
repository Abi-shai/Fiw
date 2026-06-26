import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import ScreenHeader from '@/components/ScreenHeader';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import { Colors, Radii, Spacing } from '@/constants/tokens';
import { MEMBERS, kindLabel, type Member } from '@/constants/affilie';

// Section « Mon Réseau » : affiliés prestataires / clients, actifs ou inactifs.

type Tab = 'prestataires' | 'clients';

function MemberRow({ m }: { m: Member }) {
  return (
    <View style={styles.row}>
      <Avatar name={m.name} size={44} bordered={m.active} />
      <View style={styles.rowText}>
        <Text variant="label">{m.name}</Text>
        <Text variant="caption" color={Colors.textSecondary}>
          {kindLabel(m.kind)}{m.active ? ` · ${m.courses} courses` : ''}
        </Text>
      </View>
      <View style={[styles.status, m.active ? styles.statusOn : styles.statusOff]}>
        <Text variant="caption" color={m.active ? Colors.success : Colors.textTertiary}>
          {m.active ? 'Actif' : 'Inactif'}
        </Text>
      </View>
    </View>
  );
}

export default function Reseau() {
  const [tab, setTab] = useState<Tab>('prestataires');

  const list = MEMBERS.filter((m) =>
    tab === 'prestataires' ? m.kind !== 'client' : m.kind === 'client'
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Mon réseau" />

      {/* Segmented control */}
      <View style={styles.segment}>
        {(['prestataires', 'clients'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.segmentItem, tab === t && styles.segmentItemOn]}
            activeOpacity={0.8}
            onPress={() => setTab(t)}
          >
            <Text variant="label" color={tab === t ? Colors.primary : Colors.textSecondary}>
              {t === 'prestataires' ? 'Chauffeurs & livreurs' : 'Clients'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {list.length > 0 ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {list.map((m) => <MemberRow key={m.id} m={m} />)}
        </ScrollView>
      ) : (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Icon name="users" size={32} color={Colors.primary} />
          </View>
          <Text variant="heading2" align="center">Personne pour l’instant</Text>
          <Text variant="bodySmall" color={Colors.textSecondary} align="center" style={styles.emptyText}>
            Partagez votre code pour inviter vos premières personnes dans votre réseau.
          </Text>
          <Button label="Partager mon code" icon="share" onPress={() => router.push('/affilie/outils')} style={styles.emptyCta} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  segment: {
    flexDirection: 'row',
    marginHorizontal: Spacing[4],
    backgroundColor: Colors.surface,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: 4,
    marginBottom: Spacing[2],
  },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing[2], borderRadius: Radii.pill },
  segmentItemOn: { backgroundColor: Colors.primarySubtle },

  content: { paddingHorizontal: Spacing[4], paddingVertical: Spacing[2] },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], paddingVertical: Spacing[3] },
  rowText: { flex: 1 },
  status: { paddingHorizontal: Spacing[3], paddingVertical: 4, borderRadius: Radii.pill },
  statusOn: { backgroundColor: Colors.successSubtle },
  statusOff: { backgroundColor: Colors.borderSubtle },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing[8] },
  emptyIcon: {
    width: 72, height: 72, borderRadius: Radii.lg,
    backgroundColor: Colors.primarySubtle,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing[4],
  },
  emptyText: { marginTop: Spacing[2] },
  emptyCta: { marginTop: Spacing[6], alignSelf: 'stretch' },
});
