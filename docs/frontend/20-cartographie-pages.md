# EMSP Connect v2 — CARTOGRAPHIE DES PAGES
## Doc 20 — Tableau de bord de construction (mise à jour continue)

> Le nom du produit est **EMSP Connect** (décision Ivo, 27 août 2026 — décision 0 de l'INDEX).
> Ce tableau recense TOUTES les pages de l'application, leur spec de référence, leur tranche (doc 18 §4) et leur statut. C'est le tableau que l'on coche au fur et à mesure. Chaque page = un dossier `src/features/<domaine>/pages/`.

---

## 1. Shell public (non authentifié)

| # | Route | Page | Fichier | Spec | Tranche | Statut |
|---|---|---|---|---|---|---|
| P01 | `/` | LandingPage | `features/landing/pages/LandingPage.jsx` | légère (adaptation template Home) | T0 | ⬜ à construire |
| P02 | `/connexion` | LoginPage | `features/auth/pages/LoginPage.jsx` | déjà codée (adapter RG4) | T0 | 🔁 à migrer |
| P03 | `/inscription` | RegisterPage | `features/auth/pages/RegisterPage.jsx` | déjà codée (adapter RG4+casquettes) | T0 | 🔁 à migrer |
| P04 | `/mot-de-passe-oublie` | ForgotPasswordPage | `features/auth/pages/ForgotPasswordPage.jsx` | déjà codée | T0 | 🔁 à migrer |
| P05 | `/reinitialiser-mot-de-passe/:uid/:token` | ResetPasswordPage | `features/auth/pages/ResetPasswordPage.jsx` | déjà codée | T0 | 🔁 à migrer |
| P06 | `/verifier-email/:uid/:token` | VerifyEmailPage | `features/auth/pages/VerifyEmailPage.jsx` | déjà codée | T0 | 🔁 à migrer |
| P07 | `/compte-suspendu` | CompteSuspenduPage | `features/auth/pages/CompteSuspenduPage.jsx` | **doc 16 §4** | T5 | ⬜ à construire |
| P08 | `/health` | HealthCheck | `shared/pages/HealthCheck.jsx` | trivial | T0 | ✅ fait (T0) |

> ⚠️ Note d'état réel (27 août 2026) : les pages marquées 🔁 « déjà codée » existaient dans les sessions précédentes mais **ne sont PAS sur disque aujourd'hui** — le template est vierge. Elles sont donc à RECONSTRUIRE selon les docs. Traitées comme ⬜.
> ✅ État T0 (commit 4fcd12b, tag t0-socle) : toutes les routes de la doc 02 sont posées dans `app/src/app/App.jsx` en PlaceholderPage (chip or « Page à venir » + référence spec). Un statut ne passe ✅ que pour les pages réellement construites.

## 2. Shell protégé — cœur parcours (tous les étudiants)

| # | Route | Page | Fichier | Spec | Tranche | Statut |
|---|---|---|---|---|---|---|
| P09 | `/accueil` | HomePage | `features/accueil/pages/HomePage.jsx` | doc 09 §5 onboarding + widget RDV (06 §6) | T0* | ⬜ à construire |
| P10 | `/profil` | ProfilePage | `features/profil/pages/ProfilePage.jsx` | **doc 11** (+15 intention) | T2* | ⬜ à construire |
| P11 | `/annuaire` | AnnuairePage | `features/annuaire/pages/AnnuairePage.jsx` | **doc 04** | T1 | ✅ fait (T1) |
| P12 | `/annuaire/:parrainId` | FicheAinePage | `features/annuaire/pages/FicheAinePage.jsx` | **doc 04 §5** | T1 | ✅ fait (T1) |
| P13 | `/mes-demandes` | MesDemandesPage | `features/parrainage/pages/MesDemandesPage.jsx` | **doc 05 §4** | T2 | ✅ fait (T2) |
| P14 | `/mon-parrainage` | MonParrainagePage | `features/parrainage/pages/MonParrainagePage.jsx` | **doc 05 §5** (double facette) | T2 | ✅ fait (T2) |
| P15 | `/rendez-vous` | RendezVousPage | `features/rendez-vous/pages/RendezVousPage.jsx` | **doc 06 §4** | T3 | ✅ fait (T3a) |
| P16 | `/rendez-vous/:rdvId` | RendezVousDetailPage | `features/rendez-vous/pages/RendezVousDetailPage.jsx` | **doc 06 §5** | T3 | ✅ fait (T3a) |
| P17 | `/messagerie` | MessagerieListPage | `features/messagerie/pages/MessagerieListPage.jsx` | **doc 08 §4** | T3 | ✅ fait (T3a) |
| P18 | `/messagerie/:conversationId` | ConversationPage | `features/messagerie/pages/ConversationPage.jsx` | **doc 08 §5** (+ groupes doc 13 §5) | T3 | ✅ fait (T3a) |

*T0* : HomePage version minimale (accueil + progression onboarding) livrée dès T0, enrichie en T2/T3.

## 3. Shell protégé — communauté

| # | Route | Page | Fichier | Spec | Tranche | Statut |
|---|---|---|---|---|---|---|
| P19 | `/fil` | FilPage | `features/fil/pages/FilPage.jsx` | **doc 09** (+extension IA-1) | T4 | ⬜ à construire |
| P20 | `/evenements` | EvenementsPage | `features/evenements/pages/EvenementsPage.jsx` | **doc 10 §4** | T4 | ⬜ à construire |
| P21 | `/evenements/:evenementId` | EvenementDetailPage | `features/evenements/pages/EvenementDetailPage.jsx` | **doc 10 §5** | T4 | ⬜ à construire |
| P22 | `/offres` | OffresPage | `features/offres/pages/OffresPage.jsx` | **doc 14 §6** (+IA-6) | T4/T5 | ⬜ à construire |

## 4. Shell protégé — administration (garde admin stricte)

| # | Route | Page | Fichier | Spec | Tranche | Statut |
|---|---|---|---|---|---|---|
| P23 | `/administration` | AdminDashboardPage | `features/admin/pages/AdminDashboardPage.jsx` | **doc 12 §4** (+transition 15) | T5 | ⬜ à construire |
| P24 | `/moderation` | ModerationPage | `features/admin/pages/ModerationPage.jsx` | **doc 12 §5** (+source IA) | T5 | ⬜ à construire |

## 5. Pages 404 / erreurs (transversal)

| # | Route | Page | Fichier | Spec | Tranche | Statut |
|---|---|---|---|---|---|---|
| P25 | `*` | NotFoundPage | `shared/pages/NotFoundPage.jsx` | doc 03 EmptyState style | T0 | ✅ fait (T0) |
| P26 | ErrorBoundary | ShellBoundary + FeatureBoundary | `shared/components/ErrorBoundary.jsx` | **doc 19 §4.2** | T0 | ✅ fait (T0) |

---

## 6. Composants shared à livrer au fil des tranches (contrat doc 03 §6)

| Composant | Tranche | Statut |
|---|---|---|
| Button, Card, Input/FormField, Avatar, Chip, Skeleton, EmptyState, Divider | **T0** (socle minimal) | ✅ (commit 4fcd12b) |
| Modal/ConfirmDialog (MUI habillé), Pagination, Select (natif habillé), Toast (sonner) | T0/T1 | ✅ (T1) |
| Tabs, Tooltip | T1/T2 | ⬜ |
| Table, Progress | T1/T2 | ⬜ |
| ScoreFiabilite (mode `fond="fonce"` pour headers verts), JaugeCapacite (pulse RG3) | T1/T2 (docs 04/07) | ✅ (T1) |
| BadgeVitrine, BandeauBadges (docs 04/07) | T1/T2 | ⬜ |
| AvatarStack, StatutChip, ChipIA, PanneauSuggestionsIA, ToggleConsentementIA | T2/T4/T6 | ⬜ |
| BanniereRappelProchainRDV (widget global) | T3 | ⬜ |

## 7. Règles de lecture du tableau

- **⬜ à construire · 🔁 à migrer · 🔨 en cours · ✅ fait (commit + démo validée) · 🚫 annulé**
- Une page passe ✅ SEULEMENT après : checklist doc 03 §11 + tests doc 19 + capture 375px/1280px + commit sur la branche de tranche.
- Les fichiers vivent dans `src/features/<domaine>/pages/` — la carte des routes est la doc 02 §4 (source unique, ne jamais dupliquer ici).
- La colonne Tranche renvoie à la roadmap doc 18 §4 : on construit PAR TRANCHE, pas par page isolée.

---

## 8. Dette issue de la revue indépendante T0 (27 août 2026 — verdict : passed, 0 souci sécurité/logique)

- [ ] Tests unitaires de l'intercepteur 401 (refresh dédupliqué + replay unique) — obligatoire avant la vraie auth (T2, doc 19).
- [ ] Garde de rôle `isAdmin` sur `/administration` et `/moderation` dans ProtectedShell — à ajouter quand les vraies pages admin arrivent (T5).
- [ ] `authApi.session` : distinguer erreur réseau de « invité » (aujourd'hui toute erreur → null).
- [ ] Décider du sort de `app/src/_template_pages/` avant mise en production (référence de dev uniquement, exclue du lint).

---

## 9. Bilan T1 annuaire (27 août 2026 — branche feat/t1-annuaire)

Livrables : AnnuairePage (bandeau suggestions même filière, filtres URL-sync q/filiere/classe/complets avec debounce 400 ms, grille cartes, pagination serveur) + FicheAinePage (header vert profond, 4 blocs vitrine, encart CTA avec règles RG1/RG3 + modale demande) + api/hooks/rules + mocks MSW complets (10 profils, cas limites : L1 exclu, alumni promo 2023, vitrine incomplète, complet 5/5). 23 tests Vitest, lint 0, build vert, overflow horizontal éliminé (mesuré playwright-core : 375/768/1280 → OK), captures validées.

Leçons consignées (à réutiliser T2+) :
- **Tailwind v4 JIT** : toute classe `grid-cols-N` DOIT apparaître en dur dans le source (compléter par `grid-cols-1` statique) — les groupes dynamiques ne sont pas scannés.
- **Anti-overflow grille** : chaîne complète `li flex min-w-0` → `motion.div min-w-0` → carte → `line-clamp` + `break-words` (le `-webkit-box` de line-clamp impose un min-content large sinon).
- **Dark mode** : interdiction de `bg-white` en dur dans les composants → token `--bg-input` (défini clair ET sombre dans globals.css). Chips `neutral` sur `--bg-panel-alt` (adaptatif), jamais un crème fixe.
- **Env mocks** : `VITE_ENABLE_MOCKS=1` dans `.env.local` (jamais committé) — sans lui, MSW ne démarre pas et les appels API retombent silencieusement sur le fallback SPA (page vide sans erreur). Toute page « mystérieusement vide » en dev : vérifier MSW d'abord.

### 9.1 Retouche UX « barre designer senior » (même jour — critique Ivo : « aucune ergonomie, aucun dynamisme »)

Corrections apportées (revue vision + re-mesure overflow OK) :
- **Header hero** : panneau vert profond OPAQUE + `kente-pattern` en fond + KPI compteur or (chiffre `text-4xl font-black` + libellé) — le header n'est plus une barre blanche fade.
- **Cartes** : liseré or (`Card accent`), padding intérieur, citation en `flex-1` avec filet or (plus de creux entre tags et footer), hover-lift `whileHover={{ y: -6 }}`.
- **Fiche** : encart CTA signature (header or + corps vert profond) + encart « Comment ça marche » (4 étapes numérotées) → la colonne droite n'est jamais vide.
- **Suggestions** : carrousel horizontal remplacé par grille 3 colonnes (`sm:grid-cols-2 lg:grid-cols-3`) — plafond 3 suggestions (doc 04) = pleine largeur garantie, zéro bleed, zéro overflow (le bleed `-mx` du carrousel créait un débordement 1294/1280).
- **Tests** : `whileInView` (framer-motion) exige `IntersectionObserver`, absent de jsdom → polyfill minimal dans `src/shared/test/setup.js`, sinon crash de toute la suite.

Rappel barre Ivo : statique = bug. Toute nouvelle page DOIT montrer : fond animé + panneaux opaques tranchants + stagger d'entrée + hover + contenu dense.

### 9.2 Passe de-slop « ne doit pas paraître IA » (même jour)

Audit contre les 10 signes du slop, corrections appliquées :
- **Casse naturelle partout** : suppression du `uppercase tracking-wide` CSS sur Chip (les mocks sont en casse naturelle « Patiente »), titres d'encarts, eyebrow du hero (remplacé par `text-sm font-semibold` or), badge alumni.
- **Déco retirée** : filet or à gauche de la citation (liseré = fausse hiérarchie), `animate-pulse` infini de la JaugeCapacite (dernière place signalée par la couleur seule), `font-black` → `font-bold` (pas de stats géantes), double `whileHover` carte (une seule animation, sur Card : ombre au hover, plus de lévitation).
- **NavBar** : `backdrop-blur-sm` + fond 85% → fond plein `#143524` (translucide interdit, doc 19).
- **Redondance** : « Mise en avant automatique » apparaissait 2× (span header + légende) → gardé en légende seule.

**Bug trouvé et corrigé au passage** (mesuré playwright, chevauchement réel) : dans une cellule de grille, un `h-full` sur le lien de la carte consomme TOUTE la hauteur de la ligne et pousse le contenu sibling (chip IA) HORS de la cellule, par-dessus l'élément suivant. Fix : item = `flex flex-col min-w-0`, carte enveloppée dans `<div className="min-h-0 flex-1">`. Règle T2+ : jamais de `h-full` nu dans une cellule qui contient un sibling sous la carte.

Leçons consignées aussi dans le skill emsp-connect-project.

### 9.3 Passe « qualité iPhone » (polish/artisanat — plan annoncé par l'agent, validé Ivo)

Fondations créées puis déployées sur /annuaire + fiche Aîné. Palette et kente intacts.

**Fondations (globals.css, index.html)**
- Ombres two-layer complétées : `--shadow-card-hover` (la lumière s'éloigne au survol, jamais de lift) + `--shadow-pressed` (enfoncement : ombre interne venant DU HAUT — un objet descend sous le doigt, il ne s'illumine pas).
- Typographie : Inter (UI précise) en `--font-sans` + `-0.011em` sur body ; Bricolage Grotesque réservé aux titres via `--font-display` + `font-display`. Inter ajouté à la requête Google Fonts.
- Détails d'artisanat : sélection or (`::selection`), scrollbar fine, `prefers-reduced-motion` (fond statique, transitions coupées).

**Ressorts physiques (variants.js, ScrollReveal, Button, Switch)**
- `ressortStandard` (spring 260/30/0.9) pour toutes les apparitions ; `hoverLift`/`pulseGentle` supprimés (source unique assainie).
- Bouton : `whileTap scale 0.97` + ombre interne au clic + spinner lucide ; support `to` (lien router stylé bouton, `motion.create`).
- Nouveau composant `Switch.jsx` : interrupteur iOS (track 40×24, pouce à ressort 550/32) — remplace la checkbox RG3.

**Désempilement de boîtes + revue vision (2 tours de correction)**
- Barre filtres SANS panneau (les contrôles vivent sur la page), pagination sans boîte, bandeau suggestions éditorial (titre + trait, plus de 3e cartouche), panneau signature de la fiche SANS card-emboîtée (bandeau or + corps direct).
- Jauge RG2 : segments resserrés (2×14), compteur tabular-nums, `title` explicatif, mode `surFonce` (segments verts vifs sur fond vert profond — l'ancienne version était invisible sur le panneau signature).
- Contrastes corrigés (les textes sombres posés sur le fond vert étaient illisibles) : bandeau suggestions en crème, filtres (`Réinitialiser` en variant `ghost-fonce`, label RG3 crème), retour de fiche. Chips `rounded-full` (iOS), chip alumni unifié (text-xs, non tronqué). Noms JAMAIS tronqués (badges passés sur la ligne méta, marqués `Suggéré`).
- Format de note toujours une décimale (4,0) ; mock « Calm »→« Calme » ; placeholder raccourci (plus de troncature) ; avatars cerclés d'un anneau rond (`rounded-full` sur le conteneur).
- raisonIA rentrée DANS la carte (pieds de cartes alignés dans la grille).

**Méthode** : captures déterministes (`scripts/shoot-iphone.mjs`, `document.fonts.ready`) revues par vision ; tout défaut constaté a été corrigé puis re-capturé. 23/23 tests (assertion « Suggérés pour toi »→« Suggestions pour toi » suivie), lint 0, build vert, overflow 0 (375/768/1280).

### 9.4 Tranche T2 « Parrainage » (doc 05) — pages P13/P14 réelles

Deux pages du domaine parrainage remplacent les placeholders : **/mes-demandes** (P13, doc 05 §4) et **/mon-parrainage** (P14, doc 05 §5). Feature `src/features/parrainage/` : `api.js`, `rules.js`, hooks, 8 composants, 2 pages, tests.

**Contrat données étendu (mocks MSW)** — GET /api/me/parrainage/ renvoie la double facette (`monAine`, `cadetsActifs`, `historiqueEnvoyes`, `historiqueRecus` en plus du trio T1) ; GET /api/demandes/?sens=envoyees|recues ; POST /api/demandes/:id/repondre/ (acceptee|refusee) ; PATCH /api/demandes/:id/annuler/ ; GET /api/me/groups-resume/ ; GET /api/me/rendez-vous/ ; POST /api/parrainages/:id/cloture/ ; POST /api/parrainages/:id/avis/. État démo : Ivo porte les DEUX casquettes (session L2 avec `candidatureAineOuverte: true`), 2 cadets actifs, 2 demandes reçues, 1 binôme clos sans avis (flux RG6 démontrable). L'état parrainage mock reste « cadet libre » au départ — les 23 tests T1 (suggestions si libre) ne bougent pas ; le binôme s'obtient via le flux réel POST.

**Règles rendues visibles (doc 05 §6)** — RG2 (5/5, accepter désactivé + chip « Complet — libère une place », `peutAccepter`), RG6 (binôme clos → CTA « Donner mon avis », modale note 1–5 étoiles or + commentaire 20–600, un seul avis par binôme — serveur 409), RG7 (L1 jamais aîné), RG8 (onglet Reçues + bloc Mes cadets seulement si candidature ouverte). Invalidation croisée : toute mutation → `["mon-parrainage"]`, `["demandes"]`, `["groups-resume"]`, `["parrains"]`, `["suggestions"]`.

**Piège de facette (leçon majeure)** — les titres de section posés SUR LE FOND VERT doivent être crème ≥/90, pas `text-primary` (encre crème-cartes) : premier tour vision = « vert sur vert ≈ 1,5:1 » sur « Mes cadets »/« Familles & cercles »/« Historique ». Même piège : EmptyState n'est PAS un panneau (fond transparent) → toujours l'envelopper dans une Card sur fond vert. Jauge en `surFonce` sur fond vert. 3 tours vision, conforme final.

**Divers** — `AuthProvider` accepte `initialUser` (injection de tests, prioritaire sur VITE_DEMO_SESSION) ; script `scripts/shoot-t2.mjs` (4 captures incl. onglet Reçues cliqué) ; formatteur fr `utils/dates.js` (Intl, pas de date-fns). 29/29 tests, lint 0, build vert, overflow 0 (375/768/1280).

### 9.5 Tranche T3a « Communication » (docs 08+06) — front sur mocks MSW

Messagerie (P17/P18, doc 08) et Rendez-vous (P15/P16, doc 06) réelles — le backend Django/Channels arrive en T3b, le front bascule via `VITE_WS_URL`. Features `src/features/messagerie/` et `src/features/rendez-vous/` (api, schemas zod, rules, hooks, composants, pages) ; mocks partagés `store-t3.js` (source unique) + `handlers-t3.js` + `utilisateurs.js` ; simulateur WS (join/message.new/message.lu/typing/presence, reconnexion expo 1s→30s).

**Contrat exact (doc 08 §2 / doc 06)** — messages : pagination curseur descendante (plus récents d'abord, taille 8), POST idempotent (clé déjà vue → même message, zéro doublon), PATCH `/lu/` ; RDV : machine propose→confirme/refuse/contre_propose→(organisateur tranche)→annule/passe ; GET `/prochain/` alimente la bannière J-1 (confirmé < 48h ET rappel non vu ; X masque, n'annule PAS le RDV) auto-portée par ProtectedShell. Contre-proposition acceptée = organisateur applique dateHeure/lieu. Invalidation croisée `["conversations"]`/`["messages"]`/`["rdv"]`/`["prochain-rdv"]`/`["mon-parrainage"]`.

**RG visibles** — messagerie sans binôme → EmptyState (enveloppé Card, CTA annuaire) ; messages 1..2000 chars (compteur live) ; RDV dateHeure > now+5 min, lieu requis si présentiel ; seul l'invité répond à une `propose`, seul l'organisateur tranche une `contre_propose` (`peutRepondre(rdv, user)` — pas de hook dans une règle). Badge non-lus : sidebar desktop ET bottom-nav mobile (`useTotalNonLus`, cap 99+).

**Pièges T3 (leçons coûteuses)** —
- Handlers MSW : route littérale (`/prochain/`) AVANT route `:param` (`/:id/`) — premier match gagne, sinon 404 silencieux.
- Cache TanStack « plus récents d'abord » : le fil doit être inversé AU RENDU ; les appends optimistes sont des prepend ; `marquerLu` vise `results[0]` (avec `at(-1)` on marquait lu le plus ANCIEN).
- Token CSS `--emsp-green` n'existait pas (seuls `green-deep/mid/bright/luminous`) → 3 fonds invisibles d'un coup (bulles « moi », avatar famille, toggle mode RDV). Un token mort = plusieurs symptômes : grep `var(--emsp-*)` contre globals.css AVANT la passe vision.
- Chip `success` (texte `accent-green` #0f5132) illisible sur en-tête vert profond → pilule or/encre sur fond vert.
- Split-view : `Outlet` dans un conteneur `lg:block` → la Card grandit sans borne et le composer passe sous le pli → `lg:flex lg:flex-col`.
- Donnée démo datée en dur (RDV « 2026-08-27 ») → la bannière J-1 meurt le lendemain : `dateHeure` calculée « demain 14h » au chargement des mocks.

**Chaîne qualité** — 40/40 tests (messagerie 3 : garde §1, idempotence, badge lu ; RDV 8 : matrice `peutRepondre` + zod date passée ; T1/T2 intacts), lint 0, build vert, overflow 0 (375/768/1280), captures `scripts/shoot-t3.mjs` revues vision : 8 bugs réels trouvés, corrigés, re-capturés (dont le token mort et l'ordre du fil).

### 9.6 Tranche T3b « Backend Django » (doc 21) — la bascule réelle

Backend `backend/` fondé ex nihilo : Django 5 + DRF + Channels (uv, Python 3.13, SQLite dev), apps `comptes`/`messagerie`/`rendezvous`. **Le contrat REST/WS est verbatim des mocks T3a** — le front n'a pas changé une ligne de features pour la bascule. 21 tests pytest (18 REST + 3 WS dont un E2E Channels Communicator), ruff 0. Rituel : commit → merge → tag `t3b-backend`.

**Architecture** — JWT : access en réponse, **refresh en cookie httpOnly** (rotation + blacklist) ; **le consumer WS authentifie via le cookie** (`Path=/`) quand le front ne peut pas poser de token en query — le front n'écrit rien en sessionStorage (doc 19 §5.1 respecté à la lettre). Le `message.new` est publié par le viewset REST (source de vérité) via `channel_layer`, le consumer redistribue et **réécrit `envoyeParMoi` par destinataire**. `GET /api/auth/session/` {estAuthentifie, utilisateur} = contrat T0 pour AuthProvider ; `/prochain/` déclaré avant `/:id` ; 423 suspension levée par la permission (pas un middleware — l'auth DRF tourne dans la vue).

**Bascule front (doc 21 §9)** — proxy Vite `/api` + `/ws` → :8000 ; `VITE_WS_URL=` (défini mais vide = same-origin) — la porte du transport est `VITE_WS_URL === undefined` (pas falsy), sinon le simulateur resterait actif ; auto-connexion dev `VITE_DEMO_EMAIL/PASSWORD` dans AuthProvider quand mocks OFF ; access token **en mémoire** via `definirJeton` + interceptor request (jamais localStorage). **E2E prouvé** (`scripts/t3b-e2e.mjs`) : messagerie rendue depuis Django via proxy, message POSTé par Awa apparait en direct chez Ivo (WS `HANDSHAKING → CONNECT` dans le log serveur), bannière J-1 « dans 27 h » vivante, revue vision conforme. 40/40 front, build ✓, overflow 0.

**Pièges T3b (leçons)** —
- Custom `User` email = USERNAME_FIELD ⇒ **manager custom obligatoire** (`create_user` sans username, `username` aligné sur l'email sinon collision sur `""` unique).
- `auto_now_add` écrase toute date passée au constructeur : les seeds réécrivent `date_envoi` via `.update()` après save.
- Q-OR simple (`Q(a,c) | Q(c,a)`) : **« internal query planner error » SQLite** → deux requêtes simples.
- Permission par défaut globale (EstActif) bloque la connexion : `AllowAny` explicite sur /api/auth/*.
- Channels×pytest-django : fixtures invisibles du thread consumer → `@pytest.mark.django_db(transaction=True)` ; `RefreshToken.for_user()` persiste un OutstandingToken → **générer les jetons hors de la boucle async**.
- Consumer ASYNC : toute ORM via `database_sync_to_async`, sinon SynchronousOnlyOperation.
- Seed : conversation = date du DERNIER MESSAGE (Max messages__date_envoi), jamais le pk (les seeds réécrivent l'historique).


