import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { PARTENAIRE } from '@/constants/data-partenaire';

const PRIX_ESTIME = 1850;

export default function ConfirmationCourseScreen() {
  const { nom, telephone, destination } = useLocalSearchParams<{
    nom: string;
    telephone: string;
    destination: string;
  }>();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Confirmation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Client */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Client</Text>
          <View style={styles.clientRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{nom?.[0] ?? '?'}</Text>
            </View>
            <View>
              <Text style={styles.clientNom}>{nom}</Text>
              <Text style={styles.clientTel}>{telephone}</Text>
            </View>
          </View>
        </View>

        {/* Trajet */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Trajet</Text>
          <View style={styles.routeBox}>
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeSubLabel}>Départ (fixe)</Text>
                <Text style={styles.routeText}>{PARTENAIRE.pointExpress}</Text>
              </View>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: Colors.error }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeSubLabel}>Destination</Text>
                <Text style={styles.routeText}>{destination}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Prix */}
        <View style={styles.prixCard}>
          <Text style={styles.prixLabel}>Prix total estimé</Text>
          <Text style={styles.prixValue}>{PRIX_ESTIME.toLocaleString('fr-FR')} F CFA</Text>
          <Text style={styles.prixNote}>Payé par le client à la fin de la course</Text>
        </View>

        <View style={styles.smsNote}>
          <Ionicons name="chatbubble-ellipses-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.smsNoteText}>
            Un SMS sera envoyé automatiquement à {nom} pour l'informer de la course
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryBtnLabel}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() =>
            router.push({
              pathname: '/commander/recherche',
              params: { nom, destination },
            })
          }
        >
          <Text style={styles.primaryBtnLabel}>Lancer la course</Text>
        </TouchableOpacity>
      </View>
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

  scroll: { padding: 20, gap: 16, paddingBottom: 8 },

  section: { gap: 8 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },

  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primarySubtle,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  clientNom: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  clientTel: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  routeBox: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  routeDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  routeLine: { width: 2, height: 16, backgroundColor: Colors.border, marginLeft: 4, marginVertical: 4 },
  routeSubLabel: { fontSize: 11, color: Colors.textTertiary, marginBottom: 2 },
  routeText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },

  prixCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  prixLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6 },
  prixValue: { fontSize: 30, fontWeight: '800', color: Colors.white },
  prixNote: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },

  smsNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  smsNoteText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 16 },

  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  secondaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnLabel: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  primaryBtn: {
    flex: 2,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnLabel: { fontSize: 15, fontWeight: '700', color: Colors.white },
});
