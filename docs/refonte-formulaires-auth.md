# 🔐 Refonte — Formulaires Auth & Inscription

**Date :** 2026-06-20  
**Fichiers modifiés :**
- `templates/accounts/inscription.html`
- `templates/accounts/login.html`
- `templates/parrainage/demande_form.html`
- `templates/parrainage/rdv_form.html`
- `templates/parrainage/avis_form.html`
- `templates/parrainage/evenement_form.html`

---

## Problème principal résolu : On ne savait pas quel rôle on choisissait

### Avant (inscription)
Les radios Cadet/Ainé étaient rendus avec `_form_fields.html` — deux boutons radio standard sans aucune mise en valeur visuelle. L'utilisateur ne voyait pas clairement ce qu'il choisissait.

### Après — Role Picker Cards

```
┌──────────────────┐  ┌──────────────────┐
│        🎓        │  │        ⭐        │
│     Cadet        │  │      Ainé        │
│  Étudiant L1 en  │  │  Étudiant       │
│  recherche d'un  │  │  devancier prêt  │
│  accompagnement  │  │  à partager...  │
│  [Filleul]       │  │  [Parrain]       │
└──────────────────┘  └──────────────────┘
```

- Clic sur la carte → border émeraude + fond clair + ✓ animé (top right)
- `is-selected` géré par JS (`ac-animations.js > initRolePicker`)
- Radio natif caché mais toujours soumis avec le formulaire
- Champ "Attentes" masqué/affiché dynamiquement selon le rôle sélectionné (JS inline)

---

## Formulaire Inscription — Structure en sections

1. **"Je m'inscris en tant que"** → Role picker cards (EN PREMIER)
2. **Informations personnelles** → Prénom, Nom, Email
3. **Filière & Classe** → 2 colonnes
4. **Mes attentes** → Visible uniquement si Cadet sélectionné
5. **Sécurité** → Mot de passe + Confirmation
6. **CTA** → "Créer mon compte" full-width + lien "Déjà inscrit ?"

---

## Page Connexion (`login.html`)

### Avant
Simple `<h1>` + champs + bouton.

### Après — Auth Card
- Card centrée (`ac-auth-card`) avec header émeraude
- Icône 🔐 + Titre + Sous-titre
- Erreurs non-field affichées en bloc rouge avec icône
- Lien "Mot de passe oublié ?" discret
- Bouton "Créer un compte" côte à côte
- **Indicateur rôle** en bas : 🎓 Cadets / ⭐ Ainés (informatif, aide à comprendre l'application)

---

## Formulaires secondaires

### `demande_form.html`
- Mini-profil de l'Ainé dans le header (photo ou initiales + filière + classe)
- Message conseil en encadré vert : "Un message personnalisé augmente vos chances !"
- CTA "Envoyer la demande" + retour au profil

### `rdv_form.html`
- Header 📅 avec nom du partenaire
- Encadré vert avec la proposition initiale (si contre-proposition)
- Boutons `ac-btn`

### `avis_form.html`
- Header ⭐ avec nom du partenaire
- Message d'encouragement sur l'impact du score fiabilité
- Bouton "Plus tard" secondaire

### `evenement_form.html`
- Header 🎉 descriptif
- Même structure clean

---

## Impact fonctionnel

> **Avant** : L'utilisateur s'inscrit sans savoir s'il est Cadet ou Ainé.  
> **Après** : Le rôle est le PREMIER choix visuel, clair et engageant, avec emoji + titre + description + tag.

Les données soumises au backend restent identiques (valeurs radio `filleul` / `parrain`) — aucune modification backend requise.
