import React from 'react';
import {
  View, TextInput, TouchableOpacity, Keyboard, StyleSheet,
  type StyleProp, type ViewStyle, type TextInputProps,
} from 'react-native';
import { Colors, Radii, Strokes, Typography, inputTypo } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import IconButton from '@/components/IconButton';
import FlagChip from '@/components/FlagChip';
import { formatLocal, inputMax, placeholderDigits, type Country } from '@/constants/countries';

/** Les trois types de l'axe `Type` de la maquette. `téléphone` n'est pas un
 *  composant à part : c'est ce même champ avec un chip indicatif à la place de
 *  l'icône de tête. */
export type FieldType = 'texte' | 'téléphone' | 'zone';
export type FieldEtat = 'repos' | 'actif' | 'erreur' | 'désactivé';

/**
 * Fond + liseré par état. **C'est le seul endroit où un champ change de
 * couleur**, et les trois types y lisent les mêmes quatre états — comme la
 * maquette, qui les tient sur un axe unique.
 *
 * Un champ au repos n'est jamais bleu : fond `surface`, liseré `border`. Le bleu
 * ne marque qu'un ÉTAT — le focus remplit en `primarySubtle` et double le liseré
 * en `primary`. L'erreur garde le fond blanc et passe le liseré en `error`, ce
 * qui laisse le texte saisi lisible.
 */
const CONTROL: Record<FieldEtat, ViewStyle> = {
  repos: { backgroundColor: Colors.surface, borderWidth: Strokes.thin, borderColor: Colors.border },
  actif: { backgroundColor: Colors.primarySubtle, borderWidth: Strokes.thick, borderColor: Colors.primary },
  erreur: { backgroundColor: Colors.surface, borderWidth: Strokes.thick, borderColor: Colors.error },
  désactivé: { backgroundColor: Colors.track, borderWidth: Strokes.thin, borderColor: Colors.border },
};

/** Couleur du × d'effacement par état — règle du style guide : « la couleur du ×
 *  suit l'état ». Le champ actif est le seul qui l'accentue, parce qu'il est le
 *  seul où l'on est en train d'écrire. */
const CLEAR_COLOR: Record<FieldEtat, string> = {
  repos: Colors.textTertiary,
  actif: Colors.primary,
  erreur: Colors.error,
  désactivé: Colors.textDisabled,
};

/** Croix d'effacement de fin de champ : `IconButton / link · sm` — boîte de 32,
 *  glyphe 18, aucune empreinte visible.
 *
 *  Elle n'est jamais offerte en emplacement libre : c'est le champ qui l'habille
 *  et la teinte selon son état. Un slot laisserait l'appelant se tromper de
 *  variante — l'erreur de la Partie XXXIV bis. */
function ClearButton({ état, onPress }: { état: FieldEtat; onPress: () => void }) {
  return <IconButton name="close" variant="link" size="sm" color={CLEAR_COLOR[état]} onPress={onPress} />;
}

type Commun = {
  /** Libellé au-dessus du champ. Absent = pas d'en-tête. */
  label?: string;
  /** Astérisque rouge après le libellé. */
  requis?: boolean;
  /** Note sous le champ. Passe en rouge quand l'état est `erreur`. */
  aide?: string;
  état?: FieldEtat;
  style?: StyleProp<ViewStyle>;
};

type SaisieProps = Omit<TextInputProps, 'style' | 'editable'> & Commun & {
  type?: 'texte' | 'zone';
  /** Glyphe 18 en tête de champ. */
  icon?: IconName;
  /** Croix d'effacement — l'axe `Contenu` de la maquette. Le champ l'habille et
   *  la teinte lui-même ; l'appelant ne fournit que le geste. Elle ne se montre
   *  **que si le champ est rempli** : un champ vide n'a rien à effacer. */
  onClear?: () => void;
  /** Fin de champ pour ce que la maquette ne connaît pas (un cadenas, par
   *  exemple). Pour la croix d'effacement, employer `onClear`. */
  trailing?: React.ReactNode;
};

type TelProps = Commun & {
  type: 'téléphone';
  country: Country;
  /** Chiffres locaux bruts (sans indicatif ni espaces). */
  digits: string;
  onChangeDigits: (d: string) => void;
  /** Ouvre le sélecteur de pays (monté par le parent, au niveau écran). */
  onPressDial: () => void;
  autoFocus?: boolean;
};

/**
 * LE champ de saisie du système (Figma `Field`, 24 variantes) — trois types sur
 * un axe, quatre états, et l'axe `Contenu` porté par la croix d'effacement.
 *
 * `téléphone` y est un TYPE et non un composant frère : le style guide avait
 * acté l'absorption de `PhoneField` le 23 août 2026, le code l'applique enfin.
 * Ce qui distingue le téléphone tient en trois objets — le chip indicatif, son
 * filet, et le formatage par pays ; tout le reste (cadre, états, en-tête, aide,
 * croix) est celui des deux autres types, écrit une seule fois.
 */
export default function Field(props: SaisieProps | TelProps) {
  return props.type === 'téléphone' ? <TelField {...props} /> : <SaisieField {...props} />;
}

/** Cadre commun : en-tête, contrôle peint par son état, ligne d'aide. */
function Frame({ label, requis, aide, état = 'repos', control, children, style }: Commun & {
  control?: StyleProp<ViewStyle>; children: React.ReactNode;
}) {
  return (
    <View style={[frame.wrap, style]}>
      {label ? (
        <View style={frame.header}>
          <Text variant="label" color={Colors.textSecondary}>{label}</Text>
          {requis ? <Text variant="caption" color={Colors.error}>*</Text> : null}
        </View>
      ) : null}

      <View style={[frame.control, CONTROL[état], control]}>{children}</View>

      {aide ? (
        <Text variant="bodySmall" color={état === 'erreur' ? Colors.error : Colors.textSecondary}>
          {aide}
        </Text>
      ) : null}
    </View>
  );
}

function SaisieField({
  label, requis, aide, état = 'repos', style,
  type = 'texte', icon, onClear, trailing, ...input
}: SaisieProps) {
  const disabled = état === 'désactivé';
  const zone = type === 'zone';
  const rempli = !!input.value;
  return (
    <Frame
      label={label} requis={requis} aide={aide} état={état} style={style}
      control={[saisie.control, zone && saisie.controlZone]}
    >
      {icon ? <Icon name={icon} size={18} color={Colors.textSecondary} /> : null}
      <TextInput
        {...input}
        multiline={zone}
        textAlignVertical={zone ? 'top' : undefined}
        editable={!disabled}
        placeholderTextColor={Colors.textTertiary}
        style={[saisie.input, zone ? saisie.inputZone : null, disabled && saisie.inputDisabled]}
      />
      {onClear && rempli ? (
        <ClearButton état={état} onPress={onClear} />
      ) : trailing ? (
        <View style={saisie.trailing}>{trailing}</View>
      ) : null}
    </Frame>
  );
}

function TelField({
  label, requis, aide, état = 'repos', style,
  country, digits, onChangeDigits, onPressDial, autoFocus,
}: TelProps) {
  const disabled = état === 'désactivé';
  // Placeholder = suite de 0 au gabarit du pays (nb de chiffres + espaces).
  const placeholder = placeholderDigits(country);
  return (
    <Frame label={label} requis={requis} aide={aide} état={état} style={style} control={tel.control}>
      <TouchableOpacity
        style={tel.dial}
        activeOpacity={0.7}
        disabled={disabled}
        onPress={() => { Keyboard.dismiss(); onPressDial(); }}
      >
        <FlagChip code={country.code} />
        <Text variant="fieldPrefix" color={disabled ? Colors.textDisabled : Colors.textPrimary}>
          {country.dial}
        </Text>
        <Icon name="chevronDown" size={14} color={disabled ? Colors.textDisabled : Colors.textSecondary} />
      </TouchableOpacity>

      <View style={tel.sep} />

      <TextInput
        style={[tel.input, disabled && saisie.inputDisabled]}
        value={formatLocal(digits, country)}
        onChangeText={(t) => onChangeDigits(t.replace(/[^0-9]/g, '').slice(0, inputMax(country)))}
        keyboardType="phone-pad"
        editable={!disabled}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        autoFocus={autoFocus}
      />

      {digits.length > 0 ? (
        <View style={tel.clear}><ClearButton état={état} onPress={() => onChangeDigits('')} /></View>
      ) : null}
    </Frame>
  );
}

const frame = StyleSheet.create({
  wrap: { gap: 6 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  // Le cadre ne connaît que la hauteur, le rayon et la peinture de l'état. La
  // gouttière et le padding appartiennent au type : le téléphone n'a pas de
  // padding à gauche, c'est son chip indicatif qui le porte.
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: Radii.lg,
  },
});

const saisie = StyleSheet.create({
  control: { gap: 12, paddingHorizontal: 16 },
  // La zone perd sa hauteur fixe et son centrage : le texte s'écrit depuis le
  // haut, avec un padding égal sur les quatre côtés — et la croix se retrouve
  // donc en haut à droite, comme le veut le style guide.
  controlZone: { height: 96, alignItems: 'flex-start', padding: 14 },
  input: {
    flex: 1,
    ...inputTypo('body'),
    color: Colors.textPrimary,
    padding: 0,
  },
  // Multiligne : l'interligne de la variante est nécessaire pour respirer, là
  // où sur une ligne il décalerait le texte verticalement sur Android.
  inputZone: { ...Typography.body, height: '100%' },
  inputDisabled: { color: Colors.textDisabled },
  trailing: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
});

const tel = StyleSheet.create({
  // Le recadrage cache le débord du filet aux coins arrondis.
  control: { paddingRight: 16, overflow: 'hidden' },
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
  clear: { marginLeft: 4 },
});
