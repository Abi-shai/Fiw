# ADR 0009 — Le Repère : une ligne libre, portée par un point de Commande, lue par le Prestataire

**Date :** 2026-08-09
**Statut :** Décidé

## Contexte

À Dakar, on ne s'oriente pas par noms de rues. Il existe bien des **codes
d'adresse** — quartier abrégé + numéro de parcelle, du type `GY 182`, `AAB 07` —
que Yango et inDrive savent déjà résoudre pour y placer une commande, et que Fiw
doit savoir résoudre aussi (cf. `feature-list.md`, section « Recherche
d'adresse »). Mais un code résout une **parcelle**, pas une porte : il ne dit ni
de quel côté est l'entrée, ni à quoi elle ressemble, ni qu'il faut appeler en
arrivant. Au-delà du code, les habitants se guident par des repères — un portail,
un commerce en face, un numéro de villa peint sur le mur.

> **Amendement du 9 août 2026.** La première rédaction de ce paragraphe disait
> « l'adressage de rue est quasi inexistant », ce qui était trop fort et laissait
> croire qu'aucune adresse n'est résoluble à Dakar. Les codes de parcelle
> existent et la concurrence les exploite. Cela **réduit** le périmètre du Repère
> — il n'a pas à porter ce qu'un code sait dire — sans le supprimer.

Le modèle de données ne savait pas écrire ça. `Lieu enregistré` n'avait qu'un
champ d'adresse, rempli par la recherche, jamais par le Client. Conséquence
observée en test : le lieu « Maison » livré en données de démonstration valait
« Sacré-Cœur 3, Villa 214 », et **passer par le parcours de modification le
dégradait en « Sacré-Cœur, Mermoz »** — le seul texte que la carte savait
produire. Le parcours perdait de l'information faute d'une case où la ranger.
Côté Fiw Pro, le modèle de mission (`pickup: { name, detail, lat, lng }`) n'avait
lui non plus aucun champ où une indication du Client aurait pu atterrir.

Le benchmark (Careem, Zomato, Swiggy, foodpanda, Keeta) montre que **tout le
monde a un second champ** — mais sous la forme de compléments d'adresse
structurés : *Building name*, *Floor*, *Room number*, *Apartment*. C'est un
modèle de ville-tour, pensé pour Dubaï et Singapour.

## Décision

On introduit le terme canonique **Repère** (cf. `CONTEXT.md`) et on tranche
quatre points :

1. **Une ligne de texte libre, pas des champs structurés.** Pas d'étage, pas
   d'appartement, pas de numéro de porte : **ni le chauffeur ni le livreur ne
   montent** — le chauffeur ne dépose jamais au 2e, et dans plusieurs quartiers
   un livreur ne peut pas monter, pour des raisons de sécurité. L'information
   d'intérieur de bâtiment n'a donc aucun destinataire. Le contenu utile décrit
   uniquement **le point au sol et comment le reconnaître**, et il est ouvert :
   les exemples ne sont pas une liste de valeurs.
2. **Le Repère décrit un lieu, pas une personne.** Ce n'est pas un message
   (« comment me trouver, moi ») mais un fait sur l'endroit (« comment trouver
   cet endroit »), qui reste vrai la semaine suivante et pour n'importe qui.
   C'est ce qui justifie qu'un `Lieu enregistré` le **mémorise**.
3. **Aux deux bouts, dans les deux services.** Un Repère peut être porté par le
   départ comme par l'arrivée, en Transport comme en Livraison. En Transport il
   sert surtout à la prise en charge, mais un Client qui se rend dans un endroit
   qu'il ne connaît pas — avec un repère appris de bouche à oreille — doit
   pouvoir le transmettre.
4. **Il voyage.** Le Repère est recopié sur le point de la Commande et **lu par
   le Prestataire dans Fiw Pro**. Sans ce trajet, le champ ne sert à rien et ne
   doit pas exister.

Source de vérité : le Repère appartient au **point d'une Commande**. Le
`Lieu enregistré` le pré-remplit. Une modification faite au moment de la
Commande vaut pour cette Commande et **ne réécrit pas le lieu en silence**.

## Alternatives écartées

- **Des compléments d'adresse structurés** (le modèle Careem/Zomato : bâtiment,
  étage, appartement) — écarté : conçu pour des villes verticales, il produirait
  à Dakar un formulaire que personne ne remplit et que personne ne lit, tout en
  demandant une information dont aucun Prestataire ne fera rien.
- **Un Repère au départ seulement** — écarté sur objection : on utilise une app
  de transport précisément pour aller là où on n'est jamais allé, et c'est là
  qu'un repère vaut le plus.
- **Deux concepts séparés** (un repère stable sur le lieu + une consigne
  ponctuelle sur la course) — écarté : du luxe conceptuel que l'interface
  paierait en champs. Un seul champ, pré-rempli et modifiable, couvre les deux.
- **Ne rien ajouter** et assumer que le Lieu enregistré n'est qu'un pin plus un
  surnom — écarté : c'est le statu quo qui dégradait « Villa 214 », et il rend
  la promesse « le prestataire vous trouve » intenable dans une ville sans
  adressage.

## Conséquences

- **`CONTEXT.md`** — terme **Repère** ajouté ; `Lieu enregistré` amendé (il
  mémorise le Repère). Collision évitée : **« note » est déjà pris** par
  `Note du Client` / `Note du Prestataire` (moyennes d'évaluation) et ne doit
  jamais désigner le Repère. « Point de repère » écarté aussi, pour ne pas
  brouiller la famille `Point Express` / `Point Fidélité`.
- **Fiw (Client)** — `stores/places.ts` gagne `repere` ; la fiche de lieu
  (`app/compte/lieu.tsx`) l'expose. **Restent à faire** : le champ sur les
  écrans de configuration de course et de livraison, pré-rempli depuis le Lieu
  enregistré.
- **Fiw Pro (Prestataire) — à faire.** Le modèle de mission doit porter le
  Repère de chaque point et l'écran de mission doit l'afficher. Tant que ce
  n'est pas fait, le Repère est saisi côté Client sans destinataire. Noté dans
  `docs/sitemap-pro.md`, section Mission.
- **L'adresse peut rester grossière.** Puisque le Repère existe, il est normal
  qu'une adresse enregistrée soit un quartier ou une avenue : c'est ce que la
  carte sait trouver. La précision n'est plus attendue de l'adresse.
- **Le Repère est facultatif.** Un lieu sans Repère reste valide ; aucun
  parcours ne le rend obligatoire.
