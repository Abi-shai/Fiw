import { useSyncExternalStore } from 'react';
import { TRUSTED_CONTACTS } from '@/constants/data';

/** Contact de confiance : une personne que le Client autorise à suivre ses
 *  courses. `shareOnStart` par contact est un réglage à deux niveaux (D4 du
 *  benchmark) — le switch global de l'écran dit SI on partage, cette liste dit
 *  À QUI. */
export type TrustedContact = {
  id: string;
  name: string;
  phone: string;
  shareOnStart: boolean;
};

// L'état de sécurité vit hors de l'écran qui le règle : le hub Compte affiche
// « Partage activé · 2 contacts de confiance » en sous-titre de sa rangée, donc
// il doit voir la même chose que `compte/securite`. Même motif que
// `stores/payment` et `stores/places` — store de module + abonnement, rien à
// persister dans le proto.
let shareOnStart = true;
let contacts: TrustedContact[] = TRUSTED_CONTACTS.map((c) => ({ ...c }));

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

// `useSyncExternalStore` compare les snapshots par identité : il faut donc un
// objet stable, reconstruit seulement quand quelque chose change — sinon chaque
// rendu en crée un nouveau et la boucle ne s'arrête jamais.
let snap = { shareOnStart, contacts };
const snapshot = () => snap;
const commit = () => {
  snap = { shareOnStart, contacts };
  emit();
};

/** État de sécurité réactif : le switch de partage et les Contacts de confiance. */
export function useSafety() {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

export function setShareOnStart(next: boolean) {
  shareOnStart = next;
  commit();
}

export function removeContact(id: string) {
  contacts = contacts.filter((c) => c.id !== id);
  commit();
}

export function addContact(c: TrustedContact) {
  contacts = [...contacts, c];
  commit();
}

/** Le résumé que lit le hub Compte. Il dit l'ÉTAT de la protection plutôt que
 *  d'énumérer les contacts : il couvre les deux rubriques de l'écran au lieu
 *  d'une seule, garde les Contacts visibles depuis le compte (signal du bench),
 *  et répond à la seule question qu'on ne peut pas deviner de l'extérieur — le
 *  partage est-il en marche ?
 *  _(Tranché le 20 août 2026, question 4 de l'audit ; cf. benchmark-compte-mobbin.)_ */
export function safetySummary(s: { shareOnStart: boolean; contacts: TrustedContact[] }) {
  const partage = s.shareOnStart ? 'Partage activé' : 'Partage désactivé';
  const n = s.contacts.length;
  const qui = n === 0 ? 'aucun contact de confiance'
    : `${n} contact${n > 1 ? 's' : ''} de confiance`;
  return `${partage} · ${qui}`;
}
