import React from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Button from '@/components/Button';
import Radio from '@/components/Radio';
import List from '@/components/List';
import ListRow from '@/components/ListRow';
import { PAYMENT_METHODS } from '@/constants/data';
import PayLogo from '@/components/PayLogo';

/**
 * Contenu de la feuille paiement (sélection validée à la fermeture, façon
 * Yango). Partagé entre les flux Transport et Livraison.
 *
 * Les rangées passent par `ListRow` — la maquette a absorbé `PaymentMethodRow`
 * dedans. C'est le `Radio` qui dit l'élu, pas la couleur du libellé : une rangée
 * sélectionnée n'a pas à changer de ton, sinon deux signaux disent la même chose.
 */
export default function PaymentSheetContent({ value, onChange, onDone }: {
  value: string; onChange: (id: string) => void; onDone: () => void;
}) {
  return (
    <View style={styles.wrap}>
      {/* Filet sous le texte (logo 56 + gouttière 12), feuille ou pas : la
          liste du Menu fait référence partout depuis le 29 septembre 2026. Il
          filait jusque-là pleine largeur, règle des listes en feuille abandonnée
          le même jour (style guide). */}
      <List style_="plat" inset={68} style={styles.list}>
        {PAYMENT_METHODS.map((m) => (
          <ListRow
            key={m.id}
            leading={<PayLogo id={m.id} icon={m.icon} />}
            title={m.label}
            trailing={<Radio selected={value === m.id} />}
            onPress={() => { Haptics.selectionAsync(); onChange(m.id); }}
          />
        ))}
      </List>
      <Button label="Terminer" onPress={onDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 4, gap: 16 },
  list: { marginBottom: 0 },
});
