import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import ResultState from '@/components/ResultState';
import Icon from '@/components/Icon';
import { Colors, Radii, Spacing } from '@/constants/tokens';
import { MEMBERS } from '@/constants/affilie';

/** Le dernier entré dans le réseau. Lu depuis la source, comme le décompte :
 *  l'écran annonçait « Fatou » et « 12 affiliés » en dur, deux faits que le jeu
 *  de données ne portait pas — et Fatou était une Cliente, sortie du périmètre
 *  au recap du 30 août 2026. */
const DERNIER = MEMBERS[MEMBERS.length - 1];

// JS2 — Écran de célébration : quelqu'un a rejoint avec le code de l'Affilié Réseau.
// Atteint depuis une notification push (non câblée dans le proto).

export default function Celebration() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing[8] }]}>
      <View style={styles.body}>
        <ResultState
          ton="marque"
          titre="Votre réseau grandit !"
          corps={`${DERNIER.name} vient de rejoindre Fiw avec votre code. Vous comptez maintenant ${MEMBERS.length} affiliés.`}
        />
      </View>

      <View style={styles.footer}>
        {/* `inverse` et non `secondary` : l'écran est un aplat `primary`, et un
            contour gris à encre `textPrimary` y tombait à ~3:1. C'est le
            pendant rempli de `linkInverse`, que porte déjà « Fermer ». */}
        <Button label="Voir mon réseau" variant="inverse" onPress={() => router.replace('/affilie/reseau')} />
        <Button
          label="Fermer"
          variant="linkInverse"
          onPress={() => router.replace('/affilie/dashboard')}
          style={styles.close}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary, paddingHorizontal: Spacing[6] },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  footer: { gap: Spacing[2] },
  close: { alignSelf: 'center', paddingVertical: Spacing[3] },
});
