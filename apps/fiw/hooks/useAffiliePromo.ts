import { useSyncExternalStore } from 'react';

/**
 * La **sourdine croissante** de la bannière Affiliation de l'accueil.
 *
 * Fermer la bannière ne la supprime pas, ça la met en SOURDINE : elle revient
 * après un nombre **croissant** de Commandes terminées depuis le dernier refus
 * — 5, puis 10, puis 15, puis 20… **sans plafond et sans jamais s'éteindre**.
 *
 * ── Pourquoi cette forme ───────────────────────────────────────────────────
 * Le critère est venu d'une usagère régulière de Yango : **ce qui agace, c'est
 * la répétition à cadence constante, pas la première demande**. Un seuil fixe
 * redemande aussi tard la première fois que la dixième et n'écoute jamais un
 * refus répété ; une escalade qui double s'éteint en pratique. Le pas régulier
 * recule proportionnellement sans jamais rayer personne, et il s'ajuste à
 * chaque Client par son propre comportement — ce qui compte parce qu'on n'a
 * aucune donnée d'usage.
 *
 * Concrètement, un Client qui la ferme systématiquement la revoit à 5, 15, 30,
 * 50, 75 puis 105 Commandes : six fois sur ses 75 premières courses, soit
 * ~15 mois pour un Client quotidien et ~3 ans pour un Client bimensuel.
 *
 * ── Les trois règles de comptage ───────────────────────────────────────────
 * · Une Commande **annulée ne compte pas** — sinon fermer puis annuler trois
 *   fois ferait revenir la bannière sans que le Client ait rien vécu. D'où le
 *   point d'appel : l'écran de **clôture**, qu'on n'atteint qu'une Commande
 *   faite.
 * · Les **livraisons comptent** comme les courses : « Commande » couvre tous
 *   les services. Les deux écrans de clôture appellent donc le même compteur.
 * · Le **premier refus ne compte qu'à partir de la première Commande
 *   terminée**. À l'ouverture initiale, fermer c'est **ranger**, pas refuser —
 *   sinon le geste le moins éclairé achèterait le plus de silence.
 *
 * ⚠️ **Rien n'est persisté** : le proto n'a pas de couche de stockage et
 * l'état vit le temps du lancement. La règle, elle, est entière ici — c'est la
 * seule chose qui manque pour la porter en production.
 *
 * _(Règle décidée le 6 septembre 2026 pour la bannière du Menu ; celle-ci a été
 * supprimée le 14 septembre, la règle a suivi la bannière de l'accueil — la
 * seule qui intercepte vraiment. Implémentée le 27 septembre 2026.)_
 */

/** Le pas de l'escalade : n-ième refus ⇒ PAS × n Commandes avant le retour. */
const PAS = 5;

let commandesTerminees = 0;
let refus = 0;
let commandesAuDernierRefus = 0;
/** Fermée avant toute Commande : rangée, pas refusée. Ne s'achète aucun délai. */
let rangee = false;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => { listeners.delete(l); };
};

const estVisible = (): boolean => {
  if (rangee) return commandesTerminees > 0;
  if (refus === 0) return true;
  return commandesTerminees - commandesAuDernierRefus >= PAS * refus;
};

/** La bannière doit-elle s'afficher ? S'abonne aux Commandes et aux refus. */
export const useAffiliePromoVisible = () =>
  useSyncExternalStore(subscribe, estVisible, estVisible);

/** Le Client a fermé la bannière. */
export const fermerAffiliePromo = () => {
  if (commandesTerminees === 0) {
    // Ranger, pas refuser : le compteur de refus ne bouge pas.
    rangee = true;
  } else {
    refus += 1;
    commandesAuDernierRefus = commandesTerminees;
    rangee = false;
  }
  emit();
};

/** Une Commande vient d'être menée à son terme — course OU livraison. */
export const enregistrerCommandeTerminee = () => {
  commandesTerminees += 1;
  if (rangee) rangee = false;
  emit();
};

/** Remet le compteur à zéro. Réservé aux facilitateurs de démo. */
export const reinitialiserAffiliePromo = () => {
  commandesTerminees = 0;
  refus = 0;
  commandesAuDernierRefus = 0;
  rangee = false;
  emit();
};
