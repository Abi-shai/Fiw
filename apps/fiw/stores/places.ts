import { useSyncExternalStore } from 'react';
import { SAVED_PLACES } from '@/constants/data';

/** Lieu enregistré (cf. CONTEXT.md). `home` et `work` sont les deux emplacements
 *  permanents — toujours présents, jamais supprimables, au libellé figé ; les
 *  `custom` sont les lieux libres que le Client crée et nomme lui-même (D2). */
export type Place = {
  id: string;
  kind: 'home' | 'work' | 'custom';
  /** Nom donné par le Client — privé, ne sort jamais de son app. */
  label: string;
  /** L'adresse : ce que la carte sait trouver. */
  detail: string;
  /** Le Repère (cf. CONTEXT.md) — mémorisé ici, lu par le Prestataire une fois
   *  recopié sur le point de la Commande. Vide tant que le Client n'en a pas mis. */
  repere: string;
  lat: number;
  lng: number;
};

// Les Lieux enregistrés vivent hors des écrans : la liste (`compte/lieux`), la
// fiche d'édition (`compte/lieu`) et la recherche d'itinéraire (`home`) doivent
// voir la même chose. Store de module + abonnement — pas de Context à câbler
// dans `_layout`, et le proto n'a rien à persister.
let places: Place[] = SAVED_PLACES.map((p) => ({
  ...p,
  kind: p.kind as Place['kind'],
  repere: p.repere ?? '',
}));

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const snapshot = () => places;

/** Liste réactive des Lieux enregistrés. */
export function usePlaces(): Place[] {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

export const getPlace = (id?: string) => (id ? places.find((p) => p.id === id) : undefined);

/** Crée ou remplace un lieu selon que son `id` existe déjà. */
export function savePlace(next: Place) {
  places = places.some((p) => p.id === next.id)
    ? places.map((p) => (p.id === next.id ? next : p))
    : [...places, next];
  emit();
}

/** Ne s'applique qu'aux lieux libres — Maison et Travail sont permanents. */
export function removePlace(id: string) {
  places = places.filter((p) => p.id !== id);
  emit();
}

/** Le pendant du retrait pour Maison et Travail : l'emplacement reste dans la
 *  liste, vidé de son adresse (`detail` vide = « à remplir »). Un Client qui
 *  déménage peut retirer l'ancienne adresse sans connaître encore la nouvelle. */
export function clearAddress(id: string) {
  // Le Repère décrit un point précis : sans adresse il ne décrit plus rien.
  places = places.map((p) => (p.id === id ? { ...p, detail: '', repere: '' } : p));
  emit();
}

// Identifiants des lieux libres créés dans la session (le proto n'a pas de back).
let seq = 0;
export const newPlaceId = () => `c-${++seq}`;
