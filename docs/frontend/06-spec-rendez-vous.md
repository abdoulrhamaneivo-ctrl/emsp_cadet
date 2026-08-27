# EMSP Connect v2 — Spec RENDEZ-VOUS
## Doc 06 — Planification et suivi des rendez-vous binôme (cahier §3.5)

> Prérequis : docs 02 (entité `RendezVous`, statuts), 03, 05. Feature dir : `src/features/rendez-vous/`
> Cette fonctionnalité était absente du plan initial de routage ; elle est maintenant ROUTÉE officiellement : `/rendez-vous` et `/rendez-vous/:rdvId` (voir carte doc 02 §4).

---

## 1. Objectif

Une fois le binôme actif, les deux membres planifient des rencontres : l'un propose (titre, date, heure, lieu, mode), l'autre accepte, refuse ou **contre-propose** un autre moment (§3.5 exact). Un rappel automatique part avant chaque RDV validé.

**Users stories :**
- En tant que membre d'un binôme, je vois tous mes RDV triés À venir / Passés avec leur statut coloré.
- En tant que proposant, je crée une demande de RDV en 4 champs minimaux.
- En tant qu'invité, je réponds à une proposition : accepter / refuser / proposer un autre créneau.
- En tant que participant, je reçois visuellement le rappel à J-1 (badge + toast au login).

---

## 2. Données & API

```
GET    /api/rendez-vous/?scope=a_venir|passes&page=
       → { count, results: RendezVous[] }
POST   /api/rendez-vous/
       // body {inviteId, titre, description?, dateHeure, lieu, mode:"presentiel"|"visio"}
       → 201 RendezVous (statut propose) | 403 hors binôme
GET    /api/rendez-vous/:id/
PATCH  /api/rendez-vous/:id/repondre/   // body {decision:"confirme"|"refuse"} 
POST   /api/rendez-vous/:id/contre-proposition/ // body {dateHeure, lieu} → statut contre_propose
PATCH  /api/rendez-vous/:id/annuler/
```

Machine à états (affichage strict côté front) :
```
propose ──(invité confirme)──▶ confirme ──(date passée)──▶ passe
   │  ├──(invité refuse)──▶ refuse
   │  └──(invité contre-propose)──▶ contre_propose ──(proposant accepte)──▶ confirme
                          (proposant refuse la CP)──▶ passe/annule
tout statut sauf passe/refuse ──annulation manuelle──▶ annule
```
Règle front : le PROPOSANT traite les contre-propositions (les mêmes boutons Accepter/Refuser en inversé). Personne ne peut modifier un RDV `confirme`, seulement l'annuler ou créer un nouveau.

Clés query : `["rdv", scope]`, `["rdv", id]`. Invalidation croisée : `["mon-parrainage"]` (carte « prochain RDV »), `["accueil-stats"]`.

---

## 3. Structure fichiers

```
src/features/rendez-vous/
├── pages/
│   ├── RendezVousPage.jsx        # liste + onglets À venir / Passés
│   └── RendezVousDetailPage.jsx  # fiche complète + actions contextuelles
├── components/
│   ├── CarteRDV.jsx              # carte compacte de liste
│   ├── FormulaireProposition.jsx # modale création (react-hook-form+zod)
│   ├── ActionsReponse.jsx        # accepter/refuser/contre-proposer (invité)
│   ├── ModaleContreProposition.jsx
│   ├── CompteRenduRappel.jsx     # bannière J-1 sur la page
│   └── TimelineStatutRDV.jsx     # trail des états du RDV
├── hooks/useRendezVous.js
├── schemas.js                    // zod : dateHeure future, titre 3..80, lieu requis si presentiel
└── rules.js                      // canRespond(rdv, user) {ok, raison}
```

---

## 4. Wireframe — `/rendez-vous`

```
╔══ PROTECTED SHELL ═══════════════════════════╗
║ h1 "Rendez-vous"      [+ Proposer un RDV]   ║
╠═ [RAPPEL BANNIÈRE si confirme <48h] ════════
║ ⏰ panel crème-alt bord or : "Demain 14h30  ║
║    avec Awa KONÉ — Salle B12" [Ouvrir →]   ║
╠═ TABS [À venir (3)] [Passés (7)] ═══════════
║ FILE stagger CarteRDV                       ║
║ ┌─────────────────────────────────────────┐ ║
║ │ chip STATUT        (mode icon BookOpen/Video)│
║ │ Titre RDV (card title)                  │ ║
║ │ 📅 mardi 3 sept · 14:30 → 15:30        │ ║
║ │ 📍 Lieu OU lien visio                   │ ║
║ │ Organisé par Toi / Prénom NOM           │ ║
║ │ [Voir →] ghost                          │ ║
║ └─────────────────────────────────────────┘ ║
║ EmptyState passerelle : CalendarOff         ║
║ « Aucun rendez-vous » [+ Proposer primary]  ║
╚═════════════════════════════════════════════╝
```

Chip tones statuts : propose=info, confirme=success, refuse=danger, contre_propose=gold pulseGentle, annule=neutral barré, passe=muted.

### Modale Proposition (FormulaireProposition)
Champs : Titre* | Invité (prérempli si ouvert depuis profil binôme — sinon select du/des binômes) | Date+heure* (`input datetime-local`, min=now) | Mode* (segmented control Présentiel/Visio) | Lieu* si présentiel / URL générée si visio | Description textarea.
Zod temps réel ; submit → POST → toast « Proposition envoyée à {prenom} ».

---

## 5. Wireframe — `/rendez-vous/:rdvId`

```
╠ GRID lg:[1fr_380px] ═════════════════════════════════════
║ COL PRINCIPALE                                           ║
║ [← retour]                                               ║
║ PANEL HEADER vert profond : h1 titre, chips mode+statut, ║
║   date longue fr (date-fns PPP à HH'h'mm), lieu icône    ║
║ TIMELINE STATUT (Trail : proposée→réponse→état courant)  ║
║ DESCRIPTION bloc (panel crème-alt)                       ║
║ PARTICIPANTS : deux avatars + rôles organisateur/invité  ║
║ CONTRE-PROPOSITION ENCART si applicable :                ║
║   « {prenom} propose plutôt : dim 8 sept 10h00 — Biblio »║
║   [(organisateur) Accepter primary / Refuser outline]    ║
║ COLONNE ACTIONS (sticky):                                ║
║  • invité & statut propose : [Confirmer][Refuser][Contre-│
║    proposer] + ConfirmDialog avant refus                 ║
║  • invité & contre_propose : attente « réponse attendue» │
║  • confirme : [Annuler danger-outline] + ICS download?   ║
║  • tout état vivant : Annulation = motif court requis    ║
╚══════════════════════════════════════════════════════════╝
```

ÀCONFIRMER par Ivo (prévu mais non tranché) : téléchargement fichier .ics. Par défaut : PAS dans la V1.

---

## 6. Le rappel automatique (§3.5 « rappel avant chaque RDV valide »)

Front ne programme RIEN lui-même — c'est backend (tâche périodique). Front doit :
1. Exposer la bannière `<CompteRenduRappel/>` quand `dateHeure - now ∈ ]0h;48h] && statut==="confirme"` sur TOUTES pages du shell (widget global `shared/components/BanniereRappelProchainRDV.jsx`, alimenté par query `["prochain-rdv"]`).
2. Au chargement de session, si un rappel récent existe non vu → toast sonner once (`id: rdv-{id}-rappel`) pour déduplication.
3. Marquer visualisation via PATCH `/api/rendez-vous/:id/rappel-vu/`.

---

## 7. Animations contractuelles

- pageTransition liste↔détail
- Timeline statut : chaque jalon staggerItem + trait animé scaleY
- Chip contre_propose : pulseGentle jusqu'à décision
- Bannière rappel : slideIn top + bordure or
- Modales standard ; hoverLift cartes

## 8. Accessibilité

- datetime-local avec labels explicites + fallback saisie manuelle date (select jour/mois ? NON : input natif suffit mobile)
- chips statut : aria-label complet (« Statut : proposition en attente de réponse »)
- boutons désactivés : disabled ET title/aria-describedby expliquant pourquoi

## 9. Critères d'acceptation

1. Impossible de proposer un RDV à quelqu'un qui n'est pas mon binôme (UI jamais affichée + erreur 403 gérée gracieusement).
2. Un RDV refusé reste consultable historiquement (onglet Passés inclus) avec date/lieu d'origine.
3. Contre-proposition : seul l'AUTRE voit les boutons d'acceptation — vérifier matrice canRespond.
4. La bannière J-1 apparaît max 1 fois par RDV (rappel-vu persiste).
5. Après annulation d'un confirmé : place libérée côté état local, invalide ["mon-parrainage"].
6. Validation zod empêche soumission passée (< now+5min) avec message clair.
7. Checklist design-system doc 03 §11 complète.
