# EMSP Connect v2 — Spec GROUPES : FAMILLE & CERCLES
## Doc 13 — Espaces de groupe d'échange (nouveau module produit août 2026)

> Prérequis : docs 02 (Conversation type groupe, RG9), 03, 05 (points d'entrée), 08 (flux messages WS réutilisés TEL QUELS).
> **Origine produit (besoin réel EMSP exprimé par Ivo)** : en L2 on a déjà des filleuls pendant que notre propre aîné nous accompagne ENCORE — la chaîne verticale doit vivre dans l'app. Et seul un L1 ne peut pas être Aîné (RG7) ; chacun pilote sa candidature (RG8).

---

## 1. Objectif

Donner aux étudiants des espaces de discussion COLLECTIFS au-delà du chat privé binôme :
- **La Famille** : le groupe vertical naturel autour d'un Aîné (ses cadets + lui + optionnellement SON propre aîné). Automatique, protégée, sensible à la vie des binômes.
- **Les Cercles** : groupes libres créés par un étudiant, peuplés uniquement de SES relations actives (filleuls, aîné, frères de famille). Private clubs maîtrisés.

**Users stories :**
- Aîné : ma Famille existe automatiquement dès mon premier binôme ; tous mes cadets y discutent ensemble avec moi.
- Aîné ayant son propre aîné : j'invite mon grand-aîné dans la famille (option « famille étendue ») — la chaîne complète s'échange.
- Filleul : je retrouve dans Ma Famille mon aîné ET mes frères-filleuls ; je pose mes questions au groupe avant de déranger en privé.
- Tout étudiant avec ≥1 relation : je crée un Cercle (ex. « Révisions algo L2 ») et j'invite uniquement les gens liés à moi.
- Membre : je quitte un Cercle librement ; le propriétaire gère invitants/membres.

---

## 2. Deux objets, un moteur

| | **Famille** (`groupe_famille`) | **Cercle** (`groupe_cercle`) |
|---|---|---|
| Création | AUTOMATIQUE dès 1er binôme accepté (propriétaire = l'Aîné) | Manuelle, par tout étudiant ayant ≥1 relation active |
| Membres | L'Aîné + ses cadets actifs (+1 grand-aîné si « étendue » activée) ≤7 | Invitations acceptées uniquement parmi SES relations actives ≤12 |
| Nom | Fixe : « Famille de {prenom aîné} » | Libre (3–40 chars) + icône lucide au choix parmi set de 8 |
| Vie | Suivent automatiquement les binômes (naissance/fin) | Indépendante, dissolution libre |
| Sortie | Via fin de binôme (auto, G4) ou départ volontaire possible | Départ volontaire à tout moment |
| Modération | Propriétaire + admin global (doc 12 générique) | Propriétaire + admin global |

En interne : UNE entité `Conversation` avec `type:"prive"|"groupe_famille"|"groupe_cercle"` — tout le flux de la doc 08 (WS, idempotence, non-lus, reconnect) fonctionne tel quel.

---

## 3. API complémentaire (REST)

```
GET   /api/me/groups-resume/            // alimente blocs point d'entrée (doc 05, accueil)
GET   /api/conversations/:id/membres/   // → User[] + rolesGroupe ("proprietaire"|"membre")
POST  /api/groups/                      // cercle: {nom, iconeCode, membreIds[]}
                                        //   serveur VÉRIFIE chaque id ∈ relations actives du créateur (RG sinon 403)
POST  /api/groups/:id/inviter/          // body {userId} → invitation en attente
POST  /api/groups/:id/invitations/repondre/ // membre invité : {accepter:true|false}
DELETE /api/groups/:id/membres/:userId/  // exclu par propriétaire (ConfirmDialog)
PATCH /api/groups/:id/                   // nom, iconeCode ; familles: {familleEtendue:boolean}
POST  /api/groups/:id/quitter/
GET   /api/me/relations-invitables/     // candidats selon règles (frères/aîné/filleuls/non déjà membres)
```

Règles serveur = vérité ; front affiche les erreurs gracieusement (403 → explication « Vous n'êtes pas reliés »).

---

## 4. Structure fichiers

```
src/features/groupes/
├── components/
│   ├── CarteGroupe.jsx               # avatarStack + titre + nbMembres + type chip
│   ├── ModaleCreationCercle.jsx      # nom, icône picker, sélection membresInvitables
│   ├── PanneauMembres.jsx            # sidebar du chat de groupe : membres, badges propriétaire
│   ├── FileInvitations.jsx           # chips pendantes (propriétaire) + bannières invité
│   └── ConfigFamilleEtendue.jsx      # toggle propriétaire : intégrer SON aîné
├── hooks/useGroups.js                # resume, memberships, mutations
└── schemas.js                        // nom/icone enums
shared/components/AvatarStack.jsx      # ajouté au contrat composants doc 03 (max 3 avatars + "+n")
```

Intégrations obligatoires ailleurs :
- `MessagerieListPage` (doc 08) : sections-groupes « Binôme / Familles / Cercles ».
- `MonParrainagePage` (doc 05) : bloc points d'entrée.
- Sidebar nav : pas de nouvel item de 1er niveau — les groupes vivent sous Messagerie (simplicité mobile).

---

## 5. Wireframe — chat de groupe `/messagerie/:conversationId` (différences vs privé doc 08)

```
╠ ENTÊTE: icône groupe + Titre · chip TYPE (famille/cercle)
║   sous-ligne « 6 membres » cliquable → drawer PanneauMembres
║   [SI cercle & propriétaire ⚙︎ config] [SI famille & propriétaire ⚙︎ famille étendue]
╠ FIL: bulles IDENTIQUES techniques + SURTITRE nom de
║   l'émetteur (bold xs accent-green) au-dessus de chaque
║   bulle tierce — indispensable en groupe
╠ SAISIE: identique; sélecteur @mention v2 simple (nom,
║   pas de navigation) — NON bloquant V1
╚ DRAWER MEMBRES: liste avec mini-statut binôme (ton
║   frère / ton cadet / ton aîné) chips relation
```

Fil d'invitations : le membre invité voit en tête de sa Messagerie une bannière or persistante tant que non traitée (« X t'invite dans le cercle Y — [Rejoindre][Décliner] »).

---

## 6. Règles dures (G1–G8)

1. **G1** Famille naît AUTOMATIQUEMENT à la première acceptation de binôme côté aîné — zéro action requise, visible instantanément (invalidation groups-resume côté les deux clients).
2. **G2** Propriétaire de famille = l'Aîné. Un L1 ne PEUT jamais être propriétaire (cohérent RG7). Si le propriétaire d'un cercle supprime son compte → transfert auto au membre le plus ancien L2+, sinon archivage.
3. **G3** Fermer sa candidature (RG8) NE dissout NI familles NI cercles — les liens actifs gouvernent.
4. **G4** Fin/clôture d'un binôme : le cadet QUITTE la famille (sortie auto, message système discret « quitte la famille ») ; elle reste vivante pour les autres.
5. **G5** Invitations de cercle limitées aux relations actives du créateur ; l'invitation exige ACCEPTATION explicite de l'invité (jamais d'ajout forcé).
6. **G6** Tailles plafonnées par construction : famille ≤ 7 (structurelle), cercle ≤ 12.
7. **G7** Famille étendue (grand-aîné) = opt-in du propriétaire de la famille ; le grand-aîné reçoit une invitation (il peut refuser — intimité préservée).
8. **G8** Messages = moteur doc 08 strict (idempotencyKey, WS rooms, marquage lu, reconnect). AUCUNE logique divergente front-side.

Signalements : tout message de groupe signalable via le menu ⋯ existant (contentType:groupe_message) → file doc 12 sans adaptation.

---

## 7. Animations contractuelles

- Naissance carte Famille dans /mon-parrainage : scale-pop + shimmer doré ponctuel (once)
- Entrée bulle groupe : fadeInUp 140ms standard
- Drawer membres : slide-in right 240ms ease-out, focus trap
- Bannière invitation : slide-down top + pulseGentle léger jusqu'à décision

## 8. Accessibilité

- CarteGroupe : article avec aria-label « Famille de Awa, 6 membres »
- Drawer membres : role dialog, Escape ferme, retour focus sur déclencheur
- Chips relation (frère/cadet/aîné) : texte réel non abrégé lecteurs d'écran
- Sélecteur d'icônes : radiogroup étiqueté

## 9. Critères d'acceptation

1. Première acceptation de demande par un aîné → la famille apparaît côté aîné ET côté cadet dans les 2 secondes (test manuel invalidation).
2. Clôture du binôme → sortie auto du cadet visible par message système + décompte membres mis à jour partout.
3. Cercle : impossible d'inviter quelqu'un sans relation active (UI masque + 403 géré si contournement).
4. Invitation non traitée : bannière persistante, aucune écriture possible dans le groupe avant acceptation.
5. Le grand-aîné n'est membre QUE si invitation famille-étendue acceptée ; son refus laisse la famille inchangée.
6. Les quotas/nbMembres affichés correspondent toujours à l'API après chaque mutation (pas de compteur fantôme optimiste sur les membres).
7. Bug impossible : deux familles pour le même aîné (unicité serveur + clé React stable).
8. Checklist design-system doc 03 §11.

## 10. Frontières

- Conversations audio/video de groupe : hors scope
- Multipropriétaires / admins délégués de cercle : V2
- Fil d'actualité croisé avec familles (publier DANS sa famille) : V2 — V1 : les familles échangent uniquement en chat
