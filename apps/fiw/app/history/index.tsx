import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/tokens';
import ScreenHeader from '@/components/ScreenHeader';
import PlaceRow from '@/components/PlaceRow';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import { COURSE_HISTORY } from '@/constants/data';

const fmt = (n: number) => n.toLocaleString('fr-FR');

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <ScreenHeader title="Historique" />

      {COURSE_HISTORY.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="clock" size={40} color={Colors.textTertiary} />
          <Text variant="body" color={Colors.textSecondary} align="center">
            Aucune course pour le moment
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {COURSE_HISTORY.map((c) => (
            <PlaceRow
              key={c.id}
              icon={c.gammeId === 'moto' ? 'moto' : 'car'}
              title={c.destName}
              subtitle={`${c.date} · ${fmt(c.total)} F CFA`}
              trailing="chevronRight"
              onPress={() => router.push(`/history/${c.id}`)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
});
