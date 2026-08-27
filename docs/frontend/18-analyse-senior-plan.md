# EMSP Connect v2 — ANALYSE SENIOR & PLAN D'AMÉLIORATION
## Doc 18 — Audit de cadrage avant construction (août 2026, revue par Ivo)

> Ce document est l'audit senior du projet TEL QUE documenté (docs 00–17) avant d'écrire la première ligne de code d'application. Il fige les risques, les gaps et les décisions à trancher. Les actions qui en découlent sont déjà appliquées (doc 19 + extensions IA) ou listées comme décisions Ivo.

---

## 1. État des lieux — forces à ne pas casser

| Force | Pourquoi c'est rare |
|---|---|
| Cahier des charges officiel + 17 docs cohérents traçables | La plupart des projets étudiants partent direct au code |
| Règles métier RG1–RG12 traduites en comportements UI précis | Un agent ne peut pas « interpréter » de travers |
| Design system avec interdits explicites (blur, pastels, emojis) + checklist PR | Garantit la barre designer senior entre tous les agents |
| Modèle de données JSDoc contractuel partagé | Le front et le futur backend parlent la même langue |
| Décisions produit consignées avec leurs dates et leurs auteurs (Ivo) | Pas de débat infini ni de régression de décision |

## 2. Risques top 5 & mitigations

| # | Risque | Gravité | Mitigation retenue |
|---|---|---|---|
| R1 | **Agents codant sans garde-fous qualité** (pas de tests, pas de CI, erreurs silencieuses) | 🔴 Haute | **Doc 19 créée** : stratégie tests + CI + error handling global + conventions. Chaque PR d'agent passe la checklist |
| R2 | **Périmètre trop large pour une V1** : 17 specs = 8 semaines+ de travail si tout est visé d'un coup | 🔴 Haute | Roadmap verticale : on livre des TRANCHES complètes (socle→annuaire→demandes) fonctionnelles de bout en bout, pas des pages en vrac. Cf §4 |
| R3 | **Backend inexistant** : toutes les specs supposent une API DRF qui n'existe pas | 🟠 Moyenne | Mock Service Worker (MSW) dès le socle : le front tourne avec des données fictives CONFORMES aux contrats ; le backend branchera sans toucher aux pages. Backend specifié dans `docs/backend/` en parallèle (tranche 2+) |
| R4 | **Dérive visuelle** au fil des agents (le « fait IA » revient par petites touches) | 🟠 Moyenne | Checklist doc 03 §11 obligatoire + revue visuelle par Ivo à chaque tranche sur 375px + 1280px |
| R5 | **Token bloat / incohérence MUI-Tailwind** : deux systèmes qui divergent silencieusement | 🟡 Basse | Pont MUI unique (doc 03 §5) déjà verrouillé ; interdiction d'hex hors palette auditée en revue |

## 3. Gaps identifiés dans la doc initiale — traitement

| Gap | Classement | Traitement |
|---|---|---|
| Aucune stratégie de tests ni CI | **P0** | ✅ Doc 19 (Vitest+RTL+MSW+Playwright, pipeline minimal) |
| Error handling global non spécifié (401/403/423/500, ErrorBoundary) | **P0** | ✅ Doc 19 §4 |
| Sécurité front (stockage JWT, XSS, dépendances) non cadrée | **P0** | ✅ Doc 19 §5 — décision : refresh token en cookie httpOnly côté backend, access token en mémoire JS uniquement |
| Conventions git/branches/PR pour les agents | **P0** | ✅ Doc 19 §2 |
| Features IA référencées (doc 17) mais absentes des specs de pages | P1 | ✅ Extensions IA ajoutées dans docs 04, 09, 11, 12, 14 (sections « Extension IA ») |
| Perf budget non chiffré (lazy, bundle) | P1 | ✅ Doc 19 §6 (budget initial <300KB gz) |
| Droit d'accès/export des données (RGPD-like) absent (le cahier ne couvre que la suppression) | P1 | Consigné doc 11 frontière → recommandé à Ivo : page « Mes données » (export JSON) en phase 3 |
| PWA installable (étudiants 90% mobile) non cadrée | P2 | Post-MVP : manifest + service worker quand l'app est stable |
| i18n | P2 | FR only assumé V1, clés de texte non dupliquées dans les composants (prêt pour i18n si un jour) |
| Monitoring/Sentry wiring | P2 | DSN déjà dans .env.example ; wiring dans doc 19 §7 |

## 4. Décisions structurantes (senior) — appliquées

1. **Tranches verticales, pas de pages en vrac** :
   - **T0 Socle** : migration structure (arborescence doc 01, tokens, providers, composants shared T1–T15 de doc 03, shells, MSW, CI) — PAS une seule page métier tant que T0 n'est pas vert.
   - **T1 Annuaire** (doc 04) : première tranche métier visible — annuaire + fiche + suggestion.
   - **T2 Parrainage** (docs 05+07 flux minimal) : demandes + mon-parrainage + modale avis simple.
   - **T3 Communication** (docs 06+08) : messagerie WS + RDV (backend Channels requis).
   - **T4 Communauté** (docs 09+10+13) : fil+commentaires, événements, groupes.
   - **T5 Back-office** (docs 11+12+15+16) : profil admin, transitions, sanctions.
   - **T6 IA** (doc 17) : par priorité IA-1 puis IA-2 (après que les espaces existent).
   - *(Offres doc 14 livrable en T4/T5 avec les premiers alumni réels.)*
2. **Le backend se spécifie en parallèle de T0/T1** mais n'est codé qu'à partir de T3 ; jusqu'ici MSW suffit — évite de bloquer le front sur l'API.
3. **Chaque tranche se termine par** : démo visuelle Ivo (375px+1280px) + checklist doc 03 §11 + merge main + tag git (`t0-socle`, `t1-annuaire`...).

## 5. À trancher par Ivo (bloqueurs éventuels)

1. **Où sera déployé le front** ? (même serveur que l'école ? Railway/Vercel gratuit ?) — pas bloquant avant T3.
2. **Nom final du produit** : « Parr'Innov » (cahier) vs « EMSP Connect » (docs/code) — la doc garde EMSP Connect, l'identité visuelle peut porter les deux (à confirmer avec l'école).
3. **Valeur du quota 5 cadets** : OK tel quel ?
4. **Faut-il un module « Plaintes/Besoin d'aide » direct** (bouton discret pour L1 en difficulté hors binôme) ? Recommandation senior : NON en V1 (le Fil + l'admin y répondent), à réévaluer après T2.
