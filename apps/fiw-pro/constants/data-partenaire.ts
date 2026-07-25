export type PartenaireMode = 'pending' | 'actif' | 'gele';

// Changer cette valeur pour tester les différents modes :
// 'pending' → mode limité (validation en attente)
// 'actif'   → mode actif (tout disponible)
// 'gele'    → wallet bloqué, reste actif
export const MOCK_MODE: PartenaireMode = 'actif';

export const PARTENAIRE = {
  nom: 'Diarama Hôtel',
  gerant: 'Mamadou Diop',
  telephone: '+221 77 123 45 67',
  pointExpress: 'Diarama Hôtel — Almadies',
  mobileMoneyNumero: '+221 77 123 45 67',
  mobileMoneyOperateur: 'Wave',
};

export const STATS = {
  today:  { courses: 5,   commission: 2000  },
  month:  { courses: 32,  commission: 12800 },
  total:  { courses: 187, commission: 74800 },
  solde:  8200,
};

export const CLIENTS_SAUVEGARDES = [
  { id: '1', nom: 'Fatou Diallo',   telephone: '+221 77 123 45 67', derniere_destination: 'Plateau — Av. Léopold Sédar Senghor' },
  { id: '2', nom: 'Moussa Ndiaye',  telephone: '+221 78 234 56 78', derniere_destination: 'Mermoz — Rue 10' },
  { id: '3', nom: 'Aïssatou Fall',  telephone: '+221 76 345 67 89', derniere_destination: 'Liberté 6 — Cité' },
];

export const COMMISSIONS = [
  { id: '1', date: "Aujourd'hui", destination: 'Plateau',   client: 'Fatou Diallo',   montant: 420 },
  { id: '2', date: "Aujourd'hui", destination: 'Mermoz',    client: 'Moussa Ndiaye',  montant: 550 },
  { id: '3', date: 'Hier',        destination: 'Liberté 6', client: 'Aïssatou Fall',  montant: 380 },
  { id: '4', date: 'Hier',        destination: 'Point E',   client: 'Ibrahima Sow',   montant: 490 },
  { id: '5', date: '25 juin',     destination: 'Grand Yoff',client: 'Mariama Dieng',  montant: 600 },
];

export const PRESTATAIRES_FAVORIS = [
  { id: '1', nom: 'Alioune Badara Cissé', type: 'Chauffeur', note: 4.8 },
  { id: '2', nom: 'Cheikh Oumar Sy',      type: 'Chauffeur', note: 4.6 },
];
