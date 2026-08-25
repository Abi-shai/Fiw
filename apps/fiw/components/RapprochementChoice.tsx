import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import OptionCard, { type OptionTon } from '@/components/OptionCard';
import { Colors, Radii } from '@/constants/tokens';

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
  // Le ton porte les deux : `succès` pour l'argent, `accent` pour le temps.
  benefit: string; ton: OptionTon;
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
      benefit: `Économisez ${fmt(frais)} F`, ton: 'succès',
    },
    {
      id: 'B', icon: 'lightning', title: 'Être pris en charge plus vite', wait: WAIT_B_MIN,
      benefit: `~${WAIT_DELTA} min plus tôt`, ton: 'accent',
    },
  ];

  return (
    <View style={styles.wrap}>
      {OPTIONS.map((o) => {
        const price = o.id === 'A' ? base : base + frais;
        const feeLabel = o.id === 'A' ? 'sans frais' : `+${fmt(frais)} F`;
        return (
          <OptionCard
            key={o.id}
            icon={o.icon}
            titre={o.title}
            benefice={o.benefit}
            ton={o.ton}
            meta={`Option ${o.id} · ~${o.wait} min · ${feeLabel}`}
            prix={`${fmt(price)} F`}
            actif={value === o.id}
            onPress={() => onChange(o.id)}
          />
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
  note: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    padding: 12, borderRadius: Radii.md,
    backgroundColor: Colors.bg,
    marginTop: 2,
  },
  noteTxt: { flex: 1, lineHeight: 16 },
});
