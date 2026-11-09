import type { IconName } from '@/components/Icon';
import type { IlluKey } from '@/constants/illustrations';

/**
 * Activation par service — données du proto.
 *
 * ⚠️ **Périmètre v1 : le Transport seul.** L'app Client n'ouvre que le
 * Transport au lancement (décision du 4 octobre 2026) ; proposer à un
 * Prestataire d'activer Vélo Express ou Moto Livraison l'enverrait monter un
 * dossier pour un service qui ne reçoit aucune commande. Les deux services de
 * livraison et l'Assistance Routière restent au périmètre produit
 * (`feature-list`), pas à celui de la v1.
 *
 * ⚠️ **L'affiliation n'a PAS d'entrée ici.** La `feature-list` de juin annonçait
 * un canal « prestataire-à-prestataire » dans Fiw Pro ; l'[ADR 0005](../../../docs/adr/0005-affiliereseau-client-uniquement.md)
 * l'a abandonné en même temps qu'il posait « 1 affilié = 1 app ». L'Affilié
 * Réseau vit côté Client, l'Affilié Partenaire est une entité à part avec sa
 * propre navigation (ADR 0006).
 */

export type EtatDossier = 'brouillon' | 'attente' | 'valide' | 'refuse';
export type EtatPiece = 'manquante' | 'deposee' | 'valide' | 'refusee' | 'expire';

export type Piece = {
  id: string;
  label: string;
  /** Ce qu'on attend précisément — affiché avant la prise de vue. */
  consigne: string;
  etat: EtatPiece;
  /** Motif du refus, ou date d'expiration proche. */
  note?: string;
};

export type Service = {
  id: 'voiture' | 'moto';
  label: string;
  /** Ce que le service fait gagner, en une ligne — c'est ce qui décide. */
  argument: string;
  illu: IlluKey;
  icon: IconName;
  /** Préfixe de l'identifiant attribué une fois le service validé. */
  prefixe: string;
  etat: EtatDossier;
  /** Identifiant attribué — seulement une fois le dossier validé. */
  identifiant?: string;
  pieces: Piece[];
};

export const SERVICES: Service[] = [
  {
    id: 'voiture',
    label: 'Taxi Voiture',
    argument: 'Les courses les mieux payées, en Simple, Confort ou Prestige.',
    illu: 'auto',
    icon: 'car',
    prefixe: 'AUT',
    etat: 'attente',
    pieces: [
      { id: 'cni',      label: "Carte d'identité",    consigne: 'Les deux faces, à plat, sans reflet.',              etat: 'valide' },
      { id: 'permis',   label: 'Permis de conduire',  consigne: 'Recto et verso, les quatre coins visibles.',        etat: 'valide' },
      { id: 'grise',    label: 'Carte grise',         consigne: 'La page où figurent la plaque et le propriétaire.', etat: 'deposee' },
      { id: 'assur',    label: 'Assurance',           consigne: "L'attestation en cours de validité.",               etat: 'refusee', note: 'Attestation expirée depuis le 2 novembre.' },
      { id: 'visite',   label: 'Visite technique',    consigne: 'Le procès-verbal de la dernière visite.',           etat: 'manquante' },
      { id: 'photo',    label: 'Photo du véhicule',   consigne: 'De trois quarts avant, le véhicule entier dans le cadre.', etat: 'manquante' },
    ],
  },
  {
    id: 'moto',
    label: 'Taxi Moto',
    argument: 'Plus de courses, plus courtes — et vous passez partout.',
    illu: 'moto',
    icon: 'moto',
    prefixe: 'MOT',
    etat: 'brouillon',
    pieces: [
      { id: 'cni',    label: "Carte d'identité",   consigne: 'Les deux faces, à plat, sans reflet.',        etat: 'manquante' },
      { id: 'permis', label: 'Permis de conduire', consigne: 'Recto et verso, les quatre coins visibles.',  etat: 'manquante' },
      { id: 'grise',  label: 'Carte grise',        consigne: 'La page où figurent la plaque et le propriétaire.', etat: 'manquante' },
      { id: 'assur',  label: 'Assurance',          consigne: "L'attestation en cours de validité.",         etat: 'manquante' },
      { id: 'casque', label: 'Photo avec casque',  consigne: 'Vous, casque sur la tête, à côté de la moto.', etat: 'manquante' },
    ],
  },
];

export const ETAT_DOSSIER_LABEL: Record<EtatDossier, string> = {
  brouillon: 'Pas commencé',
  attente:   'En cours de validation',
  valide:    'Validé',
  refuse:    'Refusé',
};

/** Ce qu'il reste à faire sur un dossier — la seule chose que le Prestataire
 *  cherche en ouvrant l'écran. Rendu en texte plutôt qu'en pourcentage :
 *  « 2 pièces à déposer » se traite, « 67 % » ne se traite pas. */
export function resteAFaire(s: Service): string {
  const bloquantes = s.pieces.filter((p) => p.etat === 'manquante' || p.etat === 'refusee');
  if (bloquantes.length === 0) {
    return s.etat === 'valide'
      ? `Identifiant ${s.identifiant ?? `${s.prefixe}-••••`}`
      : 'Tout est déposé — Fiw vérifie.';
  }
  const refusees = bloquantes.filter((p) => p.etat === 'refusee').length;
  if (refusees > 0) {
    return `${refusees} pièce${refusees > 1 ? 's' : ''} à refaire`;
  }
  return `${bloquantes.length} pièce${bloquantes.length > 1 ? 's' : ''} à déposer`;
}

/** La pièce à traiter en priorité — celle qui bloque le plus le dossier.
 *  Une pièce REFUSÉE passe avant une pièce manquante : le Prestataire croit
 *  l'avoir déjà faite, c'est donc là qu'il perd le plus de temps sans le
 *  savoir. Motif « prochaine étape » d'Uber (benchmark § 3.4). */
export function prochainePiece(s: Service): Piece | undefined {
  return s.pieces.find((p) => p.etat === 'refusee') ?? s.pieces.find((p) => p.etat === 'manquante');
}
