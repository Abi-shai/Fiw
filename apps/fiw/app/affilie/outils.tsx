import React, { useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Share, Animated } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import ScreenHeader from '@/components/ScreenHeader';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import FauxQR from '@/components/FauxQR';
import { Colors, Radii, Spacing, Shadows, Poppins } from '@/constants/tokens';
import { AMBASSADEUR } from '@/constants/affilie';

// JS2 — Mes Outils : QR code, code perso (copie + partage natif).

export default function Outils() {
  const [toast, setToast] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const flashToast = (msg: string) => {
    setToast(msg);
    Haptics.selectionAsync();
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(1300),
      Animated.timing(toastOpacity, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start(() => setToast(null));
  };

  const copyCode = () => {
    // Proto : la copie réelle (expo-clipboard) sera câblée plus tard.
    flashToast('Code copié');
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

        <View style={styles.help}>
          <Icon name="info" size={18} color={Colors.textSecondary} />
          <Text variant="bodySmall" color={Colors.textSecondary} style={styles.helpText}>
            Quand quelqu’un s’inscrit avec ce code, chaque course qu’il fait vous rapporte 2 %.
          </Text>
        </View>
      </ScrollView>

      {toast && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]} pointerEvents="none">
          <Icon name="tick" size={16} color={Colors.textOnPrimary} weight="bold" />
          <Text variant="label" color={Colors.textOnPrimary}>{toast}</Text>
        </Animated.View>
      )}
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
    borderWidth: 1,
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
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: Spacing[6],
    ...Shadows.sm,
  },
  kicker: { textTransform: 'uppercase', letterSpacing: 0.8 },
  code: { letterSpacing: 2, marginTop: Spacing[1], marginBottom: Spacing[4] },
  codeActions: { flexDirection: 'row', gap: Spacing[3] },

  help: { flexDirection: 'row', gap: Spacing[2], alignItems: 'flex-start', paddingHorizontal: Spacing[1] },
  helpText: { flex: 1 },

  toast: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: Radii.pill,
  },
});
