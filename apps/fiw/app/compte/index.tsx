import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radii, Strokes } from '@/constants/tokens';
import ScreenHeader from '@/components/ScreenHeader';
import List from '@/components/List';
import ListRow from '@/components/ListRow';
import Avatar, { AVATAR_CARD } from '@/components/Avatar';
import Icon from '@/components/Icon';
import Text from '@/components/Text';
import { CLIENT } from '@/constants/data';

const APP_VERSION = 'Fiw 1.0.0 (proto)';

export default function CompteScreen() {
  const insets = useSafeAreaInsets();

  const logout = () =>
    Alert.alert('Se déconnecter', 'Voulez-vous vous déconnecter de Fiw ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: () => router.replace('/') },
    ]);

  const deleteAccount = () =>
    Alert.alert(
      'Supprimer mon compte',
      'Cette action est définitive : toutes vos données (courses, lieux, moyens de paiement) seront effacées.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => router.replace('/') },
      ],
    );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Mon compte & Sécurité" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Bloc identité — tap → édition du profil. Affiche la Note du Client
            (moyenne ; le détail par course reste privé — décision D1). */}
        <TouchableOpacity style={styles.identity} activeOpacity={0.7} onPress={() => router.push('/compte/profil')}>
          <Avatar name={CLIENT.name} size={AVATAR_CARD} />
          <View style={styles.identityText}>
            <Text variant="heading2" numberOfLines={1}>{CLIENT.name}</Text>
            <Text variant="bodySmall" color={Colors.textSecondary}>{CLIENT.phone}</Text>
            <View style={styles.noteRow}>
              <Icon name="star" size={14} color={Colors.brandYellow} weight="fill" />
              <Text variant="caption" color={Colors.textSecondary}>
                {CLIENT.note.toLocaleString('fr-FR')} · Note du Client
              </Text>
            </View>
          </View>
          <Icon name="chevronRight" size={20} color={Colors.textTertiary} />
        </TouchableOpacity>

        <List title="Compte">
          <ListRow icon="card" title="Moyens de paiement" value="Wave · +1" onPress={() => router.push('/compte/paiement')} />
          <ListRow icon="location" title="Lieux enregistrés" value="Maison, Travail" onPress={() => router.push('/compte/lieux')} />
        </List>

        <List
          title="Sécurité & préférences"
          footnote="Vos Contacts de confiance reçoivent votre trajet en temps réel et peuvent être alertés en cas d'urgence."
        >
          <ListRow icon="shield" title="Contacts de confiance" onPress={() => router.push('/compte/securite')} />
          <ListRow icon="bell" title="Préférences" subtitle="Notifications" onPress={() => router.push('/compte/preferences')} />
        </List>

        <List>
          <ListRow icon="signOut" title="Se déconnecter" ton="destructif" trailing={null} onPress={logout} />
          <ListRow icon="trash" title="Supprimer mon compte" ton="destructif" trailing={null} onPress={deleteAccount} />
        </List>

        <Text variant="caption" color={Colors.textTertiary} align="center" style={styles.legal}>
          Conditions générales · Politique de confidentialité
        </Text>
        <Text variant="caption" color={Colors.textTertiary} align="center" style={styles.version}>
          {APP_VERSION}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 20, paddingTop: 8 },

  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: Strokes.thin,
    borderColor: Colors.borderSubtle,
    padding: 16,
    marginBottom: 24,
  },
  identityText: { flex: 1, gap: 2 },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },

  legal: { marginTop: 4 },
  version: { marginTop: 6 },
});
