# ADR 0006 : Home distinct pour l'Affilié Partenaire dans Fiw Pro

À la connexion, Fiw Pro détecte le type de compte (Prestataire ou Affilié Partenaire) et affiche un Home entièrement différent — pas de nav commune, pas de switcher de profil. Les deux profils sont mutuellement exclusifs à l'inscription et ont des besoins sans overlap (flux mission active vs commander pour un client). Une nav commune aurait été de la dette prématurée pour un cas hypothétique ("les deux à la fois") non tranché.

## Considered Options

- **B — Section dédiée dans une nav commune** : rejetée, car aucun écran n'est partagé entre les deux profils.
- **C — Switcher de profil** : rejeté, car "pas les deux en même temps" est une décision produit tranchée à l'inscription. Ne pas anticiper un changement de règle.
