import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import Button from '@/components/Button';
import { Colors, Radii } from '@/constants/tokens';
import { PAYMENT_METHODS } from '@/constants/data';
import { PAY_ILLUSTRATIONS } from '@/constants/illustrations';

// Ligne moyen de paiement (façon Yango) : illustration + libellé + radio.
function PayRow({ method, selected, onPress }: {
  method: typeof PAYMENT_METHODS[number]; selected: boolean; onPress: () => void;
}) {
  const illustration = PAY_ILLUSTRATIONS[method.id];
  return (
    <TouchableOpacity style={styles.payRow} activeOpacity={0.85} onPress={onPress}>
      {illustration ? (
        <View style={styles.payIlloWrap}>
          <Image source={illustration} style={styles.payIllo} />
        </View>
      ) : (
        <View style={[styles.payLogo, { backgroundColor: method.color + '1A' }]}>
          <Text style={styles.payEmoji}>{method.icon}</Text>
        </View>
      )}
      <Text variant="label" style={styles.payName}
        color={selected ? Colors.primary : Colors.textPrimary}>{method.label}</Text>
      <View style={[styles.radio, selected && styles.radioSel]}>
        {selected && <Icon name="tick" size={15} weight="bold" color={Colors.surface} />}
      </View>
    </TouchableOpacity>
  );
}

/** Contenu de la feuille paiement (sélection validée à la fermeture, façon
 *  Yango). Partagé entre les flux Transport et Livraison. */
export default function PaymentSheetContent({ value, onChange, onDone }: {
  value: string; onChange: (id: string) => void; onDone: () => void;
}) {
  return (
    <View style={styles.payList}>
      {PAYMENT_METHODS.map((m, i) => (
        <View key={m.id}>
          <PayRow
            method={m}
            selected={value === m.id}
            onPress={() => { Haptics.selectionAsync(); onChange(m.id); }}
          />
          {i < PAYMENT_METHODS.length - 1 && <View style={styles.payDivider} />}
        </View>
      ))}
      <Button label="Terminer" onPress={onDone} style={styles.payCta} />
    </View>
  );
}

const styles = StyleSheet.create({
  payList: { paddingBottom: 4 },
  payDivider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.borderSubtle, marginLeft: 64 },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  payLogo: { width: 56, height: 56, borderRadius: Radii.lg, alignItems: 'center', justifyContent: 'center' },
  payIlloWrap: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  payIllo: { width: 52, height: 52, borderRadius: 14 },
  payEmoji: { fontSize: 28 },
  payName: { flex: 1, fontSize: 16 },
  radio: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: Colors.textDisabled,
    alignItems: 'center', justifyContent: 'center',
  },
  radioSel: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  payCta: { marginTop: 16 },
});
