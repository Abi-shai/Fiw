import React, { useRef, useState } from 'react';
import { View, StyleSheet, Share, Animated } from 'react-native';
import ScreenHeader from '@/components/ScreenHeader';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import FauxQR from '@/components/FauxQR';
import * as Haptics from 'expo-haptics';
import { Colors, Radii, Spacing, Shadows } from '@/constants/tokens';
import { AMBASSADEUR } from '@/constants/affilie';

// JS2 — QR code plein écran (partage + téléchargement).

export default function QrFullScreen() {
  const [toast, setToast] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const download = () => {
    setToast(true);
    Haptics.selectionAsync();
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(1300),
      Animated.timing(toastOpacity, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start(() => setToast(false));
  };

  const shareCode = async () => {
    try {
      await Share.share({
        message: `Rejoins-moi sur Fiw avec mon code ${AMBASSADEUR.code} !`,
      });
    } catch {
      /* annulé */
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Mon QR code" />
      <View style={styles.body}>
        <View style={styles.qrCard}>
          <FauxQR size={260} />
        </View>
        <Text variant="heading2" style={styles.name}>{AMBASSADEUR.name}</Text>
        <Text variant="body" color={Colors.textSecondary}>Code {AMBASSADEUR.code}</Text>
        <Text variant="bodySmall" color={Colors.textTertiary} align="center" style={styles.hint}>
          Faites scanner ce code pour inviter quelqu’un dans votre réseau.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button label="Partager" icon="share" onPress={shareCode} />
        <Button label="Télécharger" variant="secondary" icon="download" onPress={download} />
      </View>

      {toast && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]} pointerEvents="none">
          <Icon name="tick" size={16} color={Colors.textOnPrimary} weight="bold" />
          <Text variant="label" color={Colors.textOnPrimary}>QR code enregistré</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing[6], gap: Spacing[2] },
  qrCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    padding: Spacing[8],
    marginBottom: Spacing[6],
    ...Shadows.md,
  },
  name: { marginTop: Spacing[2] },
  hint: { marginTop: Spacing[4], maxWidth: 280 },

  footer: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[8],
    gap: Spacing[3],
  },
  toast: {
    position: 'absolute',
    bottom: 120,
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
