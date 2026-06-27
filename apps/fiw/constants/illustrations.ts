// Illustrations 3D des moyens de transport, indexées par la clé `illu` portée
// par chaque gamme (cf. GAMMES/COVOITURAGE dans data.ts) :
//   moto · auto (taxi jaune, gamme classique) · luxe (auto noire, gammes
//   élevées + covoiturage solo) · covoiturage (auto orange, covoiturage partagé).
// Partagé entre l'écran de configuration et l'écran de recherche.
export const GAMME_ILLUSTRATIONS = {
  moto: require('../assets/gamme-moto.png'),
  auto: require('../assets/gamme-auto.png'),
  luxe: require('../assets/gamme-luxe.png'),
  covoiturage: require('../assets/gamme-covoit.png'),
} as const;

export type IlluKey = keyof typeof GAMME_ILLUSTRATIONS;

export const gammeIllustration = (illu: IlluKey) =>
  GAMME_ILLUSTRATIONS[illu] ?? GAMME_ILLUSTRATIONS.auto;
