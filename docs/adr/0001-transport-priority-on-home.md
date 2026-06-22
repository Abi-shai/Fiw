# ADR 0001 — Transport reçoit la priorité visuelle sur l'accueil Fiw

**Statut :** Accepté

L'écran d'accueil de Fiw (page unique, sans barre de navigation basse) présente 6 services. Transport (Voiture/Moto) reçoit une tuile plus grande et une barre de recherche de destination dédiée en dessous de la grille, tandis que les 5 autres services (Livraison, Yobanté, Assistance Routière, Location Longue Durée, Transport de marchandises) restent des icônes de poids égal, plus petites. Décision prise parce que Transport est le seul service que le modèle conceptuel identifie comme « point d'entrée principal », et parce que la catégorie VTC en général (Yango, notre concurrent direct, inclus) traite la réservation de trajet comme l'action dominante, avec tout le reste en secondaire.

**Options considérées :** Une grille 2×3 à poids égal (les 6 services traités de façon identique) était l'alternative — plus simple à construire et équitable entre services, mais elle sous-sert ce qui devrait être l'action à la fréquence la plus élevée en ne lui donnant pas plus de prominence qu'un placeholder « bientôt disponible ».

**Conséquences :** Cette hiérarchisation est un pari par inférence marché, pas une décision appuyée sur des données d'usage Fiw — il n'existe pas encore de données validées montrant que Transport est réellement l'action dominante pour la base d'utilisateurs Fiw. À réévaluer dès que des données d'usage réelles existent ; si un autre service s'avère dominant, la hiérarchie de l'accueil (pas seulement les textes ou les icônes) devra être refaite.
