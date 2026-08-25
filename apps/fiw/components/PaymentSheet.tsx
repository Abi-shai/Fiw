import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import Text from '@/components/Text';
import Button from '@/components/Button';
import Radio from '@/components/Radio';
import List from '@/components/List';
import ListRow from '@/components/ListRow';
import { Colors, Radii } from '@/constants/tokens';
import { PAYMENT_METHODS } from '@/constants/data';
import { PAY_ILLUSTRATIONS } from '@/constants/illustrations';

/** Logo du service, à son gabarit de 56 — le `leading` de la rangée. Les moyens
 *  sans illustration retombent sur une pastille teintée de la marque. */
function PayLogo({ method }: { method: typeof PAYMENT_METHODS[number] }) {
  const illustration = PAY_ILLUSTRATIONS[method.id];
  if (illustration) {
    return (
      <View style={styles.logoWrap}>
        <Image source={illustration} style={styles.illo} />
      </View>
    );
  }
  return (
    <View style={[styles.logoWrap, styles.fallback, { backgroundColor: method.color + '1A' }]}>
      <Text style={styles.emoji}>{method.icon}</Text>
    </View>
  );
}

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
      {/* Retrait du filet = logo 56 + gouttière 12. */}
      <List style_="plat" inset={68} style={styles.list}>
        {PAYMENT_METHODS.map((m) => (
          <ListRow
            key={m.id}
            leading={<PayLogo method={m} />}
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
  logoWrap: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  illo: { width: 52, height: 52, borderRadius: 14 },
  fallback: { borderRadius: Radii.lg },
  emoji: { fontSize: 28 },
});
