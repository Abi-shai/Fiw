# Fiw — Écarts app Client ↔ bibliothèque Figma (24 août 2026)

Relevé des motifs d'interface qui vivent dans `apps/fiw` **sans composant Figma**.
Complément de [`design-system-inventory.md`](design-system-inventory.md) : celui-ci
raconte ce qui est construit, celui-ci liste ce qui manque encore, dans l'ordre où
il vaut la peine d'être construit.

## Périmètre vérifié

| Source | Méthode |
|---|---|
| `01 — Primitives` (`397:667`) | lue en direct — 18 composants, 6 sections |
| `03 — Patterns` (`397:669`) | lue en direct — 3 sections, 7 composants + set `BottomSheet` |
| `02 — Composants` (`83:74`) | lue en direct — **24 composants** en 5 sections : `Actions` (Button, Button · États, IconButton, Chip, ActionPill, ActionTile, ActionTileRow) · `Saisie` (Field 24 variantes, PlaceField, SearchBar, CodePill) · `Listes & rangées` (ListRow, List, InfoRow) · `Cartes` (GammeCard, OptionCard, AltSuggestCard, ReceiptCard, RouteCard, VehicleGroup, VehicleBlock) · `Signalétique` (InfoBanner, Callout, StepProgress) |
| `apps/fiw` | 47 fichiers `components/`, 36 routes `app/`, lus intégralement pour les écrans non maquettés |

**Le gisement est là où il n'y a aucune maquette** : Affilié (11 écrans), Compte (7),
Historique (2), onboarding (3), `livraison/cloture`. Ces 24 routes sur 36 n'ont jamais
été confrontées au système — c'est de là que sortent 9 des 10 entrées de priorité 1.

---

## 1 · Priorité 1 — motifs dupliqués à l'identique

Même critère que les Parties XII-XIII (`ActionTile`, `PaymentRow`, `AlertBadge`) :
**deux implémentations ou plus du même motif**, donc deux endroits où la divergence
s'installera. Tous ces motifs ont déjà divergé ou vont le faire.

| # | Motif | Occurrences | Source code | Proposition Figma |
|---|---|---|---|---|
| 1 | **Carte d'avis** — avatar 72, titre, 5 étoiles, libellé de note, tags rapides, saisie de commentaire | **2, à l'identique** (styles compris) | `transport/cloture.tsx:102` · `livraison/cloture.tsx` | `RatingCard` — `Étoiles=1…5`, props `Titre`, `Méta`, slot `Tags` |
| 2 | **État de résultat plein écran** — médaillon, titre `display`, corps, pied d'actions | **5** | `transport/cloture` (merci) · `livraison/cloture` (merci) · `affilie/retrait-confirmation` · `affilie/retrait-echec` · `affilie/celebration` | `ResultState` — `Ton=succès\|erreur\|accent\|marque`, props `Titre`, `Corps`, slot `Pied` |
| 3 | **Toast** — pilule `textPrimary`, icône `tick` 16, libellé `label` blanc | **2** | `affilie/outils.tsx:121` · `affilie/qr.tsx:86` | `Toast` — `Icône:BOOLEAN`, `Libellé:TEXT` |
| 4 | **Case à cocher** | **2, déjà divergentes** : 22 px / rayon 6 / `check` 14 vs 24 px / `radius/sm` / `tick` 16 | `affilie/presentation.tsx:130` · `affilie/conditions.tsx:78` | `Checkbox` — `Coché=false\|true` × `État`. **Trancher la géométrie** (le système n'a que `Radio`, recalibré Partie XIX) |
| 5 | **Saisie de code (OTP)** — 4 cases, curseur, rempli | **2, divergentes** : fond `bg` vs `surface`, `codeBoxCursor` d'un côté seulement | `otp.tsx:100` · `compte/numero.tsx:146` | `CodeField` — `État=vide\|curseur\|rempli`. `CodeCell` existe déjà mais **en restitution seule** (code de remise) ; il lui manque les états de saisie |
| 6 | **Interrupteur** | **5 rangées / 2 écrans** — aucun équivalent Figma | `compte/securite.tsx:43` · `compte/preferences.tsx:24` | `Toggle` — `Actif=false\|true` × `État`. À poser en primitive à côté de `Radio` et `Checkbox` |
| 7 | **Contrôle segmenté** | **2, divergents** : pilule `surface`+liseré / item `primarySubtle` (Affilié) vs autre traitement (Transport) | `affilie/reseau.tsx:85` · `transport/configure.tsx` (`segmentItem`) | `SegmentedControl` — `Segments=2\|3`, `Actif=0\|1\|2` |
| 8 | **Pin de carte fixe** + **dock de validation** | **2 chacun**, `compte/lieu` annoté « calqué sur `home.tsx` » | `home.tsx:1047` · `compte/lieu.tsx` (`pinWrap`/`pinDot`, `pickDock`/`pickCard`) | `MapPin` (primitive) et `MapPickDock` (pattern, coins `radius/xl` + `shadow/sheet`) |
| 9 | **Radar de recherche** + **bandeau sur carte** | **2 chacun** — la fonction `Radar()` est copiée-collée entre les deux fichiers | `transport/searching.tsx:57` · `livraison/searching.tsx:62` | `Radar` (`Anneaux=1\|2\|3`) et `MapBanner` (vignette + texte, `shadow/float`) |
| 10 | **Barre d'actions de pied d'écran** | **12 déclarations `footer:`**, au moins **4 géométries** : liseré `thin`/`hairline`/aucun, fond `bg`/`surface`, `padBottom` 16/32 | 12 écrans, dont `presentation`, `conditions`, `qr`, `retrait-*`, les deux `cloture` | `ScreenFooter` — `Liseré=false\|true`, slot `Actions`. Pendant bas de `ScreenHeader` |
| 11 | **Note d'aide** — texte tertiaire posé sous un champ ou une carte, avec ou sans icône, **sans fond** | **8** : avec icône `outils.tsx:118` · `compte/numero.tsx:142` · `compte/profil.tsx:145` · `compte/lieu.tsx:423` ; sans icône `lieux.tsx:76` · `qr.tsx:78` · `profil.tsx:118` · `ChipGroup.tsx:96` | idem | `Hint` — `Icône=false\|true`. À distinguer explicitement de `Callout` (pastille jaune, une affordance qu'on énonce) et d'`InfoBanner` (bandeau de feuille) : la note d'aide ne porte ni fond ni pastille |

---

## 2 · Priorité 2 — objets d'écran structurants, une seule occurrence

Une occurrence, mais ce sont les **objets porteurs** d'écrans entiers qui n'ont
aucune maquette. Les construire, c'est rendre Affilié et Compte dessinables.

| Motif | Source | Proposition Figma |
|---|---|---|
| **Carte Wallet** — hero `primary`, kicker, solde `display`, bouton « Retirer », note verrouillée | `affilie/dashboard.tsx:63` | `WalletCard` — `Verrouillé=false\|true` |
| **Tuile de statistique** — médaillon 36, valeur `heading1`, libellé `caption`, grille 2×2 | `affilie/dashboard.tsx:22` (×4) | `StatCard` + `StatGrid` (slot) |
| **Carte moyen de paiement (écran)** — logo 34, libellé, pastille « Paiement par défaut », méta + lien | `compte/paiement.tsx:101` (×3) | `PaymentMethodCard` — `État=non configuré\|configuré\|défaut`. À ne **pas** confondre avec la rangée de la feuille (absorbée par `ListRow`) |
| **Carte d'identité Client** — avatar 64, nom, téléphone, ligne de note, chevron | `compte/index.tsx:45` | Couvert par `ListRow` (slot `Leading` = `Avatar 64`) **si** `ListRow` accepte un sous-titre à deux lignes — sinon variante `Identité` |
| **Carte de Note du Client** — étoile 22, note `heading2`, explication | `compte/profil.tsx:54` | `NoteCard` |
| **Carte support / objet oublié** — icône, titre, corps, CTA secondaire, état « transmis » | `history/[id].tsx:51` | `SupportCard` — `État=repos\|transmis` |
| **Saisie de montant** — 48 px SemiBold centré, devise, ligne « Disponible / Tout retirer », erreurs | `affilie/retrait-methode.tsx:120` | `AmountField` — `État=repos\|erreur`. Une des « trois saisies de montant absentes de la maquette » de la Partie XXVIII |
| **Tuile de service (accueil)** — en-tête, panneau illustré multi-calques, phrase de pied | `home.tsx:357` + `IlloPanel:265` | `ServiceCard` — `Service=transport\|livraison`. La feuille `Accueil · Services` existe, la tuile n'est pas un composant |
| **Bannière Affilié** — vignette illustrée, deux lignes, chevron, pastille de fermeture débordante | `home.tsx:325` + jumelle `proCard` dans `MenuDrawer.tsx:333` | `PromoCard` — `Ton=surface\|accent`, `Fermeture:BOOLEAN` |
| **Bulle de chat** + **barre de composition** | `transport/chat.tsx:83` | `ChatBubble` (`Auteur=client\|prestataire`) · `ChatComposer` |
| **Contrôle d'appel** + chrome de l'écran d'appel | `transport/call.tsx:20` | `CallControl` — `État=repos\|actif\|danger`. Écran sur fond `textPrimary` : voir §4, il n'y a pas de rôle « sur fond sombre » |
| **Indicateur de chargement** | `affilie/retrait-traitement.tsx:18` (+ `Button` loading) | `Spinner` — `Taille=sm\|lg` |
| **État vide** — médaillon 72, titre, texte, CTA | `affilie/reseau.tsx:67` · `history/index.tsx:19` (variante sans médaillon) · `CountryPicker` | `EmptyState` — `Médaillon=false\|true`, slot `Action` |
| **Carte d'écran** — `surface` + liseré `borderSubtle` + `radius/lg` + `shadow/sm` | ≈ 10 écrans (`statCard`, `qrCard`, `codeCard`, `identity`, `noteCard`, `lostCard`, `details`…) | `Card` — le pendant hors feuille de `SheetCard`. Aujourd'hui chaque écran le redessine |

---

## 3 · Extensions de composants existants (plutôt que nouveaux)

| Composant | Ce que l'app fait en plus | Proposition |
|---|---|---|
| `Badge` | 4 pastilles d'état hors `bienNote`/`suggere` : `Actif`/`Inactif` (`reseau.tsx:101`), « Paiement par défaut » (`paiement.tsx:184`), « En cours d'arrivée » (`retrait-confirmation.tsx:54`), chip opérateur (`retrait-numero.tsx:74`) | Axe `Ton = neutre · accent · succès · alerte · info`, `Icône:BOOLEAN`. Le vocabulaire de `Ton` unifié en Partie XXIV s'applique tel quel |
| `Medallion` | `Size=md 42 \| lg 56` ne couvre pas les **13 tailles** réellement employées : 26, 28, 30, 34, 36, 40, 44, 48, 52, 56, 64, 72, 80, 88, 112 — et les formes vont du cercle au `radius/lg` | Trancher une échelle (p. ex. `sm 30 · md 42 · lg 56 · xl 72 · hero 112`) et l'appliquer des deux côtés. C'est le plus gros gisement de valeurs ad hoc restant, le pendant exact de l'arbitrage `Avatar` de la Partie XXV |
| `Chip` | Les tags d'avis n'ont **pas** de liseré et changent de graisse à l'actif ; `ChipGroup` a un liseré `medium` et ne change pas de graisse | Deux traitements pour un objet : trancher, ou axe `Style=filtre\|tag` |
| `Divider` | `home.tsx:1044` utilise un retrait de **56** là où l'axe dit 0 / 50 / 76 | Vérifier : 56 = 16 + 28 + 12 (leading 28 du champ d'itinéraire). Soit un 4ᵉ cran, soit `PlaceField` s'aligne sur 50 |
| `InfoBanner` | Le bloc « Rassurez-vous… » est un `InfoBanner` `info` refait à la main en `radius/md` (`retrait-echec.tsx:60`) | Le remplacer par une instance, ou ajouter `Surface=carte\|plate` |
| `Field` | Le set couvre `texte\|téléphone\|zone` × `repos\|actif\|erreur\|désactivé` × `rempli\|vide` — 24 variantes. Manquent : le **champ verrouillé** (cadenas, valeur pleinement lisible, `compte/lieu.tsx:277` — ce n'est pas `désactivé`, qui atténue) et le **compteur de caractères** de `Type=zone` (`livraison/configure.tsx` `descCount`) | Deux ajouts additifs |
| `CodePill` | Rangé dans la section `Saisie`, mais sans aucun axe d'état : il ne sait afficher qu'un code **rempli**. C'est ce qui laisse les deux écrans OTP le refaire à la main (§1 n° 5) | Axe `État=vide\|curseur\|rempli` sur `CodeCell`, ou set `CodeField` séparé |
| `Button` variantes `link` | **12+ liens** sont des `TouchableOpacity` + `Text` bleu à la main (« Renvoyer le code », « Passer », « Fermer », « Voir mon réseau », « Modifier la photo », « Tout retirer »…) | Rien à ajouter côté Figma — c'est le code qui doit passer par `Button variant="link"`. À noter pour la passe d'alignement |
| `List` / `ListRow` | Couvrent déjà, sans nouveau composant : les 3 étapes de `presentation.tsx`, les commissions de `dashboard.tsx`, les détails de `retrait-recap.tsx`, les membres de `reseau.tsx` | À vérifier lors de l'écriture du pendant code |

---

## 4 · Fondations — ce qui manque encore

1. **Aucun jeton d'opacité / de superposition.** 9 valeurs en dur dans 7 fichiers :
   blancs sur `primary` (`0.14`, `0.18`, `0.25`, `0.6`, `0.72` — `call.tsx`,
   `dashboard.tsx`, `celebration.tsx`), encre sur carte (`rgba(17,24,39,0.22)` ×2,
   `0.25` ×2), bleu à 6 % du radar ×2, `rgba(242,243,245,0.5)` de l'accueil.
   La collection `Primitives` n'a que `alpha/hairline-8`. C'est la seule famille de
   valeurs qui échappe encore à la parité obtenue en Parties XXVII-XXIX.
2. **Pas de rôle « sur fond sombre ».** `transport/call.tsx` prend `Colors.textPrimary`
   comme **couleur de fond** et invente ses trois blancs. Soit un jeu
   `surfaceInverse` / `textOnInverse`, soit l'écran d'appel est assumé hors système.
3. **`radius/card` contourné.** `borderRadius: 20` en dur à **5 endroits** hors
   composants (`home.tsx` ×3, les deux `searching.tsx`) plus `MenuDrawer.tsx`,
   alors que le jeton existe depuis la Partie III.
4. **Rayons de pastille non systématisés** — 3, 5, 6, 9, 11, 13, 14, 15, 18, 19, 21,
   22, 28, 32, 40, 44 en dur, presque tous des « moitiés de taille » de médaillons.
   Se résout mécaniquement si l'échelle `Medallion` du §3 est tranchée.
5. **Toujours aucun jeton de motion.** Le toast (180 / 1300 / 280 ms), le radar, les
   ressorts de feuille sont en prose dans le style guide. Signalé dès la Partie I §1.8.
6. **Couleurs de marque tierces** — Orange `#FF6200`, Wave `#009FE3`, Free `#00B050`
   (`retrait-methode.tsx:14`). Hors palette Fiw, mais employées comme pastilles de
   choix : soit une collection `Marques partenaires`, soit assumées à l'écrit.
7. **Le libellé de section est reparti en roue libre.** La Partie IX §2 avait rendu
   le correctif structurel — casse et interlettrage dans `SectionLabel`
   (`constants/typography.ts:122`) plutôt que dans les `StyleSheet`. C'est vrai des
   **composants** (`SettingsGroup`, `ReceiptCard`, les deux seuls consommateurs) et
   faux des **écrans** : **8 déclarations `textTransform: 'uppercase'` faites à la
   main** dans 6 fichiers (`home.tsx` ×2, `affilie/dashboard.tsx` ×2,
   `affilie/retrait-methode.tsx` ×2, `affilie/outils.tsx`, `compte/lieu.tsx`), sous
   deux noms (`kicker`, `sectionLabel`, `pickKicker`) et deux couleurs
   (`textTertiary` sur fond clair, `textOnPrimary` sur la carte Wallet). Côté Figma :
   un style de rôle `Fiw/sectionLabel` réglerait la moitié claire.

---

## 5 · Sens inverse — Figma en avance sur le code

À traiter dans la passe d'alignement du code, pas dans Figma :

- **`ListRow` / `List` n'ont aucun pendant code.** `PlaceRow.tsx`, `SettingsRow.tsx`,
  `SettingsGroup.tsx` existent toujours ; `ContactRow` et la rangée de moyen de
  paiement sont encore inline dans `livraison/configure.tsx` et `PaymentSheet.tsx`.
- **`Field`, `PlaceField`, `Medallion` n'existent pas en code** — refaits à la main
  dans `home.tsx`, `compte/lieu.tsx`, `compte/profil.tsx`, `compte/numero.tsx`,
  `livraison/configure.tsx`.
- **`PhoneField.tsx` n'a plus de composant en face** : Figma l'a absorbé dans
  `Field / Type=téléphone`. Même sort pour `TextArea` → `Field / Type=zone`.
- **`PaymentRow` / `TrackingRow`** ont été absorbés par `InfoRow` côté Figma
  (Partie XXIII) ; `transport/configure.tsx` et `livraison/configure.tsx` gardent
  `payBtn`/`payImg`, `course-active.tsx` et `suivi.tsx` gardent `payIllu`.
- **`design-system-figma-code-map.md` est périmé sur au moins 10 lignes** : il liste
  encore `PhoneField`, `PlaceRow`, `SettingsRow`, `SettingsGroup`, `PrestataireRow`,
  `ReceiptRow`, `TotalBar` et les quatre feuilles composites, tous supprimés ou
  absorbés depuis. Il ne connaît toujours pas `Field`, `PlaceField`, `ListRow`,
  `List`, `InfoRow`, `ActionTile`, `ActionTileRow`, `AlertBadge` ni `Medallion`.

## 6 · Les quatre feuilles composites, supprimées

`CountryPicker`, `PaymentSheet`, `MenuDrawer` et `WheelPicker` (Partie VIII) ont été
**supprimées volontairement** de `03 — Patterns`. Cohérent avec leur statut : des
compositions à instance unique, pas des objets réutilisés.

Deux conséquences à porter au journal :

- Ces quatre surfaces existent toujours en **code** (`components/CountryPicker.tsx`,
  `PaymentSheet.tsx`, `MenuDrawer.tsx`, `WheelPicker.tsx`) et n'ont désormais plus
  aucune source de design. Il faut qu'elles se composent **entièrement** de
  composants du système, sinon leur dérive ne sera plus détectable.
- Trois motifs propres au `MenuDrawer` perdent leur seul emplacement Figma :
  la carte d'affiliation `proCard` (jumelle de la bannière d'accueil, cf. §2
  `PromoCard`), la pastille de comptage `badgeWrap` (cf. §3 `Badge`/`Ton`), et les
  sous-rangées de mini tableau de bord `subRows`. Les deux premiers sont couverts par
  des entrées ci-dessus ; la troisième — les sous-rangées `subRows` de l'item
  Affiliation — est **laissée telle quelle pour l'instant** (décision du
  24 août 2026) : le tiroir sera repris en entier dans une passe de design dédiée,
  c'est là que le motif sera tranché.

> Note d'accès : le MCP ne liste que `Cover` et `01 — Primitives` comme pages du
> fichier. `02 — Composants` (`83:74`), `03 — Patterns` (`397:669`) et les pages
> d'exploration ne se lisent qu'en visant leur identifiant directement.

---

## 7 · Un écran entier hors système : la connexion

`app/index.tsx` est le **premier écran que voit un Client**, et c'est celui qui suit
le moins le système — trois objets y sont refaits à la main alors qu'ils existent :

| Ligne | Ce que fait l'écran | Ce qui existe |
|---|---|---|
| `index.tsx:75` | Carré bleu 80 px + le mot « fiw » en `Outfit.bold` 32, avec une ombre bleue écrite en dur (`shadowOpacity: 0.3`, `radius: 16`) | `Logo` (le vrai SVG, primitive `01`) et les styles d'effet `Fiw/shadow/*` |
| `index.tsx:32` | Drapeau **emoji** `🇸🇳` en `fontSize: 22` | `FlagChip` (drapeau SN réel importé, repli code ISO) |
| `index.tsx:97` | Champ téléphone maison — hauteur 56, liseré `medium`, fond `bg` | `Field / Type=téléphone` (et son pendant code `PhoneField.tsx`) |

Aucune décision de design là-dedans : c'est de l'antériorité, l'écran date d'avant la
bibliothèque. Il n'appelle donc **pas** de nouveau composant Figma — juste une
maquette qui emploie les trois existants, et un alignement du code derrière.

C'est aussi le seul écran où le mot-symbole est composé en texte : si la marque doit
pouvoir s'écrire ainsi, c'est une variante `Logo / Forme=mot-symbole` à ajouter ;
sinon l'écran passe au `Logo` vectoriel et le cas disparaît.
