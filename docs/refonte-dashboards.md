# 📊 Refonte — Dashboards Ainé & Cadet

**Date :** 2026-06-20  
**Fichiers modifiés :**
- `templates/parrainage/dashboard_aine.html`
- `templates/parrainage/dashboard_cadet.html`

---

## Problèmes résolus

| Avant | Après |
|---|---|
| Titre `<h1>` plat sur fond blanc | Hero dégradé émeraude animé avec avatar |
| Badge "AINÉ" petit et isolé | Role badge intégré dans le hero (variant aine/cadet) |
| Stats en ligne sans icône | Grid de stat cards avec icône, top-border colorée, hover lift |
| Pas de photo de profil visible | Avatar circulaire dans le hero (photo ou placeholder initiales) |
| Aucune animation | Counters animés `data-ac-counter`, `ac-anim-fade-up` en cascade |
| Bouton "Modifier mon profil" basique | Bouton `ac-btn--secondary` dans le hero |
| Demandes en attente — boîtes plates | `ac-request-card` avec avatar initiales, message en `<blockquote>` |
| Cadets listés en tableau | Cards profil avec photo, attentes, boutons d'action |
| RDV en tableau | `ac-rdv-item` avec mini-calendrier date + lieu + heure |
| Empty states absents ou minimalistes | `ac-empty` avec icône circulaire et texte contextuel |
| Tabs sans icônes | Icônes Font Awesome sur chaque tab |

---

## Dashboard Ainé — nouveautés

### Hero banner
```html
<div class="ac-hero-dash">
  <!-- Avatar (photo ou placeholder initiales) -->
  <!-- Nom + role badge "⭐ Espace Ainé" -->
  <!-- Filière + classe -->
  <!-- Bouton "Mon profil" -->
</div>
```

### Stat cards
4 cards animées (counter `requestAnimationFrame`) :
- Cadets / Capacité max
- RDV à venir
- Score fiabilité (formaté `0,00`)
- Messages non lus (variant `--alert` si > 0)

### Onglet Mes Cadets
Remplace le tableau par des **profile cards** avec :
- Photo de profil (ou initiales)
- Filière + date parrainage
- Attentes du cadet (texte tronqué)
- Boutons : Message / RDV / Terminer (avec `data-confirm`)

### Onglet Rendez-vous
Format `ac-rdv-item` :
- Mini-calendrier gauche (jour + mois)
- Titre + lieu + heure + nom du cadet
- Pour les RDV à traiter : boutons ✓ ✗ ↺

---

## Dashboard Cadet — nouveautés

### Hero banner
- Role badge doré (`ac-hero-dash__role-badge--cadet`) avec emoji 🎓
- Statut dynamique : si accompagné → nom de l'Ainé en vert, sinon "en recherche"
- Bouton "Trouver un Ainé" visible si pas de parrainage actif

### Onglet Vue d'ensemble
- Si parrainage actif → `ac-request-card` avec photo Ainé, filière, date, boutons Messagerie + Voir profil
- Si pas de parrainage → `ac-empty` + CTA Annuaire
- Suggestions Ainés → profile cards avec photos + étoiles fiabilité

### Onglet Mes demandes
Format `ac-rdv-item` avec tag de statut coloré :
- `ac-tag--success` = Accepté
- `ac-tag--warning` = Refusé  
- `ac-tag--info` = En attente
- `ac-tag--neutral` = Terminé

---

## Variables de contexte attendues (views.py)
Les vues existantes transmettent déjà toutes les variables nécessaires. Aucune modification backend requise.
