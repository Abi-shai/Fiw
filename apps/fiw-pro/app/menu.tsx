import React from 'react';
import { Alert, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar, { AVATAR_CARD } from '@/components/Avatar';
import Icon from '@/components/Icon';
import List from '@/components/List';
import ListRow from '@/components/ListRow';
import ScreenHeader from '@/components/ScreenHeader';
import Text from '@/components/Text';
import { Colors } from '@/constants/tokens';
import { PRESTATAIRE, autonomie, fcfa, walletEtat } from '@/constants/data';
import { SERVICES, resteAFaire } from '@/constants/activation';

/**
 * **Menu Fiw Pro.**
 *
 * La grammaire du Menu Client, reprise sans l'adapter : page blanche,
 * portrait en `contour`, portes à plat séparées d'un filet de bord à bord,
 * chaque porte portant son résumé en sous-titre. C'est ce que D10 appelle la
 * cohérence interne — et c'est aussi, de loin, le modèle du corpus : le tiroir
 * de Bolt est exactement cela (portrait, puis Earnings · Trip history ·
 * Campaigns · Scheduled rides · Support).
 *
 * ── Ce qui n'y est PAS ────────────────────────────────────────────────────
 * **Aucune tuile de statistiques**, alors que Bolt en pose deux sous son
 * portrait (98 % Driver Score, 98 % Acceptance rate). Deux raisons, et la
 * seconde est la bonne : la règle du Menu Client veut qu'un chiffre qui ouvre
 * quelque chose soit le **sous-titre de sa porte** ; et surtout `CONTEXT.md`
 * **interdit d'afficher le Score de coopération**, qui est un mécanisme
 * interne et invisible pour le prestataire (benchmark D6). La tuile de Bolt
 * n'est pas seulement redondante ici : son contenu est proscrit.
 *
 * **Aucune entrée Affiliation.** La `feature-list` de juin en annonçait une ;
 * l'ADR 0005 a abandonné le canal prestataire-à-prestataire en posant
 * « 1 affilié = 1 app ».
 */
export default function Menu() {
  const insets = useSafeAreaInsets();

  const solde = PRESTATAIRE.walletSolde;
  const etat = walletEtat(solde);
  const walletSub =
    etat === 'bloque'
      ? 'Vide — rechargez pour recevoir des missions'
      : `${fcfa(solde)} · environ ${autonomie(solde)} courses`;

  // Le résumé est lu de la SOURCE, comme côté Client : un dossier qui avance
  // se voit ici sans qu'on ait à réécrire la phrase.
  const aFaire = SERVICES.filter((s) => s.etat !== 'valide');
  const servicesSub = aFaire.length
    ? `${aFaire[0].label} · ${resteAFaire(aFaire[0]).toLowerCase()}`
    : SERVICES.map((s) => s.label).join(', ');

  const deconnexion = () =>
    Alert.alert('Se déconnecter', 'Voulez-vous vous déconnecter de Fiw Pro ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: () => router.replace('/') },
    ]);

  const chevron = <Icon name="chevronRight" size={18} color={Colors.textTertiary} />;

  return (
    <View style={styles.page}>
      <ScreenHeader title="Menu" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Portrait en `contour` : aucune couleur de marque, ni l'aplat ni les
            lettres. Il confirme de qui on parle, il n'appelle à rien. */}
        <TouchableOpacity style={styles.identite} activeOpacity={0.7} onPress={() => router.push('/activation')}>
          <Avatar name={PRESTATAIRE.name} size={AVATAR_CARD} variant="contour" />
          <View style={styles.identiteTexte}>
            <Text variant="heading2" numberOfLines={1}>{PRESTATAIRE.name}</Text>
            <Text variant="bodySmall" color={Colors.textSecondary}>
              {PRESTATAIRE.service} · {PRESTATAIRE.plate}
            </Text>
          </View>
          {chevron}
        </TouchableOpacity>

        <List style_="plat" bleed={20}>
          <ListRow
            icon="document"
            title="Mes services & documents"
            subtitle={servicesSub}
            onPress={() => router.push('/activation')}
            style={styles.row}
          />
          <ListRow
            icon="wallet"
            title="Mon Wallet"
            subtitle={walletSub}
            onPress={() => router.push('/wallet')}
            style={styles.row}
          />
          <ListRow
            icon="coins"
            title="Mes gains"
            subtitle={`${fcfa(PRESTATAIRE.gainsJour)} aujourd'hui · ${PRESTATAIRE.coursesJour} courses`}
            onPress={() => router.push('/gains')}
            style={styles.row}
          />
          <ListRow
            icon="star"
            title="Statut prestataire"
            subtitle={`${PRESTATAIRE.statut} · ${PRESTATAIRE.trips.toLocaleString('fr-FR')} courses`}
            onPress={() => router.push('/statut')}
            style={styles.row}
          />
          <ListRow
            icon="help"
            title="Aide & support"
            subtitle="Questions fréquentes, nous contacter"
            trailing={chevron}
            style={styles.row}
          />
        </List>

        <List style_="plat" bleed={20}>
          <ListRow
            icon="signOut"
            title="Se déconnecter"
            ton="destructif"
            trailing={null}
            onPress={deconnexion}
            style={styles.row}
          />
        </List>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Page blanche, gouttière 20 — les mêmes que le Menu et la partie Compte du
  // Client. Sans carte, ce sont les filets qui portent la structure.
  page: { flex: 1, backgroundColor: Colors.surface },
  content: { paddingHorizontal: 20, paddingTop: 8 },

  identite: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 12, marginBottom: 28,
  },
  identiteTexte: { flex: 1, gap: 2 },
  row: { paddingHorizontal: 20 },
});
