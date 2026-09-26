# Audit de maturité — les flux de l'app Fiw (Client)

_13 septembre 2026. Lecture intégrale de `apps/fiw/` (38 écrans, 14 719 lignes) confrontée à un
benchmark Mobbin de la catégorie : inDrive, Bolt, Careem, Grab, Freenow, Lyft, Gojek/GoSend,
Uber Courier, Shopee/SPX, Glovo — plus, pour l'affiliation, la fidélité et le retrait d'argent,
KOHO, Airalo, Satispay, adidas, Alan, MoonPay, Cash App, Lightyear._

Ce document ne juge pas la qualité d'exécution visuelle : elle est haute et documentée ailleurs
(`design-system-inventory.md`). Il juge **si le raisonnement a eu lieu** — objets, états,
échecs, contenu — flux par flux.

---

## 1. Le tableau

Échelle : **Mûr** (pensé, benchmarké, ses états et ses échecs traités) · **Solide** (le chemin
heureux tient, des états manquent) · **Esquissé** (les écrans sont posés, le raisonnement n'a pas
eu lieu) · **Absent** (l'entrée existe et ne mène nulle part).

| # | Flux | Écrans | Maturité | Ce qui manque en une phrase |
|---|------|--------|----------|------------------------------|
| A | Onboarding & authentification | 2 | **Esquissé** | C'est une page de connexion, pas un onboarding : aucun moment où un Client devient quelqu'un. |
| B | Accueil & recherche d'itinéraire | 1 (3 modes) | **Mûr** (forme) / **Esquissé** (structure) | L'interface ignore qu'une Commande puisse être en cours. |
| C | Transport — configurer | 1 | **Solide** | Le prix est une constante, et le Repère décidé en ADR 0009 n'y est pas. |
| D | Transport — mise en relation | 1 (4 phases) | **Esquissé** ⚠️ | L'écran le plus sensible du produit contredit `CONTEXT.md` et n'explique jamais le « pourquoi ». |
| E | Transport — course active | 3 | **Solide** | La sécurité est une tuile dans un tiroir replié, et le SOS part au premier tap. |
| F | Transport — clôture & Avis | 1 | **Esquissé** | La note est pré-remplie à 5 et le vocabulaire d'une mauvaise course n'existe pas. |
| G | Livraison — planifier | 1 | **Solide** | Le Colis n'est pas modélisé : ni contenu, ni poids, ni valeur, ni interdits. |
| H | Livraison — mise en relation | 1 (6 phases) | **Mûr** | Le meilleur automate du corpus ; il lui manque le « pourquoi » et le délai d'attente. |
| I | Livraison — suivi | 1 | **Solide** | Le destinataire n'a aucune expérience, et il n'y a pas de preuve de remise. |
| J | Historique | 2 | **Esquissé** | Une app multi-services avec un historique mono-service, sans annulations ni « refaire ». |
| K | Compte & Sécurité | 8 | **Mûr** | Les trois actions terminales sont des `Alert.alert` en attente de branchement. |
| L | Affiliation (Affilié Réseau) | 13 | **Esquissé** ⚠️ | Le plus grand nombre d'écrans, la plus faible profondeur — et c'est le flux qui manipule de l'argent. |
| M | Fidélité | 0 | **Absent** | Une rangée de sidebar avec un badge « 240 pts » et pas de `onPress`. |
| N | Aide & support | 0 | **Absent** | Une rangée de sidebar sans `onPress`, là où toute la catégorie a une destination de plein droit. |

**Le constat d'ensemble** : la maturité d'un flux est **exactement corrélée** à l'existence d'un
benchmark écrit et d'une session de grilling. Compte (benchmark + grilling → **Mûr**), Livraison
(benchmark → **Mûr/Solide**), Transport (breadboard de juin, jamais benchmarké après → **Solide/
Esquissé**), Affiliation (breadboard de juin, jamais rouvert → **Esquissé**), Fidélité et Support
(rien → **Absent**). Ce n'est pas une coïncidence, c'est le mode d'emploi de ce qui vient.

---

## 2. La grammaire commune de la catégorie

Ce que les dix applications font toutes, et qui sert d'étalon dans la suite.

1. **La Commande en cours est un objet de premier plan.** Freenow ouvre son onglet _Trips_ sur
   « In progress », avant l'historique. inDrive, Bolt, Careem ramènent à la course active depuis
   n'importe où. **Fiw n'a rien de tel** — voir §4.1.
2. **Le prix se justifie.** Grab affiche prix + prix barré + ETA + nombre de places + sous-options
   par gamme ; inDrive met un lien « Why is this offer the best? » qui ouvre une feuille
   _Quick arrival / Price / Vehicle type_. **Une hausse de prix n'est jamais assénée.**
3. **Le point de prise en charge se décrit.** Bolt : « Any pickup notes? » sur l'écran d'arrivée.
   Grab : « Add pickup details (e.g. near the gate) ». Glovo : « Sending to someone else? Add their
   details to help the courier ». **C'est le Repère de l'ADR 0009 — la catégorie le met dans la
   commande, pas dans les réglages.**
4. **La sécurité est une pastille sur la carte, pas un item de liste.** Careem, Bolt et Grab
   posent un chip « Safety » bouclier **sur la carte**, visible en permanence. Derrière :
   consignes · partager la course · signaler · et **« Appeler la police »** en action rouge
   distincte. Gojek y ajoute « votre course est assurée » ; Grab, l'enregistrement audio.
5. **L'aide part d'une course.** Bolt, Freenow et inDrive ouvrent tous sur « Get help with a
   recent ride » (annulations comprises), puis une arborescence d'articles, puis un fil de
   conversation avec un inbox de dossiers ouverts.
6. **L'historique est actionnable.** inDrive : Reçu · Support · **Refaire la course** · **Trajet
   retour** · Supprimer. Freenow : Facture · Chauffeur · Aide, regroupé par mois avec total
   mensuel, onglets Perso/Pro. Les deux affichent les courses **annulées**.
7. **Programmer se propose dans le champ de destination.** Freenow, Grab et Lyft mettent tous une
   pastille « Later »/calendrier **dans** le champ « Où allez-vous ? », pas dans un menu.
8. **Le colis se déclare.** Gojek rend le type obligatoire (erreur en ligne), ajoute le poids et
   trois niveaux d'assurance ; Shopee marque destinataire et détails d'un astérisque rouge ;
   Glovo affiche les interdits avant tout le reste.
9. **Un programme d'affiliation s'explique.** KOHO, Airalo et Satispay ont tous les mêmes pièces :
   états du tunnel (En attente / Confirmé / Expiré / Tous), compteurs (gagné / inscrits / validés),
   règles en toutes lettres, et **une FAQ**. Aucun ne se contente d'une promesse et d'un code.
10. **Un retrait se prouve.** MoonPay : raccourcis 25/50/75/Max, puis _Total à payer / Frais /
    **Vous recevrez**_. Careem : statut du transfert + **numéro de référence** + « Something wrong?
    Get help ». Lightyear et Cash App : **une date et une heure d'arrivée**, jamais « bientôt ».

---

## 3. Flux par flux

### A. Onboarding & authentification — _Esquissé_

`app/index.tsx` · `app/otp.tsx`

**Ce qui est là, et qui est bon** : le champ téléphone avec sélecteur de 200 pays et formatage par
pays est du travail sérieux, au-dessus de la moyenne de la catégorie. L'OTP auto-valide à 4
chiffres.

**Ce qui manque** :

- **« Se connecter » et « Créer un compte » mènent au même écran.** Il n'existe aucun parcours de
  création : ni prénom, ni e-mail, ni photo. `CLIENT.name` est figé à « Mamadou Diallo » dans
  `data.ts`. Lyft demande le prénom avec la raison (« Drivers will only see your first name ») ;
  Freenow demande prénom + nom + e-mail en « Complete your profile ». **Il n'y a nulle part, dans
  Fiw, un moment où un Client devient quelqu'un.**
- L'écran OTP affiche en dur `+221 77 000 00 00` au lieu du numéro saisi. Erreur de contenu visible
  au premier test terrain.
- **Aucun état d'erreur** : `verify()` réussit toujours. Pas de code faux, pas de code expiré.
- « Renvoyer le code » est `onPress={() => {}}`. Pas de minuteur, pas de compte à rebours — la
  catégorie entière en a un.
- **Aucune demande de permission.** Ni géolocalisation ni notifications, alors que toute l'app
  repose sur la première (« Ma position actuelle » est une chaîne de caractères) et que deux écrans
  supposent la seconde. Lyft, Grab et Freenow amorcent chacune la permission avec un écran de
  motivation avant la boîte système.
- **Aucune granularité de consentement.** Freenow présente quatre interrupteurs séparés avec leur
  texte légal (offres, études, publicité, **position en direct**) et un « I agree to all ». Fiw a
  une ligne de `caption` sous le bouton.
- Pas de confirmation de ville (inDrive : « Are you in <ville> ? »), pas d'OTP par WhatsApp
  (inDrive le propose avec un lien « Open WhatsApp » — **à considérer sérieusement à Dakar**, où la
  délivrabilité SMS est inégale et WhatsApp omniprésent).

### B. Accueil & recherche d'itinéraire — _Mûr sur la forme, Esquissé sur la structure_

`app/home.tsx` (1 228 lignes)

C'est l'écran le mieux fabriqué de l'app, et de loin : feuille à trois crans sur primitif partagé,
morphing sur place services ↔ recherche, timeline Figma Motion transcrite à l'entrée **et à la
sortie**, « Réduire les animations » respecté, choix d'un point sur carte, tiroir avec geste de
bord, Lieux enregistrés lus depuis le store.

**Ce qui manque** :

- **Aucune reprise de Commande en cours** (voir §4.1) — le trou structurel principal.
- Les deux rangées « récents » du bas poussent **toujours** `/transport/configure`, quel que soit le
  service auquel on pensait.
- **Aucune surface promotionnelle.** Lyft met la promo au-dessus du champ de recherche ; Careem a
  une carte « Add a promo code — Enjoy personal offers » ; Grab a une rangée Offers. Fiw n'a pas de
  notion de code promo, alors que la Fidélité est au périmètre.
- **Aucune entrée « programmer »** dans le champ de destination (§2.7). `WheelPicker` a été
  construit pour ça puis descopé ; il dort dans `components/` sans appelant.
- Pas de raccourcis Maison/Travail au repos : ils n'apparaissent qu'une fois en mode recherche.
  Freenow et Lyft les montrent d'emblée, avec l'invitation « Set home address » quand ils sont
  vides — exactement le motif que `compte/lieux.tsx` a déjà inventé, mais une page plus loin.
- Le départ est la chaîne « Ma position actuelle ». Pas d'étape « confirmer le point de prise en
  charge », là où Grab nomme des points réels et offre d'y ajouter une précision.

### C. Transport — configurer — _Solide_

`app/transport/configure.tsx`

**Bon** : l'itinéraire éditable, le switcher Classique/Covoiturage, les frais d'attente **annoncés
avant de commander** (rare et honnête — la catégorie les cache généralement), la rangée de paiement
pleine largeur au-dessus du bouton (benchmark correct, commenté dans le code).

**Ce qui manque** :

- **Le prix est une constante.** `basePrice` ne dépend ni de la distance ni de l'heure. Le nombre le
  plus important de l'application est figé dans `data.ts`. Aucune distance, aucune durée estimée
  n'apparaît nulle part dans le flux. Grab affiche par gamme : prix, prix barré, ETA, places,
  sous-options dépliables, et une infobulle explicative.
- **Le Repère n'est pas dans la Commande.** L'ADR 0009 dit : « Porté par un point — départ **et**
  arrivée — de la Commande, Transport **et** Livraison ». Dans le code, `repere` n'existe que sur
  `compte/lieu.tsx`. Un Client qui commande vers une adresse ponctuelle n'a aucun moyen de dire au
  Prestataire comment la reconnaître. **C'est une décision prise et non appliquée**, sur le point
  qui justifiait l'ADR (la numérotation dakaroise incomplète).
- Pas de code promo, pas de conversion de Points Fidélité, pas de programmation — les trois vivent
  normalement dans la rangée de confirmation (Grab : paiement · Offers · ··· ; Shopee : Voucher ·
  Coins · Paiement).
- Covoiturage : la `GammeCard` est `selected` avec `onPress={() => {}}` — une carte qui a l'air
  tappable et ne l'est pas. Et l'économie du covoiturage (prix par passager ? que se passe-t-il si
  personne ne partage ?) tient en une phrase de corps de texte, sans état pour « aucun
  co-passager ».
- Pas de nombre de passagers, pas de « commander pour quelqu'un d'autre » (Lyft : « Change rider »),
  pas de filtres d'accessibilité (Grab : onglets Wheelchair / Pet / Kid Friendly).

### D. Transport — mise en relation — _Esquissé_ ⚠️ **priorité n° 1**

`app/transport/searching.tsx`

C'est l'écran que `MEMORY.md` désigne comme le prochain jalon de test terrain. C'est aussi celui où
le raisonnement manque le plus.

**Bon** : le radar, la barre de progression, et surtout **la ligne de statut qui évolue**
(« On repère les chauffeurs autour de vous. » → « Votre demande part vers les plus proches. » →
« En attente d'une confirmation… ») — c'est du bon travail de contenu, qui donne un sens à
l'attente. La preuve sociale (pile d'avatars + « 6 prestataires à proximité ») aussi.

**Le problème de fond — la définition et l'écran ne disent pas la même chose** :

> `CONTEXT.md`, entrée **Frais de rapprochement** : « Toujours présenté comme un **choix binaire**
> (Option A / Option B), jamais imposé. »

L'écran présente **une seule issue** : une carte « Total à payer », puis « Continuer » ou « Annuler
la commande ». `MEMORY.md` (14 août) en a pris acte — « l'Option A/B reste l'autre présentation » —
mais `CONTEXT.md` n'a jamais été amendé, `RapprochementChoice.tsx` (le composant A/B) dort sans
appelant, et le code continue de transporter `selectedOption = 'A' | 'B'` jusqu'au reçu.
**Le glossaire canonique et le prototype se contredisent sur l'écran le plus sensible
commercialement — celui-là même qu'on s'apprête à tester.** À trancher avant tout test.

**Et il manque le « pourquoi »** :

- La feuille affirme « Un frais de rapprochement couvre leur trajet jusqu'à vous » et montre un
  nombre. Il n'y a **aucun moyen de poser la question** : pas de distance, pas de durée, pas
  d'explicatif. inDrive met un lien « Why is this offer the best? » qui ouvre une feuille en trois
  points. Careem écrit « Fare includes pickup journey » en bandeau vert.
- **On ne sait pas qui vient.** inDrive montre la photo du chauffeur, sa note, ses 730 courses et
  **cinq avis** avant qu'on accepte. Fiw demande 350 F de plus pour un anonyme.
- **Aucun délai d'expiration.** La recherche dure 11 s puis résout, toujours. Pas de « ça prend plus
  de temps que prévu », pas de « on élargit la recherche », pas d'annulation avec conséquence.
- **Aucun prestataire** : le repli est câblé en dur Moto ↔ Auto. Pas de « réessayer dans X min »,
  pas de « prévenez-moi », pas de repli vers une course programmée.
- Deux des trois issues ne sont atteignables que par l'interrupteur de démo : elles n'ont jamais été
  jouées dans une séquence réelle.

### E. Transport — course active — _Solide_

`app/transport/course-active.tsx` · `call.tsx` · `chat.tsx`

**Bon, et même très bon** : une seule instance de carte pour toute la course (le véhicule garde
position et cap d'une étape à l'autre), feuille à trois crans épousant son contenu, le cran replié
montre déjà chauffeur **et** véhicule, la bannière de frais d'attente avec compte à rebours de
grâce puis accumulation en direct, la feuille d'annulation qui dissuade correctement (action
primaire = garder), l'appel masqué avec « Appel masqué · via Fiw ».

**Ce qui manque, par ordre de gravité** :

1. **Le SOS n'est pas gardé.** Un tap sur la tuile « Urgence » affiche immédiatement « Alerte SOS
   envoyée ». Pas de confirmation, pas d'appui long, pas de choix, pas d'annulation de fausse
   alerte. Toute la catégorie le garde : Bolt ouvre un « Safety toolkit » à trois choix distincts
   (**Appeler la police** / Contacter le support sécurité / Partager la course) ; Careem met
   « Call the police » en gros bouton rouge sous trois tuiles ; Grab sépare « I Need Police /
   Ambulance » du reste. **C'est le défaut de conception le plus sérieux de l'app.**
2. **La sécurité est enterrée.** La tuile vit dans le **corps** de la feuille — invisible aux crans
   replié et milieu, qui sont ceux où la feuille se trouve par défaut. Careem, Bolt et Grab posent
   une pastille bouclier **sur la carte**, toujours atteignable.
3. **Le partage de trajet et les Contacts de confiance ne se connaissent pas.** `compte/securite.tsx`
   règle « Partager mon trajet au départ » dans un store ; `course-active.tsx` ne le lit jamais et
   partage une URL fabriquée à partir de la plaque. Deux moitiés d'une même fonctionnalité, chacune
   complète de son côté, jamais reliées.
4. Pas de modification de destination ni d'ajout d'arrêt en cours de route (Careem met un crayon sur
   la ligne de destination pendant la course).
5. La pastille « J'arrive » est `onPress={() => {}}`.
6. Le Prestataire reste une silhouette : initiales, pas de photo, pas de « 1 243 courses », pas
   d'avis.

### F. Transport & Livraison — clôture et Avis — _Esquissé_

`app/transport/cloture.tsx` · `app/livraison/cloture.tsx`

**Bon** : le reçu avec ses lignes conditionnelles (frais de rapprochement, frais d'attente), le ✕
en en-tête comme échappatoire plutôt qu'un lien gris sous le bouton — ce choix est benchmarké et
commenté, c'est juste.

**Ce qui cloche** :

- **La note est pré-remplie à 5 étoiles** (`useState(5)`). La réponse par défaut est la flatteuse ;
  un Client qui tape « Envoyer » sans réfléchir a noté 5. Ce n'est pas qu'un problème d'UX : la
  Note du Prestataire alimente le Statut prestataire, donc l'attribution des courses. **On fausse
  la donnée à la source.**
- **Les tags rapides sont exclusivement positifs.** Mettez 2 étoiles : on vous propose toujours
  « Très sympa / Bonne conduite / Ponctuel ». **Il n'existe aucun vocabulaire pour une mauvaise
  course**, ni chemin de signalement en dessous de 3.
- Pas de pourboire. Pas de « signaler un problème » ni de contestation de prix. Pas d'export de
  reçu (Freenow : « Invoice » ; inDrive : « Receipt »). Pas de notation différée.
- Les deux clôtures sont **deux fichiers quasi jumeaux** (~230 lignes chacun, 90 % identiques). Tout
  changement futur devra atterrir deux fois.

### G. Livraison — planifier — _Solide_

`app/livraison/configure.tsx`

**Bon** : la fusion des deux feuilles en une (décision documentée et juste), le destinataire en
contacts-d'abord avec recherche et repli manuel (benchmark Careem correct), un seul champ requis,
l'itinéraire dans l'en-tête pour rester visible feuille repliée.

**Le risque de fond — le Colis n'est pas modélisé.** Le type et la taille ont été retirés le 2 août
comme une simplification de formulaire. La catégorie entière fait l'inverse : Gojek rend le type
**obligatoire** avec erreur en ligne, ajoute le poids total et **trois niveaux d'assurance** ;
Shopee marque destinataire et détails d'un astérisque rouge ; Glovo affiche les interdits en
bandeau avant tout le reste. Les conséquences de la décision Fiw n'ont jamais été traitées :

- pas de valeur déclarée, donc pas d'indemnisation possible ;
- pas de contrôle de poids contre la capacité annoncée par la gamme (5 kg / 20 kg) ;
- pas de politique d'objets interdits ;
- **un Prestataire qui accepte une Mission sans savoir ce qu'il transporte.**

La décision est peut-être la bonne pour Dakar. Mais elle a été prise comme une décision de
formulaire, pas comme une décision de responsabilité — et c'est cette seconde moitié qui reste à
concevoir.

**Le reste** : pas de Repère (même trou qu'en C), pas de programmation, pas de bon de réduction,
et **le destinataire n'est jamais prévenu** — rien ne lui dit qu'un colis arrive ; le code de
remise ne lui parvient que si l'expéditeur pense à le partager depuis l'écran de suivi. Uber
Courier propose une seconde direction, « Receive a package », que Fiw n'a pas.

### H. Livraison — mise en relation — _Mûr_

`app/livraison/searching.tsx`

Le meilleur automate du corpus : quatre issues (proche / loin / groupage / aucun), la Livraison
groupée proposée en Option A/B avec un « delta héros », un état d'attente du seuil avec compteur
1/2 et progression, et **les deux dénouements traités** (seuil atteint → bandeau + économie ; seuil
manqué → bandeau + prix normal). C'est exactement le niveau de soin qui manque ailleurs.

**Une asymétrie à trancher** : cet écran conserve un vrai choix Option A / Option B pour le
groupage, pendant que son jumeau Transport a abandonné l'Option A/B pour les frais. Deux écrans
frères disent désormais « l'algorithme a trouvé quelque chose, à vous de choisir » dans deux
grammaires différentes.

### I. Livraison — suivi — _Solide_

`app/livraison/suivi.tsx`

**Bon** : trois jalons avec remplissage continu du segment, le code de remise révélé au bon moment
(quand le colis roule vers le destinataire, pas avant), le partage du code avec un message préparé,
l'annulation gratuite limitée à l'avant-collecte et dite comme telle.

**Ce qui manque** : aucune expérience côté destinataire (le lien de suivi partagé est fabriqué),
aucune preuve de remise (photo, signature), aucun chemin « colis non remis », aucune réclamation.
Même SOS enterré, même pastille « J'arrive » morte.

### J. Historique — _Esquissé_

`app/history/index.tsx` · `app/history/[id].tsx`

**Bon** : l'objet oublié passe par le service client via la plaque, jamais par un appel direct au
Prestataire. La décision est juste et bien argumentée dans le code.

**C'est l'écart le plus large avec la catégorie** :

- **Transport uniquement.** Titre « Historique », vide « Aucune course pour le moment », icônes
  voiture/moto, source `COURSE_HISTORY`. **Une Livraison n'atterrit jamais dans l'historique.** Une
  app multi-services avec un historique mono-service.
- Pas de regroupement par date (Freenow groupe par mois avec le total mensuel), pas de filtre, pas
  de recherche, pas de pagination.
- **Pas de courses annulées.** Bolt et inDrive les affichent explicitement (« Cancelled ») — c'est
  l'état qu'on vient le plus souvent chercher.
- **Pas de « Refaire cette course » ni de « Trajet retour ».** inDrive : Reçu · Support · Refaire ·
  Retour · Supprimer. Freenow : Facture · Chauffeur · Aide. Fiw n'a qu'une action, le bouton
  « objet oublié », qui bascule un booléen.
- Pas de vignette de carte, pas de durée, pas de distance, pas d'horodatage par point — inDrive et
  Freenow montrent les quatre.

### K. Compte & Sécurité — _Mûr_

`app/compte/` (8 écrans)

**C'est le flux le plus abouti, et c'est le seul qui ait eu un benchmark écrit + une session de
grilling.** Ça se voit partout : stores vivants pour que les résumés du hub ne puissent pas
diverger ; la rangée de Lieu enregistré à deux états (« Ajouter une adresse » / « Ajouter un
Repère ») qui montre l'absence plutôt que le contenu — c'est de la vraie pensée ; la fiche de lieu
en deux temps (carte puis détails) ; le changement de numéro avec re-vérification SMS ; une
grammaire unique sur huit écrans après l'audit P5/P11.

**Ce qui manque** : les trois actions terminales sont des stubs — lier un numéro Mobile Money
(« Saisie du numéro à brancher »), ajouter un Contact de confiance (« Choix depuis le répertoire à
venir »), changer la photo. Ce sont **les parties difficiles** de chacun de ces écrans. Par
ailleurs : les Préférences ne persistent pas, « Conditions générales · Politique de
confidentialité » est du texte inerte, la suppression de compte tient en une `Alert`, et le
réglage « Partager mon trajet au départ » n'est lu par aucun parcours.

### L. Affiliation — Affilié Réseau — _Esquissé_ ⚠️ **priorité n° 2**

`app/affilie/` (13 écrans — le plus gros flux de l'app)

Écrit vite contre le breadboard de juin, jamais rouvert depuis. C'est le flux qui manipule de
l'argent réel, et c'est celui qui concentre les défauts. Par ordre de gravité :

1. **Le montant du retrait est faux à la confirmation.** `retrait-confirmation.tsx` affiche
   `fcfa(AMBASSADEUR.balance)` — le **Solde complet du Wallet Réseau** — au lieu du montant
   effectivement retiré, pourtant transporté en paramètre jusque-là. Retirez 2 000 F sur 12 400 :
   l'écran de succès annonce « 12 400 F ».
2. **Free Money est dans l'app.** `retrait-methode.tsx` propose Orange Money / Wave / **Free
   Money**, et `detectOperator()` renvoie « Free Money » pour les préfixes 75. `CONTEXT.md` :
   « Free Money — opérateur du marché, mais **pas un moyen de paiement Fiw** : ne pas le
   réintroduire dans la définition ni dans les écrans (décision 16 juillet 2026). » La réunion du
   16 août a rouvert la question (« à confirmer »). **Une question non tranchée est partie en
   production dans un écran d'argent.**
3. **Deux chemins d'acceptation avec deux sémantiques de consentement.** `presentation.tsx` démarre
   à `accepted = true` (**consentement pré-coché**) et son bouton va directement au tableau de
   bord ; `conditions.tsx` démarre à `false` et n'est atteignable que par un lien en ligne. Donc :
   l'écran de contrat est facultatif, et le chemin par défaut consent à la place du Client.
4. **Vocabulaire hors règle, dans le code et dans la copie.** Le flux entier lit `AMBASSADEUR` —
   « ambassadeur » est un `_Avoid_` explicite pour Affilié Réseau. Et à l'écran : « Chauffeurs
   actifs » (tableau de bord), « Chauffeurs & livreurs » (onglet Mon réseau), `kindLabel` →
   « Chauffeur » / « Livreur ». L'amendement du 14 août est net : « chauffeur » n'est autorisé
   **que** dans le flux Transport ; « les surfaces multi-services — Livraison, Compte,
   **Affiliation**, historique — disent **Prestataire** ».
5. **Trois hex en dur** dans `retrait-methode.tsx` (`#FF6200`, `#009FE3`, `#00B050`) — écart direct
   au design system (« Ne jamais inventer une valeur »).
6. **Deux écrans morts** : `retrait-echec` est inatteignable (`retrait-traitement` route toujours
   vers le succès) et `celebration` aussi (déclencheur push non câblé).
7. **`retrait-numero` est orphelin du chemin principal** : `retrait-methode` saute directement au
   récapitulatif ; on n'atteint l'écran numéro qu'en tapant le numéro sur le récap — et il y
   re-route **en perdant le paramètre `method`**. La méthode choisie à l'écran 1 et le numéro édité
   à l'écran 3 peuvent donc se contredire.
8. **Rien ne débite le Solde**, il n'y a **ni historique de retraits ni registre de transactions**
   (Careem en a un : Rechargement / Payé pour une course / Remboursement), **aucune référence** sur
   la confirmation (Careem affiche un « Transfer ID » + « Something wrong? Get help ») et **aucun
   délai d'arrivée daté** (le récap dit « Quelques minutes », la confirmation « En cours
   d'arrivée » ; Lightyear et Cash App donnent une date et une heure).
9. La saisie du montant n'a pas les raccourcis 25/50/75/Max (MoonPay) ni la ligne « vous
   recevrez ».
10. **Contre le benchmark d'affiliation** : pas d'états de tunnel (KOHO : En attente / Validé /
    Expiré / Tous), pas de compteurs de conversion, **pas de FAQ** — alors que KOHO, Airalo et
    Satispay en ont tous une, et qu'il s'agit ici d'une **promesse d'argent**. Et la liste
    « Commissions récentes » n'affiche qu'une date et un montant, alors que `COMMISSIONS` porte le
    nom de l'Affilié, son type et son nombre de courses : **l'attribution est dans la donnée et
    jetée à l'affichage**, ce qui est précisément l'angle mort « traçabilité affiliation » relevé
    en recherche terrain.

### M. Fidélité — _Absent_

Une rangée de sidebar, un badge « 240 pts », pas de `onPress`, pas d'écran. `CONTEXT.md` le dit
lui-même : « Taux de conversion exact et seuil minimum à définir. »

Le benchmark donne la liste des pièces attendues : Solde de Points + niveau + **barre de
progression vers le palier suivant avec les seuils en clair** (Satispay, Airalo, Shopee) + un
catalogue de conversion avec le coût de chaque récompense (adidas : « Trade points for a voucher »,
1 200 / 2 500 / 6 000) + les règles d'expiration + **une FAQ** + un registre des gains. Rien de
tout cela n'existe, et le mécanisme de conversion n'est pas décidé.

### N. Aide & support — _Absent_

Une rangée de sidebar sans `onPress`. C'est le manque le plus visible face à la catégorie : Bolt,
Freenow et inDrive font tous de l'aide une destination de plein droit, avec (a) un inbox de
dossiers ouverts, (b) « obtenir de l'aide pour une course récente » — annulations comprises —, et
(c) une arborescence d'articles par thème (inDrive publie même un article éditorial « Service
standards for passengers »). Fiw a un bouton stub sur un détail d'historique, qui bascule un
booléen.

---

## 4. Les manques transversaux

Ceux-là ne relèvent d'aucun flux en particulier, et bloquent plusieurs chantiers à la fois.

**4.1 — Il n'existe pas de « Commande en cours » dans l'interface.** Chaque écran avance par
`router.push`/`replace` avec des paramètres. Quittez la course, tuez l'app : elle a disparu. Pas
de reprise, pas de bandeau d'accueil, pas d'onglet Courses, pas de notification. **C'est la pièce
manquante la plus structurante** — elle bloque d'un coup l'historique, le support, la programmation
et le push. `CONTEXT.md` définit pourtant **Commande** comme le terme canonique du modèle : l'objet
existe dans le vocabulaire et pas dans l'interface.

**4.2 — Il n'y a aucun état d'erreur, vide ou hors-ligne.** Nulle part. Pas de perte de réseau, pas
d'échec de carte, pas d'échec de paiement, pas de code OTP invalide, pas de Solde insuffisant.
`retrait-echec` existe et n'est pas atteignable. L'app est un chemin heureux muni d'un
interrupteur de démo.

**4.3 — Il n'y a pas de notifications.** Ni demande de permission, ni boîte de réception, ni lien
profond. Or `affilie/celebration` est explicitement conçu pour être atteint par push, et tout le
suivi de course en dépend hors de l'app.

**4.4 — Rien ne persiste.** `CLIENT` est un objet de module muté à la volée, les stores sont en
mémoire, le Solde du Wallet Réseau ne bouge jamais, la fermeture de la bannière Affiliation n'est
pas mémorisée (assumé). Acceptable en proto — à lister comme dette avant le backend.

**4.5 — La rigueur manque dès qu'il y a de l'argent.** Les prix sont des constantes ; le seul
endroit où deux nombres doivent coïncider (le retrait) est faux.

**4.6 — La documentation a divergé du code.** Trois points à reprendre :
- `MEMORY.md` référence **14 documents supprimés** le 26 août (sitemap client, feature-list,
  conceptual-model, user-needs, research-signals, orient-audit, les deux benchmarks Carte et
  Livraison…). Le commit de suppression avait listé les renvois orphelins « à traiter à part » ;
  ça n'a pas été fait. **La carte du projet pointe majoritairement vers le vide.**
- `CONTEXT.md` (Frais de rapprochement) contredit `transport/searching.tsx` — voir §3.D.
- Trois composants sont sans appelant : `RapprochementChoice` (98 l.), `ChipGroup` (100 l.),
  `WheelPicker` (87 l.). Le premier est le composant Option A/B abandonné : il est la trace
  matérielle de la décision non tranchée.

---

## 5. Où creuser, dans l'ordre

Classement par **(risque × proximité du test terrain)**, pas par taille.

| Rang | Chantier | Pourquoi maintenant |
|------|----------|---------------------|
| 1 | **Frais de rapprochement — trancher A/B vs issue unique, puis écrire le « pourquoi »** | C'est le prochain jalon de test terrain déclaré, et la définition canonique contredit l'écran. On ne peut pas tester une hypothèse qu'on n'a pas arrêtée. |
| 2 | **Sécurité : garder le SOS, sortir la sécurité sur la carte, relier Contacts de confiance au partage de trajet** | Défaut de conception à conséquence réelle, et les trois pièces existent déjà séparément. |
| 3 | **La Commande en cours comme objet d'interface** | Débloque historique, support, programmation, push et reprise d'un seul coup. Rien de grand ne peut se poser dessus tant qu'elle n'existe pas. |
| 4 | **Affiliation : passe de correction puis passe de conception** | Corriger d'abord les 5 défauts durs (montant faux, Free Money, consentement pré-coché, vocabulaire, hex) ; concevoir ensuite ce qui manque (registre, référence, délai, FAQ, attribution). |
| 5 | **Avis : dé-biaiser la note, écrire le vocabulaire d'une mauvaise course** | Corruption de donnée à la source, qui remonte jusqu'au Statut prestataire. Peu de travail, gros effet. |
| 6 | **Le Repère dans la Commande (ADR 0009)** | Décision prise, argumentée par le terrain dakarois, non appliquée là où elle comptait. |
| 7 | **Historique multi-services, actionnable** | Porte d'entrée du support ; l'écart avec la catégorie est le plus large et le motif est entièrement connu. |
| 8 | **Aide & support** | Absent, et c'est là que tombent tous les cas que le chemin heureux ne traite pas. |
| 9 | **Onboarding : création de compte, permissions, consentement, erreurs** | Premier écran vu par chaque Client ; aujourd'hui il ne sait pas prendre un prénom. |
| 10 | **Le Colis : responsabilité, poids, interdits, notification du destinataire** | Non pour rétablir le formulaire, mais pour concevoir la moitié de la décision du 2 août qui n'a pas été traitée. |
| 11 | **Fidélité** | Le mécanisme n'est pas décidé ; c'est un chantier de conception amont, pas d'écran. |
| 12 | **Programmer une course · code promo** | Standards de catégorie absents ; à cadrer une fois §5.3 posé. |
| 13 | **Remettre `MEMORY.md` et `CONTEXT.md` d'aplomb** | Une carte qui pointe vers 14 documents disparus coûte à chaque session. |

---

## 6. La leçon de méthode

La corrélation est nette et mérite d'être dite : **les deux flux mûrs sont les deux qui ont eu un
benchmark écrit** (`benchmark-compte-mobbin.md` pour Compte, le benchmark Livraison pour
Livraison), **et le plus mûr des deux est celui qui a eu en plus une session de grilling**
(Compte, décisions D1–D5). Les flux nés d'un breadboard de juin et jamais rouverts — Transport
sur sa partie prix/mise en relation, Affiliation en entier — sont ceux où les décisions manquent.
Les flux sans rien sont absents.

Le travail des trois derniers mois a porté, presque exclusivement et avec un soin remarquable, sur
la **fidélité visuelle** : alignement Figma ↔ code, jeu d'illustrations, moteur de carte, jetons,
migration de composants. Cet investissement est acquis et il est solide. Le prochain palier ne se
gagnera pas sur la forme — il se gagnera sur les objets, les états et les échecs.
