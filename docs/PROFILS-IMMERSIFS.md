# Profils immersifs — vue Cadet (filleul)

Documentation de l'expérience **annuaire** et **fiche détail Ainé** consultées par les Cadets lors de la recherche de parrainage.

---

## Objectif

Remplacer les fiches texte plates par une présentation **immersive, dynamique et mobile-first**, alignée sur la charte EMSP (teal `#147c71`, classes `.ac-*`, template Editorial).

Sans librairie lourde : **CSS** (`ac-premium.css`) + **JS vanilla** (`ac-animations.js`).

---

## Pages modifiées

| Page | Template | URL |
|------|----------|-----|
| Annuaire des Ainés | `templates/parrainage/annuaire.html` | `/parrainage/annuaire/` |
| Fiche détail Ainé | `templates/parrainage/detail_aine.html` | `/parrainage/aine/<id>/` |

### Partials et assets

| Fichier | Rôle |
|---------|------|
| `templates/parrainage/partials/_avatar_aine.html` | Avatar photo ou initiales |
| `apps/parrainage/templatetags/parrainage_extras.py` | Filtres `split_csv`, `initiales` |
| `static/css/ac-premium.css` | Design system profils (cartes, hero, sections) |
| `static/js/ac-animations.js` | Étoiles, scroll reveal, filtres auto, compteurs |
| `templates/partials/_pagination.html` | Pagination annuaire (réparé) |

### Vue Django

`apps/parrainage/views.py` — `detail_aine` et `annuaire` enrichissent le contexte :

- `filleuls_actifs`, `capacite_max`, `places_restantes` (fiche détail)
- `capacite_max` (annuaire)

---

## Structure HTML — Annuaire

```
<section.ac-premium-scope>
  <header> Titre + intro </header>
  <form data-ac-autofilter>  Filtres filière / classe / recherche  </form>
</section>

<section.ac-premium-scope>
  <div.ac-profile-grid>
    <article.ac-profile-card data-ac-reveal>   × N Ainés
      <div.ac-profile-card__banner>
        <div.ac-profile-card__avatar-wrap>  photo | initiales  </div>
      </div>
      <div.ac-profile-card__body>
        nom, tags filière/classe
        centres d'intérêt (tronqués)
        étoiles fiabilité | badge « Nouveau »
        compteur cadets actifs
        CTA « Voir le profil » + « Demander parrainage »
      </div>
    </article>
  </div>
  pagination
</section>
```

### Comportement UX — Annuaire

- **Hover carte** : élévation + ombre (`translateY(-6px)`)
- **Filtres** : soumission auto au changement de `<select>` (`data-ac-autofilter`)
- **Étoiles** : rendu animé via `data-star-rating`
- **Scroll reveal** : sections `[data-ac-reveal]` → classe `.ac-anim-fade-up`
- **Mobile** : grille 1 colonne sous 480px

---

## Structure HTML — Fiche détail Ainé

```
<section.ac-premium-scope>
  <div.ac-profile-hero>
    fond gradient animé + photo floutée (si présente)
    overlay dégradé
    contenu : avatar 110px | nom | badges | score | CTA parrainage
  </div>

  <div.ac-stats-grid>
    stat cadets accompagnés | places restantes | score | badges
  </div>

  <div.ac-detail-grid>   grille bento responsive
    <article.ac-detail-section> Ambitions </article>
    <article.ac-detail-section> Motivations </article>
    ...
    <article.ac-detail-section--wide> tags centres d'intérêt </article>
  </div>

  <ul.ac-badge-list> badges parcours dorés </ul>
  actions : Demander parrainage | Retour annuaire
</section>
```

### Comportement UX — Fiche détail

- **Hero** : gradient EMSP animé (`ac-gradient-shift`), photo en arrière-plan à 30 % d'opacité
- **Stats** : compteurs animés au scroll (`data-ac-counter`)
- **Sections** : icônes Font Awesome, bordure teal, hover léger
- **Centres d'intérêt** : pills `.ac-interest-tag` (split virgules)
- **prefers-reduced-motion** : animations réduites à 0.01ms dans `ac-premium.css`

---

## Composants CSS principaux

| Classe | Usage |
|--------|-------|
| `.ac-profile-grid` | Grille cartes annuaire |
| `.ac-profile-card` | Carte Ainé avec bannière + avatar overlap |
| `.ac-profile-hero` | Hero immersif fiche détail |
| `.ac-stats-grid` / `.ac-stat-card` | Statistiques parrainage |
| `.ac-detail-grid` / `.ac-detail-section` | Sections contenu bento |
| `.ac-interest-tag` | Tags centres d'intérêt |
| `.ac-badge-item` | Badges parcours dorés |
| `.ac-tag--aine`, `.ac-tag--info` | Labels filière / rôle |

---

## Captures textuelles

### Annuaire (desktop)

```
┌─────────────────────────────────────────────────────────────┐
│  Annuaire des Ainés                                         │
│  [Filière ▼] [Classe ▼] [Recherche...]  [Filtrer] [Reset] │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│ │▓▓▓▓▓▓▓▓▓▓│  │▓▓▓▓▓▓▓▓▓▓│  │▓▓▓▓▓▓▓▓▓▓│  bannière teal   │
│ │ (JD)     │  │ [photo]  │  │ (AK)     │  avatar overlap  │
│ │ Jean D.  │  │ Marie K. │  │ Awa K.   │                   │
│ │ ★★★★☆    │  │ Nouveau  │  │ ★★★☆☆    │                   │
│ │ 2/5 Cadets│  │ 0/5      │  │ 1/5      │                   │
│ │[Profil][Demander]        ...                              │
│ └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### Fiche détail (mobile)

```
┌─────────────────────┐
│▓▓▓▓ HERO GRADIENT ▓▓│
│  (AB)  Amadou B.    │
│  Ainé · FS MENUM L3 │
│  ★★★★☆ 4.2/5        │
│ [Demander parrainage]│
├─────────────────────┤
│ 2/5    │ 3 places   │
│ Cadets │ restantes  │
├─────────────────────┤
│ 🚀 Ambitions        │
│ texte...            │
├─────────────────────┤
│ ❤️ [tag1] [tag2]    │
└─────────────────────┘
```

---

## Chargement des assets

Les pages annuaire et détail incluent via `{% block extra_css %}` / `{% block extra_js %}` :

```django
<link rel="stylesheet" href="{% static 'css/ac-premium.css' %}" />
<script src="{% static 'js/ac-animations.js' %}"></script>
```

Le template de base Editorial (`base.html`) reste inchangé pour les autres pages.

---

## Évolutions possibles (hors scope actuel)

- Photos de campus réelles en fond hero (dossier `static/images/backgrounds/`)
- Profil public sans authentification (route dédiée)
- Suggestions IA de parrainage visuelles sur le dashboard Cadet

---

## Liens

- [docs/refonte-profils-annuaire.md](refonte-profils-annuaire.md) — note de refonte initiale
- [docs/UI-UX.md](UI-UX.md) — charte formulaires et breakpoints
- [docs/MYSQL.md](MYSQL.md) — configuration base de données
