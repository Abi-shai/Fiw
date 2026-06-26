# Breadboard — Affilié Réseau (app Fiw, Client)

> Source : synthèse « Affilié Réseau — IA & breadboards » (révision 2, audit UX intégré), retravaillée le 26 juin 2026 en session grill-with-docs.
> Vocabulaire aligné sur `CONTEXT.md`. Les libellés entre guillemets sont l'UI ; les termes hors guillemets sont canoniques.

## Vocabulaire de cette section

| UI (ce que voit l'utilisateur) | Terme canonique | Définition |
|---|---|---|
| « Ambassadeur » | Affilié Réseau | Client qui a activé le rôle de recrutement. Si un Client recrute, il devient Ambassadeur. |
| « Affilié » | Affilié | Personne recrutée (Client ou Prestataire) entrée dans le réseau via le code/QR de l'Ambassadeur. |
| « Mon Wallet » | Wallet Affilié | Compte de gains : crédité par les commissions, retirable vers Mobile Money (≥ 1 000 F). |
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
│   ├── Prestataires actifs (Affiliés prestataires)
│   ├── Clients actifs (Affiliés clients)
│   ├── Courses générées
│   └── Aperçu solde Wallet Affilié
│
├── Mon Réseau
│   ├── Affiliés clients (actifs / inactifs)
│   └── Affiliés prestataires (actifs / inactifs)
│
├── Mon Wallet (Wallet Affilié)
│   ├── Solde disponible
│   ├── Historique des commissions
│   ├── Règle de calcul affichée
│   └── Retrait vers Mobile Money (minimum 1 000 F CFA)
│
└── Mes Outils
    ├── QR code (affichage + partage)
    └── Code perso (copie + partage)
```

> **Hors périmètre de cette itération** : « Prestataires favoris » et « Proposer un prestataire à un Partenaire » (JS4 de la source). Bénéfice et destinataire trop flous, action cross-app. À traiter dans une session dédiée.

### 4. Lifecycle

États : **Activation → Membre Fondateur → Actif → Gelé**

- **Membre Fondateur → Actif** : déclenché par Fiw côté admin (fin de phase test), notification push envoyée à l'Ambassadeur.

| État | Wallet Affilié | Retrait | Activité |
|---|---|---|---|
| Membre Fondateur | visible | **bloqué** (jusqu'au lancement officiel) | reste actif |
| Actif | visible | **disponible** | tout actif |
| Gelé | visible | **bloqué** (suspension → support) | reste actif |

### 5. Wallet Affilié
- **Commission : 2 % du montant brut** de chaque course générée par le réseau (prélevée sur la part Fiw).
- Wallet **intermédiaire** dans l'app — pas de versement Mobile Money direct.
- **Retrait** vers Mobile Money à partir de **1 000 F CFA**.

### 6. Principes UX transversaux (audit)
- **Vocabulaire grand public** : on dit « Ambassadeur » et « Affilié », et le mot concret (« chauffeur », « livreur ») quand le service est connu ; jamais « prestataire » brut dans l'UI client.
- Chaque **liste vide** affiche un message qui dit quoi faire ensuite — jamais d'écran vide muet.
- Chaque **chemin d'échec** a un écran qui diagnostique, explique et propose une action de récupération.
- Tout **mouvement d'argent** passe par un récapitulatif explicite avant le point de non-retour.
- Le badge **« Fondateur »** est toujours accompagné d'une phrase qui explique pourquoi les commissions sont encore gelées.

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

**Mon Wallet**
- Voir détail d'une commission → Détail commission
- « Retirer » [si Actif + solde ≥ 1 000 F] → Récapitulatif de retrait
- « Retirer » [si solde < 1 000 F] → Message : « Minimum 1 000 F pour retirer — il vous manque X F »
- « Retirer » [si Membre Fondateur] → Message : « Vos gains seront retirables au lancement officiel »
- « Retirer » [si Gelé] → Message : « Retraits momentanément suspendus — contactez le support » + bouton support
- [ solde disponible / historique / **règle de calcul** affichée en clair : « 2 % du prix de chaque course faite par vos affiliés » ]

**EMPTY STATE (aucune commission encore)**
- [ « Pas encore de gains — ils apparaîtront ici dès que les personnes de votre réseau commenceront à faire des courses. » ]

**Détail commission**
- Retour → Mon Wallet
- [ date / Affilié concerné (« chauffeur » / « livreur » / client selon le cas) / courses générées / montant ]

**Récapitulatif de retrait**
- « Confirmer le retrait » → Traitement
- « Modifier le numéro » → Saisie numéro Mobile Money
- Annuler → Mon Wallet
- [ EN GRAND : « Vous retirez X F vers le [numéro Mobile Money] » / frais éventuels affichés / délai estimé d'arrivée ]

**Saisie numéro Mobile Money**
- « Valider » → Récapitulatif de retrait
- Retour → Récapitulatif de retrait
- [ champ numéro / opérateur détecté (Wave / Orange Money / Free Money) ]

**Traitement**
- → automatiquement → Confirmation [succès]
- → automatiquement → Échec de retrait [si échec]

**Confirmation [succès]**
- Retour → Mon Wallet
- [ ✓ « Retrait envoyé » / montant / numéro / statut « En cours d'arrivée » ]

**Échec de retrait**
- « Réessayer » → Récapitulatif de retrait
- « Contacter le support » → Support
- Retour → Mon Wallet
- [ ✕ cause (numéro invalide / problème réseau / solde indisponible) + ce qu'il faut faire
  / **rassurer explicitement** : l'argent n'a pas quitté le Wallet Affilié ]

### JS4 — Proposer un prestataire à un Partenaire

> **Reporté.** Action cross-app (Client → Affilié Partenaire dans Fiw Pro) au bénéfice non défini. À spécifier dans une session dédiée avant breadboard.

---

## Décisions reportées / ouvertes

- **JS4 + Prestataires favoris** — but, destinataire et bénéfice Ambassadeur à définir.
- **Déclencheur de l'état Gelé** — qui gèle, sur quels critères ? (non spécifié dans la source)
- **Définition « actif » vs « inactif »** d'un Affilié — seuil (1ʳᵉ course ? course dans les N jours ?) à trancher pour les listes Mon Réseau.
