import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '@/components/ScreenHeader';
import Text from '@/components/Text';
import Divider from '@/components/Divider';
import List from '@/components/List';
import ListRow from '@/components/ListRow';
import Medallion from '@/components/Medallion';
import Hint from '@/components/Hint';
import InfoRow from '@/components/InfoRow';
import { Colors, Radii, SectionLabel, Spacing, Strokes } from '@/constants/tokens';
import { COMMISSION_RATE, COURSES_JOUR, fcfa } from '@/constants/data';

/**
 * **Mes gains.**
 *
 * La forme vient de Heetch, la plus claire du corpus : un grand chiffre, puis
 * **le détail ligne à ligne de sa composition**. Mais ce que le chiffre
 * désigne n'est pas le même, et c'est tout l'enjeu.
 *
 * Chez Heetch, Bolt ou Uber, le grand chiffre est ce que la plateforme **doit**
 * au chauffeur et finira par lui verser — d'où « NET = take home earnings » et
 * un bouton pour encaisser. Chez Fiw, il n'y a rien à verser : le Client a
 * déjà payé le Prestataire, directement. Le chiffre est donc **ce qu'il a
 * encaissé**, pas ce qu'il attend. Il n'y a aucun bouton au bas de cet écran,
 * et c'est normal.
 *
 * ── Espèces et Mobile Money sont séparés ──────────────────────────────────
 * La distinction n'est pas comptable, elle est pratique : les espèces sont en
 * poche, le Mobile Money a pu ne pas encore arriver. C'est la seule ventilation
 * qui change quelque chose pour le Prestataire aujourd'hui.
 *
 * ── La commission apparaît, mais pas dans le total ────────────────────────
 * Elle est rappelée en bas, hors du calcul, parce qu'elle **ne se soustrait
 * pas** de ces gains — elle est prélevée sur le Wallet. La soustraire ici
 * referait exactement l'erreur de l'écran de clôture de juin.
 */
export default function Gains() {
  const insets = useSafeAreaInsets();

  const total = COURSES_JOUR.reduce((s, c) => s + c.prix, 0);
  const especes = COURSES_JOUR.filter((c) => c.paiement === 'espèces').reduce((s, c) => s + c.prix, 0);
  const momo = total - especes;
  const commission = Math.round(total * COMMISSION_RATE);

  return (
    <View style={styles.page}>
      <ScreenHeader title="Mes gains" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text variant="caption" color={Colors.textTertiary} style={styles.kicker}>
            ENCAISSÉ AUJOURD'HUI
          </Text>
          <Text variant="displayXl">{fcfa(total)}</Text>
          <Text variant="bodySmall" color={Colors.textSecondary}>
            {COURSES_JOUR.length} courses
          </Text>
        </View>

        <View style={styles.ventilation}>
          <View style={styles.ligne}><InfoRow label="En espèces" value={fcfa(especes)} /></View>
          <Divider inset={0} />
          <View style={styles.ligne}><InfoRow label="En Mobile Money" value={fcfa(momo)} /></View>
        </View>

        <View style={styles.commission}>
          <View style={styles.ligne}>
            <InfoRow
              label={`Commission Fiw (${Math.round(COMMISSION_RATE * 100)} %)`}
              value={`−${fcfa(commission)}`}
            />
          </View>
        </View>
        <Hint icon="info">
          Déjà prélevée sur votre Wallet — elle n'est pas retirée des montants
          ci-dessus, que vous avez encaissés en entier.
        </Hint>

        <List title="Courses du jour" style_="carte" inset={64} style={styles.liste}>
          {COURSES_JOUR.map((c) => (
            <ListRow
              key={c.id}
              leading={<Medallion icon={c.paiement === 'espèces' ? 'coins' : 'device'} size="sm" />}
              title={c.trajet}
              subtitle={`${c.heure} · ${c.paiement}`}
              trailing={<Text variant="infoValue">{fcfa(c.prix)}</Text>}
            />
          ))}
        </List>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing[4], paddingTop: Spacing[2] },
  // `InfoRow` est à plat par contrat : la respiration vient du conteneur.
  ligne: { paddingVertical: Spacing[3] },

  hero: { alignItems: 'center', paddingVertical: Spacing[6], gap: Spacing[1] },
  kicker: { ...SectionLabel },

  ventilation: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: Strokes.thin, borderColor: Colors.borderSubtle,
    paddingHorizontal: Spacing[4],
  },

  commission: {
    backgroundColor: Colors.bg,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing[4],
    marginTop: Spacing[3], marginBottom: Spacing[2],
  },

  liste: { marginTop: Spacing[6] },
});
