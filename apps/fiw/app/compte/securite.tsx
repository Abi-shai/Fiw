import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/tokens';
import ScreenHeader from '@/components/ScreenHeader';
import List from '@/components/List';
import ListRow from '@/components/ListRow';
import Button from '@/components/Button';
import { CLIENT, TRUSTED_CONTACTS } from '@/constants/data';

export default function SecuriteScreen() {
  const insets = useSafeAreaInsets();
  const [shareOnStart, setShareOnStart] = useState(true);
  const [contacts, setContacts] = useState(TRUSTED_CONTACTS);

  const track = { true: Colors.primary, false: Colors.border };

  const removeContact = (id: string) =>
    Alert.alert('Retirer ce contact', 'Il ne recevra plus vos trajets.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Retirer', style: 'destructive', onPress: () => setContacts((c) => c.filter((x) => x.id !== id)) },
    ]);

  const addContact = () =>
    Alert.alert('Ajouter un contact de confiance', 'Choix depuis le répertoire à venir dans le proto.');

  return (
    <View style={styles.container}>
      <ScreenHeader title="Sécurité" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <List
          title="Partage de trajet"
          footnote="Quand c'est activé, vos Contacts de confiance reçoivent votre position en temps réel dès le départ de chaque course."
        >
          <ListRow
            icon="share"
            title="Partager mon trajet au départ"
            trailing={
              <Switch
                value={shareOnStart}
                onValueChange={setShareOnStart}
                trackColor={track}
                thumbColor={Colors.surface}
                ios_backgroundColor={Colors.border}
              />
            }
          />
        </List>

        <List title="Contacts de confiance">
          {contacts.length === 0 ? (
            <ListRow icon="user" title="Aucun contact" subtitle="Ajoutez-en un ci-dessous" trailing={null} />
          ) : (
            contacts.map((c) => (
              <ListRow
                key={c.id}
                icon="user"
                title={c.name}
                subtitle={c.phone}
                trailing={null}
                onPress={() => removeContact(c.id)}
              />
            ))
          )}
        </List>

        <Button label="Ajouter un contact de confiance" variant="secondary" icon="add" onPress={addContact} />

        <List title="Connexion" style={styles.connexion}>
          <ListRow icon="phone" title="Numéro de téléphone" value={CLIENT.phone}
            onPress={() => Alert.alert('Numéro', 'Modification du numéro à venir dans le proto.')} />
          <ListRow icon="lock" title="Code de connexion"
            onPress={() => Alert.alert('Code', 'Changement de code à venir dans le proto.')} />
        </List>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  connexion: { marginTop: 24 },
});
