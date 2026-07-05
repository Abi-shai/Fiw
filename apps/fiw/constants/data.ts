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
];

// Lieux enregistrés par le client (onglet « Enregistré »)
export const SAVED_PLACES = [
  { id: 's-home', kind: 'home', label: 'Maison', detail: 'Sacré-Cœur 3, Villa 214', lat: 14.7225, lng: -17.4688 },
  { id: 's-work', kind: 'work', label: 'Travail', detail: 'Plateau, Av. Léopold Sédar Senghor', lat: 14.6712, lng: -17.4382 },
];

// Destinations récentes (onglet « Suggéré »)
export const RECENT_PLACES = [
  { id: 'r-1', name: 'Almadies', detail: 'Dakar Ouest', lat: 14.7320, lng: -17.5113 },
  { id: 'r-2', name: 'Aéroport AIBD', detail: 'Rufisque', lat: 14.6740, lng: -17.0730 },
];

export const DRIVER = {
  name: 'Moussa Diallo',
  vehicle: 'Toyota Corolla',
  color: 'Blanche',
  plate: 'DK-4521-A',
  rating: 4.8,
  trips: 1243,
  id: 'AUT-8821',
  emoji: '👨🏾',
};

export const MOTO_DRIVER = {
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

export const PAYMENT_METHODS = [
  { id: 'wave', label: 'Wave', icon: '🌊', color: '#1EADFF' },
  { id: 'orange', label: 'Orange Money', icon: '🟠', color: '#FF6200' },
  { id: 'cash', label: 'Espèces', icon: '💵', color: '#6B7280' },
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
  driverName: string; driverPlate: string; vehicle: string; paymentLabel: string;
  base: number; fraisRapprochement: number; fraisAttente: number; total: number;
}[] = [
  {
    id: 'h-1', date: "Aujourd'hui · 14:32", destName: 'Almadies', destDetail: 'Dakar Ouest',
    gammeId: 'simple', gammeLabel: 'Taxi Auto',
    driverName: 'Moussa Diallo', driverPlate: 'DK-4521-A', vehicle: 'Toyota Corolla Blanche', paymentLabel: 'Wave',
    base: 1500, fraisRapprochement: 0, fraisAttente: 0, total: 1500,
  },
  {
    id: 'h-2', date: 'Hier · 08:15', destName: 'Aéroport AIBD', destDetail: 'Rufisque',
    gammeId: 'confort', gammeLabel: 'Taxi Auto Confort',
    driverName: 'Awa Ndiaye', driverPlate: 'DK-3092-C', vehicle: 'Hyundai Accent Grise', paymentLabel: 'Orange Money',
    base: 5200, fraisRapprochement: 350, fraisAttente: 200, total: 5750,
  },
  {
    id: 'h-3', date: '28 juin · 19:40', destName: 'Plateau', destDetail: 'Dakar Centre',
    gammeId: 'moto', gammeLabel: 'Taxi Moto',
    driverName: 'Ibrahima Sy', driverPlate: 'DK-7734-B', vehicle: 'Yamaha FZ Rouge', paymentLabel: 'Espèces',
    base: 800, fraisRapprochement: 0, fraisAttente: 0, total: 800,
  },
  {
    id: 'h-4', date: '25 juin · 12:05', destName: 'Parcelles Assainies', destDetail: 'Dakar Nord',
    gammeId: 'simple', gammeLabel: 'Taxi Auto',
    driverName: 'Fatou Sarr', driverPlate: 'DK-1188-D', vehicle: 'Kia Picanto Bleue', paymentLabel: 'Wave',
    base: 2100, fraisRapprochement: 350, fraisAttente: 0, total: 2450,
  },
];
