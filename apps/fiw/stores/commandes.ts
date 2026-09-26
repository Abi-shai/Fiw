import { useSyncExternalStore } from 'react';

/** Service porteur d'une Commande. « Commande » est le terme canonique
 *  (cf. CONTEXT.md) ; l'interface dit « Course » côté Transport et « Livraison »
 *  côté Livraison — ce sont des étiquettes, pas deux concepts. */
export type ServiceId = 'transport' | 'livraison';

/**
 * Une Commande en cours, telle que l'accueil doit la montrer.
 *
 * **Règle produit : une Commande par service.** Une Course et une Livraison
 * peuvent tourner ensemble, jamais deux du même service. Le store est donc
 * indexé PAR SERVICE plutôt que d'être une liste : la règle devient une
 * propriété de la structure au lieu d'un garde-fou qu'on peut oublier
 * d'appeler. Poser une seconde Course écrase la première par construction.
 *
 * Conséquence côté accueil : la tuile d'un service occupé n'est plus une porte
 * vers la commande, c'est une porte vers la Commande en cours. On ne bloque
 * jamais avec un message — le corpus (Careem réduit son menu à quatre entrées
 * pendant la course, Waymo renomme son premier onglet « My trip ») ne le fait
 * nulle part.
 */
export type CommandeEnCours = {
  service: ServiceId;
  /** Libellé d'état, en tête de bannière : « Course en cours ». Écrit en
   *  minuscules — c'est le style qui le met en capitales (`SectionLabel`). */
  etat: string;
  /** L'échéance que le Client attend : « Arrivée vers 14:32 ». C'est le titre
   *  de la bannière ET la première ligne de la tuile. */
  titre: string;
  /** Qui exécute. Seul, il tient dans la tuile. */
  prestataire: string;
  /** Avec quoi. Rejoint le prestataire dans la bannière, qui a la largeur. */
  vehicule: string;
  /** Route de reprise — la bannière et la tuile y mènent toutes les deux.
   *  Union fermée plutôt que `string` : l'accueil pousse cette valeur telle
   *  quelle dans `router.push`, et une route libre l'obligerait à la forcer. */
  href: '/transport/course-active' | '/livraison/suivi';
  /** Paramètres à replacer sur la route de reprise. */
  params?: Record<string, string>;
};

type Actives = Partial<Record<ServiceId, CommandeEnCours>>;

// Même motif que `stores/places`, `stores/payment` et `stores/safety` : store de
// module + abonnement. L'accueil, la course active et le suivi de livraison
// doivent voir la même chose, et le proto n'a rien à persister.
let actives: Actives = {};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

// `useSyncExternalStore` compare les snapshots par identité : l'objet n'est
// reconstruit qu'au commit, sinon chaque rendu en crée un nouveau et la boucle
// ne s'arrête jamais.
let snap: Actives = actives;
const snapshot = () => snap;
const commit = () => {
  snap = actives;
  emit();
};

/** Les Commandes en cours, indexées par service. */
export function useCommandes(): Actives {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/** Déclare (ou remplace) la Commande en cours d'un service. */
export function setCommande(c: CommandeEnCours) {
  actives = { ...actives, [c.service]: c };
  commit();
}

/** Retire la Commande d'un service — clôture ou annulation. */
export function clearCommande(service: ServiceId) {
  if (!actives[service]) return;
  const next = { ...actives };
  delete next[service];
  actives = next;
  commit();
}

/**
 * Ordre d'affichage des bannières quand les deux services tournent.
 *
 * La Livraison passe au-dessus, la Course en dessous : la pile grandit vers le
 * haut et la plus proche de la feuille est celle qu'on regarde en premier
 * (règle posée par la planche « B explorée », Figma 924:571). Au-delà de deux
 * il n'y a rien à trancher — la règle « une par service » plafonne la pile.
 */
export const BANNER_ORDER: ServiceId[] = ['livraison', 'transport'];

/** Les Commandes en cours, dans l'ordre d'empilement des bannières. */
export function orderedCommandes(a: Actives): CommandeEnCours[] {
  return BANNER_ORDER.map((s) => a[s]).filter((c): c is CommandeEnCours => !!c);
}

/** Heure d'échéance affichée par la bannière — « 14:32 ».
 *  Le proto la fige au montage de l'écran de suivi : la simulation compresse le
 *  temps, une heure recalculée à chaque seconde dériverait de la carte. */
export function heureEcheance(minutes: number) {
  return new Date(Date.now() + minutes * 60_000)
    .toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
