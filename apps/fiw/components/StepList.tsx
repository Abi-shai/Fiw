import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Colors, Spacing } from '@/constants/tokens';
import Text from '@/components/Text';
import Medallion, { type MedallionTon } from '@/components/Medallion';
import { type IconName } from '@/components/Icon';

export type StepItem = {
  icon: IconName;
  /** Facultatif : une clause de contrat n'a pas de titre, une étape en a un. */
  title?: string;
  body: string;
};

/**
 * Liste EXPLICATIVE — médaillon en tête, texte qui passe à la ligne.
 *
 * C'est le pendant de `List` / `ListRow` pour du texte qui doit RESPIRER. La
 * distinction n'est pas cosmétique : `ListRow` est une **porte** de hauteur
 * fixe, titre et sous-titre tronqués à une ligne (`numberOfLines={1}`) pour que
 * des rangées voisines gardent la même hauteur. Une étape de « Comment ça
 * marche » ou une clause de contrat est un **paragraphe** : la tronquer lui
 * retire son sens. Passer un prop « pas de troncature » à `ListRow` aurait cassé
 * la seule chose qui fait tenir une liste de portes.
 *
 * Typographie empruntée telle quelle à `ListRow` — titre `bodyMedium`, corps
 * `bodySmall` secondaire, gouttière 12 — pour que les deux listes se lisent
 * comme une seule famille. Ce qui change, c'est la hauteur : médaillon aligné en
 * haut, pas de filet, et 20 d'air entre les items au lieu d'un `Divider`.
 *
 * Médaillon en **`sm`** (36 / glyphe 18) et non `md` : c'est l'empreinte que
 * `Medallion` réserve nommément à la « liste d'étapes » — `md` 42 est celle
 * d'une RANGÉE. L'écran de présentation Affiliation posait un `md` par défaut,
 * contre sa propre fiche de composant.
 *
 * ⚠️ À ne pas confondre avec **`StepProgress`**, qui est une barre de jalons :
 * elle suit l'avancement RÉEL d'une Commande. `StepList` explique un mécanisme,
 * elle ne mesure rien.
 *
 * Le `ton` est celui de `Medallion`, passé tel quel — `accent` (pastille bleue)
 * quand les étapes sont la matière de l'écran, `neutre` quand elles ne font que
 * dérouler un texte déjà annoncé (les clauses d'un contrat).
 */
export default function StepList({ items, ton = 'accent', style }: {
  items: StepItem[];
  ton?: MedallionTon;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.list, style]}>
      {items.map((item, i) => (
        <View key={item.title ?? i} style={styles.item}>
          <Medallion icon={item.icon} size="sm" ton={ton} />
          <View style={styles.texte}>
            {item.title ? <Text variant="bodyMedium">{item.title}</Text> : null}
            <Text variant="bodySmall" color={Colors.textSecondary}>{item.body}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing[5] },
  // Médaillon aligné en HAUT : le corps peut faire trois lignes, un centrage
  // vertical ferait flotter la pastille au milieu du paragraphe.
  item: { flexDirection: 'row', gap: Spacing[3], alignItems: 'flex-start' },
  // 4, comme le `body` de `ListRow` — c'est le même couple titre/sous-titre.
  texte: { flex: 1, gap: 4 },
});
