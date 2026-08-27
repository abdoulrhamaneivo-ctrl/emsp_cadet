# EMSP Connect v2 — Spec MES DEMANDES & MON PARRAINAGE (v2 casquettes)
## Doc 05 — Demandes (§3.3), suivi du binôme, et entrée Famille/Cercles

> Prérequis : docs 02, 03, 04. Feature dir : `src/features/parrainage/`
> **Modèle v2** : Cadet/Aîné sont des CASQUETTES cumulables (voir doc 02 §1). Un L2+ ouvert au parrainage peut avoir SON Aîné ET ses cadets simultanément — cette page montre les DEUX facettes. Les groupes (famille/cercles) ont leur spec complète doc 13 ; cette page en expose les points d'entrée.

---

## 1. Objectif

Deux pages jumelles qui matérialisent §3.3 :
- `/mes-demandes` : boîte de gestion des demandes — **envoyées** (toujours disponible, tout niveau) et **reçues** (visible UNIQUEMENT si candidature Aîné ouverte).
- `/mon-parrainage` : l'état vivant des deux sens du lien (Mon Aîné / Mes cadets) + historique + accès aux Familles & Cercles.

**Users stories :**
- Étudiant (tout niveau) : je suis mes demandes envoyées (en attente / refusée avec motif / annulable).
- L2+ avec candidature ouverte : je traite mes demandes reçues en inspectant chaque cadet, dans la limite de 5 places (RG2).
- Chacun : depuis mon-parrainage je vois ma famille de parrainage et mes cercles, je rejoins leurs discussions.
- L1 : il ne voit QUE la facette cadet (jamais d'onglet Reçues, jamais de bloc Mes cadets).

---

## 2. Données & API

```
GET  /api/me/parrainage/           → {
       monAine: Binome|null,              // facette cadette
       cadetsActifs: Binome[],            // facette aînée (vide si candidature fermée)
       historiqueEnvoyes: [...], historiqueRecus: [...] }
GET  /api/demandes/?sens=envoyees|recues&statut=
     → { count, results: DemandeParrainage[] }   // recues renvoie [] si candidature fermée (serveur garantit)
POST /api/demandes/:id/repondre/    // body {decision:"acceptee"|"refusee", motifRefus?}
PATCH /api/demandes/:id/annuler/    // demandeur, seulement statut=en_attente
POST /api/parrainages/:id/cloture/  // body {raison:"fin_annee"|"abandon"} → trigger avis (RG6)
GET  /api/me/groups-resume/         // → [{conversationId,type:"famille"|"cercle",titre,nbMembres}] (doc 13)
```
Clés query : `["demandes", sens, filtres]`, `["mon-parrainage"]`, `["groups-resume"]`. Invalidation croisée systématique : toute mutation invalide `["parrains"]`, `["suggestions"]`, `["mon-parrainage"]`, `["accueil-stats"]`, `["groups-resume"]` (une acceptation crée la famille !).

Le `Binome = { id, autre: User, dateDebut, statut, avisDonne: boolean, sens: "recu_de_mon_aine"|"donne_a_mon_cadet" }`.

---

## 3. Structure fichiers

```
src/features/parrainage/
├── pages/
│   ├── MesDemandesPage.jsx        # /mes-demandes
│   └── MonParrainagePage.jsx      # /mon-parrainage
├── components/
│   ├── CarteDemandeRecue.jsx      # actions aîné (onglet Reçues)
│   ├── CarteDemandeEnvoyee.jsx    # timeline statuts
│   ├── PanneauMonAine.jsx         # facette cadette
│   ├── GrilleMesCadets.jsx        # facette aînée (jusqu'à 5 cartes + JaugeCapacite)
│   ├── BlocFamilleCercles.jsx     # point d'entrée groupes (composants listés doc 13)
│   ├── HistoriqueParrainages.jsx  # binômes clos, deux sens confondus
│   └── ModaleReponse.jsx
├── hooks/useDemandes.js
├── hooks/useGroupsResume.js
└── rules.js                       # peutVoirRecues(user): candidatureAineOuverte
                                   # peutAccepter(user): place libre ∧ candidature ouverte
```

---

## 4. Wireframe — `/mes-demandes`

```
╔══ PROTECTED SHELL ══════════════════════════╗
║ h1 "Mes demandes"                           ║
╠ TABS [Envoyées (2)] [Reçues (4)] ═══════════╗   ← onglet Reçues ABSENT si candidature fermée
║                                             ║   ou L1
║ [SI recues masquées] Encart discret or :    ║
║  « Veux-tu accompagner des cadets ? Ouvre   ║
║  ta candidature dans ton profil » [Ouvrir →]║
╠═════════════════════════════════════════════╣
║ FILE CarteDemandeRecue ×N (stagger)         ║
║ │ [Avatar] Prénom NOM · L1 Digitalisation  ║
║ │ Attentes : « ... »                        ║
║ │ [Refuser outline-danger][Accepter primary]│
║ └── si déjà 5/5 (RG2) : disabled + chip or  ║
║     « Complet — libère une place »          ║
╚═════════════════════════════════════════════╝
```

Onglet Envoyées (tous niveaux) : timeline Envoyée → En examen → Réponse ; en attente → « Annuler » ghost-danger ConfirmDialog ; refusée → motif si partagé + CTA retour annuaire.

---

## 5. Wireframe — `/mon-parrainage` (double facette)

```
╔═ HERO pleine largeur panel vert profond kente-band ═╗
║ h1 "Mon parrainage" · meta casquettes actives        ║
╠ GRID lg:[1fr_1fr] ═══════════════════════════════════╣
║ ┌─ PANNEAU MON AÎNÉ (facette cadette) ─┐             ║
║ │ SI actif :                            │             ║
║ │  label or "TON AÎNÉ"                  │             ║
║ │  [Avatar xl] Awa KONÉ ★4.8            │             ║
║ │  binôme depuis février 2026           │             ║
║ │  [Messagerie primary][Rendez-vous out.]             ║
║ │  prochains RDV aperçu (carte mini)                   ║
║ │ SINON EmptyState Compass « Trouve ton Aîné »        ║
║ │      [Vers l'annuaire primary]                       ║
║ └────────────────────────────────────────┘            ║
║ ┌─ PANNEAU MES CADETS (facette aînée) ──┐             ║
║ │ SI candidature FERMÉE ou L1 : panneau état neutre   ║
║ │  L1 : « Tes aînés t'accompagnent — c'est ton tour   ║
║ │        en L2 ! » (motivant, pas informatif sec)     ║
║ │  L2+ fermé : resume (« Tu accompagnais 2 cadets »)  ║
║ │  + bouton [Ouvrir ma candidature →profil]           ║
║ │ SI OUVERT : JaugeCapacite XL n/5 + grille stagger   ║
║ │  CarteCadet[Avatar, nom, classe, menu →msg/RDV] ×k  ║
║ └────────────────────────────────────────┘            ║
╠ BLOC FAMILLE & CERCLES (panel crème-alt whileInView) ═
║ cartes horizontales (cf doc 13) :                     ║
║  « Ma famille — Awa & 4 cadets » [avatarStack] [→chat]║
║  « SQL Squad — cercle · 6 membres » [→chat]           ║
║  [+ Créer un cercle gold-outline] si ≥1 relation      ║
╠ HISTORIQUE (panneau, antéchronologique) ══════════════
║ binômes clos (2 sens) chip revue : « Avis donné ✓ » / │
║ « En attente de ton avis » or                          │
╚═══════════════════════════════════════════════════════╝
```

---

## 6. Logique métier localisée (rules.js)

```js
// peutAccepter(user, demande): user.candidatureAineOuverture && compte<5 && demande.en_attente
// peutAnnuler(demande, user): statut==="en_attente" && envoyéePar user
// clôture (RG6): déclenche backend → front écoute avisRequis → modale doc 07
// NOTE RG9: les quotas (RG2) comptent la facette aînée seule; être soi-même cadet chez quelqu'un
//           d'autre n'y change RIEN (pas de double-compte entre casquettes)
```

Confirmations obligatoires : refuser (checkbox « partager la raison »), annuler demande, clôturer binôme (radio raison + rappel conséquences RG6 — le cadet sort aussi de la famille, cf doc 13 G4).

---

## 7. Animations

- Hero : fadeInUp + kente-band slide-in léger
- Grilles : staggerContainer ; changement d'onglet AnimatePresence mode="wait"
- Passage « candidature ouverte » depuis l'encart : transition douce vers /profil (scroll vers l'ancre toggle) via location.state
- Badge compteur tabs pulseGentle sur changement

## 8. Accessibilité & critères d'acceptation

1. L'utilisateur L1 ne voit JAMAIS l'onglet Reçues ni un bloc Mes cadets — vérifier rendu conditionnel ET absence totale du DOM (pas juste caché).
2. Candidature fermée : /mes-demandes?tab=recues force l'affichage de l'encart plutôt que la liste (impossible de contourner par URL).
3. Un aîné ne peut PAS accepter au-delà de 5 (disabled + motif), même si l'API échoue à bloquer.
4. Accepter une demande fait apparaître la Famille dans le bloc groupes immédiatement (invalidation ["groups-resume"]) — test manuel obligatoire.
5. Une demande annulée disparaît d'« Envoyées » sans ressaisie possible tant que 409 purgé.
6. Historique complet tous binômes clos des deux sens, antéchronologique.
7. Checklist design-system doc 03 §11 complète.
