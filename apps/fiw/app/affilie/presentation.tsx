import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import ScreenHeader from '@/components/ScreenHeader';
import ScreenFooter from '@/components/ScreenFooter';
import Button from '@/components/Button';
import Text from '@/components/Text';
import Callout from '@/components/Callout';
import HandWithCash from '@/components/HandWithCash';
import StepList, { type StepItem } from '@/components/StepList';
import { Colors, SectionLabel, Spacing } from '@/constants/tokens';

/** Largeur de l'illustration en bandeau — le double du 52 des deux bannières
 *  (`home.tsx`, `menu.tsx`). Une valeur DÉRIVÉE et non choisie : c'est la même
 *  pièce, vue de plus près parce qu'on a tapé dessus. Ratio natif 52 × 64, donc
 *  128 de haut. */
const HERO_ILLO = 104;

// JS1 — La proposition. C'est la page qui s'ouvre quand on tape la bannière
// « Gagnez de l'argent avec Fiw ! » (accueil et Menu), et la seule porte de
// l'app vers l'Affiliation tant que le Client n'est pas Affilié Réseau.
//
// ── Vocabulaire (CONTEXT.md) ───────────────────────────────────────────────
// L'écran disait « vos chauffeurs » : proscrit hors du flux Transport — un
// livreur à vélo n'est pas un chauffeur, et l'Affiliation est une surface
// MULTI-SERVICES. Il dit désormais **prestataires**.
// Et il ne promet plus que le recrutement de Clients rapporte : depuis le recap
// du 30 août 2026, la commission ne tombe que sur les courses réalisées par les
// **Prestataires** inscrits avec le code. `Affilié` (le mot seul) reste le nom
// canonique de la personne recrutée ; `Affilié Réseau` (le recruteur) ne
// s'abrège jamais.
const STEPS: StepItem[] = [
  {
    icon: 'share',
    title: 'Partagez votre code',
    body: 'Envoyez votre code ou montrez votre QR aux prestataires autour de vous.',
  },
  {
    icon: 'users',
    title: 'Ils rejoignent votre réseau',
    body: 'Chaque prestataire inscrit avec votre code devient un Affilié.',
  },
  {
    icon: 'coins',
    title: 'Vous touchez 2 %',
    body: 'Sur le prix de chaque course qu’ils réalisent, sans limite de durée.',
  },
];

export default function Presentation() {
  return (
    <View style={styles.page}>
      {/* En-tête sans titre : le `display` juste en dessous EST le titre de la
          page, et une page de proposition n'a pas de nom de rubrique à
          annoncer — elle a une phrase à faire lire. Motif du corpus (Cash App,
          Zopa, Grab), cf. `docs/benchmark-affiliation-mobbin.md`. */}
      <ScreenHeader />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* ── Bandeau d'identité ────────────────────────────────────────────
            `blue100` + `HandWithCash` : exactement la bannière qu'on vient de
            taper, en grand. Le style guide en fait une règle à propos du bloc
            du Menu — « on ne lui invente pas une identité, on la reconnaît d'un
            écran à l'autre » — et c'est ici qu'elle compte le plus : c'est le
            seul endroit où la bannière et sa destination se suivent à un tap
            d'intervalle.
            L'écran posait à la place un carré de 72 à rayon `lg` rempli de
            `primarySubtle` avec une icône `gift` — une quatrième géométrie de
            cercle d'icône inventée sur place (le système en a trois, dans
            `Medallion`), un glyphe en `fill` dans une pastille (proscrit) et
            aucun lien avec l'identité de l'Affiliation.
            Bandeau PLEINE LARGEUR, donc sans rayon : il n'entre en concurrence
            de rayon ni avec le `Callout` plus bas (16) ni avec les cartes de
            l'app (20). Un hero encadré aurait été une carte de plus. */}
        <View style={styles.hero}>
          <HandWithCash width={HERO_ILLO} />
        </View>

        <View style={styles.body}>
          {/* Le titre porte le CHIFFRE. C'est l'enseignement le plus net du
              corpus : Cash App, Zopa, Careem, Setel, N26 mettent tous le
              montant dans le titre, jamais dans une étape. L'écran ouvrait sur
              « Gagnez de l'argent en partageant Fiw » et gardait le 2 % pour la
              troisième ligne de la troisième étape.
              Aucun `letterSpacing` : le titre en portait un de -0.5, valeur
              inventée hors échelle — la typographie Fiw n'a plus d'interlettrage
              nulle part depuis le 24 août 2026. */}
          <Text variant="display">Gagnez 2 % sur chaque course de votre réseau</Text>
          <Text variant="body" color={Colors.textSecondary} style={styles.subtitle}>
            Devenez Affilié Réseau et touchez une commission sur les courses des
            prestataires que vous inscrivez.
          </Text>

          {/* Libellé écrit en minuscules : c'est `SectionLabel` qui met en
              capitales, pour que la casse vive dans le token et pas dans
              l'écran. */}
          <Text variant="caption" color={Colors.textTertiary} style={styles.sectionLabel}>
            Comment ça marche
          </Text>
          <StepList items={STEPS} />

          {/* L'unique règle non devinable de l'écran, donc un `Callout` — et un
              seul, comme le veut sa fiche. Ce n'est pas une redite des étapes :
              elle répond à la question qui décide du recrutement (« est-ce que
              je coûte quelque chose au prestataire que j'inscris ? »), et la
              réponse est dans CONTEXT.md — la commission est prélevée sur la
              part de Fiw. */}
          <Callout icon="shield" style={styles.callout}>
            Les 2 % sont prélevés sur la part de Fiw : le prestataire que vous
            inscrivez ne perd rien sur sa course.
          </Callout>
        </View>
      </ScrollView>

      <ScreenFooter rule>
        {/* Le CTA nomme le RÔLE et reprend la question de la bannière (« Et si
            vous deveniez un affilié réseau ? ») — « Activer mon profil » ne
            disait pas quel profil. */}
        <Button
          label="Devenir Affilié Réseau"
          onPress={() => router.replace('/affilie/dashboard')}
        />
        {/* Consentement en MENTION sous le CTA, pas en case à cocher.
            Trois raisons, dans cet ordre :
            1. La case était **pré-cochée** (`useState(true)`) et commandait un
               CTA désactivable : un consentement qu'on a déjà donné à la place
               du Client.
            2. Le même contrat était accepté DEUX fois — ici, puis sur
               `conditions` avec sa propre case. Un contrat, une acceptation.
            3. C'est la forme du corpus sur un écran de PROPOSITION : Base,
               Monzo, Brave, Instacart, Zopa, Airbnb posent tous la mention sous
               le bouton. La case à cocher y apparaît seulement quand l'écran
               EST le contrat (Target, Qantas) — donc chez nous sur
               `conditions`, qu'on atteint par ce lien.
            Forme reprise telle quelle de l'onboarding (`app/index.tsx`), qui
            pose déjà cette mention sous son bouton de connexion. */}
        <Text variant="caption" color={Colors.textTertiary} align="center">
          En activant votre profil, vous acceptez les{' '}
          <Text
            variant="caption"
            color={Colors.primary}
            onPress={() => router.push('/affilie/conditions')}
          >
            conditions d’utilisation
          </Text>
        </Text>
      </ScreenFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  // `bg` : le fond de page des flux Transport, Livraison et Affiliation
  // (cf. `colors.ts`). La partie Compte, elle, inverse figure et fond.
  page: { flex: 1, backgroundColor: Colors.bg },
  // Aucune gouttière ici : c'est le bandeau qui doit filer aux bords. La
  // gouttière de page est portée par `body`, en dessous.
  content: { paddingBottom: Spacing[8] },

  // L'illustration est ANCRÉE AU BAS du bandeau — aucun padding sous elle.
  // Le tracé `HandWithCash` s'arrête pile sur l'avant-bras (la silhouette
  // touche le bord bas de son viewBox 52 × 64) : posée au milieu du bandeau,
  // avec du bleu en dessous, elle se lisait comme une main coupée qui FLOTTE.
  // Collée au bord, le même tracé se lit comme un bras qui entre dans le cadre
  // par le bas — et le bandeau cesse d'être une boîte où l'on a déposé un
  // dessin.
  //
  // La hauteur du bandeau ne bouge pas (176 = 48 + 128) : c'est l'air du haut
  // qui absorbe les 24 rendus par le bas, et cet air au-dessus des billets est
  // ce qui fait respirer le hero.
  hero: {
    backgroundColor: Colors.blue100,
    alignItems: 'center',
    paddingTop: Spacing[12],
  },

  // 16, la gouttière des écrans de flux — la même que `ScreenHeader` et
  // `ScreenFooter` portent en propre, donc l'en-tête, le corps et le pied
  // s'alignent sur la même colonne.
  body: { paddingHorizontal: Spacing[4], paddingTop: Spacing[6] },
  subtitle: { marginTop: Spacing[3] },
  sectionLabel: { ...SectionLabel, marginTop: Spacing[8], marginBottom: Spacing[3] },
  // `Callout` porte déjà 16 de marge basse ; seule celle du haut est à poser.
  callout: { marginTop: Spacing[6] },
});
