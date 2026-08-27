# EMSP Connect v2 — Spec ADMINISTRATION & MODÉRATION
## Doc 12 — Dashboard stats (§2-admin), gestion comptes, modération contenus

> Prérequis : docs 02 (matrice admin, RG5), 03, 09 (signalements), 07 (avis signalables). Feature dir : `src/features/admin/`
> Sources cahier : §2 « Gère les comptes et modère les contenus signalés / Consulte les statistiques / Suspend ou supprime un compte » + RG5 changement de rôle + détection binômes en difficulté (§3.6).

---

## 1. Objectif

Donner à l'admin une vue de pilotage complète et des actions irréversibles bien gardées :
- `/administration` : dashboard statistiques (parrainages actifs, étudiants en attente) + file des alertes.
- `/moderation` : traite les contenus signalés (publications, commentaires, avis), gère les comptes (suspension, suppression, changement de rôle RG5).

**Users stories :**
- En tant qu'admin, je vois EN UN COUP D'ŒIL la santé du dispositif : volume parrainages actifs, cadets sans Aîné, demandes en attente depuis >7j, binômes à risque (note <3 ou inactivité messagerie).
- En tant qu'admin, je traite la file de signalements par priorité avec contexte complet autour de chaque contenu.
- En tant qu'admin, je suspends/restaure/supprime un compte et change un rôle avec les garde-fous requis.
- En tant qu'admin, je publie des annonces officielles sur le Fil (doc 09 — type publication réservé).

---

## 2. Données & API

```
GET /api/admin/stats/
    → { parrainagesActifs, cadetsSansParrain, ainesDisponibles,
        demandesEnAttente, demandesStales7j, moyenneFiabiliteGlobale,
        rdvMois, evenementsMois, tauxReponseDemandes }
GET /api/admin/binomes-risque/?page=     // note<3 OU aucun message échangé depuis 21 jours
GET /api/admin/signalements/?statut=nouveau|traite&page=
GET /api/admin/signalements/:id/         // contenu complet + auteur + signalant(s) + historique
POST /api/admin/signalements/:id/traiter/ // body {action:"masquer"|"restaurer"|"supprimer"|"rejeter", note?}
GET    /api/admin/utilisateurs/?q=&statut=etudiant|alumni|suspendu&page=
POST   /api/admin/utilisateurs/:id/suspendre/   // body {motif}
POST   /api/admin/utilisateurs/:id/restaurer/
DELETE /api/admin/utilisateurs/:id/             // suppression définitive
PATCH  /api/admin/utilisateurs/:id/role/        // body {nouveauRole} — RG5
POST   /api/publications/                       // type="annonce_officielle" (cf doc 09)
```

Règles hard :
1. Garde de route DOUBLE : côté shell (ProtectedRoute roles:["admin"]) ET redirection `/accueil` si accès direct.
2. Toute action destructive exige ConfirmDialog avec motif texte ≥10 chars, sauf restaurer/rejeter (one-click).
3. Changement de rôle : modale dédiée listant les conséquences automatiques (binômes en cours → que deviennent-ils ? quota ?) — l'API tranche, le front affiche le plan retourné. Transition annuelle RG10 : bouton collectif « Clôturer l'année — passer les L3 en Alumni » (récapitulatif, confirmation forte, loggé).
4. Les stats se rafraîchissent au mount + bouton refresh manuel ; PAS de polling agressif (60s max).
5. Chaque action admin est loggée serveur ; front affiche l'historique dans le panneau détaillé du signalement.

Clés query : `["admin-stats"]`, `["signalements", statut]`, `["utilisateurs", filtres]`, `["binomes-risque"]`.

---

## 3. Structure fichiers

```
src/features/admin/
├── pages/
│   ├── AdminDashboardPage.jsx        # /administration (et alias /admin-dashboard)
│   └── ModerationPage.jsx            # /moderation
├── components/
│   ├── GrilleStats.jsx               # KPI cards denses
│   ├── TableauBinomesRisque.jsx      # liste priorisée + accès contexte
│   ├── FileSignalements.jsx          # tabs Par statut, cards contextuelles
│   ├── CarteSignalement.jsx          # contenu incriminé RENDU + actions
│   ├── TableUtilisateurs.jsx         # recherche + filtres + row actions
│   ├── ModaleChangementRole.jsx      # RG5 gardee-fou
│   └── ComposeurOfficiel.jsx         # annonce officielle → Fil
├── hooks/useAdminStats.js
└── schemas.js                        // zod motifs min length etc.
```

---

## 4. Wireframe — `/administration`

```
╔══ PROTECTED SHELL (badge ADMIN doré navbar) ══════╗
║ h1 "Administration" meta dernière MAJ il y a Xmin ║
║                                    [Actualiser outline-sm]
╠ GRILLE STATS (stagger, cards denses panel opaque) ║
║ ┌─────────┐┌─────────┐┌─────────┐┌─────────────┐  ║
║ │ 42       ││ 18       ││ 23       ││ 7 ⚠           │ ║ ← accent si >0
║ │Parrainages││Cadets sans││Aînés     ││Demandes >7j  │ ║
║ │actifs    ││Aîné      ││dispo     ││en attente    │ ║
║ └─────────┘└─────────┘└─────────┘└─────────────┘  ║
║ rangée secondaire : moy fiabilité · RDV mois · events · taux réponse
╠ TABLEAU BINÔMES À RISQUE (si >0, priorité haute) ═
║ trié gravité : [couple avatars] durée · signal (note 2.4 │ silence 24j)
║ [Ouvrir binôme ghost] → lecture messagerie? V2    ║
╠ ACCÈS RAPIDES panels : [File signalements →] n   ║
║ [Utilisateurs →] [Publier annonce officielle →]  ║
╚═══════════════════════════════════════════════════╝
```

## 5. Wireframe — `/moderation`

```
╠ h1 "Modération" ══════════════════════════════════
║ TABS [Signalements nouveaux (n)] [Traités] [Comptes]
╠ TAB SIGNALEMENTS :
║ CarteSignalement ×N stagger:
║ ┌──────────────────────────────────────────────┐
║ │ chip TYPE (Publication|Commentaire|Avis|Profil) · date signal · nb signaleurs
║ │ CONTEXTE rendu réel (blockquote stylée, pas JSON brut)
║ │ auteur: avatar+nom+stats fiabilité/signalements antérieurs
║ │ raisons cochées (spam/harcèlement/faux/info) réparties
║ │ NOTE PRIVÉE textarea optionnelle
║ │ [Masquer outline][Supprimer danger][Rejeter ghost][Restaurer si masqué]
║ └──────────────────────────────────────────────┘
╠ TAB COMPTES :
║ TableUtilisateurs (desktop table ↔ mobile cartes):
║ colonnes: utilisateur | rôle | statut | parrainages | dernières actions | ⋯menu
║ menu: Suspendre (danger-outline) / Restaurer / Changer rôle (gold) / Supprimer (danger plein)
╚═══════════════════════════════════════════════════╝
```

### ModaleChangementRole (RG5)
Étapes : 1) sélection nouveau rôle 2) API renvoie `consequences[]` affichées checklist lisuelle (ex : « 2 binômes actifs seront clôturés », « son profil disparaîtra de l'annuaire ») 3) confirmation par saisie du prénom de l'utilisateur ciblé. Loading état partout.

---

## 6. Animations contractuelles

- KPI cards : count-up numérique (framer-motion useSpring/useTransform) au premier affichage
- Card traitée : exit slide-out AnimatePresence + toast action
- Tabs transitions standard wait mode
- Ligne tableau hover : bord gauche accent-green 2px slide-in

## 7. Accessibilité

- Tableau : th scopés, caption sr-only, tri clavier si activé (défaut ordre serveur)
- Zones destructrices : aria-describedby warnings visibles
- Stats chiffrées avec libellés réels non abrégés pour lecteurs d'écran

## 8. Critères d'acceptation

1. Un non-admin tapant /administration est redirigé /accueil sans flash de contenu (garde avant render).
2. Impossible de supprimer/restaurer/masquer sans passer par la confirmDialog adaptée (chaque bouton) — tester les 4 chemins.
3. Le traitement d'un signalement le fait disparaître de l'onglet nouveau immédiatement (invalidation + optimisme désactivé ici : cohérence avant fluidité).
4. Un compte suspendu apparaît barré style distinct dans les listes consommatrices (annuaire, participants) ? NON — il disparaît (filtrage backend assumé).
5. Changement de rôle impossible sans étape confirmation prénom.
6. Les annonces officielles postées ont le chip distinctif `OFFICIEL` côté Fil (doc 09 consomme).
7. Checklist design-system doc 03 §11.

## 9. Frontières

- Lecture du contenu des conversations privées : NON livré V1 (intimité binôme — décision produit assumée, les signalements contiennent déjà l'extrait signalé)
- Statistiques exportables CSV/graphes temporels : phase prod
- Blocage IP/rate-limiting config : backend
