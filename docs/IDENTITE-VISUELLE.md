# Identité visuelle EMSP / Ainé & Cadet

Charte unifiée entre la **vitrine statique** (`html5up-editorial/`) et l'**application Django** (`aine-cadet/`).

---

## Palette officielle

| Token | Valeur | Usage |
|-------|--------|--------|
| Vert sarcelle EMSP | `#147c71` | Boutons, liens, titres |
| Vert foncé | `#0a3d38` | Titres, dégradés hero |
| Vert clair | `#1faa98` | Accents, dégradés |
| Or institutionnel | `#ef9c00` | Bandeaux, highlights, logo |
| Rouge concours | `#d00000` | Alertes concours |

---

## Fichiers CSS

| Fichier | Portée |
|---------|--------|
| `html5up-editorial/assets/css/emsp-custom.css` | Vitrine EMSP |
| `aine-cadet/static/css/ac-brand.css` | App Django — fond, header, boutons |
| `aine-cadet/static/css/ac-premium.css` | Profils immersifs, annuaire, stats |
| `aine-cadet/static/css/aine-cadet-forms.css` | Formulaires auth |

`base.html` charge **ac-brand.css** + **ac-premium.css** sur toutes les pages Django.

---

## Composants clés

### Bandeau identité
```html
<div class="ac-brand-strip" aria-hidden="true"></div>
```
Barre dégradée vert EMSP en haut des pages premium.

### Profils Aînés (filleuls)
- **Annuaire** : `templates/parrainage/annuaire.html` — cartes `.ac-profile-card` avec hover
- **Détail** : `templates/parrainage/detail_aine.html` — hero `.ac-profile-hero`, stats, grille bento
- **Animations** : `static/js/ac-animations.js` (reveal au scroll, compteurs)

### Accueil app
- Hero dégradé `.ac-accueil-hero` avec logo animé
- Cartes features `.ac-accueil-feature`

---

## Typographie

- **Vitrine** : Open Sans + Roboto Slab (Editorial)
- **App premium** : Inter + Outfit (Google Fonts via `base.html`)

---

## Logo & favicon

- Logo SVG : `static/images/aine-cadet-logo.svg`
- Favicon : même fichier dans `base.html`
- `theme-color` : `#147c71`

---

## Cohérence vitrine ↔ app

| Élément | Vitrine | App Django |
|---------|---------|------------|
| Vert principal | `--emsp-green` | `--emsp-green` / `--ac-emerald-700` |
| Hero | Vidéo topo + overlay | Dégradé + glassmorphism |
| Boutons primary | `.button.primary` | `.button.primary` (surcharge ac-brand) |

---

## Voir aussi

- [UI-UX.md](UI-UX.md)
- [PROFILS-IMMERSIFS.md](PROFILS-IMMERSIFS.md) (si présent)
- [TEMPLATES.md](TEMPLATES.md)
