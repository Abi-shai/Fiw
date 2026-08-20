import React from 'react';
import { View, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/tokens';
import ScreenHeader from '@/components/ScreenHeader';
import SettingsGroup from '@/components/SettingsGroup';
import SettingsRow from '@/components/SettingsRow';
import Button from '@/components/Button';
import { useSafety, setShareOnStart, removeContact } from '@/stores/safety';

export default function SecuriteScreen() {
  const insets = useSafeAreaInsets();
  // L'état vit dans `stores/safety` : le hub Compte en affiche le résumé, il
  // doit voir la même chose que cet écran (todo P11, question 4).
  const { shareOnStart, contacts } = useSafety();

  const track = { true: Colors.primary, false: Colors.border };

  const confirmRemove = (id: string) =>
    Alert.alert('Retirer ce contact', 'Il ne recevra plus vos trajets.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Retirer', style: 'destructive', onPress: () => removeContact(id) },
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
            (style-guide).

            Un contact de confiance est un élément que le Client possède, pas un
            réglage : la liste porte la pastille bleue, comme les Lieux
            enregistrés — mêmes objets, même grammaire d'un écran à l'autre. */}
        <SettingsGroup title="Contacts de confiance">
          {contacts.length === 0 ? (
            <SettingsRow icon="user" accent label="Aucun contact" subtitle="Ajoutez-en un ci-dessous" chevron={false} />
          ) : (
            contacts.map((c) => (
              <SettingsRow
                key={c.id}
                icon="user"
                accent
                label={c.name}
                subtitle={c.phone}
                chevron={false}
                onPress={() => confirmRemove(c.id)}
              />
            ))
          )}
        </SettingsGroup>

        {/* Seule action de l'écran, donc `primary` — même forme que « Ajouter un
            lieu » sur Lieux enregistrés (cf. style-guide, 20 août 2026). */}
        <Button label="Ajouter un contact de confiance" icon="add" onPress={addContact} style={styles.add} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Fond blanc, comme le hub Compte et la sidebar : les réglages sont des
  // rangées à plat séparées par des filets, jamais des cartes (todo P5).
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  add: { marginTop: 16 },
});
