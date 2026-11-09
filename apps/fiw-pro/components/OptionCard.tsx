import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radii, Strokes } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import Radio from '@/components/Radio';

/** Le ton est celui du BÉNÉFICE, pas de la carte : `succès` quand l'option fait
 *  gagner de l'argent, `accent` quand elle fait gagner du temps. Le glyphe est
 *  solidaire du ton — il ne se choisit pas. */
export type OptionTon = 'succès' | 'accent';

const TON: Record<OptionTon, { icon: IconName; encre: string }> = {
  succès: { icon: 'coins', encre: Colors.success },
  accent: { icon: 'lightning', encre: Colors.primary },
};

type Props = {
  /** Glyphe de tête, propre à l'option (sablier, éclair, envoi, groupe). */
  icon: IconName;
  titre: string;
  /** La phrase saillante — « Économisez 350 F », « ~8 min plus tôt ». */
  benefice: string;
  ton?: OptionTon;
  /** Ligne de contexte sous le bénéfice. */
  meta: string;
  /** Prix déjà formaté. */
  prix: string;
  actif: boolean;
  onPress: () => void;
};

/**
 * Carte de choix entre deux options qui s'arbitrent — frais de rapprochement
 * (attendre ⇄ payer), mode de livraison (directe ⇄ groupée).
 *
 * Un seul composant pour les deux : `RapprochementChoice` et
 * `LivraisonModeChoice` rendaient exactement la même carte, seul le contenu
 * changeait. La maquette les avait déjà fusionnés ; le code suit.
 *
 * Ce qui porte l'arbitrage, c'est le **bénéfice** — pas le prix, pas le titre.
 * D'où sa pilule, son glyphe et sa couleur, et d'où le fait qu'aucune des deux
 * options n'est marquée « recommandée » : le choix reste au Client.
 */
export default function OptionCard({
  icon, titre, benefice, ton = 'succès', meta, prix, actif, onPress,
}: Props) {
  const t = TON[ton];
  return (
    <TouchableOpacity
      style={[styles.card, actif && styles.cardActive]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={[styles.iconWrap, actif && styles.iconWrapActive]}>
        <Icon name={icon} size={20} weight="bold" color={actif ? Colors.primary : Colors.textSecondary} />
      </View>

      <View style={styles.mid}>
        <Text variant="cardTitle" numberOfLines={2}>{titre}</Text>
        <View style={[styles.benefit, actif && styles.benefitActive]}>
          <Icon name={t.icon} size={12} weight="bold" color={t.encre} />
          <Text variant="captionSemibold" color={t.encre}>{benefice}</Text>
        </View>
        <Text variant="caption" color={Colors.textSecondary}>{meta}</Text>
      </View>

      <View style={styles.right}>
        <Text variant="heading2" color={actif ? Colors.primary : Colors.textPrimary}>{prix}</Text>
        <Radio selected={actif} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: Radii.lg,
    borderWidth: Strokes.medium,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  cardActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },
  iconWrap: {
    width: 40, height: 40, borderRadius: Radii.pill,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bg,
  },
  iconWrapActive: { backgroundColor: Colors.surface },
  mid: { flex: 1, gap: 4 },
  // La pilule du bénéfice s'éclaircit quand la carte s'assombrit : elle garde
  // son détachement dans les deux états.
  benefit: {
    alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: Radii.pill,
    paddingVertical: 3, paddingHorizontal: 8,
    backgroundColor: Colors.bg,
  },
  benefitActive: { backgroundColor: Colors.surface },
  right: { alignItems: 'flex-end', gap: 6 },
});
