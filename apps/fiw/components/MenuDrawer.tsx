import React, { useEffect, useRef, useState } from 'react';
import {
  Alert, Animated, PanResponder, ScrollView, TouchableOpacity,
  TouchableWithoutFeedback, View, StyleSheet, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Avatar, { AVATAR_CARD } from '@/components/Avatar';
import Badge from '@/components/Badge';
import Icon from '@/components/Icon';
import List from '@/components/List';
import ListRow from '@/components/ListRow';
import Scrim, { ScrimLevels } from '@/components/Scrim';
import Text from '@/components/Text';
import { Colors, Motion, Radii, Shadows, Strokes } from '@/constants/tokens';
import { CLIENT, COURSE_HISTORY } from '@/constants/data';

const SCREEN_W = Dimensions.get('window').width;
const DRAWER_W = Math.min(Math.round(SCREEN_W * 0.82), 320);
/**
 * Un tiroir est un **conteneur** qui s'installe, pas un composant héros : la
 * règle « Spring for Hero Only » lui retire son ressort. Il prend la même recette
 * que les feuilles — fenêtre `container-morph` et courbe `Hold / Anchor`.
 *
 * Le ressort ne subsiste que pour le LÂCHER du swipe, où la continuité de
 * vélocité est de la physique et non un rebond.
 */
const SLIDE = Motion.window(Motion.duration.containerMorph, Motion.duration.anticipationHold);
/** Ouverture : lente et posée. */
const OPEN_OPTS = {
  delay: SLIDE.delay,
  duration: SLIDE.dur,
  easing: Motion.easing.hold,
  useNativeDriver: true,
} as const;
/** Fermeture : `container-exit`, et **pas** la fenêtre d'ouverture à l'envers.
 *  C'est tout le principe *Asymmetric Timing* — un tiroir qu'on referme dégage
 *  la place tout de suite, il ne se retire pas avec la même componction qu'il a
 *  mise à venir. */
const CLOSE_OPTS = {
  duration: Motion.duration.containerExit,
  easing: Motion.easing.hold,
  useNativeDriver: true,
} as const;
const SPRING = { ...Motion.spring.gentle, useNativeDriver: true };
const CLOSE_DX = DRAWER_W * 0.30; // déplacement minimal pour déclencher la fermeture
const CLOSE_VX = 0.5;              // vélocité minimale (px/ms) pour déclencher la fermeture

// Proto : statut d'affiliation du Client, piloté par l'interrupteur de démo
// (facilitateur) — invisible en production, même langage que le « Démo · … » de
// l'écran searching. Cycle les deux états de l'Affiliation :
//  · none  → non affilié : la bannière promotionnelle vit en haut du tiroir
//  · actif → Affilié Réseau actif : plus de bannière, la rangée du pied porte
//            les chiffres du réseau.
type AffiliationState = 'none' | 'actif';
const AFFILIATION_ORDER: AffiliationState[] = ['none', 'actif'];
const AFFILIATION_DEMO_LABEL: Record<AffiliationState, string> = {
  none: 'Non affilié',
  actif: 'Actif',
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

/**
 * Le **Menu** de l'app — un tiroir latéral, et c'est une décision reprise.
 *
 * ── Pourquoi un tiroir et non une page ────────────────────────────────────────
 * Il l'a été, page, du 4 au 26 septembre 2026 (`app/menu.tsx`). La conversion
 * était bien argumentée côté grammaire — l'alignement sur la partie Compte — mais
 * elle coûtait le **mouvement**, et ce coût n'avait pas été vu au moment de la
 * trancher : une page entre et sort à la vitesse de la plateforme. `native-stack`
 * n'expose ni courbe ni durée par direction (son `animationDuration` est iOS
 * seulement et ne couvre même pas `slide_from_right`), donc l'asymétrie
 * « entrée 500 / sortie 200 » — la mécanique principale de l'identité de
 * mouvement — ne peut pas y vivre. Le tiroir, lui, la porte en propre.
 *
 * Ce qui a été gardé de la page : **tout son contenu**. Les résumés de chaque
 * porte, l'ordre Bolt, le portrait en tête, la zone « Gagner de l'argent », la
 * copie de commission corrigée par la réunion du 30 août. Seul le CONTENANT
 * change — la grammaire de rangées reste celle de la partie Compte, via
 * `List style_="plat"` comme la règle du style guide le demande.
 *
 * ── Ce que la session du 6 septembre 2026 a tranché, et qui tient toujours ────
 * **Quatre natures y vivent** : le portrait, des portes, une proposition
 * récurrente (l'Affiliation) et une proposition lourde (Devenir prestataire).
 * « Montrer » n'en est pas une cinquième, c'est une PROPRIÉTÉ des autres — un
 * chiffre ne devient un élément à lui seul que s'il n'a rien à ouvrir derrière.
 * Fiw n'a aucun chiffre orphelin : Points → Fidélité, courses → Historique. D'où
 * des sous-titres partout, et aucune tuile de statistiques.
 *
 * **L'ordre des portes** — Compte, Historique, Fidélité, Aide — est celui de
 * Bolt, qui ouvre sur le paiement : un moyen de paiement cassé empêche de
 * commander, là qu'un reçu introuvable n'empêche rien.
 *
 * **Les deux propositions d'argent vivent en PIED**, dans une zone « Gagner de
 * l'argent » sans titre : c'est son traitement qui doit la distinguer, pas un
 * libellé — et ce traitement reste à faire.
 */
export default function MenuDrawer({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(-DRAWER_W)).current;
  const [interactive, setInteractive] = useState(false);

  // Interrupteur de démo (facilitateur) : cycle les états de l'Affiliation.
  const [affiliation, setAffiliation] = useState<AffiliationState>('none');
  const isAffiliate = affiliation !== 'none';
  const cycleAffiliation = () => {
    Haptics.selectionAsync();
    const next = AFFILIATION_ORDER[(AFFILIATION_ORDER.indexOf(affiliation) + 1) % AFFILIATION_ORDER.length];
    setAffiliation(next);
  };

  // Fermeture de la bannière. Le proto ne persiste rien : elle ne disparaît que
  // pour la session.
  //
  // La RÈGLE, elle, ne se voit pas ici — le prototype n'a pas de quoi la jouer.
  // Fermer met en SOURDINE, ça ne supprime pas : la bannière revient après un
  // nombre croissant de **Commandes terminées** depuis le dernier refus — 5,
  // puis 10, puis 15, puis 20… sans plafond et sans jamais s'éteindre. Une
  // Commande annulée ne fait pas avancer le compteur (sinon fermer puis annuler
  // trois fois la ferait revenir sans que le Client ait rien vécu), et les
  // livraisons comptent comme les courses : « Commande » couvre tous les
  // services. Le premier refus ne compte qu'à partir de la première Commande
  // terminée — à l'ouverture initiale, fermer c'est ranger, pas refuser.
  // Concrètement, un Client qui la ferme systématiquement la voit six fois sur
  // ses 75 premières courses.
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const dismissBanner = () => {
    Haptics.selectionAsync();
    setBannerDismissed(true);
  };

  // Ref stable pour que le PanResponder (créé une seule fois) lise toujours
  // le onClose courant sans être recréé à chaque render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Une porte ferme le tiroir AVANT de pousser sa route : sans quoi le tiroir
  // resterait ouvert derrière la page qui arrive, et se retrouverait là au
  // retour. C'est la différence de câblage d'avec la page — une page se
  // remplaçait elle-même dans la pile.
  const go = (path: string) => () => { onCloseRef.current(); router.push(path); };
  const goCompte = go('/compte');
  const goAffiliation = go('/affilie/presentation');
  const onBecomePro = () => {
    onCloseRef.current();
    Alert.alert('Fiw Pro', 'Ouvrez ou installez l’application Fiw Pro pour devenir prestataire.');
  };

  // Résumé lu depuis la SOURCE RÉELLE, comme sur « Mon compte & sécurité ».
  // Le décompte vient de `CLIENT.trips` et NON de la longueur de
  // `COURSE_HISTORY` : cette liste est l'échantillon que l'écran Historique
  // affiche (4 entrées), pas le total des courses du Client (87).
  const courses = CLIENT.trips;
  const derniere = COURSE_HISTORY[0]?.date.split(' · ')[0].toLowerCase();
  const historiqueSummary = courses === 0
    ? 'Aucune course pour le moment'
    : `${courses} course${courses > 1 ? 's' : ''}${derniere ? ` · dernière ${derniere}` : ''}`;

  // Voile dérivé de la position du panel : se synchronise automatiquement
  // pendant l'animation d'entrée/sortie ET pendant le swipe. Un tiroir n'a pas
  // de crans à suivre ; il couvre l'essentiel de l'écran, donc le niveau haut —
  // c'est aussi la valeur qu'il portait déjà (0,48), arrondie à l'échelle.
  const scrimOpacity = translateX.interpolate({
    inputRange: [-DRAWER_W, 0],
    outputRange: [0, ScrimLevels.full],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (visible) {
      setInteractive(true);
      Animated.timing(translateX, { toValue: 0, ...OPEN_OPTS }).start();
    } else {
      Animated.timing(translateX, { toValue: -DRAWER_W, ...CLOSE_OPTS }).start(
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

  // Chevron d'une rangée dont la fin est occupée : `ListRow` ne le dessine que
  // quand le slot `trailing` est vide, il faut donc le reposer soi-même à sa
  // spécification (18, tertiaire).
  const chevron = <Icon name="chevronRight" size={18} color={Colors.textTertiary} />;

  // Écart au DS assumé : c'est le seul bloc en BLEU PLEIN de l'app hors bouton.
  // Le plein est le registre du CTA — c'est ce qui fait que la bannière peut
  // occuper le haut du tiroir sans avoir à intercepter par sa seule place. Le
  // glyphe suit la règle du style guide sur les aplats : sur un fond plein,
  // c'est la pastille claire qui porte le glyphe de couleur, jamais l'inverse.
  //
  // La copie a été arrêtée le 6 septembre 2026, sur deux points.
  //  · Le REGISTRE : « des personnes que vous RECRUTEZ » mettait le Client en
  //    position de recruteur, et faisait glisser un différenciateur produit vers
  //    le registre du plan de recrutement — cher à Dakar, où les arnaques au
  //    mobile money sont un vrai sujet. Ce sont les autres qui s'inscrivent.
  //  · Le FOND : la réunion du 30 août (`meeting-recaps/08-30.md`, qui fait foi)
  //    restreint la commission — 2 % sur les courses des **Prestataires**
  //    inscrits avec le code, PAS sur celles des Clients recrutés. « Personnes »
  //    était donc devenu faux. Et « prestataires », pas « chauffeurs » :
  //    l'Affiliation est multi-services, tout Prestataire compte, livreurs
  //    inclus — l'exception de copie du flux Transport ne vaut pas ici.
  const earnBanner = isAffiliate || bannerDismissed ? null : (
    <View style={styles.bannerWrap}>
      <TouchableOpacity style={styles.earnBanner} activeOpacity={0.85} onPress={goAffiliation}>
        <View style={styles.earnIcon}>
          <Icon name="group" size={20} color={Colors.primary} weight="bold" />
        </View>
        <View style={styles.earnText}>
          <Text variant="label" color={Colors.primaryOn}>Gagnez de l&apos;argent avec Fiw !</Text>
          <Text variant="caption" color={Colors.primaryOn} style={styles.earnBody}>
            2 % sur chaque course des prestataires inscrits avec votre code.
          </Text>
        </View>
        <Icon name="chevronRight" size={18} color={Colors.primaryOn} />
      </TouchableOpacity>
      {/* Pastille de fermeture posée À CÔTÉ de la carte, pas dedans : un enfant
          qui dépasse d'une vue à coins arrondis se fait rogner sur Android.
          Même parade que la bannière de l'accueil. */}
      <TouchableOpacity
        style={styles.bannerClose}
        activeOpacity={0.85}
        onPress={dismissBanner}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Icon name="close" size={16} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={interactive ? 'box-none' : 'none'}>
      {/* Voile — opacité liée à la position du panel, tap pour fermer */}
      <TouchableWithoutFeedback onPress={() => onCloseRef.current()}>
        <View style={StyleSheet.absoluteFill}><Scrim opacity={scrimOpacity} /></View>
      </TouchableWithoutFeedback>

      {/* Panel — reçoit les gestes de swipe */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.panel, { transform: [{ translateX }] }]}
      >
        {/* `flexGrow` : c'est lui qui donne au spacer de quoi pousser le pied en
            bas du tiroir quand le contenu ne le remplit pas. */}
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Portrait — tap → page Compte. Il vit ICI et nulle part ailleurs :
              c'est la surface d'atterrissage, il y confirme de qui on parle. Sur
              « Mon compte & sécurité », le même bloc n'était qu'une porte parmi
              cinq, la seule à ne pas être une rangée ; il y est redevenu une
              rangée « Profil ». La Note du Client l'a suivi. */}
          <TouchableOpacity style={styles.identity} activeOpacity={0.7} onPress={goCompte}>
            <Avatar name={CLIENT.name} size={AVATAR_CARD} />
            <View style={styles.identityText}>
              <Text variant="heading2" numberOfLines={1}>{CLIENT.name}</Text>
              <Text variant="bodySmall" color={Colors.textSecondary} numberOfLines={1}>{CLIENT.phone}</Text>
            </View>
            <Icon name="chevronRight" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>

          {/* La bannière est un objet PROMOTIONNEL, distinct de la porte
              permanente du pied. Fermer n'a donc rien à rétrograder : elle
              s'efface, la rangée « Affiliation » du pied n'a jamais bougé et
              reste le chemin de qui la cherche. */}
          {earnBanner}

          {/* Chaque porte porte son résumé en SOUS-TITRE : le titre nomme la
              rubrique, le sous-titre dit ce qu'il y a derrière. Jamais en valeur
              alignée à droite — elle disputerait sa largeur au titre et donnerait
              des rangées de hauteurs inégales.

              Aucun titre de section (tranché le 6 septembre 2026) : deux des
              quatre familles auraient porté un titre qui répète le nom de leur
              unique rangée — « Mon compte » au-dessus de « Mon compte &
              sécurité », « Aide » au-dessus de « Aide & support ». */}
          <List style_="plat" bleed={GUTTER}>
            {/* Le résumé énumère les rubriques de la page fille SANS répéter
                « sécurité », que le titre dit déjà : un sous-titre ajoute, il ne
                redit pas. Termes canoniques (CONTEXT.md), pas d'abréviation. */}
            <ListRow icon="account" title="Mon compte & sécurité" subtitle="Profil, Moyens de paiement, Lieux enregistrés" onPress={goCompte} style={styles.row} />
            <ListRow icon="clock" title="Historique" subtitle={historiqueSummary} onPress={go('/history')} style={styles.row} />
            {/* Le solde de Points est mis en relief par la pastille `Badge` du
                système plutôt que par le slot `value` : 240 pts est ce qu'on vient
                chercher dans cette rangée, pas un résumé de son contenu. Le
                sous-titre dit donc ce que les Points ACHÈTENT — il ne réécrit pas
                le nombre juste à côté. Court par nécessité : la pastille lui prend
                sa largeur, et il reste ~26 signes. */}
            <ListRow
              icon="gift"
              title="Fidélité"
              subtitle="Réductions et gratuités"
              trailing={<View style={styles.trailingGroup}><Badge variant="suggere" label="240 pts" />{chevron}</View>}
              style={styles.row}
            />
            <ListRow icon="help" title="Aide & support" subtitle="Questions fréquentes, nous contacter" trailing={chevron} style={styles.row} />
          </List>

          {/* Pousse la zone d'argent tout en bas */}
          <View style={styles.spacer} />

          {/* Interrupteur de démo (facilitateur) : flotte au-dessus du pied, hors
              du flux de la liste. Invisible en production. */}
          <View style={styles.demoRow}>
            <TouchableOpacity style={styles.demoChip} onPress={cycleAffiliation} activeOpacity={0.85}>
              <Icon name="lightning" size={12} weight="bold" color={Colors.textSecondary} />
              <Text variant="caption" color={Colors.textSecondary}>Démo · Affiliation : {AFFILIATION_DEMO_LABEL[affiliation]}</Text>
            </TouchableOpacity>
          </View>

          {/* ── Zone « Gagner de l'argent » ──────────────────────────────────
              Les deux propositions de Fiw, en permanence, jamais fermables. La
              rangée Affiliation est la PORTE ; la bannière du haut n'est que sa
              promotion — deux éléments distincts, pas deux états d'un seul. C'est
              ce qui garantit qu'aucun Client ne se retrouve sans chemin, même
              après avoir tout fermé : `/affilie/presentation` n'a que ces portes
              dans toute l'app.

              Zone SANS TITRE, par décision : elle doit se distinguer par son
              TRAITEMENT. Ce traitement n'est pas fait — elle atterrit donc en
              deux rangées grises, exactement ce qu'on veut éviter. C'est la
              première chose à reprendre à la passe de caractère.

              Ce que ça change à D4 : « Devenir prestataire » y perd sa carte
              bleue. La décision demandait qu'elle soit « séparée de la liste, de
              style distinct » — elle l'est toujours, mais c'est désormais la ZONE
              qui porte cette distinction, pas la carte seule. Lui laisser son
              aplat aurait fait de la proposition secondaire le bloc le plus fort
              du pied, devant le différenciateur de Fiw. */}
          <List style_="plat" bleed={GUTTER}>
            <ListRow
              icon="group"
              title="Affiliation"
              subtitle={isAffiliate ? '12 prestataires dans votre réseau' : '2 % sur les courses de votre réseau'}
              subtitleAccent={!isAffiliate}
              onPress={goAffiliation}
              style={styles.row}
            />
            <ListRow
              icon="wheel"
              title="Devenir prestataire"
              subtitle="Conduisez ou livrez avec Fiw Pro"
              onPress={onBecomePro}
              style={styles.row}
            />
          </List>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

/** Gouttière du tiroir — celle de la partie Compte, pas les 24 de l'ancienne
 *  sidebar : c'est la même nature de liste, donc la même géométrie (style guide,
 *  « les écrans de réglages sont à plat sur fond blanc »). Le débord de `List`
 *  la reprend en négatif pour que les filets filent d'un bord à l'autre. */
const GUTTER = 20;

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_W,
    backgroundColor: Colors.surface,
    borderTopRightRadius: Radii.xl,
    borderBottomRightRadius: Radii.xl,
    // ⚠️ Écart au design system, hérité et non introduit ici : l'ombre est
    // écrite à la main parce qu'aucun jeton n'est ORIENTÉ — `shadow-float` est
    // diffuse, `shadow-sheet` monte vers le haut, et un tiroir a besoin d'une
    // ombre qui porte vers la droite. Le jour où un deuxième élément latéral
    // apparaît, c'est un jeton `shadow-side` à poser dans la planche.
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 20,
  },
  content: { flexGrow: 1, paddingHorizontal: GUTTER },

  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    // Même respiration que celle qui sépare deux listes (28).
    marginBottom: 28,
  },
  identityText: { flex: 1, gap: 2 },

  // La gouttière du tiroir, reprise par chaque rangée : le débord de la liste
  // fait filer les filets aux bords, le texte reste aligné sous le portrait.
  row: { paddingHorizontal: GUTTER },
  trailingGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  // Bannière « Gagnez de l'argent avec Fiw ! ».
  bannerWrap: { marginBottom: 28 },
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
  bannerClose: {
    position: 'absolute',
    top: -8, right: -8,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Strokes.thin,
    borderColor: Colors.blue100,
  },

  // Interrupteur de démo : flotte au-dessus de la zone d'argent, aligné sur son
  // bord droit (la gouttière du tiroir).
  demoRow: { alignItems: 'flex-end', marginBottom: 10 },
  demoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: Radii.pill,
    paddingVertical: 8, paddingHorizontal: 12,
    borderWidth: Strokes.hairline, borderColor: Colors.hairline,
    ...Shadows.float,
  },

  spacer: { flex: 1, minHeight: 16 },
});
