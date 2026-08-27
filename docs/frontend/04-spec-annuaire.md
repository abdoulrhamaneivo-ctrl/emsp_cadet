# EMSP Connect v2 — Spec page ANNUAIRE
## Doc 04 — Annuaire des Aînés + fiche détaillée

> **Prérequis de lecture** : `02-perimetre-fonctionnel.md` (RG1/RG2/RG3, entités) et `03-design-system.md` (tokens, composants).
> Fonctionnalité cahier §3.2 — Phase produit 1. Feature dir : `src/features/annuaire/`

---

## 1. Objectif

Permettre à un Cadet de trouver son futur Aîné : liste filtrable des Aînés disponibles (RG3), suggestion automatique pertinente en tête (§3.2), fiche détaillée pour décider. C'est la porte d'entrée de tout le parcours parrainage.

**Users stories :**
- En tant que Cadet, je vois les Aînés disponibles filtrés par filière/classe/mot-clé pour choisir celui qui me correspond.
- En tant que Cadet, je vois en tête une suggestion automatique d'Aînés de ma filière ou aux intérêts proches des miens.
- En tant que Cadet, je consulte la fiche complète d'un Aîné (ambitions, projets, points forts/faibles, badges, score fiabilité) avant de demander.
- En tant que visiteur connecté Aîné/Admin, j'accède aux mêmes fiches en lecture (sans CTA de demande).

---

## 2. Données & API contractuelle

Endpoints consommés (à mocker tant que backend absent) :

```
GET /api/parrains/?filiere=&classe=&q=&page=&inclureComplets=false
  → { count, results: ProfilAine[] }
    // éligibilité annuaire v2 (toutes cumulatives) :
    //   candidatureAineOuverte===true (RG8) ET niveauEtude ∈ {L2,L3,M1,M2,alumni} (RG7+RG10+RG15 — un L1 n'apparaît JAMAIS)
    //   ET nbCadetsActifs < 5 (RG3)
GET /api/parrains/suggestions/
  → { results: ProfilAine[] }             // max 3, même filière / intérêts proches
GET /api/parrains/:id/
  → { ...ProfilAine, badges[], scoreFiabilite, nbAvis }
POST /api/parrains/:id/demande/           // body: { message? }
  → 201 DemandeParrainage | 409 (RG1 déjà engagé) | 409 (complet RG3 course)
GET /api/me/parrainage/                   // état du cadet: binôme actif? demande en attente?
```

Clés TanStack Query : `["parrains", filtres]`, `["parrain", id]`, `["suggestions"]`, `["mon-parrainage"]`.

---

## 3. Structure de fichiers à produire

```
src/features/annuaire/
├── pages/
│   ├── AnnuairePage.jsx          # route /annuaire
│   └── FicheAinePage.jsx         # route /annuaire/:parrainId
├── components/
│   ├── BarreFiltres.jsx          # recherche + selects filière/classe + toggle RG3
│   ├── CarteAine.jsx             # carte profil dans la grille
│   ├── BandeauSuggestions.jsx    # carrousel/horizontal scroll des suggestions auto
│   ├── FicheHeader.jsx           # bannière identité (photo XL, rôle, filière, score)
│   ├── BlocPointsFaiblesFaibles.jsx # ambitions/projets/forces/faiblesses (4 blocs)
│   └── EncartDemandeCta.jsx      # panneau latéralsticky avec CTA + états RG
├── hooks/
│   ├── useParrains.js            # useQuery paginée + filters state sync URL (?filiere=..)
├── schemas.js                    # zod pour validation recherche éventuelle
└── rules.js                      # canRequest(aine, monParrainage) → {ok, raison}
```

---

## 4. Wireframe texte — `/annuaire`

```
╔═══════════════════════ PROTECTED SHELL (sidebar) ═══════════════════╗
║ HEADER PAGE (panel opaque, sticky)                                  ║
║  h1 "Annuaire des Aînés"          compteur meta "34 Aînés dispo"   ║
║  sous-titre muted                  [toggle inclure complets RG3]   ║
╠═════════════════════════════════════════════════════════════════════╣
║ [SI cadet SANS binôme actif]                                        ║
║ BANDEAU SUGGESTIONS (panel crème-alt, radius-panel, kente-band top) ║
║  label or uppercase "SUGGÉRÉS POUR TOI · même filière/intérêts"     ║
║  ← cards horizontales scrollables (CarteAine compactes, 280px) →   ║
║  note muted: "Basé sur ta filière et tes attentes (§ suggestion)"  ║
╠══════════════════════════════
║ BARRE FILTRES (panel opaque sticky under header, grid responsive)  ║
║  [🔍 Recherche mots-clés............] [Filière ▾] [Classe ▾]      ║
║  chips actifs affichés sous la barre ✕ cliquable                   ║
╠═════════════════════════════════════════════════════════════════════╣
║ GRILLE RÉSULTATS grid gap-4 sm:grid-cols-2 lg:grid-cols-3          ║
║  ┌───────────┐ ┌───────────┐ ┌───────────┐                          ║
║  │CarteAine  │ │CarteAine  │ │CarteAine  │   × N (staggerItem)     ║
║  └───────────┘ └───────────┘ └───────────┘                          ║
║  PAGINATION footer panel                                            ║
╚════════════════════════════════════════════════════
```

### CarteAine — anatomy (hauteur ~ 210px)
```
┌────────────────────────────────────┐
│ [Avatar lg]  Prénom NOM   ★ 4.6(12)│  ← ScoreFiabilite component
│              Filière · Classe      │
│────────────────────────────────────│
│ "Devenir ingré réseau et..."       │  ← ambition tronquée 2 lignes
│                                    │
│ [points forts chips ×3] [+2]       │  ← max 3 chips + compteur
│────────────────────────────────────│
│ JaugeCapacite █████░░ 3/5   Voir → │  ← RG2 obligatoire
└────────────────────────────────────┘
interactive: motion hoverLift, click → /annuaire/:id
```

### Comportements clés
| Situation | Comportement |
|---|---|
| Cadet déjà engagé (RG1) | Bandeau suggestions remplacé par encart vert « Tu es accompagné(e) » lien /mon-parrainage ; grille reste consultable |
| Toggle « Inclure complets » ON | Cartes complètes grisées bordure dashed + Chip gold « COMPLET 5/5 », non cliquables CTA mais fiche visible |
| Profil alumni | StatutChip « ALUMNI · Promo {anneePromotion} » (or sombre) sur carte + fiche + raison suggestion enrichie « expérience professionnelle » |
| Recherche sans résultat | EmptyState icon SearchX « Aucun Aîné ne correspond » + bouton « Réinitialiser les filtres » |
| Erreur réseau | Panneau erreur + Réessayer (refetch) |
| Loading | skeletonCard ×9 en grille |

**URL sync** : filtres reflétés `?q=&filiere=&classe=&page=` (useSearchParams) — back/forward navigateur fonctionnels, partage d'URL possible.

---

## 5. Wireframe texte — `/annuaire/:parrainId`

```
╔══ PROTECTED SHELL ══════════════════════════════════════════════════╗
║ ← Retour annuaire (lien breadcrumb ghost)                           ║
╠═════════════════════════════════════════════════════════════════════╣
║ GRID lg:grid-cols-[1fr_360px] gap-8                                 ║
║ ┌── COLONNE PRINCIPALE ────────────┐ ┌── COLONNE STICKY (lg) ─────┐ ║
║ │ FICHEHEADER (panel vert profond) │ │ ENCARDEMANDECTA (opaque)   │ ║
║ │  photo xl + nom h1 + chips filière│ │  JaugeCapacite n/5        │ ║
║ │  classe · score fiabilité ★      │ │  ScoreFiabilite détail    │ ║
║ │  Badges row (chips or)           │ │  ÉTAT selon rules():      │ ║
║ ├──────────────────────────────────┤ │   • ok → Button primary   │ ║
║ │ BLOC AMBITIONS (panel crème-alt) │ │     "Demander ce parrain" │ ║
║ │  liste à puces ✦                 │ │   • deja_engage RG1 →     │ ║
║ ├──────────────────────────────────┤ │     encart renvoi         │ ║
║ │ BLOC PROJETS                     │ │   • plein RG3 → chip +    │ ║
║ │  timeline simple / cartes minis  │ │     texte « complet »     │ ║
║ ├──────────────────────────────────┤ │   • attente en cours →    │ ║
║ │ POINTS FORTS (chips success)     │ │     Chip "Demande envoyée"+│║
║ ├──────────────────────────────────┤ │     bouton annuler        │ ║
║ │ POINTS FAIBLES (muted, humilité) │ │  Note: "Réponse généralement│║
║ ├──────────────────────────────────┤ │  sous quelques jours"     │ ║
║ │ (fade in stagger section)        │ └───────────────────────────┘ ║
║ └──────────────────────────────────┘                               ║
╚═════════════════════════════════════════════════════════════════════╝
```

### Flux demande (modale de confirmation)
1. Clic « Demander ce parrain » → Modal title `Demander {prenom} comme Aîné ?`
   - corps : rappel RG1 (« Tu ne peux avoir qu'un seul Aîné actif. Ta demande sera visible... jusqu'à acceptation/refus »), textarea message optionnel (max 300 chars, compteur)
   - actions : [Annuler ghost] [Envoyer la demande primary loading]
2. Succès → toast succès + invalidation ["mon-parrainage"],["demande"] + redirect `/mes-demandes`
3. 409 RG1 → modale explicative + lien mon-parrainage
4. Édition message : confirmDialog « Annuler ma demande ? » → mutation DELETE `/api/demandes/:id/`

### États page fiche
| État | Rendu |
|---|---|
| Loading | Skeletons header + blocs (forme réelle) |
| 404 | EmptyState « Cet Aîné n'existe plus ou est complet » + retour |
| Complet (RG3 visible via toggle ou lien direct) | Header normal + Encart grisée chip « Complet — revient dès qu'une place se libère » |

---

## 6. Animations contractuelles

- Entrée page : `pageTransition` sur `<motion.main>`
- Bandeau suggestions : entrée staggerItem, cards scroll horizontal avec snap + flèches Desktop
- Grille résultats : staggerContainer/staggerItem au premier rendu ET sur changement de page (AnimatePresence mode="popLayout")
- Cartes : hoverLift
- Modale : scale/fade via ConfirmDialog standard
- Scroll reveal blocs fiche : whileInView once
- Reduced-motion : fade 120ms partout

---

## 7. Accessibilité

- Barre filtres : `<form role="search">`, labels réels sur inputs/selects, chips actifs sont des buttons avec aria-label « Retirer le filtre X »
- Suggestions : région `aria-label="Suggestions personnalisées"`
- Grille cartes = `<ul>` de `<li><article>` ; carte entière navigable clavier (focus ring, Enter)
- JaugeCapacite : `role="img" aria-label="Capacité 3 sur 5"` 
- ScoreFiabilite : `aria-label="Note moyenne 4,6 sur 5, 12 avis"`

---

## 8. Critères d'acceptation (revue)

1. Un cadet voit EXACTEMENT un des trois CTA-states (ok / engagé RG1 / attente) — jamais deux.
2. Un Aîné à 5/5 n'apparaît PAS par défaut (vérifier appel API `inclureComplets=false`).
3. Les filtres sont synchronisés à l'URL et survivent à un refresh.
4. La suggestion automatique s'affiche uniquement si ≥1 résultat et cadet libre.
5. Chaque carte affiche jauge capacité + score fiabilité quand nbAvis > 0.
6. Toutes les cases de la checklist design-system (doc 03 §11) passent.
7. Recherche debounced 400ms minimum (pas de requête par frappe).
8. Mobile 375px : barre filtres repliable (accordéon), grille 1 colonne, pas d'overflow.

---

## 9. EXTENSION IA — Matching enrichi (IA-2, doc 17 ; s'active en T6)

Prévu dès maintenant dans la structure, pour ne pas retoucher la page plus tard :
- `GET /api/parrains/suggestions/` gagne un champ optionnel `raisonIA: string|null` par résultat (ex. « Proche de tes attentes : bases de données et réseaux »).
- BandeauSuggestions : si `raisonIA` présent → ChipIA (Sparkles, tone info) sous la carte + la raison en une ligne muted. Absent → rendu actuel inchangé.
- Toggle consentement : si `me.preferencesIA.matchingEnrichi===false` → requête envoyée sans le flag IA (l'endpoint retombe sur le matching filière/centres d'intérêt §3.2 du cahier).
- Le frontend ne CALCULE jamais la similarité : il affiche la raison reçue. Skeleton pendant recalcul.

## 10. Frontières de cette spec (ne PAS faire ici)

- Messagerie (Doc séparée, phase 2)
- Contenu admin des fiches
- CRUD profil aîné (c'est /profil, feature profil)
- Le vrai scoring (backend). Le front affiche `scoreFiabilite` reçu.
