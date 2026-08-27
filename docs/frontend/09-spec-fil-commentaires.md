# EMSP Connect v2 — Spec FIL D'ACTUALITÉ & ESPACES D'ÉCHANGE
## Doc 09 — Feed d'annonces + commentaires communautaires

> Prérequis : docs 02, 03. Feature dir : `src/features/fil/`
> **Rôle produit** : c'est L'ESPACE COLLECTIF d'échange entre TOUS les étudiants (décision produit août 2026) — la messagerie privée reste réservée au binôme (doc 08). Le cahier des charges ne détaille pas ce module (bonus EMSP) ; cohérence RG4/RG5 et modération admin obligatoires.

---

## 1. Objectif

Un mur d'annonces structuré où la vie du parrainage est visible : succès de binômes, annonces d'Aînés, questions ouvertes des Cadets, actualités école — et surtout une ZONE COMMENTAIRES sous chaque publication qui permet l'échange étudiant↔étudiant sans ouvrir la messagerie privée à tous.

**Users stories :**
- En tant qu'étudiant connecté (tout rôle), je scrolle un feed dense et je publie une annonce textuelle en quelques secondes.
- En tant qu'étudiant, je commente et réponds aux commentaires sous une publication (échange public maîtrisé).
- En tant que lecteur, je filtre par type (annonce / question / succès) plutôt que par algorithme.
- En tant qu'auteur, je modifie/supprime MA publication tant que personne n'y a répondu.
- En tant qu'admin, je masque/restore tout contenu signalé (doc 12).

---

## 2. Données & API

```
GET    /api/publications/?type=&page=     → { count, results: Publication[] }
POST   /api/publications/                 // body {type, contenu} → 201
PATCH  /api/publications/:id/             // auteur only, tant que nbCommentaires===0
DELETE /api/publications/:id/
POST   /api/publications/:id/reactions/   // body {code:"bravo"|"merci"|"utile"} toggle
GET    /api/publications/:id/commentaires/?page=
POST   /api/publications/:id/commentaires/ // body {contenu, parentId?}
DELETE /api/commentaires/:id/              // auteur OU admin
POST   /api/signalements/                  // body {contentType, objectId, raison}
```

```js
/**
 * @typedef {"annonce"|"question"|"succes"} TypePublication
 * @typedef {Object} Publication
 * @property {number} id @property {TypePublication} type
 * @property {User} auteur                     // tout rôle sauf publication type "annonce_officielle" réservée admin
 * @property {string} contenu                  // 10..1200 chars
 * @property {string} dateCreation
 * @property {{bravo:number, merci:number, utile:number}} reactions   // + maReaction:string|null
 * @property {number} nbCommentaires
 */
/**
 * @typedef {Object} Commentaire
 * @property {number} id @property {number} publicationId @property {number|null} parentId // 1 niveau de réponse max
 * @property {User} auteur @property {string} contenu   // 2..600
 * @property {string} dateCreation
 */
```

Clés query : `["publications", filtres]`, `["commentaires", pubId]`. Règles hard :
- Un étudiant peut poster **1 question/jour max** (anti-spam côté backend ; front affiche compteur restant).
- Réponses : UN seul niveau imbriqué (`parentId`), au-delà → mention `@Prénom` dans le texte.
- Reactions fermées (3 codes fixes) : jamais de like générique infini.

---

## 3. Structure fichiers

```
src/features/fil/
├── pages/FilPage.jsx                 # /fil
├── components/
│   ├── ComposeurPublication.jsx      # carte création en tête
│   ├── CartePublication.jsx          # publication complète + actions
│   ├── FiltresType.jsx               # segmented Tous|Annonces|Questions|Succès
│   ├── FilCommentaires.jsx           # section dépliable sous publication
│   ├── CommentaireItem.jsx           # avec bouton Répondre (→ champ inline)
│   └── ModaleSignaler.jsx            # raison prescrite (spam/harcèlement/faux/info)
├── hooks/usePublications.js
└── schemas.js                        // zod contenu lengths, type enum
```

---

## 4. Wireframe — `/fil`

```
╔══ PROTECTED SHELL ═════════════════════════════╗
║ h1 "Fil d'actualité"      [FiltresType inline]  ║
╠ COMPOSEUR (panel opaque, avatar+textarea) ══════
║ [Avatar sm] « Partage une annonce, pose une    ║
║ question... » → focus ouvre form complet:      ║
║ [segmented Type] [textarea 10..1200 compteur]  ║
║ hint or si question : « Les Aînés répondent ici║
║ — pour un suivi personnel, passe par l'annuaire»║
║                      [Publier primary loading] ║
╠ FEED (staggerContainer, pleine largeur col 720px)║
║ ┌CartePublication─────────────────────────────┐ ║
║ │ chip TYPE        Avatar+Nom·filière · date  │ ║
║ │ CONTENU multi-ligne (titre implicite 1ère ligne bold)│
║ │ [Bravo n][Merci n][Utile n] 💬12 commentaires│ ← icônes lucide MessageCircle
║ │ ▸ ZONE COMMENTAIRES dépliée/collapsée animée │
║ └─────────────────────────────────────────────┘ ║
║ SKELETON ×3 pendant loading / EmptyState:       ║
║ « Le fil est calme... sois le premier à poster »║
╚════════════════════════════════════════════════╝
```

Chip tones type : annonce=info · question=gold · succes=success.

### Zone commentaires (l'échange)
```
CommentaireItem (indenté si réponse):
[Avatar xs] Nom · il y a 2h          ⋯ menu(signaler/suppr si moi/admin)
Contenu...
[Répondre ghost-xs] → champ inline avec placeholder « Répondre à Prénom »
Chargement: skeletonRow ×2 | Empty: « Sois le premier à commenter »
```
Actions rate-limitées visuellement : bouton désactivé 15s après post success (anti-double-post), idempotencyKey aussi appliqué.

---

## 5. Comportements clés

| Situation | Comportement |
|---|---|
| Publication supprimée par auteur avec réponses >0 | Backend refuse (409) → front propose « Archiver » (masque du feed, gardé pour modération) |
| Contenu signalé déjà masqué | Carte remplacée par panneau discret « Publication retirée en attente de modération » |
| Non-connecté ? | Impossible : route protégée — le shell renvoie /connexion |
| Filtre actif | Chip compteur dans header, sync URL `?type=question` |

---

## 6. Animations contractuelles

- Entrées publications : staggerItem (limite : seulement 20 premiers items, sinon fade simple — perf scroll long)
- Zone commentaires expand/collapse : AnimatePresence height auto 200ms ease-out
- Reaction toggle : spring scale 1→1.15→1 + incrémentation compteur
- Nouveau commentaire posté : insertion top optimiste fadeInUp + validation serveur remplace

## 7. Accessibilité

- Feed = `<main>` h1 unique ; publications `<article>` avec `<h2>` sr-only si titre implicite
- Bouton commentaires : aria-expanded + aria-controls sur le conteneur
- Signaler : role button + ConfirmDialog, raisons radios obligatoires

## 8. Critères d'acceptation

1. Toute chaîne : publier → commenter → répondre → réagir fonctionne full clavier.
2. Impossible de publier <10 chars (bouton disabled + helper zod live).
3. Mes publications sans commentaires : edit/delete dispo ; après 1er commentaire : disparus (409 géré).
4. Réaction togglable off (re-clic) — pas d'accumulation multiple même utilisateur même code (UI vérifie maReaction).
5. Une réponse imbriquée sous une réponse est automatiquement aplatie au niveau 1 avec mention `@`.
6. Règle 1 question/jour : compteur affiché quand approche limite.
7. Checklist design-system doc 03 §11.

## 9. Frontières

- Pas de photos/images en V1 (stockage externe phase prod) → texte pur assumé
- Notifications push des réponses : badge nav + toast in-app V1
- Posts officiels admin (annonces direction) : doc 12
