export const DAKAR_CENTER = { lat: 14.6937, lng: -17.4441 };

export const SUGGESTIONS = [
  { id: '1', name: 'Aéroport AIBD', detail: 'Rufisque', lat: 14.6740, lng: -17.0730 },
  { id: '2', name: 'Plateau', detail: 'Dakar Centre', lat: 14.6912, lng: -17.4382 },
  { id: '3', name: 'Almadies', detail: 'Dakar Ouest', lat: 14.7320, lng: -17.5113 },
  { id: '4', name: 'Yoff', detail: 'Dakar Nord', lat: 14.7456, lng: -17.4827 },
  { id: '5', name: 'Liberté 6', detail: 'Dakar', lat: 14.7244, lng: -17.4556 },
  { id: '6', name: 'Parcelles Assainies', detail: 'Dakar Nord', lat: 14.7819, lng: -17.4456 },
  { id: '7', name: 'Sacré-Cœur', detail: 'Mermoz', lat: 14.7225, lng: -17.4688 },
  { id: '8', name: 'HLM Grand Yoff', detail: 'Dakar', lat: 14.7112, lng: -17.4556 },
  { id: '9', name: 'Marché Sandaga', detail: 'Dakar Centre', lat: 14.6866, lng: -17.4428 },
  { id: '10', name: 'Université Cheikh Anta Diop', detail: 'Fann', lat: 14.6928, lng: -17.4628 },
  // Codes d'adresse dakarois (quartier abrégé + numéro de parcelle). Yango et
  // inDrive les résolvent déjà : la recherche Fiw doit le faire aussi (cf.
  // feature-list.md « Recherche d'adresse »). Ces deux entrées ne sont là que
  // pour rendre le comportement visible dans le proto — la vraie résolution
  // viendra du géocodeur, qui reste à choisir sur ce critère.
  { id: '11', name: 'GY 182', detail: 'Grand Yoff', lat: 14.7135, lng: -17.4602 },
  { id: '12', name: 'AAB 07', detail: 'Almadies', lat: 14.7351, lng: -17.5089 },
];

// Lieux enregistrés par le client (onglet « Enregistré »).
// `detail` = l'adresse, ce que la carte sait trouver (un quartier, une avenue).
// `repere` = le Repère (cf. CONTEXT.md) : comment reconnaître le point au sol.
// « Villa 214 » est un Repère, pas une adresse — aucune carte ne le connaît.
// Travail est volontairement sans Repère : les deux états doivent se voir.
export const SAVED_PLACES = [
  { id: 's-home', kind: 'home', label: 'Maison', detail: 'Sacré-Cœur, Mermoz',
    repere: 'Villa 214, portail vert en face de la boutique', lat: 14.7225, lng: -17.4688 },
  { id: 's-work', kind: 'work', label: 'Travail', detail: 'Plateau, Av. Léopold Sédar Senghor',
    repere: '', lat: 14.6712, lng: -17.4382 },
];

// Profil du Client connecté (mock). `note` = Note du Client, la MOYENNE affichée
// (le détail par course — ÉvaluationClient — reste privé, cf. CONTEXT.md).
export const CLIENT = {
  name: 'Mamadou Diallo',
  phone: '+221 77 123 45 67',
  note: 4.9,
  trips: 87,
};

// Contacts de confiance : reçoivent le trajet en temps réel au départ et peuvent
// être alertés en cas d'urgence (cf. sitemap §7 / benchmark-compte-mobbin.md).
export const TRUSTED_CONTACTS = [
  { id: 't-1', name: 'Awa Diop', phone: '77 123 45 67', shareOnStart: true },
  { id: 't-2', name: 'Oumar Diallo', phone: '78 990 11 22', shareOnStart: false },
];

// Destinations récentes (onglet « Suggéré »)
export const RECENT_PLACES = [
  { id: 'r-1', name: 'Almadies', detail: 'Dakar Ouest', lat: 14.7320, lng: -17.5113 },
  { id: 'r-2', name: 'Aéroport AIBD', detail: 'Rufisque', lat: 14.6740, lng: -17.0730 },
];

export const PRESTATAIRE = {
  name: 'Moussa Diallo',
  vehicle: 'Toyota Corolla',
  color: 'Blanche',
  plate: 'DK-4521-A',
  rating: 4.8,
  trips: 1243,
  id: 'AUT-8821',
  emoji: '👨🏾',
};

export const PRESTATAIRE_MOTO = {
  name: 'Ibrahima Sy',
  vehicle: 'Yamaha FZ',
  color: 'Rouge',
  plate: 'DK-7734-B',
  rating: 4.9,
  trips: 892,
  id: 'MOT-2241',
  emoji: '👨🏾‍🦱',
};

// Le libellé nomme le TYPE de véhicule (Taxi Moto / Taxi Auto) ; la gamme
// (Confort, Prestige…) est portée par le `badge` affiché sur la carte.
// `illu` = clé d'illustration : moto · auto (jaune, gamme classique) · luxe
// (noire, gammes élevées) · covoiturage (orange, covoiturage partagé).
export const GAMMES: {
  id: string; label: string; badge: string | null;
  description: string; icon: string; basePrice: number; eta: string;
  illu: 'moto' | 'auto' | 'luxe' | 'covoiturage';
}[] = [
  {
    id: 'moto',
    label: 'Taxi Moto',
    badge: null,
    description: 'Rapide, idéal pour courtes distances',
    icon: '🛵',
    basePrice: 800,
    eta: '3 min',
    illu: 'moto',
  },
  {
    id: 'simple',
    label: 'Taxi Auto',
    badge: null,
    description: 'Confortable, climatisé',
    icon: '🚗',
    basePrice: 1500,
    eta: '5 min',
    illu: 'auto',
  },
  {
    id: 'confort',
    label: 'Taxi Auto',
    badge: 'Confort',
    description: 'Berline récente, grand confort',
    icon: '🚙',
    basePrice: 2200,
    eta: '7 min',
    illu: 'luxe',
  },
  {
    id: 'prestige',
    label: 'Taxi Auto',
    badge: 'Prestige',
    description: 'SUV ou berline haut de gamme',
    icon: '🚘',
    basePrice: 3500,
    eta: '10 min',
    illu: 'luxe',
  },
];

// Gamme complémentaire suggérée à l'état « Aucun prestataire » (cf. CONTEXT.md) :
// si la gamme demandée n'a personne, on renvoie vers l'autre famille de véhicule
// susceptible d'avoir du stock — Moto ↔ Auto.
export const complementaryGamme = (gammeId: string) =>
  gammeId === 'moto'
    ? GAMMES.find((g) => g.id === 'simple')!
    : GAMMES.find((g) => g.id === 'moto')!;

// Covoiturage (catégorie Transport) — proposé via le switcher sur l'écran de
// configuration. Une seule offre (prix réduit par passager) ; « Pas de détour »
// est une OPTION (pas une gamme distincte) — cf. périmètre Covoiturage. Même
// forme que GAMMES pour réutiliser GammeCard.
export const COVOITURAGE: typeof GAMMES[number] = {
  id: 'covoit',
  label: 'Covoiturage',
  badge: 'Partagé',
  description: 'Trajet partagé, prix réduit par passager',
  icon: '🚗',
  basePrice: 700,
  eta: '6 min',
  illu: 'covoiturage',
};
// Option « Pas de détour » : le covoiturage continue (la voiture peut prendre
// d'autres passagers) MAIS uniquement ceux déjà sur le trajet vers la
// destination — aucun détour. Trajet plus direct, donc tarif plus élevé.
export const COVOITURAGE_NODETOUR_PRICE = 1150;

// ——— Livraison (périmètre validé : Vélo Express / Moto Livraison) ———

// Gammes Livraison. Même forme que GAMMES pour partager la carte gamme — chacune
// porte sa variante du jeu `mobility option` (`illu`) : le véhicule prime sur le
// service, la Moto Livraison montre donc la même moto que le Taxi Moto.
export type LivraisonGamme = {
  id: string; label: string; description: string; capacity: string;
  basePrice: number; eta: string; illu: 'velo' | 'moto';
};

export const LIVRAISON_GAMMES: LivraisonGamme[] = [
  {
    id: 'velo',
    label: 'Vélo Express',
    description: 'Documents et petits colis',
    capacity: 'Jusqu’à 5 kg',
    basePrice: 700,
    eta: '5 min',
    illu: 'velo',
  },
  {
    id: 'motoliv',
    label: 'Moto Livraison',
    description: 'Colis moyens, top-case sécurisé',
    capacity: 'Jusqu’à 20 kg',
    basePrice: 1200,
    eta: '4 min',
    illu: 'moto',
  },
];

// Gamme Livraison choisie à l'étape « méthode », relue par les écrans suivants
// (détails, mise en relation, suivi) à partir du seul `gammeId` transporté.
export const livraisonGamme = (gammeId?: string) =>
  LIVRAISON_GAMMES.find((g) => g.id === gammeId) ?? LIVRAISON_GAMMES[0];

// Gamme Livraison complémentaire (état « Aucun prestataire ») : Vélo ↔ Moto.
export const complementaryLivraisonGamme = (gammeId: string) =>
  gammeId === 'velo'
    ? LIVRAISON_GAMMES.find((g) => g.id === 'motoliv')!
    : LIVRAISON_GAMMES.find((g) => g.id === 'velo')!;

// Type et taille de colis : retirés de la commande le 2 août 2026 (croquis
// « Détails de livraison »). Le colis n'est plus décrit que par la description
// libre, facultative — la capacité annoncée par la gamme (5 kg / 20 kg) suffit à
// cadrer ce qui est acceptable. Les jeux `COLIS_TYPES` / `COLIS_TAILLES` et leurs
// tuiles S/M/L sont dans l'historique git si la saisie structurée revient.

// Livraison groupée (Option B, cf. CONTEXT.md + Product Doc « B — Détection
// automatique ») : PROPOSITION détectée par l'algorithme quand d'autres
// Commandes existent dans le même cluster — jamais un réglage a priori.
// Option A = livraison normale, prix standard, départ immédiat.
// Option B = groupée, prix réduit, départ dès 2 commandes confirmées ;
// si le seuil n'est pas atteint dans le délai → livraison simple, prix normal.
export const GROUPEE_ECONOMIE = 250;       // réduction vs livraison normale (F CFA)
export const GROUPAGE_MIN_COMMANDES = 2;   // seuil de déclenchement du groupage
export const GROUPAGE_DELAI_MAX_MIN = 10;  // délai max d'attente (5–10 min)

// Prestataires Livraison (mock). La plaque du vélo est un identifiant Fiw (pas
// d'immatriculation) ; le scooter porte une vraie plaque.
export const VELO_LIVREUR = {
  name: 'Cheikh Mbaye',
  vehicle: 'Vélo cargo',
  color: 'Bleu',
  plate: 'FIW-1042',
  rating: 4.9,
  trips: 435,
  id: 'VEL-1042',
  emoji: '🚴🏾',
};

export const MOTO_LIVREUR = {
  name: 'Abdou Faye',
  vehicle: 'Scooter TVS',
  color: 'Bleu',
  plate: 'DK-5310-E',
  rating: 4.8,
  trips: 1067,
  id: 'LIV-5310',
  emoji: '👨🏾',
};

// Répertoire du Client (mock) — le destinataire se choisit d'abord dans les
// contacts, la saisie manuelle est le repli (retour user test du 12 juil. 2026).
export const CONTACTS: { id: string; name: string; phone: string }[] = [
  { id: 'c-1', name: 'Awa Diop', phone: '77 123 45 67' },
  { id: 'c-2', name: 'Mamadou Ndiaye', phone: '78 456 12 30' },
  { id: 'c-3', name: 'Fatou Sarr', phone: '76 890 22 14' },
  { id: 'c-4', name: 'Ousmane Ba', phone: '70 334 55 89' },
  { id: 'c-5', name: 'Aïda Fall', phone: '77 654 09 81' },
];

// Numéro de suivi d'une Commande livraison standard (préfixe LIV- ; YOB- est
// réservé au Yobanté, cf. modèle conceptuel).
export const makeTrackingNumber = () => {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `LIV-${ymd}-${String(Math.floor(Math.random() * 900) + 100)}`;
};

// Code de remise à 4 chiffres (réf. inDrive Delivery protection) : le Client le
// communique au destinataire ; le prestataire le demande à la remise.
export const makeCodeRemise = () => String(Math.floor(1000 + Math.random() * 9000));

// Même ordre que la page Moyens de paiement : Espèces en tête (moyen le plus
// utilisé du marché dakarois, et défaut de départ). Les deux listes doivent
// rester alignées — un ordre différent d'un écran à l'autre se lit comme un bug.
export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Espèces', icon: '💵', color: '#6B7280' },
  { id: 'wave', label: 'Wave', icon: '🌊', color: '#1EADFF' },
  { id: 'orange', label: 'Orange Money', icon: '🟠', color: '#FF6200' },
];

export const FRAIS_RAPPROCHEMENT = 350;

// Frais d'attente (cf. CONTEXT.md) : délai gratuit unique de 5 min à l'arrivée
// du prestataire, puis 100 F CFA/min. Annoncés au client dès la commande.
export const WAIT_GRACE_MINUTES = 5;
export const WAIT_FEE_PER_MIN = 100;

// Historique des courses (mock). Le détail expose la PLAQUE (retrouver un objet
// oublié via le service client), jamais le numéro du prestataire — le client ne
// contacte jamais directement le prestataire (cf. décision design).
export const COURSE_HISTORY: {
  id: string; date: string; destName: string; destDetail: string;
  gammeId: string; gammeLabel: string;
  prestataireName: string; prestatairePlate: string; vehicle: string; paymentLabel: string;
  base: number; fraisRapprochement: number; fraisAttente: number; total: number;
}[] = [
  {
    id: 'h-1', date: "Aujourd'hui · 14:32", destName: 'Almadies', destDetail: 'Dakar Ouest',
    gammeId: 'simple', gammeLabel: 'Taxi Auto',
    prestataireName: 'Moussa Diallo', prestatairePlate: 'DK-4521-A', vehicle: 'Toyota Corolla Blanche', paymentLabel: 'Wave',
    base: 1500, fraisRapprochement: 0, fraisAttente: 0, total: 1500,
  },
  {
    id: 'h-2', date: 'Hier · 08:15', destName: 'Aéroport AIBD', destDetail: 'Rufisque',
    gammeId: 'confort', gammeLabel: 'Taxi Auto Confort',
    prestataireName: 'Awa Ndiaye', prestatairePlate: 'DK-3092-C', vehicle: 'Hyundai Accent Grise', paymentLabel: 'Orange Money',
    base: 5200, fraisRapprochement: 350, fraisAttente: 200, total: 5750,
  },
  {
    id: 'h-3', date: '28 juin · 19:40', destName: 'Plateau', destDetail: 'Dakar Centre',
    gammeId: 'moto', gammeLabel: 'Taxi Moto',
    prestataireName: 'Ibrahima Sy', prestatairePlate: 'DK-7734-B', vehicle: 'Yamaha FZ Rouge', paymentLabel: 'Espèces',
    base: 800, fraisRapprochement: 0, fraisAttente: 0, total: 800,
  },
  {
    id: 'h-4', date: '25 juin · 12:05', destName: 'Parcelles Assainies', destDetail: 'Dakar Nord',
    gammeId: 'simple', gammeLabel: 'Taxi Auto',
    prestataireName: 'Fatou Sarr', prestatairePlate: 'DK-1188-D', vehicle: 'Kia Picanto Bleue', paymentLabel: 'Wave',
    base: 2100, fraisRapprochement: 350, fraisAttente: 0, total: 2450,
  },
];
