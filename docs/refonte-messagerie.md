# 💬 Refonte — Messagerie Premium

**Date :** 2026-06-20  
**Fichier modifié :** `templates/parrainage/messages.html`

---

## Problèmes résolus

| Avant | Après |
|---|---|
| Zone messages avec scroll mais sans structure de chat | Interface chat complète flex-column |
| Bulles simples sans distinction visuelle forte | Bulles style iMessage (droite = moi, gauche = autre) |
| Pas d'avatar dans les bulles | Avatar ou initiales sur chaque bulle de l'interlocuteur |
| Formulaire en bas sans sticky | Zone compose sticky avec auto-resize |
| Pas de séparateur de date | Séparateur `ac-chat-date-sep` entre groupes de messages |
| Bouton Envoyer basique | Bouton pill circulaire avec icône envoi |
| En-tête plat avec `<h1>` | Header dégradé émeraude avec photo + rôle + actions |

---

## Structure de la page

```
┌─────────────────────────────────────────┐
│  HEADER (émeraude)                      │
│  [Avatar] Nom Partenaire                │
│  Votre Ainé · Filière · Actif          │
│                    [📅 RDV] [Profil]   │
├─────────────────────────────────────────┤
│  MESSAGES (flex scroll)                 │
│                                         │
│  ── 19/06/2026 ──────────────────────  │
│                                         │
│  [Av]  Bonjour ! ...                   │
│         (bulle gauche blanche)          │
│                                         │
│                    ... Merci !  [Moi]  │
│               (bulle droite verte)      │
│                                         │
│  ── 20/06/2026 ──────────────────────  │
│                                         │
│  [Av]  RDV demain ?                    │
│                                         │
├─────────────────────────────────────────┤
│  COMPOSE (sticky)                       │
│  [Textarea auto-resize]    [📤 Envoyer]│
└─────────────────────────────────────────┘
```

---

## Détails techniques

### Bulles `ac-bubble`
```css
/* Bulle "moi" (droite) */
.ac-bubble--mine .ac-bubble__text {
  background: var(--ac-gradient-stat);  /* émeraude */
  color: white;
  border-bottom-right-radius: 0.3rem;  /* pointe */
}

/* Bulle "autre" (gauche) */
.ac-bubble--theirs .ac-bubble__text {
  background: white;
  border: 1px solid var(--ac-gray-200);
  border-bottom-left-radius: 0.3rem;
}
```

### Séparateur de date
Utilise `{% regroup fil_messages by date_envoi|date:"d/m/Y" %}` Django pour regrouper les messages par jour.

### Zone compose
- `Ctrl+Enter` → submit du formulaire
- Auto-resize : `height: auto` puis `scrollHeight` limité à 120px
- Submit via `form.submit()` natif (pas d'AJAX, compatible avec le système de polling existant)

### Indicateur non-lu
Pastille dorée pulsante `ac-bubble__unread` sur les messages non lus de l'interlocuteur.

### Header enrichi
- Photo réelle si disponible (`.photo.url`)
- Sinon initiales sur fond semi-transparent
- Lien "Proposer un RDV" et "Voir son profil" si Ainé

---

## RDV liés (section sous le chat)
Format `ac-rdv-item` avec :
- Mini-calendrier (jour + mois)
- Tag statut coloré (success/info/neutral)
- Boutons réponse si en attente et non-organisateur
