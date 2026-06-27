# Fiw

Application mobile multi-services de mobilité urbaine et de livraison, basée à Dakar, Sénégal. Deux applications : **Fiw** (côté client) et **Fiw Pro** (côté prestataire). Principal concurrent : Yango.

## Language

### Utilisateurs

**Client** :
Passager ou expéditeur de colis. Utilise l'application **Fiw**.
_Avoid_ : passager, utilisateur, acheteur

**Prestataire** :
Chauffeur ou livreur inscrit sur la plateforme. Utilise l'application **Fiw Pro**. Un prestataire peut activer plusieurs services (Vélo, Moto, Voiture, Assistance…).
_Avoid_ : chauffeur (trop restrictif), livreur (trop restrictif), conducteur

**Affilié Réseau** :
Personne physique (particulier, étudiant, commerçant) qui recrute des clients et des prestataires et perçoit une commission de 2 % du montant brut de chaque course générée par son réseau (prélevée sur la part Fiw). **Rôle activé sur un compte Client existant**, dans l'app **Fiw uniquement** — pas un compte distinct, pas d'application séparée, pas de connexion séparée. Modèle « 1 affilié = 1 app » : Affilié Réseau vit dans Fiw (Client), Affilié Partenaire vit dans Fiw Pro (Prestataire). Un Prestataire ne peut pas activer le rôle Affilié Réseau depuis Fiw Pro. **Terme système / canonique** ; le libellé affiché à l'utilisateur est **Ambassadeur**.
_Avoid_ : parrain, apporteur d'affaires

**Ambassadeur** :
Libellé **affiché dans l'interface** (app Fiw) pour un Client qui a activé le rôle Affilié Réseau. « Si un Client recrute, il devient Ambassadeur. » Étiquette UI grand public du terme canonique `Affilié Réseau` — même relation que `Commande` → « Course » / « Mission ». Réservé à l'UI ; en base de données, API et docs techniques, dire Affilié Réseau.
_Avoid_ : parrain, affilié réseau (dans l'UI)

**Affilié** :
La **personne recrutée** par un Ambassadeur : un Client ou un Prestataire entré dans le réseau via son code/QR, et dont les courses génèrent la commission de 2 %. Terme UI + conceptuel pour un membre du réseau. **Règle de désambiguïsation** : le mot seul « Affilié » = un recruté ; les termes en deux mots `Affilié Réseau` (recruteur) et `Affilié Partenaire` (entreprise, Fiw Pro) désignent les rôles/entités et ne s'abrègent jamais en « Affilié ».
_Avoid_ : filleul, parrainé, recrue

**Affilié Partenaire** :
Entreprise ou commerce (restaurant, hôtel, agence…) qui génère des courses depuis son point physique et perçoit une commission de 4 % sur ces courses. **Entité distincte**, pas un rôle sur un compte Client — une entreprise n'est pas une personne physique et peut avoir plusieurs membres accédant au même tableau de bord. Reste à l'intérieur de l'écosystème Fiw (pas d'app séparée à installer), mais avec son propre contexte de connexion/compte. Associé à exactement un Point Express (cardinalité 1 pour 1).
_Avoid_ : partenaire commercial, point de vente

**Point Express** :
Adresse physique d'un Affilié Partenaire, enregistrée à l'inscription et invariable. Identifié par un QR code unique. Sert de point de départ fixe pour toutes les Commandes générées par cet Affilié Partenaire. Visible côté client via le QR ou le lien associé. Cardinalité : 1 Affilié Partenaire → 1 Point Express (jamais plusieurs).
_Avoid_ : point de collecte, lieu de départ, adresse partenaire

**Client sauvegardé** :
Contact local (nom + téléphone) stocké par un Affilié Partenaire pour relancer rapidement une Commande. N'implique pas de compte Fiw — le lien éventuel avec un compte Client existant est résolu en arrière-plan par le système, sans contrainte visible côté Affilié Partenaire. Enregistré automatiquement à la première Commande passée pour ce contact.
_Avoid_ : client enregistré, favori client, profil client

**Code prestataire** :
Code court unique (format `FIW-XXXXX`, 8 caractères) affiché dans le profil Fiw Pro d'un Prestataire. Permet à un Affilié Partenaire d'ajouter ce Prestataire à ses favoris sans connaître son identifiant technique de service (MOT-XXXX, etc.). Conçu pour être partagé de vive voix ou par SMS. Distinct des identifiants de service existants.
_Avoid_ : identifiant prestataire, code d'accès, ID service

**Membre Fondateur** :
État du lifecycle d'un Affilié Réseau pendant la phase de lancement : ses gains sont **comptabilisés** dans le Wallet Affilié mais le **retrait reste bloqué** jusqu'au lancement officiel. Le passage Membre Fondateur → Actif est déclenché par Fiw côté admin (fin de phase test), avec notification push. À distinguer de l'état **Gelé** (suspension : retrait bloqué + invitation à contacter le support). « Partenaire Fondateur » est à éviter — collision avec Affilié Partenaire.
_Avoid_ : partenaire fondateur, early adopter, bêta-testeur

### Services

**Frais de rapprochement** :
Supplément tarifaire automatiquement proposé au client quand le prestataire le plus proche dépasse le seuil de distance gratuite. Toujours présenté comme un choix binaire (Option A / Option B), jamais imposé.
_Avoid_ : frais de déplacement, surplus, supplément

**Option A** :
Choix présenté au client : attendre un prestataire proche, prix standard, temps d'attente plus long. Pas de frais de rapprochement.
_Avoid_ : option standard, option normale

**Option B** :
Choix présenté au client : prise en charge rapide par un prestataire plus éloigné, avec frais de rapprochement affichés. Prix total affiché avant confirmation.
_Avoid_ : option rapide, option premium

**Option C** :
Affichée quand aucun prestataire libre n'est disponible, mais qu'un prestataire occupé est proche et sur le point de terminer sa course. Prix normal, pas de frais. L'attente est la contrepartie.
_Avoid_ : prestataire bientôt disponible

**Score de coopération** :
Mécanisme algorithmique interne et invisible pour le prestataire. Détermine l'ordre de priorité d'attribution des courses attractives selon l'historique d'acceptation des courses à faible tarif. N'empêche jamais un prestataire de travailler.
_Avoid_ : score de performance, taux d'acceptation (terme interne uniquement)

**Statut prestataire** :
Système visible par le prestataire dans Fiw Pro. Niveaux : Bronze, Argent, Or, Diamant. Progresse selon le nombre de courses effectuées et la note moyenne reçue. Débloque des avantages concrets.
_Avoid_ : niveau, grade, rang

**Wallet** :
Compte virtuel intégré dans Fiw Pro, propre à chaque prestataire. Sert uniquement à payer la commission de 14 % prélevée automatiquement à chaque course terminée. Alimenté via Mobile Money. Wallet vide = accès bloqué. **Sens unique débit** (le prestataire l'alimente, Fiw le prélève). À ne pas confondre avec le **Wallet Affilié** (sens inverse : crédit + retrait).
_Avoid_ : portefeuille, solde, compte

**Wallet Réseau** :
Compte de gains de l'Affilié Réseau dans l'app Fiw (Client). **Crédité** par les commissions de 2 % sur les courses générées par son réseau ; le solde est **retirable vers Mobile Money** à partir de 1 000 F CFA. Affiché « Mon Wallet » dans l'interface Client (Ambassadeur). Mécanique inverse du `Wallet` Prestataire (qui est prépayé et débit-only). Wallet intermédiaire dans l'app : aucun versement Mobile Money direct sans passer par un retrait explicite.
_Avoid_ : Wallet Affilié, cagnotte, portefeuille affilié, solde de parrainage

**Wallet Partenaire** :
Compte de gains de l'Affilié Partenaire dans Fiw Pro. **Crédité** par les commissions de 4 % sur chaque Commande générée depuis le Point Express ; le solde est **retirable vers Mobile Money** à partir de 1 000 F CFA. Affiché « Mon Wallet » dans l'interface Affilié Partenaire. État Gelé : retrait bloqué, solde visible. Wallet intermédiaire dans l'app : aucun versement Mobile Money direct sans retrait explicite.
_Avoid_ : cagnotte, solde partenaire, wallet commission

**Livraison groupée** :
Service de livraison combinant plusieurs colis d'expéditeurs différents dans un même trajet, à l'intérieur d'un cluster géographique. Proposée comme Option B au client (prix réduit, léger délai d'attente).
_Avoid_ : livraison combinée, co-livraison

**Yobanté** :
Service de livraison interrégionale multi-prestataires (chauffeur intercity + moto de collecte + moto de livraison finale). Un seul paiement côté client, l'app distribue aux prestataires.
_Avoid_ : livraison longue distance, livraison interurbaine

**Direction programmée** :
Fonctionnalité dans Fiw Pro permettant au prestataire de définir une direction préférée pour filtrer les courses proposées (ex : fin de journée vers le domicile). Intégrée à l'algorithme d'attribution.
_Avoid_ : filtre de destination, trajet préféré

**Frais d'attente** :
Frais facturés au client si le prestataire est arrivé et attend au-delà du délai gratuit (3 min si course ≤ 1 000 F, 5 min si > 1 000 F). 100 F CFA/minute. Déclenchés automatiquement par GPS.
_Avoid_ : frais de retard, pénalité d'attente

### Modèle économique

**Commission** :
14 % du montant de chaque course, prélevés automatiquement sur le wallet du prestataire à la fin de chaque course.
_Avoid_ : frais de plateforme, cut, pourcentage

**Mobile Money** :
Moyen de paiement principal. Comprend Wave, Orange Money et Free Money. Les frais de transaction Mobile Money sont supportés par le prestataire (pas par Fiw).
_Avoid_ : paiement mobile, transfert mobile

### Programme client

**Fidélité** :
Programme de récompense côté Client. Chaque 100 F CFA dépensés en Commandes génèrent 1 Point Fidélité. Les Points peuvent être convertis en réductions ou en courses gratuites. Taux de conversion exact et seuil minimum à définir.
_Avoid_ : points de fidélité (employer « Points Fidélité »), cashback, récompenses

**Point Fidélité** :
Unité du programme Fidélité. 100 F CFA dépensés = 1 Point Fidélité.
_Avoid_ : point, crédit fidélité

## Vocabulaire commun (modèle conceptuel)

**Commande** :
Terme canonique interne désignant toute demande de service (transport, livraison, Yobanté, assistance, location). Affiché comme « Course » dans Fiw (Client) et dans la section Affilié Partenaire de Fiw Pro (l'Affilié Partenaire commande *pour* des clients — il se place côté demande, pas côté offre). Affiché comme « Mission » dans Fiw Pro pour le Prestataire qui exécute. Réservé aux APIs, base de données et échanges techniques. « Course » et « Mission » sont des étiquettes UI, pas des concepts distincts.
_Avoid_ : course (terme interne), mission (terme interne), order, request

**ÉvaluationClient** :
Note interne donnée par le Prestataire sur le Client à la fin d'une Commande. Privée, non exposée dans l'interface Client. Distincte de l'**Avis** (public, soumis par le Client sur le Prestataire).
_Avoid_ : note client, avis conducteur, rating client
