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
Personne physique (particulier, étudiant, commerçant) qui recrute des clients et des prestataires et perçoit une commission de 2 % sur les courses générées. **Rôle**, pas un compte distinct — un flag activé sur le compte Client ou Prestataire existant, avec un tableau de bord dans le menu de l'app concernée. Pas d'application séparée, pas de connexion séparée.
_Avoid_ : parrain, ambassadeur, apporteur d'affaires

**Affilié Partenaire** :
Entreprise ou commerce (restaurant, hôtel, agence…) qui génère des courses depuis son point physique et perçoit une commission de 4 % sur ces courses. **Entité distincte**, pas un rôle sur un compte Client — une entreprise n'est pas une personne physique et peut avoir plusieurs membres accédant au même tableau de bord. Reste à l'intérieur de l'écosystème Fiw (pas d'app séparée à installer), mais avec son propre contexte de connexion/compte.
_Avoid_ : partenaire commercial, point de vente

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

**Aucun prestataire** :
Issue de la mise en relation où **aucun prestataire libre n'est disponible** dans le périmètre. Ce n'est **pas** une « Option » : le Client ne choisit rien, c'est un cul-de-sac assorti d'actions de repli (réessayer, changer de gamme quand une autre gamme a du stock). **Mutuellement exclusif de l'Option A/B** : soit un prestataire libre existe mais dépasse le seuil de distance gratuite (le Client voit A/B), soit personne n'est libre (le Client voit Aucun prestataire) — jamais les deux. Étiquette UI : « Aucun prestataire disponible ».
_Avoid_ : Option D, rupture d'offre, indisponibilité totale

**Score de coopération** :
Mécanisme algorithmique interne et invisible pour le prestataire. Détermine l'ordre de priorité d'attribution des courses attractives selon l'historique d'acceptation des courses à faible tarif. N'empêche jamais un prestataire de travailler.
_Avoid_ : score de performance, taux d'acceptation (terme interne uniquement)

**Statut prestataire** :
Système visible par le prestataire dans Fiw Pro. Niveaux : Bronze, Argent, Or, Diamant. Progresse selon le nombre de courses effectuées et la note moyenne reçue. Débloque des avantages concrets.
_Avoid_ : niveau, grade, rang

**Wallet** :
Compte virtuel intégré dans Fiw Pro, propre à chaque prestataire. Sert uniquement à payer la commission de 14 % prélevée automatiquement à chaque course terminée. Alimenté via Mobile Money. Wallet vide = accès bloqué.
_Avoid_ : portefeuille, solde, compte

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
Frais facturés au client si le prestataire est arrivé et attend au-delà du délai gratuit (**5 min, délai unique quel que soit le prix de la course**). 100 F CFA/minute au-delà. Déclenchés automatiquement par GPS. Le montant potentiel est **annoncé au client dès la commande** (message clair avant confirmation), jamais révélé seulement en fin de course.
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
Terme canonique interne désignant toute demande de service (transport, livraison, Yobanté, assistance, location). Affiché comme « Course » dans Fiw et comme « Mission » dans Fiw Pro. Réservé aux APIs, base de données et échanges techniques. « Course » et « Mission » sont des étiquettes UI, pas des concepts distincts.
_Avoid_ : course (terme interne), mission (terme interne), order, request

**ÉvaluationClient** :
Note interne donnée par le Prestataire sur le Client à la fin d'une Commande. Privée, non exposée dans l'interface Client. Distincte de l'**Avis** (public, soumis par le Client sur le Prestataire).
_Avoid_ : note client, avis conducteur, rating client
