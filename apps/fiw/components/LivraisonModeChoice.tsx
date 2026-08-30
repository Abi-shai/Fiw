import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import OptionCard, { type OptionTon } from '@/components/OptionCard';
import { Colors, Radii } from '@/constants/tokens';
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
  // Le ton porte le bénéfice : `accent` pour le temps gagné, `succès` pour
  // l'argent économisé.
  detail: string; benefit: string; ton: OptionTon;
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
      benefit: 'Part tout de suite', ton: 'accent',
    },
    {
      id: 'groupee', icon: 'group', title: 'Groupée',
      detail: `Part avec un colis voisin (${GROUPAGE_DELAI_MAX_MIN} min max)`,
      benefit: `Économisez ${fmt(GROUPEE_ECONOMIE)} F`, ton: 'succès',
    },
  ];

  return (
    <View style={styles.wrap}>
      {OPTIONS.map((o) => {
        const active = value === o.id;
        const price = o.id === 'express' ? base : base - GROUPEE_ECONOMIE;
        return (
          <OptionCard
            key={o.id}
            icon={o.icon}
            titre={o.title}
            benefice={o.benefit}
            ton={o.ton}
            meta={o.detail}
            prix={`${fmt(price)} F`}
            actif={active}
            onPress={() => onChange(o.id)}
          />
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
  note: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    padding: 12, borderRadius: Radii.md,
    backgroundColor: Colors.bg,
    marginTop: 2,
  },
  noteTxt: { flex: 1, lineHeight: 16 },
});
