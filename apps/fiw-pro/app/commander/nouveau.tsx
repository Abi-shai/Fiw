import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { PARTENAIRE } from '@/constants/data-partenaire';

export default function NouveauClientScreen() {
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [destination, setDestination] = useState('');

  const isValid = nom.trim() && telephone.trim() && destination.trim();

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Nouveau client</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Départ fixe */}
          <View style={styles.departBox}>
            <View style={styles.departDot} />
            <View>
              <Text style={styles.departLabel}>Départ (fixe)</Text>
              <Text style={styles.departValue}>{PARTENAIRE.pointExpress}</Text>
            </View>
          </View>

          {/* Formulaire */}
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Nom du client</Text>
              <TextInput
                style={styles.input}
                value={nom}
                onChangeText={setNom}
                placeholder="Ex. Fatou Diallo"
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={telephone}
                onChangeText={setTelephone}
                placeholder="+221 77 000 00 00"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Destination</Text>
              <TextInput
                style={styles.input}
                value={destination}
                onChangeText={setDestination}
                placeholder="Ex. Plateau — Avenue Léopold Sédar Senghor"
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueBtn, !isValid && styles.continueBtnDisabled]}
            onPress={() =>
              isValid &&
              router.push({
                pathname: '/commander/confirmation',
                params: { nom, telephone, destination },
              })
            }
            activeOpacity={isValid ? 0.85 : 1}
          >
            <Text style={styles.continueBtnLabel}>Voir le prix</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  topTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: Colors.textPrimary },

  scroll: { padding: 20, paddingBottom: 8 },

  departBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.primarySubtle,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  departDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  departLabel: { fontSize: 11, color: Colors.primary, fontWeight: '600', marginBottom: 2 },
  departValue: { fontSize: 14, fontWeight: '600', color: Colors.primary },

  form: { gap: 16 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  input: {
    height: 52,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    fontSize: 15,
    color: Colors.textPrimary,
  },

  footer: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  continueBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnLabel: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
