import { useSyncExternalStore } from 'react';

/**
 * Moyens de paiement du Client — source de vérité partagée.
 *
 * Une seule liste : un moyen de paiement est un moyen de paiement, on ne
 * rubrique pas « Mobile Money » d'un côté et « Espèces » de l'autre. Ce qui
 * distingue les moyens, c'est leur ÉTAT — trois, et trois seulement :
 *
 * · non configuré — aucun numéro lié. N'existe que pour le Mobile Money (les
 *   Espèces n'ont rien à configurer). Ne peut pas être le moyen par défaut.
 * · configuré     — utilisable pour payer une Commande.
 * · par défaut    — LE configuré pré-sélectionné à la commande. Exactement un à
 *   tout instant, forcément parmi les configurés.
 *
 * Les Espèces sont configurées d'office, donc il existe toujours au moins un
 * moyen configuré — et donc toujours un repli valide pour le défaut. C'est ce
 * qui rend `removeNumber` sûr : retirer le compte par défaut fait retomber le
 * défaut sur les Espèces plutôt que de laisser l'invariant cassé.
 *
 * Free Money est absent volontairement : ce n'est pas un moyen de paiement Fiw
 * (cf. CONTEXT.md « Mobile Money » — Wave et Orange Money, et eux seuls).
 *
 * L'état vit ici et non dans l'écran parce que ces trois états décrivent le
 * moyen de paiement **partout** : la page Compte les résume, la `PaymentSheet`
 * des parcours doit les honorer (cf. `benchmark-compte-mobbin.md` § D6, todo P9).
 */
export type MethodId = 'cash' | 'wave' | 'orange';
export type Method = { id: MethodId; label: string };

// Espèces en tête : moyen le plus utilisé du marché dakarois, et défaut de
// départ. L'ordre suit l'usage réel, pas l'ordre d'arrivée des services.
export const METHODS: Method[] = [
  { id: 'cash', label: 'Espèces' },
  { id: 'wave', label: 'Wave' },
  { id: 'orange', label: 'Orange Money' },
];

export type PaymentState = {
  numbers: Partial<Record<MethodId, string>>;
  defaultId: MethodId;
};

let state: PaymentState = {
  numbers: { wave: '77 ••• •• 67', orange: '78 ••• •• 30' },
  defaultId: 'cash',
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const snapshot = () => state;

export function usePayment(): PaymentState {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/** Les Espèces n'ont pas de numéro : elles sont configurées d'office. */
export const isConfigured = (id: MethodId, numbers: PaymentState['numbers']) =>
  id === 'cash' || !!numbers[id];

/** Moyens utilisables, dans l'ordre de la liste. */
export const configuredMethods = (numbers: PaymentState['numbers']) =>
  METHODS.filter((m) => isConfigured(m.id, numbers));

export function setNumber(id: MethodId, number: string) {
  state = { ...state, numbers: { ...state.numbers, [id]: number } };
  emit();
}

export function removeNumber(id: MethodId) {
  const numbers = { ...state.numbers, [id]: undefined };
  // Le défaut doit rester parmi les configurés : les Espèces sont le repli.
  const defaultId = state.defaultId === id ? 'cash' : state.defaultId;
  state = { numbers, defaultId };
  emit();
}

export function setDefault(id: MethodId) {
  if (id === state.defaultId || !isConfigured(id, state.numbers)) return;
  state = { ...state, defaultId: id };
  emit();
}
