# EMSP Connect v2 — BACKEND DJANGO : MESSAGERIE TEMPS RÉEL & RDV
## Doc 21 — Spécification backend T3b (Django 5 + DRF + Channels)

> **Contrat verbatim.** Le front T3a (mergé, tagué `t3a-comm`) tourne sur des mocks MSW
> qui implémentent DÉJÀ ce contrat à la lettre (`app/src/shared/mocks/handlers-t3.js`).
> Le backend n'invente rien : il reproduit ces réponses octet pour octet. La bascule
> se fait par variables d'environnement, sans toucher au code des features.

---

## 1. Objet & périmètre T3b

- Remplacer les mocks MSW par un vrai backend pour **messagerie** (doc 08) et **rendez-vous** (doc 06).
- Temps réel : le simulateur WS du front est remplacé par **Django Channels** (même vocabulaire d'événements).
- Auth : SimpleJWT, **access token en mémoire** (jamais localStorage, doc 19 §5.1), **refresh en cookie httpOnly** posé par le backend.
- Hors périmètre T3b : commentaires (doc 09), événements (doc 10), admin (doc 12), groupes riches (doc 13) — tranches ultérieures. Les apps sont nommées pour les accueillir sans refonte.

## 2. Stack & arborescence (verrouillées)

| Choix | Valeur | Pourquoi |
|---|---|---|
| Python | 3.13 via **uv** (`.venv` dans `backend/`) | déjà installé, pas de pip système (PEP 668) |
| Django | 5.x LTS | standard, ORM migrations |
| API | DRF + `drf-spectacular` | sérialisation, schéma OpenAPI |
| Temps réel | Channels + `channels-redis` *(ou InMemory en dev)* | couche pub/sub |
| Auth | `djangorestframework-simplejwt` + `corsheaders` | cookie httpOnly + CORS :5200 |
| DB dev | SQLite (`db.sqlite3`) | démo locale ; Postgres en déploiement |
| Qualité | **pytest + pytest-django**, **ruff** | même exigence que le front (doc 19 §9) |

```
backend/
├── pyproject.toml            # deps uv + config ruff/pytest
├── manage.py
├── config/                   # settings/, urls.py, asgi.py, consumers racine
│   └── settings/{base,dev}.py
├── comptes/                  # User @emsp.int, JWT, suspension (423)
├── messagerie/               # Conversation, Message, consumers WS
└── rendezvous/               # RendezVous + machine à états
```

## 3. Contrat REST — verbatim du front (doc 08 §2 / doc 06 §2)

Erreurs : format DRF `{"detail": "…"}`. 401 non authentifié, 403 hors binôme/hors rôle, 404 inconnu, 422 payload invalide, 409 règle déjà satisfaite (avis, doublon de binôme).

### 3.1 Messagerie

| Requête | Réponse | Règles serveur |
|---|---|---|
| `GET /api/conversations/` | `{ results: [Conversation] }` tri **plus récents d'abord** (`dateDernierMessage` desc) | seulement MES conversations (participant) |
| `GET /api/conversations/{id}/messages/?avant={id}` | `{ hasMore: bool, cursor: id|null, results: [Message] }` — **descendant**, page 8 | `avant` filtre `id < avant` ; `cursor` = id du DERNIER renvoyé |
| `POST /api/conversations/{id}/messages/` `{contenu, idempotencyKey}` | **201** Message | contenu trim 1..2000 ; **clé déjà vue → même message renvoyé (201, zéro doublon)** ; participants seulement |
| `PATCH /api/conversations/{id}/lu/` `{dernierMessageId}` | `{ ok: true }` | marque lu jusqu'à `dernierMessageId` (compteur → 0) |

Shapes (noms JS exacts consommés par le front) :

```
Conversation = { id, type: "prive"|"groupe_famille", interlocuteur: Utilisateur|null,
                 groupe: {titre, iconeCode, membres[]}|null,
                 dernierMessage: {contenu, dateEnvoi}|null, nonLus: int }
Message      = { id, conversationId, contenu, dateEnvoi (ISO 8601 UTC),
                 auteurId, envoyeParMoi: bool, idempotencyKey }
Utilisateur  = { id, prenom, nom, filiere, classe, avatarCouleur?, initiales }
```

### 3.2 Rendez-vous

| Requête | Corps | Effet |
|---|---|---|
| `GET /api/rendez-vous/?scope=a_venir\|passes` | — | `{ count, results }` tri chronologique asc ; `a_venir` = `dateHeure` future ET statut ∈ {propose, confirme, contre_propose} ; `passes` = passé OU statut ∈ {passe, refuse, annule} ; chaque résultat porte `organisateurMoi: bool` |
| `GET /api/rendez-vous/prochain/` | — | `{ result: RendezVous|null }` — confirmé, `rappelVu=false`, 0 < Δ ≤ 48h ; **route déclarée AVANT `:id`** (piège T3a §9.5) |
| `POST /api/rendez-vous/` | `{inviteId, titre, description?, dateHeure, lieu, mode}` | 201 `propose` ; invite = binôme actif sinon **403** ; `dateHeure > now + 5 min` sinon 422 ; `lieu` requis si `presentiel` sinon 422 |
| `PATCH /api/rendez-vous/{id}/repondre/` | `{decision: "confirme"\|"refuse"}` | invité seulement (403) ; sur `contre_propose` : `confirme` = l'organisateur-appliant reprend le créneau de la CP (dateHeure/lieu appliqués, CP vidée) ; inconnu → 422 |
| `POST /api/rendez-vous/{id}/contre-proposition/` | `{dateHeure, lieu}` | statut → `contre_propose`, garde `{dateHeure, lieu}` dans `contreProposition` |
| `PATCH /api/rendez-vous/{id}/annuler/` | — | statut → `annule` (tout statut sauf passe/refuse) |
| `GET /api/rendez-vous/{id}/` | — | détail + `organisateurMoi` |
| `PATCH /api/rendez-vous/{id}/rappel-vu/` | — | `rappelVu = true` (le X masque, n'annule PAS) |

```
RendezVous = { id, organisateur: Utilisateur, invite: Utilisateur, organisateurMoi: bool,
               titre, description|null, dateHeure, lieu, mode: "presentiel"|"visio",
               statut: "propose"|"confirme"|"refuse"|"contre_propose"|"annule"|"passe",
               contreProposition: {dateHeure, lieu}|null, rappelVu?: bool }
```

**Machine à états (doc 06)** : `propose → confirme|refuse` (invité) ; `propose → contre_propose` (invité) ; `contre_propose → confirme|refuse` (organisateur tranche) ; tout statut sauf `passe`/`refuse` → `annule` ; un job (management command, cron) bascule `confirme` → `passe` après `dateHeure`.

## 4. Contrat WS — verbatim du front (`useWebSocketChat.js`)

- URL : `VITE_WS_URL` côté front (ex. `ws://localhost:8000/ws/chat/?token=<access>`) ; le token JWT passe en **query param** (le navigateur ne peut pas poser de header sur WebSocket) — validé à l'`accept_connection` par `get_user` AsyncSimpleJWT.
- Groupes Channels : `conv.{id}` (un par conversation, participants seulement — vérifié au `connect`).

| Événement client → serveur | Serveur diffuse | Charge |
|---|---|---|
| `{"type":"join","conversationId":id}` | — (trace présence) | — |
| `{"type":"typing","conversationId":id}` | à l'AUTRE participant : `{type:"typing", conversationId}` | — |
| POST REST d'un message | `{type:"message.new", conversationId, message}` | shape Message §3.1 |
| PATCH `/lu/` | `{type:"message.lu", conversationId, dernierMessageId}` | remet le badge à 0 chez l'émetteur |
| déconnexion | `{type:"presence", utilisateurId, enLigne: bool}` | — |

Le message temps réel est **publié depuis le viewset REST** (source de vérité unique) via `channel_layer.group_send` — le consumer n'écrit jamais en base.

## 5. Modèles (apps `messagerie`, `rendezvous`, `comptes`)

- **comptes.User** (AbstractUser) : `email` unique = identifiant (`@emsp.int` validé au signup — le back ne crée que ça en T3b) ; `prenom`, `nom`, `filiere`, `classe`, `est_suspendu` (+ `fin_suspension`) → toute requête d'un compte suspendu : **423** `{motif, fin}` (RG11, doc 19 §4.1).
- **messagerie.Conversation** : `type` (prive/groupe_famille), `participants` M2M, `titre_groupe`, `icone_code`, `proprietaire_id` (groupes). Contrainte : max 1 conversation privée par paire (index fonctionnel ou validation).
- **messagerie.Message** : `conversation` FK, `auteur` FK, `contenu` (1..2000, trim), `date_envoi` (auto), **`idempotency_key` unique (contrainte avec `(conversation, auteur)`)** — c'est le support de la règle zéro doublon.
- **messagerie.Lecture** : `(conversation, utilisateur, dernier_message_lu_id)` — alimente `nonLus` (count des messages postérieurs à la lecture, sans l'auteur = moi).
- **rendezvous.RendezVous** : `organisateur` FK, `invite` FK, `titre`, `description` null, `date_heure`, `lieu`, `mode`, `statut` (choices), `cp_date_heure`, `cp_lieu` (contre-proposition), `rappel_vu` bool.
- **comptes.Binome** : `aine` FK, `cadet` FK, `statut` (actif/clos) — source du « hors binôme → 403 » (RDV) et des conversations privées T4.

## 6. Sécurité (doc 19 revalidé côté serveur)

1. TOUT endpoint protégé par JWT ; les gardes UI (peutRepondre…) sont une UX — **le backend revalide** (403 de toute façon).
2. Refresh : `POST /api/auth/refresh/` **sans corps** — lit le cookie httpOnly `refresh_token` (`HttpOnly; Secure; SameSite=Strict; Path=/api/auth/`), renvoie un access token. Rotation activée ; logout = blacklist.
3. `ACCESS_TOKEN_LIFETIME=15 min` ; CSRF exempté sur /api/auth/* (JWT, pas de session) ; CORS restreint à `http://localhost:5200` avec `CORS_ALLOW_CREDENTIALS=True`.
4. 423 suspension AVANT tout le reste (middleware fin, RG11).
5. Permissions objet : `IsParticipant` (conversations/messages), `IsOrganisateurOuInvite` (RDV) — queryset filtrée par user, jamais d'id nu en confiance.
6. Secrets via env (`DJANGO_SECRET_KEY`, …) ; `DEBUG` jamais en prod ; Sentry DSN TÔT (doc 19 §7).

## 7. Qualité (doc 19 §9 transposé backend)

- **pytest-django** : chaque RG serveur a son test — idempotence (2 POST même clé → 1 message, même id), pagination curseur (page 8, `avant`, `hasMore`, `cursor`), `/lu/` remet `nonLus` à 0, RDV 403 hors binôme, 422 date passée / lieu manquant, matrice machine à états (qui peut répondre à quoi), `/prochain/` fenêtre 48h + `rappelVu`, 423 suspension, refus d'un non-participant.
- **ruff** (lint + format) zéro erreur ; `python manage.py check --deploy` en CI.
- Commande : `cd backend && uv run pytest` — toute PR verte avant merge (mêmes critères que le front).

## 8. Seeds démo (cohérents avec `store-t3.js`)

Management command `python manage.py seed_demo` (idempotent) reproduisant l'état T3a : Ivo (id 1, L2) ↔ **Awa Kouassi** (id 2, aînée réseaux) binôme actif ; Yann (12), Salim (13) ; conversation privée 101 (3 non-lus, « Parfait, on fait ça demain à 14h ! »), famille 501 ; messages 1..10 de la conv 101 ; RDV 401 **confirmé, dateHeure = « demain 14h » calculé au seed** (leçon T3a : jamais de date en dur — la bannière J-1 reste vivante), 402 passé, 403 « propose » (Visio 2026-09-02, par Awa). Comptes de démo : mots de passe `demo` documentés dans le README, jamais en prod.

## 9. Bascule front ↔ backend (zéro refactor des features)

| Étape | Front | Backend |
|---|---|---|
| 1 (état actuel) | `VITE_ENABLE_MOCKS=1` — MSW monte | — |
| 2 | `.env.local` : `VITE_ENABLE_MOCKS` retiré, `VITE_API_URL=http://localhost:8000`, `VITE_WS_URL=ws://localhost:8000/ws/chat/` | `uv run manage.py runserver 8000` (ASGI) |
| 3 (dev ergonomique, option) | proxy Vite `/api` + `/ws` → :8000 (alors `VITE_API_URL` vide) | — |

Points d'attention : cookies `SameSite=Strict` ⇒ front et API **même origine** (proxy) ou `SameSite=Lax` + CORS credentials pendant le dev ; MSW OFF = plus aucun service worker intercepte (vérifier la page « mystérieusement vide » piège doc 20 §9 leçon 106).

## 10. Definition of Done T3b (doc 19 §9)

```
[ ] uv run pytest : tous les RG serveur verts
[ ] ruff check . : 0 erreur
[ ] manage.py check --deploy sans warning critique (dev toleré)
[ ] Bascule réelle : front sur :8000, conversation 101 visible, message envoyé
    apparaît chez l'autre participant via WS (2 navigateurs), RDV confirmable
[ ] Aucune réponse qui diverge des shapes §3 (comparer aux handlers MSW)
[ ] doc 20 §10 « Backend T3b » écrite + SKILL.md emsp-connect-project mis à jour
[ ] Rituel git : feat/t3-comm-backend → commit signé → merge --no-ff → tag t3b-backend
```

