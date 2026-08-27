# EMSP Connect v2 — Spec RETOURS D'EXPÉRIENCE & BADGES
## Doc 07 — Avis et score de fiabilité (§3.6) + badges de reconnaissance (§3.8)

> Prérequis : docs 02 (entités `Avis`, `BadgeCatalogue`, RG6), 03, 04, 05. Features : `src/features/retours/` + composants intégrés sur `/profil` et fiches annuaire.
> Aucune route dédiée : ces fonctionnalités vivent ENTIÈREMENT en composants intégrés.

---

## 1. Objectif

Boucle qualité du dispositif :
- **Avis** : à la fin d'un parrainage, le cadet note l'expérience (1–5 + commentaire) ; la moyenne alimente le score de fiabilité visible publiquement sur le profil de l'Aîné.
- **Badges** : récompenses automatiques de l'engagement Aîné, affichées sur profil public.

**Users stories :**
- Cadet finissant un binôme : je suis guidé vers le formulaire d'avis dès la clôture (RG6).
- Visiteur/cadet de l'annuaire : je vois le score fiabilité + les badges de chaque Aîné pour choisir en confiance.
- Aîné : je vois mes badges gagnés ET les prochains à débloquer (motivation).
- Admin : je repère les binômes en difficulté via les notes basses (aperçu, pas d'écran dédié ici).

---

## 2. Données & API

```
POST /api/parrainages/:id/avis/     // body {note:1..5, commentaire} → 201 | 409 déjà noté
GET  /api/parrains/:id/avis/?page=  // liste publique paginée (lecture seule)
GET  /api/me/badges/                // {obtenus: Badge[], enCours: {code, progression:0..1}[]}
```
Types doc 02 §5. Règles bloquantes :
- UN SEUL avis par parrainage, par le cadet uniquement (409 côté API — front masque déjà le CTA si `avisDonne===true`).
- `note` entier 1..5 ; `commentaire` 20–600 chars (zod, compteur live).
- Le score affiché (`scoreFiabilite`, `nbAvis`) est TOUJOURS celui reçu du backend — jamais recalculé localement.

Clés query : `["avis", parrainId]`, `["me-badges"]`. Mutation avis invalide `["parrain", id]`, `["mon-parrainage"]`.

---

## 3. Structure fichiers

```
src/features/retours/
├── pages/FicheAinePage-AvisSection.jsx   # non-route : section importée par annuaire (doc 04)
├── components/
│   ├── ModaleDonnerAvis.jsx              # flux RG6 (déclenchée depuis clôture /mon-parrainage)
│   ├── SectionAvisParrain.jsx            # liste publique des avis d'un Aîné (sur fiche)
│   ├── CarteAvis.jsx                     # un avis : étoiles + citation + auteur + date
│   └── FormSignalerAvis.jsx              # petit menu « Signaler » (→ modération phase 3)
└── schemas.js                            // zod note/commentaire

src/shared/components/BadgeVitrine.jsx    # chip badge universel (profil + fiche)
src/shared/components/BandeauBadges.jsx   # rangée horizontale scrollable badges
```

---

## 4. Flux principal — ModaleDonnerAvis (RG6)

Déclencheurs (les deux) :
1. Clôture d'un parrainage (doc 05) quand réponse contient `avisRequis:true` → ouverture immédiate.
2. Bandeau relance persistant `/mon-parrainage` sur binôme clos sans avis (« Ton avis compte » or) → clic ouvre la même modale.

```
┌─ MODALE ────────────────────────────────────────┐
│ h2 "Ton expérience avec {Prénom NOM}"           │
│ p muted : "Ton avis aide les futurs cadets et   │
│ l'école à repérer les accompagnements qui marchent." │
│ ★★★★★  SELECTEUR GRAND (32px, hover fill animé, │
│         keyboard ←→ navigable, aria slider)     │
│ labels : 1 Décevant · 2 Moyen · 3 Bien ·        │
│          4 Très bien · 5 Excellent (or)         │
│ textarea "Raconte ton parcours (min 20 car.)"   │
│ [compteur 0/600 live]                           │
│ NOTE ANONYMAT visible : "Le prénom de ton       │
│ binôme voit ton prénom; l'école voit tout."     │
│            [Plus tard ghost] [Envoyer mon avis primary loading] │
└──────────────────────────────────────────────────┘
```
Succès → toast + confettis discrets (scale pop or) + Section marquée « Avis donné ✓ » dans l'historique. « Plus tard » refermable max 1 fois puis relance au prochain login (compteur local + refetch).

### Édition ? NON — un avis envoyé est définitif pour l'utilisateur (intègrité), signalable aux admins.

---

## 5. Sections publiques — fiche Aîné (`/annuaire/:id`)

Sous les blocs points forts/faibles (doc 04), ajouter :

```
╠ SECTION AVIS (panel crème-alt whileInView) ═══════════
║ h2 "Retours d'expérience" + ScoreFiabilite XL résumé  ║
║    ★4.6 (12 avis) barre distribution 5→1 (mini bars)  ║
║ ┌CarteAvis─────────┐ ┌CarteAvis─────────┐            ║
║ │★★★★★ or          │ │★★★☆☆             │            ║
║ │« Elle m'a aidé…» │ │« Bon suivi mais…»│            ║
║ │— Jean, L1 · mai26│ │— Sarah, L2·juin26│            ║
║ │[Signaler ⋯menu]  │ │                  │            ║
║ └──────────────────┘ └──────────────────┘            ║
║ PAGINATION douce (charger plus)                       ║
╚═══════════════════════════════════════════════════════╝
```
Distribution : largeur de barre ∝ proportion, couleur accent-green sauf note 1–2 en danger doux.

## 6. Badges (§3.8) — affichages

Catalogue initial (backend attribue automatiquement, front n'invente RIEN) :
| code | libellé | critère | visuel |
|---|---|---|---|
| premier_parrainage | Premier engagement | 1er binôme accepté | icône Sprout |
| cinq_cadets | Main pleine | 5 cadets accompagnés simultanément | Users icon |
| evenement_organise | Bâtisseur | 1 événement collectif créé | CalendarPlus |

Trois emplacements obligatoires :
1. **FicheHeader** (doc 04) : rangée chips orBadge (BadgeVitrine ton gold outline, icône+libellé).
2. **/profil Aîné** : BandeauBadges complet OBTENUS plein or + À DÉBLOQUER grisés avec progression (anneau ou jauge %) sous chaque badge verrouillé — motivation transparente.
3. **CarteAine grille annuaire** : micro-row icônes seules avec tooltip (densité préservée).

Affichage conditionnel : cadets/admin voient seulement les obtenus (pas la section progression).

---

## 7. Animations

- Sélecteur étoiles : spring scale au hover/pop à la sélection (layout animation)
- Apparition cartes avis : staggerItem
- Badge nouveau obtenu : première visite après obtention → pulseGentle + liseré or (flag `nouveau` backend sinon local storage)
- Barres distribution : scaleX animées inView

## 8. Accessibilité

- Groupe étoiles = radiogroup réel (`role="radiogroup"` + radios étiquetés)
- CarteAvis : blockquote+figcaption sémantiques
- Signaler : aria-haspopup, confirmation avant envoi
- Contraste or/creème vérifié AA sur texte 12px minimum bold

## 9. Critères d'acceptation

1. Impossible d'accéder au formulaire d'avis hors contexte RG6 (binôme terminé soi-même).
2. Après envoi, bandeau relance disparaît immédiatement (invalidation) — jamais de double avis possible même via reload (409 intercepté proprement).
3. Score fiabilité fiche = données brutes backend ; nbAvis=0 ⇒ « Pas encore noté » discret, PAS zéro étoile trompeur.
4. Les badges s'affichent identiquement (code visuel) sur fiche/profil/cartes.
5. Un avis signalé disparaît du flux public jusqu'à revue admin ? NON : reste affiché flaggué côté admin only (décision produit — contenus publics assumés).
6. Checklist design-system complète doc 03 §11.
