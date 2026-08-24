import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/tokens';
import ScreenHeader from '@/components/ScreenHeader';
import List from '@/components/List';
import ListRow from '@/components/ListRow';

// v1 : Préférences = notifications seules. Langue / thème / unités différés
// (app en français, F CFA, km — décision D5, Wolof = déclencheur futur).
export default function PreferencesScreen() {
  const insets = useSafeAreaInsets();
  const [prefs, setPrefs] = useState({
    pushCourses: true,
    pushPromos: false,
    smsCourses: true,
    smsPromos: false,
  });

  const track = { true: Colors.primary, false: Colors.border };
  const toggle = (key: keyof typeof prefs) => (v: boolean) => setPrefs((p) => ({ ...p, [key]: v }));

  const sw = (key: keyof typeof prefs) => (
    <Switch
      value={prefs[key]}
      onValueChange={toggle(key)}
      trackColor={track}
      thumbColor={Colors.surface}
      ios_backgroundColor={Colors.border}
    />
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Préférences" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <List title="Notifications push">
          <ListRow icon="bell" title="Suivi de mes courses" trailing={sw('pushCourses')} />
          <ListRow icon="gift" title="Promotions & actualités" trailing={sw('pushPromos')} />
        </List>

        <List title="SMS">
          <ListRow icon="chat" title="Suivi de mes courses" trailing={sw('smsCourses')} />
          <ListRow icon="gift" title="Promotions & actualités" trailing={sw('smsPromos')} />
        </List>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 20, paddingTop: 8 },
});
