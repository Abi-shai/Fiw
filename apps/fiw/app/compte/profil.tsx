import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radii, Strokes } from '@/constants/tokens';
import ScreenHeader from '@/components/ScreenHeader';
import Field from '@/components/Field';
import Hint from '@/components/Hint';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import Text from '@/components/Text';
import { CLIENT } from '@/constants/data';

export default function ProfilScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(CLIENT.name);
  const [phone, setPhone] = useState(CLIENT.phone);

  // Le numéro se modifie sur un écran dédié (vérification SMS) qui mute CLIENT :
  // on resynchronise l'affichage quand le profil reprend le focus.
  useFocusEffect(useCallback(() => { setPhone(CLIENT.phone); }, []));

  const save = () => {
    CLIENT.name = name;
    Alert.alert('Profil', 'Modifications enregistrées.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  // « Enregistrer » actif seulement si le nom a réellement changé (le numéro se
  // modifie sur l'écran dédié, avec vérification). Nom vide → désactivé.
  const dirty = name.trim().length > 0 && name.trim() !== CLIENT.name;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Profil" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Photo */}
        <View style={styles.photoWrap}>
          <Avatar name={name} size={88} bordered />
          <Button
            label="Modifier la photo"
            variant="link"
            size="sm"
            onPress={() => Alert.alert('Photo', 'Choix de la photo à venir dans le proto.')}
          />
        </View>

        {/* Note du Client — moyenne affichée, lecture seule (décision D1) */}
        <View style={styles.noteCard}>
          <View style={styles.noteLeft}>
            <Icon name="star" size={22} color={Colors.brandYellow} weight="fill" />
            <View>
              <Text variant="heading2">{CLIENT.note.toLocaleString('fr-FR')}</Text>
              <Text variant="caption" color={Colors.textTertiary}>Note du Client</Text>
            </View>
          </View>
          <Hint>Moyenne des évaluations reçues de vos prestataires. Le détail par course reste privé.</Hint>
        </View>

        {/* Nom — éditable inline */}
        <Field label="Nom complet" value={name} onChangeText={setName} style={styles.field} />

        {/* Téléphone — champ protégé : la modification passe par une vérification SMS */}
        <View style={styles.phoneRow}>
          <View style={styles.flex1}>
            <Text variant="caption" color={Colors.textTertiary}>Téléphone</Text>
            <Text variant="bodyMedium" style={styles.phoneValue} numberOfLines={1}>{phone}</Text>
          </View>
          <Button
            variant="link"
            size="sm"
            label="Modifier"
            trailingIcon="chevronRight"
            onPress={() => router.push('/compte/numero')}
          />
        </View>
        <Hint icon="shield" style={styles.note}>
          Un code de vérification est envoyé par SMS avant tout changement.
        </Hint>

        <Button label="Enregistrer" onPress={save} disabled={!dirty} style={styles.save} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Toute la partie Compte est sur fond blanc ; ce sont les blocs qui sont gris.
  // Une carte blanche sur une page blanche ne tient que par son liseré — on
  // inverse donc figure et fond, comme les tuiles de service de l'accueil.
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  flex1: { flex: 1 },

  photoWrap: { alignItems: 'center', gap: 10, marginBottom: 24 },

  noteCard: {
    backgroundColor: Colors.bg,
    borderRadius: Radii.lg,
    borderWidth: Strokes.thin,
    borderColor: Colors.borderSubtle,
    padding: 16,
    gap: 10,
    marginBottom: 24,
  },
  noteLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  field: { marginBottom: 12 },

  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.bg,
    borderRadius: Radii.md,
    borderWidth: Strokes.thin,
    borderColor: Colors.border,
    paddingLeft: 16,
    paddingRight: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  phoneValue: { marginTop: 2 },
  note: { marginBottom: 4, paddingHorizontal: 4 },

  save: { marginTop: 20 },
});
