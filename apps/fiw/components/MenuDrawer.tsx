import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, PanResponder, TouchableOpacity, TouchableWithoutFeedback,
  View, StyleSheet, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Avatar from '@/components/Avatar';
import Icon, { type IconName } from '@/components/Icon';
import Text from '@/components/Text';
import { Colors, Radii } from '@/constants/tokens';

const SCREEN_W = Dimensions.get('window').width;
const DRAWER_W = Math.min(Math.round(SCREEN_W * 0.82), 320);
const SPRING = { stiffness: 300, damping: 30, mass: 1, useNativeDriver: true };
const CLOSE_DX = DRAWER_W * 0.30; // déplacement minimal pour déclencher la fermeture
const CLOSE_VX = 0.5;              // vélocité minimale (px/ms) pour déclencher la fermeture

// Proto : statut d'affiliation du Client. Bascule pour voir les deux états de
// l'item Affiliation — mini CTA « Gagner de l'argent » (non affilié) ·
// sous-lignes solde/recrutés (Affilié Réseau actif).
const IS_AFFILIATE = true;

// Proto : phase de lancement « Affilié Fondateur » — les Gains s'accumulent
// mais le retrait cash (Mobile Money) n'est pas encore ouvert. Passe à true
// quand il l'est → le libellé redevient « Solde disponible » et la note
// « Retrait bientôt disponible » disparaît.
const RETRAIT_OUVERT = false;

type SubRow = { label: string; value: string };
type MenuItemProps = {
  icon: IconName;
  label: string;
  badge?: string;
  /** Ligne d'accroche sous le label (accent) — sert de CTA discret. */
  subtitle?: string;
  /** Lignes d'info indentées sous l'item (mini tableau de bord). */
  subRows?: SubRow[];
  /** Note discrète (icône + texte tertiaire) sous les sous-lignes — statut léger. */
  note?: { icon?: IconName; text: string };
  onPress?: () => void;
};

function MenuItem({ icon, label, badge, subtitle, subRows, note, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.itemRow}>
        <Icon name={icon} size={22} color={Colors.textSecondary} />
        <View style={styles.itemLabel}>
          <Text variant="body">{label}</Text>
          {subtitle && (
            <Text variant="caption" color={Colors.primary} style={styles.itemSubtitle}>
              {subtitle}
            </Text>
          )}
        </View>
        {badge && (
          <View style={styles.badgeWrap}>
            <Text variant="caption" color={Colors.primary}>{badge}</Text>
          </View>
        )}
        <Icon name="chevronRight" size={16} color={Colors.textTertiary} />
      </View>
      {subRows && subRows.length > 0 && (
        <View style={styles.subRows}>
          {subRows.map((r) => (
            <View key={r.label} style={styles.subRow}>
              <Text variant="caption" color={Colors.textSecondary}>{r.label}</Text>
              <Text variant="caption" color={Colors.textPrimary}>{r.value}</Text>
            </View>
          ))}
        </View>
      )}
      {note && (
        <View style={styles.note}>
          {note.icon && <Icon name={note.icon} size={13} color={Colors.textTertiary} />}
          <Text variant="caption" color={Colors.textTertiary}>{note.text}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function MenuDrawer({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(-DRAWER_W)).current;
  const [interactive, setInteractive] = useState(false);

  // Ref stable pour que le PanResponder (créé une seule fois) lise toujours
  // le onClose courant sans être recréé à chaque render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Scrim dérivé de la position du panel : se synchronise automatiquement
  // pendant l'animation d'entrée/sortie ET pendant le swipe.
  const scrimOpacity = translateX.interpolate({
    inputRange: [-DRAWER_W, 0],
    outputRange: [0, 0.48],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (visible) {
      setInteractive(true);
      Animated.spring(translateX, { toValue: 0, ...SPRING }).start();
    } else {
      Animated.spring(translateX, { toValue: -DRAWER_W, ...SPRING }).start(
        () => setInteractive(false),
      );
    }
  }, [visible]);

  const panResponder = useRef(PanResponder.create({
    // Ne prend pas la main sur un simple tap ; attend un mouvement horizontal franc.
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, g) =>
      Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
    onPanResponderGrant: () => {
      // Stoppe toute animation en cours (ex. ouverture pas encore terminée).
      translateX.stopAnimation();
    },
    onPanResponderMove: (_, g) => {
      // Suit le doigt vers la gauche uniquement ; bloque le mouvement vers la droite.
      translateX.setValue(Math.min(0, g.dx));
    },
    onPanResponderRelease: (_, g) => {
      const fastEnough = g.vx < -CLOSE_VX;
      const farEnough  = g.dx < -CLOSE_DX;
      if (fastEnough || farEnough) {
        onCloseRef.current();
      } else {
        // Snap back : repart depuis la position du doigt avec la vélocité exacte.
        Animated.spring(translateX, {
          toValue: 0,
          velocity: g.vx * 1000,
          ...SPRING,
        }).start();
      }
    },
    onPanResponderTerminationRequest: () => true,
  })).current;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={interactive ? 'box-none' : 'none'}>
      {/* Voile — opacité liée à la position du panel, tap pour fermer */}
      <TouchableWithoutFeedback onPress={() => onCloseRef.current()}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, { opacity: scrimOpacity }]} />
      </TouchableWithoutFeedback>

      {/* Panel — reçoit les gestes de swipe */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.panel, { transform: [{ translateX }], paddingBottom: insets.bottom + 24 }]}
      >
        {/* En-tête identité */}
        <TouchableOpacity
          style={[styles.header, { paddingTop: insets.top + 28 }]}
          activeOpacity={0.75}
        >
          <Avatar name="Mamadou Diallo" size={52} />
          <View style={styles.headerText}>
            <Text variant="label">Mamadou Diallo</Text>
            <Text variant="caption" color={Colors.textSecondary}>+221 77 123 45 67</Text>
          </View>
          <Icon name="chevronRight" size={18} color={Colors.textTertiary} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <MenuItem icon="account" label="Mon compte & sécurité" />
        <MenuItem
          icon="clock"
          label="Historique"
          onPress={() => { onCloseRef.current(); router.push('/history'); }}
        />
        <MenuItem icon="gift" label="Fidélité" badge="240 pts" />

        <View style={styles.divider} />

        {IS_AFFILIATE ? (
          <MenuItem
            icon="group"
            label="Affiliation"
            subRows={[
              { label: RETRAIT_OUVERT ? 'Solde disponible' : 'Solde', value: '4 200 F' },
              { label: 'Personnes recrutées', value: '12' },
            ]}
            note={RETRAIT_OUVERT ? undefined : { icon: 'hourglass', text: 'Retrait bientôt disponible' }}
          />
        ) : (
          <MenuItem icon="group" label="Affiliation" subtitle="Gagner de l'argent" />
        )}

        <View style={styles.divider} />

        <MenuItem icon="help" label="Aide & support" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    backgroundColor: '#000',
  },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_W,
    backgroundColor: Colors.surface,
    borderTopRightRadius: Radii.xl,
    borderBottomRightRadius: Radii.xl,
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginHorizontal: 24,
    marginVertical: 8,
  },
  item: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  itemLabel: {
    flex: 1,
  },
  itemSubtitle: {
    marginTop: 2,
  },
  // Sous-lignes indentées (mini tableau de bord) — alignées sous le label
  // (largeur icône 22 + gap 14 = 36) et légèrement décalées vers la droite.
  subRows: {
    marginLeft: 36,
    marginTop: 10,
    gap: 7,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Note discrète sous les sous-lignes (ex. « Retrait bientôt disponible »)
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 36,
    marginTop: 8,
  },
  badgeWrap: {
    backgroundColor: Colors.primarySubtle,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
