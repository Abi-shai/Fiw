import React from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Radii, Strokes } from '@/constants/tokens';
import { PAY_ILLUSTRATIONS } from '@/constants/illustrations';
import ScreenHeader from '@/components/ScreenHeader';
import Callout from '@/components/Callout';
import Button from '@/components/Button';
import Text from '@/components/Text';
import {
  METHODS, usePayment, isConfigured as methodIsConfigured,
  setNumber, removeNumber, setDefault as storeSetDefault, type MethodId,
} from '@/stores/payment';

// La liste des moyens et les trois états qui les distinguent vivent désormais
// dans `stores/payment` : ils décrivent le moyen de paiement partout, pas
// seulement sur cet écran (page Compte, PaymentSheet des parcours — todo P9).
export default function PaiementScreen() {
  const insets = useSafeAreaInsets();
  const { numbers, defaultId } = usePayment();

  const isConfigured = (id: MethodId) => methodIsConfigured(id, numbers);

  const setDefault = (id: MethodId) => {
    if (id === defaultId) return;
    Haptics.selectionAsync();
    storeSetDefault(id);
  };

  const remove = (id: MethodId, label: string) =>
    Alert.alert('Retirer ce compte', `Voulez-vous retirer votre compte ${label} ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Retirer', style: 'destructive', onPress: () => removeNumber(id) },
    ]);

  // Stub proto : la saisie du numéro puis sa confirmation restent à brancher
  // (todo P10 — cf. benchmark-compte-mobbin.md § D6).
  const add = (id: MethodId, label: string) =>
    Alert.alert(`Ajouter ${label}`, 'Saisie du numéro à brancher.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Lier', onPress: () => setNumber(id, '76 ••• •• 12') },
    ]);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Moyens de paiement" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Porte l'affordance en toutes lettres : rien à l'écran ne dit qu'une
            carte se touche pour devenir le défaut (cf. D3 — les mots plutôt que
            l'affordance invisible). */}
        <Callout>
          Le moyen par défaut est pré-sélectionné à chaque commande. Touchez un moyen configuré pour le passer par défaut.
        </Callout>

        {METHODS.map(({ id, label }) => {
          const configured = isConfigured(id);
          const number = numbers[id];
          const isDefault = id === defaultId;
          // Les Espèces n'ont ni numéro ni action : leur carte n'a pas de
          // seconde ligne du tout, et n'en gagne pas en devenant défaut.
          const hasMeta = !configured || !!number;

          return (
            <View key={id} style={[styles.card, isDefault && styles.cardDefault]}>
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.6}
                onPress={configured ? () => setDefault(id) : () => add(id, label)}
              >
                {/* Logo de service : illustration à plat du registre partagé
                    (`illustrations.ts`), jamais une icône générique ni un emoji
                    (style-guide). Atténué si non configuré. */}
                <Image
                  source={PAY_ILLUSTRATIONS[id]}
                  style={[styles.logo, !configured && styles.logoDimmed]}
                />

                <View style={styles.body}>
                  {/* Ligne 1 = identité + état. L'action vit ligne 2 : c'est ce
                      qui laisse au chip la place d'écrire « Paiement par défaut »
                      en entier. `numberOfLines` sur le label pour que, même
                      serré, il tronque en « … » au lieu de passer à la ligne et
                      de faire grandir la carte. */}
                  <View style={styles.titleRow}>
                    <Text variant="bodyMedium" style={styles.label} numberOfLines={1}>{label}</Text>
                    {isDefault ? (
                      <View style={styles.tag}>
                        <Text variant="captionSemibold" color={Colors.textOnPrimary}>
                          Paiement par défaut
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {hasMeta ? (
                    <View style={styles.metaRow}>
                      <Text variant="caption" color={Colors.textTertiary} style={styles.meta} numberOfLines={1}>
                        {configured ? number : 'Aucun numéro lié'}
                      </Text>
                      {configured ? (
                        <Button label="Retirer" variant="linkDestructive" onPress={() => remove(id, label)} />
                      ) : (
                        <Button label="Ajouter" variant="link" onPress={() => add(id, label)} />
                      )}
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { paddingHorizontal: 20, paddingTop: 8 },

  // Le liseré marque l'élu — pas un fond teinté : un bleu clair posé sur le gris
  // `bg` se fond (les deux sont trop proches) et se lirait comme un trou dans la
  // carte. `borderWidth` reste identique dans les deux états : seule la couleur
  // change, sinon la carte se décalerait d'un demi-pixel en devenant défaut.
  card: {
    backgroundColor: Colors.bg,
    borderRadius: Radii.lg,
    borderWidth: Strokes.medium,
    borderColor: Colors.borderSubtle,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardDefault: { borderColor: Colors.primary },

  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  logo: { width: 34, height: 34, borderRadius: 9 },
  logoDimmed: { opacity: 0.4 },

  body: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  // `flexShrink` : c'est le label qui cède la place, jamais le chip — un chip
  // tronqué ne veut plus rien dire.
  label: { flexShrink: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  meta: { flexShrink: 1 },

  tag: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
