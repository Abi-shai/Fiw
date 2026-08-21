# Illustrations — jeu `mobility option`

Le jeu Figma **`mobility option`** (composant `icons`,
[nœud `40:169`](https://www.figma.com/design/MsKt5tJdmMUWIDTRtPh6L1/Fiw?node-id=40-169))
fournit une illustration par type de véhicule. C'est le vocabulaire visuel
partagé par tout le produit — la carte gamme Transport, les méthodes de
livraison, les marqueurs prestataires sur la carte : **une illustration par
véhicule, quel que soit le service qui l'emploie** (la moto sert au Taxi Moto
comme à la Moto Livraison).

Chaque véhicule existe en **deux vues** (propriété `View` du composant), et
elles ne sont pas interchangeables :

| Vue | Emploi | Constantes |
| --- | --- | --- |
| `Default` (isométrique) | les **cartes** — carte gamme, vignette de suivi, bandeau de recherche. Elle vend le véhicule. | `GAMME_ILLUSTRATIONS`, `ILLO_SIZES` |
| `top view` (vue de dessus) | la **cartographie** — véhicule suivi et prestataires alentour, où le sprite est tourné selon son cap. Elle est neutre et se lit à n'importe quel angle. | `TOPVIEW_ILLUSTRATIONS`, `TOPVIEW_RATIOS` |

Ne jamais poser une vue de dessus sur une carte gamme, ni une vue isométrique
sur la carte : c'est le partage observé chez toutes les références du
[benchmark carte](../../docs/benchmark-carte-mobbin.md).

## ⚠️ Deux pièges à connaître avant de retoucher ce jeu

**1. Les variantes `moto` et `vélo` sont interverties dans Figma** (constaté le
14 août 2026, sur la vue `Default`). La variante nommée `mobility option=moto`
contient **le vélo**, et celle nommée `mobility option=vélo` contient **la
moto** ; leurs calques internes portent eux aussi le nom de l'autre. Les vues
`top view` sont, elles, correctement nommées. Un portage qui fait confiance au
nom de variante intervertit les deux véhicules dans toute l'app. Les tableaux
ci-dessous donnent le **bon** appariement. Tant que Figma n'est pas corrigé,
vérifier le dessin, pas l'étiquette.

**2. Les exports Figma de ces composants ne sont pas transparents.** Le rendu
d'un nœud incruste le fond de la page (`#E3E3E3`) — y compris quand on exporte
le rectangle porteur, et pas seulement la variante. Les assets **ne peuvent
donc pas** être produits par un simple export. La méthode qui marche : prendre
le **bitmap source** (transparent, ~1024 px), lui appliquer le cadrage du
composant (`imageTransform` du fill, `scaleMode: CROP` — la zone visible va de
`(tx, ty)` à `(tx + a, ty + d)` en coordonnées normalisées), puis la rotation
du nœud et de son parent, et enfin `trim-alpha.py`.

## Doctrine des deux vues : le pilote

Depuis le 14 août 2026, le pilote ne figure **que sur la vue de dessus**. Les
`Default` montrent le véhicule seul. La carte gamme vend une machine ; la carto
suit quelqu'un.

## Vue `Default` — tailles, le point à ne pas rater

Chaque variante occupe un emplacement de **68 × 68** dans le composant, mais
**aucune illustration ne tient dedans** : toute la famille fait **76 de haut**,
et les voitures **93 de large**. Le dessin déborde donc volontairement sa
plateforme colorée en haut, en bas et parfois sur les côtés — c'est ce qui donne
son expressivité à la carte. Les valeurs sont dans `ILLO_SIZES`
(`apps/fiw/constants/illustrations.ts`) et se lisent via `illoSize(illu, slot)`.

| Variante | Taille de rendu (emplacement 68) | Asset app | État Figma |
| --- | --- | --- | --- |
| `moto` | **106 × 87** | `gamme-moto.png` | **redessinée le 14 août 2026, sans pilote** — source [`198:750`](https://www.figma.com/design/MsKt5tJdmMUWIDTRtPh6L1/Fiw?node-id=198-750) ⚠️ variante **nommée `vélo`** dans Figma |
| `velo` | **78 × 76** | `gamme-velo.png` | **redessinée le 14 août 2026, sans pilote** — source [`55:63`](https://www.figma.com/design/MsKt5tJdmMUWIDTRtPh6L1/Fiw?node-id=55-63) ⚠️ variante **nommée `moto`** dans Figma |
| `auto` | 93 × 76 | `gamme-auto.png` | inchangée (isométrique à plat) |
| `covoiturage` | 93 × 76 | `gamme-covoit.png` | inchangée |
| `luxe` | 93 × 76 | `gamme-luxe.png` | variante masquée dans le jeu — asset conservé |

`serv-livraison.png` (scooter bleu) n'appartient pas à ce jeu : c'est
l'illustration de **tuile de service** de l'accueil.

## Vue `top view` — nez au nord

Les cinq véhicules ont reçu leur vue de dessus (2 août 2026). Elle remplace la
voiture noire isolée qui traînait dans le jeu sans emploi (`mobility option6`).

**Convention non négociable : dans l'asset, le véhicule pointe vers le haut
(nord).** La carte applique alors `rotate(cap)` sans correction — un asset
tourné d'un quart de tour ferait rouler toute une gamme en crabe.

| Variante | Taille Figma | Ratio l/L (asset) | Asset app | Master |
| --- | --- | --- | --- | --- |
| `moto` | 34 × 77 | **0,385** | `top-moto.png` | `mobility-moto-top@1024.png` |
| `velo` | 51 × 76 | **0,510** | `top-velo.png` | `mobility-velo-top@1024.png` |
| `auto` | 38 × 76 | 0,549 | `top-auto.png` | `mobility-auto-top@1024.png` |
| `luxe` | 38 × 76 | 0,497 | `top-luxe.png` | `mobility-luxe-top@1024.png` |
| `covoiturage` | 38 × 76 | 0,569 | `top-covoit.png` | `mobility-covoit-top@1024.png` |

Le ratio de l'asset dépasse un peu celui de Figma pour les voitures : le master
transparent embarque l'**ombre portée**, que le cadrage Figma rogne. On la garde
— sur une carte, elle pose le véhicule au sol. C'est pourquoi la carte
dimensionne le marqueur à partir de sa seule **longueur** (`TOPVIEW_RATIOS`
donne la largeur), et jamais d'un carré.

### Calibre sur la carte — les deux-roues sont plus GRANDS

Contre-intuitif mais mesuré : **aucune app du corpus ne dessine un deux-roues à
son échelle réelle** (cf. [benchmark](../../docs/benchmark-carte-mobbin.md) §5).
Vu du dessus, une moto ou un vélo est une silhouette longue, fine et ajourée :
à boîte égale elle « pèse » bien moins qu'une voiture, qui est un bloc plein.
Le critère de lisibilité est donc la **largeur apparente**, pas la longueur.

| Véhicule | Suivi (L) | Figurants (L) | Pivot | Inclinaison | Bande avant | Braquage |
| --- | --- | --- | --- | --- | --- | --- |
| `auto` · `luxe` · `covoiturage` | 48 | 34 | 0,68 | — | — | — |
| `moto` | 78 | 56 | 0,72 | 14 % | 24 % | 26° |
| `velo` | 46 | 32 | 0,75 | 16 % | 22 % | 28° |

Les longueurs des deux-roues ont été **recalculées le 14 août 2026** après le
redessin : elles conservent la largeur apparente validée sur le terrain (moto
30 px, vélo 23,6 px), puisque c'est elle le critère. Le nouveau ratio fait donc
rallonger la moto (60 → 78) et raccourcir le vélo (63 → 46) — ce dernier gagne
en envergure ce qu'il perd en longueur, le cycliste y écartant les bras. La
**bande avant est inchangée** : vérifiée au profil alpha sur les nouveaux
dessins, elle ne contient toujours que la roue, le guidon et les mains
n'arrivant qu'à ~30 % de la longueur.

Les longueurs diffèrent, les largeurs se rejoignent (24–30 px). Valeurs dans
`TOPVIEW_MARKER` (`apps/fiw/constants/illustrations.ts`). Ce calibre passe
**au-dessus du corpus** de façon assumée : les illustrations Fiw sont des rendus
3D détaillés qui demandent de la place, là où les références emploient des
pictogrammes plats. Plafond constaté à ×1,5 de ces valeurs — au-delà le sprite
déborde la chaussée.

`pivot` = point de rotation le long du sprite (0 = nez). Un véhicule braque
autour de son **train arrière** — pivoter au centre donne une toupie, défaut
d'autant plus visible que le sprite est long et fin. `lean` = resserrement de la
silhouette en virage, un deux-roues se penchant à l'intérieur du virage.

**`steerBand` = la fraction du sprite qui braque**, mesurée depuis le nez. Ces
illustrations étant des bitmaps aplatis (aucun calque à récupérer dans Figma),
la roue avant est détachée **au découpage** : le sprite est affiché deux fois,
l'un privé de cette bande, l'autre réduit à elle et pivotant sur la colonne de
direction. La valeur se cale sur le dessin, dans l'**interstice entre le
garde-boue et le guidon** — à revérifier à l'œil à chaque nouvelle illustration,
une bande mal placée coupant le pilote en deux. `maxSteer` borne l'angle : au-delà,
l'arête droite de la découpe finit par se voir.

**Ajouter un véhicule au jeu impose de renseigner ces six valeurs** : les
défauts sont ceux d'une voiture (pas de découpage, pas d'inclinaison) et
rendront tout deux-roues trop petit, raide et tournant d'un bloc.

Les masters de ces cinq vues sont **couchés** (véhicule nez à l'est), sauf le
vélo (nez au sud) : la rotation fait partie de la régénération, cf. ci-dessous.

## Régénérer un asset

Les exports Figma du composant arrivent avec le **fond gris du frame**, opaque :
inutilisables tels quels sur une plateforme colorée. On repart donc de l'image
source transparente (onglet `rawImages` de `download_assets`, ou le master
ci-contre) et on la recadre sur sa boîte alpha — le cadrage obtenu retombe sur
les proportions Figma à moins de 1 %.

```sh
python3 trim-alpha.py mobility-moto@1024.png /tmp/moto-trim.png
sips -Z 304 /tmp/moto-trim.png --out ../../apps/fiw/assets/gamme-moto.png
```

`-Z 304` = 4 × la hauteur de rendu (76), sans déformer le rapport d'aspect.

Pour une **vue de dessus**, une rotation s'intercale : les masters sont couchés,
nez à l'est (nez au sud pour le vélo), alors que l'asset doit pointer au nord.

```sh
python3 trim-alpha.py mobility-auto-top@1024.png /tmp/auto-trim.png
sips -r -90 /tmp/auto-trim.png --out /tmp/auto-rot.png   # vélo : -r 180
sips -Z 304 /tmp/auto-rot.png --out ../../apps/fiw/assets/top-auto.png
```

Vérifier ensuite le sens du dessin contre le rendu Figma de la variante (les
phares doivent finir en haut) et reporter le ratio obtenu dans
`TOPVIEW_RATIOS`. Les masters pleine résolution des vues de dessus et des deux
illustrations 3D sont ici (`mobility-*@1024.png`) ; les trois anciennes vues
isométriques n'ont jamais été versionnées au-delà de leur dérivé app.
