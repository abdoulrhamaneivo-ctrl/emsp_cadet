# EMSP Connect v2 — Design System & Composants Shared
## Doc 03 — Contrat visuel et technique pour tout agent frontend

> **À lire AVANT d'écrire la moindre ligne JSX.** Ce document fixe l'identité visuelle et les contrats de composants. Toute divergence = refus de revue.
> Tokens sources : `src/index.css` (template cillaux adapté EMSP). Palette validée utilisateur — NE PAS retoucher.

---

## 1. Identité visuelle — principes non négociables

| # | Principe | Règle concrète |
|---|---|---|
| 1 | **Template-first** | Partir du JSX/CSS existant de cillaux, adapter. Jamais recréer un équivalent |
| 2 | **Panneaux opaques** | `bg: var(--bg-panel)` solide. Interdit : `backdrop-filter`, `opacity < 1` sur un panel, `bg-white/40` |
| 3 | **Couleurs saturées assumées** | Vert profond + or pleine intensité. Interdit : pastels délavés, gris neutre comme couleur principale |
| 4 | **Densité de contenu** | Chaque rectangle porte une info structurée (titre/sous-titre/body/métrique). Interdit : carte décorative vide, section « à propos de rien » |
| 5 | **framer-motion partout** | Entrées de page, stagger de listes, hover-lift des cartes, transitions de route. Un écran statique = bug |
| 6 | **Pleine largeur** | Contenu jusqu'à `max-w-7xl` (1280px). Marges latérales min. `px-5 lg:px-10` (pattern PageShell du template) |
| 7 | **Rayons hiérarchisés** | Panel 16px > Card 12px > Chip/Input 8px. Interdit : même rayon partout |
| 8 | **Mobile-first réel** | La majorité des étudiants naviguent au téléphone (cahier §6) : tester 375px avant desktop |
| 9 | **ZÉRO emoji dans l'UI** | Icônes = lucide-react uniquement (stroke SVG cohérent) |
| 10 | **Light mode par défaut** | Dark mode supporté via `html.dark` mais conçu après coup — ne jamais livrer dark cassé |

---

## 2. Palette & tokens (référence rapide)

```css
/* Marque */
--emsp-green-deep:   #1d4430;  /* fond de page, tête de panneau      */
--emsp-green-mid:    #2d5a3f;  /* bordures structurantes, séparateurs */
--emsp-green-bright: #1a8a52;  /* CTA primaire, succès               */
--emsp-green-luminous:#34c47c; /* accents sur fond sombre, focus     */

--emsp-cream:        #fdfaf2;  /* panel principal                    */
--emsp-cream-alt:    #f3eddd;  /* panel secondaire / zones alternées */

--emsp-gold:         #e9b517;  /* accent signature : badges, jalons  */
--emsp-gold-bright:  #f0c04a;  /* hover or                           */

/* Sémantiques light */
--bg-panel: #fdfaf2;      --text-primary: #16281c;
--border-soft: #e4dcc8;   --border-structural: #356247;
--hover-bg: #eef0da;
--accent-green: #0f5132;  --accent-gold: #e9b517;

/* Ombres two-layer (profondeur douce, jamais flat ni lourde) */
--shadow-panel: 0 4px 24px -4px rgba(13,42,24,.15), 0 1px 3px -1px rgba(13,42,24,.10);
--shadow-card:  0 2px 12px -2px rgba(13,42,24,.10),  0 1px 2px -1px rgba(13,42,24,.06);

/* Rayons */
--radius-panel: 1rem;  --radius-card: .75rem;  --radius-chip: .5rem;  --radius-input: .5rem;
```

Usage sémantique des couleurs :
- **Vert profond** = autorité, fonds de page, headers de panneaux → ne jamais utiliser comme couleur de TEXTE sur crème (contraste insuffisant sur petit texte ? si, ok ≥16px bold ; petites annotations = `--text-muted`)
- **Or** = rare et précieux : badges, « dernière place » RG2, indicateurs clés. Si tout est doré, rien n'est doré
- **Erreur** `#b42318`, **info** `#175cd3`, **avertissement** `#b54708` (rouge/bleu/orange lisibles sur crème)

---

## 3. Typographie

```css
--font-sans: "Bricolage Grotesque", system-ui fallback...;
--font-mono: "JetBrains Mono", monospace;
```

| Style | Classes | Usage |
|---|---|---|
| Display hero | `text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]` | Titre de page (1 seul/page) |
| H2 section | `text-2xl font-semibold` | Titres de sections internes au panel |
| Card title | `text-lg font-semibold leading-snug` | Titre carte |
| Body | `text-sm md:text-base text-[var(--text-muted)]` | Paragraphes |
| Meta/chips | `text-xs font-medium uppercase tracking-wide` | Compteurs, filtres actifs, dates |
| Data mono | `font-mono text-sm` | IDs, codes, badges techniques |

Hiérarchie stricte : 1 seul display par page. Les tailles remontent : jamais de texte sous 12px.

---

## 4. Layout & grille

```
ProtectedShell
├── Sidebar (desktop ≥1024px, ~260px, fond --emsp-green-deep, liens crème)
│     mobile : bottom-nav ou drawer — identique en contenu
├── Zone contenu
│   ├── Header sticky panel (titre page + actions contextuelles)
│   └── <main> PageShell max-w-7xl px-5 lg:px-10
│       └── Sections empilées gap-8, panneaux bg-panel radius-panel shadow-panel p-6 md:p-8
PublicShell : NavBar transparente sur hero, footer vert profond pleine largeur
```

Règles :
- Fond de page = gradient animé `--bg-page` + kente coins opposés (`.kente-pattern`) — déjà en place dans index.css, ne pas toucher
- Les panneaux coupent NET sur le fond animé (contraste opaque = signature visuelle du produit)
- Grid interne cartes : `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` — cartes jamais plus étroites que 320px pleine largeur mobile

---

## 5. MUI ↔ Tailwind : pont officiel

Les deux coexistent (MUI pour complexes : Dialog, Select, Snackbar, Tabs ; Tailwind pour layout/cosmétique).

```js
// src/app/providers/theme.jsx — pont unique
import { createTheme } from "@mui/material/styles";
export const muiTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary:   { main: "#1d4430", contrastText: "#fdfaf2" },
    secondary: { main: "#e9b517", contrastText: "#16281c" },
    success: { main: "#1a8a52" }, error: { main: "#b42318" },
    warning: { main: "#b54708" }, info: { main: "#175cd3" },
    background: { paper: "#fdfaf2", default: "#143524" },
    text: { primary: "#16281c", secondary: "#4a5d50" },
  },
  shape: { borderRadius: 12 },
  typography: { fontFamily: "var(--font-sans), sans-serif" },
  components: {
    MuiPaper:   { styleOverrides: { root: { boxShadow: "var(--shadow-card)" } } },
    MuiDialog:  { styleOverrides: { paper: { borderRadius: "var(--radius-panel)", backgroundColor: "var(--bg-panel)" } } },
    MuiButton:  { defaultProps: { disableElevation: true } },
    MuiTooltip: { defaultProps: { arrow: true } },
  },
});
// IMPORTANT : Tout composant MUI visible doit être habillé aux tokens EMSP ci-dessus.
// Interdit d'importer un thème MUI alternatif ou des couleurs hex hors palette.
```

Décision de stack par cas :
| Besoin | Utiliser |
|---|---|
| Bouton, lien, chip, layout | Tailwind + composants shared maison |
| Modal complexe, focus trap | MUI Dialog (habillé tokens) |
| Select searchable, autocomplete | MUI Autocomplete |
| Toasts | sonner (PAS MUI Snackbar) |
| Table données admin | MUI DataGrid ou table Tailwind maison — décider page par page |

---

## 6. Inventaire composants shared — contrats obligatoires

Tous dans `src/shared/components/`. JS + JSDoc. Chaque composant : fichier unique, default export, nom PascalCase.

### 6.1 Button
```jsx
/**
 * @param {"primary"|"secondary"|"outline"|"ghost"|"danger"} variant="primary"
 * @param {"sm"|"md"|"lg"} size="md"
 * @param {boolean} loading=false   // spinner remplace le label, bloque onClick
 * @param {boolean} disabled=false
 * @param {React.ElementType} icon  // lucide icon, position gauche
 * @param {string} className        // merge avec classes base (clsx)
 * @param {function} onClick
 */
```
Variants : `primary` fond `--accent-green` texte crème, hover `--emsp-green-bright`; `secondary` fond `--emsp-gold` texte `#16281c`; `outline` bordure 1.5px `--border-structural` fond transparent → hover `--hover-bg` (SUR PANEL uniquement) ; `ghost` texte seul ; `danger` fond `#b42318`.
Focus ring visible : `focus-visible:ring-2 ring-[var(--emsp-green-luminous)] offset-2`.

### 6.2 Card
```jsx
/** @param {boolean} interactive=false → motion.div hoverLift + cursor-pointer
 *  @param {React.ReactNode} children (le contenu EST la responsabilité du caller — jamais vide)
 */
```
Base : fond `--bg-panel`, `border border-[var(--border-soft)]`, radius `--radius-card`, shadow `--shadow-card`. Interactive ajoute framer-motion `whileHover={{y:-4}}`.

### 6.3 Input (+ Textarea, + FormField wrapper)
```jsx
/** FormField : label, error string|null, helperText, required indicator asterisk accent-gold
 *  Input : leadingIcon (Element), trailingSlot, invalid bool (bordure #b42318 + message), ...props
 */
```
Base : fond blanc pur `#fff` sur panel crème, bordure `--border-soft`, radius-input, `h-11 px-3.5 text-sm` ; focus bordure `--accent-green` + ring luminous 20%.

### 6.4 Avatar
Tailles `xs 24 / sm 32 / md 40 / lg 56 / xl 88`. Image → sinon initiales (2 lettres, fond alterné green-deep/gold selon hash id). `status?: "online"|"absent"` point vert/creux coin bas-droit.

### 6.5 Chip
`variant: "solid"|"outline"`, `tone: "neutral"|"success"|"gold"|"danger"|"info"`. Radius-chip, `text-xs font-medium uppercase tracking-wide px-2.5 py-1`. Neutral = crème-alt bordure soft ; success = vert-bright 12% fond texte foncé ; gold = fond plein --emsp-gold.

### 6.6 Modal (wrapper MUI Dialog)
Props : `open, onClose, title, subtitle?, maxWidth="sm"|"md"|"lg", destructive?` (bouton footer devient danger). Animations entrée/sortie framer-motion via TransitionComponent maison (fade+scale 0.96→1, 180ms ease-out).

### 6.7 Tabs
Sous-composants maison avec indicateur animé `layoutId` framer-motion (underline ou pill selon contexte). Props : `tabs:[{value,label,count?}], value, onChange`. Le `count` affiche un mini badge accent-gold.

### 6.8 Table (maison)
Props : `columns:[{key,label,align?,width?}], rows, rowKey, emptyState?, onRowClick?, sort?`. Ligne hover `--hover-bg`. Mobile (<640px) : bascule automatique en liste de cartes (responsivité contractuelle).

### 6.9 Pagination
`page, pageCount, onChange, totalElements?, pageSize?` — boutons prev/next ronds outline, chiffres, 1er/dernier ellipsis.

### 6.10 Skeleton
Variante par forme : `skeletons.text(lines), skeletonCard, skeletonAvatar, skeletonRow`. Shimmer CSS keyframes sur `--hover-bg`.

### 6.11 EmptyState
Props : `icon (lucide), title, description, actionLabel?, onAction?`. Centré dans le conteneur parent, illustration = icône dans disque crème-alt 64px.

### 6.12 ConfirmDialog
Wrapper Modal : `title, message, confirmLabel, tone:"default"|"danger", onConfirm, loading`.

### 6.13 ScoreFiabilite (§3.6, dédié)
Affiche moyenne étoiles lucide `Star` (pleines/half/vides) + note numérique + `nbAvis avis`. Ton or. Si null : rendu discret « Pas encore noté ».

### 6.14 JaugeCapacite (RG2)
5 segments (cases) — pleins `--accent-green`, vacants contour. À 4/5 le dernier vacant pulse or subtil. Label `n/5`.

---

## 7. Système de mouvement (shared/motion)

Fichier `src/shared/motion/variants.js` — LE source unique :

```js
export const fadeInUp = {
  initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
};
export const staggerContainer = { animate: { transition: { staggerChildren: 0.08 } } };
export const staggerItem = {
  initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};
export const hoverLift = { whileHover: { y: -4 }, transition: { duration: 0.2 } };
export const pageTransition = {
  initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { type: "tween", duration: 0.3, ease: "anticipate" },
};
export const pulseGentle = {
  animate: { scale: [1, 1.03, 1] },
  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
};
```

Règles de mise en œuvre :
1. Page entière : `<motion.main {...pageTransition}>` — chaque navigation anime
2. Listes de cartes : container `variants={staggerContainer}` + enfants `variants={staggerItem}`
3. Scroll reveal sections : `whileInView={{opacity:1,y:0}} viewport={{once:true, margin:"-80px"}}`
4. Sorties animées : utiliser `AnimatePresence` autour des routes et modales — pas de disparition brutale
5. `prefers-reduced-motion` : hook `useReducedMotion()` de framer-motion → remplacer par fade simple durée 120ms. Ne jamais ignorer

---

## 8. Motifs kente & signature visuelle

- `.kente-pattern` coins opposés + `.woven-ribbon` bas — global, déjà dans index.css
- Usage local autorisé : bande kente horizontale 8px en haut des panneaux prioritaires (header sidebar active item, carte événement mise en avant) via classe utilitaire `.kente-band` à créer dans globals.css
- Sobre : motif = texture discrète opacité ≤0.22, jamais au-dessus du contenu

---

## 9. États serveur — conventions UI standardisées

Tout écran consommant l'API implémente les 4 états, dans cet ordre de priorité d'effort :
1. **Loading** : skeletons au format exact du contenu final (pas de spinner central plein écran sauf action bouton)
2. **Empty** : EmptyState contextualisé + CTA (ex. annuaire vide → « Aucun Aîné disponible pour ces filtres » + bouton réinitialiser filtres)
3. **Error** : bannière rouge douce dans le panneau + bouton Réessayer (refetch). Toast SONNER en complément seulement pour mutations
4. **Success** : données + feedback mutation local optimiste quand sûr (messages, statut demande), sinon invalidation query

---

## 10. Accessibilité minimale (bloquante pour la revue)

- Chaque page : un seul `<h1>`
- Images significatives : alt descriptif ; décoratives : `alt=""`
- Focus visible PARTOUT (jamais `outline-none` sans replacement)
- Formulaires : labels associés (`htmlFor`), erreurs annoncées (`aria-invalid`, `aria-describedby`)
- Couleurs : contraste AA minimum texte/fond (vérifier muted #4a5d50 sur crème ✓)
- Navigation clavier fonctionnelle (Tabs fléchées, Modal focus trap auto MUI, Escape ferme)
- `prefers-reduced-motion` respecté (cf §7)

---

## 11. Checklist avant toute PR page (l'agent doit la passer lui-même)

```
[ ] H1 unique, titres hiérarchisés
[ ] Panneaux opaques bg-panel + shadow-panel + radius-panel (pas de blur)
[ ] Aucune couleur hors palette (ni MUI par défaut bleu !)
[ ] framer-motion : transition page + stagger listes + hover cards
[ ] Mobile 375px vérifié (sidebar→bottom nav, tables→cartes)
[ ] 4 états serveur gérés (loading/empty/error/success)
[ ] Règles RG concernées appliquées (cf doc 02 §3)
[ ] Zéro emoji, icônes lucide uniquement
[ ] Responsive scroll fluide, pas d'overflow horizontal
[ ] skip-link vers contenu principal présent
```
