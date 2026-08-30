import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Colors, Radii, Strokes } from '@/constants/tokens';
import Text from '@/components/Text';
import PlateChip from '@/components/PlateChip';
import PrestataireRow, { type Prestataire } from '@/components/PrestataireRow';
import { gammeIllustration, type IlluKey } from '@/constants/illustrations';

/** Bloc véhicule (Figma 163:811) — cadre `track` : modèle·couleur + plaque +
 *  rendu. `art` remplace le rendu image quand le véhicule n'a pas
 *  d'illustration (ex. Vélo Express, rendu en icône). Interne au groupe : aucun
 *  écran ne l'utilise seul. */
function VehicleBlock({ prestataire, illu, art }: {
  prestataire: Prestataire; illu?: IlluKey; art?: React.ReactNode;
}) {
  return (
    <View style={styles.vehicleBlock}>
      <View style={styles.vehicleCol}>
        <Text variant="label" color={Colors.textSecondary} numberOfLines={1}>
          {prestataire.vehicle} · {prestataire.color}
        </Text>
        <PlateChip plate={prestataire.plate} />
      </View>
      <View style={styles.vehicleRender}>
        {art ?? (
          <Image source={gammeIllustration(illu ?? 'auto')} style={styles.vehicleRenderImg} resizeMode="contain" />
        )}
      </View>
    </View>
  );
}

/** Groupe véhicule + prestataire (Figma 156:847) — cadre `surfaceAlt`. */
export default function VehicleGroup({ prestataire, illu, art, onPress }: {
  prestataire: Prestataire; illu?: IlluKey; art?: React.ReactNode; onPress?: () => void;
}) {
  return (
    <View style={styles.vehicleGroup}>
      <VehicleBlock prestataire={prestataire} illu={illu} art={art} />
      <View style={styles.rowInset}>
        <PrestataireRow prestataire={prestataire} onPress={onPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  vehicleBlock: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.track,
    borderRadius: Radii.card,
    paddingVertical: 8, paddingHorizontal: 12,
  },
  vehicleCol: { flex: 1, gap: 6 },
  rowInset: { paddingHorizontal: 8 },
  vehicleRender: {
    width: 64, height: 52, borderRadius: Radii.md,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  // 48 et non 56 : les illustrations `mobility option` sont rognées au plus près
  // du dessin, donc `contain` les fait remplir la boîte — à 56 le véhicule
  // dépassait les 52 de hauteur du cadre et se faisait rogner.
  vehicleRenderImg: { width: 48, height: 48 },
  vehicleGroup: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.card,
    borderWidth: Strokes.thin, borderColor: Colors.borderSubtle,
    // Sans padding : le VehicleBlock affleure le liseré du groupe, c'est ce que
    // montre la maquette. L'interstice de 4 laisse voir le `surfaceAlt` entre le
    // bloc véhicule et la rangée prestataire, qui elle est en retrait de 8.
    gap: 4,
  },
});
