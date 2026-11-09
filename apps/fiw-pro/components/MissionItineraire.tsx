import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { Colors, Spacing, Strokes } from '@/constants/tokens';
import Icon, { type IconName } from '@/components/Icon';
import Text from '@/components/Text';

export type PointMission = {
  /** Ce que le Client a choisi — « Almadies ». */
  name: string;
  /** L'adresse telle que résolue — « Rue NGB-12, Dakar Ouest ». */
  detail?: string;
  /**
   * **Le Repère** (ADR 0009) : une ligne libre décrivant comment reconnaître
   * l'endroit au sol. « Villa 214, portail vert en face de la boutique ».
   */
  repere?: string | null;
  /**
   * **Le Repère en photo** — piste O1 du benchmark (Bolt Food « View photo »,
   * Wolt). Une façade se reconnaît mieux qu'elle ne se décrit, et à Dakar
   * l'adresse ne résout qu'une parcelle.
   *
   * ⚠️ L'ADR 0009 n'a prévu que du texte. L'ajout demande un amendement daté —
   * il ne contredit pas la décision d'écarter les champs STRUCTURÉS (étage,
   * appartement), qui tenait au fait que le Prestataire ne monte pas : une
   * photo montre une façade, pas un intérieur.
   */
  photo?: ImageSourcePropType | null;
};

/**
 * **L'itinéraire d'une mission, lu par le Prestataire.**
 *
 * ── Pourquoi ce n'est pas `RouteCard` ─────────────────────────────────────
 * `RouteCard` est le composant du Client, et sa fiche est explicite : deux
 * rangées de **38 px exactement**, un libellé tronqué à une ligne. C'est un
 * contrat de géométrie, pas un hasard. Y glisser un Repère — texte libre, qui
 * passe à la ligne par nature — casserait ce contrat pour tous ses emplois.
 * Le style guide donne le test : avant d'ajouter un prop à un composant
 * partagé, se demander si ce n'est pas un composant distinct qui manque. C'en
 * est un.
 *
 * ── Pourquoi le Repère compte plus ici que l'adresse ──────────────────────
 * L'ADR 0009 pose que le Repère est saisi par le Client et **lu par le
 * Prestataire** — c'est tout son intérêt, et c'est la dette que le sitemap Pro
 * signalait depuis août : *« tant que ce n'est pas fait, le Client saisit un
 * Repère que personne ne lit »*. À Dakar, une adresse de rue localise une
 * parcelle ; c'est le Repère qui désigne le portail. La hiérarchie de ce
 * composant le dit : le Repère est posé sous l'adresse, avec son propre
 * glyphe, et il n'est **jamais tronqué**.
 *
 * Il garde malgré tout la grammaire visuelle de `RouteCard` — même rail
 * d'icônes 20, même filet en retrait de 32, mêmes variantes de texte — pour
 * que les deux apps montrent visiblement le même objet. Si le Client devait un
 * jour afficher un Repère lui aussi, c'est ici que les deux composants
 * fusionneraient.
 */
export default function MissionItineraire({
  depart, arrivee, labels, icons, onPhoto, onTraduire, style,
}: {
  depart: PointMission;
  arrivee: PointMission;
  labels?: { from: string; to: string };
  icons?: { from: IconName; to: IconName };
  /** Ouvre la photo du point de prise en charge. */
  onPhoto?: () => void;
  /** Demande la traduction du Repère. */
  onTraduire?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={style}>
      <Point
        point={depart}
        label={labels?.from ?? 'Prise en charge'}
        icon={icons?.from ?? 'walk'}
        onPhoto={onPhoto}
        onTraduire={onTraduire}
      />
      <View style={styles.divider} />
      <Point
        point={arrivee}
        label={labels?.to ?? 'Destination'}
        icon={icons?.to ?? 'flag'}
      />
    </View>
  );
}

function Point({ point, label, icon, onPhoto, onTraduire }: {
  point: PointMission; label: string; icon: IconName;
  onPhoto?: () => void; onTraduire?: () => void;
}) {
  return (
    <View style={styles.row}>
      <Icon name={icon} size={20} weight="bold" color={Colors.gray700} />
      <View style={styles.col}>
        <Text variant="bodySmall" color={Colors.textSecondary}>{label}</Text>
        <Text variant="label" numberOfLines={1}>{point.name}</Text>
        {point.detail ? (
          <Text variant="bodySmall" color={Colors.textSecondary} numberOfLines={1}>
            {point.detail}
          </Text>
        ) : null}
        {point.repere ? (
          // Le Repère n'est PAS tronqué : une phrase coupée au milieu ne permet
          // plus de reconnaître l'endroit, ce qui lui retire sa seule utilité.
          // C'est aussi pour ça qu'il porte son glyphe — il ne se lit pas comme
          // une deuxième ligne d'adresse, mais comme ce qu'on cherche des yeux
          // en arrivant.
          <View style={styles.repereBloc}>
            <View style={styles.repereRow}>
              <Icon name="pin" size={14} weight="bold" color={Colors.primary} />
              <Text variant="bodySmall" color={Colors.textPrimary} style={styles.flex1}>
                {point.repere}
              </Text>
            </View>

            {/* O2 — « Traduire ». Le Repère est écrit par le Client et lu par
                le Prestataire : c'est exactement le texte où l'écart de langue
                coûte une course. Un lien ici coûte moins cher que traduire
                toute l'app, et il se pose là où il sert. Motif Bolt Food. */}
            {onTraduire && (
              <TouchableOpacity onPress={onTraduire} activeOpacity={0.6} style={styles.traduire}>
                <Text variant="captionSemibold" color={Colors.primary}>Traduire en wolof</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        {/* La photo de l'endroit — vignette tappable. Posée APRÈS le Repère
            écrit : c'est la description qui se lit d'abord, la photo qui
            confirme en arrivant. */}
        {point.photo ? (
          <TouchableOpacity style={styles.photoRow} activeOpacity={0.8} onPress={onPhoto}>
            <Image source={point.photo} style={styles.photo} resizeMode="cover" />
            <Text variant="captionSemibold" color={Colors.primary}>Voir la photo du point</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  row: { flexDirection: 'row', gap: Spacing[3], paddingVertical: Spacing[3] },
  col: { flex: 1, gap: 2 },
  // Retrait 32 = icône 20 + gouttière 12, comme `RouteCard`.
  divider: { height: Strokes.thin, backgroundColor: Colors.border, marginLeft: 32 },
  repereBloc: { marginTop: Spacing[1], gap: 2 },
  repereRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  traduire: { paddingVertical: 2, marginLeft: 20 },

  photoRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[2],
    marginTop: Spacing[2],
  },
  photo: { width: 44, height: 44, borderRadius: 10, backgroundColor: Colors.border },
});
