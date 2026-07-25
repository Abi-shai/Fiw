# Sitemap — Fiw Pro (Prestataire)

> Construit depuis la user story map FigJam (23 juin 2026).
> Règle : la USM prime sur tous les docs existants. AffiliéPartenaire inclus hors USM — à détailler dans le FigJam (ADR 0003).

---

## 1. Onboarding & Activation (hors session / premier accès)

- **S'inscrire** — informations de base (nom, téléphone)
- **Choisir mes services** — sélectionner Vélo · Moto · Voiture · Assistance (cumulable)
- **Soumettre mes documents** — CNI · permis · assurance · photos véhicule (par service)
- **Suivre l'état d'activation** — statut par service : En attente · Validé · Refusé ; notification du résultat
- **Activer / désactiver un service** — basculer entre services validés depuis le tableau de bord

---

## 2. Tableau de bord (Home — en session)

- Toggle **En ligne / Hors ligne**
- **Mission entrante** — détails (client, adresse, distance, prix) + minuterie d'acceptation
  - Accepter → flux Mission active
  - Refuser → retour En ligne (impact Score de coopération)

---

## 3. Mission active — Transport & Covoiturage

- **Naviguer vers le Client** — guidage GPS vers le point de collecte
- **Signaler mon arrivée** — déclenche le compteur de Frais d'attente
- **Communiquer avec le Client** — appel masqué · chat in-app
- **Démarrer la mission** — confirmer départ · guidage GPS vers destination
- **Clore la mission** — confirmer fin · ÉvaluationClient (privée, non exposée côté Client)

---

## 4. Mission active — Livraison

- **Recevoir la mission** — détails : adresse collecte · adresse livraison · description colis
- **Livraison groupée** — liste des colis du trajet · vue tournée optimisée
- **Scanner à la collecte** — scan ou saisie du numéro de suivi par colis
- **Confirmer la remise** — colis par colis · déclenche notification Client

---

## 5. Wallet

- **Solde en temps réel** — affiché en permanence dans le tableau de bord
- **Recharger** — via Wave · Orange Money · Free Money
- **Historique Wallet** — par mission : montant brut · commission 14 % · net perçu
- **Alerte solde bas** — notification push + accès direct à Recharger

---

## 6. Optimiser mes revenus

- **Heatmap** — carte des zones de forte demande : rouge · orange · jaune
- **Direction programmée** — configurer une direction préférée pour filtrer les missions proposées
- **Missions planifiées** — liste des missions assignées à l'avance · créneaux de travail
- **Score de coopération** — retour sur l'historique d'acceptation (lecture seule, interne)
- **Statut prestataire** — niveau actuel Bronze · Argent · Or · Diamant · progression · avantages
- **Mes gains** — vue jour · semaine · mois · objectifs de revenus

---

## 7. Mon profil & Documents

- **Informations** — modifier nom · téléphone · photo
- **Mes documents** — par service : liste avec dates d'expiration
  - Mettre à jour un document (avant expiration pour éviter blocage d'accès)
- **Préférences** — notifications
- **Supprimer mon compte**

---

## 8. AffiliéPartenaire

> Absent de la user story map FigJam actuelle — à ajouter dans le FigJam avant de détailler les flows (ADR 0003).

- **Inscrire mon entreprise** — onboarding entité AffiliéPartenaire (restaurant, hôtel, agence…)
- **Tableau de bord Partenaire** — commandes générées · commission 4 %
- **Gérer membres / succursales** — à modéliser avec l'engineering (décision ouverte dans le modèle conceptuel)
