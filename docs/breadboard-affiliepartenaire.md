# Breadboard — Affilié Partenaire (Fiw Pro)

> Session de conception du 27 juin 2026.
> Vocab tranché : Point Express / Wallet Partenaire / Client sauvegardé / Code prestataire / Course (pas Mission).
> Architecture : Home distinct selon type de compte à la connexion (ADR 0006).

---

## Vocabulaire UI (rappel)

| Terme canonique | Affiché dans l'UI |
|---|---|
| Commande | Course |
| Wallet Partenaire | Mon Wallet |
| Point Express | Point Express |
| Client sauvegardé | (liste des clients) |
| Prestataire | Chauffeur / Livreur (dans les listes) |
| Code prestataire | Code (format FIW-XXXXX) |

---

## Navigation

### Bottom nav — commune aux deux modes (limité et actif)

```
[ Accueil ]  [ Commander ]  [ Wallet ]  [ Profil ]
```

**En mode limité (En attente de validation) :**
- Commander et Wallet : accessibles mais contenu bloqué (bannière + lien vers suivi)
- Accueil et Profil : pleinement accessibles

**En mode actif :**
- Les 4 onglets pleinement accessibles

---

## Écrans par mode

### Home — mode limité

```
┌─────────────────────────────────┐
│  [Nom du Point Express]         │
│                                 │
│  Votre Point Express est        │
│  en cours de validation         │
│                                 │
│  ● Dossier reçu         ✓      │
│  ● En cours d'examen    ←      │
│  ● Validé               ○      │
│                                 │
│  Délai estimé : 2–3 jours      │
│                                 │
│  ┌─────────────────────────┐   │
│  │  Mon QR code            │   │
│  │  [aperçu QR grisé]      │   │
│  │  Pas encore actif       │   │
│  │  Télécharger  Partager  │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

### Home — mode actif

```
┌─────────────────────────────────┐
│  [Nom du Point Express]         │
│                                 │
│  [ Aujourd'hui │ Ce mois │ Total ]
│                                 │
│  Courses générées     Commission│
│       12               4 800 F  │
│                                 │
│  Wallet : 3 200 F  [Retirer]   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  Mon QR code            │   │
│  │  [aperçu QR actif]      │   │
│  │  Télécharger  Partager  │   │
│  └─────────────────────────┘   │
│                                 │
│  Courses récentes               │
│  ─────────────────              │
│  Fatou Diallo · Almadies  420F  │
│  Moussa Ndiaye · Plateau  550F  │
│  …                              │
└─────────────────────────────────┘
```

### Commander — mode limité

```
┌─────────────────────────────────┐
│  Commander pour un client       │
│                                 │
│  ┌─────────────────────────┐   │
│  │  Disponible dès         │   │
│  │  l'activation de votre  │   │
│  │  Point Express          │   │
│  │                         │   │
│  │  [Voir mon suivi] →     │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

### Wallet — mode limité

```
┌─────────────────────────────────┐
│  Mon Wallet                     │
│                                 │
│  ┌─────────────────────────┐   │
│  │  Disponible dès         │   │
│  │  l'activation de votre  │   │
│  │  Point Express          │   │
│  │                         │   │
│  │  [Voir mon suivi] →     │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

---

## JS1 — S'inscrire et suivre sa validation

### Inscription — Infos

- "Suivant" [si tout rempli] → Inscription — Pièces
- "Suivant" [si champ manquant] → reste sur place, champ signalé
- Retour → [quitte le flow]

```
[ Nom du siège / NINEA / RCCM / Forme juridique /
  Adresse Point Express / Téléphone / Nom du gérant /
  Numéro Mobile Money ]
```

### Inscription — Pièces

- "Soumettre" [si tout uploadé] → Confirmation de soumission
- "Soumettre" [si pièce manquante] → reste sur place, pièce signalée
- Retour → Inscription — Infos

```
[ Upload RCCM / NINEA / CNI du gérant / Contrat d'affiliation ]
```

### Confirmation de soumission

- "Accéder à mon espace" → Home (mode limité)

```
[ Message de confirmation / Délai estimé 2–3 jours ]
```

### Home (mode limité) — voir écran ci-dessus

- Tap card QR inactif → Mon QR code (inactif)
- Tap "Commander" (nav) → Commander (mode limité)
- Tap "Wallet" (nav) → Wallet (mode limité)

### [Notification push — validation acceptée]

"Votre Point Express est activé !" → Home (mode actif)

### [Notification push — dossier refusé]

"Votre dossier nécessite une correction" → Dossier refusé

### Dossier refusé

- "Corriger mon dossier" → Inscription — Infos (pré-remplie)
- "Contacter le support" → Support

```
[ Motif exact du refus / Quelle pièce ou info corriger /
  "Vous pouvez corriger et soumettre à nouveau" ]
```

---

## JS2 — Commander pour un nouveau client

### Commander (onglet)

- "Nouveau client" → Saisie client
- Sélectionner un Client sauvegardé → Confirmation de course

```
[ Liste des Clients sauvegardés : nom + téléphone +
  dernière destination ]
```

**EMPTY STATE (aucun client encore)**
```
[ "Vous n'avez encore commandé pour personne —
   appuyez sur 'Nouveau client' pour lancer
   votre première course" ]
```

### Saisie client

- "Voir le prix" → Confirmation de course
- Retour → Commander

```
[ Nom / Téléphone / Destination ]
```

### Confirmation de course

- "Lancer la course" → Recherche de chauffeur
- "Modifier" → Saisie client
- Annuler → Commander

```
[ Nom client / Départ = Point Express (fixe, non modifiable) /
  Destination / Type de service /
  PRIX TOTAL ESTIMÉ bien visible ]
```

### Recherche de chauffeur

- Annuler la recherche → Commander

```
[ Animation "Recherche d'un chauffeur disponible…" ]
```

→ chauffeur trouvé → Course en cours
→ aucun chauffeur → Aucun chauffeur disponible

### Aucun chauffeur disponible

- "Réessayer" → Recherche de chauffeur
- Retour → Commander

```
[ "Aucun chauffeur disponible pour le moment —
   réessayez dans quelques minutes" /
   Aucune somme débitée ]
```

### Course en cours

- Annuler la course [fenêtre 30 s] → Annulation
- Voir détails → Détail de course

```
[ Statut / Chauffeur assigné / Temps estimé ]
```

### Annulation

- Confirmer l'annulation → Commander
- Garder la course → Course en cours

```
[ Règle d'annulation (frais éventuels selon délai) ]
```

**[SMS envoyé automatiquement au client]**
```
"Une course a été commandée pour vous
 depuis [Nom Point Express]"
```

---

## JS3 — Relancer une course pour un client existant

### Commander (onglet)

- Sélectionner un Client sauvegardé → Confirmation de course

```
[ Liste : nom + téléphone + dernière destination ]
```

### Confirmation de course

- "Modifier la destination" → Saisie destination
- "Lancer la course" → Recherche de chauffeur
- Retour → Commander

```
[ Nom client / Départ = Point Express (fixe) /
  Destination précédente pré-remplie /
  PRIX TOTAL ESTIMÉ visible ]
```

### Saisie destination

- "Voir le prix" → Confirmation de course
- Retour → Confirmation de course

```
[ Champ destination ]
```

*(suite identique à JS2 : Recherche de chauffeur → Course en cours,
mêmes chemins d'échec et d'annulation)*

**[SMS envoyé automatiquement au client]**
```
"Une course a été commandée pour vous
 depuis [Nom Point Express]"
```

---

## JS4 — Afficher et partager son QR code

### Mon QR code Point Express

*(accessible via card Home ou Profil)*

- "Plein écran" → QR code plein écran
- "Télécharger" → [toast "QR code enregistré"]
- "Partager" → Partage natif

```
[ QR code / Nom du Point Express /
  SI INACTIF : bandeau "QR pas encore actif —
  il fonctionnera dès la validation de votre
  Point Express" ]
```

### QR code plein écran

- "Télécharger" → [toast "QR code enregistré"]
- "Partager" → Partage natif
- Retour → Mon QR code Point Express

```
[ QR code agrandi / Nom du Point Express ]
```

**[Côté client — scan d'un QR encore inactif]**
```
Page d'attente :
"Ce lieu arrive bientôt sur Fiw"
+ incitation à installer l'app
```

---

## JS5 — Suivre et retirer ses commissions

### Mon Wallet (onglet)

- Voir détail d'une commission → Détail commission
- "Retirer" [si Actif + solde ≥ 1 000 F] → Récapitulatif de retrait
- "Retirer" [si solde < 1 000 F] → Message inline :
  "Minimum 1 000 F pour retirer — il vous manque X F"
- "Retirer" [si Gelé] → Message inline :
  "Retraits momentanément suspendus — contactez le support" + bouton Support

```
[ Solde disponible / Historique commissions /
  Commission 4 % affichée par ligne ]
```

**EMPTY STATE (aucune commission encore)**
```
[ "Pas encore de gains — ils apparaîtront ici
   dès que des courses seront commandées
   depuis votre Point Express" ]
```

### Détail commission

- Retour → Mon Wallet

```
[ Date / Course concernée / Montant ]
```

### Récapitulatif de retrait

- "Confirmer le retrait" → Traitement
- "Modifier le numéro" → Saisie numéro Mobile Money
- Annuler → Mon Wallet

```
[ EN GRAND : "Vous retirez X F vers le [numéro Mobile Money]" /
  Frais éventuels / Délai estimé d'arrivée ]
```

### Saisie numéro Mobile Money

- "Valider" → Récapitulatif de retrait
- Retour → Récapitulatif de retrait

```
[ Champ numéro / Opérateur détecté (Wave / OM / Free) ]
```

### Traitement

→ automatiquement → Confirmation [succès]
→ automatiquement → Échec de retrait [si échec]

### Confirmation [succès]

- Retour → Mon Wallet

```
[ ✓ "Retrait envoyé" / Montant / Numéro /
  Statut "En cours d'arrivée" ]
```

### Échec de retrait

- "Réessayer" → Récapitulatif de retrait
- "Contacter le support" → Support
- Retour → Mon Wallet

```
[ ✗ Cause (numéro invalide / problème réseau /
  solde indisponible) + ce qu'il faut faire /
  "L'argent n'a pas quitté votre Wallet" ]
```

---

## Profil (onglet)

```
[ Nom du gérant / Nom du siège ]
[ Mon QR code Point Express → JS4 ]
[ Prestataires favoris → liste + ajouter par Code prestataire ]
[ Mes informations → modifier ]
[ Support ]
[ Se déconnecter ]
```

### Prestataires favoris

- "Ajouter un prestataire" → Saisie code prestataire
- Sélectionner un prestataire → Détail prestataire

```
[ Liste : photo + nom + type (chauffeur / livreur) + note ]
```

**EMPTY STATE**
```
[ "Ajoutez vos chauffeurs habituels par leur
   code prestataire pour les retrouver facilement" ]
```

### Saisie code prestataire

- "Ajouter" [code valide] → [toast "Prestataire ajouté"] → Prestataires favoris
- "Ajouter" [code invalide] → message d'erreur inline
- Retour → Prestataires favoris

```
[ Champ code (format FIW-XXXXX) ]
```

---

## Machines d'état — AffiliéPartenaire

```
En attente → Actif    : déclenché par Fiw admin
En attente → Refusé   : décision admin, motif communiqué
Refusé → En attente   : Affilié Partenaire corrige et resoumet
Actif → Gelé          : décision admin
Gelé → Actif          : décision admin
```

| État       | Accueil          | Commander | Wallet          | QR code |
|------------|------------------|-----------|-----------------|---------|
| En attente | Stepper + QR     | Bannière  | Bannière        | Inactif |
| Actif      | Métriques + QR   | Actif     | Actif           | Actif   |
| Gelé       | Métriques + QR   | Actif     | Retrait bloqué  | Actif   |
| Refusé     | Écran dossier refusé (hors nav normale) | | | |
