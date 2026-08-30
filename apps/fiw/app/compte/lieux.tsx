import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/tokens';
import ScreenHeader from '@/components/ScreenHeader';
import List from '@/components/List';
import ListRow from '@/components/ListRow';
import Medallion from '@/components/Medallion';
import Hint from '@/components/Hint';
import Button from '@/components/Button';
import Text from '@/components/Text';
import { usePlaces, type Place } from '@/stores/places';
import type { IconName } from '@/components/Icon';

// Maison + Travail = emplacements permanents ; les autres sont des lieux libres
// nommés par le Client (décision D2). Icône par type.
const iconFor = (kind: string): IconName =>
  kind === 'home' ? 'home' : kind === 'work' ? 'work' : 'location';

/** Ce que la seconde ligne dit d'un lieu : l'adresse quand il est complet,
 *  sinon ce qui manque — l'adresse d'abord (sans elle le lieu n'existe pas), le
 *  Repère ensuite. C'est l'ABSENCE qu'on montre, pas le contenu : on ne relit
 *  pas un Repère qu'on a écrit soi-même, mais on doit voir le lieu qui fera
 *  chercher le Prestataire. Contrepartie assumée de la rangée à deux lignes :
 *  quand le Repère manque, l'adresse cède sa place à l'invitation.
 *  _(Tranché le 20 août 2026 — carte à trois lignes écartée, cf. style-guide.)_ */
const rowSubtitle = (p: Place) =>
  !p.detail ? 'Ajouter une adresse' : !p.repere ? 'Ajouter un Repère' : p.detail;
const rowIsInvite = (p: Place) => !p.detail || !p.repere;

export default function LieuxScreen() {
  const insets = useSafeAreaInsets();
  const places = usePlaces();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Lieux enregistrés" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <List style_="plat" bleed={20} inset={56}>
          {places.map((p) => (
            <ListRow
              key={p.id}
              leading={<Medallion icon={iconFor(p.kind)} ton="accent" />}
              title={p.label}
              // Maison et Travail restent dans la liste même vidés de leur
              // adresse : la seconde ligne devient alors l'invitation à la
              // remplir (cf. Bolt, Uber, Freenow).
              subtitle={rowSubtitle(p)}
              subtitleAccent={rowIsInvite(p)}
              onPress={() => router.push(`/compte/lieu?id=${p.id}`)}
              style={styles.row}
            />
          ))}
        </List>

        <Hint style={styles.hint}>
          Maison et Travail sont toujours présents ; ajoutez autant de lieux libres que vous voulez.
        </Hint>

        {/* Seule action de l'écran, donc `primary` sous la liste — pas une
            rangée d'ajout dans la liste (cf. style-guide, 20 août 2026). */}
        <Button
          label="Ajouter un lieu"
          icon="add"
          onPress={() => router.push('/compte/lieu')}
          style={styles.add}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  // Les lieux sont des portes — mêmes rangées à plat, mêmes filets de bord à
  // bord que le hub Compte, et non une carte englobant la liste. Le padding de
  // 20 est celui que la liste annule par son débord, pour que les filets filent
  // aux bords sans désaligner le texte.
  row: { paddingHorizontal: 20 },
  hint: { marginTop: 8, marginLeft: 4, lineHeight: 16 },
  add: { marginTop: 16 },
});
