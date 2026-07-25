import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { PARTENAIRE } from '@/constants/data-partenaire';

const CHAUFFEUR = {
  nom: 'Alioune Badara Cissé',
  note: 4.8,
  vehicule: 'Toyota Corolla',
  immat: 'DK-4521-AB',
};

export default function EnCoursScreen() {
  const { nom, destination } = useLocalSearchParams<{ nom: string; destination: string }>();
  const [canCancel, setCanCancel] = useState(true);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setCanCancel(false);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Course en cours</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Chauffeur */}
        <View style={styles.chauffeurCard}>
          <View style={styles.chauffeurAvatar}>
            <Text style={styles.chauffeurAvatarText}>{CHAUFFEUR.nom[0]}</Text>
          </View>
          <View style={styles.chauffeurInfo}>
            <Text style={styles.chauffeurNom}>{CHAUFFEUR.nom}</Text>
            <View style={styles.noteRow}>
              <Ionicons name="star" size={12} color={Colors.warning} />
              <Text style={styles.noteText}>{CHAUFFEUR.note}</Text>
              <Text style={styles.vehiculeText}>· {CHAUFFEUR.vehicule}</Text>
            </View>
            <Text style={styles.immatText}>{CHAUFFEUR.immat}</Text>
          </View>
        </View>

        {/* Trajet */}
        <View style={styles.trajetCard}>
          <Text style={styles.trajetLabel}>Client</Text>
          <Text style={styles.trajetClient}>{nom}</Text>
          <View style={styles.trajetSeparator} />
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.routeText} numberOfLines={1}>{PARTENAIRE.pointExpress}</Text>
          </View>
          <View style={styles.routeLineV} />
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: Colors.error }]} />
            <Text style={styles.routeText} numberOfLines={1}>{destination}</Text>
          </View>
        </View>

        {/* ETA */}
        <View style={styles.etaCard}>
          <Ionicons name="time-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.etaText}>Arrivée estimée dans 12 minutes</Text>
        </View>
      </View>

      <View style={styles.footer}>
        {canCancel ? (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.push('/(partenaire)/commander')}
          >
            <Text style={styles.cancelLabel}>Annuler ({countdown}s)</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => router.push('/(partenaire)/accueil')}
          >
            <Text style={styles.doneBtnLabel}>Retour au tableau de bord</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.successSubtle,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  statusText: { fontSize: 14, fontWeight: '700', color: Colors.success },

  content: { flex: 1, paddingHorizontal: 20, gap: 12 },

  chauffeurCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chauffeurAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primarySubtle,
    justifyContent: 'center', alignItems: 'center',
  },
  chauffeurAvatarText: { fontSize: 20, fontWeight: '700', color: Colors.primary },
  chauffeurInfo: { flex: 1 },
  chauffeurNom: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  noteText: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  vehiculeText: { fontSize: 12, color: Colors.textSecondary },
  immatText: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },

  trajetCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trajetLabel: { fontSize: 11, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', marginBottom: 4 },
  trajetClient: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  trajetSeparator: { height: 1, backgroundColor: Colors.borderSubtle, marginBottom: 12 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeLineV: { width: 2, height: 14, backgroundColor: Colors.border, marginLeft: 4, marginVertical: 3 },
  routeText: { flex: 1, fontSize: 13, fontWeight: '500', color: Colors.textPrimary },

  etaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  etaText: { fontSize: 14, color: Colors.textSecondary },

  footer: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelBtn: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelLabel: { fontSize: 15, fontWeight: '700', color: Colors.error },
  doneBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnLabel: { fontSize: 15, fontWeight: '700', color: Colors.white },
});
