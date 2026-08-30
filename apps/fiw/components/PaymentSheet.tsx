import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import Radio from '@/components/Radio';
import List from '@/components/List';
import ListRow from '@/components/ListRow';
import Medallion from '@/components/Medallion';
import { PAYMENT_METHODS } from '@/constants/data';
import { PAY_ILLUSTRATIONS } from '@/constants/illustrations';

/** Tête de la rangée, au gabarit de 56 de la maquette. Le logo de marque quand
 *  le moyen en a un — un logo se reconnaît plus vite qu'un glyphe — et sinon le
 *  `Medallion lg` que la maquette met sur les trois rangées. Le repli n'est donc
 *  plus un motif à part : c'est le composant du système. */
function PayLogo({ method }: { method: typeof PAYMENT_METHODS[number] }) {
  const illustration = PAY_ILLUSTRATIONS[method.id];
  if (!illustration) return <Medallion icon={method.icon} size="lg" />;
  return (
    <View style={styles.logoWrap}>
      <Image source={illustration} style={styles.illo} />
    </View>
  );
}

/**
 * Contenu de la feuille paiement (sélection validée à la fermeture, façon
 * Yango). Partagé entre les flux Transport et Livraison.
 *
 * ⚠️ **Il ne porte QUE la liste.** Le bouton de confirmation vit dans la carte
 * d'actions de la `BottomSheet` — dans la maquette (`Modale · Paiement`,
 * 674:3375) le contenu et les actions sont deux `SheetCard` séparées par la
 * gouttière de 6.
 *
 * Les rangées passent par `ListRow` — la maquette a absorbé `PaymentMethodRow`
 * dedans. C'est le `Radio` qui dit l'élu, pas la couleur du libellé : une rangée
 * sélectionnée n'a pas à changer de ton, sinon deux signaux disent la même chose.
 */
export default function PaymentSheetContent({ value, onChange }: {
  value: string; onChange: (id: string) => void;
}) {
  return (
    <>
      {/* Filet pleine largeur : en feuille, il file d'un bord à l'autre du
          contenu — cf. la règle « Le filet d'une liste en feuille » du style
          guide. Le retrait est réservé aux listes d'écran. */}
      <List style_="plat" inset={0} style={styles.list}>
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
    </>
  );
}

const styles = StyleSheet.create({
  list: { marginBottom: 0 },
  logoWrap: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  illo: { width: 52, height: 52, borderRadius: 14 },
});
