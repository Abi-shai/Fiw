import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { Colors, Radii, inputTypo, Strokes } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import FlagChip from '@/components/FlagChip';
import { formatLocal, inputMax, placeholderDigits, type Country } from '@/constants/countries';

type Props = {
  country: Country;
  /** Chiffres locaux bruts (sans indicatif ni espaces). */
  digits: string;
  onChangeDigits: (d: string) => void;
  /** Ouvre le sélecteur de pays (monté par le parent, au niveau écran). */
  onPressDial: () => void;
  autoFocus?: boolean;
};

/** Saisie téléphone : chip indicatif (drapeau + `+code` + caret) à gauche, numéro
 *  formaté au pattern du pays à droite (espaces automatiques). Sélecteur de pays
 *  délégué au parent. */
export default function PhoneField({ country, digits, onChangeDigits, onPressDial, autoFocus }: Props) {
  const display = formatLocal(digits, country);
  // Placeholder = suite de 0 au gabarit du pays (nb de chiffres + espaces).
  const placeholder = placeholderDigits(country);
  const max = inputMax(country);

  return (
    <View style={styles.field}>
      <TouchableOpacity
        style={styles.dial}
        activeOpacity={0.7}
        onPress={() => { Keyboard.dismiss(); onPressDial(); }}
      >
        <FlagChip code={country.code} />
        <Text variant="fieldPrefix">{country.dial}</Text>
        <Icon name="chevronDown" size={14} color={Colors.textSecondary} />
      </TouchableOpacity>

      <View style={styles.sep} />

      <TextInput
        style={styles.input}
        value={display}
        onChangeText={(t) => onChangeDigits(t.replace(/[^0-9]/g, '').slice(0, max))}
        keyboardType="phone-pad"
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        autoFocus={autoFocus}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Miroir de `Field / Type=téléphone` : hauteur 56, rayon `lg`, chip indicatif
  // à padding 16, filet de 1×24, saisie en retrait de 12.
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: Strokes.thin,
    borderColor: Colors.border,
    paddingRight: 16,
    overflow: 'hidden',
  },
  dial: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 6,
    paddingHorizontal: 16,
  },
  sep: { width: 1, height: 24, backgroundColor: Colors.border },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    ...inputTypo('body'),
    color: Colors.textPrimary,
    paddingLeft: 12,
  },
});
