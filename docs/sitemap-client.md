# Sitemap — Fiw (Client)

> Construit depuis la user story map FigJam (23 juin 2026). Remplace `docs/sitemap.md` (obsolète — ignorer).
> Règle : la USM prime sur tous les docs existants. Covoiturage = type de Commande standard (mission entrante). AffiliéPartenaire = Fiw Pro uniquement (ADR 0003).

---

## 1. Onboarding (hors session)

Accessible uniquement avant connexion.

- **Créer mon compte** — inscription par numéro de téléphone
- **Vérifier mon identité** — validation OTP
- **Signaler qui m'a recommandé** — code ou nom (recommandation orale traçable, non obligatoire)
- **Se reconnecter** — login + récupération de mot de passe

> **À la conception de l'onboarding — saisie du numéro.** Le champ téléphone doit
> être **celui du changement de numéro** (`app/compte/numero.tsx`, atteint depuis
> Profil → « Modifier ») : composant **`PhoneField`** — chip indicatif (drapeau +
> `+code` + caret) ouvrant le **`CountryPicker`** (feuille 3 crans, barre de
> recherche, liste monde), et numéro **formaté par pays** (`constants/countries.ts`).
> **Tous les pays sont acceptés** — c'est déjà tranché côté profil, l'onboarding ne
> doit pas re-restreindre à +221. À réutiliser tel quel, ne pas re-dessiner un champ
> d'onboarding séparé : c'est la **même saisie**, elle doit se présenter pareil des
> deux côtés.

---

## 2. Accueil

Point d'entrée post-connexion. Donne accès à tous les services.

- Tuile **Transport** (prioritaire + barre de saisie départ/destination — ADR 0001)
- Tuile **Livraison**
- Tuile **Location**
- Tuile **Assistance**

---

## 3. Transport

### 3.1 Saisie & configuration
- Saisir départ / destination
- Choisir la gamme : Simple · Confort · Prestige · Covoiturage
- Voir le prix garanti (fixe, sans surge pricing)
- Décider sur les Frais de rapprochement : Option A · Option B
- Choisir le moyen de paiement : Wave · Orange Money · Espèces

### 3.2 Course active
- Carte : position du Prestataire en temps réel
- Communication : appel masqué · chat in-app
- Sécurité : partage trajet aux Contacts de confiance · bouton SOS
- Annuler (sans frais avant départ / avec frais si délai gratuit dépassé)

### 3.3 Clôture
- Reçu de course
- Avis sur le Prestataire (1–5 étoiles + commentaire optionnel)

---

## 4. Livraison

### 4.1 Préparation & configuration
- Saisir adresse de collecte et adresse de livraison
- Décrire le colis
- Choisir le mode : Express (Option A) · Livraison groupée (Option B — prix réduit, léger délai)
- Planifier une livraison (date et heure)

### 4.2 Yobanté (interrégional)
- Saisir ville de départ et ville de destination
- Un seul paiement — suivi multi-prestataires
- Étapes de suivi : Récupéré → En route → Arrivé en ville → Remis

### 4.3 Livraison active
- Suivi du livreur en temps réel
- Notifications à chaque étape
- Annuler (avant départ du livreur, sans frais)

### 4.4 Clôture
- Confirmation de remise
- Reçu · Avis sur le livreur

---

## 5. Location

- **Parcourir les offres** — filtres : type · quartier · durée · chauffeur inclus
- **Faire une demande personnalisée** — critères libres (type, durée, zone, budget max)
- **Mes réservations** — liste avec statut : En attente · Confirmée · En cours · Terminée
  - Détail réservation
  - Modifier : Annuler · Prolonger

---

## 6. Assistance

- **Signaler mon problème** — type : Dépanneuse · Batterie · Pneu · Carburant · Mécanique ; confirmer position GPS
- **Intervention active** — Prestataire sur carte + ETA
- **Clôture** — payer l'intervention · Avis sur le Prestataire

---

## 7. Mon compte & Sécurité

- **Profil** — modifier nom · téléphone · photo · voir sa **Note du Client** (moyenne affichée, lecture seule ; le détail par course reste privé — cf. CONTEXT.md)
- **Moyens de paiement** — ajouter / supprimer comptes Mobile Money
- **Lieux enregistrés** — Maison · Travail (emplacements permanents) + lieux libres nommés par le Client (créer / renommer / supprimer) ; proposés comme destination dans la recherche
- **Contacts de confiance** — ajouter · modifier · activer notification automatique au départ
- **Historique** — toutes les Commandes passées avec reçu (lien vers Mes réservations pour les locations)
- **Préférences** — notifications (langue / thème / unités différés — app en français, F CFA, km en v1 ; cf. benchmark-compte-mobbin.md D5)
- **Déconnexion**
- **Supprimer mon compte**

---

## 8. Menu (drawer latéral)

Accessible depuis le bouton hamburger en haut à gauche de l'Accueil.

**En-tête** : avatar · nom du Client · numéro de téléphone · chevron → Mon compte & sécurité

**Items principaux** :
- **Mon compte & sécurité** → section 7
- **Affiliation** → section 9 (adaptatif : page informative si non-affilié · tableau de bord si Affilié Réseau actif)
- **Fidélité** — solde de Points Fidélité affiché inline → section 10

**Item utilitaire** (séparé par un divider) :
- **Aide & support**

**Pied de menu** (épinglé en bas, style distinct) :
- **Devenir prestataire** → renvoie vers **Fiw Pro** (installer / ouvrir). Couleur distincte, séparé de la liste pour ne pas entrer en collision avec le « Gagner de l'argent » de l'Affiliation (benchmark-compte-mobbin.md D4).

> **Redondance volontaire (D3)** : l'en-tête profil ET l'item « Mon compte & sécurité » mènent tous deux à la section 7. Ce n'est pas un oubli — la rangée nommée guide les Clients qui suivent les mots plutôt que l'affordance (invisible) de l'avatar tappable. Ne pas « nettoyer ».

---

## 9. Affiliation

- **Découvrir l'affiliation** — page informative : AffiliéRéseau (2 %) disponible ici · AffiliéPartenaire (4 %) accessible depuis Fiw Pro
- **Activer AffiliéRéseau** — activation du rôle sur le compte Client existant
- **Partager mon code** — QR code · code texte
- **Tableau de bord AffiliéRéseau** — personnes recrutées · courses générées · commissions

---

## 10. Fidélité

- **Mes points** — solde · historique d'accumulation
- **Convertir mes points** — course gratuite · réduction

---

_Le bouton SOS est accessible en permanence depuis toute course ou livraison active (sections 3.2 et 4.3). Il envoie la position GPS aux Contacts de confiance et aux services d'urgence._
