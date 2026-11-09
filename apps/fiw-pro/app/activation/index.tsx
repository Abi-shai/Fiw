import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '@/components/ScreenHeader';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import Medallion from '@/components/Medallion';
import Button from '@/components/Button';
import Hint from '@/components/Hint';
import { Colors, Radii, Spacing, Strokes } from '@/constants/tokens';
import {
  SERVICES, ETAT_DOSSIER_LABEL, prochainePiece, resteAFaire, type Service,
} from '@/constants/activation';

/**
 * **Mon activation — un dossier par service.**
 *
 * ── Pourquoi des dossiers et non une file numérotée (D8) ──────────────────
 * Le corpus donne deux formes : la **barre d'étapes 1-2-3-4** de Careem, et la
 * **liste de portes à « prochaine étape »** d'Uber. Elles ne répondent pas au
 * même problème — la barre numérotée suppose un ordre **imposé**, la liste
 * suppose un ordre **conseillé**.
 *
 * Fiw est dans le second cas : les services sont **cumulables**, chacun a ses
 * propres pièces, et rien n'oblige à finir la voiture avant de commencer la
 * moto. Il n'y a pas une file à représenter, il y a plusieurs dossiers menés
 * en parallèle. Une barre numérotée mentirait sur la liberté réelle.
 *
 * ── Pas de pastille d'état ────────────────────────────────────────────────
 * La règle a été écrite en reprenant le réseau de l'Affiliation : *la seconde
 * ligne d'une rangée d'objet dit ce qui MANQUE, pas ce qu'il y a*. « 2 pièces
 * à déposer » se traite ; une pastille « En attente » ne se traite pas. La
 * ligne porte donc l'état, en bleu quand il reste quelque chose à faire —
 * c'est la sémantique de `subtitleAccent` du système.
 *
 * ── La « prochaine pièce » ────────────────────────────────────────────────
 * Motif d'Uber, avec une inflexion : **une pièce refusée passe avant une pièce
 * manquante**. Le Prestataire croit l'avoir déjà faite — c'est là qu'il perd
 * du temps sans le savoir, et c'est donc elle qu'il faut lui mettre sous les
 * yeux.
 */
export default function Activation() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.page}>
      <ScreenHeader title="Mon activation" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="body" color={Colors.textSecondary} style={styles.chapo}>
          Chaque service a son dossier. Vous pouvez en activer plusieurs, et les
          mener dans l'ordre que vous voulez.
        </Text>

        {SERVICES.map((s) => <Dossier key={s.id} service={s} />)}

        <Button
          label="Activer un autre service"
          variant="secondary"
          icon="add"
          onPress={() => router.push('/activation/services')}
          style={styles.ajouter}
        />
        <Hint icon="info" style={styles.note}>
          Fiw vérifie chaque pièce sous 48 h. Vous recevez une notification dès
          qu'un service est validé.
        </Hint>
      </ScrollView>
    </View>
  );
}

function Dossier({ service }: { service: Service }) {
  const prochaine = prochainePiece(service);
  const reste = resteAFaire(service);
  const aFaire = !!prochaine;

  return (
    <View style={styles.dossier}>
      <TouchableOpacity
        style={styles.entete}
        activeOpacity={0.7}
        onPress={() => router.push({ pathname: '/activation/piece', params: { service: service.id } })}
      >
        <Medallion icon={service.icon} ton={aFaire ? 'accent' : 'neutre'} />
        <View style={styles.flex1}>
          <Text variant="bodyMedium">{service.label}</Text>
          <Text variant="bodySmall" color={aFaire ? Colors.primary : Colors.textSecondary}>
            {reste}
          </Text>
        </View>
        <Icon name="chevronRight" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>

      {prochaine && (
        <>
          <View style={styles.filet} />
          {/* La prochaine pièce, mise en avant façon Uber. Le fond teinté est
              ici légitime — il ne marque pas « l'élu d'une liste » mais ce
              qu'il reste à faire sur un bloc qui lui appartient. */}
          <TouchableOpacity
            style={styles.prochaine}
            activeOpacity={0.7}
            onPress={() => router.push({
              pathname: '/activation/piece',
              params: { service: service.id, piece: prochaine.id },
            })}
          >
            <View style={styles.flex1}>
              <Text variant="caption" color={Colors.textSecondary}>
                {prochaine.etat === 'refusee' ? 'À refaire en priorité' : 'Prochaine pièce'}
              </Text>
              <Text variant="label">{prochaine.label}</Text>
              {prochaine.note ? (
                <Text variant="bodySmall" color={Colors.warningInk} style={styles.motif}>
                  {prochaine.note}
                </Text>
              ) : null}
            </View>
            <Icon name="chevronRight" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </>
      )}

      {!aFaire && service.etat === 'attente' && (
        <>
          <View style={styles.filet} />
          <View style={styles.attente}>
            <Icon name="hourglass" size={16} weight="bold" color={Colors.textSecondary} />
            <Text variant="bodySmall" color={Colors.textSecondary} style={styles.flex1}>
              {ETAT_DOSSIER_LABEL[service.etat]} — rien à faire de votre côté.
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing[4], paddingTop: Spacing[2] },
  flex1: { flex: 1 },

  chapo: { marginBottom: Spacing[5] },

  dossier: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: Strokes.thin, borderColor: Colors.borderSubtle,
    marginBottom: Spacing[3],
    overflow: 'hidden',
  },
  entete: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[3],
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[3],
  },
  filet: { height: Strokes.thin, backgroundColor: Colors.borderSubtle },

  prochaine: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[3],
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[3],
  },
  motif: { marginTop: 2 },

  attente: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[2],
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[3],
  },

  ajouter: { marginTop: Spacing[3] },
  note: { marginTop: Spacing[4] },
});
