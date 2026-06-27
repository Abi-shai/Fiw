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
