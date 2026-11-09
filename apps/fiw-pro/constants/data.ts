// Données factices du proto Fiw Pro (Prestataire).
// Proto de calage visuel — voir docs/benchmark-fiw-pro.md.

export const DAKAR_CENTER = { lat: 14.6937, lng: -17.4441 };

/** Taux de commission Fiw, prélevé sur le Wallet à chaque course terminée. */
export const COMMISSION_RATE = 0.14;

/** Seuil sous lequel le Wallet est annoncé « bas » (avertissement, pas blocage). */
export const WALLET_LOW = 1_000;

/** Course de référence servant à convertir un solde en AUTONOMIE.
 *
 *  C'est la pièce qui manque à toutes les apps du corpus, parce qu'aucune n'a
 *  le problème : chez elles la plateforme DOIT au chauffeur. Ici c'est
 *  l'inverse, et un solde seul ne veut rien dire — 3 000 F est confortable pour
 *  un vélo, court pour une voiture. On convertit donc le solde en nombre de
 *  courses restantes, à partir du panier moyen du service actif.
 *
 *  ⚠️ Valeur de proto. En vrai elle se calcule sur l'historique du Prestataire,
 *  et il faudra décider si on affiche une moyenne glissante (juste, mais qui
 *  bouge sous les yeux) ou un forfait par service (stable, mais faux pour les
 *  extrêmes). Question ouverte — cf. benchmark D1. */
export const PANIER_MOYEN = 2_200;

export const PRESTATAIRE = {
  name: 'Moussa Diallo',
  prenom: 'Moussa',
  phone: '+221 77 845 12 09',
  id: 'AUT-8821',
  service: 'Taxi Voiture',
  vehicle: 'Toyota Corolla',
  color: 'Blanche',
  plate: 'DK-4521-A',
  /** Note du Prestataire — moyenne des évaluations reçues des Clients. */
  note: 4.8,
  trips: 1_243,
  /** Statut prestataire (CONTEXT.md) : Bronze · Argent · Or · Diamant. */
  statut: 'Or' as const,
  walletSolde: 4_200,
  gainsJour: 18_400,
  coursesJour: 9,
  /** O6 — ce que la dernière course a rapporté. Bolt Food la pose à côté du
   *  total du jour : elle ferme la boucle sur ce qu'on vient de faire. */
  derniereCourse: 2_200,
};

/** Mission entrante.
 *
 *  ⚠️ `repere` est le manque signalé par l'ADR 0009 et par le sitemap Pro : le
 *  Client saisit une ligne décrivant comment reconnaître le point au sol, et
 *  **c'est le Prestataire qui doit la lire**. Tant qu'elle n'est pas portée ici
 *  puis affichée, le Client remplit un champ que personne ne voit. */
export const MISSION_INCOMING = {
  id: 'CMD-20261107-0042',
  clientName: 'Amadou B.',
  clientNote: 4.6,
  pickup: {
    name: 'Almadies',
    detail: 'Rue NGB-12, Dakar Ouest',
    repere: 'Portail vert en face de la boutique Mame Diarra',
    // ⚠️ Le Repère EN PHOTO — piste O1 du benchmark (Bolt Food, Wolt). À Dakar
    // l'adresse résout une parcelle, pas un portail : une photo de la façade
    // vaut mieux que sa description. Demande un amendement daté à l'ADR 0009,
    // qui n'avait prévu qu'une ligne de texte.
    //
    // Image de SUBSTITUTION — on n'a pas de vraie photo de portail dakarois.
    // C'est un fichier réel et non une simulation : le composant affiche ce
    // qu'on lui donne.
    photo: require('../assets/repere-photo-proto.png'),
    // ⚠️ Coordonnées VÉRIFIÉES sur la couche `water` de Mapbox (tilequery).
    // Les précédentes (14.7320 / −17.5113) tombaient dans l'Atlantique, du
    // côté océan de la Corniche : le Client attendait dans l'eau et la voiture
    // finissait sa course en mer.
    lat: 14.7442, lng: -17.5175,
  },
  destination: {
    name: 'Plateau',
    detail: 'Av. Léopold Sédar Senghor, Dakar Centre',
    repere: null as string | null,
    photo: null as ReturnType<typeof require> | null,
    // ⚠️ L'étiquette disait « Plateau · Av. Léopold Sédar Senghor » et les
    // coordonnées (14.6912 / −17.4382) tombaient sur **HLM Nimzatt**, à
    // ~2,5 km au nord-est. Le nom et le point doivent désigner le même
    // endroit, sinon la carte dément la feuille.
    lat: 14.6730, lng: -17.4380,
  },
  distanceClient: '1,8 km',
  dureeClient: '6 min',
  distanceCourse: '4,2 km',
  prix: 2_200,
  gamme: 'Simple',
  /** Secondes laissées au Prestataire pour accepter — le minuteur du bouton. */
  timerSeconds: 15,
};

// ── Wallet ────────────────────────────────────────────────────────────────
// ⚠️ Le Wallet de Fiw Pro est à SENS UNIQUE DÉBIT (CONTEXT.md). Les gains de
// course n'y passent JAMAIS : le Client paie le Prestataire directement, en
// espèces ou en Mobile Money. Le relevé ne contient donc que deux natures —
// des **recharges** (crédit) et des **commissions** (débit). Y faire figurer
// un gain de course serait un contresens sur le produit, et c'est l'erreur que
// le mimétisme du corpus (Bolt, Heetch, Uber) conduit à faire.

export type MouvementKind = 'recharge' | 'commission';

export type Mouvement = {
  id: string;
  kind: MouvementKind;
  /** Ce que la ligne nomme : l'opérateur pour une recharge, la course pour une commission. */
  label: string;
  date: string;
  /** Montant du mouvement, signé : positif en recharge, négatif en commission. */
  montant: number;
  /** Prix de la course dont la commission est tirée (commission uniquement). */
  coursePrix?: number;
};

export const MOUVEMENTS: Mouvement[] = [
  { id: 'm1', kind: 'commission', label: 'Almadies → Plateau',      date: "Aujourd'hui · 14:20", montant: -308, coursePrix: 2_200 },
  { id: 'm2', kind: 'commission', label: 'Ouakam → Mermoz',          date: "Aujourd'hui · 12:05", montant: -252, coursePrix: 1_800 },
  { id: 'm3', kind: 'recharge',   label: 'Wave',                     date: "Aujourd'hui · 08:40", montant: 5_000 },
  { id: 'm4', kind: 'commission', label: 'Yoff → Aéroport AIBD',     date: 'Hier · 19:32',        montant: -1_120, coursePrix: 8_000 },
  { id: 'm5', kind: 'commission', label: 'Sacré-Cœur → Liberté 6',   date: 'Hier · 17:10',        montant: -210, coursePrix: 1_500 },
  { id: 'm6', kind: 'recharge',   label: 'Orange Money',             date: '5 novembre · 09:15',  montant: 3_000 },
];

/** Formate un montant en francs CFA : 12400 → « 12 400 F ». */
export const fcfa = (n: number) =>
  `${Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} F`;

/** Montant signé, pour une ligne de relevé : −308 → « −308 F ». */
export const fcfaSigne = (n: number) => `${n < 0 ? '−' : '+'}${fcfa(n)}`;

export type WalletEtat = 'sain' | 'bas' | 'bloque';

/** L'état du Wallet, d'où découlent la couleur et le verbe de l'écran. */
export function walletEtat(solde: number): WalletEtat {
  if (solde <= 0) return 'bloque';
  if (solde < WALLET_LOW) return 'bas';
  return 'sain';
}

/** Autonomie restante, en nombre de courses. Arrondi vers le BAS : annoncer
 *  une course de plus qu'on ne peut en faire, c'est promettre un blocage. */
export const autonomie = (solde: number) =>
  Math.max(0, Math.floor(solde / (PANIER_MOYEN * COMMISSION_RATE)));

// ── Gains ─────────────────────────────────────────────────────────────────
// ⚠️ « Gains » désigne ici ce que le Prestataire a **encaissé auprès des
// Clients** — espèces en main ou Mobile Money reçu. Ce n'est PAS un solde chez
// Fiw, et il n'y a rien à retirer : Fiw ne détient pas cet argent. La
// commission correspondante est un mouvement de Wallet, séparé (cf. `MOUVEMENTS`).

export type Course = {
  id: string;
  trajet: string;
  heure: string;
  prix: number;
  /** Comment le Client a payé. La distinction compte : les espèces sont déjà
   *  en poche, le Mobile Money a pu ne pas encore arriver. */
  paiement: 'espèces' | 'mobile money';
};

export const COURSES_JOUR: Course[] = [
  { id: 'c1', trajet: 'Almadies → Plateau',      heure: '14:20', prix: 2_200, paiement: 'espèces' },
  { id: 'c2', trajet: 'Ouakam → Mermoz',         heure: '12:05', prix: 1_800, paiement: 'mobile money' },
  { id: 'c3', trajet: 'Yoff → Aéroport AIBD',    heure: '10:40', prix: 8_000, paiement: 'mobile money' },
  { id: 'c4', trajet: 'Liberté 6 → Sacré-Cœur',  heure: '09:15', prix: 1_500, paiement: 'espèces' },
  { id: 'c5', trajet: 'Médina → Point E',        heure: '08:30', prix: 1_700, paiement: 'espèces' },
  { id: 'c6', trajet: 'Fann → Ngor',             heure: '07:50', prix: 3_200, paiement: 'mobile money' },
];

/** Statut prestataire (CONTEXT.md) — progresse selon le NOMBRE DE COURSES et
 *  la NOTE MOYENNE reçue. Rien d'autre : le Score de coopération n'entre pas
 *  dans le statut, et n'est de toute façon jamais affiché. */
export const STATUT = {
  actuel: 'Or',
  suivant: 'Diamant',
  avantages: [
    'Priorité sur les courses de l’aéroport',
    'Commission réduite à 12 % au-delà de 200 courses par mois',
    'Assistance prioritaire 24 h/24',
  ],
  conditions: [
    { label: 'Courses effectuées', valeur: 1_243, seuil: 2_000, format: 'nombre' as const },
    { label: 'Note moyenne reçue', valeur: 4.8,   seuil: 4.7,   format: 'note' as const },
  ],
};
