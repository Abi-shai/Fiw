import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Button from '@/components/Button';
import ResultState from '@/components/ResultState';
import ScreenFooter from '@/components/ScreenFooter';
import Callout from '@/components/Callout';
import { Colors, Spacing } from '@/constants/tokens';

// JS3 — Le retrait n'est pas passé : diagnostiquer, puis rassurer.
//
// ── Passe du 27 septembre 2026 ─────────────────────────────────────────────
// **L'encart de réassurance était BLEU** — fond `primarySubtle`, rayon `md`,
// icône `info` en bleu marque. C'est exactement ce que la répartition des rôles
// du style guide interdit : « le bleu marque un état, le jaune appelle
// l'attention ; un encart explicatif est donc jaune, jamais bleu — en bleu, il
// entrerait en concurrence avec les éléments dont il parle ». Et sur cet
// écran-ci il entrait en concurrence avec le CTA « Réessayer ».
// Il devient le `Callout` du système, jaune, avec sa pastille à glyphe sombre.
export default function RetraitEchec() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.page, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing[8] }]}>
      <View style={styles.body}>
        <ResultState
          ton="erreur"
          titre="Retrait impossible"
          corps="Le numéro Mobile Money semble invalide. Vérifiez-le et réessayez."
        >
          {/* `alignSelf: stretch` : `ResultState` centre ses enfants, un encart
              pleine largeur doit dire qu'il en prend toute la largeur. */}
          <Callout icon="shield" style={styles.callout}>
            Rassurez-vous : l’argent n’a pas quitté votre Wallet.
          </Callout>
        </ResultState>
      </View>

      <ScreenFooter>
        <Button label="Réessayer" onPress={() => router.replace('/affilie/retrait-recap')} />
        <Button
          label="Contacter le support"
          variant="secondary"
          icon="lifebuoy"
          onPress={() => Haptics.selectionAsync()}
        />
        <Button label="Retour à l’Affiliation" variant="link" onPress={() => router.replace('/affilie/dashboard')} />
      </ScreenFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg, paddingHorizontal: Spacing[6] },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  callout: { alignSelf: 'stretch', marginTop: Spacing[4], marginBottom: 0 },
});
