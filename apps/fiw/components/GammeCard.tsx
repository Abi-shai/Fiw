import React, { useEffect, useRef } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Animated, Image,
  type StyleProp, type ViewStyle,
} from 'react-native';
import Text from '@/components/Text';
import Icon from '@/components/Icon';
import { Colors, Radii, Outfit } from '@/constants/tokens';
import { gammeIllustration, illoSize, type IlluKey } from '@/constants/illustrations';

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/[\s  ]/g, '.');
const SPRING = { stiffness: 220, damping: 22, mass: 1 };

/** Largeur Figma de la carte — rangée scrollable Transport. Les rangées à deux
 *  gammes (Livraison) passent `flex: 1` via `style`. */
export const GAMME_CARD_WIDTH = 138;

/** Hauteurs Figma : 133 pour la carte nue (libellé + prix), 152 quand une ligne
 *  secondaire s'intercale (Livraison : nature du colis + capacité). */
const CARD_H = 133;
const CARD_H_WITH_DESC = 152;

type Props = {
  label: string;
  eta: string;
  price: number;
  illu: IlluKey;
  /** Pastille de gamme (Transport : Confort, Prestige…). */
  badge?: string | null;
  /** Ligne secondaire facultative (Livraison : « Documents · jusqu'à 5 kg »). */
  description?: string;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Carte gamme (Figma « Taxi Moto » 40:197 / jeu d'illustrations `mobility
 * option` 40:169) — LE composant qui représente un moyen de transport ou de
 * livraison dans tout le produit : rangée de gammes Transport, méthodes de
 * livraison.
 *
 * Géométrie du composant Figma, à ne pas rogner : la plateforme colorée occupe
 * la hauteur restante (~52) et l'illustration garde **sa taille propre** —
 * 76 de haut et 93 de large pour les voitures, 78 pour le vélo, 106 × 87 pour
 * la moto (cf. `ILLO_SIZES`). Elle **déborde** donc la plateforme d'au moins 12
 * en haut comme en bas et se cale **à droite** (`paddingRight: 12`) : c'est ce
 * débord qui donne son expressivité à la carte. Le badge ETA vient mordre le
 * coin bas-gauche.
 *
 * Passe « craft » du 14 août 2026 : espacement porté à 18 (la plateforme se
 * tasse, le débord double), libellé à 16, aplat en `primaryFill` et prix en
 * `primaryInk`. Les deux-roues y perdent leur pilote — il ne subsiste que sur
 * la vue de dessus, celle de la carto.
 */
export default function GammeCard({
  label, eta, price, illu, badge, description, selected, onPress, style,
}: Props) {
  const progress = useRef(new Animated.Value(selected ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(progress, { toValue: selected ? 1 : 0, ...SPRING, useNativeDriver: false }).start();
  }, [selected]);

  const cardBg = progress.interpolate({ inputRange: [0, 1], outputRange: [Colors.surfaceAlt, Colors.primarySubtle] });
  const cardOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  // `primaryFill` et non `primary` : sur un aplat de cette taille, le bleu de
  // marque vibre et mange l'illustration posée dessus (maquette 40:197).
  const platformBg = progress.interpolate({ inputRange: [0, 1], outputRange: [Colors.track, Colors.primaryFill] });
  const platformScale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const idleOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  return (
    <TouchableOpacity
      style={[styles.card, { height: description ? CARD_H_WITH_DESC : CARD_H }, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.cardBg, { backgroundColor: cardBg }]} />
      <Animated.View style={[styles.content, { opacity: cardOpacity }]}>
        <Animated.View style={[styles.platform, { backgroundColor: platformBg, transform: [{ scale: platformScale }] }]}>
          <Image source={gammeIllustration(illu)} style={illoSize(illu)} resizeMode="contain" />
          <View style={[styles.eta, selected && styles.etaSel]}>
            <Icon name="timer" size={12} weight="bold" color={Colors.textPrimary} />
            <Text variant="caption" style={styles.etaText}>{eta}</Text>
          </View>
        </Animated.View>

        <View style={styles.info}>
          <View style={styles.labelRow}>
            <Text variant="label" numberOfLines={1} style={styles.label}>{label}</Text>
            {badge && (
              <View style={styles.tag}>
                <Text variant="caption" style={styles.tagText}>{badge}</Text>
              </View>
            )}
          </View>

          {description && (
            <Text variant="caption" color={Colors.textSecondary} align="center" numberOfLines={1}>
              {description}
            </Text>
          )}

          {/* Le prix bascule en bleu à la sélection — fondu croisé plutôt qu'un
              changement sec de couleur (le texte n'est pas animable). */}
          <View style={styles.price}>
            <Animated.View style={{ opacity: idleOpacity }}>
              <Text variant="heading2" align="center" style={styles.priceText} color={Colors.textPrimary}>
                {fmt(price)} FCFA
              </Text>
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: progress }]}>
              <Text variant="heading2" align="center" style={styles.priceText} color={Colors.primaryInk}>
                {fmt(price)} FCFA
              </Text>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: GAMME_CARD_WIDTH, padding: 8, borderRadius: Radii.lg },
  cardBg: { borderRadius: Radii.lg },
  // 18 (maquette 40:197) : la plateforme se tasse d'autant, ce qui accentue le
  // débord de l'illustration — c'est voulu, cf. l'en-tête du composant.
  content: { flex: 1, gap: 18 },
  platform: {
    flex: 1, width: '100%',
    borderRadius: Radii.md,
    alignItems: 'flex-end', justifyContent: 'center',
    paddingRight: 12,
    overflow: 'visible',
  },
  info: { gap: 4 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  // 16/20 (maquette 40:197). L'interligne doit être surchargé avec la taille :
  // `variant="label"` impose 18, trop serré pour du 16 — et c'est ce 20 qui fait
  // tomber la géométrie juste (bloc info 47 → plateforme 52, exactement Figma).
  label: { fontSize: 16, lineHeight: 20 },
  price: { width: '100%' },
  priceText: { fontFamily: Outfit.bold, width: '100%' },
  tag: {
    backgroundColor: Colors.brandYellow,
    borderRadius: Radii.pill,
    borderWidth: 1, borderColor: Colors.primarySubtle,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  tagText: { fontFamily: Outfit.medium, color: Colors.textPrimary },
  eta: {
    position: 'absolute',
    bottom: -8, left: 0,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.surface,
    borderRadius: Radii.pill,
    borderWidth: 1, borderColor: Colors.borderSubtle,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  etaSel: { borderColor: Colors.primarySubtle },
  etaText: { fontFamily: Outfit.medium, color: Colors.textPrimary },
});
