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

**D4 — « Devenir prestataire » inclus, épinglé en pied de sidebar, style distinct.**
Élément séparé de la liste (couleur différente, motif [Bolt](https://mobbin.com/screens/40d88928-1105-4207-a140-22d601cdd548) /
[Lyft](https://mobbin.com/screens/585cc414-743e-4e4f-b211-b433a70fcff2)) pour ne pas
entrer en collision avec le « Gagner de l'argent » de l'Affiliation. Renvoie vers
**Fiw Pro**. Libellé canonique **« Devenir prestataire »** (pas chauffeur/livreur).
Vit dans la **sidebar** (le lanceur), pas dans la page Compte.

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
- **`TrustedContactRow`** — contact de confiance : avatar/initiales + nom + état de
  partage, menant aux réglages par contact (partage au départ, appel d'urgence).

**Écrans-destination du hub** (chaque rubrique ouvre son propre écran) : `profil`
(édition identité), `paiement` (Mobile Money), `securite` (contacts de confiance +
connexion), `preferences` (notifications). À placer sous `apps/fiw/app/compte/`.

## Périmètre v1

**Inclus** : page « Mon compte & Sécurité » (en-tête avec **Note du Client** +
rubriques + bas de page) → `profil` · `paiement` (Mobile Money + Espèces) · `lieux`
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
