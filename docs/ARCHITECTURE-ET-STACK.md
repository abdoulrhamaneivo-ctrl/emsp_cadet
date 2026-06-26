# Architecture et stack technique

> Périmètre : dossier `EMSPCONNECT/` uniquement

---

## 1. Stack actuelle

| Couche | Technologie | Détail |
|--------|-------------|--------|
| Markup | HTML5 | `lang="fr"`, sémantique |
| Styles | CSS3 + SASS | Editorial + `emsp-custom.css` |
| Scripts | JavaScript (jQuery) | Sidebar, menu, breakpoints |
| Icônes | Font Awesome | Bundled (brands + solid) |
| Fonts | Google Fonts (via CSS) | Open Sans, Roboto Slab |
| Build | Aucun | Fichiers statiques servis directement |
| Backend | **Aucun** | Site 100 % statique |

---

## 2. Structure des dossiers

```
EMSPCONNECT/                         (~62 fichiers)
├── Print_Transparent.svg            # Logo source EMSP
├── docs/                            # Documentation (5 fichiers MD)
│   ├── CONTEXTE-PROJET.md
│   ├── CAHIER-DES-CHARGES-SYNTHESE.md
│   ├── TEMPLATE-ANALYSE.md
│   ├── ARCHITECTURE-ET-STACK.md
│   └── ETAT-DU-PROJET.md
└── html5up-editorial/               # Application vitrine
    ├── index.html                   # Accueil EMSP
    ├── formations-fs-menum.html     # Page FS MENUM
    ├── generic.html                 # Template non adapté
    ├── elements.html                # Showcase UI non adapté
    ├── README.txt                   # Crédits HTML5 UP
    ├── LICENSE.txt                  # CCA 3.0
    └── assets/
        ├── css/
        │   ├── main.css             # Template compilé
        │   ├── emsp-custom.css      # Surcharges EMSP
        │   └── fontawesome-all.min.css
        ├── sass/                    # Sources SASS Editorial (modifiées)
        ├── js/                      # jQuery + main.js + utilitaires
        ├── images/                  # Logo + 5 SVG placeholders
        └── webfonts/                # Font Awesome fonts
```

---

## 3. Architecture frontend

```
┌─────────────────────────────────────────────────────┐
│                    index.html                        │
│  ┌──────────────────────┐  ┌──────────────────────┐ │
│  │       #main          │  │      #sidebar        │ │
│  │  ┌────────────────┐  │  │  #logo-section       │ │
│  │  │ #header        │  │  │  #menu (accordéon)   │ │
│  │  │ #banner (hero)  │  │  │  contact             │ │
│  │  │ sections…      │  │  │  #footer              │ │
│  │  └────────────────┘  │  └──────────────────────┘ │
│  └──────────────────────┘                            │
└─────────────────────────────────────────────────────┘
         │                           │
         ▼                           ▼
    main.css + emsp-custom.css    main.js (sidebar/menu)
```

### Flux de rendu

1. HTML chargé avec `class="is-preload"` sur `<body>`
2. CSS applique styles Editorial + surcharges EMSP
3. JS retire `is-preload` après `window.load`
4. Sidebar toggle et menu accordéon activés au clic

### Pages et liens

| Page | Fichier | Liens sortants actifs |
|------|---------|----------------------|
| Accueil | `index.html` | `formations-fs-menum.html`, Facebook |
| FS MENUM | `formations-fs-menum.html` | `index.html`, Facebook |
| Generic | `generic.html` | Liens template HTML5 UP |
| Elements | `elements.html` | Liens template HTML5 UP |

Tous les autres liens de navigation pointent vers `#` (placeholder).

---

## 4. Charte graphique

Variables CSS dans `emsp-custom.css` :

```css
:root {
  --emsp-green: #147c71;
  --emsp-green-dark: #264719;
  --emsp-green-mid: #446324;
  --emsp-yellow: #ef9c00;
  --emsp-yellow-bright: #ecf40b;
  --emsp-blue: #1a5276;
  --emsp-white: #ffffff;
}
```

Palette SASS (`assets/sass/libs/_vars.scss`) synchronisée pour les composants Editorial natifs (boutons, liens, bordures).

---

## 5. Fichiers modifiés vs template original

| Fichier | Action |
|---------|--------|
| `index.html` | Réécrit (contenu EMSP) |
| `formations-fs-menum.html` | Créé |
| `assets/css/emsp-custom.css` | Créé |
| `assets/sass/libs/_vars.scss` | Modifié (palette EMSP) |
| `assets/css/main.css` | Modifié (accent vert) |
| `assets/images/*.svg` | Créés (logo + placeholders) |
| `generic.html` | Inchangé (template original) |
| `elements.html` | Inchangé (template original) |

---

## 6. Déploiement et prévisualisation

### Ouverture directe

```
EMSPCONNECT/html5up-editorial/index.html
```

### Serveur local

```powershell
cd "C:\Users\abdoul ivo\Desktop\EMSPCONNECT\html5up-editorial"
python -m http.server 8080
# → http://localhost:8080
```

Aucune configuration de déploiement, CI/CD ou hébergement n'est présente dans EMSPCONNECT.

---

## 7. Compilation SASS

Si modification des sources SASS :

```powershell
cd html5up-editorial
npx sass assets/sass/main.scss assets/css/main.css
```

Prérequis : Node.js installé (non inclus dans le dépôt).

---

## 8. Limites actuelles

| Limite | Détail |
|--------|--------|
| Pas de backend | Authentification, bibliothèque numérique, formulaires impossibles en l'état |
| Pas de templating | Sidebar/header dupliqués dans chaque page HTML |
| Pas de build pipeline | Pas de package.json, pas de bundler |
| Liens morts | Majorité des entrées menu → `#` |
| Images | Uniquement SVG placeholders, pas de photos |
