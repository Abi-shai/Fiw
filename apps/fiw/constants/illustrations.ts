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
