# Fiw — Instructions projet

Fiw est une application mobile multi-services de mobilité urbaine et de livraison, basée à Dakar, Sénégal. Deux applications : **Fiw** (côté client) et **Fiw Pro** (côté prestataire). Principal concurrent : Yango.

## Lectures obligatoires en début de session

1. **`MEMORY.md`** — carte des documents et état actuel du travail de concepton. Lire en premier pour savoir ce qui existe et ce qui est encore ouvert avant de commencer quoi que ce soit.
2. **`CONTEXT.md`** — vocabulaire canonique du domaine. Chaque terme utilisé dans ce projet (Client, Prestataire, Commande, Wallet, Frais de rapprochement, etc.) y est défini avec ses variantes à éviter.

## Règle vocabulaire

Toujours utiliser les termes canoniques de `CONTEXT.md`. Ne jamais utiliser les variantes marquées _Avoid_ — ni dans les questions, ni dans les suggestions, ni dans les brouillons de documents. En cas de doute sur un terme, consulter `CONTEXT.md` avant de l'utiliser.

## Règle design system — à lire AVANT toute écriture d'interface

**Avant de modifier ou d'ajouter le moindre élément d'interface dans le prototype, relire le design system en entier.** Pas la partie qu'on croit concernée : l'ensemble. Cela vaut pour un nouvel écran comme pour un changement d'une seule ligne de style.

Le design system, ce sont ces cinq sources — et elles font toutes foi :

1. **`docs/style-guide.md`** — tokens, échelles, composants, et les **règles écrites avec leur pourquoi** (répartition bleu/jaune, formulaires, cartes vs rangées à plat…). C'est le document de référence.
2. **`apps/fiw/constants/`** — `colors.ts`, `radii.ts`, `spacing.ts`, `typography.ts`, `shadows.ts`. Les commentaires y portent des règles que le style guide ne répète pas toujours.
3. **`apps/fiw/components/`** — ce qui existe déjà. Un composant, une variante ou un motif existe presque toujours ; le devoir est de le trouver avant d'en écrire un autre.
4. **`docs/benchmark-*.md`** — les décisions UI tranchées (Dx) et leurs amendements datés.
5. Les **commentaires du code voisin**, qui expliquent pourquoi un écran est fait ainsi.

En pratique :

- **Ne jamais inventer une valeur.** Aucun hex en dur, aucun rayon, espacement, graisse ou ombre choisi à la main. Si la valeur juste n'existe pas dans les tokens, c'est une décision de design system — la poser à l'utilisatrice, pas la bricoler dans un écran.
- **Vérifier le rôle d'un token avant de l'employer**, pas seulement sa valeur. Deux gris peuvent être proches et ne pas vouloir dire la même chose (`bg` = le fond en retrait ; `surfaceAlt` = un regroupement discret dans une feuille dense).
- **Chercher le composant existant** avant d'écrire un bloc de styles. Et avant d'ajouter un prop à un composant partagé, se demander si ce n'est pas un composant distinct qui manque.
- **Un écart au design system se signale.** S'il est nécessaire, le dire explicitement à l'utilisatrice avec sa raison. Jamais en silence.
- **Un choix qui se généralise devient une règle écrite** dans `docs/style-guide.md`, **avec le pourquoi**, pas seulement le quoi. Et quand une règle nouvelle contredit un document existant, l'**amender de façon datée** plutôt que de le réécrire en douce.

_Cette règle est née de vraies erreurs commises faute d'avoir relu : des champs au repos peints en bleu alors que le bleu marque un état ; un rayon `lg` sur des champs de saisie alors que le style guide impose `md` ; un composant enrichi d'un prop là où la règle était de ne pas en avoir. Chaque fois, l'information était écrite quelque part et n'avait pas été lue._
