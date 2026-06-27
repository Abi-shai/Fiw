# Breadboard — Affilié Réseau (app Fiw, Client)

> Source : synthèse « Affilié Réseau — IA & breadboards » (révision 2, audit UX intégré), retravaillée le 26 juin 2026 en session grill-with-docs.
> Vocabulaire aligné sur `CONTEXT.md`. Les libellés entre guillemets sont l'UI ; les termes hors guillemets sont canoniques.

## Vocabulaire de cette section

| UI (ce que voit l'utilisateur) | Terme canonique | Définition |
|---|---|---|
| « Ambassadeur » | Affilié Réseau | Client qui a activé le rôle de recrutement. Si un Client recrute, il devient Ambassadeur. |
| « Affilié » | Affilié | Personne recrutée (Client ou Prestataire) entrée dans le réseau via le code/QR de l'Ambassadeur. |
| « Mon Wallet » | Wallet Réseau | Compte de gains : crédité par les commissions, retirable vers Mobile Money (≥ 1 000 F). |
| badge « Fondateur » | Membre Fondateur | État de lancement : gains comptabilisés, retrait bloqué jusqu'au lancement officiel. |

---

## Décisions tranchées

### 1. Architecture générale — modèle « 1 affilié = 1 app »
- **Affilié Réseau** vit dans l'app **Fiw (Client) uniquement** — rôle activé sur un compte Client existant.
- **Affilié Partenaire** vit dans **Fiw Pro (Prestataire) uniquement** (entité distincte, ADR 0003).
- Un **Prestataire ne peut pas** devenir Affilié Réseau depuis Fiw Pro. _(Décision du 26 juin 2026 — voir ADR 0005. Le canal prestataire→prestataire est abandonné au profit d'un modèle plus simple.)_

### 2. Activation
- **Aucune validation requise** : n'importe quel Client peut devenir Ambassadeur.
- Activation en **un écran** : CTA + acceptation des conditions. Aucun formulaire, aucun document.

### 3. Architecture d'information — section Affilié Réseau

```
Section Affilié Réseau (« Mon espace Ambassadeur »)
│
├── [Activation] — CTA + acceptation conditions
│
├── Tableau de bord
│   ├── Solde Wallet Affilié (hero card) + bouton « Retirer »
│   ├── Prestataires actifs (Affiliés prestataires)
│   ├── Clients actifs (Affiliés clients)
│   ├── Courses générées
│   ├── Lien → Mon Réseau
│   └── Commissions récentes (date + montant — sans identification des Affiliés)
│
├── Mon Réseau
│   ├── Affiliés clients (actifs / inactifs)
│   └── Affiliés prestataires (actifs / inactifs)
│
├── Parcours retrait (accessible depuis le bouton « Retirer » du tableau de bord)
│   ├── Choix méthode Mobile Money + montant
│   ├── Récapitulatif (point de non-retour)
│   ├── [optionnel] Modifier le numéro Mobile Money
│   ├── Traitement
│   ├── Confirmation (succès) → Tableau de bord
│   └── Échec → Réessayer / Support / Tableau de bord
│
└── Mes Outils
    ├── QR code (affichage + partage)
    └── Code perso (copie + partage)
```

> **Supprimé (session 27 juin 2026)** : l'écran "Mon Wallet" est retiré. Le solde vit dans la hero card du tableau de bord ; les commissions récentes (date + montant uniquement, sans nom ni identification d'Affilié) sont listées en bas du tableau de bord. La règle de calcul (2 %) n'est pas répétée en permanence — elle figure dans les conditions d'utilisation acceptées à l'activation.

> **Hors périmètre de cette itération** : « Prestataires favoris » et « Proposer un prestataire à un Partenaire » (JS4 de la source). Bénéfice et destinataire trop flous, action cross-app. À traiter dans une session dédiée.

### 4. Lifecycle

États : **Activation → Membre Fondateur → Actif → Gelé**

- **Membre Fondateur → Actif** : déclenché par Fiw côté admin (fin de phase test), notification push envoyée à l'Ambassadeur.

| État | Wallet Réseau | Retrait | Activité |
|---|---|---|---|
| Membre Fondateur | visible | **bloqué** (jusqu'au lancement officiel) | reste actif |
| Actif | visible | **disponible** | tout actif |
| Gelé | visible | **bloqué** (suspension → support) | reste actif |

### 5. Wallet Affilié
- **Commission : 2 % du montant brut** de chaque course générée par le réseau (prélevée sur la part Fiw).
- Wallet **intermédiaire** dans l'app — pas de versement Mobile Money direct.
- **Retrait** vers Mobile Money à partir de **1 000 F CFA**.
- **Confidentialité des commissions** : l'historique affiché ne contient ni nom ni identification des Affiliés — uniquement la date et le montant.

### 6. Principes UX transversaux (audit)
- **Vocabulaire grand public** : on dit « Ambassadeur » et « Affilié », et le mot concret (« chauffeur », « livreur ») quand le service est connu ; jamais « prestataire » brut dans l'UI client.
- Chaque **liste vide** affiche un message qui dit quoi faire ensuite — jamais d'écran vide muet.
- Chaque **chemin d'échec** a un écran qui diagnostique, explique et propose une action de récupération.
- Tout **mouvement d'argent** passe par un récapitulatif explicite avant le point de non-retour.
- Le badge **« Fondateur »** est toujours accompagné d'une phrase qui explique pourquoi les commissions sont encore gelées.
- Le bouton « Retirer » est **désactivé** (grisé) en état Membre Fondateur et Gelé — pas d'écran intermédiaire bloquant.

---

## Breadboards

### JS1 — Activer son profil Ambassadeur

**Présentation du programme**
- « Activer mon profil » → Conditions d'utilisation
- [ ce que tu gagnes / comment ça marche / exemples de commission (2 % du brut) ]

**Conditions d'utilisation**
- « J'accepte et je commence » → Tableau de bord (premier accès)
- Retour → Présentation du programme
- [ contrat d'affiliation ]

**Tableau de bord (premier accès — état Membre Fondateur)**
- « Voir mes outils » → Mes Outils
- [ badge « Fondateur » + phrase : « Vous faites partie des fondateurs. Vos gains sont comptabilisés dès maintenant et seront débloqués au lancement officiel. »
  / métriques à zéro avec messages d'accompagnement
  / EMPTY STATE : « Votre réseau est encore vide — partagez votre code pour inviter vos premières personnes » + bouton vers Mes Outils ]

### JS2 — Recruter quelqu'un

**Mes Outils**
- Afficher QR code → QR code plein écran
- Copier code perso → [toast « Code copié »]
- Partager code perso → Partage natif (WhatsApp, SMS…)
- [ QR code / code perso / boutons de partage
  / texte d'aide : « Quand quelqu'un s'inscrit avec ce code, chaque course qu'il fait vous rapporte 2 %. » ]

**QR code plein écran**
- Partager → Partage natif
- Télécharger → [toast « QR code enregistré »]
- Retour → Mes Outils
- [ QR code agrandi / nom de l'Ambassadeur ]

**[Notification push — reçue plus tard]**
« 🎉 Quelqu'un vient de rejoindre avec votre code ! » → Écran de célébration

**Écran de célébration**
- « Voir mon réseau » → Mon Réseau
- Fermer → Tableau de bord
- [ animation / « Votre réseau grandit ! » / nombre d'Affiliés ]

### JS3 — Suivre et retirer ses commissions

**Tableau de bord (section commissions)**
- [ commissions récentes : date + montant uniquement, sans identification des Affiliés ]
- [ EMPTY STATE : « Pas encore de gains — ils apparaîtront ici dès que les personnes de votre réseau commenceront à faire des courses. » ]

**Tableau de bord → bouton « Retirer »**
- [si Actif + solde ≥ 1 000 F] → Choix méthode + montant
- [si Actif + solde < 1 000 F] → bouton désactivé + caption : « Minimum 1 000 F »
- [si Membre Fondateur] → bouton désactivé + caption : « Retrait disponible au lancement officiel »
- [si Gelé] → bouton désactivé + caption : « Retraits suspendus — contactez le support »

**Choix méthode + montant**
- [ sélection méthode Mobile Money (Orange Money / Wave / Free Money) / saisie montant / raccourci « Tout retirer » / numéro de réception affiché (modifiable à l'étape suivante) ]
- « Continuer » [montant valide] → Récapitulatif de retrait

**Récapitulatif de retrait**
- « Confirmer le retrait » → Traitement
- « Modifier le numéro » → Saisie numéro Mobile Money
- Annuler → retour (Choix méthode + montant)
- [ EN GRAND : « Vous retirez X F vers le [numéro Mobile Money] » / méthode / frais éventuels / délai estimé ]

**Saisie numéro Mobile Money**
- « Valider » → Récapitulatif de retrait
- Retour → Récapitulatif de retrait
- [ champ numéro / opérateur détecté (Wave / Orange Money / Free Money) ]

**Traitement**
- → automatiquement → Confirmation [succès]
- → automatiquement → Échec de retrait [si échec]

**Confirmation [succès]**
- « Retour au tableau de bord » → Tableau de bord
- [ ✓ « Retrait envoyé » / montant / numéro / statut « En cours d'arrivée » ]

**Échec de retrait**
- « Réessayer » → Récapitulatif de retrait
- « Contacter le support » → Support
- « Retour au tableau de bord » → Tableau de bord
- [ ✕ cause (numéro invalide / problème réseau / solde indisponible) + ce qu'il faut faire
  / **rassurer explicitement** : l'argent n'a pas quitté le Wallet Affilié ]

### JS4 — Proposer un prestataire à un Partenaire

> **Reporté.** Action cross-app (Client → Affilié Partenaire dans Fiw Pro) au bénéfice non défini. À spécifier dans une session dédiée avant breadboard.

---

## Décisions reportées / ouvertes

- **JS4 + Prestataires favoris** — but, destinataire et bénéfice Ambassadeur à définir.
- **Déclencheur de l'état Gelé** — qui gèle, sur quels critères ? (non spécifié dans la source)
- **Définition « actif » vs « inactif »** d'un Affilié — seuil (1ʳᵉ course ? course dans les N jours ?) à trancher pour les listes Mon Réseau.
