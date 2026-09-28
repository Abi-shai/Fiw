import React, { useState } from 'react';
import { Alert, ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Avatar, { AVATAR_CARD } from '@/components/Avatar';
import HandWithCash from '@/components/HandWithCash';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import List from '@/components/List';
import ListRow from '@/components/ListRow';
import ScreenHeader from '@/components/ScreenHeader';
import Text from '@/components/Text';
import { Colors, Radii, Shadows, Strokes } from '@/constants/tokens';
import { CLIENT, COURSE_HISTORY } from '@/constants/data';

/** Côté de la vignette illustrée. 64, la valeur de `promoTile` sur l'accueil :
 *  ce bloc EST la bannière de l'accueil, reprise à l'identique. */
const PROMO_TILE = 64;

// Proto : statut d'affiliation du Client, piloté par l'interrupteur de démo
// (facilitateur) — invisible en production, même langage que le « Démo · … » de
// l'écran searching. Cycle les deux états de l'Affiliation :
//  · none  → non affilié : le bloc du pied annonce la commission
//  · actif → Affilié Réseau actif : le même bloc porte les chiffres du réseau.
type AffiliationState = 'none' | 'actif';
const AFFILIATION_ORDER: AffiliationState[] = ['none', 'actif'];
const AFFILIATION_DEMO_LABEL: Record<AffiliationState, string> = {
  none: 'Non affilié',
  actif: 'Actif',
};

/** La page **Menu** de l'app — une page, pas un tiroir. C'était un panneau
 *  latéral à 82 % de large, superposé à l'accueil avec voile et geste de
 *  fermeture ; elle entre désormais dans la pile de navigation comme n'importe
 *  quelle autre page (cf. style-guide, « Transitions & navigation »).
 *
 *  Sa grammaire est celle de la partie Compte, et c'est la règle du style
 *  guide : « les écrans de réglages sont à plat sur fond blanc, rangées
 *  séparées par un filet de bord à bord ».
 *
 *  Elle garde le nom **Menu** : c'est le mot du benchmark pour ce modèle
 *  d'architecture (« profil-mince + menu »), et la page en est bien le menu —
 *  Historique, Fidélité, Affiliation et Aide y sont les FRÈRES du portrait, pas
 *  des réglages.
 *
 *  ── Ce que la session du 6 septembre 2026 a tranché ────────────────────────
 *  **Quatre natures y vivent** : le portrait, des portes, une proposition
 *  récurrente (l'Affiliation) et une proposition lourde (Devenir prestataire).
 *  « Montrer » n'en est pas une cinquième, c'est une PROPRIÉTÉ des autres —
 *  règle tirée du bench Mobbin : un chiffre ne devient un élément à lui seul
 *  que s'il n'a rien à ouvrir derrière (les kilomètres de Waymo, le CO₂ d'Uber).
 *  Fiw n'a aucun chiffre orphelin : Points → Fidélité, courses → Historique.
 *  D'où des sous-titres partout, et aucune tuile de statistiques.
 *
 *  **L'ordre des portes** — Compte, Historique, Fidélité, Aide — est celui de
 *  Bolt, qui ouvre sur le paiement : un moyen de paiement cassé empêche de
 *  commander, là qu'un reçu introuvable n'empêche rien. C'est l'ordre qu'avait
 *  le tiroir ; il est désormais décidé, plus hérité.
 *
 *  **Les deux propositions d'argent vivent en PIED**, dans une zone « Gagner de
 *  l'argent » sans titre : c'est son traitement qui doit la distinguer, pas un
 *  libellé. Six des huit apps du bench les placent en bas ou en milieu de liste.
 *
 *  ── Ce que la session du 14 septembre 2026 a tranché ───────────────────────
 *  **Le traitement, c'est UN BLOC ET UN LIEN.** L'Affiliation garde un bloc
 *  illustré à son identité ; « Devenir prestataire » descend au texte-lien. Le
 *  poids suit la FRÉQUENCE de la décision, pas l'importance de la rubrique :
 *  l'Affiliation se gagne par la répétition, Devenir prestataire par la seule
 *  trouvabilité au moment où l'idée vient. Voir le commentaire de la zone, plus
 *  bas — une paire de cartes jumelles a été construite et écartée en chemin.
 *
 *  **La bannière promotionnelle du haut est SUPPRIMÉE.** L'argument qui la
 *  tenait était faux : on écrivait « l'Affiliation n'est annoncée nulle part
 *  ailleurs », alors que l'accueil la porte déjà — `AffiliePromo` vit dans la
 *  carte principale de la feuille, sous « De quoi avez-vous besoin ? », au-dessus
 *  des deux tuiles de service. C'est l'emplacement le plus vu de l'app ; la
 *  bannière du Menu n'y ajoutait presque aucune portée, et disait deux fois la
 *  même chose sur une page (promotion en haut, porte permanente en pied). En
 *  tiroir, elle se lisait comme un prolongement de l'accueil sur lequel le
 *  panneau était posé ; sur une page de destination, elle se lit comme une
 *  publicité en tête d'un endroit où l'on est venu exprès.
 *
 *  ⚠️ **La règle de sourdine croissante n'est pas morte, elle DÉMÉNAGE.** Fermer
 *  mettait en sourdine sans supprimer : la bannière revenait après un nombre
 *  croissant de **Commandes terminées** depuis le dernier refus — 5, puis 10,
 *  puis 15, puis 20… sans plafond et sans jamais s'éteindre ; une Commande
 *  annulée ne faisait pas avancer le compteur (sinon fermer puis annuler trois
 *  fois l'aurait fait revenir sans que le Client ait rien vécu) ; les livraisons
 *  comptaient comme les courses ; et le premier refus ne comptait qu'à partir de
 *  la première Commande terminée — à l'ouverture initiale, fermer c'est ranger,
 *  pas refuser. Cette règle appartient désormais à la bannière de l'ACCUEIL, qui
 *  est celle qui intercepte et qui ne persiste rien aujourd'hui. Elle n'est pas
 *  implémentée là-bas : l'accueil n'a pas été touché (décision explicite).
 *  _(Implémentée le 27 septembre 2026 : `hooks/useAffiliePromo.ts`, non
 *  persistée — le proto n'a pas de stockage.)_ */
export default function MenuScreen() {
  const insets = useSafeAreaInsets();

  // Interrupteur de démo (facilitateur) : cycle les états de l'Affiliation.
  const [affiliation, setAffiliation] = useState<AffiliationState>('none');
  const isAffiliate = affiliation !== 'none';
  const cycleAffiliation = () => {
    Haptics.selectionAsync();
    const next = AFFILIATION_ORDER[(AFFILIATION_ORDER.indexOf(affiliation) + 1) % AFFILIATION_ORDER.length];
    setAffiliation(next);
  };

  // Résumé lu depuis la SOURCE RÉELLE, comme sur « Mon compte & sécurité ».
  // Le décompte vient de `CLIENT.commandes` et NON de la longueur de
  // `COURSE_HISTORY` : cette liste est l'échantillon que l'écran Historique
  // affiche (4 entrées), pas le total du Client (87).
  //
  // Le champ compte toutes les **Commandes**, tous services ; on l'affiche en
  // « courses » parce que c'est l'étiquette de la Commande dans l'app Client
  // (`CONTEXT.md`). Le libellé n'a donc pas à changer le jour où la Livraison
  // revient dans le MVP : il couvrait déjà les deux.
  const courses = CLIENT.commandes;
  const derniere = COURSE_HISTORY[0]?.date.split(' · ')[0].toLowerCase();
  const historiqueSummary = courses === 0
    ? 'Aucune course pour le moment'
    : `${courses} course${courses > 1 ? 's' : ''}${derniere ? ` · dernière ${derniere}` : ''}`;

  // Le portrait ET la rangée « Mon compte & sécurité » menaient au même écran :
  // redondance VOLONTAIRE (cf. benchmark-compte-mobbin.md D3). Ne pas
  // « nettoyer » l'un des deux.
  // _Amendé le 28 septembre 2026 : le portrait mène désormais à la fiche
  // PROFIL, la rangée reste la porte de la page Compte. Ce que D3 protégeait —
  // un chemin écrit pour qui suit les mots plutôt que l'avatar — est porté par le
  // lien « Voir mon profil » lui-même. Les deux portes restent : l'une ouvre la
  // fiche de la personne affichée, l'autre le hub._
  const goCompte = () => router.push('/compte');
  const goProfil = () => router.push('/compte/profil');
  const goAffiliation = () => router.push('/affilie/presentation');
  const onBecomePro = () =>
    Alert.alert('Fiw Pro', 'Ouvrez ou installez l’application Fiw Pro pour devenir prestataire.');

  // Chevron d'une rangée dont la fin est occupée : `ListRow` ne le dessine que
  // quand le slot `trailing` est vide, il faut donc le reposer soi-même à sa
  // spécification (18, tertiaire).
  const chevron = <Icon name="chevronRight" size={18} color={Colors.textTertiary} />;

  return (
    <View style={styles.page}>
      {/* Interrupteur de démo (facilitateur) : dans le slot d'action DROIT de
          `ScreenHeader`, sur la ligne du titre. Invisible en production. Il
          flottait au-dessus du pied ; il y disputait l'attention à la seule
          chose que cette zone doit vendre. Il garde sa pilule blanche à liseré
          et son ombre — le même objet que le « Démo · … » de `searching`, et
          c'est cette constance qui le fait reconnaître comme un facilitateur
          plutôt que comme un élément de l'app. */}
      <ScreenHeader
        title="Menu"
        right={
          <TouchableOpacity style={styles.demoChip} onPress={cycleAffiliation} activeOpacity={0.85}>
            <Icon name="lightning" size={12} weight="bold" color={Colors.textSecondary} />
            <Text variant="caption" color={Colors.textSecondary}>Démo · Affiliation : {AFFILIATION_DEMO_LABEL[affiliation]}</Text>
          </TouchableOpacity>
        }
      />

      {/* `flexGrow` : c'est lui qui donne au spacer de quoi pousser le pied en
          bas de l'écran quand le contenu ne remplit pas la page. */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Portrait — tap → fiche **Profil**. Il vit ICI et nulle part
            ailleurs : c'est la page d'atterrissage, il y confirme de qui on
            parle. Sur « Mon compte & sécurité », le même bloc n'était qu'une
            porte parmi cinq, la seule à ne pas être une rangée ; il y est
            redevenu une rangée « Profil ». La Note du Client l'a suivi.

            **En COLONNE centrée, façon Yango** (demandé le 14 septembre 2026,
            fait le 27) : avatar au-dessus, nom, téléphone, puis le lien. Seul
            l'ARRANGEMENT vient de Yango, pas le style — on garde les initiales
            et l'`Avatar` maison en `contour`, pas la silhouette générique.

            · **Taille gardée à 64** (`AVATAR_CARD`). Yango est bien plus grand,
              mais grossir, c'est rendre de la masse à un portrait qu'on vient de
              vider de son aplat pour qu'il cesse de tirer l'œil. Et 64 est une
              taille du système, aux initiales typées par la maquette (`heading1`) ;
              au-delà on tombe dans les avatars « héros » à valeur libre.
            · **La porte se dit par une PASTILLE : « Voir mon profil »**
              (28 septembre 2026). Sans signe, le portrait se lisait comme un
              bloc posé là ; on doit savoir AVANT de taper qu'il mène ailleurs.
              Un chevron collé au nom a été essayé d'abord, et réglé en cinq
              passes (encre, taille, écart, graisse) sans jamais tenir : le caret
              `bold`, le plus épais de Phosphor en contour, reste plus fin que les
              fûts d'un `heading2` (1,5 contre ~2,3 mesurés), et centrer le groupe
              nom + chevron sort le nom de l'axe de l'avatar. Le bench Mobbin a
              tranché (benchmark-compte-mobbin.md, amendement de D3) : un portrait
              centré qui est une porte le dit sous le nom, par une pastille
              (Photoroom, Wise, Grok) ou un lien (monday.com), et l'action vient
              TOUJOURS après les lignes d'identité. Le lien `link sm` a été posé
              d'abord ; la pastille l'a emporté à l'écran, le même jour. Voir la
              règle du style guide « Un portrait centré dit sa porte par une
              pastille ».
            · **Le téléphone reste**, entre le nom et la pastille : c'est
              l'identifiant du compte Fiw (connexion par code SMS), là où le
              corpus met un e-mail ou un pseudo.
            · **Le portrait et sa pastille mènent à la fiche Profil**, plus à la
              page Compte (décidé par elle le 28 septembre 2026). Le libellé doit
              dire vrai, et le portrait montre exactement ce que cette fiche
              édite : photo, nom, téléphone. La rangée « Mon compte & sécurité »
              reste la porte du hub.
            · **Écart avatar → nom : 14**, celui de la rangée, simplement passé
              à la verticale (même écart que sous l'avatar de la clôture).
              **Téléphone → pastille : 10**, voir `identity`. Les espacements de
              la page sont le chantier suivant. */}
        <View style={styles.identity}>
          <TouchableOpacity style={styles.portrait} activeOpacity={0.7} onPress={goProfil}>
            {/* Portrait en CONTOUR : fond `surface`, liseré `borderSubtle`,
                initiales `gray700`. Plus aucune couleur de marque — ni l'aplat,
                ni les lettres. Il en faisait l'élément le plus coloré d'une page
                dont la seule chose à mettre en avant est la proposition du pied,
                et il ne confirme qu'une identité. _(14 septembre 2026.)_ */}
            <Avatar name={CLIENT.name} size={AVATAR_CARD} variant="contour" />
            <View style={styles.identityText}>
              <Text variant="heading2" align="center" numberOfLines={1}>{CLIENT.name}</Text>
              <Text variant="bodySmall" align="center" color={Colors.textSecondary}>{CLIENT.phone}</Text>
            </View>
          </TouchableOpacity>
          {/* `Button variant="secondary" size="sm"` du système : pilule
              transparente à contour gris, encre `textPrimary`. Elle reste dans la
              famille du portrait — un CONTOUR sans aplat, comme l'`Avatar`
              `contour` au-dessus — et n'y rapporte donc pas la masse de couleur
              qu'on lui a retirée ; c'est aussi pourquoi elle n'est pas bleue.
              Hors du `TouchableOpacity` du portrait : deux zones de frappe qui
              mènent au même endroit, pas une imbriquée dans l'autre. */}
          <Button label="Voir mon profil" variant="secondary" size="sm" onPress={goProfil} style={styles.profilLink} />
        </View>

        {/* Chaque porte porte son résumé en SOUS-TITRE : le titre nomme la
            rubrique, le sous-titre dit ce qu'il y a derrière. Jamais en valeur
            alignée à droite — elle disputerait sa largeur au titre et donnerait
            des rangées de hauteurs inégales.

            Aucun titre de section sur cette page (tranché le 6 septembre 2026) :
            deux des quatre familles auraient porté un titre qui répète le nom de
            leur unique rangée — « Mon compte » au-dessus de « Mon compte &
            sécurité », « Aide » au-dessus de « Aide & support ». */}
        <List style_="plat" bleed={20}>
          {/* Le résumé énumère les rubriques de la page fille SANS répéter
              « sécurité », que le titre dit déjà : un sous-titre ajoute, il ne
              redit pas. Termes canoniques (CONTEXT.md), pas d'abréviation. */}
          <ListRow icon="account" title="Mon compte & sécurité" subtitle="Profil, Moyens de paiement, Lieux enregistrés" onPress={goCompte} style={styles.row} />
          <ListRow icon="clock" title="Historique" subtitle={historiqueSummary} onPress={() => router.push('/history')} style={styles.row} />
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

        {/* ── Zone « Gagner de l'argent » ────────────────────────────────────
            Les deux propositions de Fiw, en permanence, jamais fermables.
            `/affilie/presentation` n'a que cette porte dans toute l'app, et
            « Devenir prestataire » est la seule de Fiw vers Fiw Pro.

            Zone SANS TITRE, par décision : elle se distingue par son TRAITEMENT.
            Ce traitement, c'est **un bloc et un lien** — pas deux blocs.

            Une paire de cartes jumelles a été construite, regardée, puis
            écartée le 14 septembre 2026 : elles ne diffèraient que d'un cran de
            bleu, et cet écart-là disait « presque pareil » alors que les deux
            propositions ne sont pas du tout de même nature. Le tiroir posait
            pourtant la bonne intuition — « deux blocs de la même famille, seul
            le POIDS les sépare » — mais il la posait d'un aplat PLEIN contre une
            carte claire : un écart de famille, pas de nuance. En ramenant les
            deux au clair, on avait gardé la phrase et perdu l'écart.

            **L'Affiliation seule garde le bloc, et il est à son identité.**
            `blue100` est déjà le fond de sa bannière sur l'accueil (`home.tsx`,
            `promoCard`) et `HandWithCash` son illustration : on ne lui invente
            pas une identité, on la reconnaît d'un écran à l'autre. Elle est le
            différenciateur de Fiw face à Yango, c'est sur elle que le client
            veut l'accent, et elle se gagne par la RÉPÉTITION — donc par une
            présence visuelle tenue.

            Ce que ça change à D4 : « Devenir prestataire » ne reprend PAS sa
            carte. D4 exigeait un « élément séparé de la liste, de style
            distinct » ; un texte-lien centré sous un bloc illustré l'est autant
            qu'une carte l'était — il n'appartient à aucune liste et ne ressemble
            à rien d'autre sur la page. Ce qu'il abandonne, c'est le POIDS, et
            c'est le but. */}
        <TouchableOpacity style={styles.promoCard} activeOpacity={0.85} onPress={goAffiliation}>
          <View style={styles.promoTile}>
            {/* Position du carré NON pivoté : la rotation RN se fait autour du
                centre, on vise donc le centre (25.52 ; 40.71) relevé sur la
                maquette. Valeurs de `home.tsx`, au centième près. */}
            <View style={styles.promoIllo}><HandWithCash width={52} /></View>
          </View>
          {/* Deux copies, parce que le bloc ne s'adresse pas au même Client.
              Au NON-AFFILIÉ il propose, et il le fait avec les mots EXACTS de
              la bannière de l'accueil — titre et sous-titre. À l'AFFILIÉ il n'a
              plus rien à proposer : il redevient la porte de son tableau de
              bord et reprend son nom de rubrique.

              Le bloc a porté sa propre phrase jusqu'au 14 septembre 2026
              (« 2 % sur les courses des prestataires inscrits avec votre
              code. »), construite pour ouvrir sur le chiffre — l'hameçon d'une
              offre. Elle est abandonnée au profit de l'alignement des deux
              écrans : une même proposition, une même phrase, reconnaissable
              sans relecture. Si elle devait revenir, se souvenir qu'elle ne
              descend pas sous la soixantaine de signes sans perdre l'un de ses
              trois faits porteurs — le 2 %, les **Prestataires** (le recap du
              30 août a retiré les Clients recrutés du périmètre) et le **code**
              comme mécanisme.

              ⚠️ `CONTEXT.md` : `Affilié Réseau` ne s'abrège JAMAIS en
              « Affilié » — le mot seul désigne la personne recrutée, soit le
              rôle inverse. Et `parrain`/`parrainé` sont proscrits. */}
          <View style={styles.promoText}>
            {/* Titre et sous-titre vont chacun jusqu'à deux lignes. La
                troncature à une ligne est la règle de `ListRow`, faite pour que
                des rangées voisines gardent la même hauteur ; ce bloc n'est pas
                une rangée, et il n'a plus de voisin depuis que « Devenir
                prestataire » est passé au lien. */}
            <Text variant="bodyMedium" numberOfLines={2}>
              {isAffiliate ? 'Affiliation' : 'Gagnez de l’argent avec Fiw !'}
            </Text>
            {/* Le sous-titre est celui de l'ACCUEIL, mot pour mot : les deux
                bannières disent désormais exactement la même chose, titre et
                sous-titre (14 septembre 2026). Le bloc portait jusque-là sa
                propre phrase — « 2 % sur les courses des prestataires inscrits
                avec votre code. » — qui donnait le chiffre là où l'accueil pose
                la question ; l'alignement des deux écrans l'emporte.

                Une SEULE ligne, ellipse comprise. ⚠️ Ligne PARTAGÉE avec
                `app/home.tsx` : toute retouche se fait des deux côtés.

                L'état AFFILIÉ garde ses deux lignes : ce n'est plus une
                proposition mais un état, « 12 prestataires dans votre réseau »
                n'a pas à se couper sur le mot « réseau ». */}
            <Text
              variant="body"
              color={Colors.textSecondary}
              numberOfLines={isAffiliate ? 2 : 1}
            >
              {isAffiliate
                ? '12 prestataires dans votre réseau'
                : 'Et si vous deveniez un affilié réseau ?'}
            </Text>
          </View>
          <Icon name="chevronRight" size={18} color={Colors.textTertiary} />
        </TouchableOpacity>

        {/* « Devenir prestataire » descend au TEXTE-LIEN (14 septembre 2026).
            Testé sur planches contre une carte pleine et une carte détourée,
            à empreinte égale ; c'est la forme la plus légère qui a été retenue.

            **Le poids suit la fréquence de la décision, pas l'importance de la
            rubrique.** Devenir prestataire est une décision unique et lourde :
            on ne la prend pas deux fois, et on ne la prend pas parce qu'une
            carte l'a rappelée — elle se gagne par la TROUVABILITÉ au moment où
            l'idée vient. L'Affiliation, elle, se gagne par la répétition. Deux
            cartes jumelles donnaient à la décision rare le poids de la
            proposition récurrente ; le lien rend l'écart à sa vraie mesure.

            `Button variant="link"` du système, jamais un `Text` bleu fait main :
            il porte la typo `buttonMdLink` (15/20 Medium — le lien se lit comme
            du texte, pas comme un plein) et l'opacité 0,55 au pressé.

            ⚠️ Le sous-titre s'en va avec la carte — un lien n'en porte pas. La
            mention « Fiw Pro » ne survit donc plus que dans l'alerte au tap,
            juste en dessous : c'est elle, désormais, qui prévient le Client
            qu'il s'agit d'une AUTRE application. Ne pas l'alléger. */}
        <Button
          label="Devenir prestataire"
          variant="link"
          onPress={onBecomePro}
          style={styles.proLink}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Page blanche, gouttière 20 : les mêmes que « Mon compte & sécurité ». Sans
  // carte, ce sont les filets qui portent la structure — gris sur blanc tient
  // un contraste que le gris sur gris perdait, ce qui compte pour un écran lu
  // dehors.
  page: { flex: 1, backgroundColor: Colors.surface },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 8 },

  // Colonne centrée (27 septembre 2026) : les valeurs de la rangée d'avant,
  // réorientées — aucune n'a changé.
  identity: {
    alignItems: 'center',
    // 10 entre le téléphone et la pastille : l'écart que `compte/profil` met
    // déjà entre son portrait et son action (`photoWrap`). Le lien essayé avant
    // elle s'en tenait à 2, sa `linkBox` apportant l'air ; une pastille n'a pas
    // de marge à elle.
    gap: 10,
    paddingVertical: 12,
    // Même respiration que celle qui sépare deux listes (28).
    marginBottom: 28,
  },
  // Toute la largeur en zone de frappe, comme l'était la rangée.
  portrait: { alignSelf: 'stretch', alignItems: 'center', gap: 14 },
  // Les deux lignes prennent toute la largeur et se centrent par `align` : un
  // nom trop long finit ainsi en « … » au bord de la gouttière.
  identityText: { alignSelf: 'stretch', gap: 2 },
  profilLink: { alignSelf: 'center' },

  // La gouttière de page, reprise par chaque rangée : le débord de la liste
  // fait filer les filets aux bords, le texte reste aligné sous le portrait.
  row: { paddingHorizontal: 20 },
  trailingGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  // ── Le bloc du pied ────────────────────────────────────────────────────
  // C'est `promoCard` de l'accueil, repris À L'IDENTIQUE — pas « inspiré de ».
  // Rayon, fond, paddings, gouttière, vignette, gap du texte, couleur du
  // chevron : tout vient de `home.tsx`. Seul le CONTENU du sous-titre change,
  // l'accueil posant la question (« Et si vous deveniez un affilié réseau ? »)
  // là où le Menu donne le chiffre.
  //
  // **Pourquoi à l'identique et non « adapté ».** C'est la MÊME proposition sur
  // deux écrans. Un habitué qui la reconnaît du premier coup d'œil n'a pas à
  // relire ; deux variantes proches auraient coûté cette reconnaissance sans
  // rien apporter. Corollaire de tenue : toute retouche ici se fait des deux
  // côtés, sinon les deux bannières se remettent à diverger.
  //
  // ⚠️ Rayon `Radii.card` (20) et non `lg` (16), alors que `card` est écrit
  // « cartes de FEUILLE » et que le Menu est une page. Écart assumé
  // (14 septembre 2026) : l'identité visuelle entre les deux écrans passe
  // devant la cohérence de rayon entre les blocs d'une même page. C'est le seul
  // rayon de 20 de cette page.
  //
  // AUCUN LISERÉ — comme `promoCard`. La règle « jamais un `subtle` sans son
  // liseré » a pour raison écrite qu'il se fondrait sur le gris `bg` ; la page
  // est blanche, et `blue100` y tient seul.
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radii.card,
    backgroundColor: Colors.blue100,
    paddingLeft: 6,
    paddingRight: 14,
    paddingVertical: 6,
    // N'existe pas sur l'accueil : l'air qui sépare le bloc du lien en dessous.
    // 20 (`Spacing[5]`) et non 10 — le lien n'est pas la suite du bloc, c'est
    // l'autre proposition. À 10 il se lisait comme une légende de la bannière.
    // Son propre `linkBox` ajoute 4, l'écart optique est donc de 24.
    marginBottom: 20,
  },
  promoTile: {
    width: PROMO_TILE, height: PROMO_TILE,
    borderRadius: Radii.md,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  // Position du carré NON pivoté : la rotation RN se fait autour du centre, on
  // vise donc le centre (25.52 ; 40.71) relevé sur la maquette.
  promoIllo: {
    position: 'absolute',
    left: -0.48, top: 8.71,
    width: 52, height: 64,
    transform: [{ rotate: '30deg' }],
  },
  promoText: { flex: 1, gap: 3, overflow: 'hidden' },
  // Le lien se cale au centre et ne prend que la largeur de son libellé : une
  // action discrète n'a pas à offrir toute la largeur en zone de frappe.
  proLink: { alignSelf: 'center' },

  // Interrupteur de démo : posé dans le slot droit de l'en-tête. Il n'a plus de
  // conteneur à lui — c'est `ScreenHeader` qui l'aligne, et le titre en `flex: 1`
  // lui laisse sa largeur naturelle.
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
