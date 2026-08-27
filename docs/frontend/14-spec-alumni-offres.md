# EMSP Connect v2 — Spec ALUMNI & OFFRES
## Doc 14 — Statut alumni, transition, capacités, et module Offres stage/emploi

> Prérequis : docs 02 (RG7/RG8/RG10), 03, 09. Features : `src/features/offres/` (+ chips partagées).
> **Origine produit (besoin exprimé par Ivo)** : les diplômés ne doivent pas disparaître de la plateforme. Un alumnus reste membre, peut continuer à guider, et devient l'auteur naturel des offres de stage/emploi.

---

## 1. Objectif

Intégrer les **Alumni** comme catégorie de membres pleine plutôt qu'après-coup :
- rester dans la communauté : Fil, événements, éventuellement candidature Aîné,
- publier les **Offres** de stage/alternance/emploi qui alimentent `/offres`,
- être identifiables (« ALUMNI · Promo 2026 ») sans être relégués ailleurs.

**Users stories :**
- Diplômé : mon compte suit ma promotion — je continue à discuter, je peux publier des offres, et si je veux accompagner j'OUVRE ma candidature comme tout autre devancier.
- Cadet/Aîné : je consulte les offres filtrables et je contacte l'auteur d'une offre en un clic.
- Admin : je bascule les L3 diplômés en alumni chaque fin d'année, en masse et en toute traçabilité.

---

## 2. Hypothèses fondatrices (validées produit v0 — changer ici si l'école tranche autrement)

| # | Hypothèse | Conséquence si fausse |
|---|---|---|
| H1 | L'adresse `@emsp.int` est CONSERVÉE après le diplôme → connexion inchangée (RG4 intact) | Flux d'invitation admin par email externe à créer (V2, hors périmètre front immédiat) |
| H2 | Le passage étudiant → alumni n'intervient qu'en FIN DE CYCLE (fin L3 ou M2), via la transition admin annuelle (doc 15) où l'intention déclarée de l'étudiant (Master/Alumni) oriente la proposition — pas de sortie en cours de cursus | Si l'école veut des sorties anticipées (abandon) : flux admin séparé à cadrer |
| H3 | Aucune route séparée « alumni » : mêmes espaces, statut rendu par chips/badges | Replier un espace alumni isolé casserait la chaîne verticale (anti-objectif) |

---

## 3. Modèle de données & API

```js
/** Extension User (doc 02) — côté alumni uniquement :
 * @property {"L1"|"L2"|"L3"|"alumni"} niveauEtude   // alumni = statut stabilisé
 * @property {string|null} anneePromotion            // ex "2026", rempli à la bascule
 */

/**
 * @typedef {"stage"|"alternance"|"emploi"} TypeOffre
 * @typedef {"ouverte"|"pourvue"|"fermee"} StatutOffre
 * @typedef {Object} Offre
 * @property {number} id
 * @property {User} auteur                    // alumni (ou admin)
 * @property {TypeOffre} type @property {string} titre        // 6..90
 * @property {string} entreprise              // 2..60
 * @property {string} description             // 50..2000
 * @property {string|null} lieu               // libre OU "distanciel"
 * @property {string} datePublication @property {string|null} dateLimite
 * @property {string|null} lienExterne        // https only
 * @property {StatutOffre} statut
 */
```

```
GET    /api/offres/?type=&q=&page=          // catalogue complet, connecté
POST   /api/offres/                          // alumni|admin (403 sinon)
PATCH  /api/offres/:id/                      // auteur only
POST   /api/offres/:id/statut/               // body {statut:"pourvenue|fermee"} — auteur
DELETE /api/offres/:id/
GET    /api/me/profil-alumni-summary/        // compteur offres actives (5 max simultanées, côté serveur)
```

Clés query : `["offres", filtres]`, `["offre", id]`.

Règles dures :
1. **Publication alumni/admin uniquement** (RG10) — le bouton n'existe PAS pour un étudiant, et l'API renvoie 403 de toute façon.
2. **Contact = canal externe assumé en V1** : email auteur exposé via `mailto:` prérempli (objet : `[EMSP Connect] {titre}`), ou lien externe. PAS de candidature plateforme (CV upload etc.) en V1.
3. Max **5 offres ouvertes simultanées** par auteur (serveur) ; l'UI lit le compteur et explique le blocage.
4. Une offre `pourvue` passe visuellement en bandeau discret, garde son contenu consultable (archivage naturel utile).
5. Tout contenu offre signalable (modération doc 12 générique).

---

## 4. Impact alumni sur les modules existants (cross-docs)

| Module | Effet |
|---|---|
| Annuaire (doc 04) | Un alumnus avec candidature OUVERTE apparaît normalement ; chip « ALUMNI · Promo {année} » sur cartes+fiche+suggestions (tag « expérience pro » dans pourquoi cette suggestion). Les M1/M2 apparaissent avec leur chip de niveau — même traitement que L2/L3 |
| Parrainage (docs 05/07) | Aucune différence de règles — RG8/RG9 identiques ; badges/score fiabilité fonctionnent pour lui aussi |
| Familles/Cercles (doc 13) | Il vit selon les règles G existantes (relations actives). Inviter un alumnus HORS grand-aîné direct dans un cercle : V2 (pas de création forcée de liens morts) |
| Profil (doc 11) | Niveau L2/L3 éligible candidature SE PROLONGE à alumni ; chip statut RO sur profil ; éditeur d'offres ajouté à ses outils |
| Admin (doc 12) | Action collective de transition fin d'année + filtres par statut |
| Fil (doc 09) | Participations identiques ; possibilité de commenter « depuis le terrain » à valoriser plus tard (pas de règle spéciale V1) |

---

## 5. Structure fichiers

```
src/features/offres/
├── pages/OffresPage.jsx                 # /offres — liste + filtres + recherche
├── components/
│   ├── CarteOffre.jsx                   # carte catalogue
│   ├── DetailOffreModal.jsx             # contenu complet + contact + signalement
│   ├── ComposeurOffreModal.jsx          # création/édition (alumni)
│   ├── FiltresOffre.jsx                 # segmented Tous|Stage|Alternance|Emploi + q
│   └── MesOffresPanel.jsx               # gestion perso (alumni) : statuts, relance pourvue
├── hooks/useOffres.js
└── schemas.js                           // zod cf entité
src/shared/components/StatutChip.jsx     # chip ALUMNI·Promo + couleurs type offre (contrat doc 03 +)
```

---

## 6. Wireframe — `/offres`

```
╔══ PROTECTED SHELL ═════════════════════════╗
║ h1 "Offres" meta "12 offres ouvertes"      ║
║ [Tous|Stage|Alternance|Emploi] [🔍 q...]   ║
║                    [+ Publier une offre gold] ← SEUL si alumni|admin
╠ GRID sm:2 lg:3 CARTES (stagger+hoverLift) ══
║ ┌CarteOffre──────────────────────┐          ║
║ │ chip TYPE (stage=info/alt=gold/emploi=success) │
║ │ Titre bold                     │          ║
║ │ Entreprise · Lieu/distanciel   │          ║
║ │ [Avatar xs] Prénom NOM · Promo 26 │       ║
║ │ date limite si proche: chip or « Avant le 30 sept» │
║ │ [Détail ghost]                 │          ║
║ └────────────────────────────────┘          ║
║ PAGINATION · EmptyState Briefcase « Aucune  ║
║ offre — reviens bientôt »(+ CTA si auteur)  ║
╚══════════════════════════════════════════════╝
```

### DetailOffreModal
Blocs : chips (type, lieu), titre h2, entreprise · publiée le {date fr} par {auteur+promo}, description longue (whitespace-pre-line), encart CONTACT panel crème-alt : [Contacter par email primary] + [Copier l'email ghost-xs], [lien Externe secondary si présent], menu ⋯ Signaler. Footer auteur : [Marquer pourvue][Fermer][Modifier] quand `moi`.

### ComposeurOffreModal (création/édition)
Champs zod live : Type segmented obligatoire | Titre | Entreprise | Lieu (input + toggle distanciel) | Description textarea compteur 50–2000 | Date limite optionnelle (min aujourd'hui) | Lien externe validé https. Submit loading → toast → invalide ["offres"].

---

## 7. Animations contractuelles

- Cartes stagger + hoverLift standard ; changements de filtre : AnimatePresence popLayout
- Modal détail/composeur : habillage MUI Dialog tokens doc 03 (scale/fade 180ms)
- Chip « Avant le {date} » ≤7 jours : pulseGentle léger urgence douce
- Passage pourvue : recoloration animée du bandeau + compteur du panel Mes offres synchronisé

## 8. Accessibilité

- Mailto : aria-label explicite « Contacter {prenom} à propos de {titre} »
- Segmented type : radiogroup clavier
- Dates limites : format long français + aria ordinateur-lisible ISO caché
- Panel Mes offres : `aria-live="polite"` sur changement de statut

## 9. Critères d'acceptation

1. Étudiant : aucun bouton publier au DOM ; POST direct → 403 géré gracieusement (toast).
2. Alumnus candidature ouverte : visible annuaire standard avec chip promo PARTOUT (carte, fiche, suggestion).
3. Limite 5 offres ouvertes atteinte : composeur bloqué avec message chiffré (pas d'erreur muette).
4. Le champ lieu et le toggle distanciel sont mutuellement cohérents (jamais deux valeurs contradictoires envoyées).
5. Date limite passée : offre toujours listée mais chip expirée muted, tri naturel vers la fin.
6. Offre masquée par modération → panneau « retirée en attente » côté public (pattern doc 09 repris).
7. Filtre/search sync URL (?type=&q=) — partage de résultat possible.
8. Checklist design-system doc 03 §11 complète.

## 10. Frontières

- Matching automatique offres ↔ filières/attentes : V2 (données déjà là)
- Candidatures plateforme (CV, suivi dossier) : hors scope V1 assumé
- Page/directory alumni paginée (« trombinoscope promotions ») : V2
