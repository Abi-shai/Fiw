import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Colors, Radii, SectionLabel, Shadows, Spacing, Strokes } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import type { CommandeEnCours } from '@/stores/commandes';

/**
 * Hauteur d'une bannière — **déterminée, pas mesurée**. L'accueil s'en sert pour
 * poser le bloc au-dessus de l'arête de la feuille ; une mesure au `onLayout`
 * vaudrait 0 au premier rendu et la bannière sauterait d'une frame.
 *
 * 16 (padding) + 15 (`captionMedium`) + 2 + 28 (`heading1`) + 2 + 18
 * (`bodySmall`) + 16 (padding) = **97**, la hauteur du relevé Figma.
 */
export const BANNER_HEIGHT = 97;

/** Écart entre deux bannières empilées (Course + Livraison). */
export const BANNER_GAP = Spacing[2];

/**
 * Bannière de Commande en cours — la carte qui flotte SUR la carto, au-dessus
 * de la feuille d'accueil (maquette `T1`, Figma 948:425).
 *
 * C'est un **élément flottant sur la carte** au sens du style guide : liseré
 * `hairline` + `Shadows.float`, jamais l'un sans l'autre. L'ombre seule
 * disparaît sur une zone claire de la carto, le liseré seul ne décolle pas.
 *
 * Elle ne se ferme pas et ne se balaie pas : tant qu'une Commande tourne, elle
 * reste — c'est le seul fil qui relie l'accueil à ce qui se passe. Elle mène à
 * l'écran de suivi, exactement comme la tuile du même service.
 *
 * Trois lignes, trois rôles :
 *   • l'état, en capitales et en bleu de marque — il dit QUE quelque chose tourne ;
 *   • l'échéance, en `heading1` — c'est la seule chose qu'on relit vraiment ;
 *   • le prestataire et son véhicule, en secondaire — qui vient, et avec quoi.
 *
 * ⚠️ Écart au relevé, assumé : la maquette peint le titre en `#000000` pur, qui
 * n'est pas un jeton. On prend `textPrimary` (#1A1A1A), le noir de texte du
 * système — c'est la valeur la plus proche, et celle de tous les autres titres.
 */
export default function CommandeBanner({ commande, onPress }: {
  commande: CommandeEnCours;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.texte}>
        <Text variant="captionMedium" color={Colors.primary} style={SectionLabel}>
          {commande.etat}
        </Text>
        <Text variant="heading1" numberOfLines={1}>{commande.titre}</Text>
        <Text variant="bodySmall" color={Colors.textSecondary} numberOfLines={1}>
          {commande.prestataire} · {commande.vehicule}
        </Text>
      </View>
      <Icon name="chevronRight" size={18} color={Colors.textPrimary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    backgroundColor: Colors.surface,
    // `lg` et non `card` : le palier `card` (20) est celui des cartes POSÉES
    // dans une feuille. Celle-ci flotte sur la carto, comme le bandeau de
    // recherche de `transport/searching`, qui est déjà en `lg`.
    borderRadius: Radii.lg,
    borderWidth: Strokes.hairline,
    borderColor: Colors.hairline,
    padding: Spacing[4],
    ...Shadows.float,
  },
  // Gouttière de 2 : sous 4 px le style guide ne pose pas de jeton — c'est un
  // réglage optique interne au composant, pas du rythme de mise en page.
  texte: { flex: 1, gap: 2 },
});
