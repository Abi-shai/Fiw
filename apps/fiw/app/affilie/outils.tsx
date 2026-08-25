import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { router } from 'expo-router';
import ScreenHeader from '@/components/ScreenHeader';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import FauxQR from '@/components/FauxQR';
import Toast, { useToast } from '@/components/Toast';
import Hint from '@/components/Hint';
import { Colors, Radii, Spacing, Shadows, Outfit, Strokes } from '@/constants/tokens';
import { AMBASSADEUR } from '@/constants/affilie';

// JS2 — Mes Outils : QR code, code perso (copie + partage natif).

export default function Outils() {
  const toast = useToast();

  const copyCode = () => {
    // Proto : la copie réelle (expo-clipboard) sera câblée plus tard.
    toast.flash('Code copié');
  };

  const shareCode = async () => {
    try {
      await Share.share({
        message: `Rejoins-moi sur Fiw avec mon code ${AMBASSADEUR.code} et commande ta première course !`,
      });
    } catch {
      /* annulé par l'utilisateur */
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Mes outils" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* QR code */}
        <TouchableOpacity
          style={styles.qrCard}
          activeOpacity={0.9}
          onPress={() => router.push('/affilie/qr')}
        >
          <FauxQR size={180} />
          <View style={styles.qrHint}>
            <Icon name="qr" size={16} color={Colors.primary} />
            <Text variant="label" color={Colors.primary}>Afficher en grand</Text>
          </View>
        </TouchableOpacity>

        {/* Code perso */}
        <View style={styles.codeCard}>
          <Text variant="caption" color={Colors.textTertiary} style={styles.kicker}>VOTRE CODE</Text>
          <Text variant="display" style={styles.code}>{AMBASSADEUR.code}</Text>
          <View style={styles.codeActions}>
            <Button label="Copier" variant="secondary" size="md" icon="copy" onPress={copyCode} style={styles.flex1} />
            <Button label="Partager" size="md" icon="share" onPress={shareCode} style={styles.flex1} />
          </View>
        </View>

        <Hint icon="info" style={styles.help}>
          Quand quelqu’un s’inscrit avec ce code, chaque course qu’il fait vous rapporte 2 %.
        </Hint>
      </ScrollView>

      <Toast message={toast.message} opacity={toast.opacity} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing[4], paddingBottom: Spacing[8], gap: Spacing[4] },
  flex1: { flex: 1 },

  qrCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: Strokes.thin,
    borderColor: Colors.borderSubtle,
    alignItems: 'center',
    paddingVertical: Spacing[8],
    gap: Spacing[4],
    ...Shadows.sm,
  },
  qrHint: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  codeCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: Strokes.thin,
    borderColor: Colors.borderSubtle,
    padding: Spacing[6],
    ...Shadows.sm,
  },
  kicker: { textTransform: 'uppercase', letterSpacing: 0.8 },
  code: { letterSpacing: 2, marginTop: Spacing[1], marginBottom: Spacing[4] },
  codeActions: { flexDirection: 'row', gap: Spacing[3] },

  help: { paddingHorizontal: Spacing[1] },

});
