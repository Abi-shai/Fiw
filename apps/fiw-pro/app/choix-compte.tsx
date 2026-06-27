import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function CompteCard({
  icon,
  titre,
  description,
  onPress,
  primary,
}: {
  icon: IoniconsName;
  titre: string;
  description: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.card, primary && styles.cardPrimary]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.cardIcon, primary && styles.cardIconPrimary]}>
        <Ionicons name={icon} size={28} color={primary ? Colors.white : Colors.primary} />
      </View>
      <View style={styles.cardText}>
        <Text style={[styles.cardTitre, primary && styles.cardTitrePrimary]}>{titre}</Text>
        <Text style={[styles.cardDesc, primary && styles.cardDescPrimary]}>{description}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={primary ? 'rgba(255,255,255,0.6)' : Colors.textTertiary}
      />
    </TouchableOpacity>
  );
}

export default function ChoixCompteScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>fiw</Text>
            <Text style={styles.logoPro}>pro</Text>
          </View>
          <Text style={styles.title}>Quel est votre espace ?</Text>
          <Text style={styles.subtitle}>
            Choisissez votre type de compte pour accéder à votre espace
          </Text>
        </View>

        <View style={styles.cards}>
          <CompteCard
            icon="car-outline"
            titre="Prestataire"
            description="Chauffeur ou livreur — recevez et gérez vos missions"
            onPress={() => router.replace('/dashboard')}
          />
          <CompteCard
            icon="storefront-outline"
            titre="Affilié Partenaire"
            description="Commerce ou entreprise — commandez pour vos clients depuis votre Point Express"
            onPress={() => router.replace('/(partenaire)/accueil')}
            primary
          />
        </View>

        <Text style={styles.note}>
          Le type de compte est défini à l'inscription et ne peut pas être changé
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1, padding: 24, justifyContent: 'center', gap: 32 },

  header: { alignItems: 'center', gap: 12 },
  logo: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 8,
  },
  logoText: { fontSize: 26, fontWeight: '800', color: Colors.white, letterSpacing: -1 },
  logoPro: {
    fontSize: 11, fontWeight: '700', color: Colors.primaryLight,
    marginLeft: 3, marginBottom: 3, letterSpacing: 1,
  },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  cards: { gap: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cardPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cardIcon: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: Colors.primarySubtle,
    justifyContent: 'center', alignItems: 'center',
  },
  cardIconPrimary: { backgroundColor: 'rgba(255,255,255,0.2)' },
  cardText: { flex: 1 },
  cardTitre: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 3 },
  cardTitrePrimary: { color: Colors.white },
  cardDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  cardDescPrimary: { color: 'rgba(255,255,255,0.75)' },

  note: {
    fontSize: 12, color: Colors.textTertiary,
    textAlign: 'center', lineHeight: 16,
  },
});
