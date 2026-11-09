import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, StyleSheet, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import LeafletMap from '@/components/LeafletMap';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import HoldButton from '@/components/HoldButton';
import Toast, { useToast } from '@/components/Toast';
import Medallion from '@/components/Medallion';
import Avatar from '@/components/Avatar';
import Sheet from '@/components/Sheet';
import MissionRequest from '@/components/MissionRequest';
import { Colors, Radii, SectionLabel, Shadows, Spacing, Strokes } from '@/constants/tokens';
import { topviewSprite } from '@/constants/illustrations';
import { CARTE_BASE, ZONES_DEMANDE } from '@/constants/carte';
import {
  DAKAR_CENTER, MISSION_INCOMING, PRESTATAIRE,
  autonomie, fcfa, walletEtat,
} from '@/constants/data';

/** L'illustration du véhicule, à la taille d'un bandeau de feuille. 112 contre
 *  l'emplacement système de 68 : le dessin déborde son panneau, comme sur la
 *  carte gamme du Client — c'est ce débord qui lui donne sa présence. */
const ILLU_SLOT = 112;

/**
 * **Accueil Fiw Pro (Prestataire).**
 *
 * Carte plein écran + feuille basse + Menu flottant : la grammaire de l'accueil
 * Client (benchmark D10).
 *
 * ── Base retenue sur maquette, 8 novembre 2026 ────────────────────────────
 * Quatre directions de mise en page puis quatre registres de parole ont été
 * maquettés (fichier « Fiw Pro — Explorations Accueil hors ligne »). La base
 * retenue est **la voix neutre et la feuille courte** : l'app CONSTATE un état,
 * elle ne se met pas à dire « je ». Les trois autres registres — Fiw à la
 * première personne, le tutoiement, le silence total — sont écartés pour
 * l'instant ; le plus lourd de conséquence était le « je », qu'il aurait fallu
 * assumer partout, y compris au moment de couper l'accès.
 *
 * ⚠️ **L'illustration du véhicule tombe avec cette base**, et c'est un recul
 * assumé sur la passe d'enrichissement : le bandeau `primarySubtle` + la
 * voiture débordante donnaient sa chair à l'écran. La maquette retenue est
 * plus calme et laisse respirer la carte. Si le caractère manque à l'usage, la
 * voiture revient — en plus petit, à côté du titre et non en bandeau.
 *
 * ── Ce que la passe d'enrichissement a laissé ─────────────────────────────
 * La première version a été jugée trop pauvre à côté de l'app Client, et le
 * reproche était fondé : l'écran n'employait **aucune** des pièces qui font la
 * richesse du Client — ni illustration, ni aplat de marque, ni identité. Il
 * était correct et sans visage. Trois ajouts, chacun repris de quelque chose
 * qui existe déjà plutôt qu'inventé :
 *
 * 1. **Le véhicule est montré.** Le jeu `mobility option` était porté depuis
 *    le premier jour et ne servait nulle part. Le Prestataire voit la machine
 *    avec laquelle il travaille, posée sur un panneau `primarySubtle` qu'elle
 *    déborde — exactement l'anatomie de `GammeCard`. Le même objet graphique
 *    vend une gamme au Client et rappelle son métier au Prestataire.
 * 2. **L'identité flotte sur la carte** (motif Grab Driver) : portrait + Note
 *    du Prestataire, en haut à droite. Elle donne un visage à l'écran le plus
 *    fréquenté de l'app, et elle y est à sa place — c'est sa carte, c'est lui
 *    qu'on y suit.
 * 3. **Le Wallet est une rangée à part entière hors ligne**, teintée selon son
 *    état. C'est hors ligne qu'on découvre qu'on ne pourra pas travailler ; le
 *    dire une fois en ligne, mission refusée, serait trop tard. L'ancienne
 *    version ne l'affichait qu'en cas de problème — donc jamais au moment où
 *    on peut encore l'éviter.
 *
 * ⚠️ Ce qui n'a PAS été repris du corpus : les **cartes flottantes de
 * statistiques** posées sur la carte (Grab en empile trois). Elles sont
 * séduisantes et elles mangent la carte — or la carte est l'outil de travail,
 * pas un fond décoratif. Les mêmes chiffres vivent dans la feuille, où ils ne
 * couvrent rien.
 */
/**
 * **Le point d'activité.** Un disque `success` et un halo qui bat autour.
 *
 * C'est la seule chose de l'écran qui bouge, et c'est volontaire : hors
 * mission, l'app n'a rien à dire — elle doit seulement montrer qu'elle est
 * vivante. Une phrase « Recherche de missions… » le disait avec des mots et
 * occupait une ligne ; un battement le dit sans rien occuper, et se lit du
 * coin de l'œil depuis le siège.
 *
 * `success` et non `primary` : le style guide range « prestataire en ligne »
 * dans les emplois de la couleur de confirmation, pas dans ceux du bleu de
 * marque.
 */
function PointActif() {
  const battement = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const boucle = Animated.loop(
      Animated.sequence([
        Animated.timing(battement, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(battement, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    boucle.start();
    return () => boucle.stop();
  }, []);
  return (
    <View style={styles.pointBoite}>
      <Animated.View
        style={[styles.halo, {
          opacity: battement.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
          transform: [{ scale: battement.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }],
        }]}
      />
      <View style={styles.point} />
    </View>
  );
}

/**
 * **Une porte de l'accueil.** Pastille blanche, libellé, valeur, chevron, sur
 * un bloc `bg` arrondi.
 *
 * ⚠️ **Écart signalé au style guide.** Sa règle dit « les cartes sont pour les
 * objets ; les portes sont à plat » — et une porte à plat, c'est `ListRow`
 * dans une `List`, séparée par un filet. Elle a été écrite pour les écrans de
 * RÉGLAGES, posés à plat sur une page blanche. Ici on est dans une feuille
 * flottante au-dessus d'une carte : il n'y a pas de page à structurer, il y a
 * trois objets à poser sur une surface, et le bloc teinté les sépare mieux
 * qu'un filet qui, sur une feuille courte, se confond avec l'arête de la
 * feuille elle-même.
 *
 * La pastille est en `surface` et non au ton d'un `Medallion` : les deux tons
 * du système (`bg`, `primarySubtle`) disparaîtraient sur le `bg` de la porte.
 * C'est une surcharge de FOND sur un composant système, pas une géométrie
 * réinventée — le disque de 36 et le glyphe de 18 restent ceux de `Medallion`.
 */
function Porte({ icon, label, valeur, fond, encre, onPress, style }: {
  icon: IconName; label: string; valeur: string;
  fond?: string; encre?: string;
  onPress: () => void; style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity
      style={[styles.porte, fond ? { backgroundColor: fond } : null, style]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Medallion icon={icon} size="sm" style={styles.pastille} />
      <View style={styles.flex1}>
        <Text variant="bodySmall" color={Colors.textSecondary}>{label}</Text>
        <Text variant="bodyMedium" color={encre ?? Colors.textPrimary}>{valeur}</Text>
      </View>
      <Icon name="chevronRight" size={18} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

export default function Accueil() {
  const insets = useSafeAreaInsets();
  const [enLigne, setEnLigne] = useState(false);
  const [missionEntrante, setMissionEntrante] = useState(false);
  const attente = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useToast();
  const [minutes, setMinutes] = useState(0);

  const solde = PRESTATAIRE.walletSolde;
  const etat = walletEtat(solde);
  const courses = autonomie(solde);

  // Proto : passer en ligne arme l'arrivée d'une mission. En vrai c'est une
  // notification poussée par l'attribution ; ici c'est un délai, pour que le
  // parcours se joue sans serveur.
  // Le temps passé en ligne. Remis à zéro à chaque sortie.
  useEffect(() => {
    if (!enLigne) { setMinutes(0); return; }
    const t = setInterval(() => setMinutes((v) => v + 1), 60_000);
    return () => clearInterval(t);
  }, [enLigne]);

  useEffect(() => {
    if (enLigne && !missionEntrante) {
      attente.current = setTimeout(() => setMissionEntrante(true), 2500);
    }
    return () => { if (attente.current) clearTimeout(attente.current); };
  }, [enLigne, missionEntrante]);

  const basculer = (v: boolean) => {
    Haptics.selectionAsync();
    setEnLigne(v);
    if (!v) setMissionEntrante(false);
  };

  // ⚠️ **Pas de retour arrière après la sortie**, alors que le benchmark en a
  // relevé un (bandeau + « Undo »). Il venait d'une app où l'on sort d'un
  // simple tap — là, l'undo rattrape un accident. Ici le maintien d'une
  // seconde rend l'accident impossible, et empiler les deux garde-fous
  // reviendrait à ne faire confiance ni à l'un ni à l'autre. Le toast
  // confirme, il ne propose rien : c'est son registre, et sa fiche dit qu'il
  // « ne demande rien ».
  const sortir = () => {
    basculer(false);
    toast.flash('Vous êtes hors ligne');
  };

  // Refus et expiration mènent au même endroit — on retourne en ligne, sans
  // rien dire. `CONTEXT.md` : le Score de coopération n'empêche jamais de
  // travailler, et la formulation doit rester positive, sans pénalité
  // annoncée. Un message après un refus serait exactement ce reproche.
  const relacher = () => setMissionEntrante(false);

  const walletSub =
    etat === 'bloque'
      ? 'Vide — vous ne recevez plus de mission'
      : `${fcfa(solde)} · environ ${courses} course${courses > 1 ? 's' : ''}`;

  // L'encre ne quitte le noir QUE si l'état est anormal. En bleu, la valeur se
  // lisait comme un lien — or le bleu dit « action » dans ce système, et un
  // solde n'est pas une action. Le chevron suffit à dire que la porte s'ouvre.
  const walletEncre =
    etat === 'bas' ? Colors.warningInk : etat === 'bloque' ? Colors.error : undefined;

  return (
    <View style={styles.page}>
      {/* ⚠️ **La carte doit gagner sa place.** Hors ligne elle occupait 60 % de
          l'écran pour n'y montrer qu'un quadrillage gris et un point bleu
          générique : une surface morte, et c'est elle qui rendait l'écran
          fade. Le marqueur passe donc en `prestataire`, ce qui y pose **sa
          propre voiture**, vue du dessus. C'est à la fois vrai (son véhicule
          est bien là) et vivant — le même sprite qui roule pendant la mission.

          Si un jour la demande est cartographiée, c'est ici qu'elle viendra :
          une carte d'accueil doit porter quelque chose, sinon il faut la
          réduire. */}
      <LeafletMap
        // Centre décalé AU SUD du véhicule : la carte occupe tout l'écran, son
        // centre tombe donc derrière la feuille. Sans ce décalage la voiture
        // est coupée en deux par l'arête de la feuille.
        // Cadrage : il doit tenir les zones de demande ET le véhicule, la
        // moitié basse étant mangée par la feuille. D'où un centre poussé au
        // sud-ouest de la ville plutôt que sur le véhicule.
        center={{ lat: 14.7110, lng: -17.4950 }}
        zoom={12.4}
        markers={[{ lat: DAKAR_CENTER.lat, lng: DAKAR_CENTER.lng, type: 'prestataire' }]}
        vehicleSprite={topviewSprite('auto')}
        demande={ZONES_DEMANDE}
        {...CARTE_BASE}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ── Une seule porte vers le Menu ────────────────────────────────
          Il y en avait DEUX : le bouton hamburger à gauche et la pastille
          d'identité à droite, toutes deux vers `/menu`, à six centimètres
          l'une de l'autre. Deux objets qui ne se ressemblent pas et font la
          même chose se lisent comme deux destinations — on en essaie un, puis
          l'autre, pour découvrir qu'on tourne en rond.
          _(La redondance volontaire D3 du Client ne s'applique pas ici : elle
          tenait à deux entrées de NATURES différentes dans une page qu'on lit
          de haut en bas, pas à deux boutons flottants côte à côte.)_

          Celle qui reste est la pastille, **posée à la place du hamburger** :
          la position porte la convention « menu », le contenu porte l'identité.
          On ne perd ni l'une ni l'autre.

          Liseré `hairline` + `shadow-float` — la règle du style guide pour
          tout ce qui se pose sur la carto. */}
      <View style={[styles.topRow, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <TouchableOpacity style={styles.identite} activeOpacity={0.85} onPress={() => router.push('/menu')}>
          <Avatar name={PRESTATAIRE.name} size={34} />
          <View style={styles.noteRow}>
            <Icon name="star" size={11} weight="fill" color={Colors.brandYellow} />
            <Text variant="captionSemibold">{PRESTATAIRE.note.toLocaleString('fr-FR')}</Text>
          </View>
          <Icon name="chevronDown" size={14} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <Sheet floating style={[styles.sheet, { paddingBottom: insets.bottom + Spacing[4] }]}>
        {enLigne ? (
          <>
            {/* ── Pas d'aplat de couleur pour l'état ─────────────────────
                Il a porté un panneau `successSubtle` plein. Deux torts : un
                vert franc dans une app dont la marque est bleue sonne hors
                marque, et la règle invoquée pour le justifier — « success =
                prestataire en ligne » — parle d'un **point d'état**, pas d'un
                panneau entier.

                Le corpus est unanime et je ne l'avais pas regardé : Lyft,
                Grab et Bolt gardent une feuille **blanche** et laissent l'état
                à un petit élément — un point, ou la couleur du bouton. Aucun
                ne teinte le panneau.

                Ce qui porte l'état ici : le point qui bat, et le fait que la
                feuille ne propose plus de CTA. */}
            <View style={styles.enLigneHaut}>
              <PointActif />
              <View style={styles.flex1}>
                <Text variant="bodyMedium">En ligne</Text>
                <Text variant="bodySmall" color={Colors.textSecondary}>
                  depuis {minutes} min · dernière course {fcfa(PRESTATAIRE.derniereCourse)}
                </Text>
              </View>
              <HoldButton label="Sortir" labelTenu="Relâchez…" onConfirm={sortir} />
            </View>

            {etat !== 'sain' && (
              <Porte
                icon="wallet"
                label="Mon Wallet"
                valeur={walletSub}
                fond={etat === 'bloque' ? Colors.errorSubtle : Colors.warningSubtle}
                encre={walletEncre}
                onPress={() => router.push('/wallet')}
                style={styles.portesHorsLigne}
              />
            )}
          </>
        ) : (
          <>
            <Text variant="display">Vous êtes hors ligne</Text>
            <Text variant="body" color={Colors.textSecondary} style={styles.phrase}>
              {etat === 'bloque'
                ? 'Votre Wallet est vide : rechargez-le pour pouvoir repasser en ligne.'
                : 'La demande est forte aux Almadies, à 4 minutes de vous.'}
            </Text>

            {/* Le chiffre du jour. Hors ligne, c'est la seule chose que le
                Prestataire a envie de voir, et c'est ce qui manquait : l'écran
                constatait un état sans rien montrer de sa journée.

                ⚠️ **En teinte, pas en plein.** Il a d'abord porté l'aplat
                `primary` — et l'écran s'est retrouvé avec DEUX blocs bleus
                pleins empilés, dont un qui n'est pas une action. Le bleu
                entrait en concurrence avec lui-même et le CTA cessait d'être
                le point d'arrivée de l'œil. La règle du système le disait
                déjà : le plein de marque appartient à l'action. Un seul plein
                par écran, et c'est le bouton. */}
            <TouchableOpacity
              style={styles.jour}
              activeOpacity={0.85}
              onPress={() => router.push('/gains')}
            >
              <View style={styles.flex1}>
                <Text variant="caption" color={Colors.textSecondary} style={styles.kicker}>
                  ENCAISSÉ AUJOURD'HUI
                </Text>
                <Text variant="displayXl" color={Colors.textPrimary}>{fcfa(PRESTATAIRE.gainsJour)}</Text>
                <Text variant="bodySmall" color={Colors.textSecondary}>
                  {PRESTATAIRE.coursesJour} courses · dernière {fcfa(PRESTATAIRE.derniereCourse)}
                </Text>
              </View>
              <Icon name="chevronRight" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>

            <Porte
              icon="wallet"
              label="Mon Wallet"
              valeur={walletSub}
              fond={etat === 'bloque' ? Colors.errorSubtle : etat === 'bas' ? Colors.warningSubtle : undefined}
              encre={walletEncre}
              onPress={() => router.push('/wallet')}
              style={styles.portesHorsLigne}
            />

            <Button
              label={etat === 'bloque' ? 'Pourquoi je ne peux pas ?' : 'Passer en ligne'}
              variant={etat === 'bloque' ? 'secondary' : 'primary'}
              onPress={() => (etat === 'bloque' ? router.push('/bloque?motif=wallet') : basculer(true))}
              style={styles.cta}
            />
          </>
        )}
      </Sheet>

      <Toast message={toast.message} opacity={toast.opacity} />

      {missionEntrante && (
        <MissionRequest
          mission={MISSION_INCOMING}
          onAccept={() => { setMissionEntrante(false); router.push('/mission/navigating'); }}
          onRefuse={relacher}
          onExpire={relacher}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg },
  flex1: { flex: 1 },

  topRow: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: Spacing[4],
  },
  identite: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[2],
    backgroundColor: Colors.surface,
    borderRadius: Radii.pill,
    paddingLeft: 4, paddingRight: Spacing[2], paddingVertical: 4,
    borderWidth: Strokes.hairline, borderColor: Colors.hairline,
    ...Shadows.float,
  },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },

  sheet: { paddingHorizontal: Spacing[4], paddingTop: Spacing[4], gap: Spacing[2] },

  // ── En ligne ──

  enLigneHaut: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], paddingVertical: Spacing[2] },

  // Le point et son halo : 10 de disque, le halo part de la même taille et
  // grandit jusqu'à 2,6 fois en s'effaçant.
  pointBoite: { width: 10, height: 10, alignItems: 'center', justifyContent: 'center' },
  point: { width: 10, height: 10, borderRadius: Radii.pill, backgroundColor: Colors.success },
  halo: { position: 'absolute', width: 10, height: 10, borderRadius: Radii.pill, backgroundColor: Colors.success },

  porte: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[3],
    backgroundColor: Colors.bg,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[3],
  },
  pastille: { backgroundColor: Colors.surface },
  portes: { gap: Spacing[2], marginTop: Spacing[4] },

  // ── Hors ligne ──

  phrase: { marginTop: Spacing[2] },
  jour: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[3],
    backgroundColor: Colors.primarySubtle,
    borderRadius: Radii.card,
    paddingHorizontal: Spacing[5], paddingVertical: Spacing[5],
    marginTop: Spacing[6],
  },
  kicker: { ...SectionLabel },
  portesHorsLigne: { marginTop: Spacing[2] },


  cta: { marginTop: Spacing[6] },
});
