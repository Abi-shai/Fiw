import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import { Colors, Radii, Poppins, Shadows } from '@/constants/tokens';

export type OptId = 'A' | 'B';

// Délais d'illustration (le matching réel viendra du back-end).
const ATTENTE_A = '~12 min';
const ATTENTE_B = '~4 min';

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/[\s  ]/g, '.');

type Props = {
  /** Prix de base de la course (sans frais). */
  base: number;
  /** Montant des frais de rapprochement (Option B). */
  frais: number;
  value: OptId;
  onChange: (o: OptId) => void;
};

/**
 * Choix « frais de rapprochement » présenté quand aucun chauffeur n'est tout
 * proche (axe Temps ⇄ Argent). Bascule binaire Option A / Option B + un encart
 * qui explique le choix courant. Termes « Option A / B » canoniques (imposés) ;
 * jamais imposé au Client (3 conditions de la recherche terrain : prix total,
 * choix binaire, temps estimé).
 */
export default function RapprochementChoice({ base, frais, value, onChange }: Props) {
  const isB = value === 'B';
  return (
    <View>
      <View style={styles.switch}>
        {(['A', 'B'] as OptId[]).map((id) => {
          const active = value === id;
          const price = id === 'A' ? base : base + frais;
          return (
            <TouchableOpacity
              key={id}
              style={[styles.seg, active && styles.segActive]}
              activeOpacity={0.9}
              onPress={() => onChange(id)}
            >
              <View style={styles.segHead}>
                <Icon name={id === 'A' ? 'hourglass' : 'lightning'} size={16} weight="bold"
                  color={active ? Colors.primary : Colors.textSecondary} />
                <Text variant="caption" color={active ? Colors.primary : Colors.textSecondary}>
                  {id === 'A' ? ATTENTE_A : ATTENTE_B}
                </Text>
              </View>
              <Text variant="label" style={styles.segPrice}
                color={active ? Colors.primary : Colors.textPrimary}>{fmt(price)} F</Text>
              <Text variant="caption" color={Colors.textSecondary}>
                {id === 'A' ? 'Sans frais' : `+${fmt(frais)} F`}
              </Text>
              {/* Étiquette canonique imposée */}
              <Text variant="caption" style={styles.segTag}
                color={active ? Colors.primary : Colors.textTertiary}>Option {id}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Explication qui suit le choix : le « pourquoi » du frais. */}
      <View style={[styles.explain, isB && styles.explainB]}>
        <Icon name={isB ? 'lightning' : 'hourglass'} size={18} weight="bold"
          color={isB ? Colors.primary : Colors.textSecondary} />
        <Text variant="caption" color={Colors.textSecondary} style={styles.explainTxt}>
          {isB
            ? `Un chauffeur plus éloigné se rapproche de vous. Les frais couvrent ce trajet d'approche — pour gagner du temps.`
            : `Vous patientez le temps qu'un chauffeur proche se libère. Aucun frais de rapprochement.`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  switch: { flexDirection: 'row', gap: 6, backgroundColor: '#F2F3F5', borderRadius: Radii.lg, padding: 6 },
  seg: { flex: 1, borderRadius: Radii.md, paddingVertical: 12, paddingHorizontal: 12, gap: 4, backgroundColor: 'transparent' },
  segActive: { backgroundColor: Colors.surface, ...Shadows.sm },
  segHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  segPrice: { fontFamily: Poppins.semibold, fontSize: 16 },
  segTag: { marginTop: 2, fontFamily: Poppins.medium },
  explain: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 12, padding: 12, borderRadius: Radii.md, backgroundColor: Colors.bg },
  explainB: { backgroundColor: Colors.primarySubtle },
  explainTxt: { flex: 1, lineHeight: 16 },
});
