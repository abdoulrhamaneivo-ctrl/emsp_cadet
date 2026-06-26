# Templates — Analyse HTML5 UP Editorial

> Dossier : `html5up-editorial/` — Licence CCA 3.0 ([html5up.net](https://html5up.net))

---

## 1. Rôle dans EMSPCONNECT

Le template **Editorial** sert de base à la **vitrine institutionnelle EMSP** et aux **templates Django Ainé & Cadet** (via `STATICFILES_DIRS` pointant vers `html5up-editorial/assets/`).

---

## 2. Caractéristiques du template

- Sidebar **verrouillable** au scroll (desktop)
- Menu **accordéon** avec sous-menus
- Layout **two-column** : `#main` + `#sidebar`
- Typographie : Open Sans + Roboto Slab
- Responsive : breakpoints JS (xlarge → xxsmall)

---

## 3. Pages du dépôt

| Fichier | Statut EMSP | Usage |
|---------|-------------|-------|
| `index.html` | ✅ Adapté | Accueil, hero FS MENUM, stats, formations |
| `formations-fs-menum.html` | ✅ Créé | Parcours Ingénierie / Management |
| `generic.html` | ⚠️ Non adapté | Template HTML5 UP original |
| `elements.html` | ⚠️ Non adapté | Showcase composants UI |

---

## 4. Structure HTML type (pages EMSP)

```html
<div id="wrapper">
  <div id="main">
    <div class="inner">
      <header id="header">...</header>
      <section>...</section>
    </div>
  </div>
  <div id="sidebar">
    <section id="logo-section">...</section>
    <nav id="menu">...</nav>
    <section>Contact</section>
    <footer id="footer">...</footer>
  </div>
</div>
```

---

## 5. Personnalisations EMSP

### Fichiers créés / modifiés

| Fichier | Modification |
|---------|--------------|
| `assets/css/emsp-custom.css` | Charte EMSP, hero, stats, CTA |
| `assets/sass/libs/_vars.scss` | Palette `$palette` EMSP |
| `assets/js/emsp-config.js` | Routes navigation centralisées |
| `assets/images/*.svg` | Logo + placeholders |

### Classes CSS custom (`.emsp-*`)

| Classe | Usage |
|--------|-------|
| `.emsp-hero-tag` | Sous-titre hero jaune |
| `.emsp-stats` | Bandeau chiffres clés |
| `.emsp-tracks` | Cartes parcours formation |
| `.emsp-cta` | Bandeau inscription concours |
| `.emsp-student-link` | Lien espace étudiant (bleu) |
| `.emsp-placeholder` | Fond gradient SVG |

---

## 6. Navigation prévue

Configurée dans `assets/js/emsp-config.js` :

```
Accueil → index.html
Formations
  ├── FSP → formations-fsp.html (à créer)
  ├── FS MENUM → formations-fs-menum.html ✅
  ├── RegNUM → formations-regnum.html (à créer)
  └── Formation Continue → formation-continue.html (à créer)
Médiathèque → mediatheque.html (à créer)
Contact → contact.html (à créer)
Espace Étudiant → URL Ainé & Cadet (backend)
```

---

## 7. Convention pour une nouvelle page

1. Dupliquer `formations-fs-menum.html`
2. Conserver sidebar + header (ou générer via script futur)
3. Remplacer le contenu `#main > .inner`
4. Lier `main.css` + `emsp-custom.css` + `emsp-config.js`
5. Mettre à jour `emsp-config.js` avec la nouvelle route
6. Utiliser les classes `.emsp-*` pour les blocs institutionnels

---

## 8. Breakpoints

| Nom | Plage | Comportement sidebar |
|-----|-------|---------------------|
| large | ≤ 1280px | Sidebar inactive, toggle hamburger |
| medium | 737–980px | Grilles adaptées |
| xsmall | ≤ 480px | Stats 1 colonne, CTA vertical |

---

## 10. Templates Django (Ainé & Cadet)

L'application Django réutilise les assets Editorial via `STATICFILES_DIRS` :

| Template | Rôle |
|----------|------|
| `templates/base.html` | Layout `#wrapper` / `#main` / `#sidebar` |
| `templates/partials/_header.html` | En-tête zone principale |
| `templates/partials/_sidebar.html` | Menu + logo + footer |
| `templates/partials/_messages.html` | Alertes Django |
| `static/css/aine-cadet.css` | Surcharges app parrainage |

Voir [MODULES.md](MODULES.md) pour l'analyse détaillée.

---

## 11. Points d'attention

- **Duplication sidebar** : pages HTML vitrine dupliquent le menu ; côté Django, partials `templates/partials/` réutilisables
- **Licence** : conserver le crédit HTML5 UP dans le footer
- **Images** : remplacer les SVG placeholders par photos réelles quand disponibles
