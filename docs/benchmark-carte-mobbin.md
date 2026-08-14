# Benchmark Mobbin — Carte & suivi du véhicule (Fiw Client)

> Passe UX/UI menée le 3 août 2026 avant la reprise du moteur de carte
> (`apps/fiw/components/LeafletMap.tsx`). Objectif : **rendre la carte
> immersive autour du trajet** — le véhicule doit rouler *dans* la rue et
> pivoter quand il la quitte, au lieu de glisser en diagonale au-dessus du
> plan. Déclencheur côté design : le jeu `mobility option` a reçu une seconde
> vue de chaque véhicule, **vue de dessus** (Figma `icons`, nœud
> [`40:169`](https://www.figma.com/design/MsKt5tJdmMUWIDTRtPh6L1/Fiw?node-id=40-169)),
> qui n'avait encore aucun emploi dans le produit.

## Apps étudiées

| App | Écrans | Ce qu'on en retient |
|---|---|---|
| **inDrive** | [Course en cours](https://mobbin.com/flows/1840b32e-0d95-4237-9c7d-21bc5fe2a8ab) | **Référence n°1** — sprite de voiture vu du dessus, **tourné selon le cap de la rue**, posé sur la chaussée ; tracé plein d'une seule couleur ; départ = point bleu, arrivée = anneau. Le véhicule est le seul objet expressif de la carte. |
| **Grab** | [Course en cours](https://mobbin.com/flows/3fc0cd8d-c3ce-4278-9aa8-382ed973c14d) · [Course en cours (bis)](https://mobbin.com/flows/bc01aef8-1b35-4688-a36b-4e523925b67f) | Tracé **ceinturé de blanc** (lisible sur voirie claire) + **segments colorés selon le trafic** ; caméra rapprochée qui suit le véhicule ; le tracé déjà parcouru s'efface derrière lui. |
| **Gojek** | [Trajet en cours](https://mobbin.com/flows/370f586b-d22b-4a92-8b3a-a0d2630d6418) | Sprite vu du dessus aux couleurs de la marque, orienté rue ; **bulle accrochée au véhicule** (« Completing a trip nearby ») ; cadrage large au départ puis resserrement. |
| **Uber** | [Options en cours de chargement](https://mobbin.com/screens/77fe8b1a-541e-40e7-b747-f96d570582e5) | Prestataires alentour = **petites voitures vues du dessus, chacune alignée sur sa rue**, jamais en diagonale sur un pâté de maisons. Calibre discret. |
| **Careem** | [Accueil carte](https://mobbin.com/screens/2f12cfa5-c271-48f7-bb2b-28bbae93e24f) | Même grammaire : voitures blanches vues du dessus, orientées rue, autour du point client. |
| **Grab (avant course)** | [Recherche de course](https://mobbin.com/screens/5ec95514-d1a0-4e3b-9d44-36daaf3f4ee9) | Les véhicules disponibles se **groupent autour du point de départ**, tous orientés selon la voirie. |
| **Freenow** | [Choix de gamme](https://mobbin.com/screens/df14d051-8cad-498f-80ed-d5a301ac2793) | Taxis vus du dessus alignés sur la rue, y compris à zoom large. |
| **GCOO** | [Carte véhicules](https://mobbin.com/screens/fb4c0bcb-8d22-4012-ba32-af3a50b1cb4e) | Contre-exemple utile : marqueurs en **pastilles rondes** (deux-roues en libre-service) — pertinent pour des véhicules *à l'arrêt*, pas pour des véhicules *en mouvement*. |

### Corpus deux-roues (passe complémentaire)

Ajoutée après un premier réglage où **moto et vélo étaient trop petits**. Le
corpus voiture ne dit rien du calibre d'un deux-roues : il fallait le sien.

| App | Écran | Traitement du deux-roues |
|---|---|---|
| **Zomato** | [Commande en route](https://mobbin.com/screens/6be6e48e-f2c3-4656-8a41-f32ec734a9ee) | **Sprite libre, généreux** — scooter rouge **mesuré à 26 × 39 pt** (cf. méthode plus bas) |
| **Meituan Takeaway** | [Livraison en cours](https://mobbin.com/screens/68f7cd0c-666c-4d3e-831c-c08125456b25) | Sprite libre, le plus gros du corpus (~48 pt) |
| **Keeta** | [Coursier en approche](https://mobbin.com/screens/da2106a1-d3ed-4538-8b88-501f792df2b2) | Sprite libre, gabarit large |
| **Glovo** | [Commande presque arrivée](https://mobbin.com/screens/ee36f4de-9465-4cb9-9dc5-7cc78c99ea46) | **Pastille** : le vélo est enfermé dans un marqueur qui lui garantit un plancher |
| **foodpanda** | [Livraison](https://mobbin.com/screens/b5af899c-f90f-4d4f-8222-1630153eed60) | Pastille ronde |
| **Bolt Food** | [Coursier arrivé](https://mobbin.com/screens/3e5a9d5b-a313-43e4-afd1-8e7d16e9d405) | Pastille ronde |
| **Blinkit** | [En route](https://mobbin.com/screens/d1f26546-6cc2-4f58-b558-9c85ac48fd52) | Pastille ronde |
| **Swiggy** | [Out for delivery](https://mobbin.com/screens/54cc67b7-2b0b-4ef5-a396-caba7218eaa3) | Sprite encadré |

**Limites du corpus** : ni **Yango** (concurrent direct) ni **Heetch** ne sont
indexés sur Mobbin. inDrive reste le meilleur proxy « marché émergent ».

## Enseignements

### 1. Le véhicule vu du dessus, tourné selon son cap — c'est la norme, pas une option

Les huit références affichent la même chose : un **sprite vu du dessus**,
**pivoté selon la direction de la rue**. Aucune n'emploie d'icône vue de
trois-quarts ni d'illustration isométrique sur la carte. Deux points de vue
cohabitent donc dans ces produits, avec un partage net :

- **vue isométrique / trois-quarts** → les **cartes** (choix de gamme, vignette
  de suivi, bandeau) : elle vend le véhicule, elle est expressive ;
- **vue de dessus** → la **carto** : elle est neutre, elle se lit à n'importe
  quel angle, elle *est* le point de vue de la carte.

C'est exactement la coupure que le jeu Figma `mobility option` propose depuis
qu'il porte une variante `View=top view` par véhicule.

### 2. Le mouvement se lit à la rotation, pas à la translation

Un point qui glisse le long d'une polyligne ne se lit pas comme un véhicule.
Ce qui donne l'illusion, dans les références, c'est que **le sprite braque** :
il tourne progressivement à l'approche d'un virage et se réaligne après. Trois
conséquences pour l'implémentation :

- le cap vient de la **tangente au tracé regardée un peu en avant** (viser le
  sommet suivant fait trembler le sprite sur les tracés denses) ;
- il est **lissé** et **borné en vitesse angulaire** — un véhicule qui pivote
  instantanément de 90° casse l'illusion aussi sûrement qu'un véhicule qui ne
  pivote pas ;
- l'avance se fait **en mètres**, pas « un sommet par image » : sinon le
  véhicule accélère dans les virages, là où les sommets sont serrés.

### 3. La caméra raconte d'abord, suit ensuite

Grab et Gojek ouvrent sur le **trajet entier** (on comprend d'où vient le
prestataire), puis se rapprochent et **suivent** le véhicule. Le recentrage
n'est pas continu — il se déclenche quand le véhicule approche du bord du cadre
visible, avec une transition douce. Le cadre « visible » est celui **au-dessus
de la feuille**, pas le viewport entier.

### 4. Le tracé se lit en deux temps

Grab distingue **parcouru** et **restant** : la portion derrière le véhicule
s'atténue. La progression devient lisible sans chiffre. Grab et Gojek posent en
plus un **liseré blanc** sous le tracé, qui le détache de la voirie claire.
La coloration par trafic (Grab) suppose une donnée temps réel que Fiw n'a pas —
**hors périmètre**.

### 5. Un deux-roues n'est jamais dessiné à son échelle réelle

C'est le constat le plus net du corpus deux-roues, et il est contre-intuitif :
**aucune app ne rend un deux-roues plus petit qu'une voiture**, alors qu'une
moto fait la moitié d'une voiture et un vélo un tiers. Deux stratégies, jamais
une troisième :

- **la pastille** (Glovo, foodpanda, Bolt Food, Blinkit) — le véhicule est
  enfermé dans un marqueur qui lui impose un gabarit plancher ;
- **le sprite grossi** (Zomato, Meituan, Keeta, Swiggy) — la fidélité d'échelle
  est rompue franchement.

La raison est ergonomique : un deux-roues vu du dessus est une **silhouette
longue et fine, très ajourée**. À surface de boîte égale, il « pèse » beaucoup
moins qu'une voiture, qui est un bloc plein. Le critère qui gouverne la
lisibilité n'est donc pas la longueur mais la **largeur apparente**.

Mesure de référence, faite sur la capture Zomato (segmentation des pixels rouges
saturés de la zone carte, ramenée à un écran de 390 pt) :

| Marqueur | Largeur | Longueur |
|---|---|---|
| Scooter Zomato | **26 pt** | 39 pt |
| Voiture inDrive / Grab | ~16 pt | ~29 pt |

Le deux-roues est donc **plus large** que la voiture, et 1,3× plus long. Fiw
n'ayant pas de pastille (elle masquerait l'illustration, qui est un actif de
marque), c'est le sprite qui doit porter ce gabarit plancher.

### 6. Le virage se joue sur trois détails, et ils comptent surtout pour les deux-roues

Un premier réglage donnait des deux-roues qui « tournaient faux ». Trois causes,
cumulatives, toutes amplifiées par une silhouette longue et fine :

1. **Le point de rotation.** Un véhicule braque autour de son **train arrière** —
   c'est le nez qui balaie vers l'extérieur du virage. Pivoter autour du centre
   donne une toupie : le nez et la queue partent en sens inverse. Sur une
   voiture (bloc court) ça passe presque ; sur un vélo long de 50 px, non.
2. **La distance de visée.** Viser une distance *fixe* devant le véhicule ne
   marche pas quand la simulation compresse 20 min de course en 54 s : à cette
   allure, 14 m représentent 0,15 s — le virage arrive sans prévenir et le
   sprite pivote d'un bloc. La visée doit être une **durée** de parcours
   (~0,55 s), pas une distance.
3. **L'inclinaison.** Un deux-roues se penche à l'intérieur du virage ; vu du
   dessus, sa silhouette **se resserre en largeur**. Une voiture, non. Sans ce
   détail, le deux-roues garde une raideur de pion qui se remarque en virage.
4. **La roue qui braque.** Une fois les trois premiers points réglés, il reste
   que le deux-roues **tourne d'un bloc** : sa roue avant reste alignée sur le
   cadre, ce qu'aucun deux-roues ne fait. C'est le dernier écart au réel, et le
   plus lisible une fois qu'on l'a vu.

   Les illustrations Figma étant des **bitmaps aplatis** (vérifié : chaque
   variante `top view` est un unique rectangle à remplissage image, sans
   calque), la roue est détachée **au découpage** : le sprite est dessiné deux
   fois, l'un privé de sa bande avant, l'autre réduit à elle et pivotant sur la
   colonne de direction. Aucun asset supplémentaire, et la couture est invisible
   puisque les deux calques sont le même dessin découpé de façon
   complémentaire.

   Point de méthode : le braquage doit être commandé par la **courbure de la
   route** — une grandeur géométrique — et non par l'écart de cap instantané.
   L'écart de cap paraît naturel mais s'effondre dès que la simulation
   accélère : à l'allure de démo (20 min compressées en 54 s) le cap rattrape sa
   cible en une image, l'écart reste minuscule et la roue ne bouge plus. La
   courbure, elle, ne dépend pas de la vitesse : un virage serré se prend guidon
   braqué qu'on le passe au pas ou vite. Profil obtenu, mesuré image par image :
   la roue s'engage pendant que le cap n'a pas encore bougé (+4° puis +20° pour
   3° de cap), tient le braquage toute la courbe, et se redresse en sortie.

### 7. Les prestataires alentour sont sur la chaussée

Chez Uber, Careem, Grab et Freenow, les véhicules disponibles ne sont jamais
posés au hasard : ils sont **sur une rue et alignés avec elle**. Une dérive
libre en diagonale, à travers les îlots, se voit immédiatement et fait « écran
de veille ».

## Décisions retenues pour Fiw

| # | Décision | Motif |
|---|---|---|
| D1 | **Vue de dessus sur la carte, vue isométrique sur les cartes** — deux emplois disjoints du même jeu `mobility option` | Grammaire commune aux 8 références ; le jeu Figma est déjà construit ainsi |
| D2 | **Le sprite pivote selon le cap**, avec lissage et vitesse de braquage bornée | C'est la rotation qui fait lire le mouvement (§2) |
| D3 | **Avance à vitesse sol constante** (abscisse curviligne), pas par sommets | Évite l'accélération parasite dans les virages |
| D4 | **Cadrage d'ensemble puis suivi rapproché**, recentrage seulement en bord de cadre | Grab, Gojek (§3) |
| D5 | **Tracé parcouru atténué** + liseré blanc | Grab (§4) — progression lisible sans chiffre |
| D6 | **Les prestataires alentour roulent sur la voirie réelle** de la carte | Uber, Careem, Grab, Freenow (§7) |
| D10 | **Deux-roues volontairement plus grands que les voitures** — calibrés à largeur apparente comparable (~19–24 px), pas à longueur égale | §5 — aucune app du corpus ne respecte l'échelle réelle ; Fiw n'a pas de pastille, le sprite porte donc seul le gabarit plancher |
| D11 | **Rotation autour du train arrière**, pas du centre | §6.1 |
| D12 | **Inclinaison simulée en virage pour les deux-roues** (resserrement de la silhouette), nulle sur les voitures | §6.3 |
| D14 | **Train avant articulé sur les deux-roues** — roue détachée au découpage du bitmap, braquage commandé par la **courbure** de la route | §6.4 — aucun asset en plus, 60 fps tenus avec 6 véhicules ; sans objet sur les voitures, dont les roues sont invisibles de dessus |
| D13 | **Pastille / conteneur de marqueur** — **écartée** | Masquerait l'illustration `mobility option`, qui est un actif de marque. Le gabarit plancher est obtenu par la taille du sprite (D10). |
| D7 | **Une seule carte pour toute la course** : les étapes changent trajet et marqueurs sur place | Aucune référence ne recharge sa carte entre deux étapes ; le véhicule y garde position et cap |
| D8 | Coloration du tracé **par trafic** — **écartée** | Donnée temps réel absente du périmètre Fiw |
| D9 | Bulle d'information **accrochée au véhicule** (Gojek) — **différée** | La feuille porte déjà l'ETA ; à reconsidérer si la carte doit parler seule |

## Calibre retenu

Mesuré sur les captures du corpus (rendu ramené à ~390 pt de large). Le corpus
donne **≈ 29–31 pt** pour une voiture suivie et **≈ 39–48 pt** pour un deux-roues
suivi ; les figurants tournent autour de **22–28 pt**.

| Véhicule | Suivi (L × l) | Figurants (L) | Pivot | Inclinaison | Bande avant | Braquage max |
|---|---|---|---|---|---|---|
| `auto` · `luxe` · `covoiturage` | 48 × 26 | 34 | 0,68 | — | — | — |
| `moto` | 60 × 30 | 43 | 0,72 | 14 % | 24 % | 26° |
| `velo` | 63 × 24 | 44 | 0,75 | 16 % | 22 % | 28° |

La **bande avant** est la fraction du sprite, depuis le nez, qui braque. Elle est
calée sur le dessin — à l'interstice entre le garde-boue et le guidon — donc à
revérifier à chaque nouvelle illustration.

Les longueurs diffèrent, les **largeurs se rejoignent** (24–30 px) : c'est le
critère qui gouverne (§5). Valeurs dans `TOPVIEW_MARKER`
(`apps/fiw/constants/illustrations.ts`).

**Fiw se place au-dessus du corpus, délibérément.** Le premier réglage collait
aux valeurs mesurées (38 / 48 / 50) et a été jugé trop timide sur rendu ; le
calibre a été relevé d'un quart après comparaison de trois gabarits en
conditions réelles (3 août 2026). Deux raisons assumées : les illustrations Fiw
sont des **rendus 3D détaillés**, pas des pictogrammes plats — le détail exige
de la place — et elles **portent la marque** sur la carte, là où le corpus
emploie des icônes neutres. Le plafond utile a été constaté à **×1,5 de ces
valeurs** : au-delà, le sprite déborde la chaussée et la ville se lit comme une
maquette. C'est la borne à ne pas franchir, pas une cible.

Deux garde-fous :

- au-delà de ces valeurs, le véhicule couvre deux pâtés de maisons et la ville
  devient un jouet — c'était le défaut du premier réglage voiture (46 px) ;
- les marqueurs étant en pixels écran, leur taille est **modulée par le zoom**
  (bornée) pour ne pas écraser la carto au cadrage large.

**Ergonomie, précision** : ces marqueurs ne sont pas tappables
(`pointer-events: none`) — le calibre est ici un critère de **lisibilité**, pas
de cible tactile. Si un marqueur devenait interactif, la règle des 44 pt
s'appliquerait et imposerait une zone de touche plus large que le sprite.

## Méthode de mesure

Les tailles du corpus sont mesurées, pas estimées à l'œil : les captures Mobbin
font 299 px de large pour un écran de 390 pt (facteur 1,30). Pour Zomato, le
scooter est isolé par segmentation des pixels rouges saturés (`R>140, G<80,
B<80`) restreinte à la zone carte, puis on prend la boîte englobante. Reproduire
la mesure pour un autre marqueur demande seulement de changer le prédicat
couleur et la bande verticale.
