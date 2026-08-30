import React, { useEffect, useRef, useState } from 'react';
import {
  Alert, Animated, PanResponder, TouchableOpacity, TouchableWithoutFeedback,
  View, StyleSheet, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Avatar from '@/components/Avatar';
import Divider from '@/components/Divider';
import Icon, { type IconName } from '@/components/Icon';
import Text from '@/components/Text';
import { Colors, Radii, Shadows, Strokes } from '@/constants/tokens';
import { CLIENT } from '@/constants/data';

const SCREEN_W = Dimensions.get('window').width;
const DRAWER_W = Math.min(Math.round(SCREEN_W * 0.82), 320);
const SPRING = { stiffness: 300, damping: 30, mass: 1, useNativeDriver: true };
const CLOSE_DX = DRAWER_W * 0.30; // déplacement minimal pour déclencher la fermeture
const CLOSE_VX = 0.5;              // vélocité minimale (px/ms) pour déclencher la fermeture

// Proto : statut d'affiliation du Client, piloté par l'interrupteur de démo
// (facilitateur) au niveau de la section Affiliation — invisible en production,
// même langage que le « Démo · … » de l'écran searching. Cycle les deux états
// de l'item Affiliation :
//  · none  → non affilié : mini CTA « Gagner de l'argent »
//  · actif → Affilié Réseau actif : Solde disponible + recrutés (le retrait est
//            ouvert dès le lancement — l'app est commercialisée dès le départ).
type AffiliationState = 'none' | 'actif';
const AFFILIATION_ORDER: AffiliationState[] = ['none', 'actif'];
const AFFILIATION_DEMO_LABEL: Record<AffiliationState, string> = {
  none: 'Non affilié',
  actif: 'Actif',
};

// Second interrupteur de démo : la PLACE de la bannière « Gagner de l'argent »
// dans l'état non affilié. Les deux propositions d'argent de la sidebar
// appartiennent à la même famille (cf. bench Mobbin : inDrive « Driver mode »,
// Turo « Become a host »), il faut décider comment elles se partagent l'écran.
//  · top  → bannière en haut (ce qu'on peut faire ICI), prestataire en pied
//           (la porte de sortie vers l'autre app). D4 intacte.
//  · foot → les deux en pied, hiérarchisées : le pied devient la zone
//           « gagner de l'argent », motif inDrive/Freenow poussé d'un cran.
// À retirer une fois tranché.
type EarnLayout = 'top' | 'foot';
const EARN_DEMO_LABEL: Record<EarnLayout, string> = {
  top: 'En haut',
  foot: 'En pied',
};

type SubRow = { label: string; value: string };
type MenuItemProps = {
  icon: IconName;
  label: string;
  badge?: string;
  /** Ligne d'accroche sous le label (accent) — sert de CTA discret. */
  subtitle?: string;
  /** Lignes d'info indentées sous l'item (mini tableau de bord). */
  subRows?: SubRow[];
  onPress?: () => void;
};

function MenuItem({ icon, label, badge, subtitle, subRows, onPress }: MenuItemProps) {
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

  // Interrupteur de démo (facilitateur) : cycle les états de l'item Affiliation.
  const [affiliation, setAffiliation] = useState<AffiliationState>('none');
  const isAffiliate = affiliation !== 'none';
  const cycleAffiliation = () => {
    Haptics.selectionAsync();
    const next = AFFILIATION_ORDER[(AFFILIATION_ORDER.indexOf(affiliation) + 1) % AFFILIATION_ORDER.length];
    setAffiliation(next);
  };

  const [earnLayout, setEarnLayout] = useState<EarnLayout>('top');
  const cycleEarnLayout = () => {
    Haptics.selectionAsync();
    setEarnLayout((l) => (l === 'top' ? 'foot' : 'top'));
  };

  // Ref stable pour que le PanResponder (créé une seule fois) lise toujours
  // le onClose courant sans être recréé à chaque render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // L'en-tête profil ET l'item « Mon compte & sécurité » mènent au même écran :
  // redondance VOLONTAIRE (cf. benchmark-compte-mobbin.md D3) — elle guide les
  // Clients qui suivent les mots plutôt que l'affordance de l'avatar tappable.
  // Ne pas « nettoyer » l'un des deux.
  const goCompte = () => { onCloseRef.current(); router.push('/compte'); };
  const onBecomePro = () => {
    onCloseRef.current();
    Alert.alert('Fiw Pro', 'Ouvrez ou installez l’application Fiw Pro pour devenir prestataire.');
  };

  const goAffiliation = () => {
    onCloseRef.current();
    router.push('/affilie/presentation');
  };

  // ⚠️ Écart au DS assumé, à documenter si la forme est retenue : c'est le seul
  // bloc en BLEU PLEIN de l'app hors bouton. La carte « Devenir prestataire »
  // occupe déjà le motif « fond primary-subtle + liseré blue100 » ; refaire la
  // bannière dans ce motif l'aurait mise à égalité avec la carte qu'elle doit
  // dominer. Le plein est le registre du CTA — c'est ce qui établit la
  // hiérarchie entre les deux propositions d'argent de la sidebar.
  // Le glyphe suit la règle du style guide sur les aplats : sur un fond plein,
  // c'est la pastille claire qui porte le glyphe de couleur, jamais l'inverse.
  const earnBanner = isAffiliate ? null : (
    <TouchableOpacity style={styles.earnBanner} activeOpacity={0.85} onPress={goAffiliation}>
      <View style={styles.earnIcon}>
        <Icon name="group" size={20} color={Colors.primary} weight="bold" />
      </View>
      <View style={styles.earnText}>
        <Text variant="label" color={Colors.primaryOn}>Gagner de l'argent</Text>
        <Text variant="caption" color={Colors.primaryOn} style={styles.earnBody}>
          2 % sur chaque course des personnes que vous recrutez.
        </Text>
      </View>
      <Icon name="chevronRight" size={18} color={Colors.primaryOn} />
    </TouchableOpacity>
  );

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
        {/* En-tête identité — tap → page Compte */}
        <TouchableOpacity
          style={[styles.header, { paddingTop: insets.top + 28 }]}
          activeOpacity={0.75}
          onPress={goCompte}
        >
          <Avatar name={CLIENT.name} size={52} />
          <View style={styles.headerText}>
            <Text variant="label">{CLIENT.name}</Text>
            <Text variant="caption" color={Colors.textSecondary}>{CLIENT.phone}</Text>
          </View>
          <Icon name="chevronRight" size={18} color={Colors.textTertiary} />
        </TouchableOpacity>

        {/* La bannière ne vit que dans l'état NON affilié : une fois le rôle
            activé, l'Affiliation redevient une rangée qui porte des chiffres
            (solde, recrutés) — on ne recrute plus quelqu'un qui a déjà signé. */}
        {earnBanner && earnLayout === 'top' && <View style={styles.bannerTop}>{earnBanner}</View>}

        <View style={styles.rule}><Divider /></View>

        <MenuItem icon="account" label="Mon compte & sécurité" onPress={goCompte} />
        <MenuItem
          icon="clock"
          label="Historique"
          onPress={() => { onCloseRef.current(); router.push('/history'); }}
        />
        <MenuItem icon="gift" label="Fidélité" badge="240 pts" />

        {isAffiliate && (
          <>
            <View style={styles.rule}><Divider /></View>
            <MenuItem
              icon="group"
              label="Affiliation"
              subRows={[
                { label: 'Solde disponible', value: '4 200 F' },
                { label: 'Personnes recrutées', value: '12' },
              ]}
            />
          </>
        )}

        {/* Pousse le pied de menu tout en bas */}
        <View style={styles.spacer} />

        {/* Interrupteurs de démo (facilitateurs) : flottent au-dessus du pied,
            hors du flux de la liste — même chip que l'écran searching. Cyclent
            l'état d'Affiliation et la place de la bannière. Invisibles en
            production. */}
        <View style={styles.demoRow}>
          <TouchableOpacity style={styles.demoChip} onPress={cycleAffiliation} activeOpacity={0.85}>
            <Icon name="lightning" size={12} weight="bold" color={Colors.textSecondary} />
            <Text variant="caption" color={Colors.textSecondary}>Démo · Affiliation : {AFFILIATION_DEMO_LABEL[affiliation]}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.demoChip} onPress={cycleEarnLayout} activeOpacity={0.85}>
            <Icon name="lightning" size={12} weight="bold" color={Colors.textSecondary} />
            <Text variant="caption" color={Colors.textSecondary}>Démo · Bannière : {EARN_DEMO_LABEL[earnLayout]}</Text>
          </TouchableOpacity>
        </View>

        {/* « Aide & support » ferme la liste, mais SOUS le spacer : il fermait
            déjà la liste, sauf qu'il flottait au milieu de l'écran vide. Contre
            le pied, il est enfin là où on le cherche (todo P6). */}
        <View style={styles.rule}><Divider /></View>
        <MenuItem icon="help" label="Aide & support" />

        {earnBanner && earnLayout === 'foot' && <View style={styles.bannerFoot}>{earnBanner}</View>}

        {/* Devenir prestataire — carte distincte (couleur Fiw Pro #084EC5), séparée
            de la liste pour NE PAS entrer en collision avec le « Gagner de l'argent »
            de l'Affiliation (benchmark-compte-mobbin.md D4). Renvoie vers Fiw Pro. */}
        <TouchableOpacity style={styles.proCard} activeOpacity={0.85} onPress={onBecomePro}>
          <View style={styles.proIcon}>
            <Icon name="wheel" size={22} color={Colors.primaryOn} />
          </View>
          <View style={styles.proText}>
            <Text variant="label">Devenir prestataire</Text>
            <Text variant="caption" color={Colors.textSecondary}>Conduisez ou livrez avec Fiw Pro.</Text>
          </View>
          <Icon name="chevronRight" size={18} color={Colors.textTertiary} />
        </TouchableOpacity>
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
  // Le filet de section garde son air : la primitive ne porte que le trait.
  rule: { marginVertical: 14 },
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
  badgeWrap: {
    backgroundColor: Colors.primarySubtle,
    borderRadius: Radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  // Bannière « Gagner de l'argent ». Même gouttière (16) et même rayon que la
  // carte du pied : deux blocs de la même famille, seul le poids les sépare.
  earnBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.primary,
    borderRadius: Radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  earnIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earnText: { flex: 1 },
  // Le corps de la bannière respire un peu moins que le titre : deux lignes
  // blanches collées se liraient comme un pavé.
  earnBody: { marginTop: 3, lineHeight: 15, opacity: 0.92 },
  bannerTop: { marginHorizontal: 16, marginBottom: 4 },
  bannerFoot: { marginHorizontal: 16, marginTop: 12 },

  // Interrupteurs de démo : flottent au-dessus de la carte du pied, alignés sur
  // son bord droit (même marge horizontale, 16).
  demoRow: { alignItems: 'flex-end', paddingHorizontal: 16, marginBottom: 10, gap: 8 },
  demoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: Radii.pill,
    paddingVertical: 8, paddingHorizontal: 12,
    borderWidth: Strokes.hairline, borderColor: Colors.hairline,
    ...Shadows.float,
  },
  // Pied de menu épinglé
  spacer: { flex: 1, minHeight: 16 },
  proCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: Colors.primarySubtle, // carte claire, dans le mood de la sidebar
    borderWidth: Strokes.thin,
    borderColor: Colors.blue100,
    borderRadius: Radii.lg,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  proIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary, // même bleu que les initiales de l'avatar (#0066FF)
    alignItems: 'center',
    justifyContent: 'center',
  },
  proText: { flex: 1 },
});
