import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/tokens';
import Icon, { type IconName } from '@/components/Icon';
import Text from '@/components/Text';
import ActionPill from '@/components/ActionPill';

/** Carte itinéraire — deux rangées « icône + libellé + valeur » séparées par un
 *  filet en retrait de 32 (icône 20 + gouttière 12). Miroir du composant Figma
 *  `RouteCard` (441:93).
 *
 *  Libellés Départ/Arrivée et icônes `walk` puis `flag` par défaut — le
 *  pictogramme du piéton dit le point de départ du CLIENT, pas le véhicule qui
 *  vient le chercher (maquette 350:2704). Transport et Livraison la partagent
 *  depuis la fusion du 16 août ; aucun écran n'a à surcharger `icons`.
 *
 *  Ne fait que **restituer** un itinéraire déjà renseigné : la pilule
 *  « Modifier » renvoie à l'écran de saisie. Il n'y a donc pas d'état incomplet.
 *  C'est bien un `ActionPill` et non une icône crayon nue — la maquette tranche
 *  ce désaccord de longue date.
 *
 *  La présentation encadrée (rail vertical dans un cadre `surfaceAlt`) est
 *  retirée le 24 août 2026 : aucun écran ne l'utilisait. */
export default function RouteCard({ departure, destination, labels, icons, onEdit }: {
  departure: string; destination: string;
  /** Libellés des deux points (défaut Départ/Arrivée ; Livraison : Collecte/Livraison). */
  labels?: { from: string; to: string };
  /** Icônes du rail (défaut walk/flag). */
  icons?: { from: IconName; to: IconName };
  onEdit?: () => void;
}) {
  const Wrapper: React.ComponentType<any> = onEdit ? TouchableOpacity : View;
  return (
    <Wrapper style={styles.route} activeOpacity={onEdit ? 0.85 : 1} onPress={onEdit} disabled={!onEdit}>
      <View style={styles.row}>
        <Icon name={icons?.from ?? 'walk'} size={20} weight="bold" color={Colors.gray700} />
        <View style={styles.col}>
          <Text variant="bodySmall" color={Colors.textSecondary}>
            {labels?.from ?? 'Départ'}
          </Text>
          <Text variant="label" numberOfLines={1}>{departure}</Text>
        </View>
        {onEdit && <ActionPill label="Modifier" onPress={onEdit} />}
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Icon name={icons?.to ?? 'flag'} size={20} weight="bold" color={Colors.gray700} />
        <View style={styles.col}>
          <Text variant="bodySmall" color={Colors.textSecondary}>
            {labels?.to ?? 'Arrivée'}
          </Text>
          <Text variant="label" numberOfLines={1}>{destination}</Text>
        </View>
      </View>
    </Wrapper>
  );
}

// Hauteur de la maquette : deux rangées de 38 (18 + 2 + 18, les interlignes des
// variantes `bodySmall` et `label`) séparées par 12 de part et d'autre du filet,
// plus 8 de marge haute et basse = 117.
const styles = StyleSheet.create({
  route: { paddingVertical: 8, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  col: { flex: 1, gap: 2 },
  divider: { height: 1, backgroundColor: Colors.borderSubtle, marginLeft: 32 },
});
