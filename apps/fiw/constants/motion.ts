import { Easing } from 'react-native';

/**
 * Identité de mouvement Fiw — miroir de la planche **`motion-identity-system`**
 * (`842:2727`, page `03 — Patterns`). La maquette fait autorité ; ce fichier en
 * est la traduction, et `docs/style-guide.md` § Motion en porte le pourquoi.
 *
 * ⚠️ **Les durées sont des FENÊTRES, pas des durées d'animation.** La planche les
 * écrit ainsi : « Container morph · 50–500 ms » veut dire *elle commence à 50 et
 * elle est finie à 500* — donc 450 ms d'animation après un maintien de 50. C'est
 * la même sémantique que la timeline Figma Motion dont l'identité est tirée.
 * D'où `Motion.window(fin, début)`, qui convertit une fenêtre en couple
 * `{ delay, dur }` : personne n'a à refaire la soustraction de tête.
 */
export const Motion = {
  /**
   * Trois courbes, et trois seulement.
   *
   * Il n'y a **pas** de quatrième courbe à ajouter au coup par coup : la planche
   * en pose trois et la discipline du système tient à ce nombre. Un mouvement qui
   * ne rentre dans aucune des trois est un mouvement à requalifier, pas une
   * courbe à inventer.
   */
  easing: {
    /**
     * `cubic-bezier(0.4, 0, 0.2, 1)` — **Primary Ease**, « Standard ».
     * Décélération assurée : départ vif et nerveux, large coussin à l'arrivée.
     * **Recommandée pour plus de 80 % des actions d'interface** — c'est le défaut,
     * et s'en écarter demande une raison.
     */
    primary: Easing.bezier(0.4, 0, 0.2, 1),
    /**
     * `cubic-bezier(0.5, 0, 0.5, 1)` — **Hold / Anchor**, « Symmetric ».
     * Changements de vélocité neutres, sans biais d'entrée. Pour les glissements
     * de fond, les boucles utilitaires et les états temporaires — et pour les
     * feuilles modales, dont elle tient les bords fermes.
     */
    hold: Easing.bezier(0.5, 0, 0.5, 1),
  },

  /**
   * **Spring Gentle** — `spring(bounce: 0.25, mass: 1)`, « Elastic ».
   * Dépassement organique et stabilisation rapide.
   *
   * ⚠️ **Réservé aux composants héros et aux moments interactifs de signature.**
   * Ne pas saturer les pages de rebonds : ce sont les courbes qui tiennent la
   * discipline du système, le ressort est une exception qui se mérite.
   *
   * Conversion vers `Animated.spring` de RN, qui parle raideur/amortissement :
   * le `bounce` de la planche est un taux d'amortissement déguisé —
   * `ζ = 1 − bounce = 0,75` — d'où `damping = 2 ζ √(k·m) ≈ 25` pour `k = 280`.
   * La **raideur n'est pas dans la planche** : 280 est reprise de la valeur que le
   * produit portait déjà (`SHEET_SPRING`), pour que seul le rebond change et pas
   * la vitesse ressentie. C'est une dérivation, pas un relevé — signalée comme
   * telle.
   */
  spring: { gentle: { stiffness: 280, damping: 25, mass: 1 } },

  /**
   * Constantes de temps, en **fenêtres** (cf. l'avertissement en tête).
   * Ce sont les six seules ; une durée hors de cette liste est une décision de
   * design system, pas un réglage d'écran.
   */
  duration: {
    /** `anticipation-hold` — micro-attente avant un changement de structure. */
    anticipationHold: 50,
    /** `decoration-exit` — départ d'un élément secondaire, rognage visuel. */
    decorationExit: 200,
    /**
     * `container-exit` — un conteneur qu'on **renvoie** : modale qui se ferme,
     * tiroir qui se referme, feuille qui se retire.
     *
     * Même valeur que `decoration-exit`, rôle différent — et ce n'est pas un
     * doublon à fusionner. Le principe *Asymmetric Timing* le dit mot pour mot :
     * « clean up and clear space **instantly** when dismissed to maintain high
     * perceived application speed ». Une modale renvoyée est le cas canonique de
     * *dismissed* : elle n'attend aucun contenu, elle part la première, donc elle
     * prend le bas de la bande de sortie (200–350).
     *
     * ⚠️ Ne pas le confondre avec le dégradé `decoration 200 → text 250–300 →
     * support 350`, qui décrit une sortie **échelonnée dans une composition** —
     * là, le conteneur part en dernier parce qu'il attend que son contenu ait
     * dégagé. Renvoi en bloc et sortie échelonnée sont deux événements, pas un.
     *
     * _(Ajouté le 27 août 2026 : la planche n'avait pas de jeton de sortie de
     * conteneur, et `BottomSheet` empruntait `support-exit` faute de mieux.)_
     */
    containerExit: 200,
    /** `text-exit`, bas de bande — le **fondu** d'un bloc de texte. */
    textExitFade: 250,
    /** `text-exit`, haut de bande — son **déplacement**. Le texte a fini de
     *  disparaître avant d'avoir fini de glisser ; c'est ce que la bande 250–300
     *  de la planche encode. */
    textExitShift: 300,
    /** `support-exit` — une mise en page principale qui **cède la place**. */
    supportExit: 350,
    /** `container-morph` — un grand bloc qui se reforme au changement de vue. */
    containerMorph: 500,
    /** `hero-reveal` — une séquence de contenu complexe qui se déploie. */
    heroReveal: 600,
  },

  /** Décalage entre deux groupes d'un dévoilement échelonné (« staggered in 40ms
   *  groups ») : décorations d'abord, texte ensuite, métadonnées de support en
   *  dernier. */
  stagger: 40,

  /**
   * Fenêtre de la planche → couple `{ delay, dur }` d'`Animated`.
   * `Motion.window(500, 50)` = « de 50 à 500 » = `{ delay: 50, dur: 450 }`.
   */
  window: (end: number, delay = 0) => ({ delay, dur: end - delay }),
} as const;
