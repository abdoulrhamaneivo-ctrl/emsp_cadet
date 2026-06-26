# Synthèse des exigences — déduites du code EMSPCONNECT

> **Important :** aucun cahier des charges externe n'existe dans le dossier EMSPCONNECT.  
> Ce document reconstitue les besoins **uniquement** à partir de `index.html`, `formations-fs-menum.html`, `emsp-custom.css` et de la navigation prévue.

---

## 1. Exigences graphiques et UX

### Charte couleurs (implémentée)

Définie dans `emsp-custom.css` et synchronisée dans `assets/sass/libs/_vars.scss` :

| Couleur | Code | Usage observé |
|---------|------|---------------|
| Vert EMSP | `#147c71` | Accent principal, bandeaux, sidebar stats |
| Vert foncé | `#264719` | Titres, fond stats institutionnelles |
| Vert moyen | `#446324` | Variable déclarée |
| Jaune EMSP | `#ef9c00` | Accents, bordures, CTA |
| Jaune vif | `#ecf40b` | Hero tag, highlights titre |
| Bleu institutionnel | `#1a5276` | Lien espace étudiant |
| Blanc | `#ffffff` | Fond, contraste |

### Contraintes UX visibles

- Site en **français** (`lang="fr"`)
- Layout **sidebar + contenu principal** (template Editorial)
- **Responsive** : breakpoints Editorial + media queries dans `emsp-custom.css` (980px, 480px)
- Visuels : **SVG placeholders** avec dégradé charte EMSP (pas de photos réelles dans le dépôt)

---

## 2. Besoins fonctionnels (déduits du code)

### 2.1 Navigation

Structure implémentée dans la sidebar (`#menu`) des deux pages EMSP :

```
Accueil                    → index.html ✅
Formations
  ├── FSP                  → # (placeholder)
  ├── FS MENUM             → formations-fs-menum.html ✅
  ├── Mastère RegNUM       → # (placeholder)
  └── Formation Continue   → # (placeholder)
Médiathèque                → # (placeholder)
Contact                    → # (placeholder)
Espace Étudiant            → # (placeholder, style bleu)
```

### 2.2 Page d'accueil (`index.html`)

Contenu présent :

- Hero FS MENUM — **3e promotion 2025-2026**
- Présentation EMSP (DG Michel TOURE, 8 pays membres, création 1971)
- Bandeau chiffres clés : 10 cycles, 80 majors, 2000 diplômés, 8 pays
- Cartes formations : FSP, FS MENUM (lien actif), Mastère RegNUM
- Section médiathèque avec mention bibliothèque numérique réservée
- CTA « S'inscrire au concours » (lien placeholder)
- Coordonnées contact dans sidebar
- Réseaux : Facebook actif, LinkedIn/YouTube placeholder

### 2.3 Page FS MENUM (`formations-fs-menum.html`)

Contenu présent :

- En-tête gradient « Économie Numérique / FS MENUM »
- Présentation de la filière
- Parcours Ingénierie et Management (cartes `.emsp-tracks`)
- Objectifs pédagogiques (liste à puces)
- Bandeau inscriptions 2025-2026 (`.emsp-cta`)
- Chiffres sidebar : 100 % insertion, 15+ partenaires, 10 semestres LMD

### 2.4 Autres formations (prévues, non créées)

L'accueil et le menu référencent des pages à créer :

- **FSP** — Formations Supérieures Postales (carte + lien `#`)
- **Mastère RegNUM** — Régulation du Numérique (carte + lien `#`)
- **Formation Continue** — Entrée menu sans contenu associé

### 2.5 Médiathèque (prévue, non créée)

- Section sur l'accueil : actualités, événements, ressources publiques
- Bouton « Consulter la médiathèque » → `#`
- Mention explicite : bibliothèque numérique réservée aux étudiants, éducateurs et enseignants

### 2.6 Bibliothèque numérique (mentionnée, non implémentée)

Texte sur l'accueil :

> « La bibliothèque numérique est réservée aux étudiants, éducateurs et enseignants. »

Aucune page, authentification ou contrôle d'accès n'existe dans EMSPCONNECT.

### 2.7 Espace étudiant (prévu, non implémenté)

- Lien sidebar `.emsp-student-link` (couleur bleue)
- Destination : `#` (placeholder)
- Aucun modal, formulaire de connexion ou page dédiée

### 2.8 Contact

- **Partiellement fait** : bloc contact dans sidebar (email, téléphone, adresse)
- **Manquant** : page `contact.html`, formulaire

### 2.9 Concours / inscriptions (prévus, non implémentés)

- CTA hero « S'inscrire au concours » → `#`
- CTA page FS MENUM « S'inscrire » → `#`
- Aucune page concours ni formulaire

---

## 3. Besoins non fonctionnels

| Exigence | État dans EMSPCONNECT |
|----------|----------------------|
| Site statique léger | ✅ HTML/CSS/JS sans build obligatoire |
| HTML sémantique, `lang="fr"` | ✅ Sur les pages EMSP |
| Meta description SEO | ✅ Sur `index.html` et `formations-fs-menum.html` |
| Accessibilité images | ✅ Attributs `alt` sur images EMSP |
| Maintenabilité CSS | ✅ SASS source + `emsp-custom.css` séparé |
| Licence template | ✅ CCA 3.0 (HTML5 UP Editorial) — crédit conservé dans footer |

---

## 4. Contenu institutionnel (tel qu'affiché)

### Chiffres EMSP (accueil)

- 10 cycles de formation
- 80 majors
- 2000 diplômés
- 8 pays membres

### Chiffres FS MENUM (page filière)

- 100 % insertion professionnelle
- 15+ partenaires grands comptes
- 10 semestres (LMD)

### Citation DG

> « Nous formons les leaders de la transformation numérique de demain. » — **Michel TOURE**, DG EMSP

---

## 5. Lacunes documentaires

| Élément | Statut |
|---------|--------|
| Cahier des charges formel dans EMSPCONNECT | ❌ Absent |
| Spécifications backend | ❌ Non applicable (site statique) |
| Planning / jalons | ❌ Non documenté |
| Images photographiques | ❌ Uniquement SVG placeholders |
| Pages `generic.html` / `elements.html` | ⚠️ Template HTML5 UP original, non adaptées EMSP |

---

## 6. Critères d'acceptation (état réel)

- [x] Couleurs EMSP appliquées
- [x] Logo EMSP intégré (`assets/images/logo.svg`)
- [x] Navigation avec sous-menu Formations
- [x] Page d'accueil orientée FS MENUM
- [x] Page FS MENUM détaillée
- [ ] Pages FSP, RegNUM, Formation Continue
- [ ] Page Médiathèque
- [ ] Page Contact dédiée
- [ ] Espace étudiant fonctionnel
- [ ] Bibliothèque numérique avec contrôle d'accès
- [ ] Formulaire concours / inscriptions
- [ ] Remplacement des placeholders `#` par de vraies pages
- [ ] Images réelles (photos campus, formations)
