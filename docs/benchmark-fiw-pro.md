# Benchmark — Fiw Pro (Prestataire)

> Passe UX/UI du 7 novembre 2026, avant la reprise de `apps/fiw-pro/`.
> Corpus : **six applications chauffeur** lues écran par écran — Yango Pro,
> Heetch Pro, Bolt Driver, Uber Driver, Yassir Driver, Careem Captain.
>
> ⚠️ **Mobbin n'était pas accessible** (l'abonnement de l'espace a expiré ; les
> trois passes précédentes du projet en venaient). Le corpus est constitué des
> captures publiées par les éditeurs eux-mêmes sur l'App Store, récupérées via
> l'API publique `itunes.apple.com/lookup` et archivées dans
> `.context/bench-pro/`. Ce sont de **vrais écrans produits**, choisis par les
> éditeurs — donc leurs écrans les plus soignés et les plus représentatifs de ce
> qu'ils estiment vendeur. La limite est à connaître : **ce ne sont pas des
> parcours**, on ne voit pas les états intermédiaires ni les cas d'échec. Les
> décisions ci-dessous qui portent sur des **flux** (et non sur des écrans) sont
> signalées comme telles et restent à confirmer.

---

## 1. Pourquoi ce benchmark ne se recopie pas

C'est le résultat le plus important de la passe, et il tombe avant tout détail
d'interface.

**Les six applications du corpus partagent une mécanique d'argent que Fiw n'a
pas.** Chez Bolt, Uber, Heetch, Careem et Yassir, le prestataire **accumule** ce
qu'il a gagné, la plateforme **retient sa commission** sur cette somme, et lui
**reverse** le reste — d'où les écrans qui structurent tout le corpus :
« Balance 707.66 € · Will be paid to you on June 7 » + bouton **Cash out**
(Bolt, Uber), « Yassir pays you 78 890 DA » (Yassir), « Total cash balance ·
Pay out amount » (Careem).

**Fiw fonctionne à l'envers.** `CONTEXT.md` est explicite : le Wallet est
*« alimenté via Mobile Money, sert uniquement à payer la commission de 14 %
prélevée automatiquement à chaque course terminée »*, il est à **sens unique
débit**, et **Wallet vide = accès bloqué**. Le Client paie le Prestataire
directement ; Fiw ne lui doit rien et ne lui reverse rien. Le Prestataire, lui,
**doit** à Fiw.

Conséquences, et elles sont structurantes :

- **L'écran « Gains » n'est pas l'écran central de Fiw Pro.** Il l'est partout
  ailleurs parce qu'il porte l'argent qu'on attend. Ici les gains sont déjà dans
  la poche du Prestataire — ils se consultent, ils ne s'attendent pas.
- **Le bouton « Retirer » n'existe pas**, et il ne faut pas l'inventer par
  mimétisme. Le seul retrait de l'écosystème Fiw est celui de l'Affilié Réseau,
  côté Client (`Wallet Réseau`, cf. ADR 0007) — un autre objet, une autre app.
- **L'écran central est le Wallet**, et ce qu'il doit dire n'est pas un solde :
  c'est **combien de temps il reste avant le blocage**. Aucune des six apps n'a
  ce problème à résoudre.

Le seul analogue partiel du corpus est **Yassir**, qui affiche une carte
« Yassir fees · 8 000 DA · Pay before 18/09/2020 » : une somme **due**, avec une
échéance. C'est la bonne famille, mais Yassir laisse le prestataire travailler
pendant qu'il doit ; Fiw le coupe. L'enjeu est donc plus dur, pas moins.

> **À retenir avant toute maquette** : tout écran du corpus qui parle d'argent
> est à relire en se demandant « qui doit à qui ? ». La réponse change à chaque
> fois, et avec elle le ton, la couleur et le verbe du bouton.

---

## 2. Le corpus

| App | Marché | Pourquoi dans le corpus | Captures |
|---|---|---|---|
| **Yango Pro** | Dakar, Afrique de l'Ouest, Russie | **Le concurrent direct**, présent à Dakar. Référence de ce que les Prestataires connaissent déjà. | 5 |
| **Heetch Pro** | France, Maghreb, **a opéré à Dakar** | Marché proche, interface française, modèle « le chauffeur choisit sa course et son prix ». | 8 |
| **Bolt Driver** | Europe, Afrique | Le ledger de commission le plus lisible du corpus. Niveaux de statut. | 6 |
| **Uber Driver** | Mondial | La référence d'activation par documents et de carte de mission. | 7 |
| **Yassir Driver** | Algérie, Afrique de l'Ouest | **Seul modèle où le chauffeur DOIT à la plateforme.** Marché et contraintes proches. | 5 |
| **Careem Captain** | Moyen-Orient, Pakistan | Inscription par étapes et choix de service en cartes. | 6 |

Lecture faite sur planches (`.context/bench-pro/planche-*.png`). **Lyft Driver a
été téléchargé mais n'a pas été lu** — arrêt du corpus à six apps, les trois
dernières n'apportant plus de motif nouveau. Ses captures sont dans
`.context/bench-pro/lyftdriver/` si on veut compléter ; ne pas lui attribuer de
constat tant qu'elles n'ont pas été regardées.

---

## 3. Ce que le corpus apprend, surface par surface

### 3.1 La mission entrante — le minuteur vit DANS le bouton

C'est l'accord le plus net du corpus, et il est contre-intuitif.

**Uber** et **Yango** posent un seul bouton « Accept » pleine largeur dont le
**fond se vide** de gauche à droite : le bouton *est* le compte à rebours. Pas
de chiffre qui décompte, pas d'anneau de progression à côté. **Careem** pousse
plus loin : le refus (« Reject ») est une petite pilule flottante en haut à
gauche de la carte, à l'opposé du pouce.

Aucune des six n'oppose un « Accepter » et un « Refuser » de même poids.

Le pourquoi tient à la situation : le Prestataire est **au volant**. Il a deux
secondes et un coup d'œil. Un couple de boutons symétriques demande de lire,
comparer, viser — un geste de bureau. Un seul bouton demande un geste.

**Ce qui est affiché au-dessus du bouton**, dans l'ordre, et c'est stable d'une
app à l'autre : la **distance ou la durée jusqu'au Client** en grand
(Uber « 3 min away », Yango « 780 m · 2 min », Careem « 5 min | 4 km »), puis
une ou deux qualifications (note du Client, gamme, multiplicateur de prix), puis
l'itinéraire. **Le prix n'est jamais la première ligne** — sauf chez Heetch, où
le chauffeur choisit parmi une liste et où le prix *est* le critère de tri.

### 3.2 L'accueil — la carte, et des chiffres qui sont des portes

**Bolt** pose sous sa carte une grille de petites cartes : « Today's earnings
25.50 € › », « Driver Score 94 % › », « Acceptance rate 94 % › ». Chacune porte
un chevron. **Yassir** fait pareil en colonne, avec en plus le **delta** :
« Trips 124 ↑ +12 », « Time 10h20 ↓ −25 minutes ».

C'est exactement la règle que le projet a déjà écrite côté Client, en refusant
les tuiles de statistiques du Menu : *un chiffre n'a droit à sa propre tuile que
s'il a quelque chose à ouvrir derrière*. Le corpus la confirme — et montre la
forme à lui donner quand la réponse est oui.

**L'état en ligne / hors ligne** se traite de trois façons :
- **Bolt** — pilule colorée dans la barre du haut (« Go offline » en orange).
- **Heetch** — pilule « ● Online » dans l'en-tête de la feuille.
- **Yassir** — **carte dédiée en bas d'écran** : « Your are in service /
  Disable service » + interrupteur vert.

Les trois marchent. La différence est de **poids**, et elle dépend de ce que
l'app demande : plus l'application vit de la disponibilité du prestataire, plus
l'état remonte en taille.

### 3.3 L'argent — le net d'abord, la commission en ligne rouge

**Heetch** donne la forme la plus claire du corpus : un sélecteur de jour
(‹ Today, Wed 6 Nov ›), puis **185,24 €** en très grand avec la mention
« NET = Take home earnings », puis le détail ligne à ligne — *Cash collected
+53,00 · Cashless payments +119,50 · Passenger discounts +10,00 · Passenger debt
collected +21,26 · Adjustment (overpaid) −18,52*.

**Bolt** tient le même registre dans son historique de paiements, et c'est le
plus directement transposable à Fiw : *In app trips **+114.3 €** · **Bolt
Commission 20 % −21.26 €** · Weekly Payout −475.39 €*. La commission n'est pas
reléguée dans un écran « conditions » : elle est **une ligne du relevé, au même
rang que les gains, en négatif**.

**Yassir** confirme la convention d'encre : brut en neutre, **frais en rouge**,
**net en vert**.

Fiw a déjà les jetons pour ça (`successInk`, `warningInk`, `error`) et la règle
qui va avec — *un plein ne s'écrit pas, il remplit ; c'est l'encre foncée qui
porte le contraste*.

### 3.4 L'activation — une liste de portes, dont une est « la prochaine »

**Uber** : « Welcome back, Amanda / Here's what you need to do to set up your
account », puis des rangées-portes. La suivante est **peinte en bleu clair** et
porte le libellé « Recommended next step » ; les autres sont grises et disent
« Get Started ». **Careem** préfère une **barre d'étapes numérotée 1-2-3-4** en
haut, les étapes franchies cochées en vert.

Les deux répondent à la même question — *où j'en suis et que dois-je faire
maintenant* — mais pas au même problème : la barre numérotée suppose un ordre
**imposé**, la liste à « prochaine étape » suppose un ordre **conseillé**.

Fiw est dans le second cas : `feature-list` décrit une activation **par service
cumulable** (Vélo, Moto, Voiture, Assistance), chacun avec ses propres pièces.
Il n'y a pas une file, il y a plusieurs dossiers menés en parallèle.

**Uber** soigne aussi la **prise de vue** d'un document : une note
d'avertissement, trois règles numérotées, un exemple montré, puis le bouton.
C'est le seul endroit du corpus où l'on explique *comment* faire une photo — et
c'est le point où une activation échoue en vrai.

### 3.5 Le choix des services — des cartes, pas une liste de cases

**Careem** (« Select Service » : Rides / Food) et **Uber** (« Choose how you
would like to earn ») présentent les services en **cartes illustrées** portant
titre, description et conditions d'accès (« Age: 21+ · Vehicle: 2007 or newer »).

Fiw a déjà le composant : `GammeCard`, construit côté Client pour les gammes de
course et les méthodes de livraison, avec son jeu d'illustrations `mobility
option` (moto, vélo, auto). **Le même objet sert à vendre une gamme au Client et
à faire choisir un service au Prestataire.**

### 3.6 Le statut — la valeur ET son seuil

**Bolt** affiche « Silver · Valid until 30 Sep », « Unlock Gold — 50 points
(1 ride) required by 31 Aug », une barre de progression, puis les conditions
sous forme de rangées : *Driver rating **4.9** (4.5 min) › · Ride cancellations
**3 %** (4 % max) › · Acceptance rate **88 %** (85 % min) ›*.

La forme à retenir est **« valeur actuelle (seuil) »** : elle dit d'un coup où
l'on est et ce qui est exigé, sans graphique.

⚠️ **Et c'est là que Fiw doit s'écarter du corpus.** `CONTEXT.md` pose que le
**Score de coopération** est *« un mécanisme algorithmique interne et invisible
pour le prestataire »*, et la `feature-list` demande un *« message de coopération
(formulation positive, sans mention de pénalité) »*. Autrement dit : Fiw a
délibérément choisi de **ne pas** afficher le taux d'acceptation que Bolt met en
tuile sur son accueil. Le **Statut prestataire** (Bronze/Argent/Or/Diamant), lui,
est visible — c'est lui qui prend la forme Bolt, pas le score.

---

## 4. Décisions

| # | Décision | Pourquoi |
|---|---|---|
| **D1** | **Le Wallet est l'écran pivot de Fiw Pro, et il se lit en autonomie, pas en solde.** Le chiffre principal reste le solde en F CFA, mais il est immédiatement qualifié par ce qu'il permet (« ≈ 12 courses avant blocage »). | Le solde seul ne dit rien : 3 000 F est confortable pour un vélo, court pour une voiture. Ce que le Prestataire veut savoir, c'est quand il sera coupé. Aucun modèle à copier — § 1. |
| **D2** | **Trois états du Wallet, portés par les jetons fonctionnels** : *sain* (neutre), *bas* (`warningSubtle` + `warningInk`), *bloqué* (`errorSubtle` + `error` + CTA « Recharger » en `primary`). Jamais le jaune de marque. | Le style guide réserve le jaune de marque à la pédagogie et le `warning` ambre à « quelque chose cloche ». Un Wallet bas, c'est exactement « ça cloche ». |
| **D3** | **La mission entrante tient en un seul bouton, dont le fond porte le compte à rebours.** Le refus est une action secondaire discrète, pas un bouton jumeau. | Accord des six apps ; le Prestataire est au volant — § 3.1. Un nouveau composant `MissionRequest` est à écrire : aucun composant du Client ne porte un minuteur dans un bouton. |
| **D4** | **Mettre en ligne est un CTA ; se mettre hors ligne est un contrôle.** Hors ligne, la feuille porte un `Button primary` pleine largeur « Passer en ligne ». En ligne, elle porte une rangée d'état avec un `Toggle`. | L'asymétrie est honnête : l'une est la décision qui ouvre la journée, l'autre un réglage. Les trois formes du corpus marchent (§ 3.2) ; c'est le poids qui doit suivre l'enjeu. |
| **D5** | **Sous la carte, des RANGÉES à sous-titre** — Mon Wallet, Gains du jour, Statut — pas des tuiles de statistiques. Le chiffre est le résumé de la porte. | _Corrigée le 7 novembre, en écrivant l'écran._ Cette décision disait d'abord « cartes-chiffres façon Bolt et Yassir », et elle **contredisait la règle qu'elle citait** : le Menu Client a refusé ses tuiles au motif qu'*un chiffre ne devient un élément à lui seul que s'il n'a RIEN à ouvrir derrière*. Ici les trois ouvrent quelque chose. Le gain est aussi d'information — « 4 200 F · environ 13 courses » dit plus qu'une tuile « 4 200 F ». **La contrepartie est la hauteur** : trois rangées prennent ~210 px contre ~90 pour trois tuiles, sur un écran où la carte doit rester visible. Si la compacité l'emporte à l'usage, c'est la règle du Menu qu'il faudra amender — pas cet écran qu'il faudra bricoler. |
| **D6** | **Le Score de coopération n'est jamais affiché.** Pas de tuile « taux d'acceptation », pas de pourcentage, pas de barre. Le Statut prestataire, lui, prend la forme Bolt : valeur actuelle + seuil exigé, en rangées. | `CONTEXT.md` : le score est interne et invisible. C'est un écart **délibéré** au corpus, pas un oubli — à ne pas « corriger » plus tard par mimétisme. |
| **D7** | **Le relevé de commission est un relevé, pas un écran de conditions.** La commission de 14 % est une **ligne négative** au milieu des courses, dans la même liste, à la même taille. | Bolt et Yassir ; c'est ce qui rend la retenue compréhensible au lieu de subie — § 3.3. |
| **D8** | **L'activation est une liste de dossiers par service, pas une file numérotée.** Chaque service validé/en attente/refusé porte son état ; la pièce manquante la plus bloquante est mise en avant façon « prochaine étape » d'Uber. | Les services sont **cumulables** et menés en parallèle (`feature-list`) : il n'y a pas d'ordre imposé à représenter — § 3.4. |
| **D9** | **Le choix des services prend un composant propre, `ServiceCard`** — qui reprend l'anatomie de `GammeCard` (plateforme teintée, illustration `mobility option` débordante) sans en être une instance. | _Corrigée le 8 novembre, en écrivant l'écran._ Elle disait « réemployer `GammeCard` », ce qui ne tient pas : les deux cartes de choix du système sont bâties autour d'un **prix** — `GammeCard` est label + ETA + prix, `OptionCard` est bénéfice + prix, et dans les deux le prix est l'objet du choix. Ici il n'y a ni prix ni ETA, mais un **métier** et ce qu'il rapporte. Leur passer un prix factice pour réemployer la coquille, ce serait garder la forme en perdant ce qu'elle mesure. |
| **D10** | **La grammaire de navigation du Client est reprise telle quelle** : carte plein écran + feuille basse + page **Menu** atteinte par un `IconButton` flottant. Pas de barre d'onglets. ⚠️ **Les crans ne sont pas tenus en v1** : la physique de la feuille du Client (suivi au 1:1, rubber-band, ressort à vélocité continue) **ne vit pas dans un composant** — elle est écrite à la main dans `apps/fiw/app/home.tsx`, et le `BottomSheet` du DS est une feuille *modale*. L'extraire est un chantier à mener côté Client d'abord. | Bolt et Yassir ont des onglets, Uber et Yango non. Trancher par la cohérence interne plutôt que par le corpus : deux apps d'un même produit qui ne se naviguent pas pareil coûtent plus qu'elles ne rapportent. _(Ne vaut que pour le Prestataire : l'**Affilié Partenaire** garde ses quatre onglets, tranchés par l'ADR 0006.)_ |
| **D11** | **Le Repère est affiché dans la mission, au point de collecte et au point d'arrivée.** | ADR 0009 : il est saisi côté Client et **lu par le Prestataire**. Tant que Fiw Pro ne l'affiche pas, le Client remplit un champ que personne ne lit. C'est la dette la plus concrète laissée par le sitemap Pro. |

### Écartées

- **Le « Cash out » / « Retirer »** — § 1. Inapplicable, et dangereux à copier.
- **Le taux d'acceptation en tuile** (Bolt) — D6.
- **Le choix du prix par le chauffeur** (Heetch, inDrive) — Fiw a fait le choix
  inverse, revendiqué : *« le prix affiché est le prix payé, toujours »*
  (`research-signals`, levier d'acquisition le plus fort du produit). Un
  chauffeur qui surenchérit le détruirait.
- **La liste de courses au choix** (Heetch) — même raison : Fiw attribue, et le
  Score de coopération suppose une attribution, pas un marché.

---

## 5. Structure proposée — Fiw Pro v1 (Prestataire)

> Périmètre volontairement court. Ce qui est listé ailleurs dans
> `feature-list.md` (Covoiturage, Yobanté, Location longue durée, Assistance)
> **n'entre pas en v1** : l'app Client elle-même n'ouvre que le Transport au
> lancement (décision du 4 octobre 2026).

```
Activation
  · Choisir mes services        (GammeCard — D9)
  · Mes dossiers                (liste par service, états — D8)
  · Déposer une pièce           (guide de prise de vue — § 3.4)

Accueil                          (carte + feuille — D10)
  · Hors ligne → CTA « Passer en ligne »        (D4)
  · En ligne   → rangée d'état + cartes-portes  (D4, D5)
  · Bandeau Wallet, permanent                   (D1, D2)

Mission                          (reprend le flux Client en miroir)
  · Entrante     → MissionRequest, minuteur dans le bouton  (D3)
  · Navigation   → vers le Client, Repère affiché           (D11)
  · Arrivé       → déclenche les Frais d'attente
  · En course    → vers la destination
  · Clôture      → ÉvaluationClient (privée)

Wallet                           (l'écran pivot — D1)
  · Solde + autonomie + état
  · Recharger (Mobile Money)
  · Relevé : courses et commissions dans la même liste      (D7)

Menu                             (grammaire du Menu Client)
  · Portrait + Note du Prestataire
  · Gains · Historique · Statut prestataire (D6) · Documents · Aide
```

**Hors v1, et assumé** : heatmap, direction programmée, missions planifiées,
livraison groupée, scan de colis, SOS prestataire. Tous sont au périmètre
produit ; aucun n'est nécessaire pour qu'un Prestataire prenne sa première
course.

---

## 6. Le préalable technique, à trancher avant toute maquette

`apps/fiw-pro/` date de juin 2026 : **7 composants locaux** et des jetons qui ont
cinq mois de retard sur ceux du Client (pas de `strokes.ts`, pas de `track`,
`surfaceAlt`, `brandYellow`, `hairline`, pas de rôles « sur fond sombre », pas de
`Field`, `List`, `ListRow`, `Medallion`, `Callout`, `StepList`…). Côté Client, le
design system compte **58 composants** et son journal.

Trois voies, et c'est une décision à prendre, pas à deviner :

1. **Recopier** le DS du Client dans `apps/fiw-pro/`. Rapide, et c'est la
   garantie d'une divergence dans trois mois — celle qu'on vient de passer six
   semaines à résorber côté Affiliation.
2. **Exécuter l'ADR 0004** — `packages/tokens` + `packages/ui` partagés, décidé
   le 25 juin 2026 et jamais construit. C'est la bonne réponse, et c'est un
   chantier de migration du Client avant d'être un chantier Pro.
3. **Chemin intermédiaire** : extraire d'abord les **jetons** (une seule source,
   avec la primaire en variable — `#0066FF` Client / `#084EC5` Pro), garder les
   composants dupliqués le temps de la v1 Pro, et migrer les composants ensuite.

Ma recommandation est la **3**. Les jetons sont ce qui diverge le plus vite et
coûte le moins cher à partager ; les composants peuvent attendre d'avoir servi
deux fois avant qu'on sache ce qui doit vraiment être commun.

---

## 7. État de la v1 — 8 novembre 2026

Construite et vérifiée (typecheck + bundle Metro) :

| Surface | Écrans | Ce qu'elle apporte |
|---|---|---|
| **Fondation** | — | Jetons **générés** depuis le Client (`gen-pro-tokens.py`), 45 composants **portés** avec détection d'écart (`sync-pro-components.py`). Six jetons inventés par l'app de juin ramenés dans le système. |
| **Accueil** | `accueil` | Hors ligne → CTA ; en ligne → état + trois portes (D4, D5). |
| **Mission** | `mission/navigating · arrived · in-progress · complete` | Minuteur dans le bouton (D3), **Repère affiché** (D11), frais d'attente à deux régimes. |
| **Wallet** | `wallet/index` | Le pivot : autonomie, trois états, relevé recharges + commissions (D1, D2, D7). |
| **Activation** | `activation/index · services · piece` | Dossiers en parallèle (D8), `ServiceCard` (D9), consignes de prise de vue. |
| **Menu · Gains · Statut** | `menu · gains · statut` | Grammaire du Menu Client ; statut façon Bolt **sans taux d'acceptation** (D6). |

Quatre composants sont nés côté Pro — `CountdownButton`, `MissionRequest`,
`MissionItineraire`, `ServiceCard` — chacun parce que le besoin n'existe pas
côté Client. Ils sont documentés dans `apps/fiw-pro/components/README.md`.

### Ce qui reste ouvert

- **Les crans de feuille** (D10) : la physique de l'accueil Client n'est pas un
  composant, elle est écrite dans `apps/fiw/app/home.tsx`. À extraire côté
  Client avant de pouvoir la reprendre.
- **`primaryFill` et `primaryInk` côté Pro** sont *dérivés*, faute de valeur
  posée en maquette ; `primaryInk` y rejoint `primaryHover`. À confirmer.
- **Pas d'`errorInk` dans le système** : sur `errorSubtle`, seul du texte de 40 px
  peut être rouge. À poser le jour où du petit texte devra y tenir.
- **Les étoiles du Client sont encore en `warning`** (`transport/cloture.tsx`),
  alors que `ListRow` a été corrigé le 4 septembre — *une note n'est pas une
  alerte*. Reste à corriger **côté Client**.
- **Le paiement Mobile Money transite-t-il par Fiw ?** Si oui, « j'encaisse la
  totalité » ne vaut que pour les espèces, et les écrans de clôture et de gains
  devront distinguer les deux. Le modèle du Wallet prépayé suggère que non,
  mais ce n'est écrit nulle part.

---

## 8. Deuxième passe — hors du VTC (8 novembre 2026)

Le premier corpus ne contenait que des apps de VTC. Elles se ressemblent toutes
et aucune n'a les problèmes durs de Fiw Pro. Cette passe va chercher ailleurs :
**Wolt Courier**, **Bolt Food Courier**, **Orange Money Agent** (un agent dont
le float prépayé s'épuise — le jumeau exact du Wallet), **Wave** (l'app de
paiement dominante à Dakar), plus une recherche sur ce que les chauffeurs
reprochent réellement à ces applications.

### O1 — Le Repère devrait pouvoir être une PHOTO

Bolt Food met un **« View photo »** sur son écran de collecte : une vignette de
l'endroit, prise par quelqu'un qui y est déjà allé. Wolt structure la même
chose en champs (Building name, Entrance, Floor) **plus** une note libre.

L'ADR 0009 a tranché que le Repère est « une ligne de texte libre », et a
écarté les champs structurés pour une bonne raison — ni le chauffeur ni le
livreur ne montent. **La photo n'est pas dans ce débat** : elle ne décrit pas
un intérieur, elle montre une façade. À Dakar, où l'adresse résout une parcelle
et pas un portail, une photo du portail vert vaut mieux que sa description.

C'est l'idée la plus forte de la passe, et elle **étend un objet déjà décidé**
au lieu d'en inventer un. Elle demande un amendement daté à l'ADR 0009.

### O2 — Traduire le Repère

Bolt Food pose un lien **« Translate »** sous les instructions. Fiw est en
français, le Wolof est marqué « bientôt disponible » dans la liste de
fonctionnalités. Or le Repère est écrit par le Client et lu par le
Prestataire : c'est exactement le texte où l'écart de langue coûte une course.
Un lien « Traduire » est moins cher qu'une traduction de toute l'app, et il se
pose là où il sert.

### O3 — Le blocage doit dire quoi faire, et combien de temps

La recherche sur les plaintes de chauffeurs donne un résultat net : la
**désactivation sans recours lisible** est le reproche numéro un, devant les
tarifs. Pas de délai annoncé, pas d'interlocuteur, pas d'état d'avancement.

Fiw bloque sur Wallet vide et possède un état **Gelé**. Ce sont deux blocages,
et aujourd'hui ni l'un ni l'autre n'a d'écran. C'est le point où Fiw peut être
**visiblement meilleur** que Yango pour un coût faible : dire ce qui est arrivé,
ce qu'il faut faire, et sous combien de temps ça se débloque.

### O4 — Glisser plutôt que taper, pour ce qui ne se défait pas

Wolt emploie un **slider** (« Slide to go online », « Delivered ») là où une
erreur coûte cher. Fiw a trois boutons de ce genre, tous en simple tap :
« Je suis arrivé » (déclenche le compteur de frais d'attente du Client),
« Démarrer la course », « Terminer la course ». Un tap parasite au volant
facture le Client ou clôt une course en cours.

### O5 — L'app doit montrer qu'elle cherche

En ligne, Bolt Food affiche une pilule **« Looking for orders »** avec un
spinner, et **« Increased Demand : 1,6x »**. Wolt annonce « Area demand: Busy »
**en toutes lettres**, sans heatmap. Fiw dit « Vous êtes en ligne » et ne montre
rien — le Prestataire ne sait pas si le système travaille ou si l'app est morte.

La version en mots de Wolt est à retenir : elle donne l'essentiel de la heatmap
(qui est hors v1) sans carte à colorer.

### O6 — « Dernière course » à côté de « Aujourd'hui »

Bolt Food pose deux petites cartes au-dessus du bouton : *Last delivery 4.60 €*
et *Today 79.10 €*. La première ferme la boucle sur ce qu'on vient de faire ;
elle coûte une ligne et répond à une question qu'on se pose à chaque fin de
course.

### Ce que cette passe n'a PAS donné

Orange Money Agent est une app datée, sans leçon de forme — une seule chose à
en retenir, et elle confirme l'intuition : le solde y est une **barre
permanente en haut de l'accueil**, pas un écran qu'on visite.

---

## 9. La bascule disponible / indisponible, reprise (8 novembre 2026)

Première version jugée insatisfaisante, et le défaut était structurel : elle
avait **deux contrôles différents** pour une seule bascule — un `Button`
pleine largeur pour entrer, un `Toggle` de 50 px pour sortir. Deux objets à
apprendre, et le second assez petit pour partir tout seul au volant. C'était la
décision D4, qui posait « mettre en ligne est un CTA, sortir est un contrôle ».
L'intuition d'asymétrie était juste ; la façon de la rendre ne l'était pas.

### Ce que le corpus fait

| App | Entrer | Sortir |
|---|---|---|
| Bolt Driver | pilule colorée dans la barre | **la même pilule**, libellé inversé |
| Grab Driver | pilule noire à glyphe power | la même, « You're online » en dessous |
| Bolt Food Courier | bouton vert « Go online » | **le même bouton**, rouge « Go offline » |
| Yassir | carte + interrupteur | le même interrupteur |
| Heetch | pilule « ● Online » dans l'en-tête | la même |
| Wolt Courier | **« Slide to go online »** | — |
| Lyft | — | aucun contrôle visible : « You're online / We're looking for rides » est un **énoncé** |

**Aucune n'emploie deux objets différents.** C'est la leçon, et elle est
unanime là où mon D4 était isolé.

### Les trois pièces retenues

Elles viennent du code de vraies applications de chauffeur, pas de captures
marketing — donc d'implémentations, avec leurs raisons.

- **Un seul contrôle, deux efforts.** Tap pour se rendre disponible : c'est ce
  qu'on veut faciliter. **Maintien d'une seconde** pour en sortir, anneau qui
  se remplit et vibration, le tap court ne faisant rien. Un hors ligne
  accidentel ne se remarque pas — on attend des courses qui ne viennent pas.
  D'où `HoldButton`, pendant léger de `SlideToConfirm` : le glissé pour ce qui
  ne se défait pas, le maintien pour ce qu'on refait dix fois par jour.
- **Le libellé annonce le geste** — « Maintenir pour sortir ». Un tap qui ne
  fait rien se lirait comme une panne.
- **Sortir APRÈS la course en cours.** Le besoin est réel et **aucune des dix
  apps du corpus ne le couvre** : on veut s'arrêter, mais on a un Client à
  bord. Sans ça, le choix est entre rester disponible contre son gré et sortir
  en pleine course. Posé en lien sur l'écran de course.

### Ce qui a été relevé puis écarté

Un **retour arrière** après la sortie (bandeau + « Undo »), vu dans le code
d'une app de chauffeur — avec sa propre critique, d'ailleurs : l'undo y était
« du petit texte gris que rien ne désigne comme un bouton ». Il venait d'une
app où l'on sort d'un simple tap, et il y rattrape un accident. Le maintien
rend cet accident impossible ; empiler les deux garde-fous reviendrait à ne
faire confiance ni à l'un ni à l'autre. Et le `Toast` du système dit en toutes
lettres qu'il « ne demande rien » — y loger un bouton aurait contredit sa fiche.

_Amende la décision **D4**._
