import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/tokens';
import ScreenHeader from '@/components/ScreenHeader';
import List from '@/components/List';
import Toggle from '@/components/Toggle';
import ListRow from '@/components/ListRow';
import Medallion from '@/components/Medallion';
import Button from '@/components/Button';
import { useSafety, setShareOnStart, removeContact } from '@/stores/safety';

export default function SecuriteScreen() {
  const insets = useSafeAreaInsets();
  // L'état vit dans `stores/safety` : le hub Compte en affiche le résumé, il
  // doit voir la même chose que cet écran (todo P11, question 4).
  const { shareOnStart, contacts } = useSafety();


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
        <List
          title="Partage de trajet"
          // La seconde phrase vient du hub Compte, où elle était la dernière note
          // d'une page qui n'en a plus : le rôle d'urgence des Contacts de
          // confiance s'explique là où on les gère, pas devant la porte. Gardée
          // dans CETTE note plutôt que dans une seconde — une note par écran
          // (style-guide), et l'écran en avait déjà une.
          footnote="Quand c'est activé, vos Contacts de confiance reçoivent votre position en temps réel dès le départ de chaque course. Ils peuvent aussi être alertés en cas d'urgence."
        >
          <ListRow
            icon="share"
            title="Partager mon trajet au départ"
            trailing={
              <Toggle value={shareOnStart} onValueChange={setShareOnStart} />
            }
          />
        </List>

        {/* Pas de note ici : celle du partage de trajet, juste au-dessus, dit
            déjà ce que sont les Contacts de confiance. Une seule note par écran
            (style-guide).

            Un contact de confiance est un élément que le Client possède, pas un
            réglage : la liste porte la pastille bleue, comme les Lieux
            enregistrés — mêmes objets, même grammaire d'un écran à l'autre. */}
        <List title="Contacts de confiance" style_="plat" bleed={20} inset={56}>
          {contacts.length === 0 ? (
            <ListRow
              leading={<Medallion icon="user" ton="accent" />}
              title="Aucun contact"
              subtitle="Ajoutez-en un ci-dessous"
              trailing={null}
              style={styles.row}
            />
          ) : (
            contacts.map((c) => (
              <ListRow
                key={c.id}
                leading={<Medallion icon="user" ton="accent" />}
                title={c.name}
                subtitle={c.phone}
                trailing={null}
                onPress={() => confirmRemove(c.id)}
                style={styles.row}
              />
            ))
          )}
        </List>

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
  // La gouttière de page, reprise par chaque rangée : le débord de la liste
  // fait filer les filets aux bords sans désaligner le texte.
  row: { paddingHorizontal: 20 },
  add: { marginTop: 16 },
});
