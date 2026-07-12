# Fiw (Client) — Prompt prototype Figma Make

> Session Figma Make dédiée à l'app **Fiw**, côté Client. Prototype basse fidélité interactif, mobile.

---

## Contexte produit

**Fiw** est une application mobile multi-services de mobilité urbaine et de livraison basée à Dakar, Sénégal.

Cette session couvre uniquement **l'app Fiw côté Client** — passager ou expéditeur de colis. L'app Prestataire (Fiw Pro) fait l'objet d'une session séparée.

- Format : mobile portrait, 375 × 812 px
- Langue : **français uniquement** — pas d'anglais dans les libellés UI
- Monnaie : Franc CFA (F CFA)
- Contexte géographique : Dakar, Sénégal
- Paiement : Mobile Money (Wave, Orange Money, Free Money) + espèces — **pas de carte bancaire**
- Fidélité : **basse fidélité** — wireframes interactifs, pas de design visuel

---

## Vocabulaire UI à respecter

| À utiliser | À ne jamais utiliser |
|---|---|
| Client | passager, utilisateur, acheteur |
| Prestataire | chauffeur, conducteur, livreur |
| Course | order, commande (dans l'UI) |
| Frais de rapprochement | frais de déplacement, surplus, supplément |
| Option A / Option B | option standard, option rapide, option premium |
| Avis | note, rating |
| Contacts de confiance | contacts d'urgence |
| Wallet | portefeuille, solde (ce mot est dans Fiw Pro, pas dans Fiw) |

---

## Flux prioritaire — Transport

C'est le flux le plus important. Le prototyper en premier et en entier.

**États de la Commande (à utiliser pour nommer les écrans) :**
Créée → En_recherche → Assignée → En_route → Arrivée → En_cours → Terminée

### Écran 1 — Accueil

- Tuile **Transport** mise en avant : plus grande, avec une barre de saisie départ/destination intégrée directement
- Tuiles secondaires en dessous : Livraison · Location · Assistance
- Cloche de notifications en haut à droite
- **Bandeau persistant** si une course est déjà En_cours (lien vers la course active)
- Note de positionnement visible sur l'accueil ou dans le flux Transport : **« Prix fixe — jamais de majoration »** — c'est le premier argument d'acquisition validé en entretiens, à ne pas enfouir

### Écran 2 — Saisie Transport

- Champ **Départ** (auto-rempli avec position GPS, modifiable)
- Champ **Destination** (recherche adresse ou pin sur carte)
- Sélection de la gamme : **Simple · Confort · Prestige · Covoiturage**

### Écran 3 — Prix & Frais de rapprochement

- **Prix garanti affiché en évidence** avec la mention « Prix fixe — jamais de majoration »
- Si des frais de rapprochement s'appliquent : écran de choix obligatoire avant de continuer. Les 3 conditions non-négociables (issues de la recherche terrain) sont toutes visibles :
  1. Prix total affiché sur chaque option
  2. Présenté comme un choix binaire (le Client choisit, ce n'est jamais imposé)
  3. Temps estimé affiché sur chaque option
- **Option A** — Attendre un prestataire proche · Prix standard · Temps estimé : [X min]
- **Option B** — Prestataire plus éloigné, prise en charge rapide · Frais de rapprochement affichés · Prix total affiché · Temps estimé : [X min]

### Écran 4 — Paiement

- Choix : **Wave · Orange Money · Free Money · Espèces**

### Écran 5 — Confirmation (état : Créée)

- Récapitulatif : départ, destination, gamme, prix total, moyen de paiement
- Bouton principal : **« Confirmer la course »**
- Lien « Modifier » pour revenir en arrière

### Écran 6 — Recherche prestataire (état : En_recherche)

- Carte de Dakar avec animation de recherche
- Texte : « Nous cherchons un prestataire disponible… »
- Bouton « Annuler » (sans frais à ce stade)

### Écran 7 — Prestataire trouvé (état : Assignée)

- Fiche Prestataire : photo · prénom · véhicule · plaque · note (étoiles) · ID (ex. AUT-0042)
- Carte avec position du Prestataire
- ETA affiché : « Arrivée dans X min »
- Bouton « Annuler » (sans frais tant qu'il est en route)
- Actions : appel masqué · chat in-app

### Écran 8 — Prestataire en route (état : En_route)

- Carte avec position du Prestataire en temps réel + ETA
- Actions disponibles : **appel masqué · chat in-app · partage trajet · bouton SOS**
- Le bouton SOS est **persistant et toujours visible** (jamais enfoui dans un menu)
- Annulation encore gratuite

### Écran 9 — Prestataire arrivé (état : Arrivée)

- Notification « Votre prestataire est arrivé »
- Compteur **Frais d'attente** visible — démarre automatiquement après le délai gratuit :
  - 3 min si course ≤ 1 000 F CFA
  - 5 min si course > 1 000 F CFA
  - Tarif : 100 F CFA / minute
- Annulation payante à partir de cet état
- Actions : appel masqué · chat in-app · bouton SOS

### Écran 10 — Course en cours (état : En_cours)

- Carte avec trajet actif
- Actions : appel masqué · chat in-app · partage trajet · bouton SOS
- Pas de bouton d'annulation (course démarrée)

### Écran 11 — Clôture (état : Terminée)

- Reçu de course : départ · destination · durée · prix final · moyen de paiement
- Puis écran **Avis sur le Prestataire** : 1 à 5 étoiles + commentaire optionnel (public)

---

## Flux secondaires

### Livraison

Saisie adresse collecte + adresse livraison → Description colis → Choix du mode :
- **Option A** — Express (immédiat)
- **Option B** — Livraison groupée (prix réduit, léger délai d'attente — plusieurs colis combinés dans un même trajet)

Puis : suivi livreur en temps réel → Confirmation remise → Avis.

**Yobanté** (interrégional) — sous-flux livraison :
- Saisie ville de départ + ville de destination
- Un seul paiement côté Client, l'app distribue aux Prestataires
- Suivi par étapes : **Récupéré → En route → Arrivé en ville → Remis**
- Numéro de suivi format YOB-AAAAMMJJ-XXX

### Onboarding

Inscription (numéro de téléphone) → OTP → Champ optionnel **« Qui vous a recommandé ? »** (nom ou code — les recommandations à Dakar sont orales, pas seulement via liens) → Accueil.

### Mon compte

- Profil (nom, téléphone, photo)
- Moyens de paiement (Mobile Money)
- Contacts de confiance — personnes qui reçoivent notifications de départ et alertes SOS
- Historique des courses (filtre service / période)
- Affiliation & Fidélité :
  - Activer le rôle **AffiliéRéseau** (2 % de commission sur les courses générées par les personnes recrutées)
  - Partager son code (QR code + code texte)
  - Tableau de bord AffiliéRéseau
  - Points de fidélité + conversion (course gratuite / réduction)

---

## Navigation globale

```
Tab bar ou menu hamburger :

Accueil
├── Transport (flux principal)
├── Livraison
├── Location
└── Assistance

Mon compte
├── Profil
├── Moyens de paiement
├── Contacts de confiance
├── Historique
└── Affiliation & Fidélité

[Bandeau persistant si course En_cours — visible depuis tous les écrans]
[Bouton SOS — persistant depuis tous les écrans de course active]
```

---

## Mécaniques UX clés à rendre cliquables

| Mécanique | Écran | Comment la montrer |
|---|---|---|
| Prix garanti, pas de surge | Accueil + écran Prix | Mention visible « Prix fixe — jamais de majoration » |
| Frais de rapprochement | Écran 3 | 2 ou 3 cartes cliquables avec prix total + temps estimé sur chaque |
| Compteur frais d'attente | Écran 9 (Arrivée) | Timer visible qui tourne côté Client (informatif) |
| Bouton SOS | Écrans 8, 9, 10 | Bouton rouge persistant, pas dans un menu |
| Partage trajet | Écrans 8, 10 | Bouton « Partager trajet » → lien vers position live du Prestataire |
| Bandeau course en cours | Accueil | Bandeau cliquable si Commande active |
| Notation asymétrique | Écran 11 | Avis sur le Prestataire (1–5 étoiles) — public ; jamais de notation du Client dans Fiw |

---

## Hors périmètre pour cette session

- Fiw Pro (application Prestataire) — session séparée
- AffiliéPartenaire (entreprises) — modèle non finalisé
- Transport de marchandises — « Bientôt disponible »
- Covoiturage interurbain — flux complexe, reporter
- Interface Wolof — « Bientôt disponible »
- Surface visuelle (couleurs, typographie, iconographie) — étape suivante
