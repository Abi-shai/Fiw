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

export const GAMMES = [
  {
    id: 'moto',
    label: 'Taxi Moto',
    description: 'Rapide, idéal pour courtes distances',
    icon: '🛵',
    basePrice: 800,
    eta: '3 min',
  },
  {
    id: 'simple',
    label: 'Simple',
    description: 'Confortable, climatisé',
    icon: '🚗',
    basePrice: 1500,
    eta: '5 min',
  },
  {
    id: 'confort',
    label: 'Confort',
    description: 'Berline récente, grand confort',
    icon: '🚙',
    basePrice: 2200,
    eta: '7 min',
  },
  {
    id: 'prestige',
    label: 'Prestige',
    description: 'SUV ou berline haut de gamme',
    icon: '🚘',
    basePrice: 3500,
    eta: '10 min',
  },
];

export const PAYMENT_METHODS = [
  { id: 'wave', label: 'Wave', icon: '🌊', color: '#1EADFF' },
  { id: 'orange', label: 'Orange Money', icon: '🟠', color: '#FF6200' },
  { id: 'free', label: 'Free Money', icon: '🔴', color: '#E02020' },
  { id: 'cash', label: 'Espèces', icon: '💵', color: '#6B7280' },
];

export const FRAIS_RAPPROCHEMENT = 350;
