import React from 'react';
import { View, StyleSheet, Share } from 'react-native';
import ScreenHeader from '@/components/ScreenHeader';
import Button from '@/components/Button';
import ScreenFooter from '@/components/ScreenFooter';
import Text from '@/components/Text';
import FauxQR from '@/components/FauxQR';
import Toast, { useToast } from '@/components/Toast';
import Hint from '@/components/Hint';
import { Colors, Radii, Spacing, Shadows } from '@/constants/tokens';
import { AMBASSADEUR } from '@/constants/affilie';

// JS2 — QR code plein écran (partage + téléchargement).

export default function QrFullScreen() {
  const toast = useToast();

  const download = () => toast.flash('QR code enregistré');

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
        <Hint align="center" style={styles.hint}>
          Faites scanner ce code pour inviter quelqu’un dans votre réseau.
        </Hint>
      </View>

      <ScreenFooter>
        <Button label="Partager" icon="share" onPress={shareCode} />
        <Button label="Télécharger" variant="secondary" icon="download" onPress={download} />
      </ScreenFooter>

      <Toast message={toast.message} opacity={toast.opacity} bottom={120} />
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

});
