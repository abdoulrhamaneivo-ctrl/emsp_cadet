# UI/UX — Ainé & Cadet (Django + Editorial)

> Charte formulaires, animations et breakpoints — juin 2026

---

## Principes

1. **Centrage** — contenu formulaire dans `#main .inner`, max-width 640 px (`ac-form-section`)
2. **Pas de débordement** — `overflow-x: hidden` sur `body.aine-cadet-app` et `#wrapper`
3. **Mobile-first** — champs `font-size: 16px` ≤480 px (évite le zoom iOS)
4. **Terminologie** — **Ainé** / **Cadet** partout dans l'UI
5. **Accessibilité motion** — `@media (prefers-reduced-motion: reduce)` désactive animations

---

## Fichiers CSS

| Fichier | Rôle |
|---------|------|
| `css/main.css` | Template Editorial (HTML5 UP) |
| `css/emsp-custom.css` | Charte EMSP (vert, jaune, bleu) |
| `css/aine-cadet.css` | Composants app (cartes, chat, tableaux) |
| `css/aine-cadet-forms.css` | Formulaires centrés, selects, radios, overflow |
| `css/ac-carousel.css` | Carousel scroll-snap (vitrine + dashboards) |
| `css/ac-dashboard.css` | Onglets, états vides, graphiques, cartes rôle |

---

## Configuration URL Django (vitrine)

Fichier : `html5up-editorial/assets/js/emsp-config.js`

Priorité de résolution de `aineCadetBase` :

1. `<meta name="emsp-aine-cadet-url" content="…">` dans le `<head>` de la page
2. `window.EMSPCONFIG.aineCadetBase` injecté **avant** le script config
3. Hostname local → `http://127.0.0.1:8000`
4. Production → `window.location.origin`

Variables Django : `AINE_CADET_PUBLIC_URL` dans `.env` (documentation app).

`emsp-init.js` applique les routes aux classes `.emsp-student-link`, `.emsp-social-linkedin`, `.emsp-social-youtube`, `.emsp-concours-form-link`.

---

## Carousel (`.ac-carousel`)

| Fichier | Rôle |
|---------|------|
| `assets/js/ac-carousel.js` | Flèches, dots, pause au survol, auto-scroll |
| `assets/css/ac-carousel.css` | scroll-snap, contrôles |

- `prefers-reduced-motion: reduce` → pas d'auto-scroll
- Utilisé : `index.html` (formations), `mediatheque.html`, dashboards si >3 événements

---

## Onglets dashboard (`.ac-tabs`)

| Fichier | Rôle |
|---------|------|
| `assets/js/ac-tabs.js` | Navigation `[data-ac-tabs]` / `[data-ac-tab]` |

Dashboards Ainé et Cadet : Vue d'ensemble, binôme, RDV, événements, badges/demandes.

---

## Graphiques (Chart.js CDN)

Couleurs EMSP : `#147c71`, `#ef9c00`, `#264719`.

| Dashboard | Graphiques |
|-----------|------------|
| Admin | Parrainages actifs par filière, évolution mensuelle, inscriptions concours |
| Concours admin | Barres par filière (1er choix) |
| Ainé | Stats inline (Cadets, RDV, fiabilité, messages) |
| Cadet | Stats inline (Ainé actif, demandes, RDV, messages) |

---

## Build sidebar vitrine

Partial unique : `html5up-editorial/partials/sidebar.html`

```powershell
python scripts/build-vitrine.py
```

Injecte la sidebar dans les 8 pages actives via marqueurs `<!-- SIDEBAR -->` … `<!-- /SIDEBAR -->`.

---

## Formulaires Django

### Classes HTML

| Classe | Usage |
|--------|--------|
| `.ac-form-section` | Conteneur centré (640 px) |
| `.ac-form-section--wide` | Formulaires longs (780 px) |
| `.ac-form` | Balise `<form>` |
| `.ac-input` | Inputs texte, email, password, number |
| `.ac-select` | Listes déroulantes |
| `.ac-radio-group` | Choix rôle Cadet / Ainé |
| `.ac-textarea-sm` / `.ac-textarea-md` | Textareas dimensionnées |

### Champs métier

| Champ | Widget | Choix |
|-------|--------|-------|
| `role` | `RadioSelect` (`.ac-role-cards`) | Cadet / Ainé |
| `classe` | `Select` | L1, L2, L3, M1, M2, Licence 1–3, Master 1–2 |
| `filiere` | `Select` | FS MENUM, FSP, RegNUM, Autre |
| `attentes` | `Textarea` | Optionnel, taille contrôlée |

Choix centralisés dans `apps/accounts/choices.py`.

### Partial template

`templates/partials/_form_fields.html` — rendu uniforme (label au-dessus, erreurs, help_text).

---

## Animations

| Effet | Implémentation |
|-------|----------------|
| Sections au chargement | `.ac-animate-in` + `@keyframes ac-fade-in-up` |
| Bulles chat | `@keyframes ac-chat-appear` sur `.ac-chat-bubble` |
| Hover boutons | `transform: translateY(-1px)` + transition CSS |
| Script léger | `static/js/aine-cadet-motion.js` (ajoute classes à `#main section`) |

Pas de GSAP ni librairie lourde.

---

## Breakpoints Editorial

| Largeur | Comportement |
|---------|--------------|
| ≤1280 px | Sidebar masquée / toggle Editorial natif |
| ≤736 px | Champs `.half` passent en pleine largeur |
| ≤480 px | Padding formulaire réduit, inputs 16 px |

---

## Layout Editorial Django

```
#wrapper
├── #main > .inner     ← contenu centré, sections animées
└── #sidebar > .inner  ← logo aine-cadet-logo.svg, menu, footer
```

Tous les templates étendent `base.html` qui charge les 4 feuilles CSS + motion JS.

---

## Vitrine ↔ App

| Service | URL dev |
|---------|---------|
| Vitrine statique | http://localhost:8080/index.html |
| Ainé & Cadet | http://127.0.0.1:8000/ |

Lien « Espace Étudiant » : `emsp-config.js` (URL configurable, voir section Configuration URL).

Build sidebar : `python scripts/build-vitrine.py`

Démarrage conjoint : `.\scripts\dev.ps1`

---

## Checklist revue UI

- [x] Formulaire inscription centré, radios rôle visibles (cartes Cadet/Aîné)
- [x] Classe / filière en `<select>`
- [x] Mot de passe oublié sur page connexion
- [x] Validation email @emsp.int en direct
- [x] Indicateur force mot de passe
- [x] Toasts auto-fermants (flash Django)
- [x] Skip link + retour haut
- [x] Polling messagerie 12 s
- [x] Compteur caractères message
- [ ] Test scroll horizontal mobile (validation manuelle)
