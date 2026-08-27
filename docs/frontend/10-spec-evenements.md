# EMSP Connect v2 — Spec ÉVÉNEMENTS COLLECTIFS
## Doc 10 — Événements §3.7 + espace d'échange associé

> Prérequis : docs 02 (`Evenement`, matrice permissions), 03. Feature dir : `src/features/evenements/`
> Rôle : dimension communautaire du dispositif — un Aîné ou l'admin crée un événement ouvert à PLUSIEURS cadets (atelier, sortie, session de révision). Chaque événement porte une zone discussion = 2e espace collectif d'échange étudiant (décision produit août 2026).

---

## 1. Objectif

Créer, découvrir et s'inscrire aux événements collectifs depuis la plateforme (§3.7 exact) ; échanger sous forme de questions/réponses dans l'espace dédié de chaque événement.

**Users stories :**
- Aîné/Admin : je crée un événement (titre, description, date, lieu, capacité).
- Cadet/Aîné : je vois les événements à venir avec places restantes et je m'inscris/désinscris en un clic.
- Participant : je pose mes questions dans l'espace discussion de l'événement.
- Organisateur : je vois la liste des inscrits et je peux leur envoyer un message collectif via l'annonce automatique sur le Fil (doc 09) quand details changent.
- À J+2 après l'événement : les participants reçoivent l'invitation à noter (alimente badges aîné + historique).

---

## 2. Données & API

```
GET    /api/evenements/?scope=a_venir|passes&page= → { count, results: Evenement[] }
POST   /api/evenements/            // rôle aîné|admin seulement
GET    /api/evenements/:id/
POST   /api/evenements/:id/inscription/    // toggle → 201 | 409 complet
DELETE /api/evenements/:id/inscription/
GET    /api/evenements/:id/participants/?page=
GET    /api/evenements/:id/messages/?page=      // discussion événément = Commentaire[] réutilise modèle doc 09
POST   /api/evenements/:id/messages/           // body {contenu}  (participants only)
PATCH  /api/evenements/:id/                    // organisateur only
```
Types doc 02 §5 + `maReaction` non applicable ici. Clés query `["evenements", scope]`, `["evenement", id]`, `["participants", id]`, `["discussion", eventId]`.

Règles hard :
- Capacité max stricte : si `nbInscrits >= capaciteMax` → bouton désactivé + chip « COMPLET » (même logique visuelle que jauge RG2/Aînés).
- Désinscription possible jusqu'à H-2h avant début (au-delà → contact organisateur par messagerie binôme ou publication Fil).
- Seuls les INSCRITS voient le champ de saisie de la discussion ; les autres lisent en mode lecture seule avec encart « Inscris-toi pour participer à l'échange ».
- Un aîné organisateur voit un badge progression vers badge `evenement_organise` (doc 07) dès sa première création.

---

## 3. Structure fichiers

```
src/features/evenements/
├── pages/EvenementsPage.jsx          # liste (/evenements)
├── pages/EvenementDetailPage.jsx     # fiche (/evenements/:id)
├── components/
│   ├── CarteEvenement.jsx            # date bloc + titre + jauge places
│   ├── ModaleCreationEvenement.jsx   # react-hook-form + zod
│   ├── BlocInscription.jsx           # CTA contextuel selon état
│   ├── ListeParticipants.jsx         # avatars empilés + détail
│   └── DiscussionEvenement.jsx       # réutilise patterns commentaires doc 09 (sans imbrication replies ? niveau 1 ok)
├── hooks/useEvenements.js
└── schemas.js                        // zod dates futures, capacite 2..100, titre/desc lengths
```

---

## 4. Wireframe — `/evenements`

```
╔══ PROTECTED SHELL ═══════════════════════╗
║ h1 "Événements"                          ║
║ Tabs [À venir(4)] [Passés] [+ Créer gold àîné/admin]
╠ GRID cartes sm:grid-cols-2 lg:grid-cols-3 ║
║ ┌CarteEvenement─────────────────┐         ║
║ │ BLOC DATE panel vert profond: │         ║
║ │  SEP 03                       │         ║
║ │  14:30                        │         ║
║ │ Titre bold (ex Atelier SQL)   │         ║
║ │ Par Awa KONÉ · L3             │         ║
║ │ 📍 Amphi B · visio si webconf │         ║
║ │ Jauge inscriptions ██████░░ 8/12│       ║
║ │ [Détail → ghost]              │         ║
║ └───────────────────────────────┘         ║
║ EmptyState : CalendarOff « Aucun événement programmé »
╚═══════════════════════════════════════════╝
```

## 5. Wireframe — `/evenements/:id`

```
╠ HEADER panel vert profond pleine largeur kente-band ═══
║ chip "ATELIER/SORTIE/RÉVISION"? (type librement choisi par créateur comme tag texte)
║ h1 Titre · meta organiser Avatar+Nom                   ║
║ Date longue fr · Lieu/icon · Capacité jauges           ║
╠ GRID lg:[1fr_360px] ═══════════════════════════════════
║ COL PRINCIPALE                                         ║
║ DESCRIPTION (panel crème-alt whileInView)              ║
║ DISCUSSION DE L'ÉVÉNEMENT (panel)                      ║
║   Liste messages estilo comments doc 09                ║
║   Input en bas SI inscrit — sinon Encart lecture       ║
║ COL STICKY                                             ║
║ BLOCINSCRIPTION:                                       ║
║   • non inscrit & places → primary « Je participe »    ║
║   • inscrit → success outline « Inscrit ✓ Se désister» ║
║   • complet → disabled + chip danger COMPLET           ║
║ LISTE PARTICIPANTS avatars stack + compteur            ║
║ + note organzaire « Fait partie des badge counts »     ║
╚═════════════════════════════════════════════════════════╝
```

### Modale création (aîné/admin)
Champs : Titre* (5..90) | Description* (30..1500, aidé placeholder exemples §3.7 ateliers/sorties/révisions) | Date&heure* future | Lieu* OU « En ligne » bascule | Capacité* (2..100, défaut 15) | Tag libre optionnel (max 24 chars).
Succès → toast + redirect fiche + hint « Annonce ton événement sur le Fil pour maximiser l'audience » avec bouton prérempli (cross-feature doc 09).

---

## 6. Animations contractuelles

- Cartes : staggerContainer + hoverLift ; bloc date : scaleX subtle on view
- Bouton « Je participe » : morph success (layout animation compteurs inscrits instantané optimiste puis invalidation)
- Discussion : mêmes patterns doc 09 (fadeInUp insertion)

## 7. Accessibilité

- Jauge place : aria-label « Places restantes : 4 sur 12 »
- Boutons inscription: `aria-pressed` sur état inscrit
- Table participants desktop mobile-consistent avatars w/ alt

## 8. Critères d'acceptation

1. Cadet NE peut PAS accéder au bouton créer (ni route directe - garde rôle).
2. Complet ⇒ UI bloque inscription ET API 409 gérée gracieusement si course concurrentielle entre deux clics.
3. Désinscription H-2h bloquée avec explication horaire précise.
4. Non-inscrit lit la discussion mais champ absent (pas juste disabled — ABSENT, encart CTA affiché).
5. L'organisateur est toujours visible dans participants même à pleine capacité.
6. Après création : invitation cross-post Fil fonctionne (draft publication type annonce préremplie).
7. Checklist design-system doc 03 §11.

## 9. Frontières

- Rappels email/J-1 événement : backend
- Séries/événements récurrents : hors V1
- Notes post-événement des participants vers organisateur : V2 (les badges aîné suffisent phase 3)
