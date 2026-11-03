import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/tokens';
import ScreenHeader from '@/components/ScreenHeader';
import List from '@/components/List';
import ListRow from '@/components/ListRow';
import Medallion from '@/components/Medallion';
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
          {/* La liste du Menu fait référence (style guide, 29 septembre 2026) :
              rangées à plat sur page blanche, filet sous le texte (retrait 54 =
              médaillon 42 + gouttière 12), arrêté à la gouttière. Les courses
              défilaient jusque-là sans filet, sur le gris de fond. */}
          <List style_="plat" inset={54}>
            {COURSE_HISTORY.map((c) => (
              <ListRow
                key={c.id}
                leading={<Medallion icon={c.gammeId === 'moto' ? 'moto' : 'car'} />}
                title={c.destName}
                subtitle={`${c.date} · ${fmt(c.total)} F CFA`}
                onPress={() => router.push(`/history/${c.id}`)}
              />
            ))}
          </List>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Page blanche, gouttière 20 et haut à 8 : ceux du Menu, dont Historique est
  // une porte. Une liste à plat vit sur le blanc (style guide).
  container: { flex: 1, backgroundColor: Colors.surface },
  list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
});
