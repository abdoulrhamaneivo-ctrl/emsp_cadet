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
| P13 | `/mes-demandes` | MesDemandesPage | `features/parrainage/pages/MesDemandesPage.jsx` | **doc 05 §4** | T2 | ⬜ à construire |
| P14 | `/mon-parrainage` | MonParrainagePage | `features/parrainage/pages/MonParrainagePage.jsx` | **doc 05 §5** (double facette) | T2 | ⬜ à construire |
| P15 | `/rendez-vous` | RendezVousPage | `features/rendez-vous/pages/RendezVousPage.jsx` | **doc 06 §4** | T3 | ⬜ à construire |
| P16 | `/rendez-vous/:rdvId` | RendezVousDetailPage | `features/rendez-vous/pages/RendezVousDetailPage.jsx` | **doc 06 §5** | T3 | ⬜ à construire |
| P17 | `/messagerie` | MessagerieListPage | `features/messagerie/pages/MessagerieListPage.jsx` | **doc 08 §4** | T3 | ⬜ à construire |
| P18 | `/messagerie/:conversationId` | ConversationPage | `features/messagerie/pages/ConversationPage.jsx` | **doc 08 §5** (+ groupes doc 13 §5) | T3 | ⬜ à construire |

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
