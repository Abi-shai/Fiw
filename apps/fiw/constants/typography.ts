import type { TextStyle } from 'react-native';

// Familles Outfit chargées dans _layout (via @expo-google-fonts/outfit).
// En RN, fontWeight ne sélectionne pas une graisse Outfit : on mappe
// explicitement chaque graisse à sa famille nommée.
export const Outfit = {
  light: 'Outfit_300Light',
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
} as const;

export type TextVariant =
  // Échelle de base — une graisse par taille.
  | 'displayXl' | 'display' | 'heading1' | 'heading2'
  | 'body' | 'bodySmall' | 'label' | 'caption'
  // Axe de graisse — les tailles que le design emploie en plusieurs graisses.
  | 'bodyMedium' | 'bodySemibold' | 'heading2Bold'
  | 'bodySmallSemibold' | 'captionMedium' | 'captionSemibold'
  // Rôles — un réglage que sa taille seule ne décrit pas.
  | 'cardTitle' | 'fieldPrefix' | 'infoValue' | 'amount' | 'codeCell'
  | 'buttonMd' | 'buttonMdLink' | 'buttonSm';

// Miroir exact des 8 styles de texte Figma `Fiw/displayXl → Fiw/caption`
// (fichier MsKt5tJdmMUWIDTRtPh6L1). La maquette fait autorité sur l'échelle :
// c'est elle qui a été réglée à la main, le code s'y aligne.
//
// Les interlignages viennent de l'AUTO de Figma, **mesuré et non deviné** : une
// sonde a rendu 40→50, 28→35, 22→28, 18→23, 16→20, 14→18, 12→15, soit les
// métriques intrinsèques d'Outfit (×1.25, arrondi au pixel). On les fixe en dur
// plutôt que d'omettre `lineHeight` : l'AUTO de RN et celui de Figma ne sont pas
// garantis identiques, une valeur explicite garantit la parité.
//
// ⚠️ `body` passe de 15/24 à 16/20 : le corps de texte gagne 1 px de taille mais
// son interlignage tombe de ×1.6 à ×1.25. Les paragraphes de plusieurs lignes
// (explications de modale, corps d'InfoBanner) sont donc sensiblement plus serrés
// qu'avant le 24 août 2026.
export const Typography: Record<TextVariant, {
  fontFamily: string; fontSize: number; lineHeight: number;
}> = {
  displayXl: { fontFamily: Outfit.bold,     fontSize: 40, lineHeight: 50 },
  display:   { fontFamily: Outfit.bold,     fontSize: 28, lineHeight: 35 },
  heading1:  { fontFamily: Outfit.semibold, fontSize: 22, lineHeight: 28 },
  heading2:  { fontFamily: Outfit.semibold, fontSize: 18, lineHeight: 23 },
  body:      { fontFamily: Outfit.regular,  fontSize: 16, lineHeight: 20 },
  bodySmall: { fontFamily: Outfit.regular,  fontSize: 14, lineHeight: 18 },
  label:     { fontFamily: Outfit.medium,   fontSize: 14, lineHeight: 18 },
  caption:   { fontFamily: Outfit.regular,  fontSize: 12, lineHeight: 15 },

  // Deux réglages à 15 px, intentionnels et distincts, actés le 24 août 2026 :
  // l'échelle saute de 14 à 16, mais la maquette emploie délibérément un 15 à
  // deux endroits. Chacun a désormais son style Figma (`Fiw/cardTitle`,
  // `Fiw/fieldPrefix`), interlignage explicite et non AUTO.
  //
  // `cardTitle` : titre d'une carte de choix (`OptionCard` — les options A/B de
  // rapprochement, les modes de livraison). Il tenait par accident jusqu'ici,
  // via `variant="body"` + SemiBold quand `body` valait encore 15/24.
  // `fieldPrefix` : préfixe posé dans un champ, à gauche du séparateur —
  // l'indicatif téléphonique de `PhoneField`.
  // ---- Axe de graisse (24 août 2026) ----
  // L'échelle de base ne donne qu'une graisse par taille, or le design en emploie
  // plusieurs : `16/20` existe en Regular (body), Medium et SemiBold, `12/15` en
  // Regular (caption), Medium et SemiBold. Ces variantes évitent la surcharge
  // `style={{ fontFamily }}` dans les écrans, qui contournait l'atome `Text`.
  bodyMedium:      { fontFamily: Outfit.medium,   fontSize: 16, lineHeight: 20 },
  bodySemibold:    { fontFamily: Outfit.semibold, fontSize: 16, lineHeight: 20 },
  heading2Bold:    { fontFamily: Outfit.bold,     fontSize: 18, lineHeight: 23 },
  // 14/18 en trois graisses : bodySmall (Regular) · label (Medium) · celle-ci.
  bodySmallSemibold: { fontFamily: Outfit.semibold, fontSize: 14, lineHeight: 18 },
  captionMedium:   { fontFamily: Outfit.medium,   fontSize: 12, lineHeight: 15 },
  captionSemibold: { fontFamily: Outfit.semibold, fontSize: 12, lineHeight: 15 },

  // ---- Rôles ----
  // Un réglage que sa seule taille ne décrit pas : ils portent un nom d'emploi
  // pour qu'un changement de l'échelle de base ne les décroche pas de la maquette
  // (c'est ce qui est arrivé à `cardTitle` quand `body` est passé de 15 à 16).
  //
  // `cardTitle`   : titre d'une carte de choix (`OptionCard`).
  // `fieldPrefix` : préfixe dans un champ — l'indicatif de `PhoneField`.
  // `infoValue`   : valeur d'une rangée de restitution (`InfoRow`).
  // `amount`      : montant mis en avant (`InfoRow` emphase="montant").
  // `codeCell`    : chiffre d'un code à saisir (`CodePill`).
  // `buttonMd/Sm` : libellés de bouton — voir `Button.SIZING`. La variante `link`
  //                 descend d'une graisse, d'où `buttonMdLink`.
  cardTitle:    { fontFamily: Outfit.semibold, fontSize: 15, lineHeight: 24 },
  fieldPrefix:  { fontFamily: Outfit.medium,   fontSize: 15, lineHeight: 21 },
  infoValue:    { fontFamily: Outfit.semibold, fontSize: 14, lineHeight: 20 },
  amount:       { fontFamily: Outfit.bold,     fontSize: 20, lineHeight: 28 },
  codeCell:     { fontFamily: Outfit.bold,     fontSize: 28, lineHeight: 36 },
  buttonMd:     { fontFamily: Outfit.semibold, fontSize: 15, lineHeight: 20 },
  buttonMdLink: { fontFamily: Outfit.medium,   fontSize: 15, lineHeight: 20 },
  buttonSm:     { fontFamily: Outfit.medium,   fontSize: 14, lineHeight: 20 },
};

/** Typo d'un champ de saisie sur UNE ligne : reprend la famille et la taille
 *  d'une variante, **sans son interligne**. Poser `lineHeight` sur un
 *  `TextInput` d'une ligne décale le texte verticalement sur Android ; les
 *  champs multilignes, eux, en ont besoin pour respirer et reprennent la
 *  variante entière (`...Typography.body`).
 *
 *  Raison d'être : un `TextInput` ne peut pas passer par l'atome `Text`, donc il
 *  portait jusqu'ici ses `fontSize`/`fontFamily` en dur — c'est par là que
 *  l'échelle divergeait. */
export const inputTypo = (variant: TextVariant) => ({
  fontFamily: Typography[variant].fontFamily,
  fontSize: Typography[variant].fontSize,
});

// Libellé de section en capitales : le titre qui coiffe une liste ou une carte
// (SettingsGroup, ReceiptCard, « DÉTAIL DU PRIX »…). À composer avec
// `variant="caption"` et `color={Colors.textTertiary}`.
//
// Un seul traitement parce qu'il n'y a qu'un seul rôle. Jusqu'au 23 août 2026 il
// y en avait deux — `caption`/0.8/tertiaire, `label`/0.5/secondaire — pour dire
// exactement la même chose. La casse vit donc ici, pas dans les StyleSheet des
// composants : c'est ce qui empêche la divergence de revenir.
//
// **Aucun interlettrage.** La maquette compose ces libellés avec le style
// `Fiw/caption` nu (tracking 0) et un texte déjà saisi en capitales ; le 0.8 du
// code était une décision qui n'a pas survécu à la systématisation typographique
// du 24 août. Seule la transformation reste, pour que les écrans écrivent leur
// libellé en minuscules et laissent le style le mettre en capitales.
export const SectionLabel: TextStyle = {
  textTransform: 'uppercase',
};
