# Benchmark Mobbin — Mon compte & Sécurité (Fiw Client)

> Passe UX/UI menée le 14 juillet 2026 avant la conception de l'écran atteint en
> tapant l'**en-tête profil du drawer** (`apps/fiw/components/MenuDrawer.tsx`).
> Objectif de la recherche : **quelles informations le Client doit pouvoir
> atteindre en tapant sur son profil**. Point d'entrée aujourd'hui tappable mais
> sans destination. Le sitemap (§8) rattache l'en-tête profil ET l'item « Mon
> compte & sécurité » à la **même section 7** — donc le profil ouvre le **hub
> « Mon compte & Sécurité »**. Le benchmark valide/complète la liste du §7.

## Apps étudiées

| App | Écrans | Pertinence pour Fiw |
|---|---|---|
| **Bolt** | [Onglet Compte](https://mobbin.com/screens/c539dff3-0309-45d2-ab1c-d7004440bce7) · [Profil](https://mobbin.com/screens/257984f3-e7a8-4e65-9ea0-5c5f78b57800) · [Paiement](https://mobbin.com/screens/9c0f5f0f-a973-4954-ac22-0d468179d1b0) · [Menu](https://mobbin.com/screens/40d88928-1105-4207-a140-22d601cdd548) | **Référence n°1** — hub le plus proche du besoin Fiw : Infos perso · Sécurité trajet · Connexion & sécurité · Lieux enregistrés · Préférences · Déconnexion · Supprimer |
| **inDrive** | [Profil](https://mobbin.com/screens/87e740cb-8232-4590-a3d6-7bb4a5f02637) · [Réglages](https://mobbin.com/screens/ad65955c-156f-47cc-8e78-4a2d95cf29e2) · [Suppression](https://mobbin.com/screens/543b3e94-766d-4fdd-a372-88f686b1ed84) · [Contacts d'urgence](https://mobbin.com/screens/c294daa5-c286-4865-b7e8-5a02a0f60b8b) | **Proxy marché émergent / cash-first** — le plus lean, **aucun moyen de paiement dans le compte**, contacts d'urgence présents |
| **Careem** | [Compte](https://mobbin.com/screens/2f1e3a0d-f91b-4480-ac0b-6037d101e8dd) · [Champs profil](https://mobbin.com/screens/5724aeef-b236-4428-bd12-ecf8a5f47067) · [Support/Préf/CGU](https://mobbin.com/screens/d4328d57-c516-4ee4-96d8-5c2fd3d0a249) | Super-app : compte groupé (Infos perso · Cartes & comptes · Adresses · Notifications · Profil pro) + PIN, langue, ville, CGU + version |
| **Grab** | [Onglet Compte](https://mobbin.com/screens/cdef78ee-96a0-4cf9-9047-f60690e8328b) · [Compte (bis)](https://mobbin.com/screens/88858a7a-8b39-454c-8ddc-1267b6e3e000) · [Édition profil](https://mobbin.com/screens/8ead68c6-230f-4da8-af87-1253d84b9bad) | Super-app : **Contacts d'urgence & Lieux enregistrés remontés en tête de liste**, PIN, comptes liés |
| **Uber** | [Hub compte](https://mobbin.com/screens/e21841b4-be86-4fa7-8afd-8643fba6a527) · [Réglages](https://mobbin.com/screens/89928f68-41b4-4fa6-b4cb-bb7782f872e3) · [Réglages (comm./sécurité)](https://mobbin.com/screens/39b5270b-994a-4e31-a711-f16f0de5f5e1) | Rubriquage riche : Favoris · Sécurité · Famille · Confidentialité · Sécurité du compte (2FA) · Déconnexion |
| **Freenow** | [Onglet Compte](https://mobbin.com/screens/30be0847-c5d2-4b51-8269-e4858cd1b76c) | Compte européen : Infos perso · Profil pro · Notifications · Aide · Bons & crédits · Adresses enregistrées |
| **Lyft** | [Compte](https://mobbin.com/screens/55dfae07-5cb8-4f3b-a025-e831f3fccb14) · [Menu](https://mobbin.com/screens/cdc8b35c-f634-4559-a437-49627618f6fb) | **Safety Hub** en tête · Notifications · Parrainer · Famille · Paiement · Aide · Réglages |
| **Check / Lime** | [Check](https://mobbin.com/screens/faa60f01-62a9-4b22-9fa2-7792f9271adf) · [Lime](https://mobbin.com/screens/987b291f-41ee-46e8-a036-7c2704028ee7) | VTC/scooter : crédit, factures, parrainage, **Safety Center**, version app en bas |

**Sécurité / Contacts de confiance** (recherche dédiée) : [Uber — intro Contacts de confiance](https://mobbin.com/screens/9fdbab29-d2cf-42c1-96a7-415d8234e748) · [Uber — réglages par contact](https://mobbin.com/screens/1e38a4f7-8b3e-4839-bcdf-70101cb52539) · [Uber — Safety checkup](https://mobbin.com/screens/86879a76-e3bd-4946-8370-17f9996b719b) · [DoorDash — partage position](https://mobbin.com/screens/18964508-1586-4471-823d-c561e0486d78).
**Préférences notifications** : [Sumeria (FR)](https://mobbin.com/screens/8def4c2c-d55b-4da5-8210-30a9d4e8ec12) · [Zomato](https://mobbin.com/screens/ea6bdb86-bce1-4794-9c47-39c84af745ac) · [Panera — Communication Preferences](https://mobbin.com/screens/7c562b74-5ef1-4bdd-ad13-2bd324ae1817).

**Limites du corpus** : ni **Yango** (concurrent direct) ni **Heetch** (VTC présent à Dakar) ne sont indexés sur Mobbin ; les requêtes ont renvoyé Bolt/Lyft/Uber à la place. **inDrive** sert de meilleur proxy « app lean / cash-first marché émergent ». Aucune app à **Mobile Money africain** dans le corpus : la rubrique paiement est extrapolée depuis le cadrage CONTEXT.md (Wave / Orange Money / Free Money), pas depuis un écran de référence.

## Deux modèles d'architecture observés

- **Hub-complet** (Careem, Grab, Freenow, Bolt onglet Compte) : le profil ouvre **un** écran qui contient tout, groupé par rubriques (identité en tête, puis listes).
- **Profil-mince + menu** (ancien Uber, Lyft, Lime) : le profil n'édite que l'identité ; le reste (paiement, historique, promos) vit dans un menu séparé.

**Fiw est en hybride** : le drawer expose déjà **Historique**, **Fidélité**, **Affiliation**, **Aide & support** comme _frères_ de l'en-tête profil. Le hub « Mon compte & Sécurité » doit donc porter **ce qui n'est pas déjà un item du drawer** — sinon on duplique la navigation.

## Rubriques observées (fréquence & décision Fiw)

| Rubrique | Bolt | inDrive | Careem | Grab | Uber | Freenow | Lyft | Décision Fiw v1 |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|---|
| Identité + **note du passager** | ✓ note | – | ✓ note | ✓ note | ✓ note | ✓ note | ✓ | ✅ **Identité + Note du Client** (D1) |
| Infos personnelles (édition) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | ✅ **Profil** |
| Moyens de paiement | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✅ **Mobile Money + Espèces** |
| Contacts de confiance / Sécurité | ✓ | ✓ | – | ✓ | ✓✓ | – | ✓ | ✅ **pièce maîtresse** |
| Connexion & sécurité (PIN/2FA) | ✓ | – | ✓ | ✓ | ✓ | – | – | ✅ léger (OTP téléphone) |
| Lieux enregistrés | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | – | ✅ Maison/Travail + libres (D2) |
| Préférences notifications | ✓ | – | ✓ | – | ✓ | ✓ | ✓ | ✅ **Préférences** |
| Langue / unités / thème | ✓ | ✓ | ✓ | – | ✓ | – | – | ⏸️ différé v1 · Wolof = déclencheur (D5) |
| Fidélité / Rewards | – | – | ✓ | ✓ | ✓ | ✓ | – | ➡️ déjà dans le drawer |
| Parrainage / invite | – | – | – | ✓ | ✓ | – | ✓ | ➡️ = Affiliation (drawer) |
| Devenir prestataire | ✓ | – | ✓ | – | ✓ | ✓ | ✓ | ✅ pied de sidebar, distinct (D4) |
| Aide + CGU + version | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✅ CGU + version en bas |
| Déconnexion / Supprimer compte | ✓ | ✓ | – | ✓ | ✓ | – | – | ✅ bas de page |

## Ce que le hub « Mon compte & Sécurité » doit exposer (proposition v1)

**En-tête** — photo · nom · téléphone · **Note du Client** (moyenne, lecture seule — voir D1).

**1 · Profil** → éditer photo, nom, téléphone (email optionnel, pour reçus). Un
champ par ligne, label au-dessus — réf. [Careem](https://mobbin.com/screens/5724aeef-b236-4428-bd12-ecf8a5f47067),
[inDrive](https://mobbin.com/screens/87e740cb-8232-4590-a3d6-7bb4a5f02637). On
écarte les champs Genre / Date de naissance / Nationalité que collectent Careem et
Grab — non requis par le domaine Fiw en v1.

**2 · Moyens de paiement** → comptes **Mobile Money** (Wave / Orange Money / Free
Money) ajoutables/supprimables + **Espèces** par défaut. Bien plus simple que le
benchmark carte/PayPal ; le minimalisme cash-first de [inDrive](https://mobbin.com/screens/ad65955c-156f-47cc-8e78-4a2d95cf29e2)
(qui ne met _aucun_ paiement dans le compte) valide qu'on n'a pas à sur-construire.

**3 · Sécurité & Contacts de confiance** _(le gros morceau — les leaders l'étoffent le plus)_ :
- **Contacts de confiance** : ajouter/supprimer, **partage automatique du trajet au
  départ**, appel en cas d'urgence. Le benchmark modélise **deux niveaux** — l'intro
  [Uber « Trusted contacts »](https://mobbin.com/screens/9fdbab29-d2cf-42c1-96a7-415d8234e748)
  (« partager mon statut de trajet » + « définir mes contacts d'urgence ») et les
  réglages **par contact** ([rappel de partage avant chaque course / appel d'urgence](https://mobbin.com/screens/1e38a4f7-8b3e-4839-bcdf-70101cb52539)),
  plus le toggle « partager ma position » de [DoorDash](https://mobbin.com/screens/18964508-1586-4471-823d-c561e0486d78).
  Fiw a déjà ce concept (Contacts de confiance + notification auto au départ + SOS
  permanent, sitemap §3.2/§4.3) : le hub en est le point de gestion.
- **Connexion & sécurité** : OTP/PIN téléphone _(léger — Fiw est phone-first, pas de mot de passe carte)_.

> Signal fort : **Grab et Uber remontent « Contacts d'urgence » directement dans la
> liste du compte** (pas enterré). → Fiw doit rendre les Contacts de confiance
> **visibles**, cohérent avec l'axe sécurité produit.

> ⚠️ **La section Sécurité est à ajuster.** L'écran `compte/securite.tsx` porte
> trois sections hétérogènes — partage de trajet (un switch), Contacts de
> confiance (une liste + un CTA), connexion (numéro + code) — sous un seul titre.
> La rangée du hub qui y mène s'appelait « Contacts de confiance », soit le nom
> d'**une** de ses trois sections ; renommée **« Sécurité »** le 11 août 2026,
> mais le problème de fond reste : **son sous-titre n'énumère toujours que les
> contacts**, donc il résume un tiers de l'écran. Questions ouvertes : le
> sous-titre doit-il décrire l'écran entier ou sa partie la plus actionnable ?
> « Connexion » a-t-elle sa place ici plutôt que dans le hub ? Et le signal du
> benchmark ci-dessus — rendre les Contacts **visibles** depuis le compte —
> est-il encore tenu maintenant que la rangée ne les nomme plus ? Suivi : todo
> **P11**.
>
> **Amendement du 20 août 2026 — l'écran Sécurité est gardé, et son nom aussi.**
> Depuis la rédaction ci-dessus, la section **Connexion a été retirée** (elle
> doublait Profil, et aucune app du bench ne range le téléphone sous Safety) :
> l'écran ne porte plus que **deux** rubriques, partage de trajet et Contacts de
> confiance. D'où la question posée : un écran si maigre mérite-t-il encore un
> écran, ou redevient-il la rangée « Contacts de confiance » du benchmark
> d'origine ?
>
> **Réponse : on garde « Sécurité ».** L'argument est celui relevé en réunion le
> 16 août 2026 (`meeting-recaps/08-16.md`) — *« garder "Sécurité" permet d'y
> ajouter d'autres paramètres à l'avenir »*. Il ne nie pas la maigreur, il la
> requalifie : l'écran est court **parce qu'il n'a pas encore reçu ce qui lui
> reviendra**, pas parce qu'il n'a pas de raison d'être. Nommer la rangée d'après
> sa seule liste actuelle rendrait tout ajout futur soit invisible, soit
> renommant. Un contenant se nomme d'après ce qu'il est fait pour tenir.
>
> **Et son sous-titre dit l'ÉTAT de la protection**, pas la liste des contacts :
> « Partage activé · 2 contacts de confiance ». Trois formes ont été pesées —
> énumérer les contacts (statu quo), nommer les deux rubriques, ou dire l'état.
> L'énumération ne résumait qu'une rubrique sur deux et allait vieillir avec
> l'écran ; nommer les rubriques décrit bien l'écran mais tient mal sur une
> ligne et n'apprend rien. **L'état couvre les deux rubriques, garde les
> Contacts visibles depuis le compte — le signal du bench ci-dessus est donc
> tenu — et répond à la seule question qu'on ne peut pas deviner de l'extérieur :
> le partage est-il en marche ?** C'est la seule rangée du hub dont le résumé
> n'est pas une liste de valeurs ; l'écart est assumé, les autres rangées
> ouvrent sur des inventaires, celle-ci sur une protection qui est en marche ou
> non.
>
> Conséquence technique : l'état de sécurité sort de l'écran pour vivre dans
> **`stores/safety.ts`** — le hub affiche ce que `compte/securite` règle, les
> deux doivent voir la même chose. Même motif que `stores/payment` (D6) et
> `stores/places`. _(P11 est close.)_

**4 · Préférences** → notifications (push / SMS), groupées par canal — réf.
[Sumeria (FR)](https://mobbin.com/screens/8def4c2c-d55b-4da5-8210-30a9d4e8ec12),
[Zomato](https://mobbin.com/screens/ea6bdb86-bce1-4794-9c47-39c84af745ac). Le
sitemap §7 ne liste que « notifications » — on garde volontairement lean.

**Bas de page** → **CGU** + **numéro de version** (motif [inDrive](https://mobbin.com/screens/ad65955c-156f-47cc-8e78-4a2d95cf29e2)/Careem)
· **Déconnexion** · **Supprimer mon compte** (exigence légale, quasi universel ;
motif [inDrive](https://mobbin.com/screens/543b3e94-766d-4fdd-a372-88f686b1ed84)).

## Décisions (tranchées le 14 juillet 2026)

Session de grilling (`/grill-with-docs`), une décision à la fois. Vocabulaire résolu
capturé dans `CONTEXT.md` au fil de l'eau. **Aucun ADR** — toutes réversibles, aucune
ne dévie de façon surprenante ET irréversible.

**D1 — On affiche la Note du Client (moyenne), on cache le détail.** Distinction
clé : l'**ÉvaluationClient** (acte individuel du Prestataire, par course) reste
**privée** ; sa **moyenne** — la **Note du Client** — est affichée au Client dans
l'en-tête profil, comme Yango et le reste du marché. Modèle symétrique côté
Prestataire (**Note du Prestataire**, Fiw Pro). Termes ajoutés à `CONTEXT.md`. La
formulation d'origine « note non exposée » était une imprécision : c'est le _détail_
qui est privé, pas la moyenne.

**D2 — « Lieux enregistrés » entre sur la page Compte.** Surface de gestion
(créer / renommer / supprimer) : **Maison + Travail** (emplacements spéciaux
permanents) **+ lieux libres** nommés par le Client. La recherche continue de les
_proposer_ comme destination ; la page Compte les _gère_. Comble un vrai trou —
aujourd'hui `SAVED_PLACES` (`data.ts`) est codé en dur, éditable nulle part. Terme
**Lieu enregistré** ajouté à `CONTEXT.md`.

**D3 — On garde les deux entrées vers la page Compte.** L'en-tête profil (tappable)
ET la rangée « Mon compte & sécurité » mènent au même écran — **redondance
volontaire**, pas un oubli : elle guide les Clients qui suivent les **mots** plutôt
que l'affordance (invisible) de l'avatar tappable — enjeu d'**accessibilité** pour
l'audience Dakar. À documenter par un commentaire dans `MenuDrawer.tsx` au câblage,
pour qu'un futur dev ne « nettoie » pas la rangée.

> _Amendement du 28 septembre 2026 — le portrait mène à la fiche Profil, et le
> dit par un mot._ Le portrait du Menu est passé en **colonne centrée** (avatar,
> nom, téléphone — l'arrangement de Yango, demandé le 14 septembre). Il a perdu
> au passage le bout de rangée où posait son chevron, et la question est devenue :
> comment un portrait centré dit-il qu'il est une porte ?
>
> **Ce qui a été essayé.** Sans aucun signe d'abord, en comptant sur la rangée
> « Mon compte & sécurité » juste en dessous — écarté à l'écran : sans signe, le
> portrait se lit comme un bloc posé là, et D3 n'a jamais fait de la rangée
> l'affordance du portrait, seulement un second chemin. Puis un chevron collé
> au nom, réglé en cinq passes (encre, taille, écart, graisse) sans jamais tenir
> — le caret `bold` de Phosphor reste plus fin que les fûts d'un `heading2`
> (1,5 contre ~2,3), et centrer le groupe nom + chevron sort le nom de l'axe.
>
> **Ce que fait le corpus** (≈ 85 écrans iOS, 7 requêtes) — cinq familles :
>
> | Famille | Signe de porte | Apps |
> |---|---|---|
> | Rangée, chevron en bout | le chevron, à sa place naturelle | [Glovo](https://mobbin.com/screens/a8a2dd9d-2909-4550-8d8a-9be3f7da83b2) · [inDrive](https://mobbin.com/screens/c2b1581d-f297-4cfd-b659-ce6d5286f544) · [BlaBlaCar](https://mobbin.com/screens/a2c9bf6a-fdc4-4888-90b2-6d03292b7c8e) · [Tonal](https://mobbin.com/screens/4d6bde90-cad3-460d-b3fa-f14f0bc71daa) |
> | Rangée + lien sous le nom | un **mot** en couleur de marque | [Bolt, menu](https://mobbin.com/screens/40d88928-1105-4207-a140-22d601cdd548) (« My account ») · [Lyft, menu](https://mobbin.com/screens/4b1a7a6e-f93c-486f-97e5-736865654014) (« View profile », sous une ligne secondaire) · [Mindvalley](https://mobbin.com/screens/b8010e85-a009-4a14-b476-57e42bd3a1d7) (nom · e-mail · pastille) |
> | **Centré, porte** | un **mot** ou une pastille sous le nom | [monday.com](https://mobbin.com/screens/bf98fa22-722b-4811-b9ee-dda34020a636) (« View Profile ») · [Photoroom](https://mobbin.com/screens/454edfc3-512c-4d40-8ffa-7fb9d317b85a) (nom · e-mail · pastille) · [Wise](https://mobbin.com/screens/165c9c01-2707-4f86-b996-44995625fdc7) · [Grok](https://mobbin.com/screens/f743950f-7425-4df8-af65-bd32bf7c303e) (« Edit › ») |
> | Centré, pas une porte | aucun — la rangée « Personal info » en dessous est la porte | [Bolt, onglet Compte](https://mobbin.com/screens/edcdcfff-1dd1-4112-8160-bc00fb7ae02e) · [Tesla Robotaxi](https://mobbin.com/screens/77306280-9f47-4bc1-8d25-3846156d89f2) |
> | Grand nom à gauche, avatar à droite | aucun — une rangée plus bas | [Uber](https://mobbin.com/screens/b5becf3a-7859-4932-a272-b5523dab5ddb) · [Careem](https://mobbin.com/screens/2f1e3a0d-f91b-4480-ac0b-6037d101e8dd) · [Wolt](https://mobbin.com/screens/0218957f-3d0b-4d03-b6ca-18bb8ab696b3) |
>
> Un seul chevron collé à un nom centré dans tout le corpus : [Luma](https://mobbin.com/screens/c4a84b7e-61bc-442c-b912-b5adfcb5e90d),
> une fiche de **contact**, pas un menu. Et partout, **l'action vient après les
> lignes d'identité**.
>
> **Décidé par elle le 28 septembre 2026 :**
>
> - Le portrait porte une **pastille « Voir mon profil »** (`Button
>   variant="secondary" size="sm"`) après le téléphone, à 10 — la famille
>   Photoroom / Wise / Grok. Un lien (`Button variant="link" size="sm"`, le motif
>   de « Modifier la photo » sur `compte/profil`) a été posé d'abord, puis
>   comparé à l'écran : **la pastille l'a emporté**. Le chevron collé au nom est
>   retiré.
> - **Le téléphone reste.** Les portraits centrés à lien du corpus s'en tiennent
>   à photo + nom + lien ; mais leur ligne secondaire, quand ils en ont une, est
>   l'identifiant du compte (e-mail, pseudo), et chez Fiw l'identifiant **est** le
>   numéro — connexion par code SMS. Yango l'affiche aussi.
> - **Le portrait et son lien mènent à la fiche Profil**, plus à la page Compte :
>   le libellé du corpus (« View profile ») ne dit vrai qu'à cette condition, et
>   le portrait montre exactement ce que la fiche Profil édite (photo, nom,
>   téléphone). Proposés et écartés : « Voir mon compte » (qui gardait la
>   destination d'origine) et « Mon compte » (le mot du menu Bolt, presque le
>   titre de la rangée juste en dessous).
>
> **Ce qui change pour D3.** Les deux entrées vers la page Compte n'existent plus
> depuis le Menu : le portrait ouvre la fiche Profil, la rangée « Mon compte &
> sécurité » ouvre le hub, et la fiche Profil reste atteignable par les deux
> chemins. Ce que D3 protégeait, en revanche, **tient et se renforce** : son
> objet était un chemin **écrit** pour les Clients qui suivent les mots plutôt
> que l'affordance invisible de l'avatar — c'est désormais le portrait lui-même
> qui porte ses mots.
>
> ⚠️ Limites du corpus, les mêmes qu'au 14 juillet : iOS seul, et ni Yango ni
> Heetch indexés.

**D4 — « Devenir prestataire » inclus, épinglé en pied de sidebar, style distinct.**
Élément séparé de la liste (couleur différente, motif [Bolt](https://mobbin.com/screens/40d88928-1105-4207-a140-22d601cdd548) /
[Lyft](https://mobbin.com/screens/585cc414-743e-4e4f-b211-b433a70fcff2)) pour ne pas
entrer en collision avec le « Gagner de l'argent » de l'Affiliation. Renvoie vers
**Fiw Pro**. Libellé canonique **« Devenir prestataire »** (pas chauffeur/livreur).
Vit dans la **sidebar** (le lanceur), pas dans la page Compte.

> _Amendement du 4 septembre 2026 — la prémisse a changé, la décision tient._ La
> sidebar a disparu : c'est une page de la pile, nommée **Menu**. D4 disait « pied
> de sidebar » ; on a donc rejugé la **prémisse** et pas seulement la conclusion —
> les deux blocs d'argent (« Gagner de l'argent » et « Devenir prestataire »)
> ont-ils leur place sur une page de compte ?
>
> **Oui, et le critère qui dit non est le mauvais critère.** Le test « est-ce un
> réglage ? » les élimine, mais il élimine aussi **Historique, Fidélité et
> Affiliation** : ce qui resterait est précisément ce que « Mon compte &
> Sécurité » contient déjà, et la page s'effondrerait dans sa propre page fille.
> Or cette page n'est pas un écran de réglages, c'est le **menu** du modèle
> hybride décrit plus haut — celui dont Historique, Fidélité, Affiliation et Aide
> sont les *frères* du portrait. Dans le tableau des rubriques, « Devenir
> prestataire » figure chez **six des sept** apps étudiées, et toujours là.
>
> Deux faits qui pèsent, relevés dans le code : « Devenir prestataire » est la
> **seule porte de toute l'app Fiw vers Fiw Pro** ; et « Gagner de l'argent » est
> le seul accès permanent à l'Affiliation pour un Client non affilié — la
> bannière `AffiliePromo` de l'accueil, elle, est **refermable**.
>
> Ce qui a bougé, c'est le **nom** : la page a porté « Paramètres » quelques
> heures, un nom qui désignait une rubrique qu'elle ne contient pas. Elle reprend
> **« Menu »**, le mot du modèle.

> _Second amendement, 6 septembre 2026 — la distinction change de porteur._ Les
> deux propositions d'argent descendent **en pied**, dans une zone « Gagner de
> l'argent » **sans titre**, et « Devenir prestataire » y perd sa carte bleue
> pour redevenir une rangée. D4 exigeait un « élément séparé de la liste, de
> style distinct » : il l'est toujours, mais c'est désormais **la zone** qui
> porte la distinction, pas la carte seule. Lui laisser son aplat aurait fait de
> la proposition **secondaire** le bloc le plus fort du pied, devant
> l'Affiliation — qui est le différenciateur de Fiw.
>
> Trois choses tiennent cette forme. **Le bench** : six des huit apps relevées
> placent leur proposition d'argent en bas ou en milieu de liste — Bolt en pied
> et refermable, inDrive en bouton de pied, Freenow en carte isolée, Bird en
> pied, Uber et Lyft en milieu de liste ; seuls Grab et Check poussent en tête.
> **La permanence** : la rangée Affiliation du pied est la porte, jamais
> fermable — la bannière du haut n'est que sa promotion, et ce sont **deux
> éléments distincts**, pas deux états d'un seul, ce qui garantit qu'aucun
> Client ne se retrouve sans chemin après avoir tout fermé. **La fermeture** :
> elle met en sourdine, elle ne supprime pas — la bannière revient après un
> nombre croissant de Commandes terminées (5, 10, 15, 20…), sans plafond.
>
> ⚠️ **Dette assumée** : sans titre, cette zone doit se distinguer par son
> **traitement**, et ce traitement n'est pas fait. Elle atterrit en deux rangées
> grises — le contraire du but. C'est la première chose à reprendre à la passe
> de caractère du Menu.

> _Troisième amendement, 14 septembre 2026 — la dette est soldée, et « Devenir
> prestataire » retrouve une carte._ Le traitement de la zone, c'est la **paire**
> : deux blocs jumeaux, une seule anatomie (rayon `radius-lg`, vignette illustrée
> de 64, même hauteur au pixel), deux illustrations, et **un cran de bleu
> d'écart** — `blue-100` à l'Affiliation, `color-primary-subtle` à « Devenir
> prestataire ». La règle générale est écrite dans `style-guide.md`
> (« Deux propositions voisines sont des jumelles »).
>
> D4 exigeait pour « Devenir prestataire » un « élément séparé de la liste, de
> style distinct ». Il l'est de nouveau **par sa carte**, comme au premier jour —
> mais la carte ne le distingue plus **seul** : elle le range dans une paire dont
> l'écart interne se lit. Le second amendement craignait qu'un aplat propre ne
> fasse de la proposition secondaire le bloc le plus fort du pied ; deux blocs
> clairs séparés d'un palier écartent ce risque sans renoncer à la distinction.
>
> **La bannière promotionnelle du Menu est supprimée.** L'argument qui la tenait
> — « l'Affiliation n'est annoncée nulle part ailleurs » — était **faux** :
> l'accueil la porte déjà, dans la carte principale de sa feuille, sous « De quoi
> avez-vous besoin ? » et au-dessus des deux tuiles de service (`home.tsx`,
> `AffiliePromo`). C'est l'emplacement le plus vu de l'app ; la bannière du Menu
> n'y ajoutait presque aucune portée, et faisait dire deux fois la même chose à
> une seule page. En tiroir, elle se lisait comme un prolongement de l'accueil
> sur lequel le panneau était posé ; sur une page de destination, comme une
> publicité en tête d'un endroit où l'on est venu exprès.
>
> ⚠️ **À ne pas perdre : la règle de sourdine croissante déménage sur l'accueil.**
> Fermer met en sourdine, ça ne supprime pas — la bannière revient après un
> nombre **croissant** de **Commandes terminées** depuis le dernier refus (5, 10,
> 15, 20… sans plafond, sans jamais s'éteindre). Une Commande **annulée** ne fait
> pas avancer le compteur ; les **livraisons comptent** comme les courses ; et le
> premier refus ne compte qu'à partir de la **première Commande terminée** — à
> l'ouverture initiale, fermer c'est ranger, pas refuser. Cette règle appartient
> désormais à la bannière de l'**accueil**, la seule qui intercepte et qui ne
> persiste rien aujourd'hui. **Elle n'y est pas implémentée** : l'accueil n'a pas
> été touché, par décision explicite.

> _Quatrième amendement, 14 septembre 2026 (quelques heures après le
> troisième) — « Devenir prestataire » ne reprend finalement PAS sa carte._ La
> paire de cartes jumelles annoncée juste au-dessus a été construite, regardée
> à l'écran, puis écartée : un cran de bleu d'écart disait « presque pareil »
> entre deux propositions qui ne sont pas de même nature. Trois formes ont été
> comparées sur planches — carte pleine, carte détourée, texte-lien ; c'est le
> **texte-lien** qui est retenu (`Button variant="link"`, centré sous le bloc
> Affiliation).
>
> D4 exigeait un « élément séparé de la liste, de style distinct » : un lien
> centré sous un bloc illustré l'est autant qu'une carte l'était — il
> n'appartient à aucune liste et ne ressemble à rien d'autre sur la page. Ce
> qu'il abandonne, c'est le **poids**, et c'est le but : Devenir prestataire est
> une décision unique et lourde, elle se gagne par la trouvabilité et non par la
> répétition. La règle générale est écrite dans `style-guide.md` (« le poids
> d'une proposition suit la fréquence de sa décision »).
>
> ⚠️ **Ce que le lien fait perdre** : son sous-titre, et donc la seule mention
> écrite dans toute l'app Fiw que cette porte mène à une **autre application**.
> Elle ne survit plus que dans l'alerte affichée au tap — à ne pas alléger.

**D5 — Langue / thème / unités : différés de la v1.** L'app est en **français**,
F CFA, km. Préférences = **notifications seules**. Le **Wolof** est marqué comme le
déclencheur qui rouvrira la question langue — levier d'**accessibilité**, pas
cosmétique comme le thème.

**D6 — Moyens de paiement : une seule liste, trois états** _(16 juillet 2026 —
remplace la rubrique « 2 · Moyens de paiement » de la proposition v1 ci-dessus)._

**Pas de rubriquage par nature.** La page ne sépare **pas** « Mobile Money » d'un
côté et « Espèces » de l'autre : un moyen de paiement est un moyen de paiement, ils
vivent dans **une liste unique**. Ce qui distingue les rangées, c'est leur **état**,
pas leur famille. Motif [Blinkit](https://mobbin.com/screens/2ba6ea05-4d3c-4a93-8d9f-256821db5971)
(liste unique, lien « ADD » sur les non-configurés).

**Les trois états** (et trois seulement) :

Chaque moyen est une **carte à part** (pas des rangées d'une carte groupée) —
motif [Binance](https://mobbin.com/screens/8eb64cde-e589-48bd-9a0d-6e167e573166) /
[Plazo](https://mobbin.com/screens/dee51755-5ef4-40a3-ac33-424d53553765) : c'est ce
qui permet au liseré de marquer l'élu.

| État | Qui | Carte |
|---|---|---|
| **Non configuré** | Mobile Money sans numéro lié — les Espèces n'ont rien à configurer | logo atténué · « Aucun numéro lié » · lien **Ajouter** |
| **Configuré** | utilisable pour payer une Course | logo plein · numéro · lien **Retirer** |
| **Par défaut** | **le** configuré pré-sélectionné à la commande | idem + **liseré bleu** + chip **« Paiement par défaut »** sur la ligne du label |

**Mise en page de la carte — deux lignes, rôles séparés** :

```
┌────────────────────────────────────────┐
│ [logo]  Orange Money  ‹Paiement par défaut›   ← ligne 1 : identité + état
│         78 ••• •• 30              Retirer │   ← ligne 2 : donnée + action
└────────────────────────────────────────┘
```

L'action est **ligne 2**, pas à droite de la ligne 1 : c'est ce qui laisse au chip la
largeur d'écrire **« Paiement par défaut »** en entier. « Par défaut » tout court
tenait à droite du label, mais ne dit pas *par défaut pour quoi* — le chip doit se
lire seul. Le label porte `numberOfLines={1}` : même serré il **tronque en « … »** au
lieu de passer à la ligne (c'est le label qui cède, jamais le chip — un chip tronqué
ne veut plus rien dire). Les **Espèces n'ont ni numéro ni action** : leur carte n'a
pas de ligne 2 du tout, et n'en gagne pas en devenant défaut.

**Invariants** : exactement **un** moyen par défaut à tout instant, et **forcément
parmi les configurés** — un moyen non configuré ne peut pas l'être. Les **Espèces
sont configurées d'office**, donc il existe toujours au moins un moyen configuré,
donc toujours un **repli valide** : retirer le compte par défaut fait retomber le
défaut sur les Espèces plutôt que de casser l'invariant.

**Le défaut est déplaçable** : toucher **n'importe quelle** rangée configurée la
passe par défaut (ex. Wave lié + Espèces par défaut → un tap suffit pour basculer
sur Wave). Le paiement par défaut cesse d'être une propriété figée des Espèces pour
devenir un **choix du Client**.

**Comment se marque le défaut : liseré + chip inline.** Deux essais écartés avant
d'arriver là, chacun pour une raison qui vaut d'être retenue :
1. **Radio** (le langage de `PaymentSheet`) — écarté : un radio dit « sélectionné »,
   **pas « par défaut »**. Il nomme la mécanique, pas la conséquence.
2. **Fond bleu clair + badge empilé sous le numéro** — écarté pour **deux** défauts
   révélés au rendu :
   - le badge qui apparaît/disparaît **fait grandir la carte** → la liste sursaute à
     chaque changement de défaut ;
   - `primarySubtle` (`#EDF7FF`) posé près du fond `bg` (`#F9FAFB`) **se fond** : les
     deux teintes sont trop proches, la rangée élue se lit comme un *trou* dans la
     carte plutôt que comme une mise en avant. **Un bleu clair ne peut pas servir de
     fond de mise en avant dans ce DS** (règle remontée dans `style-guide.md`).

Retenu — et c'est ce que fait **tout le benchmark**, aucune app ne marque l'élu par un
fond teinté :
- **liseré `primary`** sur la carte élue ([Binance](https://mobbin.com/screens/8eb64cde-e589-48bd-9a0d-6e167e573166)
  liseré jaune de marque, [Plazo](https://mobbin.com/screens/dee51755-5ef4-40a3-ac33-424d53553765)
  liseré vert de marque) — un liseré tranche quel que soit le fond ;
- **chip « Par défaut » sur la ligne du label** ([Grab](https://mobbin.com/screens/7b8a2101-54b4-4c7e-8b5b-2e0f1d45edd7),
  chip `Default` inline) — il **écrit le mot** que le liseré ne dit pas, sans jamais
  changer la hauteur de la carte.

`borderWidth` reste **identique** dans les deux états (seule la couleur change) :
sinon la carte se décalerait d'un demi-pixel en devenant défaut — le même travers en
plus discret.

**L'affordance passe par le `Callout`, pas par un contrôle.** Sans radio, rien ne
signale qu'une carte se touche. Plutôt que de réintroduire un contrôle, la règle est
**écrite** dans un `Callout` en tête d'écran (« Touchez un moyen configuré pour le
passer par défaut ») — application directe de **D3** : les mots plutôt que
l'affordance invisible, pour l'audience Dakar. C'est aussi ce qui permet d'écarter
le menu `⋮` ([Urban Company](https://mobbin.com/screens/e39cd491-3354-455f-b836-e6d336a4c58c))
et le swipe-to-delete ([Instacart](https://mobbin.com/screens/efd76444-9e44-47fb-9bf9-6a1a23be9529))
pour loger « Retirer » : deux affordances invisibles de plus. « Retirer » et
« Ajouter » restent **en toutes lettres** dans la carte.

**Le `Callout` est jaune, pas bleu** — et ça devient une règle du DS, pas un choix
d'écran : le **bleu marque un état** (ici : la carte par défaut), le **jaune appelle
l'attention**. Un encart bleu serait entré en concurrence avec la carte élue qu'il
surplombe. Il reprend la paire de la carte **« Devenir prestataire »** (D4,
`MenuDrawer`) transposée en jaune : fond `brand-yellow-subtle` + liseré
`brand-yellow-100` (le palier clair, pas le plein), **pastille `brand-yellow` à glyphe
sombre**. Teintes **et structure** reprises de la **piste B** de la planche « Devenir
prestataire » (P1), restée sans emploi depuis que la carte a été tranchée en bleu
(piste A).

Deux essais écartés avant d'y arriver, et ils disent la même chose : un glyphe
**tracé** en jaune plein est invisible (1.2:1), et l'assombrir jusqu'au lisible le
rend olive — on perd l'éclat qui fait tout l'intérêt du jaune. La piste B tranche
autrement : **le jaune remplit la pastille, le glyphe sombre posé dessus porte le
contraste**. Le jaune n'a pas à se détacher du fond, puisque ce n'est pas lui qu'on
lit — d'où « le jaune plein remplit, il ne dessine jamais » (`style-guide.md` § Jaune
de marque). Les trois jaunes y sont documentés, calqués sur le bleu **par les rôles,
pas par les luminosités** (un jaune bâti aux valeurs du bleu donne un liseré
invisible), avec leur distinction d'avec `warning` (ambre fonctionnel) : un encart de
marque ne doit pas se lire comme une alerte.

**Le sous-titre ne porte que de la donnée.** Les Espèces n'ont pas de texte
d'explication sous le label : le sous-titre est réservé au **numéro lié** (ou à son
absence, « Aucun numéro lié »). Tout ce qui explique une règle remonte dans le
`Callout` — une rangée décrit son état, elle n'enseigne pas.

### D6 déborde de la page Compte

Les trois états ne sont pas une affaire d'écran de réglages : ils décrivent le moyen
de paiement **partout**. La feuille de sélection (`PaymentSheet`, flux Transport et
Livraison) doit donc les honorer aussi :

- **Un moyen non configuré n'est pas sélectionnable** dans la feuille. On ne paie pas
  une Course avec un compte qui n'existe pas. La rangée **invite à associer un
  numéro** et, à l'acceptation, **renvoie vers la page Moyens de paiement** — plutôt
  que d'ouvrir une saisie de numéro en plein milieu d'une commande. Motif proche :
  [Grab](https://mobbin.com/screens/7b8a2101-54b4-4c7e-8b5b-2e0f1d45edd7) grise la
  rangée inutilisable et l'assortit d'une pastille d'alerte + d'un motif écrit.
- **Le moyen par défaut est pré-sélectionné à l'ouverture** de la feuille. C'est la
  définition même de l'état « par défaut », et la promesse littérale du `Callout`.

> ⚠️ **État des lieux au 16 juillet 2026 : rien de tout ça n'est câblé.** Chaque écran
> tient son propre état — `compte/paiement.tsx` a `{numbers, defaultId}` en `useState`
> local, `transport/configure.tsx` et `livraison/configure.tsx` ont `useState('cash')`
> **en dur**. Il n'existe aucune source de vérité partagée, donc la feuille ne peut
> ni connaître les états ni honorer le défaut : **poser un moyen par défaut n'a
> aujourd'hui aucun effet sur une commande.** Le préalable est de sortir l'état de
> `paiement.tsx` vers un store partagé — les deux points ci-dessus en dépendent.
> Suivi : todo **P9**.

> ⚠️ **Lier un compte Mobile Money n'est pas construit non plus.** `add()` dans
> `compte/paiement.tsx` est un stub — une `Alert` « Saisie du numéro à brancher »
> qui pose directement un numéro fictif. Le parcours réel manque : saisie du
> numéro (`PhoneField` + `CountryPicker`, déjà construits pour le changement de
> numéro) puis **confirmation du numéro avant de le lier**. On ne rattache pas un
> compte d'argent sur une frappe non vérifiée : un chiffre faux et les débits
> partent chez quelqu'un d'autre. **Reste ouvert** : quelle forme prend la
> confirmation — un code SMS envoyé au numéro (comme le changement de numéro,
> écran `compte/numero.tsx`) ou une simple relecture avant validation. Les deux
> ne coûtent pas la même chose et ne protègent pas de la même chose. Suivi :
> todo **P10**.

**Ordre de la liste — Espèces en tête** (9 août 2026). Les trois moyens sont rangés
par **usage réel du marché dakarois**, pas par ordre d'arrivée des services : Espèces,
puis Wave, puis Orange Money. Les Espèces sont à la fois le moyen le plus utilisé et
le défaut de départ — les voir en premier évite de faire défiler pour trouver ce que
la plupart des Clients choisiront. Le même ordre vaut pour `PAYMENT_METHODS`
(`constants/data.ts`), qui alimente la `PaymentSheet` des parcours : **deux listes
dans un ordre différent se lisent comme un bug**.

**Reste de D6** : **Free Money sort des moyens de paiement** — et de la définition
« Mobile Money » de `CONTEXT.md` : chez Fiw, Mobile Money = **Wave + Orange Money**,
et eux seuls. La proposition v1 le citait par simple report du cadrage d'origine, pas
sur un signal produit. **Un compte au maximum par service** (1 Wave + 1 Orange
Money) : le CTA « Ajouter un compte Mobile Money » **disparaît** (il n'y a rien à
ajouter hors des rangées), et « aucun numéro lié » devient un **état visible** au
lieu d'une absence de rangée. **Logos** tirés du registre partagé
`constants/illustrations.ts` — **pas** l'icône générique `card`, **pas** d'emoji
(style-guide).

## Décisions UI (design system)

**Réutilisés tels quels** : `ScreenHeader`, `Avatar`, `Button` (4 variantes),
`PlaceRow` / rangées d'item façon `MenuDrawer` (icône + label + sous-titre + chevron),
`Sheet`/`ChipGroup` si besoin, tokens couleur/typo existants.

**Nouveaux composants candidats (à confirmer à la conception)** :
- **`SettingsRow`** — rangée de réglage générique (icône · label · valeur/état à
  droite · chevron), réutilisable dans toutes les rubriques et déjà esquissée par le
  `MenuItem` du drawer. Variante toggle pour les Préférences.
- **`SectionList`** — regroupement en sections étiquetées (Profil / Paiement /
  Sécurité / Préférences), motif unanime du benchmark.

  > ⚠️ **Amendement du 11 août 2026.** Le *regroupement en sections* est bien
  > unanime — mais la **carte** blanche à liseré qui l'habillait ne l'est pas :
  > toutes les recherches Mobbin de ce benchmark ont été faites en
  > `platform: "ios"`, et cette carte est l'idiome des Réglages iOS. L'idiome
  > natif Android, plateforme dominante du marché dakarois, est l'inverse —
  > rangées à plat sur fond blanc, filets pleine largeur, en-têtes de section.
  > C'est la forme retenue après comparaison des deux en rendu (todo P5) :
  > `SettingsGroup` n'a plus de carte. Les cartes restent aux **objets** (un
  > moyen de paiement, une gamme, un reçu), pas aux portes. Règle détaillée dans
  > `style-guide.md`, section « Composants & organismes ».
- **`TrustedContactRow`** — contact de confiance : avatar/initiales + nom + état de
  partage, menant aux réglages par contact (partage au départ, appel d'urgence).

**Écrans-destination du hub** (chaque rubrique ouvre son propre écran) : `profil`
(édition identité), `paiement` (Mobile Money), `securite` (contacts de confiance +
connexion), `preferences` (notifications). À placer sous `apps/fiw/app/compte/`.

## Périmètre v1

**Inclus** : page « Mon compte & Sécurité » (en-tête avec **Note du Client** +
rubriques + bas de page)
> _Amendement du 4 septembre 2026 : l'en-tête d'identité de « Mon compte &
> Sécurité » est retiré. Le portrait (avatar + nom + téléphone) vit **une fois**
> dans le flux, en tête du **Menu** — la page d'atterrissage, où il
> confirme de qui on parle ; sur la page fille il n'était que la cinquième
> porte, et la seule à ne pas être une rangée. « Profil » y devient donc une
> rangée ordinaire, et la **Note du Client** en est le sous-titre. **D3 tient**
> : deux entrées mènent toujours à la page Compte depuis le Menu, le portrait
> et la rangée « Mon compte & sécurité ». Règle générale dans `style-guide.md`,
> « Un portrait par flux ». (Depuis le 28 septembre 2026, le portrait mène à la
> fiche Profil — voir l'amendement de D3.)_ → `profil` · `paiement` (Mobile Money + Espèces) · `lieux`
(Maison/Travail + libres) · `securite` (Contacts de confiance à 2 niveaux + OTP) ·
`preferences` (notifications) · Déconnexion · Supprimer mon compte · CGU + version.
Sidebar : pied épinglé **Devenir prestataire** → Fiw Pro (style distinct).

**Hors périmètre v1** (documenté pour la suite) : langue / thème / unités (D5 —
Wolof = déclencheur), profil pro / expense (relève d'Affilié Partenaire, ADR 0003),
genre / date de naissance / nationalité, comptes liés (Google/Facebook/Apple), 2FA
avancée, volet commentaire de l'**Avis** Prestataire (parké — se traite côté Fiw Pro).

## Note vocabulaire

Termes canoniques employés (CONTEXT.md) : **Client**, **Contacts de confiance**,
**Mobile Money** (Wave / Orange Money — voir D6), **ÉvaluationClient** (interne,
non affichée), **Historique**, **Fidélité** / **Points Fidélité**, **Affiliation** /
**Affilié Réseau**. Le hub porte le libellé du sitemap **« Mon compte & Sécurité »**.
Le **Wallet** (réserve du Prestataire, Fiw Pro) n'a pas sa place ici : côté Client, il
n'y a pas de portefeuille dépensable in-app — seulement des moyens de paiement liés.
