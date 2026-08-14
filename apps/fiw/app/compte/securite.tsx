import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/tokens';
import ScreenHeader from '@/components/ScreenHeader';
import SettingsGroup from '@/components/SettingsGroup';
import SettingsRow from '@/components/SettingsRow';
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
        <SettingsGroup
          title="Partage de trajet"
          // La seconde phrase vient du hub Compte, où elle était la dernière note
          // d'une page qui n'en a plus : le rôle d'urgence des Contacts de
          // confiance s'explique là où on les gère, pas devant la porte. Gardée
          // dans CETTE note plutôt que dans une seconde — une note par écran
          // (style-guide), et l'écran en avait déjà une.
          footnote="Quand c'est activé, vos Contacts de confiance reçoivent votre position en temps réel dès le départ de chaque course. Ils peuvent aussi être alertés en cas d'urgence."
        >
          <SettingsRow
            icon="share"
            label="Partager mon trajet au départ"
            right={
              <Switch
                value={shareOnStart}
                onValueChange={setShareOnStart}
                trackColor={track}
                thumbColor={Colors.surface}
                ios_backgroundColor={Colors.border}
              />
            }
          />
        </SettingsGroup>

        {/* Pas de note ici : celle du partage de trajet, juste au-dessus, dit
            déjà ce que sont les Contacts de confiance. Une seule note par écran
            (style-guide). */}
        <SettingsGroup title="Contacts de confiance">
          {contacts.length === 0 ? (
            <SettingsRow icon="user" label="Aucun contact" subtitle="Ajoutez-en un ci-dessous" chevron={false} />
          ) : (
            contacts.map((c) => (
              <SettingsRow
                key={c.id}
                icon="user"
                label={c.name}
                subtitle={c.phone}
                chevron={false}
                onPress={() => removeContact(c.id)}
              />
            ))
          )}
        </SettingsGroup>

        <Button label="Ajouter un contact de confiance" variant="secondary" icon="add" onPress={addContact} />

        <SettingsGroup title="Connexion" style={styles.connexion}>
          <SettingsRow icon="phone" label="Numéro de téléphone" subtitle={CLIENT.phone}
            onPress={() => Alert.alert('Numéro', 'Modification du numéro à venir dans le proto.')} />
          <SettingsRow icon="lock" label="Code de connexion"
            onPress={() => Alert.alert('Code', 'Changement de code à venir dans le proto.')} />
        </SettingsGroup>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Fond blanc, comme le hub Compte et la sidebar : les réglages sont des
  // rangées à plat séparées par des filets, jamais des cartes (todo P5).
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  connexion: { marginTop: 24 },
});
