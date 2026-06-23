## Contexte actuel

Sitemaps Fiw (Client) et Fiw Pro (Prestataire) complétés depuis la user story map FigJam (juin 2026). Modèle conceptuel mis à jour : Offre Covoiturage supprimée (covoiturage = type de Commande standard, mission entrante). ADR 0003 décidé : AffiliéPartenaire dans Fiw Pro uniquement. Prochain jalon : breadboard des flux prioritaires (Transport côté Client, Mission active côté Prestataire).

---

- [Glossaire domaine Fiw](CONTEXT.md) — termes canoniques pour Fiw/Fiw Pro : Client, Prestataire, Affilié, Wallet, Score de coopération, Frais de rapprochement, Yobanté, Commande (canonique), ÉvaluationClient, etc.
- [Liste des fonctionnalités](docs/feature-list.md) — périmètre validé pour Fiw (client) et Fiw Pro (prestataire), affiné à partir du doc produit + recherche UX en juin 2026. Inclut les décisions de périmètre clés.
- [Modèle conceptuel](docs/conceptual-model.md) — objets, relations, machines d'état et inventaire d'actions. Produit juin 2026. Location Longue Durée est désormais un objet `Réservation` distinct ; AffiliéRéseau (rôle) et AffiliéPartenaire (entité distincte) résolus. Encore ouvert : sous-type Yobanté vs objet distinct, modélisation ÉvaluationClient, relations membres/succursales AffiliéPartenaire.
- [Sitemap client Fiw](docs/sitemap-client.md) — navigation complète app Fiw (Client), construit depuis la user story map (juin 2026). 8 sections : Onboarding, Accueil, Transport, Livraison, Location, Assistance, Compte, Affiliation/Fidélité. Remplace docs/sitemap.md (obsolète).
- [Sitemap Fiw Pro](docs/sitemap-pro.md) — navigation complète app Fiw Pro (Prestataire), construit depuis la user story map (juin 2026). 9 sections : Onboarding/Activation, Tableau de bord, Mission Transport/Covoiturage, Mission Livraison, Wallet, Revenus, Profil/Documents, AffiliéRéseau, AffiliéPartenaire.
- [Besoins utilisateurs](docs/user-needs.md) — problèmes principaux par persona (Client + Prestataire), classés par priorité, avec indication de la base (signal terrain ★ vs inférence). Produit juin 2026. Items Prestataire rangs 2/4/5 non validés en entretien — à confirmer.
- [Signaux de recherche](docs/research-signals.md) — résultats clés validés des 9 entretiens pré-conception : écart commission, levier prix stable, conditions frais de rapprochement, angle mort traçabilité affiliation, risque rétention direction programmée.
- [Audit orient](docs/orient-audit.md) — état couche par couche en juin 2026. Structure d'interaction en cours ; stratégie produit partielle mais acceptée.
- [ADR 0001 : Priorité Transport sur l'accueil](docs/adr/0001-transport-priority-on-home.md) — l'écran d'accueil Fiw donne à Transport une tuile plus grande + barre de recherche, basé sur une inférence marché et non sur une recherche validée.
- [ADR 0002 : Sélecteur de compte AffiliéPartenaire dans Fiw](docs/adr/0002-affiliepartenaire-account-switcher-in-fiw-app.md) — **SUPERSEDED par ADR 0003.**
- [ADR 0003 : AffiliéPartenaire dans Fiw Pro](docs/adr/0003-affiliepartenaire-dans-fiw-pro.md) — AffiliéPartenaire accessible uniquement depuis Fiw Pro, pas depuis l'app Fiw Client.
