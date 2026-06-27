import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { MOCK_MODE, PARTENAIRE, CLIENTS_SAUVEGARDES } from '@/constants/data-partenaire';

export default function CommanderScreen() {
  const isPending = MOCK_MODE === 'pending';

  if (isPending) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Commander</Text>
        </View>
        <View style={styles.blockedContainer}>
          <View style={styles.blockedCard}>
            <Ionicons name="lock-closed-outline" size={32} color={Colors.textTertiary} />
            <Text style={styles.blockedTitle}>Disponible après activation</Text>
            <Text style={styles.blockedSub}>
              Cette fonctionnalité sera accessible dès la validation de votre Point Express.
            </Text>
            <TouchableOpacity
              style={styles.blockedLink}
              onPress={() => router.push('/(partenaire)/accueil')}
            >
              <Text style={styles.blockedLinkLabel}>Voir mon suivi de validation</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Commander</Text>
        <Text style={styles.subtitle}>Départ fixe : {PARTENAIRE.pointExpress}</Text>
      </View>

      <TouchableOpacity
        style={styles.newClientBtn}
        onPress={() => router.push('/commander/nouveau')}
        activeOpacity={0.85}
      >
        <View style={styles.newClientIcon}>
          <Ionicons name="add" size={22} color={Colors.white} />
        </View>
        <Text style={styles.newClientLabel}>Nouveau client</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
      </TouchableOpacity>

      {CLIENTS_SAUVEGARDES.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={40} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>Aucun client encore</Text>
          <Text style={styles.emptySub}>
            Appuyez sur "Nouveau client" pour lancer votre première course
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          <Text style={styles.listLabel}>Clients récents</Text>
          {CLIENTS_SAUVEGARDES.map((client) => (
            <TouchableOpacity
              key={client.id}
              style={styles.clientRow}
              onPress={() =>
                router.push({
                  pathname: '/commander/confirmation',
                  params: {
                    clientId: client.id,
                    nom: client.nom,
                    telephone: client.telephone,
                    destination: client.derniere_destination,
                  },
                })
              }
              activeOpacity={0.8}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{client.nom[0]}</Text>
              </View>
              <View style={styles.clientInfo}>
                <Text style={styles.clientNom}>{client.nom}</Text>
                <Text style={styles.clientDest} numberOfLines={1}>{client.derniere_destination}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },

  newClientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Colors.primarySubtle,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  newClientIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  newClientLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.primary },

  list: { paddingHorizontal: 20, paddingBottom: 32 },
  listLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 },

  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primarySubtle,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  clientInfo: { flex: 1 },
  clientNom: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  clientDest: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  blockedContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  blockedCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  blockedTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  blockedSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  blockedLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.primarySubtle,
    borderRadius: 10,
  },
  blockedLinkLabel: { fontSize: 13, fontWeight: '600', color: Colors.primary },
});
