import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenHeader from '@/components/ScreenHeader';
import ScreenFooter from '@/components/ScreenFooter';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import List from '@/components/List';
import ListRow from '@/components/ListRow';
import Medallion from '@/components/Medallion';
import Callout from '@/components/Callout';
import StepList from '@/components/StepList';
import { Colors, Radii, Spacing, Strokes } from '@/constants/tokens';
import { SERVICES, type EtatPiece, type Piece } from '@/constants/activation';

/** Ce que chaque état dit, et de quelle encre. Les quatre tiennent dans le
 *  sous-titre de la rangée : la liste n'a donc aucune pastille — même règle
 *  que l'écran des dossiers. */
const ETAT: Record<EtatPiece, { texte: string; encre: string; icone: 'add' | 'hourglass' | 'check' | 'close' }> = {
  manquante: { texte: 'À déposer',              encre: Colors.primary,       icone: 'add' },
  deposee:   { texte: 'Fiw vérifie',            encre: Colors.textSecondary, icone: 'hourglass' },
  valide:    { texte: 'Validée',                encre: Colors.successInk,    icone: 'check' },
  refusee:   { texte: 'Refusée — à refaire',    encre: Colors.warningInk,    icone: 'close' },
  expire:    { texte: 'Expirée — à renouveler', encre: Colors.warningInk,    icone: 'close' },
};

/**
 * **Les pièces d'un service, et comment les prendre en photo.**
 *
 * Uber est le seul du corpus à expliquer **comment** faire la photo — note
 * d'avertissement, trois règles numérotées, exemple montré, puis le bouton.
 * C'est pourtant le point où une activation échoue en vrai : la pièce est
 * refusée, le Prestataire ne sait pas pourquoi, il recommence à l'identique.
 *
 * D'où la consigne portée par **chaque** pièce (`constants/activation.ts`) et
 * non une consigne générale : « les deux faces, à plat, sans reflet » ne
 * s'applique pas à une photo de véhicule.
 *
 * ⚠️ **Une pièce refusée dit POURQUOI.** C'est la seule information qui change
 * quelque chose, et c'est celle que les refus administratifs omettent
 * systématiquement. Elle est en `warningInk` et non en `error` : le dossier
 * n'est pas perdu, il demande une action — le rouge dirait l'inverse.
 */
export default function PieceScreen() {
  const params = useLocalSearchParams<{ service?: string; piece?: string }>();
  const service = SERVICES.find((s) => s.id === params.service) ?? SERVICES[0];
  const ciblee = service.pieces.find((p) => p.id === params.piece);

  // Sans pièce ciblée, l'écran liste le dossier. Avec, il ouvre le dépôt.
  if (!ciblee) {
    return (
      <View style={styles.page}>
        <ScreenHeader title={service.label} />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <List title="Pièces du dossier" style_="carte" inset={64}>
            {service.pieces.map((p) => (
              <ListRow
                key={p.id}
                leading={<Medallion icon="document" size="sm" ton={p.etat === 'manquante' || p.etat === 'refusee' ? 'accent' : 'neutre'} />}
                title={p.label}
                subtitle={p.note ?? ETAT[p.etat].texte}
                subtitleAccent={p.etat === 'manquante'}
                onPress={() => router.setParams({ service: service.id, piece: p.id })}
              />
            ))}
          </List>
        </ScrollView>
      </View>
    );
  }

  const etat = ETAT[ciblee.etat];

  return (
    <View style={styles.page}>
      <ScreenHeader title={ciblee.label} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {ciblee.note && (
          <Callout icon="info">{ciblee.note}</Callout>
        )}

        <Text variant="heading2">Ce que Fiw attend</Text>
        <Text variant="body" color={Colors.textSecondary} style={styles.consigne}>
          {ciblee.consigne}
        </Text>

        {/* Les trois règles qui font refuser une pièce, dans l'ordre où elles
            se vérifient en prenant la photo. `StepList` est le composant du
            système pour un texte qui passe à la ligne — une rangée se tronque,
            un paragraphe respire. */}
        <StepList
          style={styles.regles}
          items={[
            { icon: 'search', title: 'Tout doit être lisible', body: 'Les quatre coins dans le cadre, aucun texte coupé.' },
            { icon: 'lightning', title: 'Évitez les reflets', body: "À l'ombre ou sous une lumière douce, jamais au flash direct." },
            { icon: 'shield', title: 'Pas de photocopie', body: 'Photographiez le document original, pas un écran ni une copie.' },
          ]}
        />

        <View style={styles.etatRow}>
          <Icon name={etat.icone} size={16} weight="bold" color={etat.encre} />
          <Text variant="bodySmall" color={etat.encre}>{etat.texte}</Text>
        </View>
      </ScrollView>

      <ScreenFooter rule>
        <Button
          label={ciblee.etat === 'manquante' ? 'Prendre la photo' : 'Reprendre la photo'}
          icon="device"
          onPress={() => router.back()}
        />
        <Button label="Choisir dans ma galerie" variant="secondary" onPress={() => router.back()} />
      </ScreenFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing[4], paddingTop: Spacing[2], paddingBottom: Spacing[8] },
  consigne: { marginTop: Spacing[2] },
  regles: { marginTop: Spacing[6] },
  etatRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[2],
    marginTop: Spacing[6],
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: Strokes.thin, borderColor: Colors.borderSubtle,
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[3],
  },
});
