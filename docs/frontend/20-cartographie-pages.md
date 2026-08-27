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
| P08 | `/health` | HealthCheck | `shared/pages/HealthCheck.jsx` | trivial | T0 | ⬜ à construire |

> ⚠️ Note d'état réel (27 août 2026) : les pages marquées 🔁 « déjà codée » existaient dans les sessions précédentes mais **ne sont PAS sur disque aujourd'hui** — le template est vierge. Elles sont donc à RECONSTRUIRE selon les docs. Traitées comme ⬜.

## 2. Shell protégé — cœur parcours (tous les étudiants)

| # | Route | Page | Fichier | Spec | Tranche | Statut |
|---|---|---|---|---|---|---|
| P09 | `/accueil` | HomePage | `features/accueil/pages/HomePage.jsx` | doc 09 §5 onboarding + widget RDV (06 §6) | T0* | ⬜ à construire |
| P10 | `/profil` | ProfilePage | `features/profil/pages/ProfilePage.jsx` | **doc 11** (+15 intention) | T2* | ⬜ à construire |
| P11 | `/annuaire` | AnnuairePage | `features/annuaire/pages/AnnuairePage.jsx` | **doc 04** | T1 | ⬜ PREMIÈRE PAGE MÉTIER |
| P12 | `/annuaire/:parrainId` | FicheAinePage | `features/annuaire/pages/FicheAinePage.jsx` | **doc 04 §5** | T1 | ⬜ à construire |
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
| P25 | `*` | NotFoundPage | `shared/pages/NotFoundPage.jsx` | doc 03 EmptyState style | T0 | ⬜ à construire |
| P26 | ErrorBoundary | ShellBoundary + FeatureBoundary | `shared/components/ErrorBoundary.jsx` | **doc 19 §4.2** | T0 | ⬜ à construire |

---

## 6. Composants shared à livrer au fil des tranches (contrat doc 03 §6)

| Composant | Tranche | Statut |
|---|---|---|
| Button, Card, Input/FormField, Avatar, Chip, Skeleton, EmptyState, Divider | **T0** (socle minimal) | ⬜ |
| Modal/ConfirmDialog (MUI habillé), Tabs, Pagination, Tooltip | T0/T1 | ⬜ |
| Table, Toast (sonner), Progress | T1/T2 | ⬜ |
| ScoreFiabilite, JaugeCapacite, BadgeVitrine, BandeauBadges | T1/T2 (docs 04/07) | ⬜ |
| AvatarStack, StatutChip, ChipIA, PanneauSuggestionsIA, ToggleConsentementIA | T2/T4/T6 | ⬜ |
| BanniereRappelProchainRDV (widget global) | T3 | ⬜ |

## 7. Règles de lecture du tableau

- **⬜ à construire · 🔁 à migrer · 🔨 en cours · ✅ fait (commit + démo validée) · 🚫 annulé**
- Une page passe ✅ SEULEMENT après : checklist doc 03 §11 + tests doc 19 + capture 375px/1280px + commit sur la branche de tranche.
- Les fichiers vivent dans `src/features/<domaine>/pages/` — la carte des routes est la doc 02 §4 (source unique, ne jamais dupliquer ici).
- La colonne Tranche renvoie à la roadmap doc 18 §4 : on construit PAR TRANCHE, pas par page isolée.
