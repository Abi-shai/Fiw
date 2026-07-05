# Fiw — Liste des fonctionnalités

> Périmètre de référence validé pour la phase de design UX/UI. Dérivé du doc produit client + rapport de recherche UX, affiné en juin 2026.

## Décisions de périmètre

- **Noms des apps :** Fiw (client), Fiw Pro (prestataire). Une même personne peut utiliser les deux simultanément.
- **Commission :** 14 %
- **Périmètre :** Produit complet — badges « bientôt disponible » pour les fonctionnalités pas disponibles au lancement
- **Affiliation :** Section dans Fiw (client) ET dans Fiw Pro (recrutement prestataire-à-prestataire). Pas une app séparée.
- **Notation :** Asymétrique — le Client note le Prestataire (publique), le Prestataire note le Client (privée/interne uniquement)
- **Communication :** Appel masqué + chat in-app dans les deux apps
- **Annulation :** Gratuite pour le Client avant le départ du Prestataire, payante après. Toujours gratuite pour le Prestataire mais affecte le score de coopération.
- **Courses planifiées + direction programmée :** Les deux dans le périmètre MVP
- **Sécurité :** SOS + partage de trajet en direct + contacts de confiance — mis en avant, pas enfouis dans les paramètres
- **Prestataires Assistance Routière :** Type de prestataire séparé dans Fiw Pro
- **Langue :** Français uniquement (Wolof = bientôt disponible)

---

## FIW — Client App

### Onboarding & Compte
- Inscription : prénom, nom, téléphone, mot de passe
- Vérification OTP
- Sélection du profil : Client
- Champ optionnel « Qui vous a recommandé ? » à l'inscription
- Connexion / Déconnexion / Récupération mot de passe
- Édition du profil (nom, téléphone, photo)
- ID unique CLI-XXXX
- Suppression de compte

### Écran d'accueil
- Onglets : Transport | Livraison | Assistance Routière | Transport de marchandises *(coming soon)*
- Bandeau persistant si course/livraison en cours
- Cloche de notifications

### Transport — Taxi Voiture
- Saisie destination (adresse + pin carte)
- Sélection gamme : Simple/Économique, Confort/Climatisé, Prestige/Luxe
- Prix total affiché avant confirmation
- Choix binaire Option A / Option B (frais de rapprochement, si applicable)
- Réservation planifiée (date + heure)
- Sélection paiement : Wave, Orange Money, Espèces
- Écran recherche prestataire
- Fiche prestataire : nom, photo, véhicule, plaque, note, ID
- Carte en direct : position prestataire en route
- Appel masqué
- Chat in-app
- Partage de trajet en direct (lien vers contact de confiance)
- Bouton SOS
- Compteur frais d'attente (déclenché à l'arrivée du prestataire)
- Suivi trajet en cours
- Écran fin de course + reçu
- Notation prestataire (1–5 étoiles + commentaire optionnel)
- Annulation (gratuite avant départ, frais affichés après)

### Transport — Taxi Moto
- Même flux que Taxi Voiture, sans sélection de gamme

### Transport — Covoiturage
- Saisie destination
- Type : Ponctuel / Régulier / Favoris
- Détection auto urbain vs interurbain
- Matching passagers (algorithme)
- Option « Pas de détour » (solo, prix plein)
- Prix réduit par passager
- Planification départ (interurbain)
- Fiche prestataire
- Appel masqué + chat in-app
- Partage trajet + SOS
- Paiement : Mobile Money ou espèces
- Notation après trajet

### Livraison — Vélo Express
- Adresse collecte + livraison
- Description colis
- Prix avant confirmation
- Option A / B (frais de rapprochement)
- Proposition livraison groupée : Option A (immédiat) vs Option B (groupée, prix réduit, compteur attente)
- Livraison planifiée
- Suivi en direct du livreur
- Appel masqué + chat in-app
- Confirmation remise (numéro de suivi)
- Paiement : Mobile Money ou espèces
- Notation + annulation

### Livraison — Moto Livraison
- Même flux que Vélo Express
- Groupée : jusqu'à 3–4 colis, délai 5–10 min

### Yobanté (Livraison interrégionale)
- Adresse expéditeur + destinataire (villes)
- Mode collecte : direct OU moto chez expéditeur
- Mode livraison : retrait direct OU moto au destinataire
- Description colis
- Récapitulatif tarifaire segmenté → prix total unique
- Numéro de suivi auto YOB-AAAAMMJJ-XXX
- Suivi temps réel : Récupéré → En route → Arrivé en ville → Livraison finale → Remis
- Notifications push expéditeur + destinataire
- Paiement unique

### Assistance Routière
- Type de problème : Dépanneuse | Batterie | Pneu | Carburant | Mécanique rapide
- GPS auto-détecté (modifiable)
- Matching prestataire + ETA
- Prix avant confirmation
- Suivi en direct
- Appel masqué + chat in-app
- Fin d'intervention + paiement + notation

### Transport de marchandises
- Écran placeholder « Bientôt disponible » + horizon temporel

### Location Longue Durée
- Liste véhicules (type, chauffeur, tarif, disponibilité)
- Liste parkings (capacité, emplacement, tarif)
- Filtres : type, chauffeur, quartier, durée
- Vue carte + liste
- Demande personnalisée (type, durée, zone, prix max)
- Mes réservations : En attente / Confirmée / En cours / Terminée
- Annulation / Prolongation

### Sécurité
- Liste contacts de confiance : ajouter, modifier, supprimer
- Notification automatique aux contacts au départ (toggle)
- Partage de trajet en direct (lien shareable)
- Bouton SOS → GPS envoyé aux contacts + urgences
- Historique SOS

### Affiliation & Parrainage
- CTA « Gagner de l'argent » (visible depuis l'accueil)
- Type d'affilié : Réseau (2%) ou Partenaire (4%)
- Tableau de bord : prestataires actifs, clients actifs, courses générées, commissions
- QR code + code de parrainage shareable
- Notification quand quelqu'un cite l'affilié à l'inscription
- Prestataires favoris : voir, ajouter, supprimer
- Code Prestataire Unique : vérifier → confirmer comme prioritaire
- Partage prestataire vers Affilié Partenaire (Réseau uniquement)
- Historique commissions
- Bannière phase test : commissions comptabilisées, paiement différé, statut « Partenaire Fondateur »

### Fidélité & Réductions
- Solde de points (1 pt / 100 F CFA)
- Historique gains
- Conversion : course gratuite ou réduction
- Niveau de fidélité

### Historique
- Toutes commandes (courses, livraisons, Yobanté, assistance, location)
- Filtre service / période
- Détail + reçu par commande

### Paramètres
- Édition profil
- Moyens de paiement (Mobile Money)
- Contacts de confiance
- Préférences notifications
- Langue : Français *(Wolof — bientôt disponible)*
- Aide & support
- Déconnexion / Suppression de compte

---

## FIW PRO — Driver App

### Onboarding & Activation
- Inscription tronc commun (prénom, nom, téléphone, mot de passe)
- Sélection profil : Prestataire
- Demande d'activation par service (cumulable) :
  - **Vélo Express** : infos naissance + adresse, CNI, photos (soi + vélo), contrat
  - **Moto** (livraison / taxi moto) : + immatriculation, permis, carte grise, assurance, photos (moto + casque + soi)
  - **Taxi Voiture** : + CNI/passeport, permis, immatriculation, visite technique, copies docs, photos véhicule ext+int, photo prestataire
  - **Assistance Routière** : formulaire + docs spécifiques au sous-service
- Statut par service : En attente / Validé / Refusé
- ID unique par service (VEL-XXXX / MOT-XXXX / AUT-XXXX)
- Dashboard services : Activer / Désactiver / Supprimer

### Accueil / Tableau de bord
- Toggle En ligne / Hors ligne (par service)
- Sélecteur de service actif (si plusieurs validés)
- Heatmap zones de demande (rouge / orange / jaune / gris)
- Direction programmée : destination préférée pour filtrer les courses
- Courses/livraisons entrantes
- Mission en cours
- Gains : aujourd'hui / semaine / mois
- Solde wallet + alerte solde bas
- Message de coopération (formulation positive, sans mention de pénalité)

### Réception & Gestion des courses
- Notification course entrante avec minuterie
- Détails : client, adresse collecte, adresse livraison, distance, prix
- Accepter / Refuser
- Navigation vers client
- Confirmation arrivée → compteur frais d'attente
- Départ confirmé → navigation destination
- Fin de course confirmée
- Notation client (interne, privée)

### Livraison
- Notification livraison entrante
- File livraison groupée
- Scan / saisie numéro de suivi à la collecte
- Navigation collecte → livraison
- Confirmation remise par colis

### Yobanté
- Notification mission (intercity / moto collecte / moto livraison finale)
- Scan numéro de suivi
- Navigation + confirmation de transfert

### Assistance Routière *(prestataires assistance uniquement)*
- Notification demande : localisation + type de problème
- Accepter / Refuser
- Navigation + début + fin d'intervention

### Covoiturage *(prestataires voiture uniquement)*
- Publier offre : origine, destination, sièges, heure
- Gestion trajets réguliers
- Matching passagers : accepter / refuser
- Départ + navigation + fin par passager

### Location Longue Durée *(propriétaires de véhicule/parking)*
- Ajouter véhicule / parking : type, tarif, disponibilité
- Demandes de réservation : Accepter / Refuser / Proposer ajustement
- Réservations en cours : statut, client
- Tableau revenus : occupation, brut, commission AE, net
- Alertes : réservations à confirmer, entretien

### Communication
- Appel masqué vers client
- Chat in-app avec client

### Wallet
- Solde actuel
- Recharge : Mobile Money → montant → confirmation
- Historique : crédits (recharges) + débits (commissions)
- Détail par course : montant, 14% commission, net
- Notification solde bas
- État bloqué avec CTA recharge

### Score & Statuts
- Niveau visible : Bronze / Argent / Or / Diamant
- Barre de progression (courses + note moyenne)
- Bonus en cours + conditions restantes
- Message coopération positif (sans mention pénalité)
- Historique versements bonus

### Courses planifiées
- Liste courses planifiées assignées
- Intégration direction programmée

### Affiliation *(recrutement prestataires)*
- Section « Gagner de l'argent »
- Tableau de bord : prestataires recrutés actifs, courses générées, commissions (2%)
- QR code + code parrainage
- Historique commissions

### Historique
- Toutes missions terminées
- Détail : service, distance, brut, commission, net
- Filtre service / période

### Sécurité
- Bouton SOS prestataire
- Contact d'urgence

### Paramètres
- Édition profil
- Gestion documents (consulter, mettre à jour, alertes expiration)
- Préférences notifications
- Langue : Français *(Wolof — bientôt disponible)*
- Aide & support
- Déconnexion / Suppression de compte
