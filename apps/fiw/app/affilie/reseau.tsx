import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '@/components/ScreenHeader';
import Avatar, { AVATAR_ROW } from '@/components/Avatar';
import Button from '@/components/Button';
import List from '@/components/List';
import ListRow from '@/components/ListRow';
import Medallion from '@/components/Medallion';
import Text from '@/components/Text';
import { Colors, Radii, Spacing } from '@/constants/tokens';
import { MEMBERS, serviceLabel, activeMembers, totalCourses } from '@/constants/affilie';

/** Retrait du filet pour une tête d'`Avatar` de rangée : 16 + 48 + 12. */
const INSET_AVATAR = 76;

// JS3 — Mon réseau : les Prestataires inscrits avec le code.
//
// ── Ce que la passe du 27 septembre 2026 a changé ──────────────────────────
// **L'onglet « Clients » tombe, et le `SegmentedControl` avec lui.** Le recap
// du 30 août 2026 a sorti les Clients recrutés du périmètre : la commission ne
// tombe que sur les courses des Prestataires. Un segmenté à un seul segment
// n'est pas un choix, c'est un titre — il disparaît, et l'écran n'a plus qu'une
// population. L'autre onglet disait « Chauffeurs & livreurs », intitulé
// doublement fautif : « chauffeur » est proscrit hors Transport, et ces deux
// mots désignent le même objet de domaine, le **Prestataire**.
//
// **La rangée maison devient une `ListRow`.** Elle refaisait à la main ce que
// le système fait — avatar, deux lignes, fin de rangée — avec sa propre
// gouttière et sa propre pastille d'état.
//
// **La pastille « Actif / Inactif » disparaît**, et c'est une règle du style
// guide : « la seconde ligne d'une rangée d'objet dit ce qui MANQUE, pas ce
// qu'il y a ». Un Affilié qui n'a pas encore roulé n'a pas besoin d'une
// étiquette grise à côté de son nom — il a besoin qu'on dise ce qui lui manque,
// et c'est une première course. Les deux états se lisent donc dans la même
// ligne, au même endroit, sans un second signal à décoder.
export default function Reseau() {
  const insets = useSafeAreaInsets();
  const actifs = activeMembers();
  const courses = totalCourses();

  return (
    <View style={styles.page}>
      <ScreenHeader title="Mon réseau" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      >
        {MEMBERS.length > 0 ? (
          <List
            title={`${MEMBERS.length} prestataire${MEMBERS.length > 1 ? 's' : ''}`}
            footnote={`${actifs} en activité · ${courses} courses générées depuis le début.`}
            style_="carte"
            inset={INSET_AVATAR}
          >
            {MEMBERS.map((m) => (
              <ListRow
                key={m.id}
                leading={<Avatar name={m.name} size={AVATAR_ROW} />}
                title={m.name}
                subtitle={
                  m.active
                    ? `${serviceLabel(m.service)} · ${m.courses} courses`
                    : `${serviceLabel(m.service)} · pas encore de course`
                }
                trailing={null}
              />
            ))}
          </List>
        ) : (
          // État vide en CARTE et non en héros centré : ce n'est pas un état de
          // résultat (`ResultState`, médaillon 112) mais une liste qui n'a rien
          // à montrer. Le médaillon y est en `lg` — la plus grande empreinte du
          // système, là où la page dessinait un carré de 72 à rayon `lg`, une
          // géométrie qui n'existe nulle part ailleurs.
          <View style={styles.emptyCard}>
            <Medallion icon="users" size="lg" ton="accent" />
            <Text variant="heading2">Personne pour l’instant</Text>
            <Text variant="bodySmall" color={Colors.textSecondary}>
              Partagez votre code aux prestataires autour de vous : chacun de ceux
              qui s’inscrivent entre dans votre réseau.
            </Text>
            <Button
              label="Partager mon code"
              icon="share"
              onPress={() => router.push('/affilie/outils')}
              style={styles.emptyCta}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing[4], paddingTop: Spacing[2] },

  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing[6],
    gap: Spacing[3],
  },
  emptyCta: { marginTop: Spacing[2] },
});
