# Benchmark Mobbin — Livraison (Fiw Client)

> Passe UX/UI menée le 12 juillet 2026 avant la construction du prototype Livraison
> (`apps/fiw/app/livraison/`). Objectif : caler chaque étape du flux sur les
> standards des meilleures apps de coursier/colis, en réutilisant le design system
> existant. Complète le benchmark Transport (cf. mémoire projet « redesign Mobbin »).

## Apps étudiées

| App | Flux | Pertinence pour Fiw |
|---|---|---|
| **Grab (Express)** | [Creating a delivery order](https://mobbin.com/flows/3484fed9-4d50-42b9-b887-e587a170fab2) · [Adding delivery details](https://mobbin.com/flows/bdcc6185-de1e-483f-966e-0169d7b8e75a) · [Entrée Express](https://mobbin.com/flows/b48950ce-db62-4a4b-a9a9-54b08edd8fb1) | Référence n°1 — flux complet le plus mûr (hub de détails, item details, review order) |
| **Gojek (GoSend)** | [GoSend](https://mobbin.com/flows/ad4273ae-b2e9-419f-bf6a-81c0f2d59632) · [Booking a GoSend](https://mobbin.com/flows/0ffc51ce-fa54-4d08-914a-ffe859591f45) · [Chat prestataire](https://mobbin.com/flows/ebad12a9-d764-498f-8c65-429080aaf2fa) | Type de colis en chips, protection, récap avec mini-carte, quick chat |
| **inDrive (Courier)** | [Courier delivery](https://mobbin.com/flows/c610d029-11d8-4bcb-9002-bdfb414c4882) · [Order details](https://mobbin.com/flows/b8ffd233-d882-4ee9-83c7-c8527cc1999b) · [Delivery protection](https://mobbin.com/flows/e1453bd9-da5e-4663-8954-bb8efcbdbc88) | Déjà référence du redesign Transport — code de confirmation de remise, moto vs auto |
| **inDrive (City to City)** | [Booking City to City](https://mobbin.com/flows/d32f8f7f-fdd7-4bba-9bb3-74492d160fa7) | Miroir Yobanté : interville, toggle Passager vs **Colis**, départ planifié |
| **Kakao T (Quick)** | [Vehicle guide](https://mobbin.com/flows/bf3d741e-9b2b-4d1d-887b-cd3c59ede7a9) · [Tiers de vitesse](https://mobbin.com/screens/2fbcb3d8-669f-4005-9825-523e45408984) | Tiers Éco / Standard (recommandé) / Express tarifés — analogue Express vs Groupée |
| **Shopee (SPX)** | [Suivi expédition](https://mobbin.com/flows/91d6b292-59fc-45ad-96e0-1ba0770132ea) · [Track driver](https://mobbin.com/flows/7ef69bab-a64c-4b7b-bce0-877d0ac70163) | Timeline horodatée + carte live + barre de progression 4 jalons (pattern Yobanté) |
| **Klarna** | [Tracking a delivery](https://mobbin.com/flows/55b055d1-bd89-4071-b021-15788b7eb4ed) | Détails colis : tracking number copiable, transporteur, poids |
| **Uber Eats (Courier)** | [Courier](https://mobbin.com/flows/790af66c-8204-430e-909c-8e651cbd991a) | Entrée service : « Send a package / Receive a package » |
| **Rappi** | [Deliver a package](https://mobbin.com/flows/2fea6e5e-ea84-44d8-804b-63d6fe00ed23) | Instructions par point (« What should the delivery person do at this location? ») |
| **Walmart / foodpanda / Uber Eats / Gopuff** | Preuve de remise ([Walmart](https://mobbin.com/screens/45eecb93-eba6-4b3b-8da0-efccf4671937), [foodpanda](https://mobbin.com/screens/7ffc3768-f384-4883-8b25-039404c50c61), [Uber Eats](https://mobbin.com/screens/2cf3635d-9f82-438c-b7f3-1d02b7f1bd84), [Gopuff](https://mobbin.com/screens/6869c8c0-3db6-4b75-9ce6-d94757099f2b)) | Photo de remise + progression jalonnée + notation dans la même carte |

Yango (concurrent direct) n'est pas indexé sur Mobbin ; Bolt n'y a pas de flux colis.

## Enseignements par étape du flux

### 1. Entrée service & itinéraire

- **Grab Express** accueille avec la pile A→B (`collecte` / `Deliver to?`) immédiatement
  + raccourcis (adresses fréquentes, commandes enregistrées « Saved bookings » avec
  résumé `Instant · S · 1kg`). La saisie d'adresse réutilise le pattern carte + confirmation.
- **Gojek** : « Deliver a package to… » + adresses enregistrées + « Request location »
  (demander sa position au destinataire — idée forte pour Dakar, hors périmètre v1).
- **Uber Eats Courier** distingue **Envoyer** vs **Recevoir** un colis dès l'entrée.
- → **Fiw** : la tuile Livraison de l'accueil ouvre le même morph de recherche que
  Transport (feuille montée + champs De/À), relabellisé **Collecte / Livraison**,
  puis route vers `livraison/configure`. Cohérence inter-services = force du modèle Fiw.

### 2. Description du colis

- **Gojek** : type de colis en **chips** (Food, Clothes, Document, Medicine, Books,
  Others) avec validation « Please select package type » — plus rapide qu'un champ libre.
- **Grab (Item details)** : taille **S/M/L/XL** + poids, **photo optionnelle**,
  type d'objet en chips, lien « What's prohibited? », garantie à 3 niveaux.
- **inDrive** : champ libre « What to deliver » optionnel (0/200) — friction minimale.
- → **Fiw** : chips de type (Document · Repas · Vêtements · Médicaments · Autre) +
  taille S/M/L + description libre optionnelle. Pas de garanties payantes en v1.

### 3. Contacts & instructions

- **Grab (Pickup details)** : par point — étage/porte, nom du contact, téléphone,
  note au prestataire, case « Save this place ».
- **inDrive** : téléphones expéditeur + destinataire dans une même feuille compacte,
  toggle **« To building / To door »**.
- **Rappi** : une question par écran (« What should the delivery person do at this
  location? ») — clair mais trop segmenté pour notre feuille groupée.
- → **Fiw** : rangée « Destinataire » **dans la même section que le colis** (itération
  post-test user du 12 juil.). L'expéditeur est le compte connecté (pas de resaisie).
  Le destinataire reçoit les notifications de suivi.

**Complément (itération contacts, 12 juil.)** — choisir le destinataire depuis le
répertoire plutôt que le resaisir :
- [Careem « Select a recipient »](https://mobbin.com/flows/52ebc24f-68ea-4485-bf4f-585b86ec2a89) :
  **liste de contacts + recherche « Search name or number » + « Add a new recipient »**
  épinglé en bas — le pattern retenu pour Fiw (liste d'abord, saisie manuelle en repli).
- [Uber « Who's receiving the package? »](https://mobbin.com/screens/8adae7a2-c979-45ce-b89f-229f011b223a) :
  champs nom/téléphone avec bouton « Contacts », et **toggle « Confirm with PIN »**
  qui valide notre code de remise.
- [Gojek](https://mobbin.com/screens/2e6fe4da-8fe7-43df-a0e0-292b395543a8) / foodpanda :
  icône répertoire dans le champ + « Use my details » — variante champ-d'abord, écartée
  (le user Fiw veut contacts d'abord).

### 4. Mode : Express vs Livraison groupée

- **Grab (Delivery type)** : feuille à 3 tiers — Instant (« pickup within 30 mins,
  dropoff within 90 mins ») / 4 Hours (moins cher) / Priority — chaque tier porte
  **sa promesse temporelle et son prix « From S$X »**, sélection = contour vert.
- **Kakao T** : Éco / Standard (badge « recommandé ») / Express, prix barrés,
  et tabs **Pick up now / Réserver**.
- **Grab (When should we pick it up?)** : « Now (30 min or less) S$30.10 » vs
  créneaux « Today 21:00–21:30 S$16.40 » — **le différé est explicitement moins cher**.
- → **Fiw** (aligné Product Doc « B — Détection automatique », itération 12 juil.) :
  le choix **Option A (normale, prix standard, départ immédiat) vs Option B (groupée,
  prix réduit, départ dès 2 commandes confirmées)** n'est **pas un réglage de
  configuration** — c'est une **proposition détectée par l'algorithme pendant la mise
  en relation** (comme les frais de rapprochement), présentée avec le pattern
  OptionCard symétrique à delta héros. Le hub searching Livraison a donc **4 issues** :
  near / far (frais) / **groupage** / none. Option B choisie → état d'attente du seuil
  (« En attente d'un 2e colis… », barre de progression, 1/2 commandes confirmées,
  10 min max) avec deux dénouements (Product Doc « C — Minimum garanti ») :
  **groupage confirmé** (bannière + économie) ou **seuil non atteint** (bannière
  d'avertissement → livraison simple au prix normal). L'écran `options` n'affiche
  que le prix standard.

**Complément (itération « Quand ? », 12 juil.)** — sélection d'heure seule, à la roue :
- [Lyft « Schedule a ride »](https://mobbin.com/flows/cd710f06-a8c7-46cd-81ab-bd716811c341) :
  **roue avec bande de sélection surlignée au centre** traversant les colonnes +
  récap live sous la roue (« Drop-off: 5:05 PM ») — le pattern retenu.
- [Opal](https://mobbin.com/screens/020ac787-518c-4c9b-95ba-0810ea766ae1) / WHOOP /
  Ten Percent Happier : items **fondus et réduits** loin du centre, un seul CTA.
- inDrive (Departure time) / Uber : raccourci « Now »/« Skip » à côté de la roue.
- → **Fiw** : composant `WheelPicker` (snap, fondu, tick haptique) + bande unique
  façon Lyft, pilule **« Maintenant »** en raccourci, CTA « Livrer à HH:MM ».
  Remplace la liste de créneaux Grab de la v1.
- **Décision finale (12 juil.)** : le « Quand ? » et le Total figé sont **retirés
  d'`options`** — dans le modèle Détection automatique, le départ est immédiat et
  le prix définitif se joue pendant la mise en relation (groupage/frais) ; le prix
  standard vit sur les cartes gamme. `WheelPicker` reste au design system
  (heure de départ Yobanté v2).

**Complément (writing & icônes de la proposition, 12 juil.)** — réf.
[Uber Eats « Delivery Options »](https://mobbin.com/screens/9bca8a9a-c712-44cb-9f49-4e77394e67de) :
**un bénéfice par ligne, pas de paragraphe** (« Priority · Delivered directly to
you » / « Standard · 10–20 min »), une **icône sémantique distincte par option**
(éclair Priority, coursier Standard, calendrier Schedule), jamais dupliquée entre
carte et chip. → Fiw : titres **« Directe » / « Groupée »**, icônes `send`
(PaperPlaneTilt, envoi direct) et `merge` (ArrowsMerge, trajets qui fusionnent),
vocabulaire client **« colis voisin »** (« groupage » reste interne), note réduite
à la seule garantie : « Pas de colis voisin d'ici 10 min ? Le vôtre part seul, au
prix normal. »

### 5. Récapitulatif & prix avant confirmation

- **Grab (Review Order)** : véhicule + colis résumés en lignes tappables, paiement,
  notice « Prepare your parcel now! » (attente possible avant affectation), total + CTA.
- **Gojek (récap)** : expéditeur/destinataire avec téléphone en pastille, distance
  totale, **mini-carte de l'itinéraire**, prix barré si réduction.
- → **Fiw** : la feuille configure garde le modèle GroupedSheet (cartes pleine
  largeur) : Itinéraire (RouteCard) · Colis · Destinataire · Gamme · Mode · Paiement ·
  Total + CTA. La carte est déjà derrière la feuille (pas besoin de mini-carte).

### 6. Recherche d'un prestataire

- **inDrive** : « Finding couriers… » + offre de prix ajustable (hors modèle Fiw, prix fixés).
- → **Fiw** : réutilisation du **hub searching Transport** (4 issues : near / far A-B /
  busy C / aucun) avec copies Livraison. La mécanique frais de rapprochement
  s'applique aussi à la Livraison (cf. feature-list) — rien à réinventer.

### 7. Suivi actif

- **Shopee (SPX Instant)** : carte live + **barre de progression segmentée à 4 jalons**
  (collecte → transit → livraison → remise) + timeline horodatée dans la même feuille.
- **Gojek** : carte prestataire (photo, véhicule, note) + **quick chat** (réponses
  préenregistrées) — notre écran chat Transport couvre déjà ce besoin.
- **Walmart** : progression « Placed → Shopping → On the way → Delivered » en ligne.
- → **Fiw** : feuille de suivi à sections étiquetées (pattern course-active/Waymo) :
  statut + jalons segmentés en tête, carte prestataire (VehicleBlock), carte Colis
  (type + code de remise), carte Détails (itinéraire, prix, paiement). Deux phases
  carte : route vers la collecte, puis route collecte → livraison (LeafletMap `route`).

### 8. Remise & preuve

- **inDrive (Delivery protection)** : **code à 4 chiffres** envoyé au destinataire ;
  le prestataire doit l'obtenir pour clôturer — « How it works » en 3 points.
- **Uber Eats / foodpanda / Walmart** : **photo de la remise** en pleine largeur ou
  vignette « Your rider left a photo of the drop-off spot ».
- → **Fiw** : v1 = **code de remise à 4 chiffres** affiché côté client pendant le
  suivi (« Communiquez ce code au destinataire ») + confirmation de remise par le
  prestataire. Cohérent avec « Confirmation remise (numéro de suivi) » du périmètre
  validé, et moins coûteux qu'une photo en proto. Photo = piste v2.

### 9. Clôture

- **Walmart / foodpanda** : remise confirmée, reçu, notation dans la même vue,
  progression complète rejouée.
- → **Fiw** : réutilisation de `ReceiptCard` + notation (pattern cloture Transport),
  avec ligne « Livraison groupée » ou « Frais de rapprochement » le cas échéant.

### 10. Yobanté (documenté, hors périmètre v1)

- **inDrive City to City** : tabs de catégories (Moto / Couriers / Freight / City to
  City), **toggle Passager vs Colis**, villes De/À, « When » (roue date/heure),
  tarif recommandé. Structure de configuration directement transposable.
- **Shopee + Klarna** : timeline multi-jalons horodatée + numéro de suivi copiable —
  le pattern d'affichage des legs Yobanté (`Récupéré → En route → Arrivé en ville →
  Livraison finale → Remis`) et du `YOB-AAAAMMJJ-XXX`.

### 2 bis. Architecture d'information de la section colis (bench multi-agents, 12 juil.)

Workflow de 5 agents Mobbin (angles : coursiers SEA, coursiers globaux, sélecteurs
de taille, divulgation progressive, hiérarchie de formulaire) + synthèse. Moves
retenus, appliqués à `configure` :
1. **Le requis se marque sur le label de groupe** (« Type de colis * », « Taille * »,
   astérisque `error`), label au-dessus du contrôle — pattern unanime Grab/Gojek/
   Shopee/foodpanda. Fin du label « Taille » flottant.
2. **Chips de type sur une seule ligne à défilement horizontal**, coupée au bord de
   la carte pour signaler le scroll (Grab « Item type », Shopee) — fin du wrap 3 lignes.
3. **L'objet-repère entre dans chaque tuile de taille** (S « Tient dans une main » /
   M « Comme un carton à chaussures » / L « Se porte à deux mains ») — Shopee, Kakao T,
   Vinted, InPost. Le hint dynamique post-sélection était un anti-pattern.
4. **Le destinataire vide = rangée-action bleue** « Ajouter le destinataire * »
   (Grab hub, Shopee Kirim) ; rempli = résumé compact nom + numéro.
5. **La note SMS s'ancre sous la rangée destinataire** qu'elle explique (Uber,
   DoorDash) — jamais orpheline en fin de carte.
6. **L'optionnel descend en dernier, affaibli** : « Ajouter une description
   (facultatif) », texte tertiaire, sans chevron (Grab « Add a note to driver »).
Ordre final : Type* → Taille* → hairline → Destinataire* (+ note SMS) →
Description (facultatif). Règles généralisées dans `docs/style-guide.md`
(section « Formulaires »). Risques suivis : découvrabilité du scroll horizontal
en test terrain (plan B : grille 2 lignes), objets-repères à valider à Dakar.

## Décisions UI (design system)

**Réutilisés tels quels** : GroupedSheet (cartes pleine largeur, poignée flottante),
`RouteCard`, `ScreenHeader`, `ReceiptCard`, `Button` (4 variantes), `PlaceRow`,
OptionCard « delta héros » (Option A/B), hub searching, `VehicleBlock`/plaque en
pastille, écrans appel masqué + chat, machine 3 crans `useSnapSheet` si besoin.

**Nouveaux composants justifiés par le benchmark** :
- `ChipGroup` — sélection de type/taille de colis (Gojek, Grab). Générique,
  réutilisable (types de problème Assistance, filtres Historique).
- `StepProgress` — jalons segmentés horizontaux du suivi (Shopee, Walmart, Gopuff).
  Réutilisable pour Yobanté (legs) et Assistance.
- `CodePill` — code de remise à 4 chiffres en gros caractères (inDrive).

## Périmètre prototype v1 (décision)

**Inclus** : flux Livraison intra-Dakar complet — accueil (tuile activée) →
itinéraire Collecte/Livraison → `configure` (colis, destinataire, gamme Vélo
Express / Moto Livraison, mode Express vs Groupée, paiement, total) → `searching`
(hub 4 issues réutilisé) → `suivi` (2 phases carte, jalons, code de remise) →
`cloture` (reçu + avis). Livraison planifiée en version légère (Maintenant /
créneaux différés, pattern Grab).

**Hors périmètre v1** (documenté ci-dessus pour la suite) : Yobanté (flux dédié),
photo de preuve de remise, multi-stops, « Request location » du destinataire,
garanties/assurance colis.

## Note vocabulaire

Le couple normale/groupée est bien présenté comme **Option A / Option B**
(CONTEXT.md : la Livraison groupée « est proposée comme Option B ») avec la même
grammaire visuelle que les frais de rapprochement. Les deux binômes vivent tous
deux dans `searching` mais dans des **issues mutuellement exclusives** du hub
(far → frais de rapprochement ; groupage → normale/groupée) — jamais dans la
même feuille, pas de collision à l'écran.
