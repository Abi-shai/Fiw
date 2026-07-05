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

// Illustrations des moyens de paiement (Wave, Orange Money, espèces) — partagées
// entre la feuille de configuration et le suivi de course.
export const PAY_ILLUSTRATIONS: Record<string, ReturnType<typeof require>> = {
  cash: require('../assets/argent.png'),
  wave: require('../assets/pay-wave.png'),
  orange: require('../assets/pay-orange.png'),
};

export const payIllustration = (id?: string) =>
  (id && PAY_ILLUSTRATIONS[id]) || PAY_ILLUSTRATIONS.cash;
