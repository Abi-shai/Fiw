import React from 'react';
import { View, TouchableOpacity, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/tokens';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';

export type ListRowTon = 'neutre' | 'action' | 'destructif';

type Props = {
  /** Tête de rangée, à sa taille naturelle : icône 22, `Medallion` 42,
   *  `Avatar` 48 ou 64, `FlagChip`… C'est un emplacement libre, pas une icône
   *  imposée — d'où le retrait du `Divider` qui suit (50 pour une icône, 76 pour
   *  un avatar de rangée). */
  leading?: React.ReactNode;
  /** Raccourci du cas courant : le glyphe 22 nu, teinté par le `ton`. C'est le
   *  contenu par défaut du slot dans la maquette. */
  icon?: IconName;
  title: string;
  subtitle?: string;
  /** Glyphe 14 posé devant le sous-titre (l'étoile d'une note, par exemple). */
  subtitleIcon?: IconName;
  /** Sous-titre en bleu marque : la seconde ligne n'est plus un fait mais une
   *  invitation (« Ajouter une adresse » sous un emplacement encore vide).
   *  ⚠️ Sans contrepartie dans la maquette : `ListRow / Ton=action` y accentue le
   *  TITRE. À porter dans Figma ou à remplacer par `ton="action"`. */
  subtitleAccent?: boolean;
  /** Valeur alignée à droite, avant le trailing. */
  value?: string;
  /** Fin de rangée. Par défaut un chevron dès que la rangée est actionnable ;
   *  `null` pour n'en avoir aucun. */
  trailing?: React.ReactNode;
  /**
   * `neutre` — rangée ordinaire.
   * `action` — libellé en bleu marque : la rangée AGIT (« Renvoyer le code »,
   *   « Ajouter le destinataire »). Le sous-titre et la valeur restent gris.
   * `destructif` — libellé rouge (déconnexion, suppression).
   */
  ton?: ListRowTon;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

const TITLE_COLOR: Record<ListRowTon, string> = {
  neutre: Colors.textPrimary,
  action: Colors.primary,
  destructif: Colors.error,
};

/**
 * LA rangée du système (Figma `ListRow`). Une seule spécification — gouttière
 * 12, padding vertical 8, titre `bodyMedium`, valeur `label`, trailing 18 —
 * pour tout ce qui « fait rangée » : réglages, lieux, contacts, moyens de
 * paiement, prestataires.
 *
 * Elle a remplacé six composants qui disaient la même chose avec sept tailles de
 * tête, quatre paddings et trois largeurs. Ce qui varie d'un emploi à l'autre
 * vit dans le slot `leading`, jamais dans une nouvelle rangée.
 */
export default function ListRow({
  leading, icon, title, subtitle, subtitleIcon, subtitleAccent, value, trailing,
  ton = 'neutre', disabled, onPress, style,
}: Props) {
  const showChevron = trailing === undefined && !!onPress;
  const Wrapper: React.ComponentType<any> = onPress ? TouchableOpacity : View;
  const head = leading ?? (icon ? (
    <Icon
      name={icon}
      size={22}
      color={ton === 'destructif' ? Colors.error : ton === 'action' ? Colors.primary : Colors.textSecondary}
    />
  ) : null);
  return (
    <Wrapper
      style={[styles.row, disabled && styles.disabled, style]}
      activeOpacity={0.6}
      onPress={onPress}
      disabled={disabled || !onPress}
    >
      {head}
      <View style={styles.body}>
        <Text variant="bodyMedium" color={TITLE_COLOR[ton]} numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <View style={styles.subtitleRow}>
            {subtitleIcon ? (
              <Icon name={subtitleIcon} size={14} weight="fill" color={Colors.warning} />
            ) : null}
            <Text
              variant="bodySmall"
              color={subtitleAccent ? Colors.primary : Colors.textSecondary}
              numberOfLines={1}
              style={styles.flex1}
            >
              {subtitle}
            </Text>
          </View>
        ) : null}
      </View>
      {value ? (
        <Text variant="label" color={Colors.textSecondary} numberOfLines={1} style={styles.value}>{value}</Text>
      ) : null}
      {showChevron ? <Icon name="chevronRight" size={18} color={Colors.textTertiary} /> : trailing}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  disabled: { opacity: 0.45 },
  body: { flex: 1, gap: 4 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  flex1: { flex: 1 },
  value: { maxWidth: 150 },
});
