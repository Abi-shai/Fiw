## Contexte actuel

Couche structure d'interaction en cours. Sitemap démarré — flux Transport détaillé, autres flux (Livraison, Yobanté, Assistance, Location) et intérieurs de menus pas encore cartographiés. Couche stratégie produit partielle mais décision prise d'avancer. Prochain jalon : compléter les flux restants, puis user story map.

---

- [Glossaire domaine Fiw](CONTEXT.md) — termes canoniques pour Fiw/Fiw Pro : Client, Prestataire, Affilié, Wallet, Score de coopération, Frais de rapprochement, Yobanté, Commande (canonique), ÉvaluationClient, etc.
- [Liste des fonctionnalités](docs/feature-list.md) — périmètre validé pour Fiw (client) et Fiw Pro (prestataire), affiné à partir du doc produit + recherche UX en juin 2026. Inclut les décisions de périmètre clés.
- [Modèle conceptuel](docs/conceptual-model.md) — objets, relations, machines d'état et inventaire d'actions. Produit juin 2026. Location Longue Durée est désormais un objet `Réservation` distinct ; AffiliéRéseau (rôle) et AffiliéPartenaire (entité distincte) résolus. Encore ouvert : sous-type Yobanté vs objet distinct, modélisation ÉvaluationClient, relations membres/succursales AffiliéPartenaire.
- [Sitemap client Fiw](docs/sitemap.md) — inventaire des places et structure de navigation de l'app Fiw côté Client (juin 2026). Flux Transport détaillé ; autres flux pas encore cartographiés.
- [Besoins utilisateurs](docs/user-needs.md) — problèmes principaux par persona (Client + Prestataire), classés par priorité, avec indication de la base (signal terrain ★ vs inférence). Produit juin 2026. Items Prestataire rangs 2/4/5 non validés en entretien — à confirmer.
- [Signaux de recherche](docs/research-signals.md) — résultats clés validés des 9 entretiens pré-conception : écart commission, levier prix stable, conditions frais de rapprochement, angle mort traçabilité affiliation, risque rétention direction programmée.
- [Audit orient](docs/orient-audit.md) — état couche par couche en juin 2026. Structure d'interaction en cours ; stratégie produit partielle mais acceptée.
- [ADR 0001 : Priorité Transport sur l'accueil](docs/adr/0001-transport-priority-on-home.md) — l'écran d'accueil Fiw donne à Transport une tuile plus grande + barre de recherche, basé sur une inférence marché et non sur une recherche validée.
- [ADR 0002 : Sélecteur de compte AffiliéPartenaire dans Fiw](docs/adr/0002-affiliepartenaire-account-switcher-in-fiw-app.md) — le contexte AffiliéPartenaire vit dans l'app Fiw via un sélecteur de compte, pas une app séparée ni une reconnexion explicite.
