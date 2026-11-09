import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import ScreenHeader from '@/components/ScreenHeader';
import ScreenFooter from '@/components/ScreenFooter';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Hint from '@/components/Hint';
import ServiceCard from '@/components/ServiceCard';
import { Colors, Spacing } from '@/constants/tokens';
import { SERVICES } from '@/constants/activation';

/**
 * **Choisir mes services.**
 *
 * Careem (« Select Service » : Rides / Food) et Uber (« Choose how you would
 * like to earn ») présentent les services en cartes illustrées portant titre,
 * description et conditions. Même forme ici — mais avec `ServiceCard`, et non
 * `GammeCard` comme le benchmark l'avait d'abord conclu : les cartes de choix
 * du système sont bâties autour d'un **prix**, et il n'y en a pas ici.
 *
 * ⚠️ **Choix multiple, et c'est le point.** Les services sont cumulables : un
 * Prestataire avec une voiture et une moto peut exercer les deux. D'où des
 * cartes à cocher et non un `Radio`, et un CTA au pluriel qui compte ce qui a
 * été retenu — le Prestataire doit voir qu'il a le droit d'en prendre deux.
 *
 * ⚠️ **Seul le Transport est proposé en v1.** L'app Client n'ouvre que lui au
 * lancement ; faire monter un dossier Vélo Express à quelqu'un qui ne recevra
 * aucune commande serait lui faire perdre son temps. La note du bas le dit
 * plutôt que de laisser croire à un oubli.
 */
export default function ChoixServices() {
  const [choisis, setChoisis] = useState<string[]>(['voiture']);

  const basculer = (id: string) => {
    Haptics.selectionAsync();
    setChoisis((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  };

  return (
    <View style={styles.page}>
      <ScreenHeader title="Mes services" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="display" style={styles.titre}>Que voulez-vous conduire ?</Text>
        <Text variant="body" color={Colors.textSecondary} style={styles.chapo}>
          Choisissez un service, ou les deux. Chacun demande son propre dossier,
          et vous pourrez en ajouter plus tard.
        </Text>

        <View style={styles.cartes}>
          {SERVICES.map((s) => (
            <ServiceCard
              key={s.id}
              label={s.label}
              argument={s.argument}
              illu={s.illu}
              selected={choisis.includes(s.id)}
              onPress={() => basculer(s.id)}
            />
          ))}
        </View>

        <Hint icon="info" style={styles.note}>
          Vélo Express, Moto Livraison et Assistance Routière ouvriront après le
          lancement.
        </Hint>
      </ScrollView>

      <ScreenFooter rule>
        <Button
          label={
            choisis.length > 1
              ? `Monter ${choisis.length} dossiers`
              : 'Monter mon dossier'
          }
          disabled={choisis.length === 0}
          onPress={() => router.replace('/activation')}
        />
      </ScreenFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing[4], paddingBottom: Spacing[8] },
  titre: { marginTop: Spacing[2] },
  chapo: { marginTop: Spacing[3] },
  cartes: { marginTop: Spacing[7], gap: Spacing[3] },
  note: { marginTop: Spacing[5] },
});
