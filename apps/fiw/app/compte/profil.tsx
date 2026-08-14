import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radii, Outfit } from '@/constants/tokens';
import ScreenHeader from '@/components/ScreenHeader';
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
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert('Photo', 'Choix de la photo à venir dans le proto.')}
          >
            <Text variant="label" color={Colors.primary} style={styles.photoBtn}>Modifier la photo</Text>
          </TouchableOpacity>
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
          <Text variant="caption" color={Colors.textSecondary} style={styles.noteHint}>
            Moyenne des évaluations reçues de vos prestataires. Le détail par course reste privé.
          </Text>
        </View>

        {/* Nom — éditable inline */}
        <View style={styles.field}>
          <Text variant="caption" color={Colors.textTertiary}>Nom complet</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
        </View>

        {/* Téléphone — champ protégé : la modification passe par une vérification SMS */}
        <View style={styles.phoneRow}>
          <View style={styles.flex1}>
            <Text variant="caption" color={Colors.textTertiary}>Téléphone</Text>
            <Text variant="body" style={styles.phoneValue} numberOfLines={1}>{phone}</Text>
          </View>
          <Button
            variant="link"
            size="sm"
            label="Modifier"
            trailingIcon="chevronRight"
            onPress={() => router.push('/compte/numero')}
          />
        </View>
        <View style={styles.infoRow}>
          <Icon name="shield" size={13} color={Colors.textTertiary} />
          <Text variant="caption" color={Colors.textTertiary}>
            Un code de vérification est envoyé par SMS avant tout changement.
          </Text>
        </View>

        <Button label="Enregistrer" onPress={save} disabled={!dirty} style={styles.save} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  flex1: { flex: 1 },

  photoWrap: { alignItems: 'center', gap: 10, marginBottom: 24 },
  photoBtn: { paddingVertical: 4 },

  noteCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: 16,
    gap: 10,
    marginBottom: 24,
  },
  noteLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  noteHint: { lineHeight: 16 },

  field: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
  },
  input: { fontSize: 15, color: Colors.textPrimary, fontFamily: Outfit.medium, marginTop: 2, padding: 0 },

  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingLeft: 16,
    paddingRight: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  phoneValue: { marginTop: 2, fontFamily: Outfit.medium },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4, paddingHorizontal: 4 },

  save: { marginTop: 20 },
});
