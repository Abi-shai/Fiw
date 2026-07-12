import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import { Colors, Radii, Poppins } from '@/constants/tokens';
import { GROUPEE_ECONOMIE, GROUPAGE_DELAI_MAX_MIN } from '@/constants/data';

export type LivraisonMode = 'express' | 'groupee';

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/[\s  ]/g, '.');

type Props = {
  /** Prix standard de la gamme (la groupée retranche l'économie). */
  base: number;
  value: LivraisonMode;
  onChange: (m: LivraisonMode) => void;
};

type OptionMeta = {
  id: LivraisonMode; icon: IconName; title: string;
  detail: string; benefit: string; benefitIcon: IconName; benefitColor: string;
};

/**
 * Proposition Option A / Option B après détection d'un groupage possible
 * (Product Doc « B — Détection automatique ») — présentée pendant la mise en
 * relation, jamais comme réglage a priori. Même grammaire visuelle que les
 * frais de rapprochement (cartes symétriques, delta en héros) : A part tout de
 * suite au prix standard, B part groupée à prix réduit dès 2 commandes
 * confirmées.
 */
export default function LivraisonModeChoice({ base, value, onChange }: Props) {
  // Writing réf. Uber Eats « Priority / Standard » : un bénéfice par ligne,
  // pas de jargon (« groupage » et « Option A/B » restent des termes internes),
  // pas de paragraphe. On dit directement ce que fait chaque option.
  const OPTIONS: OptionMeta[] = [
    {
      id: 'express', icon: 'send', title: 'Directe',
      detail: 'Part seul, sans détour',
      benefit: 'Part tout de suite', benefitIcon: 'lightning', benefitColor: Colors.primary,
    },
    {
      id: 'groupee', icon: 'group', title: 'Groupée',
      detail: `Part avec un colis voisin (${GROUPAGE_DELAI_MAX_MIN} min max)`,
      benefit: `Économisez ${fmt(GROUPEE_ECONOMIE)} F`, benefitIcon: 'coins', benefitColor: Colors.success,
    },
  ];

  return (
    <View style={styles.wrap}>
      {OPTIONS.map((o) => {
        const active = value === o.id;
        const price = o.id === 'express' ? base : base - GROUPEE_ECONOMIE;
        return (
          <TouchableOpacity
            key={o.id}
            style={[styles.card, active && styles.cardActive]}
            activeOpacity={0.9}
            onPress={() => onChange(o.id)}
          >
            <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
              <Icon name={o.icon} size={20} weight="bold" color={active ? Colors.primary : Colors.textSecondary} />
            </View>

            <View style={styles.mid}>
              <Text variant="body" style={styles.title} numberOfLines={2}>{o.title}</Text>
              <View style={[styles.benefit, { backgroundColor: active ? Colors.surface : Colors.bg }]}>
                <Icon name={o.benefitIcon} size={12} weight="bold" color={o.benefitColor} />
                <Text variant="caption" color={o.benefitColor} style={styles.benefitTxt}>{o.benefit}</Text>
              </View>
              <Text variant="caption" color={Colors.textSecondary}>
                {o.detail}
              </Text>
            </View>

            <View style={styles.right}>
              <Text variant="heading2" color={active ? Colors.primary : Colors.textPrimary}>{fmt(price)} F</Text>
              <View style={[styles.radio, active && styles.radioOn]}>
                {active && <Icon name="tick" size={13} weight="bold" color={Colors.surface} />}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* La garantie seule (Product Doc « C ») — une ligne, pas de mécanisme. */}
      <View style={styles.note}>
        <Icon name="info" size={16} weight="bold" color={Colors.textSecondary} />
        <Text variant="caption" color={Colors.textSecondary} style={styles.noteTxt}>
          Pas de colis voisin d'ici {GROUPAGE_DELAI_MAX_MIN} min ? Le vôtre part seul, au prix normal.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  cardActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bg,
  },
  iconWrapActive: { backgroundColor: Colors.surface },
  mid: { flex: 1, gap: 4 },
  title: { fontFamily: Poppins.semibold },
  benefit: {
    alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: Radii.pill,
    paddingVertical: 3, paddingHorizontal: 8,
  },
  benefitTxt: { fontFamily: Poppins.semibold },
  right: { alignItems: 'flex-end', gap: 6 },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: Colors.textDisabled,
    alignItems: 'center', justifyContent: 'center',
  },
  radioOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  note: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    padding: 12, borderRadius: Radii.md,
    backgroundColor: Colors.bg,
    marginTop: 2,
  },
  noteTxt: { flex: 1, lineHeight: 16 },
});
