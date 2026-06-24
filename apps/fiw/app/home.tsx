import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView
} from 'react-native';
import { router } from 'expo-router';
import LeafletMap from '@/components/LeafletMap';
import { Colors } from '@/constants/colors';
import { DAKAR_CENTER } from '@/constants/data';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <LeafletMap
        center={DAKAR_CENTER}
        zoom={13}
        markers={[]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topBar}>
          <View style={styles.logoSmall}>
            <Text style={styles.logoText}>fiw</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSheet}>
          <View style={styles.handle} />
          <Text style={styles.greeting}>Bonjour, Amadou 👋</Text>
          <Text style={styles.question}>Où voulez-vous aller ?</Text>

          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => router.push('/transport/destination')}
            activeOpacity={0.9}
          >
            <View style={styles.searchDot} />
            <Text style={styles.searchPlaceholder}>Saisir une destination…</Text>
          </TouchableOpacity>

          <View style={styles.services}>
            {[
              { icon: '🚗', label: 'Transport' },
              { icon: '📦', label: 'Livraison' },
              { icon: '🔑', label: 'Location' },
              { icon: '🔧', label: 'Assistance' },
            ].map((s) => (
              <TouchableOpacity
                key={s.label}
                style={styles.serviceChip}
                onPress={() => s.label === 'Transport' && router.push('/transport/destination')}
                activeOpacity={0.8}
              >
                <Text style={styles.serviceIcon}>{s.icon}</Text>
                <Text style={styles.serviceLabel}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  logoSmall: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  logoText: { color: Colors.white, fontWeight: '800', fontSize: 16, letterSpacing: -0.5 },
  profileBtn: {
    width: 40, height: 40,
    backgroundColor: Colors.white,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileIcon: { fontSize: 18 },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  handle: {
    width: 40, height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  greeting: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  question: { fontSize: 22, fontWeight: '700', color: Colors.black, marginBottom: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 20,
  },
  searchDot: {
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginRight: 12,
  },
  searchPlaceholder: { fontSize: 15, color: Colors.textTertiary },
  services: { flexDirection: 'row', gap: 10 },
  serviceChip: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceIcon: { fontSize: 22 },
  serviceLabel: { fontSize: 11, fontWeight: '600', color: Colors.black },
});
