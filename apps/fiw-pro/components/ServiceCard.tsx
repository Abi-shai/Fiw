import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radii, Spacing, Strokes } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import { gammeIllustration, illoSize, type IlluKey } from '@/constants/illustrations';

/**
 * **Carte de service à activer.**
 *
 * Ce que le Prestataire choisit ici, ce n'est pas une course : c'est un
 * **métier** qu'il va exercer, et un dossier de pièces qu'il va monter.
 *
 * ── Pourquoi pas `GammeCard`, pourquoi pas `OptionCard` ───────────────────
 * Le benchmark avait conclu « réemployer `GammeCard` » (D9) ; c'était faux, et
 * l'écriture l'a montré. Les deux cartes de choix du système exigent un
 * **prix** — `GammeCard` est label + ETA + prix, `OptionCard` est bénéfice +
 * prix. Le prix y est l'objet du choix. Ici il n'y a ni prix ni ETA : il y a
 * un métier et ce qu'il rapporte en général. Leur passer un prix factice pour
 * réemployer la coquille, ce serait garder la forme en perdant ce qu'elle
 * mesure — exactement l'erreur que le style guide consigne à propos des deux
 * propositions du Menu Client.
 *
 * ── L'élu se marque au LISERÉ, jamais à l'aplat ───────────────────────────
 * Règle du style guide : `primary-subtle` et le fond de page `bg` sont trop
 * proches ; l'élément teinté se fond au lieu de ressortir et se lit comme un
 * trou. Le liseré `primary` tranche quel que soit le fond.
 *
 * La carte reprend en revanche l'anatomie de `GammeCard` — plateforme teintée,
 * illustration du jeu `mobility option`, débord assumé de l'illustration
 * au-dessus de sa plateforme — pour que les deux apps montrent visiblement la
 * même famille d'objets.
 */
export default function ServiceCard({ label, argument, illu, selected, onPress }: {
  label: string;
  /** Ce que le service fait gagner, en une ligne. C'est ce qui décide. */
  argument: string;
  illu: IlluKey;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.carte, selected && styles.carteElue]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.plateforme}>
        <Image source={gammeIllustration(illu)} style={illoSize(illu)} resizeMode="contain" />
      </View>

      <View style={styles.texte}>
        <Text variant="cardTitle">{label}</Text>
        <Text variant="bodySmall" color={Colors.textSecondary}>{argument}</Text>
      </View>

      {/* La coche n'apparaît qu'à l'élu : un cercle vide sur les non-élus
          ferait un contrôle de formulaire là où la carte entière est déjà la
          cible. Le liseré suffit à dire lequel est choisi. */}
      {selected && (
        <View style={styles.coche}>
          <Icon name="tick" size={14} weight="bold" color={Colors.textOnPrimary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  carte: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: Strokes.medium,
    borderColor: Colors.border,
    padding: Spacing[3],
  },
  carteElue: { borderColor: Colors.primary },

  // Plateforme de l'illustration, reprise de `GammeCard` : l'illustration y
  // déborde volontairement vers le haut, elle n'est pas contenue.
  plateforme: {
    width: 84, height: 60,
    borderRadius: Radii.md,
    backgroundColor: Colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'visible',
  },
  texte: { flex: 1, gap: 2 },

  coche: {
    width: 22, height: 22, borderRadius: Radii.pill,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
});
