# Benchmark Mobbin — la page qui vend l'Affiliation

> Passe UX/UI du **27 septembre 2026**, avant la reprise de
> `apps/fiw/app/affilie/presentation.tsx` — l'écran qui s'ouvre quand le Client
> tape la bannière « Gagnez de l'argent avec Fiw ! » (accueil et Menu).
> Plateforme interrogée : `ios`. Corpus : 30 écrans, trois requêtes.

## Pourquoi cette passe

L'écran était le seul du flux Affiliation à n'avoir jamais été repris depuis sa
création (juin 2026), et il se voyait : quatrième géométrie de cercle d'icône du
produit, `letterSpacing` inventé, case à cocher pré-cochée, et aucun lien visuel
avec la bannière qu'on venait de taper. Le reste de l'app a entre-temps gagné
`Medallion`, `ListRow`, `Callout`, `Hint`, `ResultState` et une doctrine écrite ;
cette page était restée au niveau de 2026-06.

## Corpus

**Programmes de parrainage** — [Airbnb](https://mobbin.com/screens/b55424f9-e5db-428b-a65e-e0573dc0da4a) ·
[Cash App](https://mobbin.com/screens/9319f326-3cae-45f0-b89a-430aa28df478) ·
[Monzo](https://mobbin.com/screens/31d527fe-72f5-45a9-abf9-88dc44c42d49) ·
[N26](https://mobbin.com/screens/33f87f46-bec3-47d9-8b08-f8fa372af26c) ·
[NordVPN](https://mobbin.com/screens/4bd930b1-0cad-436c-a46b-f5ffde3d986b) ·
[Acorns](https://mobbin.com/screens/69f46f6b-7a5e-4549-9d5c-ef12cfd82b4c) ·
[Oportun](https://mobbin.com/screens/11e1bfce-6cdf-4641-95b2-6d5447315c73) ·
[AllTrails](https://mobbin.com/screens/93fcbc4f-87cf-4f75-aab8-a100d8072089) ·
[Zopa Bank](https://mobbin.com/screens/df693656-946f-46f7-a46f-a35015695338) ·
[Too Good To Go](https://mobbin.com/screens/0ddce4bc-5398-4018-a0f3-ed8f2dc13fdb) ·
[Origin](https://mobbin.com/screens/de1720fa-c0d5-4071-a764-7e0beb79a78b)

**Mobilité / livraison** — [Careem](https://mobbin.com/screens/46ace6c1-4097-4549-986b-b82957aed448) ·
[Grab](https://mobbin.com/screens/80ad96b1-1b31-45b5-af57-6e56ea4d884d) ·
[Gojek](https://mobbin.com/screens/163c2704-d97c-48b5-9391-a54445bd5b7e) ·
[Lyft](https://mobbin.com/screens/3bf02ddd-ff69-41a8-a2d4-7b54829ff5ae) ·
[Lime](https://mobbin.com/screens/65ba6e58-79d4-4de3-8b55-130f69ad65f4) ·
[Uber Eats](https://mobbin.com/screens/ed879873-ac22-4f2b-a995-2414abe32c70) ·
[GoPay](https://mobbin.com/screens/ccbae141-6c21-40a3-af71-610145e2b3bd) ·
[Setel](https://mobbin.com/screens/8d77a393-01f9-43c7-ad9a-1f621d373ae1)

**Adhésion à un programme (le consentement)** — [Base](https://mobbin.com/screens/7c07c805-340c-43ba-a83a-b0b569cfd902) ·
[Monzo Cashback](https://mobbin.com/screens/48f16c99-1a22-4127-98cf-3efe85d26499) ·
[Brave](https://mobbin.com/screens/7bb0b703-4f2e-461f-9e5b-ac8f5fda4e46) ·
[Instacart](https://mobbin.com/screens/2b1b2ad9-b3b2-4de8-86b8-5fabb858c990) ·
[Kraken](https://mobbin.com/screens/a908a208-519b-4f99-8643-f811f5211558) ·
[Target](https://mobbin.com/screens/60697bb4-bc92-4d8b-a981-54b05c25d477) ·
[Qantas](https://mobbin.com/screens/a6147fd9-2104-4401-a335-6e56d9ea10e4)

## Grammaire commune

1. **Le chiffre est dans le TITRE.** « $5 for you. $5 for a friend. » (Cash App),
   « Refer friends to Zopa to earn up to £100 », « Refer a friend, earn AED 40 »
   (Careem), « Refer a friend, get RM3 » (Setel), « Get 50% off 1 ride » (Lyft).
   Aucune des vingt pages ne garde son montant pour une sous-étape.
2. **Une illustration en haut, large.** Cash App, Zopa, Grab, Setel, GoPay,
   Gojek, Uber Eats et Lime ouvrent sur un visuel plein cadre ou une bande
   colorée. Personne n'ouvre sur une icône de 40 dans un carré de 72.
3. **« Comment ça marche » est une section NOMMÉE**, pas une liste flottante —
   13 des 20 pages portent littéralement le titre « How it works ».
4. **Trois ou quatre étapes, tête + titre + corps qui passe à la ligne.** Deux
   familles de tête : le **glyphe** quand les étapes sont des faits (Airbnb,
   NordVPN, AllTrails, Oportun, Careem, Too Good To Go) et le **numéro relié par
   un rail** quand elles sont une séquence à respecter (Origin, N26, GoPay,
   Monzo, Acorns). Jamais les deux.
5. **Un seul CTA plein, en pied**, éventuellement doublé d'un lien discret
   dessous (Airbnb « View your referrals », Zopa « Terms & conditions »).

## Le point qui a tranché : où vit le consentement

C'est la seule question sur laquelle le corpus est unanime, et c'est celle où
Fiw s'écartait le plus.

| Nature de l'écran | Forme du consentement | Exemples |
|---|---|---|
| **Proposition** (on vend le programme) | Une **mention** sous ou au-dessus du CTA, le mot « conditions » en lien | Base, Monzo, Brave, Instacart, Zopa, Airbnb, NordVPN, Careem |
| **Contrat** (l'écran EST le texte à signer) | Une **case à cocher**, décochée, qui débloque le bouton | Target, Qantas, Kraken, Taco Bell |

**Zéro case pré-cochée dans tout le corpus.** Fiw en avait une
(`useState(true)`) — un consentement donné à la place du Client — et, pire, le
même contrat était accepté **deux fois** : une fois sur `presentation`, une fois
sur `conditions`, par deux boutons aux libellés différents menant tous deux au
tableau de bord.

## Décisions (D1–D7)

| # | Décision | Pourquoi |
|---|---|---|
| **D1** | **Le titre porte les 2 %.** « Gagnez 2 % sur chaque course de votre réseau ». | Grammaire n°1. Le chiffre était en 3ᵉ ligne de la 3ᵉ étape. |
| **D2** | **Bandeau `blue100` + `HandWithCash` en tête**, pleine largeur, illustration à 104 (le double du 52 des bannières). | La page est la destination d'une bannière : elle doit se reconnaître. Le style guide l'écrit déjà pour le bloc du Menu — « on ne lui invente pas une identité, on la reconnaît d'un écran à l'autre ». |
| **D3** | **Tête de section `SectionLabel` « Comment ça marche »**. | Grammaire n°3. La liste flottait sans être annoncée. |
| **D4** | **Étapes à GLYPHE, pas à numéro.** `Medallion sm` + icône Phosphor. | Grammaire n°4 : Fiw n'a aucun numéro-dans-un-cercle nulle part ; le rail numéroté serait une seconde grammaire à inventer. La séquence est portée par la copie (Partagez → Ils rejoignent → Vous touchez). |
| **D5** | **Le consentement devient une mention sous le CTA**, et la case à cocher disparaît des deux écrans. `conditions` redevient une page de LECTURE. | Tableau ci-dessus. Un contrat, une acceptation, au bon endroit. |
| **D6** | **Un `Callout` et un seul** : « Les 2 % sont prélevés sur la part de Fiw ». | C'est la seule règle non devinable de l'écran, et celle qui décide du recrutement — est-ce que je coûte quelque chose au prestataire que j'inscris ? |
| **D7** | **Le CTA nomme le rôle** : « Devenir Affilié Réseau » (ex- « Activer mon profil »). | Il répond mot pour mot à la question de la bannière, « Et si vous deveniez un affilié réseau ? ». « Mon profil » ne disait pas lequel. |

### Écartées

- **Le rail numéroté** (Origin, N26, GoPay) — plus fort pour une séquence
  contraignante, mais Fiw n'a nulle part de numéro dans un cercle, et les trois
  étapes ne sont pas des conditions à remplir dans l'ordre.
- **La preuve sociale** (Careem : trois portraits « Amir earned AED 1000 ») —
  la plus efficace du corpus pour vendre un programme, et la plus coûteuse : elle
  demande des chiffres réels et des visages réels. À reconsidérer quand
  l'Affiliation aura des Affiliés.
- **La grille de paliers** (N26 : « Metal €100 / Go €80 / Smart €60 ») — sans
  objet, Fiw n'a qu'un taux.

## Conséquence sur le design system

Le corpus a rendu visible un **manque** : la liste explicative n'existait pas
dans le système. `ListRow` est une **porte** de hauteur fixe (titre et
sous-titre en `numberOfLines={1}`), or une étape est un **paragraphe** — la
tronquer lui retire son sens. D'où `components/StepList.tsx`, documenté dans le
style guide. Deux sites aujourd'hui : les étapes de `presentation`, les clauses
de `conditions`.

## Vocabulaire corrigé au passage

`CONTEXT.md` proscrit « chauffeur » hors du flux Transport ; l'écran disait
« Invitez vos proches, vos chauffeurs et vos commerçants ». Il dit désormais
**prestataires** — et il ne promet plus que recruter des Clients rapporte : le
recap du 30 août 2026 a réservé la commission aux courses réalisées par les
**Prestataires** inscrits avec le code. (Point noté dans « Reste à faire » de
`design-system-inventory.md` depuis le 24 août ; soldé pour ces deux écrans,
encore ouvert sur `dashboard`, `reseau` et `constants/affilie.ts`.)
