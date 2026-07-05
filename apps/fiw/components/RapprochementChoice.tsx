import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import { Colors, Radii, Poppins } from '@/constants/tokens';

export type OptId = 'A' | 'B';

// Délais d'illustration (le matching réel viendra du back-end).
const WAIT_A_MIN = 12;
const WAIT_B_MIN = 4;
const WAIT_DELTA = WAIT_A_MIN - WAIT_B_MIN; // temps gagné en choisissant l'Option B

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/[\s  ]/g, '.');

type Props = {
  /** Prix de base de la course (sans frais). */
  base: number;
  /** Montant des frais de rapprochement (Option B). */
  frais: number;
  value: OptId;
  onChange: (o: OptId) => void;
};

type OptionMeta = {
  id: OptId; icon: IconName; title: string; wait: number;
  // « Bénéfice » distinctif de l'option — le cœur de l'arbitrage, rendu
  // scannable et symétrique : A fait gagner de l'argent, B fait gagner du temps.
  benefit: string; benefitIcon: IconName; benefitColor: string;
};

/**
 * Choix « frais de rapprochement » présenté quand le prestataire libre le plus
 * proche dépasse la zone gratuite (arbitrage Temps ⇄ Prix). Deux cartes qui
 * mettent le DELTA en avant (économie ⇄ temps gagné) — symétriques, aucune n'est
 * marquée « recommandée » : le choix reste au Client. Une note explique CE QU'EST
 * le frais de rapprochement pour lever l'ambiguïté.
 * Termes « Option A / B » et « frais de rapprochement » canoniques (imposés) ;
 * jamais imposé au Client (3 conditions terrain : prix total, choix binaire,
 * temps estimé).
 */
export default function RapprochementChoice({ base, frais, value, onChange }: Props) {
  const OPTIONS: OptionMeta[] = [
    {
      id: 'A', icon: 'hourglass', title: 'Attendre un prestataire proche', wait: WAIT_A_MIN,
      benefit: `Économisez ${fmt(frais)} F`, benefitIcon: 'coins', benefitColor: Colors.success,
    },
    {
      id: 'B', icon: 'lightning', title: 'Être pris en charge plus vite', wait: WAIT_B_MIN,
      benefit: `~${WAIT_DELTA} min plus tôt`, benefitIcon: 'lightning', benefitColor: Colors.primary,
    },
  ];

  return (
    <View style={styles.wrap}>
      {OPTIONS.map((o) => {
        const active = value === o.id;
        const price = o.id === 'A' ? base : base + frais;
        const feeLabel = o.id === 'A' ? 'sans frais' : `+${fmt(frais)} F`;
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
              {/* Bénéfice distinctif — le point saillant de l'arbitrage. */}
              <View style={[styles.benefit, { backgroundColor: active ? Colors.surface : Colors.bg }]}>
                <Icon name={o.benefitIcon} size={12} weight="bold" color={o.benefitColor} />
                <Text variant="caption" color={o.benefitColor} style={styles.benefitTxt}>{o.benefit}</Text>
              </View>
              <Text variant="caption" color={Colors.textSecondary}>
                Option {o.id} · ~{o.wait} min · {feeLabel}
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

      {/* Explication du concept : ce qu'est le frais de rapprochement (le point
          qui manquait de clarté). Statique — n'explique plus « l'option courante »
          mais le mécanisme lui-même. */}
      <View style={styles.note}>
        <Icon name="info" size={16} weight="bold" color={Colors.textSecondary} />
        <Text variant="caption" color={Colors.textSecondary} style={styles.noteTxt}>
          Les frais de rapprochement couvrent le trajet d'un prestataire plus éloigné jusqu'à vous. En patientant, vous ne payez aucun frais.
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
