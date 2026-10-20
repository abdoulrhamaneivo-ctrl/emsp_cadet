# EMSP Connect v2 — Spec PROFIL (v2 casquettes)
## Doc 11 — Profil, niveau, candidature Aîné, suppression compte (RG5/RG7/RG8)

> Prérequis : docs 02 (User v2, RG4/RG5/RG7/RG8), 03, 07 (badges). Feature dir : `src/features/profil/`

---

## 1. Objectif

Le profil EST la vitrine ET le centre de contrôle des casquettes :
- identité + niveau d'étude (détermine LE droit d'être Aîné : RG7),
- **candidature Aîné ouverte/fermée** — le grand interrupteur de visibilité (RG8),
- vitrine Aîné (ambitions/projets/forces/faiblesses),
- badges + score fiabilité (doc 07),
- suppression de compte self-serve (cahier §6).

**Users stories :**
- Je modifie mes informations (identité, classe, FILIÈRE, photo, attentes, niveau).
- En L2+, j'OUVRE ou je FERME ma candidature d'Aîné avec la compréhension claire de l'effet.
- En L1, je vois que la candidature me sera accessible en L2 (pas une punition — un parcours).
- En tant qu'Aîné, je maintiens ma vitrine qui conditionne mon apparition dans l'annuaire.
- Je peux supprimer mon compte définitivement.

---

## 2. Données & API

```
GET   /api/me/                    → User v2 { ..., niveauEtude:"L1|L2|L3",
                                         candidatureAineOuverte:boolean, isAdmin:boolean }
PATCH /api/me/                    // champs autorisés; candidatureAineOuverte REFUSÉ si niveau==="L1"
POST  /api/me/photo/              // multipart → {photoUrl}
DELETE /api/me/compte/            // body {confirmationPrenom}
GET   /api/me/visibilite-annuaire/ // {visible:boolean, motifs:string[]}
```

Règles hard :
1. **RG5** : pas de changement de rôle depuis cette page ; `isAdmin` n'apparaît même pas ici (form ro ignoré).
2. **RG4** : l'adresse e-mail du compte est en lecture seule après l'inscription ; le domaine n'est pas restreint.
3. **RG7/RG10** : `PATCH candidatureAineOuverte:true` avec `niveauEtude:"L1"` → 403. L'UI le bloque AVANT (toggle disabled). Éligibles : L2, L3, M1, M2 ET alumni (le diplômé reste un devancier naturel).
4. **RG8** : fermer la candidature ≠ casser les binômes : les cadets actifs restent accompagnés, l'Aîné disparaît seulement de l'annuaire et ne reçoit plus de nouvelles demandes (message explicite dans la modale de bascule).
5. **RG7bis (promotion)** : changer `niveauEtude` L1→L2 ouvre la POSSIBILITÉ ; l'app propose ensuite (toast action) d'ouvrir la candidature — jamais d'ouverture automatique.
6. Photo jpg/png/webp ≤5MB, crop carré 400×400 avant upload.
7. Visibilité annuaire = cumul de conditions (renvoyées par l'API, affichées une à une) :
   - candidature ouverte
   - photo présente
   - ambitions ≥3, projets ≥1, pointsForts ≥2, pointsFaibles ≥1
8. Suppression compte : double-step (confirmer par prénom), anonymisation des avis publiés expliquée avant accord.

Clés query : `["me"]` — invalidation globale après PATCH.

---

## 3. Structure fichiers

```
src/features/profil/
├── pages/ProfilePage.jsx
├── components/
│   ├── SectionIdentite.jsx           # photo crop + identité + EMAIL ro-pattern suffixe
│   ├── SectionAcademique.jsx         # classe, filière, NIVEAU select, attentes (+ chip alumni RO si basculé, RG10)
│   ├── SectionCandidatureAine.jsx    # LE toggle RG8 (Switch) — éligible L2/L3/alumni (RG10), état L1 disabled
│   ├── SectionVitrineAine.jsx        # CRUD listes ambitions/projets/forces/faibles
│   ├── PipelineCompletude.jsx        # checklist conditions visibilité (inclut candidature)
│   ├── SectionBadges.vue→BadgeBandeau.jsx
│   ├── PreviewPublique.jsx
│   └── ZoneDanger.jsx                # suppression compte collapsée
├── hooks/useMe.js
└── schemas.js
```

---

## 4. Wireframe — `/profil`

```
╔══ PROTECTED SHELL ═════════════════════════════╗
║ h1 "Mon profil"     [Preview publique toggle] ║
╠ SECTION IDENTITE (panel opaque) ═══════════════
║ [Avatar XL camera-badge] Prénom NOM · email   ║
║ adresse e-mail (lecture seule, icon Lock)    ║
╠ SECTION ACADEMIQUE ════════════════════════════
║ Classe select | Filière select                ║
│ NIVEAU select L1/L2/L3/M1/M2 (hint « Tu      ║
║   changeras en début d'année suivante »)      ║
║ [L3/M2 SEUL] « Mon année prochaine » radio    ║
║   Master/Alumni/Indécis (déclaratif doc 15)   ║
║ Attentes textarea (visible par tes futurs    ║
║   Aînés)                                      ║
╠ SECTION CANDIDATURE AINÉ (panel gold-border) ══
║ Switch XL                                     ║
║  • OFF (tout monde) : « Tu n'apparais pas    ║
║    dans l'annuaire des Aînés »                ║
║  • ON  : « Ton profil attire des cadets.     ║
║    Quota : 5 places. » + sous-texte RG8       ║
║  • L1 : Switch disabled + texte doux « En    ║
║    L2, ce sera ton tour d'aider les nouveaux» ║
╠ SECTION VITRINE (aîné potentiel : visible    ║
║   même candidature fermée — prépare l'avenir) ║
╠ PIPELINE COMPLETUDE (si motifs manquants) ════
║ checklist : ✓ candidature ✗ photo ✗ ambition  ║
║ phrase impact : « Tant que ces points sont   ║
║ incomplets, tu restes invisible de l'annuaire.»║
╠ BADGES (doc 07) | ZONE DANGER (collapsé) ═════
╚═══════════════════════════════════════════════╝
```

MODALE de bascule candidature (à l'activation OU désactivation) :
- Activation ON : « Confirmer l'ouverture ? Ton profil deviendra visible dès qu'il est complet. Tu pourras recevoir jusqu'à 5 cadets. »
- Désactivation OFF : « Tes X cadets actifs restent accompagnés. Tu disparais simplement de l'annuaire et ne reçois plus de nouvelles demandes. » (chiffres dynamiques)

---

## 5. Comportements clés

| Situation | Comportement |
|---|---|
| Sauvegarde | Bouton « Enregistrer » sticky footer quand form dirty — jamais d'autosave |
| Quitter sans sauvegarder | ConfirmDialog bloquant |
| Promotion L1→L2 validée | Toast avec ACTION « Ta candidature est maintenant disponible — l'ouvrir ? » → toggle pré-focus |
| Toggle candidature OFF alors que des binômes actifs existent | Modale détaillée (pas de surprise) + invalidations `["mon-parrainage"],["parrains"],["demandes"]` |
| Item vitrine vide soumis | Ignoré + toast info discret |

---

## 6. Animations contractuelles

- Preview publique : crossfade layoutId partagé (mêmes composants que la vraie fiche)
- Pipeline : check morph cochage stagger
- Toggle candidature : spring switch + flash bord or du panel sur confirmation
- Toast promotion : slide-in bottom avec bouton action

## 7. Accessibilité

- Switch = `role="switch"` + aria-checked + libellé complet ; état disabled expliqué par texte adjacent (pas juste gris muet)
- Select niveau avec description option par option (aria-describedby)
- Zone danger heading sr-only, aucune action sans double confirmation focus-trap

## 8. Critères d'acceptation

1. L1 : le toggle candidature est physiquement disabled (attribut réel) ET un POST direct reçoit 403 géré proprement.
2. Le passage L2 (select + save) déclenche le toast-action d'ouverture — jamais d'auto-ouverture.
3. Fermer la candidature laisse les cadets actifs INTACTS dans /mon-parrainage (test visuel après reload).
4. La visibilité annuaire reflète EXACTEMENT les motifs API (checklist 1:1), candidature comprise en tête.
5. Aucun champ rôle/isAdmin exposé (même dans le DOM).
6. Email hors domaine impossible à soumettre (live error zod).
7. Checklist design-system doc 03 §11.

## 9. EXTENSION IA — Copilot de rédaction (IA-3, doc 17 ; s'active en T6)

- Sur les textareas attentes (cadet) et ambitions/projets (aîné) : bouton ghost-xs « M'aider à rédiger » (icône Sparkles) SI `me.preferencesIA.copilot===true` (sinon absent, jamais grisé).
- Clic → PanneauSuggestionsIA (3 propositions courtes) → insertion = clic utilisateur explicite ; les propositions s'ajoutent, ne remplacent pas.
- Consentement : le bouton absent est l'occasion, au premier usage du profil, d'un hint discret « L'assistant IA peut t'aider — activer dans Mes préférences » (lien ancre section préférences).
- Échec service → dégradation silencieuse (pas de blocage du formulaire, doc 17 §4.3).

## 10. Frontières

- Changement de niveau FORCÉ par admin (erreur de saisie initiale) : doc 12 flux admin, hors cette page
- Réglages notifications granulaires : phase 2+
