/**
 * Le réglage cartographique de Fiw, en un seul endroit.
 *
 * ── Pourquoi ce fichier existe ────────────────────────────────────────────
 * `LeafletMap` est porté du Client avec tout son moteur — sprite orienté selon
 * le cap, train avant articulé, avance à vitesse sol constante, tracé parcouru
 * atténué / restant en bleu, caméra qui cadre le trajet puis suit le véhicule.
 * Rien de tout ça ne s'allume tout seul : ce sont des **props**, et l'app Pro
 * n'en passait aucune. Elle affichait donc une carte Mapbox nue, dans le style
 * par défaut du composant — `navigation-day-v1`, **avec le trafic peint en
 * vert vif** — là où le Client montre une carte claire et calme.
 *
 * L'écart ne venait pas d'un autre moteur : il venait de ne pas s'en servir.
 *
 * ── Le style de base ──────────────────────────────────────────────────────
 * `light-v11` + `tintWater` + `declutter`, exactement comme le Client. Le fond
 * doit rester un **fond** : ce qu'on regarde, c'est le véhicule et le tracé.
 * `navigation-day-v1` colore les axes selon le trafic et les fait passer
 * devant tout le reste — utile dans un GPS, bruyant partout ailleurs.
 */
export const CARTE_BASE = {
  mapStyle: 'mapbox://styles/mapbox/light-v11',
  tintWater: true,
  declutter: true,
} as const;

/** Durées d'animation d'un trajet, en millisecondes. Reprises du Client, qui
 *  compresse une course de ~20 min en moins d'une minute pour que le proto se
 *  regarde. Deux valeurs distinctes : rejoindre le Client est plus court que
 *  la course elle-même, et le proto doit le faire sentir. */
export const DUREE_VERS_CLIENT = 42_000;
export const DUREE_COURSE = 59_000;

/** Zones de demande de Dakar — proto.
 *
 *  **Seules les zones CHAUDES sont décrites.** Fiw n'a pas de multiplicateur de
 *  prix à annoncer (son positionnement est « le prix affiché est le prix payé,
 *  toujours »), donc peindre le « normal » n'apprendrait rien et demanderait
 *  une échelle de couleurs que le système n'a pas. On ne peint que là où il
 *  vaut la peine d'aller.
 *
 *  L'étiquette porte **ce qui fait bouger** — le nombre de clients en attente —
 *  et non le nom du quartier, que le Prestataire connaît déjà.
 *
 *  ⚠️ Polygones factices, tracés à la main autour des quartiers. En vrai ils
 *  viennent du découpage opérationnel et le niveau se recalcule en continu. */
export const ZONES_DEMANDE: { coords: [number, number][]; label: string }[] = [
  {
    label: 'Almadies · 12 en attente',
    coords: [[-17.5330, 14.7530], [-17.5020, 14.7520], [-17.4980, 14.7340], [-17.5300, 14.7330]],
  },
  {
    label: 'Ouakam · 7 en attente',
    coords: [[-17.5010, 14.7320], [-17.4760, 14.7300], [-17.4740, 14.7140], [-17.4990, 14.7150]],
  },
];
