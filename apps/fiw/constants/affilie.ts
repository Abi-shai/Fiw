// Données factices pour le parcours Affilié Réseau.
// Proto de calage visuel — voir docs/breadboard-affilie-reseau.md.

import { type IconName } from '@/components/Icon';

export type AffilieState = 'actif' | 'gele';

/**
 * Service par lequel un Affilié travaille.
 *
 * ⚠️ Remplace `MemberKind = 'chauffeur' | 'livreur' | 'client'`
 * (27 septembre 2026), pour deux raisons :
 *
 * 1. **« chauffeur » est proscrit comme terme de domaine** (`CONTEXT.md`) — il
 *    n'est toléré que dans les intitulés d'interface du flux Transport. On nomme
 *    donc le **service**, pas la personne : un Affilié fait du Transport ou de la
 *    Livraison, et reste un **Prestataire** dans les deux cas.
 * 2. **`client` sort du périmètre** : depuis le recap du 30 août 2026, la
 *    commission de 2 % ne tombe que sur les courses réalisées par les
 *    **Prestataires** inscrits avec le code. Un Client recruté ne rapporte rien,
 *    il n'a donc plus à figurer dans le réseau.
 */
export type MemberService = 'transport' | 'livraison';

/** Le Client qui porte le rôle Affilié Réseau — c'est-à-dire l'utilisateur.
 *  ⚠️ Nommé `AMBASSADEUR` jusqu'au 27 septembre 2026, alors que `CONTEXT.md`
 *  proscrit « ambassadeur » jusque dans le code. Et pas `AFFILIE` tout court :
 *  le mot seul désigne la personne RECRUTÉE, soit le rôle inverse. */
export const AFFILIE_RESEAU = {
  name: 'Awa Diop',
  code: 'AWA2024',
  /** 'actif' par défaut (retrait ouvert dès le lancement — l'app est
   *  commercialisée dès le départ) ; 'gele' = suspension (retrait bloqué,
   *  contacter le support). */
  state: 'actif' as AffilieState,
  balance: 12400,
  defaultNumber: '77 123 45 67',
};

export const WITHDRAW_MIN = 1000;

/** Le message envoyé quand l'Affilié Réseau partage son code.
 *  ⚠️ Il visait un CLIENT (« commande ta première course ») alors que la
 *  commission ne tombe que sur les courses des **Prestataires** inscrits avec le
 *  code (recap du 30 août 2026) — il s'adressait donc à quelqu'un qui ne
 *  rapporterait rien. Ici et pas dans l'écran : `outils` et `qr` le partagent,
 *  et un fichier de `app/` n'exporte qu'un écran. */
export const SHARE_MESSAGE = `Rejoins Fiw comme prestataire avec mon code ${AFFILIE_RESEAU.code}.`;

export type Member = {
  id: string;
  name: string;
  service: MemberService;
  active: boolean;
  courses: number;
};

/** Le réseau : les Prestataires inscrits avec le code. */
export const MEMBERS: Member[] = [
  { id: 'm1', name: 'Modou Fall',   service: 'transport', active: true,  courses: 27 },
  { id: 'm2', name: 'Ibrahima Sow', service: 'livraison', active: true,  courses: 14 },
  { id: 'm3', name: 'Awa Camara',   service: 'transport', active: true,  courses: 9 },
  { id: 'm4', name: 'Pape Ndoye',   service: 'livraison', active: true,  courses: 6 },
  { id: 'm5', name: 'Cheikh Diouf', service: 'transport', active: false, courses: 0 },
];

export type Commission = {
  id: string;
  name: string;
  service: MemberService;
  date: string;
  courses: number;
  amount: number;
};

export const COMMISSIONS: Commission[] = [
  { id: 'c1', name: 'Modou Fall',   service: 'transport', date: '24 juin 2026', courses: 5, amount: 3200 },
  { id: 'c2', name: 'Ibrahima Sow', service: 'livraison', date: '23 juin 2026', courses: 3, amount: 1850 },
  { id: 'c3', name: 'Awa Camara',   service: 'transport', date: '22 juin 2026', courses: 4, amount: 2400 },
  { id: 'c4', name: 'Modou Fall',   service: 'transport', date: '20 juin 2026', courses: 6, amount: 3600 },
  { id: 'c5', name: 'Pape Ndoye',   service: 'livraison', date: '18 juin 2026', courses: 2, amount: 1350 },
];

/** Les deux chiffres du réseau, LUS depuis la liste plutôt qu'écrits en dur :
 *  ajouter un membre les met à jour tous les deux. */
export const activeMembers = (ms: Member[] = MEMBERS) => ms.filter((m) => m.active).length;
export const totalCourses = (ms: Member[] = MEMBERS) => ms.reduce((n, m) => n + m.courses, 0);

/** Formate un montant en francs CFA avec séparateur d'espace : 12400 → « 12 400 F ». */
export const fcfa = (n: number) => `${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} F`;

/** Libellé grand public du service d'un Affilié. */
export const serviceLabel = (s: MemberService) => (s === 'transport' ? 'Transport' : 'Livraison');

/** Glyphe du service. `car` et `package` sont les deux pictogrammes que l'app
 *  emploie déjà pour ces deux services (tuiles d'accueil, itinéraires). */
export const serviceIcon = (s: MemberService): IconName => (s === 'transport' ? 'car' : 'package');

/** Détection sommaire de l'opérateur Mobile Money d'après le préfixe. */
export function detectOperator(num: string): string | null {
  const d = num.replace(/\D/g, '');
  if (d.length < 2) return null;
  if (d.startsWith('77') || d.startsWith('78')) return 'Orange Money';
  if (d.startsWith('70') || d.startsWith('76')) return 'Wave';
  if (d.startsWith('75')) return 'Free Money';
  return 'Mobile Money';
}
