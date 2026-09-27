import React from 'react';
import { View, StyleSheet, Share } from 'react-native';
import ScreenHeader from '@/components/ScreenHeader';
import Button from '@/components/Button';
import ScreenFooter from '@/components/ScreenFooter';
import Text from '@/components/Text';
import FauxQR from '@/components/FauxQR';
import Toast, { useToast } from '@/components/Toast';
import Hint from '@/components/Hint';
import { Colors, Radii, Spacing, Strokes } from '@/constants/tokens';
import { AFFILIE_RESEAU, SHARE_MESSAGE } from '@/constants/affilie';

// JS2 — Le QR en grand, à faire scanner.
//
// Passe du 27 septembre 2026 : la carte était en **rayon `xl` (28)**, palier
// réservé aux bottom sheets et aux modales — elle passe en `lg` comme toutes
// les cartes de la section — et perd son `Shadows.md` au profit du liseré
// `borderSubtle`, le seul habillage de carte de l'Affiliation.
export default function QrFullScreen() {
  const toast = useToast();

  const download = () => toast.flash('QR code enregistré');

  const shareCode = async () => {
    try {
      await Share.share({ message: SHARE_MESSAGE });
    } catch {
      /* annulé */
    }
  };

  return (
    <View style={styles.page}>
      <ScreenHeader title="Mon QR code" />
      <View style={styles.body}>
        <View style={styles.qrCard}>
          <FauxQR size={260} />
        </View>
        <Text variant="heading2" style={styles.name}>{AFFILIE_RESEAU.name}</Text>
        <Text variant="body" color={Colors.textSecondary}>Code {AFFILIE_RESEAU.code}</Text>
        <Hint align="center" style={styles.hint}>
          Faites scanner ce code pour inviter un prestataire dans votre réseau.
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
  page: { flex: 1, backgroundColor: Colors.bg },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing[6], gap: Spacing[2] },
  qrCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: Strokes.thin,
    borderColor: Colors.borderSubtle,
    padding: Spacing[8],
    marginBottom: Spacing[6],
  },
  name: { marginTop: Spacing[2] },
  hint: { marginTop: Spacing[4], maxWidth: 280 },
});
