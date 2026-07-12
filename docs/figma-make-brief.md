# Fiw — Brief prototype Figma Make

> Document à coller dans une session Figma Make pour démarrer un prototype basse fidélité interactif de l'application mobile Fiw.

---

## 1. Contexte produit

**Fiw** est une application mobile multi-services de mobilité urbaine et de livraison basée à Dakar, Sénégal. Il existe deux applications distinctes :

- **Fiw** — application Client (passager / expéditeur)
- **Fiw Pro** — application Prestataire (chauffeur / livreur)

Les deux sont des apps mobiles natives (iOS / Android). Le prototype doit respecter les proportions d'un écran mobile standard (375 × 812 px, format portrait).

L'interface est **entièrement en français**. Pas d'anglais dans les libellés UI.

---

## 2. Vocabulaire UI — termes à utiliser

| Concept | Libellé dans Fiw (Client) | Libellé dans Fiw Pro (Prestataire) |
|---|---|---|
| Demande de service | Course | Mission |
| Demandeur | (le Client) | Client |
| Exécutant | Prestataire | (le Prestataire) |
| Compte de paiement commissions | — | Wallet |
| Note donnée au Prestataire par le Client | Avis | — |
| Note interne donnée au Client par le Prestataire | — | ÉvaluationClient (jamais visible côté Client) |

**Termes à ne jamais utiliser dans les écrans :** chauffeur, conducteur, livreur, passager, utilisateur, portefeuille, solde, rider, driver, order.

---

## 3. Flux prioritaires à prototyper

Ce sont les deux flux du prochain jalon. Les prototyper en premier.

### Flux 1 — Transport (app Fiw, côté Client)

**États de la Commande dans ce flux :** Créée → En_recherche → Assignée → En_route → Arrivée → En_cours → Terminée. Ces états informent les transitions d'écrans.

**Parcours complet :**

1. **Accueil** — Tuile Transport mise en avant avec barre de saisie départ/destination. Autres tuiles : Livraison, Location, Assistance (secondaires). Bandeau persistant si une course est déjà En_cours.
2. **Saisie** — Champ départ (auto-rempli avec position GPS) + champ destination. Choix de la gamme : Simple · Confort · Prestige · Covoiturage.
3. **Prix & frais de rapprochement** — Le prix garanti doit être affiché de façon visible et explicite : **« Prix fixe — jamais de majoration »** (c'est le premier levier d'acquisition identifié en entretiens, à ne pas enfouir). Si des frais de rapprochement s'appliquent, l'écran présente un choix obligatoire avec les 3 conditions non-négociables respectées : (1) prix total affiché avant confirmation, (2) présenté comme un choix binaire, (3) temps estimé affiché et crédible :
   - **Option A** — Attendre un prestataire proche. Prix standard. Temps d'attente estimé affiché.
   - **Option B** — Prise en charge rapide par un prestataire plus éloigné. Frais de rapprochement + prix total affichés. Temps d'attente estimé affiché.
4. **Paiement** — Choisir : Wave · Orange Money · Free Money · Espèces.
5. **Confirmation** (état : Créée) — Récapitulatif (départ, destination, gamme, prix, moyen de paiement). Bouton « Confirmer la course ».
6. **Recherche prestataire** (état : En_recherche) — Écran d'attente avec carte + animation. Bouton « Annuler » disponible (sans frais).
7. **Prestataire trouvé** (état : Assignée) — Fiche : photo, prénom, véhicule, plaque, note, ID. Carte avec position du prestataire. Bouton « Annuler » (sans frais tant que En_route).
8. **Prestataire en route** (état : En_route) — Carte avec position en temps réel + ETA. Actions : appel masqué, chat in-app, partage trajet, bouton SOS. Annulation encore gratuite.
9. **Prestataire arrivé** (état : Arrivée) — Notification « Votre prestataire est arrivé ». Compteur frais d'attente visible et actif après le délai gratuit (3 min si course ≤ 1 000 F CFA, 5 min si > 1 000 F CFA — 100 F CFA/min). Annulation devient payante à partir de maintenant.
10. **Course en cours** (état : En_cours) — Carte trajet actif. Actions : appel masqué, chat in-app, partage trajet, bouton SOS.
11. **Clôture** (état : Terminée) — Reçu. Puis écran de notation : 1 à 5 étoiles + commentaire optionnel (Avis public sur le Prestataire).

---

### Flux 2 — Mission active Transport (app Fiw Pro, côté Prestataire)

**États de la Commande dans ce flux (côté Prestataire) :** En_recherche → Assignée → En_route → Arrivée → En_cours → Terminée.

**CTAs disponibles par état :**

| État | Bouton principal | Bouton secondaire |
|---|---|---|
| Mission entrante (En_recherche) | Accepter | Refuser |
| En_route (vers Client) | Signaler mon arrivée | Appel masqué / Chat |
| Arrivée (attente Client) | Démarrer la mission | Appel masqué / Chat |
| En_cours (trajet actif) | Terminer la mission | Appel masqué / Chat |
| Terminée | ÉvaluationClient | — |

**Parcours complet :**

1. **Tableau de bord** (hors mission) — Toggle « En ligne / Hors ligne » bien visible. Solde Wallet affiché en permanence. Heatmap zones de demande (rouge = forte demande, orange = moyenne, jaune = faible). Si Wallet bloqué (solde insuffisant) : overlay d'alerte avec CTA « Recharger » — le Prestataire ne peut pas passer En ligne.
2. **Mission entrante** (état : En_recherche) — Overlay ou écran dédié : adresse collecte, adresse livraison, distance jusqu'au Client, prix estimé de la mission. Minuterie d'acceptation visible (compte à rebours). Deux boutons : **Accepter** / **Refuser** (Refuser affecte le score de coopération — ne pas l'écrire dans l'UI, le score est interne et invisible).
3. **Navigation vers le Client** (état : En_route) — Guidage GPS vers le point de collecte. Bouton « Signaler mon arrivée ». Appel masqué + chat accessibles.
4. **Arrivée** (état : Arrivée) — Confirmation d'arrivée envoyée au Client. Compteur frais d'attente visible et actif après le délai gratuit (3 min si course ≤ 1 000 F CFA, 5 min si > 1 000 F CFA — 100 F CFA/min, débité au Client automatiquement par GPS). Bouton « Démarrer la mission » disponible dès que le Client monte.
5. **Mission en cours** (état : En_cours) — Guidage GPS vers destination. Bouton « Terminer la mission ». Appel masqué + chat accessibles.
6. **Clôture** (état : Terminée) — Commission 14 % débitée automatiquement du Wallet (affichée : montant brut / −14 % commission / net perçu). ÉvaluationClient : 1–5 étoiles, privée, jamais visible côté Client.

---

## 4. Flux secondaires (à inclure mais moins prioritaires)

### App Fiw (Client)
- **Livraison** — Saisie adresse collecte + livraison → Description colis → Option A (express) ou Option B (livraison groupée, prix réduit, léger délai) → Suivi livreur en temps réel → Confirmation remise → Avis.
- **Yobanté** — Livraison interrégionale. Saisie ville départ + ville destination. Un seul paiement. Suivi étapes : Récupéré → En route → Arrivé en ville → Remis.
- **Onboarding** — Inscription (téléphone + OTP) → Champ optionnel « Qui vous a recommandé ? » → Accueil.
- **Compte** — Profil, moyens de paiement, contacts de confiance, historique courses.

### App Fiw Pro (Prestataire)
- **Wallet** — Solde, recharge via Mobile Money, historique (montant brut / commission 14 % / net). Alerte solde bas + blocage d'accès si Wallet vide.
- **Onboarding** — Inscription → Choix services (Vélo / Moto / Voiture / Assistance) → Soumission documents → Suivi activation (En attente / Validé / Refusé).
- **Optimiser mes revenus** — Heatmap, direction programmée, statut prestataire (Bronze / Argent / Or / Diamant), gains jour/semaine/mois.

---

## 5. Navigation globale

### App Fiw (Client) — 5 sections principales
```
Accueil (Transport en avant)
└── Transport → Livraison → Location → Assistance

Mon compte
├── Profil
├── Moyens de paiement
├── Contacts de confiance
├── Historique
└── Affiliation & Fidélité

[Bandeau persistant si course en cours]
[Bouton SOS accessible depuis toute course active]
```

### App Fiw Pro (Prestataire) — 4 onglets principaux
```
Tableau de bord (Toggle En ligne / Hors ligne + Wallet + Heatmap)
Missions (historique)
Revenus (Wallet + gains + statut)
Profil (documents + paramètres)
```

---

## 6. Mécaniques UX clés à rendre visibles dans le prototype

| Mécanique | Où | Comment la montrer |
|---|---|---|
| Frais de rapprochement | Flux Transport, étape 3 | Écran dédié avec 2 (ou 3) cartes cliquables Option A / B / C — prix total + temps estimé obligatoires sur chaque option |
| Prix garanti (pas de surge) | Fiw, accueil + transport étape prix | Mention proéminente « Prix fixe — jamais de majoration » — c'est le premier levier d'acquisition, ne pas l'enfouir |
| Wallet vide = blocage | Fiw Pro, tableau de bord | Overlay d'alerte avec CTA « Recharger » — Toggle En ligne désactivé jusqu'à recharge |
| Minuterie d'acceptation | Fiw Pro, mission entrante | Compte à rebours visible (barre de progression ou timer) |
| Frais d'attente | Les deux apps, état Arrivée | Fiw Pro : compteur qui tourne (actif) ; Fiw : compteur visible (information Client) |
| SOS | Fiw, états En_route / Arrivée / En_cours | Bouton persistant sur la carte, toujours accessible |
| Notation asymétrique | Clôture des deux apps | Fiw : écran Avis (public, 1–5 étoiles) ; Fiw Pro : écran ÉvaluationClient (sans label « privée » dans l'UI — juste une notation normale côté Prestataire) |
| Score de coopération | Fiw Pro, refus de mission | Ne jamais l'afficher dans l'UI — interne uniquement |

---

## 7. Contraintes de design

- **Format :** mobile portrait, 375 × 812 px
- **Fidélité :** basse fidélité — wireframe interactif, pas de design visuel. Pas de couleurs de marque, pas d'icônes élaborées. L'objectif est de tester les parcours, pas l'esthétique.
- **Langue :** français uniquement
- **Contexte géographique :** Dakar, Sénégal. La monnaie est le Franc CFA (F CFA). Les cartes montrent Dakar.
- **Paiement :** pas de carte bancaire. Mobile Money uniquement (Wave, Orange Money, Free Money) + espèces.
- **Connectivité :** l'app doit fonctionner sur réseau mobile standard (pas d'hypothèse haut débit).

---

## 8. Ce qui est hors périmètre pour ce prototype

- AffiliéPartenaire (entreprises) — modèle non finalisé
- Transport de marchandises — « Bientôt disponible »
- Covoiturage interurbain — flux complexe, reporter
- Interface Wolof — « Bientôt disponible »
- Surface visuelle (couleurs, typographie, iconographie Fiw) — étape suivante
