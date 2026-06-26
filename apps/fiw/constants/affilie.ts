// Données factices pour le parcours Affilié Réseau (UI : « Ambassadeur »).
// Proto de calage visuel — voir docs/breadboard-affilie-reseau.md.

export type AffilieState = 'fondateur' | 'actif' | 'gele';
export type MemberKind = 'chauffeur' | 'livreur' | 'client';

/** État global du compte. 'actif' pour rendre le flux de retrait navigable ;
 *  le dashboard témoin illustre séparément l'état 'fondateur'. */
export const AMBASSADEUR = {
  name: 'Awa Diop',
  code: 'AWA2024',
  state: 'actif' as AffilieState,
  balance: 12400,
  defaultNumber: '77 123 45 67',
};

export const WITHDRAW_MIN = 1000;

export type Commission = {
  id: string;
  name: string;
  kind: MemberKind;
  date: string;
  courses: number;
  amount: number;
};

export const COMMISSIONS: Commission[] = [
  { id: 'c1', name: 'Modou Fall',   kind: 'chauffeur', date: '24 juin 2026', courses: 5, amount: 3200 },
  { id: 'c2', name: 'Fatou Ndiaye', kind: 'client',    date: '23 juin 2026', courses: 3, amount: 1850 },
  { id: 'c3', name: 'Ibrahima Sow', kind: 'livreur',   date: '22 juin 2026', courses: 4, amount: 2400 },
  { id: 'c4', name: 'Modou Fall',   kind: 'chauffeur', date: '20 juin 2026', courses: 6, amount: 3600 },
  { id: 'c5', name: 'Aïssatou Ba',  kind: 'client',    date: '18 juin 2026', courses: 2, amount: 1350 },
];

export type Member = {
  id: string;
  name: string;
  kind: MemberKind;
  active: boolean;
  courses: number;
};

export const MEMBERS: Member[] = [
  { id: 'm1', name: 'Modou Fall',    kind: 'chauffeur', active: true,  courses: 27 },
  { id: 'm2', name: 'Ibrahima Sow',  kind: 'livreur',   active: true,  courses: 14 },
  { id: 'm3', name: 'Cheikh Diouf',  kind: 'chauffeur', active: false, courses: 0 },
  { id: 'm4', name: 'Fatou Ndiaye',  kind: 'client',    active: true,  courses: 9 },
  { id: 'm5', name: 'Aïssatou Ba',   kind: 'client',    active: true,  courses: 5 },
  { id: 'm6', name: 'Ndeye Gueye',   kind: 'client',    active: false, courses: 0 },
];

/** Formate un montant en francs CFA avec séparateur d'espace : 12400 → « 12 400 F ». */
export const fcfa = (n: number) => `${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} F`;

/** Libellé grand public d'un membre selon son service connu. */
export const kindLabel = (k: MemberKind) =>
  k === 'chauffeur' ? 'Chauffeur' : k === 'livreur' ? 'Livreur' : 'Client';

export const kindIcon = (k: MemberKind): 'car' | 'package' | 'rider' =>
  k === 'chauffeur' ? 'car' : k === 'livreur' ? 'package' : 'rider';

/** Détection sommaire de l'opérateur Mobile Money d'après le préfixe. */
export function detectOperator(num: string): string | null {
  const d = num.replace(/\D/g, '');
  if (d.length < 2) return null;
  if (d.startsWith('77') || d.startsWith('78')) return 'Orange Money';
  if (d.startsWith('70') || d.startsWith('76')) return 'Wave';
  if (d.startsWith('75')) return 'Free Money';
  return 'Mobile Money';
}
