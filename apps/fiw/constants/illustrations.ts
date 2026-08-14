import { Image } from 'react-native';

// Jeu d'illustrations `mobility option` (Figma `icons`, nœud 40:169), indexé par
// la clé `illu` portée par chaque gamme (cf. GAMMES/COVOITURAGE/LIVRAISON_GAMMES
// dans data.ts). Une illustration par type de véhicule, quel que soit le service
// qui l'emploie : la moto sert autant au Taxi Moto qu'à la Moto Livraison.
//   moto · velo (nouveau rendu 3D, masters + provenance Figma dans
//   `assets/illustrations/` à la racine du dépôt) · auto (taxi jaune, gamme
//   classique) · luxe (auto noire, gammes élevées + covoiturage solo) ·
//   covoiturage (auto orange, covoiturage partagé) — ces trois-là encore dans
//   l'ancien style isométrique à plat.
// Partagé entre l'écran de configuration et l'écran de recherche.
export const GAMME_ILLUSTRATIONS = {
  moto: require('../assets/gamme-moto.png'),
  velo: require('../assets/gamme-velo.png'),
  auto: require('../assets/gamme-auto.png'),
  luxe: require('../assets/gamme-luxe.png'),
  covoiturage: require('../assets/gamme-covoit.png'),
  // Scooter bleu — illustration de la TUILE DE SERVICE Livraison sur l'accueil,
  // hors jeu `mobility option`. Gardée ici pour les vignettes de service.
  livraison: require('../assets/serv-livraison.png'),
} as const;

export type IlluKey = keyof typeof GAMME_ILLUSTRATIONS;

export const gammeIllustration = (illu: IlluKey) =>
  GAMME_ILLUSTRATIONS[illu] ?? GAMME_ILLUSTRATIONS.auto;

// ---------------------------------------------------------------------------
// Vue de dessus (`mobility option`, variante `View=top view`)
// ---------------------------------------------------------------------------
// Deuxième moitié du jeu Figma : le même véhicule vu du dessus, **nez au nord**.
// Répartition des rôles — la variante `Default` (isométrique) illustre les
// CARTES (carte gamme, vignette de suivi, bandeau de recherche) ; la variante
// `top view` habille la CARTOGRAPHIE (véhicule suivi, prestataires alentour),
// où le sprite est tourné selon le cap et doit se lire à la verticale de la
// chaussée. Ne jamais poser une vue de dessus sur une carte gamme, ni une vue
// isométrique sur la carte : elles ne racontent pas la même chose.
export const TOPVIEW_ILLUSTRATIONS: Record<IlluKey, ReturnType<typeof require>> = {
  moto: require('../assets/top-moto.png'),
  velo: require('../assets/top-velo.png'),
  auto: require('../assets/top-auto.png'),
  luxe: require('../assets/top-luxe.png'),
  covoiturage: require('../assets/top-covoit.png'),
  // La tuile de service Livraison n'a pas de vue de dessus propre — sur la
  // carte, c'est le véhicule qui compte : la moto.
  livraison: require('../assets/top-moto.png'),
};

/** Rapport largeur / longueur de chaque sprite vu du dessus, mesuré sur l'asset
 *  (l'ombre portée élargit un peu la boîte des voitures). Sert à dimensionner
 *  le marqueur à partir de sa seule LONGUEUR, sans jamais l'étirer. */
export const TOPVIEW_RATIOS: Record<IlluKey, number> = {
  moto: 0.5,
  velo: 0.375,
  auto: 0.549,
  luxe: 0.497,
  covoiturage: 0.569,
  livraison: 0.5,
};

export const topviewIllustration = (illu: IlluKey) =>
  TOPVIEW_ILLUSTRATIONS[illu] ?? TOPVIEW_ILLUSTRATIONS.auto;

/**
 * Calibre des marqueurs de carte, véhicule par véhicule.
 *
 * `len` = longueur du sprite en px écran (véhicule suivi), `ambLen` = idem pour
 * les prestataires alentour ; la largeur en découle par `TOPVIEW_RATIOS`, donc
 * rien n'est jamais étiré.
 *
 * **Les deux-roues sont volontairement plus GRANDS que les voitures.** À
 * l'échelle réelle une moto ferait la moitié d'une voiture et un vélo un tiers
 * — illisible sur une carte. Aucune app du corpus ne s'y plie (cf.
 * `docs/benchmark-carte-mobbin.md`) : soit elle enferme le deux-roues dans une
 * pastille qui lui garantit un gabarit plancher (Glovo, foodpanda, Bolt Food,
 * Blinkit), soit elle grossit franchement le sprite — le scooter Zomato mesure
 * **26 × 39 pt**, soit plus LARGE que la voiture inDrive (~16 × 29). Fiw n'a pas
 * de pastille : le sprite doit donc porter seul ce gabarit plancher. Le critère
 * qui gouverne est la **largeur apparente** (~24–30 px pour toute la famille),
 * pas la longueur.
 *
 * Ces valeurs dépassent le haut du corpus (~48 pt pour le deux-roues le plus
 * gros, Meituan) : **c'est délibéré**, tranché sur rendu le 3 août 2026. Les
 * illustrations Fiw sont des rendus 3D détaillés, pas des pictogrammes plats —
 * elles demandent plus de place pour livrer ce détail, et elles portent la
 * marque sur la carte. Le plafond utile a été constaté à ×1,5 des valeurs
 * ci-dessous : au-delà, le sprite déborde la chaussée et la ville se lit comme
 * une maquette.
 *
 * `pivot` = position du point de rotation le long du sprite, 0 = nez, 1 = arrière.
 * Un véhicule braque autour de son train arrière : c'est le nez qui balaie vers
 * l'extérieur du virage. Pivoter au centre donne une toupie — défaut d'autant
 * plus visible que le sprite est long et fin, donc sur les deux-roues.
 *
 * `lean` = amplitude de l'inclinaison simulée en virage (0 = aucune). Un
 * deux-roues se penche à l'intérieur du virage ; vu du dessus sa silhouette se
 * resserre. Une voiture, non.
 *
 * `steerBand` = fraction du sprite, mesurée depuis le nez, occupée par le TRAIN
 * AVANT — la partie qui braque. Les illustrations Figma sont des bitmaps
 * aplatis (aucun calque à récupérer) : la roue est donc détachée au découpage,
 * le sprite étant dessiné deux fois, l'une privée de cette bande, l'autre
 * réduite à elle et pivotant sur la colonne de direction. Les valeurs sont
 * calées sur le dessin, à l'interstice entre le garde-boue et le guidon —
 * changer d'illustration impose de les revérifier. 0 = pas de découpage : sur
 * une voiture vue du dessus, les roues sont sous la carrosserie, invisibles.
 *
 * `maxSteer` = angle de braquage maximal en degrés. Au-delà, l'arête droite de
 * la découpe finit par se voir.
 */
export const TOPVIEW_MARKER: Record<
  IlluKey,
  {
    len: number; ambLen: number; pivot: number; lean: number;
    steerBand: number; maxSteer: number;
  }
> = {
  auto: { len: 48, ambLen: 34, pivot: 0.68, lean: 0, steerBand: 0, maxSteer: 0 },
  luxe: { len: 48, ambLen: 34, pivot: 0.68, lean: 0, steerBand: 0, maxSteer: 0 },
  covoiturage: { len: 48, ambLen: 34, pivot: 0.68, lean: 0, steerBand: 0, maxSteer: 0 },
  moto: { len: 60, ambLen: 43, pivot: 0.72, lean: 0.14, steerBand: 0.24, maxSteer: 26 },
  velo: { len: 63, ambLen: 44, pivot: 0.75, lean: 0.16, steerBand: 0.22, maxSteer: 28 },
  livraison: { len: 60, ambLen: 43, pivot: 0.72, lean: 0.14, steerBand: 0.24, maxSteer: 26 },
};

export interface TopviewSprite {
  uri: string;
  ratio: number;
  len: number;
  ambLen: number;
  pivot: number;
  lean: number;
  steerBand: number;
  maxSteer: number;
}

/** Sprite prêt pour la carte (`LeafletMap`) : URI résolue + géométrie de rendu. */
export const topviewSprite = (illu: IlluKey): TopviewSprite => ({
  uri: Image.resolveAssetSource(topviewIllustration(illu)).uri,
  ratio: TOPVIEW_RATIOS[illu] ?? TOPVIEW_RATIOS.auto,
  ...(TOPVIEW_MARKER[illu] ?? TOPVIEW_MARKER.auto),
});

/** Côté de l'emplacement qu'occupe une illustration dans le jeu Figma
 *  `mobility option` (chaque variante est un carré de 68). */
export const ILLO_SLOT = 68;

/**
 * Taille de rendu de chaque illustration DANS cet emplacement de 68 — mesurée
 * sur les exports Figma, qui sont rognés au plus près du dessin.
 *
 * Aucune ne tient dans les 68 : les véhicules **débordent volontairement** leur
 * emplacement (76 de haut pour toute la famille, jusqu'à 93 de large pour les
 * voitures). C'est ce débord qui donne son expressivité à la carte gamme — le
 * rendre carré et « contenu » écrase l'illustration et casse la maquette.
 */
export const ILLO_SIZES: Record<IlluKey, { width: number; height: number }> = {
  moto: { width: 59, height: 76 },
  velo: { width: 47, height: 76 },
  auto: { width: 93, height: 76 },
  covoiturage: { width: 93, height: 76 },
  // Variante masquée dans le jeu Figma, mais l'illustration a le gabarit exact
  // des deux autres voitures.
  luxe: { width: 93, height: 76 },
  // Hors jeu `mobility option` (tuile de service) : carré, jamais posé sur une
  // plateforme de gamme.
  livraison: { width: 76, height: 76 },
};

/** Dimensions d'une illustration pour un emplacement d'un autre côté que 68
 *  (vignette de suivi, pastille de rappel…) — proportions Figma conservées. */
export const illoSize = (illu: IlluKey, slot: number = ILLO_SLOT) => {
  const { width, height } = ILLO_SIZES[illu] ?? ILLO_SIZES.auto;
  const k = slot / ILLO_SLOT;
  return { width: width * k, height: height * k };
};

// Illustrations des moyens de paiement (Wave, Orange Money, espèces) — partagées
// entre la feuille de configuration et le suivi de course.
export const PAY_ILLUSTRATIONS: Record<string, ReturnType<typeof require>> = {
  cash: require('../assets/argent.png'),
  wave: require('../assets/pay-wave.png'),
  orange: require('../assets/pay-orange.png'),
};

export const payIllustration = (id?: string) =>
  (id && PAY_ILLUSTRATIONS[id]) || PAY_ILLUSTRATIONS.cash;
