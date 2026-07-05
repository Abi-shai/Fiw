import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors, Radii } from '@/constants/tokens';
import ScreenHeader from '@/components/ScreenHeader';
import ReceiptCard from '@/components/ReceiptCard';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import { COURSE_HISTORY } from '@/constants/data';

const fmt = (n: number) => n.toLocaleString('fr-FR');

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const course = COURSE_HISTORY.find((c) => c.id === id) ?? COURSE_HISTORY[0];
  const [reported, setReported] = useState(false);

  const lines = [
    { label: 'Course', value: `${fmt(course.base)} F` },
    ...(course.fraisRapprochement > 0
      ? [{ label: 'Frais de rapprochement', value: `${fmt(course.fraisRapprochement)} F` }]
      : []),
    ...(course.fraisAttente > 0
      ? [{ label: "Frais d'attente", value: `${fmt(course.fraisAttente)} F` }]
      : []),
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader title="Détail de la course" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="bodySmall" color={Colors.textSecondary}>{course.date}</Text>

        <ReceiptCard
          rows={[
            { label: 'Destination', value: course.destName },
            { label: 'Service', value: course.gammeLabel },
            { label: 'Prestataire', value: course.driverName },
            { label: 'Véhicule', value: course.vehicle },
            { label: 'Plaque', value: course.driverPlate },
            { label: 'Paiement', value: course.paymentLabel },
          ]}
          lines={lines}
          total={`${fmt(course.total)} F CFA`}
        />

        {/* Objet oublié : passe TOUJOURS par le service client (via la plaque),
            jamais d'appel direct au prestataire (aucun numéro exposé au client). */}
        <View style={styles.lostCard}>
          {reported ? (
            <View style={styles.lostDone}>
              <Icon name="check" size={22} weight="fill" color={Colors.success} />
              <Text variant="bodySmall" color={Colors.textSecondary} style={styles.flex1}>
                Demande transmise au service client. Un conseiller vous recontacte avec la référence {course.driverPlate}.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.lostHead}>
                <Icon name="lifebuoy" size={22} color={Colors.primary} />
                <Text variant="label" style={styles.flex1}>Un objet oublié dans ce véhicule ?</Text>
              </View>
              <Text variant="caption" color={Colors.textSecondary}>
                Le service client vous met en relation en toute sécurité à partir de la plaque {course.driverPlate}.
              </Text>
              <Button
                label="Contacter le service client"
                variant="secondary"
                size="md"
                icon="lifebuoy"
                onPress={() => setReported(true)}
                style={styles.lostBtn}
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20, paddingBottom: 32, gap: 14 },
  flex1: { flex: 1 },
  lostCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 10,
  },
  lostHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lostBtn: { marginTop: 4 },
  lostDone: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
