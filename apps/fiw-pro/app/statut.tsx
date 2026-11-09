import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '@/components/ScreenHeader';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import ProgressBar from '@/components/ProgressBar';
import StepList from '@/components/StepList';
import Hint from '@/components/Hint';
import { Colors, Radii, Spacing, Strokes } from '@/constants/tokens';
import { STATUT } from '@/constants/data';

const fmt = (v: number, format: 'nombre' | 'note') =>
  format === 'note' ? v.toLocaleString('fr-FR') : v.toLocaleString('fr-FR');

/**
 * **Statut prestataire.**
 *
 * La forme vient de Bolt — « valeur actuelle (seuil exigé) », en rangées, sans
 * graphique. Elle dit d'un coup où l'on est et ce qui est demandé.
 *
 * ⚠️ **Et c'est ici que Fiw s'écarte du corpus, délibérément.** Bolt met en
 * tête de ses conditions un « Acceptance rate 88 % (85 % min) », et le répète
 * en tuile sur son accueil. `CONTEXT.md` l'interdit : le **Score de
 * coopération** est *« un mécanisme algorithmique interne et invisible pour le
 * prestataire »*, et il *« n'empêche jamais un prestataire de travailler »*.
 * La liste de fonctionnalités va plus loin — elle demande une formulation
 * positive, **sans mention de pénalité**.
 *
 * Le Statut ne dépend donc que de deux choses, celles que `CONTEXT.md` nomme :
 * le **nombre de courses** et la **note moyenne reçue**. Si un taux
 * d'acceptation apparaît un jour sur cet écran, ce sera une régression, pas
 * une amélioration — et il faudra d'abord changer `CONTEXT.md`.
 *
 * ── Ce que le statut DONNE, avant ce qu'il demande ────────────────────────
 * Les avantages sont posés avant les conditions. Un palier qui commence par
 * ses exigences se lit comme un examen ; celui qui commence par ce qu'il
 * ouvre se lit comme une offre — et c'est ce qu'il est.
 */
export default function Statut() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.page}>
      <ScreenHeader title="Statut prestataire" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.medaille}>
            <Icon name="star" size={32} weight="fill" color={Colors.brandYellow} />
          </View>
          <Text variant="display">{STATUT.actuel}</Text>
          <Text variant="bodySmall" color={Colors.textSecondary}>
            Votre statut actuel
          </Text>
        </View>

        <Text variant="heading2" style={styles.titre}>Ce qu'il vous donne</Text>
        <StepList
          style={styles.avantages}
          items={STATUT.avantages.map((a) => ({ icon: 'check' as const, body: a }))}
        />

        <Text variant="heading2" style={styles.titre}>Pour passer {STATUT.suivant}</Text>
        <View style={styles.conditions}>
          {STATUT.conditions.map((c, i) => {
            const atteint = c.valeur >= c.seuil;
            return (
              <View key={c.label}>
                {i > 0 && <View style={styles.filet} />}
                <View style={styles.condition}>
                  <View style={styles.conditionTete}>
                    <Text variant="label" style={styles.flex1}>{c.label}</Text>
                    {/* « valeur (seuil) » — motif Bolt. Le seuil entre
                        parenthèses, en gris : c'est la règle, pas le score. */}
                    <Text variant="infoValue" color={atteint ? Colors.successInk : Colors.textPrimary}>
                      {fmt(c.valeur, c.format)}
                    </Text>
                    <Text variant="bodySmall" color={Colors.textSecondary}>
                      {' '}/ {fmt(c.seuil, c.format)}
                    </Text>
                  </View>
                  <ProgressBar value={Math.min(1, c.valeur / c.seuil)} />
                </View>
              </View>
            );
          })}
        </View>

        <Hint icon="info" style={styles.note}>
          Le statut dépend du nombre de courses et de la note que vos Clients
          vous donnent. Refuser une course ne le fait jamais baisser.
        </Hint>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing[4], paddingTop: Spacing[2] },
  flex1: { flex: 1 },

  hero: { alignItems: 'center', paddingVertical: Spacing[6], gap: Spacing[1] },
  medaille: {
    width: 72, height: 72, borderRadius: Radii.pill,
    backgroundColor: Colors.brandYellowSubtle,
    borderWidth: Strokes.thin, borderColor: Colors.brandYellow100,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing[2],
  },

  titre: { marginTop: Spacing[6], marginBottom: Spacing[3] },
  avantages: {},

  conditions: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: Strokes.thin, borderColor: Colors.borderSubtle,
    paddingHorizontal: Spacing[4],
  },
  condition: { paddingVertical: Spacing[4], gap: Spacing[2] },
  conditionTete: { flexDirection: 'row', alignItems: 'baseline' },
  filet: { height: Strokes.thin, backgroundColor: Colors.borderSubtle },

  note: { marginTop: Spacing[5] },
});
