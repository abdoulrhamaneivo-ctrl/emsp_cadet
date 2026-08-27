# EMSP Connect v2 — Spec MESSAGERIE PRIVÉE BINÔME
## Doc 08 — Chat temps réel après acceptation (cahier §3.4)

> Prérequis : docs 02 (`Conversation`, `Message`, RG1), 03. Feature dir : `src/features/messagerie/`
> **Décision produit validée (août 2026)** : la messagerie PRIVÉE reste réservée au binôme accepté (conforme cahier §3.4). Les échanges plus larges passent par les espaces collectifs (doc 09 Fil, doc 10 Événements).

---

## 1. Objectif

Chat privé 1-to-1 entre cadet et aîné d'un même binôme, activé automatiquement dès acceptation de la demande (§3.3). Indicateur de messages non lus fiable (§3.4 exact). Temps réel via WebSocket.

**Users stories :**
- En tant que membre d'un binôme, je vois toutes mes conversations actives avec le compteur de non-lus à jour en temps réel.
- En tant qu'expéditeur, mon message part instantanément à l'écran puis se confirme (envoyé ✓).
- En tant que destinataire absent, je retrouve mes messages et mon compteur de non-lus exact au retour (aucune perte).
- Si je n'ai PAS de binôme actif, je n'accède PAS à cette page (redirection vers où je peux agir).

---

## 2. Données & API

### REST (chargement historique, mutation lisible)
```
GET  /api/conversations/
     → { results: Conversation[] }        // une par binôme actif + archivées si clos
GET  /api/conversations/:id/messages/?avant=&page=
     → { hasMore, cursor, results: Message[] }   // pagination curseur DESCENDANTE (du plus récent)
POST /api/conversations/:id/messages/     // body {contenu, idempotencyKey} → 201 Message
PATCH /api/conversations/:id/lu/          // body {dernierMessageId} — accusé de lecture
```

### WebSocket (temps réel) — contrat strict
```
Connexion   : wss://.../ws/chat/?token=<JWT>       (VITE_WS_URL)
Subscribe   : {"type":"join","conversationId":42}
Server push :
  {"type":"message.new","conversationId":42,"message":{...}}
  {"type":"message.lu","conversationId":42,"parUserId":7,"jusquaMessageId":998}
Client emit :
  {"type":"typing","conversationId":42,"etat":true|false}   (throttle 2s)
Recevoir    : {"type":"presence","userId":7,"enLigne":true}   // indicateur point vert
Reconnexion : client reconstruit via REST refetch delta ?apres=messageId
```

Règles hard :
1. `idempotencyKey` UUID généré PAR MESSAGE côté client, envoyé au POST, gardé en retry — garantit zéro doublon réseau. Le serveur renvoie le même message si clé déjà vue.
2. Un utilisateur hors binôme reçoit 403 sur toute URL de conversation étrangère → redirection `/messagerie`.
3. Compteur non-lus : source de vérité SERVEUR (`nonLus` de Conversation + événement WS incrémental). Le front n'invente jamais un décompte.
4. Messages texte uniquement V1, max 2000 chars (zod + compteur live). Pas de pièces jointes en V1 (phase ultérieure avec stockage externe).

Clés query : `["conversations"]`, `["messages", convId]`. Invalidation `["conversations"]` à chaque `message.new` reçu hors page ouverte.

---

## 3. Structure fichiers

```
src/features/messagerie/
├── pages/
│   ├── MessagerieListPage.jsx      # /messagerie
│   └── ConversationPage.jsx        # /messagerie/:conversationId
├── components/
│   ├── ListeConversations.jsx      # panneau gauche desktop / liste mobile
│   ├── CarteConversation.jsx       # avatar + dernier message + badge non-lus
│   ├── BulleMessage.jsx            # bulle mienne/lautre + état d'envoi + heure
│   ├── EnteteConversation.jsx      # identité interlocuteur + presence + lien parrainage
│   ├── ZoneSaisie.jsx              # textarea auto-expand + envoi Enter/Maj+Enter newline
│   └── IndicateurTyping.jsx        # « Prénom écrit… »
├── hooks/
│   ├── useWebSocketChat.js         # connexion unique globales, reconnexion exponentielle 1s→30s
│   ├── useMessages.js              # query paginée + mutation optimiste idempotente
│   └── useTyping.js                # emitter throttled
└── schemas.js                      // zod contenu 1..2000
```

---

## 4. Wireframe — `/messagerie`

```
╔══ PROTECTED SHELL ═══════════════════╗
║ h1 "Messagerie" meta "2 conversations"║
╠ PANEL pleine largeur ════════════════╣
║ LISTE (stagger)                       ║
║ ┌───────────────────────────────────┐ ║
║ │ [Avatar md •point vert]           │ ║
║ │  Awa KONÉ                    14h32│ ║
║ │  Oui je te confirme demain…   (3) │ ║ ← badge gold accent non-lus
║ └───────────────────────────────────┘ ║
║ EmptyState : « Ta messagerie s'activera dès »
║ « qu'un Aîné acceptera ta demande » [Voir l'annuaire]
╚═══════════════════════════════════════╝
Desktop ≥1024px : split-view liste gauche 340px + conversation droite OUVERTE directement (la plus récente).
Mobile : navigation liste→conversation empilée.
```

## 5. Wireframe — `/messagerie/:conversationId`

```
╠ ENTÊTE (panel vert profond opaque sticky) ══════
║ [← mobile] Avatar XL + nom H1-h2 + filière · presence (« En ligne » luminous / « Vu il y a 5 min » muted)
║ actions: [Signaler ⋯ menu modération]
╠ FIL DE MESSAGES (panel crème, scroll interne) ══
║ date separators «Aujourd'hui» mono uppercase    ║
║ Bulle AUTRE (bg-panel-alt bord soft, alignée G) ║
║ Bulle MIENNE (accent-green texte crème, à D):   ║
║   coin radius asymétrique (16/16/16/4) — signature visuelle chat
║   heure muted-xs + état: ⏳ honte grise → ✓ lu  ║
║   (échec → icône alerte danger clic=pour renvoyer)
║ IndicateurTyping animé 3 points bounce          ║
╠ ZONE SAISIE (sticky bottom, fond opaque) ════════
║ [textarea 1-6 lignes auto]  [Envoyer primary круглый icon Send]
╚══════════════════════════════════════════════════╝
```

Comportements clés :
| Situation | Comportement |
|---|---|
| Ouverture conversation | scroll bas auto + PATCH lu immédiat (badge remis à 0 partout : sidebar, liste, nav globale) |
| Nouveau msg pendant lecture | push WS → append animé (fadeInUp léger) + marquage lu auto SI fenêtre focus |
| Nouveau msg autre conversation | badge liste + toast discret cliquable → navigation |
| Historique long | bouton « Charger les anciens » prepend (scroll préservé — calcul offset) |
| Perte WS | bannière fine danger top du fil « Connexion perdue — reconnexion… » ; queue des envois locaux rejoués à la reprise (idempotencyKeys préservées) |

---

## 6. Animations

- Transition page list↔conv : pageTransition
- Bulles entrantes : fadeInUp 140ms (jamais spring exubérant — lisibilité chat)
- Badge non-lus : pop scale quand incrémente
- Typing : trois points bounce loop CSS (pas framer — perf)
- Presence dot : pulseGentle subtil quand passe en ligne

## 7. Accessibilité & perf

- Fil : `role="log" aria-live="polite"` — lecteurs d'écran annoncent nouveaux messages
- Saisie : label réel + hint raccourcis ; Escape vide/défocus
- Virtualisation du fil NON requise V1 (<1000 msgs/binôme/an) mais pagination obligatoire
- Dark mode vérifié spécialement sur bulles miennes/accent-green

## 8. Critères d'acceptation

1. Sans binôme actif → impossible d'afficher une conversation (garde + 403 géré).
2. Double envoi réseau simulé → UN seul message visible (tester idempotencyKey manuellement via devtools throttle).
3. Fermer l'app au milieu d'une conversation puis revenir → messages, position scroll et non-lus exacts.
4. Le compteur sidebar et le badge nav globale sont TOUJOURS cohérents entre eux (même source `["conversations"]`).
5. Bascule offline/on reconnecte sans duplication ni perte.
6. Checklist design-system doc 03 §11 complète.

## 9. Frontières (ne PAS faire ici)

- Notifications email/push (backend, doc 06 rappels différents)
- Signalement admin UX complet (doc 12 consomme les données)
- Partage photos/docs → phase future
