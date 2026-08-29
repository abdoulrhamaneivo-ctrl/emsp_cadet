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

### 9.7 Tranche T3c « Connexion » (P02 — doc 02 §5)

Page réelle sur la route placeholder : feature `src/features/authentification/` (schemaConnexion zod RG4 `@emsp.int`, ConnexionPage split panel vert kente / formulaire crème, comptes de démo cliquables, toggle œil). `authApi.connexion` pose l'access **en mémoire** puis `session()` résout l'utilisateur ; garde inversée dans PublicShell (authentifié → `state.from` | `/messagerie`, zéro boucle) ; AuthProvider : `initialUser !== undefined` (un test peut figer l'invité avec `null`) ; mocks MSW alignés au contrat réel (`{email, password}` → `{access, utilisateur}`, 401 francisé). Backend : `JetonConnexionSerializer` (`no_active_account` en français).

**Pièges T3c (leçons)** —
- `TOKEN_OBTAIN_SERIALIZER` ne s'applique qu'aux vues **génériques** DRF — une vue custom doit importer le serializer francisé directement (test 401 rouge sinon).
- **Zod v4 rapporte TOUTES les issues** : prendre la PREMIÈRE par champ (sinon le refine « utilise ton adresse @emsp.int » écrase « requis » sur un champ vide).
- `kente-pattern` porte `opacity` + `mask-image` : TOUJOURS une couche `absolute inset-0` dédiée — posé sur la section, il masque aussi le texte (recette annuaire T1).
- Les `VITE_*` sont figés au **démarrage** de Vite : toute modif d'env exige un redémarrage du dev server (une instance d'un jour = page « mystère » en invité).
- Captures : attendre la fin du fade-out du drawer (~500 ms) sinon un voile sombre couvre la capture (course d'animation, pas un bug d'app — vérifié dans le DOM : backdrop `opacity-0` au repos).
- Drawer mobile : burger « Plus » dans la bottom-nav ; attendre un texte de CONTENU, jamais un libellé de nav (leçon T3a réappliquée).

**Chaîne qualité** — 46/46 tests (6 nouveaux : RG4 domaine, champs requis, 401 serveur affiché, succès → redirect, `state.from`, remplissage démo), lint 0, build vert, overflow 0 (375/768/1280), 6 captures (`shoot-connexion.mjs`) revues vision en 2 passes (retouches : kente en couche dédiée, contraste de la ligne interne, affordance des comptes démo).

### 9.8 Tranche T3d « Temps réel » (doc 08 §2/§5 sur backend réel) — consumer WS, typing, presence, ✓✓ lu

Boucle temps réel complète côté front (`useWebSocketChat` reconnexion expo 1s→30s + `etatConnexion`, `useTyping` throttle 2 s / fin 2,5 s, `IndicateurTyping`, presence entête, `BulleMessage` CheckCheck or piloté par `message.lu {parUserId, jusquaMessageId}` non régressif, `BanniereConnexion`, file d'envois rejouée à la reconnexion avec les MÊMES idempotencyKeys, toast cliquable cross-conv) + scènes E2E sur le **backend Django réel, zéro MSW** : `app/scripts/t3d-temps-reel.mjs` (deux acteurs — Awa par REST direct `Bearer`, Ivo par vrai navigateur chromium `--no-sandbox`) et `app/scripts/t3d-lu-accuse.mjs` (Ivo ENVOIE par la vraie UI → Awa PATCH `/lu/` → `[aria-label="Lu"]` attendu en direct).

**Pièges T3d (leçons)** —
- **Le « ✓ lu » exige une bulle PROPRE** : première capture de validation lancée sur un fil où Ivo n'avait aucun message sortant → rien à marquer, verdict vision « pas de ✓✓ » faussement alarmant. Toujours faire ENVOYER un message par l'UI avant d'assertion un accusé de lecture.
- **`--danger` utilisé avant d'exister** (bannière + bulle échec invisibles) : le grep `var(--emsp-*)` contre globals.css doit couvrir TOUT token sémantique soupçonné, pas seulement la famille emsp. Désormais deux tokens : `--danger` (encre mode-aware : texte/bordure) + `--danger-solid` (fond fixe plein rouge `#b3261e` texte blanc, lisible light ET dark — un `--danger` clair en dark mode sous du texte blanc = illisible).
- **Le WS réel lisait `sessionStorage("jwt")`** — clé jamais écrite (jeton mort, `token=` vide) ET interdite par doc 19. Correctif : `obtenirJeton()` exposé par `shared/api/client.js`, mémoire seule ; les seuls `localStorage` tolérés restent le thème et rien d'autre.
- **Composants déstructurés en props** (`{ icone: Icone }`) : ESLint core ne voit pas l'usage JSX sans plugin react → `argsIgnorePattern: '^[A-Z]'` (même famille que le cas `^motion$` déjà documenté). Diagnostiquer « defined but never used » sur un composant AVANT de croire à un bug de rendu.
- Artefacts E2E en base de dev : les scripts créent de vrais messages → **DELETE ciblé par pk** (et `Lecture` pointant dessus) après la passe, jamais de `flush` ni de recréation de seed. Un « message vide 19:58 » du rapport vision ne laissait AUCUNE trace en base : chercher du côté du scroll/du rendu avant d'incriminer les données.
- Emoji « 📍 » signalé en vision devant « Salle B12 » : **faux positif** — c'est l'icône lucide `MapPin` (SVG) OCR-isée par le modèle vision ; zéro emoji dans le code (vérifié grep).

**Chaîne qualité** — vitest 46/46, lint 0, build vert, pytest 22/22 + ruff 0, overflow 0 (375/768/1280), E2E temps réel et accusé de lecture verts sur backend réel, capture `/tmp/t3d-lu-accuse.png` revue vision avec zoom ×2 (double coche or confirmée sur bulles couvertes par `jusquaMessageId`).

### 9.9 Tranche T4a « Fil d'actualité » (doc 09) — première tranche 100% backend réel

Le Fil (feed + réactions fermées + commentaires à un niveau + signalements) est codé DIRECTEMENT sur Django/DRF — plus de phase MSW-first : les mocks ne servent qu'aux tests Vitest par test (`server.use`), comme T3a les utilisait au runtime. Backend app `fil/` (Publication/Reaction/Commentaire/Signalement), règles serveur : 1 question/jour (409), édition/suppression seulement à 0 commentaire (409), réactions toggle par contrainte unique, réponses APLATIES niveau 1 (parent remonté à la racine, mention `@Prénom` dans le texte), signalement → `masquee=True` (l'auteur voit toujours sa publication, panneau modération ; les autres ne la voient plus).

**Pièges T4a (leçons)** —
- **Idempotent = replay 201** (pas 200) : précédent messagerie doc 21 — le front ne distingue pas création et replay, même code HTTP 201. Testé rouge puis corrigé.
- **`questions-restantes/` AVANT `<int:pk>/`** : piège T3a réappliqué — une route littérale déclarée après la route paramétrée n'est JAMAIS atteinte.
- **auto_now_add, encore lui** (leçon T3b §9.6) : le seed fil affichait tout le feed « il y a 12 minutes » → dates réécrites via `.update()` (il y a 3 h / hier / à l'instant) pour un feed vivant. Toute donnée seedée datée DOIT être réécrite après insert.
- **Pyright et les nouvelles apps Django** : le LSP râle « Cannot access attribute objects » sur toute app fraîchement créée (il ne voit pas le manager dynamique) — du bruit PUR. La porte qualité du backend reste `ruff check .` + `pytest`.
- **Captures vision : deux faux défauts d'animation** (réappliqués et généralisés) : zone commentaires capturée PENDANT l'expansion height 0→auto = « troncature » inventée → attendre 600 ms après le clic ; page mobile capturée pendant le chargement = « cartes vides/squelettes majeur » → attendre un texte de CONTENU réel, jamais le titre seul.
- **Ligne méta mobile : l'ordre de troncature est une décision produit** — avatar | nom+chip | méta | menu : la date relative DOIT être en tête de méta (info critique jamais tronquée), la filière en fin de ligne (troncature acceptable, vérifié vision en 2 passes). Un `truncate` unique sur « filière · date » avalait l'unité de temps (« il y a 15 … »).
- **Infinite query feed** : `useInfiniteQuery` + `getNextPageParam` sur count cumulé ; stagger framer-motion plafonné aux 20 premiers items (doc 09 §6, perf scroll long) — au-delà, fade simple sans transform.

**Chaîne qualité** — backend : pytest 40/40 (18 nouveaux fil), ruff 0, migration 0001, seed idempotent étendu (3 publications, réactions, commentaires datés). Front : vitest 51/51 (5 nouveaux), lint 0, build vert, overflow 3/3. E2E `t4a-fil-e2e.mjs` sur backend réel (publier par la vraie UI → apparaît dans le feed → commenter). 3 captures (`shoot-t4a.mjs`) revues vision — 1 vrai bug mobile corrigé (noms tronqués), 2 faux positifs d'animation documentés.

### 9.10 Tranche T4b « Événements » (doc 10) — discussion réutilisant le fil, inscription toggle

Événements complets : création aîné|admin (garde `_est_aine` sur le préfixe de `classe`, insensible à la casse), inscription TOGGLE (201 ajout / 200 retrait), capacité stricte 409, désinscription bloquée H-2h (422), organisateur jamais désistable, discussion = `fil.Commentaire` rattaché à une « publication PORTEUSE » cachée (`evenement_discussion__isnull=True` exclue du feed — UN seul modèle de commentaire plateforme), annonce automatique sur le Fil à l'annulation, participants toujours visibles.

**Pièges T4b (leçons)** —
- **Related manager ≠ queryset nu** : `evenement.inscriptions.all().create(...)` perd le lien FK → `NOT NULL constraint failed: evenement_id` ; c'est `evenement.inscriptions.create(...)` (related manager DIRECT) qui le porte. Testé rouge puis corrigé — le test unitaire a attrapé ce que le sanity curl n'aurait jamais vu.
- **Comparaison de niveaux : minuscules aux DEUX bouts** — `_est_aine` comparait `"l3 réseaux"` (classe en base) à un tuple `("L2","L3",…)` en MAJUSCULES : TOUJOURS False → un vrai aîné L3 du seed était refusé. Baisser les deux côtés.
- **Un client API PAR acteur** : réutiliser la même instance `APIClient` avec plusieurs `force_authenticate` = le dernier écrase les autres → le « toggle d'Ivo » testait en réalité Awa (message d'erreur du print DEBUG : « L'organisateur ne peut pas quitter »). Séquence d'isolation pour trancher un échec de test.
- **Règle produit fixée par le test** : après désistement, la place LIBRE peut être reprise (réinscription 201) — le 409 protège uniquement la course au DERNIER place (événement plein + jamais inscrit), pas une réinscription ordinaire. Mon premier test affirmait l'inverse : c'est le produit qui a gagné, pas le test.
- **Jauge N segments : jamais à côté d'un titre** — 12 segments posés sur la ligne « Ta participation » débordaient de la carte sticky ET repliaient le titre. La jauge vit sur SA propre ligne (vision ×2).
- **Chaîne min-w-0 (leçon T1) réappliquée à la carte événement** : `motion.div > Link > Card > colonne` — sans elle, la jauge pousse la carte au-delà du viewport mobile (titre coupé NET sans ellipsis, compteur 2/12 hors écran). Vision valide : ellipsis propre + jauge entière.
- **Identifiants JAMAIS dans une commande shell** (curl avec mot de passe en clair = blocage de la couche sécurité) — la vérification API passe par les scripts E2E, qui s'auto-connectent via l'app.
- Capture mobile Événements : le lien de nav vit dans le drawer fermé → attendre un texte de CONTENU (leçon §9.7 réappliquée), sinon timeout 20 s sur un élément `hidden`.

**Chaîne qualité** — backend : pytest 55/55 (15 nouveaux evenements), ruff 0, migration 0001, seed +2 événements. Front : vitest 56/56 (5 nouveaux), lint 0, build vert, overflow 3/3. E2E `t4b-evenements-e2e.mjs` (liste → fiche → message en discussion → désister → se réinscrire). Captures `shoot-t4b.mjs` revues vision — 2 vrais bugs corrigés (jauge débordante desktop, carte mobile hors viewport).

### 9.11 Tranche T5 « Profil » (doc 11) — le grand interrupteur RG8

Profil complet : User v2 (`niveau_etude` devient un champ RÉEL avec choix L1…M2/alumni — la convention « préfixe de classe » reste en repli de compatibilité), PATCH /api/me/ (champs autorisés seulement, email immuable RG4, roles JAMAIS exposés RG5), candidature RG8 (toggle → 422 en L1 via validate(), modales de conséquences activation/désactivation, promotion L1→L2 → `promotionDisponible` pour le toast-action — JAMAIS d'auto-ouverture), visibilité annuaire = checklist 1:1 des motifs API, photo multipart ≤5Mo (crop côté client), suppression self-serve par prénom (désactivation + anonymisation email, JAMAIS un delete physique).

**Pièges T5 (leçons)** —
- **Serializer DRF : champ camelCase dans `fields` = déclaration OBLIGATOIRE** — `niveauEtude`/`candidatureAineOuverte` non déclarés levèrent `ImproperlyConfigured` au runtime (masqué tant qu'aucune vue ne sérialisait le User v2). Chaque nom camel ajouté à `fields` exige son `SerializerMethodField()`/`BooleanField(source=…)`.
- **validate() DRF reçoit les clés INTERNES (snake_case)** — un validateur RG7 sur `candidature_aine_ouverte` ne courait jamais car la clé arrivait via `initial_data` camelCase non mappée ; la garde vit désormais dans `validate()` avec lecture de `initial_data.candidatureAineOuverte` en secours. (Même famille que la leçon t4b.)
- **Contrat 422 : DRF 400 traduit explicitement** — les erreurs de serializer (RG7, vitrine) sortent en 400 DRF par défaut ; `MoiView` les enveloppe en `ErreurValidation` (422) pour tenir le contrat doc 21. Le front affiche `detail` tel quel.
- **seed et get_or_create : les champs v2 des comptes PRÉEXISTANTS ne sont pas touchés** — la migration posait `niveau_etude=L1` par défaut sur Ivo/Awa déjà en base → le switch RG8 apparaissait DISABLED chez un L2. Le seed re-force désormais `niveau_etude` à chaque run (comme les mots de passe). Symptôme : E2E bloqué sur « element is not enabled ».
- **Débordement mobile : la vision trompe, la mesure tranche** — la capture suggérait un débordement du FORMULAIRE académique ; la sonde playwright (`scrollWidth` + culprits taggés) a pointé les inputs Prénom/Nom de la section IDENTité sans `w-full` (min-width:auto en grid). Mesure avant/après : 389 → 375.
- **Panneau translucide sur fond vert (règle §9.4 réappliquée)** — `bg-[var(--emsp-gold)]/10` rendait le texte muted presque illisible ; remplacé par `--emsp-cream-alt` opaque + bordure or pleine.

**Chaîne qualité** — backend : pytest 69/69 (14 nouveaux profil), ruff 0, migration 0003. Front : vitest 62/62 (6 nouveaux), lint 0, build vert, overflow 3/3 (sonde 375px = 375 exact). E2E `t5-profil-e2e.mjs` (pipeline, save dirty, bascule RG8 ON→OFF, toast). Captures `shoot-t5.mjs` revues vision — 1 panneau translucide corrigé, 1 débordement mobile corrigé par mesure.

### 9.12 Tranche T5b « Parrainage réel + Transition annuelle » (docs 05/15 + règles Ivo)

**DEUX RÈGLES PRODUIT DURES (Ivo, verbatim 29/08)** —
1. « en fin d'année on ne perd pas ses aînés et filleuls » → la transition annuelle monte les niveaux mais ne touche JAMAIS comptes.Binome (testé : binôme actif avant/après transition, `binomesConserves` renvoyé).
2. « on peut avoir un aîné que de la promo qui nous devance » → l'aîné doit être du niveau IMMÉDIATEMENT SUPÉRIEUR (L1→L2, L2→L3, L3→M1, M1→M2 ; M2/alumni : personne). Implémentée en miroir backend `parrainage/rules.py` (DEVANCANT dict) / front `parrainage/rules.js` — le serveur revalide TOUJOURS en 422 avec message francisé (« Tu ne peux demander qu'un Aîné de la promo X »).

**Backend** — app `parrainage/` (Demande + Avis, binôme reste comptes.Binome) : 7 endpoints contrat front verbatim (me/parrainage, parrains/:id/demande, demandes + repondre/annuler, parrainages/:id/cloture|avis). Annuaire V2 `comptes/annuaire_views.py` : /api/parrains/ alimenté par les comptes RÉELS (candidature ouverte + vitrine complète + RG7), suggestions triées promo-devançante d'abord (raisonIA libellé humain), /api/me/groups-resume + /api/me/rendez-vous. Transition : `intention_annee_suivante` (master|alumni|inconnu, M2 ne peut PAS déclarer master → 422), GET aperçu (promotions/finsDeCycle/anomalies), POST exécuter ATOMIQUE (select_for_update, une seule transaction, rien à moitié fait), stats admin.

**Front** — garde CTA `mauvaise_promo` dans canRequest (FicheAinePage affiche le blocage avec la raison), SectionIntention profil (radios master/alumni/inconnu, visible L3/M2 seulement), /administration réelle (KPI stats + ModaleTransition 3 étapes : récapitulatif compteur, table ajustements par ligne, confirmation forte « TRANSITION <année> »), UtilisateurLegereSerializer expose isAdmin (garde route).

**Pièges T5b** —
- **Fixtures tests : emails uniques par fixture** — `promotions` collidait avec `users` globale (ids non déterministes → 404 « No User matches ») ; suffixe `.test` sur tous les emails de fixture.
- **La vue de demande exige candidature_aine_ouverte=True** (porte RG8) — 404 « n'est pas visible » pour un aîné fermé ; les fixtures ouvrent la candidature des L2+.
- **Ordre produit : règle promo (422) AVANT RG1 (409)** — message plus parlant ; assumé et testé.
- **Session JWT au rechargement — RÉSOLU en fin de T5b** : l'access en mémoire meurt au reload mais le refresh httpOnly cookie (Path=/, Lax) survit ; AuthProvider tente désormais un REFRESH SILENCIEUX avant `session()` au boot — s'il réussit, la session part avec un jeton frais ; sinon invité propre. Validé Playwright sur les DEUX chemins : login réel (refresh 401 obsolète → 200 frais → Awa restaurée) et chemin démo. PIÈGE : le mode `VITE_DEMO_SESSION=1` court-circuite tout le cycle (re-POST des identifiants démo à chaque boot, cookies visiblement vides juste après login) — tester le cycle réel en neutralisant .env.local, puis le restaurer. Deux 401 parasites au boot = rotation du refresh + double-monte StrictMode, sans conséquence (le 200 suit).
- **E501 : les compréhensions longues se coupent** — style project 100 chars.

**Chaîne qualité** — backend : pytest 80/80 (11 nouveaux parrainage+transition), ruff 0, migrations 0001 parrainage + 0004 comptes. Front : vitest 65/65 (3 nouveaux règles promo), lint 0, build vert. E2E `t5b-parrainage-transition-e2e.mjs` : annuaire réel, garde admin, transition API 200 (4 modifiées, binômes conservés ≥1 — RÈGLE n°1 vérifiée). Captures shoot-t5b.mjs (annuaire, blocage promo fiche, admin).

### 9.13 Tranche T6 « IA responsable » (doc 17)

**RÈGLES RG12 adoptées (verbatim doc 17 §1)** —
1. L'IA propose, l'humain dispose : AUCUNE décision automatique (ni masquage, ni sanction, ni refus) sans action humaine.
2. Ligne rouge vie privée : conversations privées binôme/groupes JAMAIS analysées — méta-données uniquement.
3. Transparence totale : TOUTE sortie IA visible porte ChipIA (Sparkles + étiquette « Généré par IA »).
4. Opt-in pour le personnel : matchingEnrichi, copilot = consentement explicite révocable dans /profil (défaut FALSE).
5. Désactivable : toggle utilisateur + kill-switch global admin (RG12.5).
6. Traçabilité : chaque appel loggé (AppelIA — feature, score, raison, cible polymorphe).
7. Contenu filtré : prompts sortants anonymisés/tronqués côté backend.

**IA-1 — Modération préventive (phase 3, première livrée)** —
- Backend `ia/` : service heuristique locale (spam 60, harcèlement 55, PII 55 ; seuil 55), modèle AppelIA (traçabilité), config kill-switch IA_DESACTIVEE, branchement dans `fil.views` : Publication/Commentaire → analyse à la création → score ≥ 55 ⇒ Signalement source IA déposé + `en_verification=true` (VISIBLE par l'auteur, JAMAIS masquée auto — RG12.1). AppelIA journalisé à chaque fois.
- Front : champ `enVerification` exposé dans PublicationSerializer → CartePublication affiche ChipIA quand `enVerification=true` (RG12.3). Pas de blocage parcours (dégradation silencieuse si IA indisponible).
- Préférences IA dans /profil : ToggleConsentementIA (opt-in strict, défaut false) pour matchingEnrichi (IA-2) + copilot (IA-3) ; ChipIA + PanneauSuggestionsIA + ToggleConsentementIA partagés.
- SessionView fallback JWT (Authorization header) — utile scripts/E2E.

**Pièges T6** —
- **Seuil heuristique** : spam 60 > 55 → signalé ; harcèlement 55 = signalé ; PII 55 = signalé ; score combiné plafonné 95 (jamais 100 = vérification humaine OBLIGATOIRE).
- **Kill-switch** : IA_DESACTIVEE dans settings → `analyser_apres_creation` sort immédiatement `None` (0 impact parcours).
- **RG12.2 respecté** : l'heuristique ne reçoit QUE Publication/Commentaire (pas de conversation privée).
- **Tests IA-1** : spam/harcelement/PII → 201 + en_verification=true + Signalement IA déposé ; normal → 201 + en_verification=false ; kill-switch ON → spam passe sans flag.
- **Front 65/65, backend 86/86, lint 0, build vert, ruff 0**.

**Prochaine** : IA-2 (matching enrichi suggestions), IA-3 (copilot profil), IA-4 (FAQ L1), IA-5 (binômes silencieux), IA-6 (offres alumni) — en fonction des priorités Ivo.
