# Illustrations — jeu `mobility option`

Le jeu Figma **`mobility option`** (composant `icons`,
[nœud `40:169`](https://www.figma.com/design/MsKt5tJdmMUWIDTRtPh6L1/Fiw?node-id=40-169))
fournit une illustration par type de véhicule. C'est le vocabulaire visuel
partagé par tout le produit — la carte gamme Transport, les méthodes de
livraison, les marqueurs prestataires sur la carte : **une illustration par
véhicule, quel que soit le service qui l'emploie** (la moto sert au Taxi Moto
comme à la Moto Livraison).

## Tailles — le point à ne pas rater

Chaque variante occupe un emplacement de **68 × 68** dans le composant, mais
**aucune illustration ne tient dedans** : toute la famille fait **76 de haut**,
et les voitures **93 de large**. Le dessin déborde donc volontairement sa
plateforme colorée en haut, en bas et parfois sur les côtés — c'est ce qui donne
son expressivité à la carte. Les valeurs sont dans `ILLO_SIZES`
(`apps/fiw/constants/illustrations.ts`) et se lisent via `illoSize(illu, slot)`.

| Variante | Taille de rendu (emplacement 68) | Asset app | État Figma |
| --- | --- | --- | --- |
| `moto` | 59 × 76 | `gamme-moto.png` | **nouveau rendu 3D** ([`55:63`](https://www.figma.com/design/MsKt5tJdmMUWIDTRtPh6L1/Fiw?node-id=199-886)) |
| `velo` | 47 × 76 | `gamme-velo.png` | **nouveau rendu 3D** ([`198:750`](https://www.figma.com/design/MsKt5tJdmMUWIDTRtPh6L1/Fiw?node-id=198-750)) |
| `auto` | 93 × 76 | `gamme-auto.png` | inchangée (isométrique à plat) |
| `covoiturage` | 93 × 76 | `gamme-covoit.png` | inchangée |
| `luxe` | 93 × 76 | `gamme-luxe.png` | variante masquée dans le jeu — asset conservé |

`serv-livraison.png` (scooter bleu) n'appartient pas à ce jeu : c'est
l'illustration de **tuile de service** de l'accueil.

**Variante non affectée** : le jeu contient un 6ᵉ élément sans nom
(`mobility option6`, nœud `198:826`) — une voiture noire **vue de dessus**, donc
probablement un marqueur de carte plutôt qu'une illustration de carte gamme.
Rien ne lui est mappé côté code tant que son intention n'est pas confirmée.

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
Les masters pleine résolution des deux nouvelles illustrations sont ici
(`mobility-*@1024.png`) ; les trois anciennes n'ont jamais été versionnées
au-delà de leur dérivé app.
