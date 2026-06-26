# Analyse du template HTML5 UP Editorial

> Template source : `html5up-editorial/`  
> Licence : CCA 3.0 — [html5up.net/license](https://html5up.net/license)

---

## 1. Présentation

**Editorial** est un template blog/magazine avec :

- Sidebar **verrouillable** (scroll) sur desktop
- Menu **accordéon** avec sous-menus
- Layout **two-column** : contenu principal + sidebar fixe
- Typographie Open Sans + Roboto Slab (Google Fonts via CSS)

Adapté au site EMSP pour une navigation riche sans surcharge visuelle.

---

## 2. Structure HTML (pages EMSP)

```html
<div id="wrapper">
  <div id="main">          <!-- Zone de contenu -->
    <div class="inner">
      <header id="header"> <!-- Logo texte + icônes sociales -->
      <section>...</section> <!-- Sections de contenu -->
    </div>
  </div>
  <div id="sidebar">       <!-- Sidebar fixe -->
    <div class="inner">
      <section id="logo-section">  <!-- Ajout EMSP -->
      <nav id="menu">              <!-- Navigation accordéon -->
      <section>Contact</section>
      <footer id="footer">
    </div>
  </div>
</div>
```

---

## 3. Fichiers du template dans EMSPCONNECT

### Pages HTML

| Fichier | Statut EMSP | Description |
|---------|-------------|-------------|
| `index.html` | ✅ Adapté | Page d'accueil EMSP / FS MENUM |
| `formations-fs-menum.html` | ✅ Créé | Page filière FS MENUM |
| `generic.html` | ⚠️ Non adapté | Template page générique (Lorem ipsum, branding HTML5 UP) |
| `elements.html` | ⚠️ Non adapté | Showcase composants UI (branding HTML5 UP) |

### CSS

| Fichier | Rôle |
|---------|------|
| `assets/css/main.css` | CSS compilé du template (palette EMSP appliquée) |
| `assets/css/emsp-custom.css` | **Surcharges EMSP** — charte, hero, stats, CTA |
| `assets/css/fontawesome-all.min.css` | Icônes Font Awesome |

### SASS (sources)

```
assets/sass/
├── main.scss              # Point d'entrée
├── base/                  # Reset, typography, page
├── components/            # Button, form, posts, table…
├── layout/                # Wrapper, sidebar, menu, banner…
└── libs/
    ├── _vars.scss         # Palette EMSP modifiée
    ├── _breakpoints.scss
    ├── _mixins.scss
    └── ...
```

**Modification dans `_vars.scss` :** palette `$palette` adaptée à la charte EMSP (accent vert `#147c71`, fg-bold `#264719`).

### JavaScript

| Fichier | Rôle |
|---------|------|
| `jquery.min.js` | Dépendance |
| `browser.min.js` | Détection navigateur |
| `breakpoints.min.js` | Media queries JS |
| `util.js` | Utilitaires |
| `main.js` | Sidebar toggle, menu accordéon, preload |

---

## 4. Composants utilisés pour EMSP

### Navigation accordéon

```html
<li>
  <span class="opener">Formations</span>
  <ul>
    <li><a href="#">FSP</a></li>
    <li><a href="formations-fs-menum.html">FS MENUM</a></li>
    ...
  </ul>
</li>
```

Géré par `main.js` — clic sur `.opener` toggle la classe `active`.

### Sections Editorial réutilisées

| Classe Editorial | Usage EMSP |
|------------------|------------|
| `#banner` | Hero page d'accueil |
| `.posts` + `article` | Cartes formations |
| `.row` + `.col-*` | Grilles responsive |
| `.actions` + `.button` | Boutons CTA |
| `.major` | Titres de section |
| `.contact` | Bloc contact sidebar |

### Classes custom EMSP (`emsp-custom.css`)

| Classe | Usage |
|--------|-------|
| `.emsp-hero-tag` | Sous-titre hero jaune |
| `.emsp-hero-title span` | Accent jaune sur titre |
| `.emsp-stats` | Bandeau chiffres clés (fond vert foncé) |
| `.emsp-stats-grid` | Grille 4 colonnes stats |
| `.emsp-quote` | Citation DG avec bordure jaune |
| `.emsp-page-header` | En-tête gradient page formation |
| `.emsp-tracks` / `.emsp-track` | Cartes parcours Ingénierie/Management |
| `.emsp-cta` | Bandeau inscription |
| `.emsp-sidebar-stats` | Chiffres FS MENUM sidebar |
| `.emsp-student-link` | Lien espace étudiant (bleu) |
| `.emsp-placeholder` | Fond gradient pour images SVG |

---

## 5. Breakpoints responsive

Définis dans `main.js` :

| Nom | Plage |
|-----|-------|
| xlarge | 1281px – 1680px |
| large | 981px – 1280px |
| medium | 737px – 980px |
| small | 481px – 736px |
| xsmall | 361px – 480px |
| xxsmall | ≤ 360px |

**Comportement sidebar :** inactive par défaut sur `<= large` (≤ 1280px), toggle via hamburger.

**Media queries EMSP custom (`emsp-custom.css`) :**

- `@980px` : stats 2 colonnes, tracks 1 colonne
- `@480px` : stats 1 colonne, CTA vertical

---

## 6. Assets visuels (dans EMSPCONNECT)

| Fichier | Type | Description |
|---------|------|-------------|
| `../Print_Transparent.svg` | SVG | Logo source à la racine du projet |
| `assets/images/logo.svg` | SVG | Logo EMSP (sidebar) |
| `assets/images/hero-fsmenum.svg` | SVG placeholder | Hero FS MENUM |
| `assets/images/campus.svg` | SVG placeholder | Campus EMSP |
| `assets/images/formation-fsp.svg` | SVG placeholder | Carte FSP |
| `assets/images/formation-fsmenum.svg` | SVG placeholder | Carte/page FS MENUM |
| `assets/images/formation-regnum.svg` | SVG placeholder | Carte RegNUM |

Aucune image photographique n'est présente dans le dépôt.

---

## 7. Conventions pour créer une nouvelle page EMSP

1. Copier la structure de `formations-fs-menum.html`
2. Conserver sidebar + header identiques
3. Remplacer le contenu `#main > .inner`
4. Lier `main.css` + `emsp-custom.css`
5. Marquer l'entrée menu active si pertinent (`class="opener active"`)
6. Utiliser les classes `.emsp-*` pour les blocs institutionnels

---

## 8. Points d'attention

| Sujet | Détail |
|-------|--------|
| SASS | `_vars.scss` modifié ; recompiler avec `npx sass assets/sass/main.scss assets/css/main.css` |
| `generic.html` / `elements.html` | Encore au branding HTML5 UP original |
| Liens `#` | Placeholders sur FSP, RegNUM, Médiathèque, Contact, Espace Étudiant, concours |
| Footer | Crédit HTML5 UP conservé (obligation licence CCA 3.0) |
| Duplication sidebar | Chaque page EMSP duplique la sidebar — pas de partials/templating |
