import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
  TextInput, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { PARTENAIRE, PRESTATAIRES_FAVORIS } from '@/constants/data-partenaire';

export default function ProfilScreen() {
  const [showAddCode, setShowAddCode] = useState(false);
  const [code, setCode] = useState('');

  const handleAjouter = () => {
    if (code.trim().length < 5) {
      Alert.alert('Code invalide', 'Vérifiez le code prestataire et réessayez.');
      return;
    }
    Alert.alert('Prestataire ajouté', `Le prestataire ${code.toUpperCase()} a été ajouté à vos favoris.`);
    setCode('');
    setShowAddCode(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
        </View>

        {/* Infos partenaire */}
        <View style={styles.infoCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{PARTENAIRE.nom[0]}</Text>
          </View>
          <View style={styles.infoText}>
            <Text style={styles.infoNom}>{PARTENAIRE.nom}</Text>
            <Text style={styles.infoGerant}>{PARTENAIRE.gerant}</Text>
            <Text style={styles.infoPoint}>{PARTENAIRE.pointExpress}</Text>
          </View>
        </View>

        {/* Mon QR code */}
        <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/qrcode')}>
          <Ionicons name="qr-code-outline" size={20} color={Colors.primary} />
          <Text style={styles.menuLabel}>Mon QR code Point Express</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
        </TouchableOpacity>

        {/* Prestataires favoris */}
        <Text style={styles.sectionTitle}>Prestataires favoris</Text>

        {PRESTATAIRES_FAVORIS.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Ajoutez vos chauffeurs habituels par leur code prestataire pour les retrouver facilement
            </Text>
          </View>
        ) : (
          PRESTATAIRES_FAVORIS.map((p) => (
            <View key={p.id} style={styles.prestaRow}>
              <View style={styles.prestaAvatar}>
                <Text style={styles.prestaAvatarText}>{p.nom[0]}</Text>
              </View>
              <View style={styles.prestaInfo}>
                <Text style={styles.prestaNom}>{p.nom}</Text>
                <Text style={styles.prestaType}>{p.type}</Text>
              </View>
              <View style={styles.noteRow}>
                <Ionicons name="star" size={12} color={Colors.warning} />
                <Text style={styles.noteText}>{p.note}</Text>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddCode(!showAddCode)}
        >
          <Ionicons name="add" size={18} color={Colors.primary} />
          <Text style={styles.addBtnLabel}>Ajouter par code prestataire</Text>
        </TouchableOpacity>

        {showAddCode && (
          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>Code prestataire (format FIW-XXXXX)</Text>
            <TextInput
              style={styles.codeInput}
              value={code}
              onChangeText={setCode}
              placeholder="FIW-AB34X"
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.validerBtn} onPress={handleAjouter}>
              <Text style={styles.validerLabel}>Ajouter</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Séparateur */}
        <View style={styles.separator} />

        {/* Mes informations */}
        <TouchableOpacity style={styles.menuRow}>
          <Ionicons name="create-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.menuLabel}>Mes informations</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
        </TouchableOpacity>

        {/* Support */}
        <TouchableOpacity style={styles.menuRow}>
          <Ionicons name="help-circle-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.menuLabel}>Support</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
        </TouchableOpacity>

        {/* Déconnexion */}
        <TouchableOpacity style={styles.menuRow}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={[styles.menuLabel, styles.menuLabelDanger]}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primarySubtle,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  infoText: { flex: 1 },
  infoNom: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  infoGerant: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  infoPoint: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },

  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  menuLabelDanger: { color: Colors.error },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  prestaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    gap: 12,
  },
  prestaAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.bg,
    borderWidth: 1, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  prestaAvatarText: { fontSize: 15, fontWeight: '700', color: Colors.textSecondary },
  prestaInfo: { flex: 1 },
  prestaNom: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  prestaType: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  noteText: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  addBtnLabel: { fontSize: 14, fontWeight: '600', color: Colors.primary },

  codeBox: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  codeLabel: { fontSize: 12, color: Colors.textSecondary },
  codeInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  validerBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  validerLabel: { fontSize: 14, fontWeight: '700', color: Colors.white },

  separator: { height: 8, backgroundColor: Colors.bg, marginVertical: 8 },

  emptyState: { paddingHorizontal: 20, paddingVertical: 14 },
  emptyText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
});
