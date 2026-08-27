# EMSP Connect v2 — Périmètre Fonctionnel Complet
## Doc 02 — Source de vérité métier (front)

> **Cette doc fait foi.** Elle intègre l'intégralité du cahier des charges officiel « Parr'Innov » (`Cahier_des_charges_Parrainage.pdf`, racine du repo, juin 2026) y compris les sections longtemps absentes du plan initial : **rendez-vous (§3.5), retours d'expérience (§3.6), badges (§3.8)**.
> Chaque agent travaillant sur une page DOIT lire cette doc avant sa spec de page.

---

## 0. Lexique officiel

| Terme cahier des charges | Nom produit | Rôle |
|---|---|---|
| Filleul / étudiant L1 | **Cadet** | Étudiant guidé (L1–L3) |
| Parrain / devancier | **Aîné** | Étudiant accompagnant |
| Administrateur | **Admin** | Gestion, modération, stats |

**Modèle v2 (août 2026) — CASQUETTES cumulables** : le rôle d'administration est isolé (`isAdmin`) ; ce qui se cumule ce sont deux casquettes :
- **Casquette Cadet** : être accompagné par un Aîné (tout étudiant, même un Aîné en activité — en L2 j'ai encore MON aîné).
- **Casquette Aîné** : accompagner des cadets — réservée aux niveaux **L2/L3** et aux **Alumni** (RG7, RG10) et pilotée par la **candidature personnelle ouverte/fermée** (RG8). Un L1 ne peut PAS être aîné ; il prépare sa vitrine pour l'année suivante.

Le code utilise `niveauEtude:"L1|L2|L3"`, `candidatureAineOuverte:boolean`, `isAdmin:boolean`. Les textes UI parlent de Cadet / Aîné comme casquettes actives. Ne jamais écrire « filleul » ni « parrain » dans l'interface visible.

---

## 1. Les 3 acteurs (matrice de permissions)

| Capacité | Cadet | Aîné | Admin |
|---|---|---|---|
| Créer/modifier son profil (classe, filière, photo, attentes) | ✅ | ✅ | ✅ |
| Consulter l'annuaire des Aînés disponibles | ✅ | ❌ (voit ses propres fiches via /profil) | ✅ |
| Recevoir une suggestion automatique de parrain | ✅ | ❌ | ❌ |
| Envoyer une demande de parrainage | ✅ (max 1 active — RG1) | ❌ | ❌ |
| Accepter / refuser des demandes | ❌ | ✅ | ❌ |
| Accompagner jusqu'à 5 cadets simultanément | — | ✅ (RG2) | — |
| Discuter en privé / planifier des RDV | ✅ si binôme actif | ✅ si binôme actif | ❌ |
| Créer un événement collectif | ❌ | ✅ | ✅ |
| S'inscrire à un événement collectif | ✅ | ✅ | ✅ |
| Laisser un avis en fin de parrainage | ✅ | ❌ (reçoit les avis) | ❌ |
| Recevoir des badges | ❌ | ✅ | ❌ |
| Publier une offre sur /offres (RG10 : Alumni + Admin) | ❌ | — | ✅ |
| Gérer comptes, modérer contenus signalés | ❌ | ❌ | ✅ |
| Consulter statistiques plateforme | ❌ | ❌ | ✅ |
| Suspendre / supprimer un compte | ❌ (auto-suppression possible de son propre compte) | ❌ | ✅ |
| Modifier le rôle d'un utilisateur | ❌ | ❌ | ✅ (RG5) |

> **Lecture v2 de la matrice (casquettes)** : chaque colonne = capacité exercée DANS cette casquette. Un étudiant peut exercer LES DEUX simultanément (un L2 accompagne ses cadets pendant que son propre Aîné le guide) — les quotas ne se mélangent jamais (RG9). Les lignes côté Aîné ne sont actives que si la candidature est OUVERTE (RG8) et le niveau ≥ L2 (RG7).

---

## 2. Carte des fonctionnalités ↔ routes ↔ specs

| § cahier | Fonctionnalité | Routes front | Spec détaillée | Phase |
|---|---|---|---|---|
| §3.1 | Inscription / auth (@emsp.int) | `/inscription`, `/connexion`, `/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe/:uid/:token`, `/verifier-email/:uid/:token` | ✅ construites (adapter validation email domaine) | 1 |
| §3.2 | Annuaire + recherche + suggestion auto | `/annuaire`, `/annuaire/:parrainId` (fiche) | **Doc 04** | 1 |
| §3.3 | Mise en relation (demandes) | `/mes-demandes` (dual-role), gestion depuis fiche | **Doc 05** | 1 |
| §3.4 | Messagerie privée post-acceptation | `/messagerie`, `/messagerie/:conversationId` | **Doc 08** | 2 |
| produits | Familles & Cercles : échange collectif vertical (en L2 on garde son aîné ET ses cadets) | vies sous `/messagerie/:id` + blocs d'entrée (doc 05) | **Doc 13** | 2 |
| §3.5 | Rendez-vous (proposition, contre-proposition, rappel) | `/rendez-vous`, `/rendez-vous/:rdvId` | **Doc 06** | 2 |
| §3.6 | Retours d'expérience + score fiabilité | intégré `/mon-parrainage`, fiche `/annuaire/:id` | **Doc 07** | 3 |
| §3.7 | Événements collectifs | `/evenements`, `/evenements/:evenementId` | **Doc 10** | 3 |
| §3.8 | Badges de reconnaissance | affiché `/profil`, fiche `/annuaire/:id` | **Doc 07** | 3 |
| admin | Gestion comptes, modération, stats | `/administration`, `/moderation` | **Doc 12** | 3 |
| fil/offres | Fil d'annonces (2e espace collectif d'échange), offres stage/emploi (fonctionnalité Alumni clé) | `/fil`, `/offres` | **Doc 09** / **Doc 14** | 3+ |

---

## 3. RÈGLES DE GESTION — traduction frontend exacte (non négociables)

> Le backend garantit ces règles ; le front doit les rendre visibles ET impossible à contourner en UX.

**RG1 — Un cadet ne peut avoir qu'un seul Aîné actif à la fois.**
- Bouton « Demander ce parrain » remplacé si `monParrainage.actif === true` par un encart discret renvoyant vers `/mon-parrainage`.
- Sur `/annuaire`, bannière info persistante en haut quand binôme actif : « Tu es déjà accompagné(e) — voir mon parrainage ».
- Si l'utilisateur tente de force-request via devtools, l'API renvoie 409 → toast erreur générique.
- Cas limite toléré : plusieurs demandes « en_attente » sont bloquées dès qu'une seule est envoyée (une attente compte comme engagement). Une demande en attente peut être ANNULÉE par le cadet tant qu'elle n'est pas acceptée.

**RG2 — Un Aîné ne dépasse pas 5 cadets actifs simultanés.**
- Chaque fiche/carton Aîné expose le compteur `nbCadetsActifs / 5` sous forme de jauge compacte (ex. segments 5 cases pleines/vacantes).
- Quand `nbCadetsActifs >= 5` : voir RG3.
- À 4/5 : badge d'avertissement subtil « dernière place » (couleur accent-gold) — attention visuelle, pas d'alarme.

**RG3 — Aîné plein ⇒ son profil disparaît de l'annuaire jusqu'à libération.**
- Endpoint `/api/parrains/?disponible=true` (défaut du filtre).
- Toggle avancé dans la barre de filtres : « Inclure les Aînés complets » (OFF par défaut) — utile aux admins et transparence, masqué aux cadets simples ? NON : cohérence produit, le toggle est accessible à tous mais désactivé pour cadets ayant déjà un binôme (inutile).

**RG4 — Seul un email du domaine école permet de s'inscrire.**
- Validation zod côté client AVANT soumission : regex `@emsp.int$` (config `VITE_APP_DOMAIN`).
- Erreur inline immédiate pendant la saisie (onChange debounced 400ms), pas seulement au submit : « Utilise ton adresse EMSP (@emsp.int) ».
- Champ prérenseigné suggérant le suffixe `@emsp.int` (input group).

**RG5 — Le rôle ne change que par un administrateur.**
- `/profil` : champ rôle en lecture seule avec verrou, tooltip « Modifiable uniquement par l'administration ».
- Sélecteur de rôle UNIQUEMENT à l'inscription (choix Cadet/Aîné).
- Switch de rôle par admin : confirmation modale distincte avertissant des conséquences (binômes en cours, quotas).

**RG6 — Fin de parrainage (abandon ou fin d'année) libère une place et déclenche la demande d'expérience.**
- Dès `statut: "termine"` reçu côté données : modale bloquante douce (dismissable une fois max) : « Comment s'est passé cet accompagnement ? Note ton Aîné » → ouvre flux avis (Doc 07).
- Compteur du parrain décrémenté → s'il repasse sous 5, il REAPPARAÎT automatiquement dans l'annuaire (RG3 inversée, sans action front autre que refetch).
- L'historique `/mon-parrainage` affiche le binôme clos avec son statut de revue (avis donné / relance si pas donné).

**RG7 — Seul un étudiant L2 ou L3 peut être Aîné (nouveau, besoin réel EMSP).**
- Contrôle serveur ; le front bloque AVANT : toggle candidature physiquement disabled en L1 avec un texte motivant (« En L2, ce sera ton tour d'aider les nouveaux »).
- Annuaire et suggestion automatique n'affichent JAMAIS un L1 dans la liste des Aînés.
- Promotion L1→L2 sauvegardée → toast-action proposant d'ouvrir la candidature (jamais d'ouverture automatique).

**RG8 — La casquette Aîné est pilotée par la candidature ouvert/fermé (nouveau).**
- Toggle unique dans `/profil` : ON = visible dans l'annuaire + reçoit des demandes ; OFF = invisible annuaire + zéro nouvelle demande, MAIS binômes actifs INTACTS (fermer ≠ démissionner, aucune clôture forcée).
- Ouverture efficace seulement si vitrine complète (photo, ambitions ≥3, projets ≥1, forces ≥2, faibles ≥1) ; sinon pipeline de complétude visible sur le profil.

**RG9 — Quotas séparés par casquette (nouveau).**
- Ton Aîné ne consomme PAS tes 5 places de cadets, et réciproquement : être guidé et guider coexistent sans limite croisée.
- RG2 (max 5) s'applique UNIQUEMENT aux cadets que tu portes.

**RG10 — Les Alumni restent membres à part entière (nouveau, besoin réel EMSP).**
- Définition : ancien étudiant ayant fini son cursus (fin de L3). Son `@emsp.int` est conservé (H1 doc 14), le statut basculé par l'ADMIN en transition annuelle (doc 12) avec `anneePromotion`.
- Capacités : il GARDE tout l'équipement étudiant (fil/commentaires, événements, RDV si binôme vivant, cercles selon relations actives) ; sa candidature Aîné (RG8) demeure disponible — un diplômé est le devancier naturel.
- Signature visuelle : chip « ALUMNI · Promo {année} » sur fiche/cartes (StatutChip, doc 14).
- Privilège exclusif : publication des Offres stage/alternance/emploi sur `/offres` (max 5 ouvertes simultanées), lisible par tous (doc 14).
- Hypothèses H1–H3 consignées dans doc 14 §2 — à invalider officiellement auprès de l'école si besoin.

**RG11 — Sanctions graduées, humaines et contestables (doc 16).**
- Échelle : avertissement → suspension 7/15/30 j → exclusion définitive. Motif obligatoire ≥20 chars ; notification à l'intéressé ; historique immuable.
- Jamais automatique (l'IA flagge, doc 17 ; l'humain sanctionne). Suspension = compte gelé (binômes gelés, contenus conservés) ; exclusion = clôture binômes motif « exclusion » + contenus masqués.
- Route publique `/compte-suspendu` (écran d'état) ; interception 423 par le shell avant tout rendu.

**RG12 — IA responsable (doc 17).**
- L'IA propose, l'humain dispose : aucune suppression/sanction automatique.
- Conversations privées et groupes JAMAIS analysés (méta-données seules pour l'inactivité).
- Toute sortie IA visible = étiquette « Généré par IA » ; features personnelles = opt-in strict révocable (`preferencesIA`) ; kill-switch admin global.

**Parcours académique (doc 15)** : niveaux L1→L2→L3→M1→M2 ; fin de L3, l'étudiant déclare son intention (Master/Alumni/Indécis — défaut alumni ajustable) ; fin de M2 → alumni ; transition annuelle admin atomique et loggée. Les M1/M2 ont exactement les droits L2/L3 (éligibles Aîné).

---

## 4. Carte des routes définitive (source unique)

```js
// PUBLIC (PublicShell — navbar + footer publics)
"/",                                          // LandingPage ✅
"/connexion",                                 // LoginPage ✅
"/inscription",                               // RegisterPage ✅
"/mot-de-passe-oublie",                       // ForgotPasswordPage ✅
"/reinitialiser-mot-de-passe/:uid/:token",    // ResetPasswordPage ✅
"/verifier-email/:uid/:token",                // VerifyEmailPage ✅
"/compte-suspendu",                           // Écran d'état suspension (RG11, public)
"/health",                                    // HealthCheck ✅

// PROTÉGÉ tous rôles (ProtectedShell — sidebar/navigateur applicatif)
"/accueil",            // HomePage ✅
"/profil",             // ProfilePage (édition + rôle RO + auto-suppression compte)
"/annuaire",           // AnnuairePage              → Doc 04
"/annuaire/:parrainId",// FicheParrainPage          → Doc 04
"/fil",                // FilPage
"/evenements",         // EvenementsPage
"/evenements/:evenementId", // EvenementDetailPage (discussion + inscription, doc 10)
"/offres",             // OffresPage (offres Alumni/Admin — Doc 14)

// PROTÉGÉ selon binôme/activité
"/mes-demandes",       // MesDemandesPage — vue DUALE (envoyées=cadet / reçues=aîné) → Doc 05
"/mon-parrainage",     // MonParrainagePage — cadets : binôme + historique        → Doc 05
"/messagerie",         // MessagerieListPage
"/messagerie/:conversationId", // ConversationPage
"/rendez-vous",        // RendezVousPage                          → Doc 06
"/rendez-vous/:rdvId", // RendezVousDetailPage                    → Doc 06

// ADMIN SEUL (garde de rôle stricte, redirection /accueil sinon)
"/administration",     // AdminDashboardPage
"/moderation",         // ModerationPage
```

Badges et avis n'ONT PAS de route dédiée (cf. cahier §3.8 « affichés sur le profil public du parrain ») : ce sont des composants intégrés (Doc 07).

---

## 5. Entités de données (contrat JSDoc partagé)

> Fichier unique `src/shared/types/models.js` (JSDoc, projet en JS). Les specs de pages référencent ces formes. Exemples JSON alignés sur le futur DRF.

```js
/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} prenom
 * @property {string} nom
 * @property {string} email            // doit finir par @emsp.int (RG4)
 * @property {boolean} isAdmin                  // RG5 : accès administration (RO)
 * @property {"L1"|"L2"|"L3"|"M1"|"M2"|"alumni"} niveauEtude  // RG7/RG10/RG-doc15 : parcours complet
 * @property {"master"|"alumni"|"inconnu"} intentionAnneeSuivante  // déclaratif fin de cycle (doc 15)
 * @property {{matchingEnrichi: boolean, copilot: boolean}} preferencesIA  // RG12 : opt-in strict (doc 17)
 * @property {string|null} anneePromotion           // ex "2026" — rempli à la bascule alumni
 * @property {boolean} candidatureAineOuverte   // RG8 : pilote la casquette Aîné
 * @property {string} classe           // ex: "L1", "L2 SI"
 * @property {string} filiere          // ex: "Digitalisation des services"
 * @property {string|null} photoUrl
 * @property {string|null} attentes    // free-text cadet
 * @property {boolean} emailVerifie
 * @property {string} dateInscription  // ISO 8601
 */

/** @typedef {Object} ProfilAine — enrichit User côté GET /api/parrains/:id/
 * @property {{code:string,libelle:string,dateObtention:string}[]} badges
 * @property {string[]} ambitions @property {string[]} projets
 * @property {string[]} pointsForts @property {string[]} pointsFaibles
 * @property {number} nbCadetsActifs   // 0..5 (RG2)
 * @property {number|null} scoreFiabilite // moyenne avis 0..5, null si 0 avis (§3.6)
 * @property {number} nbAvis
 */

/**
 * @typedef {"en_attente"|"acceptee"|"refusee"|"annulee"|"terminee"} StatutDemande
 * @typedef {Object} DemandeParrainage
 * @property {number} id @property {User} cadet @property {User} aine
 * @property {StatutDemande} statut
 * @property {string} dateDemande @property {string|null} dateReponse
 * @property {string|null} motifRefus
 */

/** @typedef {Object} Conversation
 * @property {number} id
 * @property {"prive"|"groupe_famille"|"groupe_cercle"} type
 * @property {User|null} interlocuteur          // prive seulement
 * @property {{titre:string, iconeCode:string, membres:User[], proprietaireId:number}|null} groupe  // familles/cercles (doc 13)
 * @property {{contenu:string,dateEnvoi:string}|null} dernierMessage
 * @property {number} nonLus
 */
/** @typedef {Object} Message
 * @property {number} id @property {number} conversationId @property {boolean} envoyeParMoi
 * @property {string} contenu @property {string} dateEnvoi
 */

/**
 * @typedef {"propose"|"confirme"|"refuse"|"contre_propose"|"annule"|"passe"} StatutRDV
 * @typedef {Object} RendezVous
 * @property {number} id
 * @property {User} organisateur @property {User} invite   // binôme des deux sens possibles
 * @property {string} titre @property {string|null} description
 * @property {string} dateHeure          // ISO local ISO 8601
 * @property {string} lieu
 * @property {"presentiel"|"visio"} mode
 * @property {StatutRDV} statut
 * @property {{dateHeure:string,lieu:string}|null} contreProposition
 */

/** §3.6
 * @typedef {Object} Avis
 * @property {number} id @property {number} parrainageId @property {number} auteurId
 * @property {number} note               // entier 1..5
 * @property {string} commentaire        // 20..600 chars
 * @property {string} dateAvis
 */

/** §3.7
 * @typedef {Object} Evenement
 * @property {number} id @property {string} titre @property {string} description
 * @property {string} dateDebut @property {string} lieu
 * @property {User} organisateur         // aîné OU admin
 * @property {number} capaciteMax @property {number} nbInscrits
 * @property {boolean} inscritMoi
 */

/** §3.8 — catalogue fixe, attribution automatique backend
 * codes: "premier_parrainage", "cinq_cadets", "evenement_organise", (extensible)
 * @typedef {Object} BadgeCatalogue
 * @property {string} code @property {string} libelle @property {string} critere
 */
```

Score de fiabilité (§3.6) : calcul backend = moyenne des notes ; exposition : `scoreFiabilite` + `nbAvis`. Le front NE recalcule jamais une moyenne locale sur une liste partielle.

---

## 6. Parcours utilisateurs canoniques

### P1 — Cadet de bout en bout (chemin heureux)
1. `/inscription` (rôle Cadet, email @emsp.int — RG4) → `/verifier-email/:uid/:token`
2. `/accueil` vide d'engagement → hero affiche progression onboarding (photo, attentes, rechercher un Aîné)
3. `/annuaire` → suggestion auto en tête (même filière §3.2) → filtres → fiche `/annuaire/:id`
4. CTA « Demander ce parrain » (contrôles RG1+RG3) → confirmation → toast + redirection `/mes-demandes` (onglet Envoyées)
5. Acceptation par l'Aîné → notification + état fraîchement activé partout (TanStack Query invalidation `["demande","conversations","parrainage"]`)
6. `/messagerie` nouvelle conversation active + `/rendez-vous` débloqué
7. Fin d'année ou clôture → RG6 : modale avis (Doc 07) → retour `/annuaire` débloqué

### P2 — Aîné de bout en bout
1. `/inscription` (rôle Aîné) → complète ambitions/projets/points forts-faibles (obligatoire avant visibilité annuaire)
2. Reçoit demandes → `/mes-demandes` onglet Reçues → inspecte le profil cadet → Accepter/Refuser (motif requis si refus)
3. Sous quota 5 (RG2) : jauge visible sur `/accueil` et `/profil` (« 3/5 cadets accompagnés »)
4. Provogue/accepte RDV, crée événements collectifs
5. Badges débloqués affichés `/profil` et fiches publiques

### P3 — Admin
1. Stats plateforme `/administration` (parrainages actifs, étudiants en attente §2-admin)
2. `/moderation` : contenus signalés (avis, profils) — suspendre/supprimer compte
3. Changement de rôle utilisateur (RG5) via fiche utilisateur

---

## 7. Roadmap d'implémentation (alignée phases cahier §7)

| Phase produit | Contenu front | Prérequis backend |
|---|---|---|
| **1. Socle** | Auth ✅, HomePage onboarding ✅, **Annuaire+fiche (Doc 04)**, **Mes demandes dual-role + Mon parrainage (Doc 05)**, Profil édition | Users, parrains, demandes |
| **2. Communication** | Messagerie liste+conversation, **Rendez-vous (Doc 06)**, notifications toasts/nav | DRF auth JWT, conversations WS Channels, RDV CRUD, email rappels |
| **3. Communauté & qualité** | **Avis+badges (Doc 07)**, Événements, Administration/modération/stats, Fil, Offres | Avis, badges engine, events, signalements |
| **4. Prod** | Perf (code-splitting lazy routes, images optimisées), audit accessibilité mobile-first, branchement API réel, tests règles RG via parcours E2E manuels scriptés | PostgreSQL, stockage photos externe |

---

## 8. Conventions cross-pages pour tout agent

1. **Framework d'états serveur** : TanStack Query v5 systématique (`useQuery(["parrains", filtres])`, invalidations ciblées).
2. **Formulaires** : react-hook-form + zod, schémas par feature dans `features/<domain>/schemas.js`.
3. **API layer** : axios instance dans `src/shared/api/client.js` — base `VITE_API_URL`, interceptor refresh JWT, wrapper typé par domaine.
4. **Format dates** : date-fns, langue fr via `Intl`; jamais de `Date.now()` affiché brut.
5. **Toasts** : sonner — succès vert profond #0f5132, erreur rouge #b42318, neutre crème.
6. **Écrans interdits vides** : chaque état empty dispose d'une illustration simple + CTA primaire contextualisée.
7. **Skeletons** : chaque composant liste/carte possède son état loading (shimmer CSS var --hover-bg).
8. **Une route = un fichier page** dans `features/<domain>/pages/XxxPage.jsx`, importé depuis `src/app/routes/*.jsx`.
9. **Pas de logique métier dupliquée** : toute règle RG consommée par ≥2 pages se met dans `features/<domain>/rules.js`.
10. Lire `docs/frontend/03-design-system.md` AVANT d'écrire la moindre ligne JSX.
