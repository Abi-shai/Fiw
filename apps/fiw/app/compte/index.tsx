import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/tokens';
import ScreenHeader from '@/components/ScreenHeader';
import SettingsGroup from '@/components/SettingsGroup';
import SettingsRow from '@/components/SettingsRow';
import Avatar from '@/components/Avatar';
import Icon from '@/components/Icon';
import Text from '@/components/Text';
import { CLIENT } from '@/constants/data';
import { usePlaces } from '@/stores/places';
import { usePayment, configuredMethods } from '@/stores/payment';
import { useSafety, safetySummary } from '@/stores/safety';

const APP_VERSION = 'Fiw 1.0.0 (proto)';

export default function CompteScreen() {
  const insets = useSafeAreaInsets();

  // Les résumés de rangée sont lus depuis la source réelle, jamais écrits en
  // dur : un lieu ajouté, un compte retiré, un contact supprimé se voient ici
  // aussitôt. Si la ligne déborde, le sous-titre se tronque (`numberOfLines`
  // dans `SettingsRow`) — on perd la fin d'une énumération, pas le nom de la
  // rangée.
  const paymentSummary = configuredMethods(usePayment().numbers)
    .map((m) => m.label)
    .join(', ');
  const placesSummary = usePlaces()
    .filter((p) => p.detail)
    .map((p) => p.label)
    .join(', ');
  // Seule rangée dont le résumé dit un ÉTAT plutôt qu'une liste de valeurs :
  // « Sécurité » couvre deux rubriques, et énumérer les contacts n'en
  // résumait qu'une. L'état les couvre toutes les deux et répond à la seule
  // question qu'on ne peut pas deviner de l'extérieur — le partage est-il en
  // marche ? (Tranché le 20 août 2026, question 4.)
  const securiteSummary = safetySummary(useSafety());

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
          <Avatar name={CLIENT.name} size={60} />
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

        {/* Toutes les rangées portent leur résumé en SOUS-TITRE, jamais en valeur
            alignée à droite : la valeur de droite dispute sa largeur au label et
            le fait passer à la ligne, ce qui donne des rangées de hauteurs
            inégales. Sous le label, le résumé a toute la largeur.
            « Sécurité » et non « Contacts de confiance » : l'écran couvre aussi
            le partage de trajet — la rangée portait le nom d'une seule de ses
            sections. Le nom est gardé même si l'écran est court : un contenant
            se nomme d'après ce qu'il est fait pour tenir, et celui-ci recevra
            d'autres paramètres (réunion du 16 août 2026). */}
        {/* Une seule liste, sans titres de section : quatre portes ne demandent
            pas de taxonomie, et les titres répétaient le nom de leurs rangées.
            Aucune note ici non plus — ce qu'il y a à expliquer sur les Contacts
            de confiance se lit sur l'écran Sécurité, au moment où on les gère. */}
        <SettingsGroup>
          <SettingsRow icon="card" label="Moyens de paiement" subtitle={paymentSummary} onPress={() => router.push('/compte/paiement')} />
          <SettingsRow icon="location" label="Lieux enregistrés" subtitle={placesSummary} onPress={() => router.push('/compte/lieux')} />
          <SettingsRow icon="shield" label="Sécurité" subtitle={securiteSummary} onPress={() => router.push('/compte/securite')} />
          <SettingsRow icon="bell" label="Préférences" subtitle="Notifications" onPress={() => router.push('/compte/preferences')} />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow icon="signOut" label="Se déconnecter" destructive chevron={false} onPress={logout} />
          <SettingsRow icon="trash" label="Supprimer mon compte" destructive chevron={false} onPress={deleteAccount} />
        </SettingsGroup>

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
  // Page blanche : la surface de la sidebar. Sans carte, ce sont les filets qui
  // portent la structure — gris sur blanc tient un contraste que le gris sur
  // gris perdait, ce qui compte pour un écran lu dehors.
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { paddingHorizontal: 20, paddingTop: 8 },

  // Le bloc identité n'a pas de carte non plus : ce serait la seule surface
  // encadrée d'une page qui n'en a plus.
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    // Même respiration que celle qui sépare deux SettingsGroup, pour que le bloc
    // identité entre dans le rythme de la page au lieu d'avoir son propre écart.
    marginBottom: 28,
  },
  identityText: { flex: 1, gap: 2 },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },

  legal: { marginTop: 4 },
  version: { marginTop: 6 },
});
