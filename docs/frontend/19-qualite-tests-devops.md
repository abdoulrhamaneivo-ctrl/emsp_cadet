# EMSP Connect v2 — QUALITÉ, TESTS & DEVOPS FRONT
## Doc 19 — Garde-fous obligatoires pour tout agent qui code (né de l'audit doc 18)

> **À lire avant la première ligne de code d'application.** Cette doc rend impossible la livraison d'un code non testé, non linté, silencieusement cassé. Elle s'applique à TOUTE contribution, humaine ou agent.

---

## 1. Principe directeur

> **Un agent ne merge jamais ce qu'il n'a pas fait tourner.** Démo locale verte + checklist design (doc 03 §11) + tests passants = les 3 conditions d'une PR acceptable.

## 2. Conventions Git & workflow (agents inclus)

```bash
# Branches
main                    # toujours déployable, protégée par la CI
t0-socle, t1-annuaire   # branches de tranche (doc 18 §4)
feat/<domaine>-<sujet>  # travail d'agent : feat/annuaire-filtres
fix/<domaine>-<sujet>

# Commits — Conventional Commits (fr facultatif, type EN obligatoire)
feat(annuaire): filtre par filière avec sync URL
fix(messagerie): perte de badge non-lus après reconnexion WS
docs(design-system): ajouter AvatarStack au contrat
refactor(shared): extraire useDebounce
test(parrainage): règles canAccept/canCancel
```
Workflow : branche → PR → CI verte → auto-revue checklist doc 03 §11 → merge squash sur la branche de tranche. **Jamais de commit direct sur main.** La branche de tranche merge main quand ses critères de sortie (doc 18 §4.3) sont tenus.

## 3. Stack de test (décisions)

| Outil | Rôle | Portée minimale |
|---|---|---|
| **Vitest** | Unit/intégration JS | `rules.js` de CHAQUE feature (RG1–RG12 testés 1 par 1), utils, hooks |
| **React Testing Library** | Composants | Composants shared doc 03 (T1–T15) : rendu, a11y basique, interactions clés |
| **MSW** | Mock API/WS | Handlers par feature DANS le repo (`src/mocks/handlers/`), données de démo réalistes et cohérentes entre features (mêmes 12 utilisateurs fictifs partout) |
| **Playwright** | E2E | Parcours P1 cadet et P2 aîné (doc 02 §6) SANS IA, mobile viewport 375px inclus |

Règles :
1. Les mocks MSW sont la source des données de dev (`VITE_USE_MOCKS=true` par défaut) — une page métier DOIT tourner complète sur mocks avant tout branchement réel.
2. Chaque règle RG modifiable → son test unitaire se met à jour dans le même commit (sinon CI rouge).
3. Seuil CI : pas de seuil magique de coverage — mais **interdiction de descendre** le coverage global (ratchet simple).
4. Les tests E2E tournent sur le build de prod local (`vite preview`), pas le dev server.

## 4. Gestion d'erreurs globale (spécification exacte)

### 4.1 Interception HTTP (src/shared/api/client.js — intercepteur unique)
| Réponse | Comportement automatique |
|---|---|
| 401 (non authentifié) | Tentative refresh une fois → si échec : purge auth + redirect `/connexion?raison=session` |
| 403 | Pas de redirect générique : toast erreur + l'écran courant gère son cas (chaque spec liste ses 403) |
| 423 (suspension RG11) | Purge auth + redirect `/compte-suspendu` avec state {motif, fin} |
| 429 | Toast « Trop de requêtes — patiente un instant » + backoff auto sur retry |
| 5xx | Toast erreur générique ; refetch auto 1× après 2s pour les GET |
| Offline (navigator.onLine=false) | Bannière globale fine « Connexion perdue » + file d'attente mutations (doc 08 pattern) |

### 4.2 Error Boundaries (deux niveaux, obligatoires)
- **ShellBoundary** autour de chaque shell (public/protégé) : écran de panne intégral sobre avec bouton « Recharger » + lien accueil. Log Sentry.
- **FeatureBoundary** autour de chaque page du router (wrapper automatique dans routes/*.jsx) : la panne d'une page n'emmène pas l'app ; fallback = panel avec message + bouton réessayer (remonte la query).
- Règle : tout `useQuery` critique a son `onError` explicite — les états de la doc 03 §9 ne sont PAS optionnels.

### 4.3 Ce qui est interdit
- `catch {}` silencieux (lint rule en error).
- Swallower de promesse (`onClick={() => mutation.mutate()}` sans gestion d'erreur quand le résultat compte).
- Toast pour chaque erreur d'un même flux (dédupliquer : un écran OU un toast, pas les deux).

## 5. Sécurité front (décisions verrouillées)

1. **JWT** : access token en mémoire JS uniquement (jamais localStorage) ; refresh token en cookie `httpOnly; Secure; SameSite=Strict` posé par le backend. Déconnexion = appel backend (révocation) + purge mémoire.
2. **XSS** : `dangerouslySetInnerHTML` INTERDIT (lint rule) ; tout contenu riche futur passera par un sanitizer explicitement approuvé en revue.
3. **Liens externes** : `rel="noopener noreferrer"` obligatoire (offres doc 14 notamment).
4. **Dépendances** : `npm audit` dans la CI (échec sur vulnérabilité HIGH+) ; dépendances ajoutées uniquement avec justification dans la PR (un agent n'ajoute pas une lib « au cas où »).
5. **Secrets** : rien de secret dans le front (VITE_* = publics assumés) ; toute clé API est backend-side.
6. **Permissions UI** : les gardes de rôle sont une UX, pas une sécurité — le backend revalide TOUT (consigné dans chaque spec : « l'API renvoie 403 de toute façon »).

## 6. Performance budget (bloquant en CI via vite-bundle-analyzer en warning)

| Métrique | Budget |
|---|---|
| JS initial gz (main + shell public) | **< 300 KB** |
| Route la plus lourde (lazy chunk) | < 150 KB gz |
| LCP mobile (throttled, démo locale) | < 2.5 s sur les pages publiques |
| Images | lazy loading + formats modernes dès que des images réelles arrivent |

Moyens imposés : React.lazy par feature (routes), MUI import tree-shaken, framer-motion imports ciblés (`m` + LazyMotion si le budget menace), pas de moment/date-fns-full (import par fonction).

## 7. Observabilité (léger mais présent dès T0)

- Sentry DSN branché TÔT (dsn déjà prévu) : ErrorBoundary + intercepteur HTTP + breadcrumb route change. PII scrubbing activé (jamais de contenu de message dans les events).
- Console propre : zéro warning React en console sur les parcours démo (le warning d'aujourd'hui est le bug de demain).

## 8. CI minimale (GitHub Actions — pipeline unique `ci.yml`)

```
on: pull_request (vers main et branches t*)
jobs:
  quality:
    steps: npm ci → lint → vitest run → vite build → (option) playwright en nightly main seulement
```
- PR sans CI verte = non reviewable, point final (même pour Ivo).
- Le workflow file et les seeds MSW appartiennent au repo dès T0.

## 9. Definition of Done (une tâche est « faite » si ET SEULEMENT SI)

```
[ ] Code linté, buildé, tests passants localement
[ ] Tests unitaires des règles touchées à jour
[ ] MSW handlers à jour si nouveaux endpoints
[ ] Checklist design doc 03 §11 cochée (copiée dans la PR)
[ ] Captures 375px + 1280px jointes à la PR
[ ] Aucun nouveau warning console
[ ] Bundle budget respecté
```
