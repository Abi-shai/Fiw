# Fiw Pro (Prestataire) — Prompt prototype Figma Make

> Session Figma Make dédiée à l'app **Fiw Pro**, côté Prestataire. Prototype basse fidélité interactif, mobile.

---

## Contexte produit

**Fiw Pro** est l'application mobile des Prestataires de Fiw — chauffeurs et livreurs basés à Dakar, Sénégal.

Cette session couvre uniquement **l'app Fiw Pro côté Prestataire**. L'app Client (Fiw) fait l'objet d'une session séparée.

Un Prestataire peut activer plusieurs services cumulables : Vélo Express · Moto · Voiture (Taxi) · Assistance Routière.

- Format : mobile portrait, 375 × 812 px
- Langue : **français uniquement** — pas d'anglais dans les libellés UI
- Monnaie : Franc CFA (F CFA)
- Contexte géographique : Dakar, Sénégal
- Commission Fiw : **14 %** par mission — prélevée automatiquement sur le Wallet à chaque mission terminée
- Fidélité : **basse fidélité** — wireframes interactifs, pas de design visuel

---

## Vocabulaire UI à respecter

| À utiliser | À ne jamais utiliser |
|---|---|
| Prestataire | chauffeur, conducteur, livreur, rider, driver |
| Client | passager, utilisateur |
| Mission | course (terme interne), order |
| Wallet | portefeuille, solde, compte |
| Recharger | alimenter, créditer |
| ÉvaluationClient | note client, avis conducteur, rating client |
| Statut prestataire | niveau, grade, rang |
| Activation | inscription au service, validation |
| Score de coopération | **Ne jamais apparaître dans l'UI** — interne uniquement |

---

## Flux prioritaire — Mission active Transport

C'est le flux le plus important. Le prototyper en premier et en entier.

**États de la Commande côté Prestataire (à utiliser pour nommer les écrans) :**
En_recherche → Assignée → En_route → Arrivée → En_cours → Terminée

### Écran 1 — Tableau de bord (hors mission)

Éléments obligatoires visibles en permanence :
- Toggle **« En ligne / Hors ligne »** — bien mis en avant, point d'entrée principal
- **Solde Wallet** affiché en haut (ex. « Wallet : 4 500 F CFA »)
- **Heatmap** zones de demande : rouge = forte · orange = moyenne · jaune = faible · gris = aucune
- Gains du jour / de la semaine
- Sélecteur de service actif (si plusieurs services validés : Moto · Voiture · etc.)

**Cas Wallet bloqué** (à prototyper comme variante) :
- Si le solde est insuffisant pour couvrir la prochaine commission, le Prestataire **ne peut pas passer En ligne**
- Overlay d'alerte : « Wallet insuffisant. Rechargez pour accéder aux missions. » + CTA « Recharger »
- Toggle En ligne est désactivé jusqu'à recharge effective

### Écran 2 — Mission entrante (état : En_recherche)

- Overlay ou écran plein, priorité absolue sur tout le reste
- Informations affichées : adresse de collecte · adresse de livraison · distance jusqu'au Client · prix estimé de la mission
- **Minuterie d'acceptation** : compte à rebours visible (barre de progression ou timer)
- Deux boutons : **Accepter** · **Refuser**
- Ne pas mentionner l'impact sur le score de coopération dans l'UI — le score est interne, invisible du Prestataire

### Écran 3 — Navigation vers le Client (état : En_route)

- Vue carte avec guidage GPS vers le point de collecte
- Rappel : adresse collecte + nom du Client
- Bouton principal : **« Signaler mon arrivée »**
- Actions secondaires : appel masqué · chat in-app

### Écran 4 — Arrivée (état : Arrivée)

- Confirmation envoyée au Client
- **Compteur Frais d'attente** — visible et actif après le délai gratuit :
  - 3 min si mission ≤ 1 000 F CFA
  - 5 min si mission > 1 000 F CFA
  - Tarif : 100 F CFA / minute (débité au Client automatiquement par GPS)
- Bouton principal : **« Démarrer la mission »** (disponible dès que le Client est présent)
- Actions secondaires : appel masqué · chat in-app

### Écran 5 — Mission en cours (état : En_cours)

- Vue carte avec guidage GPS vers la destination
- Bouton principal : **« Terminer la mission »**
- Actions secondaires : appel masqué · chat in-app

### Écran 6 — Clôture (état : Terminée)

- Résumé de la mission : distance · durée · montant brut · −14 % commission · **net perçu**
- La commission est débitée automatiquement du Wallet (pas d'action requise)
- Écran **ÉvaluationClient** : 1 à 5 étoiles (sans label « privée » dans l'UI — juste un écran de notation normal côté Prestataire ; la note n'est jamais visible côté Client)

---

## Flux secondaires

### Wallet

- Solde en temps réel (affiché en permanence sur le tableau de bord)
- **Recharger** : choix Mobile Money (Wave · Orange Money · Free Money) → saisie montant → confirmation
- **Historique Wallet** : liste des opérations — crédits (recharges) + débits (commissions par mission)
- Détail par mission : montant brut · commission 14 % · net perçu
- **Alerte solde bas** : notification push + accès direct à Recharger

### Onboarding & Activation

1. Inscription (prénom, nom, téléphone, mot de passe)
2. **Choisir mes services** — sélection cumulable : Vélo Express · Moto · Voiture (Taxi) · Assistance Routière
3. **Soumettre mes documents** — par service :
   - Voiture : CNI/passeport, permis, immatriculation, visite technique, photos véhicule ext+int, photo Prestataire
   - Moto : + immatriculation, permis, carte grise, assurance, photos moto + casque
4. **Suivi activation par service** : En attente · Validé · Refusé
   - Si Refusé : le Prestataire peut resoumettre un dossier corrigé
5. **Dashboard services** : activer / désactiver chaque service validé

### Optimiser mes revenus

- **Heatmap** — carte des zones de forte demande
- **Direction programmée** — définir une direction préférée pour filtrer les missions proposées (ex. fin de journée vers le domicile). Mentionné spontanément dans les entretiens comme principale raison de rester sur Yango — à rendre visible dans le prototype
- **Statut Prestataire** — niveau actuel : Bronze · Argent · Or · Diamant. Barre de progression (courses + note moyenne). Avantages débloqués par niveau.
- **Mes gains** — vue jour · semaine · mois · objectif de revenus

### Mission Livraison

- Mission entrante : adresse collecte · adresse livraison · description colis
- **Livraison groupée** : liste des colis du trajet · vue tournée optimisée
- **Scanner à la collecte** : scan ou saisie du numéro de suivi par colis
- **Confirmer la remise** : colis par colis → déclenche notification Client

### Mon profil & Documents

- Informations personnelles (nom, téléphone, photo)
- Mes documents par service : liste avec dates d'expiration · alerte avant expiration
- Mettre à jour un document (avant expiration pour éviter blocage d'accès)
- Préférences notifications

### AffiliéRéseau (recrutement Prestataires)

- Activer le rôle AffiliéRéseau depuis le compte Prestataire (2 % sur les courses des Prestataires recrutés)
- Partager son code : QR code · code texte
- Tableau de bord : Prestataires actifs recrutés · courses générées · commissions

---

## Navigation globale

```
4 onglets principaux :

Tableau de bord
├── Toggle En ligne / Hors ligne
├── Wallet (solde + alerte)
├── Heatmap
└── Mission entrante (overlay prioritaire)

Missions
└── Historique des missions terminées (filtre service / période)

Revenus
├── Wallet (solde + recharge + historique)
├── Gains (jour / semaine / mois)
├── Statut Prestataire (niveau + progression)
└── Direction programmée

Profil
├── Informations
├── Mes documents (par service)
├── AffiliéRéseau
└── Paramètres (notifications, langue, aide, déconnexion)
```

---

## Mécaniques UX clés à rendre cliquables

| Mécanique | Écran | Comment la montrer |
|---|---|---|
| Wallet bloqué | Tableau de bord (variante) | Overlay d'alerte, Toggle En ligne désactivé |
| Minuterie d'acceptation | Écran 2 (Mission entrante) | Compte à rebours visible — barre de progression ou timer |
| Compteur frais d'attente | Écran 4 (Arrivée) | Timer visible qui tourne (info pour Prestataire, débité au Client) |
| Débit commission | Écran 6 (Clôture) | Affichage : brut / −14% / net — commission automatique, pas d'action requise |
| Direction programmée | Revenus | Formulaire de configuration direction préférée |
| Heatmap | Tableau de bord | Carte colorée (rouge / orange / jaune / gris) |
| Score de coopération | — | **Ne jamais apparaître dans l'UI** |

---

## Hors périmètre pour cette session

- App Fiw (Client) — session séparée
- AffiliéPartenaire (entreprises) — modèle non finalisé, à breadboarder avec l'engineering avant
- Covoiturage prestataire — flux publication d'offre complexe, reporter
- Location Longue Durée (propriétaires véhicule/parking) — reporter
- Yobanté côté Prestataire — reporter après flux livraison standard
- Interface Wolof — « Bientôt disponible »
- Surface visuelle (couleurs, typographie, iconographie) — étape suivante
