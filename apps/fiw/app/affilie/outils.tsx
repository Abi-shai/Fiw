import React from 'react';
import { View, StyleSheet, ScrollView, Share } from 'react-native';
import { router } from 'expo-router';
import ScreenHeader from '@/components/ScreenHeader';
import Button from '@/components/Button';
import Text from '@/components/Text';
import FauxQR from '@/components/FauxQR';
import Toast, { useToast } from '@/components/Toast';
import Hint from '@/components/Hint';
import { Colors, Radii, SectionLabel, Spacing, Strokes } from '@/constants/tokens';
import { AFFILIE_RESEAU, SHARE_MESSAGE } from '@/constants/affilie';

// JS2 — Mes outils : le QR et le code, les deux façons de recruter.
//
// ── Passe du 27 septembre 2026 ─────────────────────────────────────────────
// · Les deux cartes **perdent leur ombre**. `Shadows.sm` était le seul de la
//   section : les cartes du tableau de bord et du réseau (`List carte`) se
//   tiennent au liseré `borderSubtle` seul. Une ombre sur une page grise ne
//   sépare rien de plus qu'un liseré, elle ajoute un registre.
// · **« Afficher en grand » devient un vrai `Button variant="link"`**, et la
//   carte cesse d'être tappable : l'écran avait deux affordances pour une seule
//   action, dont une fausse (une rangée icône + texte bleu peinte à la main).
export default function Outils() {
  const toast = useToast();

  const copyCode = () => {
    // Proto : la copie réelle (expo-clipboard) sera câblée plus tard.
    toast.flash('Code copié');
  };

  const shareCode = async () => {
    try {
      await Share.share({ message: SHARE_MESSAGE });
    } catch {
      /* annulé par l'utilisateur */
    }
  };

  return (
    <View style={styles.page}>
      <ScreenHeader title="Mes outils" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <FauxQR size={180} />
          <Button
            label="Afficher en grand"
            variant="link"
            size="sm"
            icon="qr"
            onPress={() => router.push('/affilie/qr')}
          />
        </View>

        <View style={styles.card}>
          <Text variant="caption" color={Colors.textTertiary} style={styles.kicker}>Votre code</Text>
          {/* `letterSpacing: 2` assumé, et pour le même motif que `PlateChip` :
              un code se lit caractère par caractère, la chasse élargie EST le
              motif. Signalé dans le §« Ce qui reste hors échelle » du style
              guide plutôt que laissé en dur sans explication. */}
          <Text variant="display" style={styles.code}>{AFFILIE_RESEAU.code}</Text>
          <View style={styles.actions}>
            <Button label="Copier" variant="secondary" size="md" icon="copy" onPress={copyCode} style={styles.flex1} />
            <Button label="Partager" size="md" icon="share" onPress={shareCode} style={styles.flex1} />
          </View>
        </View>

        <Hint icon="info">
          Quand un prestataire s’inscrit avec ce code, chaque course qu’il réalise
          vous rapporte 2 %.
        </Hint>
      </ScrollView>

      <Toast message={toast.message} opacity={toast.opacity} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing[4], paddingBottom: Spacing[8], gap: Spacing[4] },
  flex1: { flex: 1 },

  // Même habillage que les cartes de `List style_="carte"` : surface, rayon
  // `lg`, liseré `borderSubtle`. Aucune ombre.
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: Strokes.thin,
    borderColor: Colors.borderSubtle,
    alignItems: 'center',
    padding: Spacing[6],
    gap: Spacing[4],
  },
  kicker: { ...SectionLabel, alignSelf: 'flex-start' },
  code: { letterSpacing: 2, alignSelf: 'flex-start', marginTop: -Spacing[2] },
  actions: { flexDirection: 'row', gap: Spacing[3], alignSelf: 'stretch' },
});
