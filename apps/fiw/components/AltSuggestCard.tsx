import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import {Colors, Radii} from '@/constants/tokens';
import Icon from '@/components/Icon';
import Text from '@/components/Text';
import Badge from '@/components/Badge';
import { gammeIllustration, type IlluKey } from '@/constants/illustrations';

/** Alternative suggérée (Figma 118:357) — proposée dans l'issue « Aucun
 *  prestataire » de la mise en relation, quand une autre gamme a du stock. */
export default function AltSuggestCard({ illu, title, subtitle, badgeLabel = 'Suggéré', onPress }: {
  illu: IlluKey; title: string; subtitle: string; badgeLabel?: string; onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.altCard} activeOpacity={0.9} onPress={onPress} disabled={!onPress}>
      <View style={styles.altThumb}>
        <Image source={gammeIllustration(illu)} style={styles.altThumbImg} resizeMode="contain" />
      </View>
      <View style={styles.flex1}>
        <View style={styles.altTitleRow}>
          <Text variant="label" numberOfLines={1} style={styles.altTitle}>{title}</Text>
          <Badge variant="suggere" label={badgeLabel} />
        </View>
        <Text variant="caption" color={Colors.textSecondary} style={styles.altSub} numberOfLines={1}>{subtitle}</Text>
      </View>
      {onPress && <Icon name="chevronRight" size={18} color={Colors.textTertiary} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  altCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.lg,
    padding: 8,
  },
  altThumb: {
    width: 48, height: 48, borderRadius: Radii.md,
    backgroundColor: Colors.track,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  altThumbImg: { width: 42, height: 42 },
  altTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  altTitle: { flexShrink: 1 },
  altSub: { marginTop: 2 },
});
