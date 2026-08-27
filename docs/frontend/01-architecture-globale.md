# EMSP Connect v2 — Documentation Frontend
## Phase 1 : Architecture Globale & Stack Technique

---

### 1.1 Vision d'Ensemble

**EMSP Connect v2** est une plateforme de parrainage étudiant (Cadets L1–L3 / Ainés) pour l'École Multinationale des Postes d'Abidjan (EMSP).

- **Domaine** : `@emsp.int` only
- **Rôles** : Filleul (Cadet), Parrain (Aîné), Administrateur
- **Objectif** : Remplacer les processus manuels par une plateforme web fiable, mobile-first

---

### 1.2 Stack Technique Validée

| Couche | Technologie | Version | Rôle |
|--------|-------------|---------|------|
| **Frontend Framework** | React | 19 | UI déclarative, concurrent features |
| **Build Tool** | Vite | 7 | Dev server ultra-rapide, HMR |
| **Styling** | Tailwind CSS | v4 | Utility-first, CSS variables natives |
| **UI Library** | MUI (Material UI) | v6 | Composants accessibles, theming système |
| **Animations** | framer-motion | latest | Motion design professionnel, scroll-linked |
| **Routing** | React Router | v7 | Data loading, SSR-ready |
| **State/Server** | TanStack Query (React Query) | v5 | Cache serveur, mutations, invalidation |
| **Forms** | react-hook-form + zod | latest | Validation performante, type-safe |
| **HTTP Client** | Axios | latest | Interceptors, JWT refresh automatique |
| **Real-time** | native WebSocket / Socket.io client | - | Messagerie, notifications push |
| **Icons** | lucide-react | latest | Icônes SVG stroke cohérentes |
| **Date/Time** | date-fns | latest | Formatage, manipulation dates |
| **Notifications** | sonner / react-hot-toast | latest | Toasts accessibles |

> **Règle d'or** : Le template de base est **cillaux** (React 19 + Tailwind v4 + Vite). On ne recrée jamais un équivalent — on l'adapte.

---

### 1.3 Architecture Frontend

```
frontend/
├── public/                    # Assets statiques (favicon, images, kente SVGs)
├── src/
│   ├── app/                   # Point d'entrée & providers
│   │   ├── providers/         # ThemeProvider, AuthProvider, QueryProvider, MotionProvider
│   │   ├── App.jsx            # Routing principal (2 shells: public / protected)
│   │   ├── main.jsx           # Bootstrap React 19 createRoot
│   │   └── routes/            # Déclaration routes par domaine
│   │       ├── publicRoutes.jsx
│   │       └── protectedRoutes.jsx
│   │
│   ├── features/              # Modules métier (colocation par domaine)
│   │   ├── auth/              # Connexion, inscription, reset pwd, email verify
│   │   ├── annuaire/          # Liste parrains, filtres, fiches, suggestions
│   │   ├── parrainage/        # Demandes, acceptation, dashboard parrain/filleul
│   │   ├── messagerie/        # Chat temps réel, liste conversations, indicateurs
│   │   ├── rendez-vous/       # CRUD RDV, propositions, rappels
│   │   ├── retours/           # Avis, notes, score fiabilité
│   │   ├── evenements/        # Événements collectifs, inscriptions
│   │   ├── badges/            # Affichage badges, progression
│   │   ├── profil/            # Profil utilisateur (filleul/parrain), édition
│   │   ├── fil/               # Feed d'actualités, annonces
│   │   ├── offres/            # Offres de stage/emploi (futur)
│   │   └── admin/             # Dashboard admin, modération, stats
│   │
│   ├── shared/                # Code partagé transversal
│   │   ├── components/        # Composants UI réutilisables (Button, Card, Input, Modal, etc.)
│   │   ├── hooks/             # Hooks génériques (useDebounce, useMediaQuery, etc.)
│   │   ├── utils/             # Helpers purs (formatters, validators, constants)
│   │   ├── types/             # Types TypeScript/JSDoc partagés
│   │   ├── api/               # Client Axios + endpoints typés
│   │   ├── motion/            # Variantes framer-motion réutilisables
│   │   └── design-tokens/     # Tokens EMSP (couleurs, espaces, rayons, kente)
│   │
│   ├── layout/                # Composants de mise en page
│   │   ├── shells/            # PublicShell, ProtectedShell
│   │   ├── navbar/            # NavBar adaptée (auth state, role-based)
│   │   ├── sidebar/           # Sidebar navigation (desktop)
│   │   └── footer/            # Footer EMSP
│   │
│   ├── styles/                # Styles globaux
│   │   ├── index.css          # Tailwind v4 + CSS variables EMSP + kente motifs
│   │   ├── globals.css        # Reset, typographie, utilitaires custom
│   │   └── animations.css     # Keyframes réutilisables
│   │
│   └── data/                  # Données statiques / config (menu.json, constants)
│
├── .env.example               # Variables d'env (VITE_API_URL, etc.)
├── package.json
├── vite.config.js
├── eslint.config.js
├── jsconfig.json              # Path aliases (@/, @features/, @shared/, etc.)
└── README.md
```

---

### 1.4 Deux Shells de Routing (Pattern App Shell)

```jsx
// src/app/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PublicShell } from "@/layout/shells/PublicShell";
import { ProtectedShell } from "@/layout/shells/ProtectedShell";
import { useAuth } from "@/features/auth/hooks/useAuth";

// Routes publiques (non authentifiées)
const publicRoutes = [
  { path: "/", element: <LandingPage /> },
  { path: "/connexion", element: <LoginPage /> },
  { path: "/inscription", element: <RegisterPage /> },
  { path: "/mot-de-passe-oublie", element: <ForgotPasswordPage /> },
  { path: "/reinitialiser-mot-de-passe/:uid/:token", element: <ResetPasswordPage /> },
  { path: "/verifier-email/:uid/:token", element: <VerifyEmailPage /> },
  { path: "/health", element: <HealthCheck /> },
];

// Routes protégées (authentifiées)
const protectedRoutes = [
  { path: "/accueil", element: <HomePage /> },
  { path: "/profil", element: <ProfilePage /> },
  { path: "/annuaire", element: <AnnuairePage /> },
  { path: "/mes-demandes", element: <MesDemandesPage /> },
  { path: "/messagerie", element: <MessagerieListPage /> },
  { path: "/messagerie/:conversationId", element: <ConversationPage /> },
  { path: "/mon-parrainage", element: <MonParrainagePage /> },
  { path: "/fil", element: <FilPage /> },
  { path: "/evenements", element: <EvenementsPage /> },
  { path: "/offres", element: <OffresPage /> },
  // Admin only
  { path: "/administration", element: <AdminDashboardPage />, roles: ["admin"] },
  { path: "/admin-dashboard", element: <AdminDashboardPage />, roles: ["admin"] },
  { path: "/moderation", element: <ModerationPage />, roles: ["admin"] },
];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Shell */}
        <Route element={<PublicShell />}>
          {publicRoutes.map(r => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}
        </Route>

        {/* Protected Shell avec garde de rôle */}
        <Route element={<ProtectedRoute />}>
          {protectedRoutes.map(r => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

### 1.5 Design Tokens EMSP (Validés)

```css
/* src/styles/index.css — Extrait tokens */
:root {
  /* Palette Light (validée utilisateur) */
  --emsp-green-deep: #1d4430;
  --emsp-green-mid: #2d5a3f;
  --emsp-green-bright: #1a8a52;
  --emsp-green-luminous: #34c47c;
  --emsp-cream: #fdfaf2;
  --emsp-cream-alt: #f3eddd;
  --emsp-gold: #e9b517;
  --emsp-gold-bright: #f0c04a;

  /* Sémantiques Light */
  --bg-page: linear-gradient(155deg, #1d4430 0%, #143524 55%, #0f2b1d 100%);
  --bg-panel: #fdfaf2;
  --bg-panel-alt: #f3eddd;
  --text-primary: #16281c;
  --text-muted: #4a5d50;
  --border-soft: #e4dcc8;
  --border-structural: #356247;
  --hover-bg: #eef0da;
  --accent-green: #0f5132;
  --accent-gold: #e9b517;

  /* Ombres two-layer */
  --shadow-panel: 0 4px 24px -4px rgba(13, 42, 24, 0.15),
                  0 1px 3px -1px rgba(13, 42, 24, 0.1);
  --shadow-card: 0 2px 12px -2px rgba(13, 42, 24, 0.1),
                 0 1px 2px -1px rgba(13, 42, 24, 0.06);

  /* Rayons variables par rôle */
  --radius-panel: 1rem;      /* 16px - conteneurs principaux */
  --radius-card: 0.75rem;    /* 12px - cartes contenu */
  --radius-chip: 0.5rem;     /* 8px - badges, chips */
  --radius-input: 0.5rem;    /* 8px - inputs */

  /* Kente motif */
  --kente-opacity: 0.22;
  --kente-color: #e9b517;
}

html.dark {
  /* Palette Dark */
  --bg-page: linear-gradient(155deg, #0e1f16, #122a1d, #0b1c13);
  --bg-panel: #1c3226;
  --bg-panel-alt: #24402f;
  --text-primary: #ecf4ee;
  --text-muted: #a8bdb0;
  --border-soft: #35543f;
  --border-structural: #48705a;
  --hover-bg: #24402f;
  --accent-green: #34c47c;
  --accent-gold: #f0c04a;

  --shadow-panel: 0 4px 24px -4px rgba(0, 0, 0, 0.4),
                  0 1px 3px -1px rgba(0, 0, 0, 0.3);
  --shadow-card: 0 2px 12px -2px rgba(0, 0, 0, 0.3),
                 0 1px 2px -1px rgba(0, 0, 0, 0.2);

  --kente-opacity: 0.13;
  --kente-color: #34c47c;
}

/* Polices */
:root {
  --font-sans: "Bricolage Grotesque", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;
}

/* Animation background gradient */
@keyframes bg-gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

body {
  font-family: var(--font-sans);
  background: var(--bg-page);
  background-size: 400% 400%;
  animation: bg-gradient 22s ease infinite;
  background-attachment: fixed;
  color: var(--text-primary);
}

@media (prefers-reduced-motion: reduce) {
  body { animation: none; }
}

/* Kente pattern - coins opposés */
.kente-pattern::before,
.kente-pattern::after {
  content: "";
  position: fixed;
  width: 280px;
  height: 280px;
  pointer-events: none;
  opacity: var(--kente-opacity);
  background-image: url("/assets/kente-pattern.svg");
  background-size: 40px 40px;
  z-index: 0;
}
.kente-pattern::before { top: 0; left: 0; }
.kente-pattern::after { bottom: 0; right: 0; transform: rotate(180deg); }

/* Woven ribbon bas de viewport */
.woven-ribbon {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 60px;
  pointer-events: none;
  z-index: 1;
  background: url("/assets/woven-ribbon.svg") repeat-x bottom;
  opacity: var(--kente-opacity);
}
```

---

### 1.6 Variables d'Environnement

```bash
# .env.example
VITE_API_URL=https://api.emsp.int/v1
VITE_WS_URL=wss://api.emsp.int/ws
VITE_APP_NAME=EMSP Connect
VITE_APP_DOMAIN=emsp.int
VITE_SENTRY_DSN=              # Optionnel
VITE_GA_MEASUREMENT_ID=       # Optionnel
```

---

### 1.7 Path Aliases (jsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@app/*": ["src/app/*"],
      "@features/*": ["src/features/*"],
      "@shared/*": ["src/shared/*"],
      "@layout/*": ["src/layout/*"],
      "@styles/*": ["src/styles/*"],
      "@data/*": ["src/data/*"]
    },
    "checkJs": true,
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

### 1.8 Principes Directeurs (Non-Négociables)

1. **Template-first** : Toujours partir de `cillaux`, jamais réinventer
2. **Opaque panels** : Panneaux opaques (`--bg-panel`) sur fond animé — PAS de blur/translucide
3. **Saturated colors** : Couleurs vraies, assumées — pas de pastel "fait IA"
4. **Dense content** : Chaque rectangle porte de l'info structurée (hiérarchie titre/sous-titre/body/métriques)
5. **framer-motion everywhere** : ScrollReveal, stagger, parallax, route transitions
6. **Full-width** : Pas de gros marges vides ; `max-w-7xl` seulement au-delà ~1800px
7. **Varying radii** : Panel (16px) > Card (12px) > Chip (8px) — pas de `rounded-xl` uniforme
8. **Dark mode designed** : Panel clairement plus clair que fond, accents lumineux
9. **Accessibility first** : Skip links, ARIA, focus management, prefers-reduced-motion
10. **Icons = SVG stroke** : lucide-react ou inline SVG cohérent — ZÉRO emoji

---

### 1.9 Prochaines Phases

- **Phase 2** : Frontend — Structure détaillée, routing, composants, design system
- **Phase 3** : Backend — Models Django, API DRF, Auth JWT, Channels WebSocket
- **Phase 4** : Règles de gestion & Workflows métier
- **Phase 5** : Plan de migration cillaux → EMSP Connect frontend