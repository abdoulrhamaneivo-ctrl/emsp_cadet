# 👤 Refonte — Profils & Annuaire

**Date :** 2026-06-20  
**Fichiers modifiés :**
- `templates/parrainage/detail_aine.html`
- `templates/parrainage/annuaire.html`
- `templates/accounts/profil_aine.html`
- `templates/accounts/profil_cadet.html`

---

## Fiche Ainé — Présentation immersive (`detail_aine.html`)

### Avant
Simple `<h1>` + boîte texte plate avec les sections en `<h3>` successifs. Aucune photo, aucune mise en valeur visuelle.

### Après — Hero immersif
```
┌────────────────────────────────────────────────────┐
│  [GRADIENT ÉMERAUDE ANIMÉ]                         │
│  ┌──────────────────────────────────────────────┐  │
│  │ OVERLAY dégradé bottom-up                   │  │
│  │  ┌──────┐  Jean DUPONT                       │  │
│  │  │Photo │  ⭐ Ainé  [Filière]  [L2]          │  │
│  │  │110px │  ★★★★☆ 3.8/5 · Score fiabilité    │  │
│  │  └──────┘              [Demander un parrainage] │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

### Sections détail en grille
Chaque section = `ac-detail-section` :
- Icône Font Awesome dans pastille émeraude
- Titre uppercase petit
- Texte lisible (linebreaks)

| Section | Icône |
|---|---|
| Ambitions | 🚀 `fa-rocket` |
| Motivations | 🔥 `fa-fire` |
| Projets | 📊 `fa-project-diagram` |
| Points forts | 🛡 `fa-shield-alt` |
| Centres d'intérêt | ❤️ `fa-heart` → tags pill |

### Centres d'intérêt
Affichés en tags `ac-interest-tag` (pill émeraude) au lieu d'une chaîne de texte brute.

### Badges
Format `ac-badge-item` avec icône trophée et couleur dorée.

---

## Annuaire des Ainés (`annuaire.html`)

### Avant
Cartes grises basiques, aucune photo, score fiabilité non visible.

### Après
**Profile cards** avec :
- Bannière émeraude en haut
- Avatar en overlap (photo réelle ou initiales sur gradient)
- Nom + filière + classe
- Centres d'intérêt (texte tronqué 60 chars)
- Étoiles fiabilité animées (`data-star-rating`) + score numérique
- Badge "Nouveau" si score = 0
- Compteur cadets actifs
- Boutons : "Voir le profil" + "Demander" (si Cadet)

### Filtre amélioré
- Encadré blanc avec box-shadow
- Icônes sur les labels
- Bouton "Réinitialiser" en plus du "Filtrer"
- `data-ac-autofilter` → submit auto sur changement de select

---

## Profil Ainé (`profil_aine.html`)

### Nouveautés
- **Hero banner** en haut avec rôle badge vert
- **Photo preview live** : deux emplacements synchronisés (hero + formulaire)
  - FileReader → src mis à jour immédiatement sans recharger
- **Sections organisées** avec `ac-section-title` :
  1. Identité (prénom, nom, filière, classe)
  2. Photo de profil (avec zone drag-and-drop visuelle)
  3. Profil public (ambitions, motivations, projets, points forts)
  4. Centres d'intérêt
- Labels enrichis avec icônes Font Awesome
- Boutons `ac-btn--primary` / `ac-btn--secondary`

---

## Profil Cadet (`profil_cadet.html`)

### Nouveautés
- **Hero banner** avec badge doré 🎓
- **Photo preview live** identique au profil Ainé
- **Section Attentes** enrichie avec message d'explication
- Structure propre en deux sections distinctes

---

## Note technique
La variable `utilisateur` dans les templates profil doit être passée par la view. Vérifiez que `views.py` `profil()` passe bien `{'utilisateur': request.user, 'form': form}` dans le contexte.
