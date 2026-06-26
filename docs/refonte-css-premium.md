# 📦 Refonte UI/UX — Design System Premium `ac-premium.css`

**Date :** 2026-06-20  
**Fichier créé :** `aine-cadet/static/css/ac-premium.css`  
**Script créé :** `aine-cadet/static/js/ac-animations.js`  
**Base modifiée :** `aine-cadet/templates/base.html`

---

## Ce qui a changé

### `ac-premium.css` (nouveau — 700+ lignes)
Système de design complet remplaçant le design neutre existant.

#### Design Tokens CSS (variables globales)
| Token | Valeur |
|---|---|
| `--ac-emerald-500` | `#10b981` — couleur principale |
| `--ac-gold-400` | `#fbbf24` — accent doré (Cadet) |
| `--ac-gradient-hero` | Dégradé émeraude 135° animé |
| `--ac-shadow-glow` | Lueur verte sur hover |
| `--ac-transition-md` | `0.25s cubic-bezier(...)` |

#### Composants créés
- **`.ac-hero-dash`** — Hero dashboard avec dégradé animé (background-size 200% animé)
- **`.ac-stats-grid`** / **`.ac-stat-card`** — Stat cards avec top-border colorée, hover lift
- **`.ac-profile-card`** — Cards Ainé avec bannière + avatar circle en overlap
- **`.ac-profile-hero`** — Hero immersif (min 320px) avec overlay gradient
- **`.ac-chat-page`** — Interface chat flex column (header + messages + compose)
- **`.ac-bubble--mine/theirs`** — Bulles chat style iMessage
- **`.ac-role-picker`** / **`.ac-role-card`** — Sélecteur de rôle cliquable
- **`.ac-auth-card`** — Card auth premium avec header dégradé
- **`.ac-btn`** — Boutons pill avec variants (primary, secondary, danger, sm, lg, full)
- **`.ac-tag`** — Badges avec 6 variants (aine, cadet, success, warning, info, neutral)
- **`.ac-empty`** — Empty states avec icône circulaire
- **`.ac-detail-section`** — Sections profil avec icône + top-border émeraude
- **`.ac-interest-tag`** — Tags centres d'intérêt pill
- **`.ac-photo-preview-wrap`** — Zone preview photo avec dashed border

#### Animations keyframes
| Animation | Usage |
|---|---|
| `ac-fade-up` | Apparition bas → haut |
| `ac-scale-in` | Apparition zoom |
| `ac-gradient-shift` | Dégradé hero animé en boucle |
| `ac-chat-in-right/left` | Bulles chat |
| `ac-star-pop` | Étoiles fiabilité |
| `ac-bounce-in` | Checkmark role picker |
| `ac-pulse-glow` | Badge non-lu pulsant |

---

### `ac-animations.js` (nouveau)
10 modules JavaScript :
1. **Counter animé** — IntersectionObserver + `requestAnimationFrame` (easing quadratique)
2. **Scroll reveal** — `[data-ac-reveal]` → classe `ac-anim-fade-up`
3. **Role picker** — Click → sélection carte + mise à jour radio natif
4. **Photo preview** — FileReader → src live sur `<img>` (hero + formulaire)
5. **Chat compose** — Auto-resize textarea + `Ctrl+Enter` pour envoyer
6. **Star ratings** — `[data-star-rating]` → HTML étoiles avec délai CSS
7. **Tab badges** — Badge non-lus injecté dynamiquement
8. **Danger confirm** — `[data-confirm]` → `window.confirm()`
9. **Tooltips** — Conservation du `title` natif
10. **Auto-filter** — Submit form annuaire sur changement de select

---

### `base.html` (modifié)
- Ajout Google Fonts : **Inter** (400-800) + **Outfit** (600-800)
- Ajout `ac-premium.css` après les autres CSS
- Ajout `ac-animations.js` avant `</body>`
