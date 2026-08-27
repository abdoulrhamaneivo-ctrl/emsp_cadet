# EMSP Connect v2 — Spec EXCLUSIONS & SANCTIONS GRADUÉES
## Doc 16 — Avertissement, suspension, exclusion, appel : l'échelle complète

> Prérequis : docs 02 (RG11), 03, 12 (modération — cette doc ÉTEND l'onglet Comptes), 13 (groupes G4).
> Complète le cahier des charges §2-admin (« Suspend ou supprime un compte ») avec une échelle graduée, transparente et réversible quand c'est possible.

---

## 1. Objectif

Donner à l'administration un pouvoir disciplinaire **gradué, motivé, tracé et contestable** :
- éviter le tout-ou-rien (bannir = dernière marche, pas la première),
- protéger la communauté sans casser brutalement les liens de parrainage vivants,
- garantir à l'utilisateur de comprendre POURQUOI et JUSQU'À QUAND.

**Users stories :**
- Admin : je choisis le niveau de sanction adapté, avec motif obligatoire, et je le lève si la situation évolue.
- Utilisateur sanctionné : je comprends exactement mon état (écran clair à la connexion), la durée, et comment contester.
- Membre : je vois disparaître proprement un compte exclu (groupes, annuaire, contenus) sans trous bizarres.

---

## 2. L'échelle de sanctions (RG11)

| Niveau | Effets | Réversible ? |
|---|---|---|
| **1. Avertissement** | Note sur le compte + notification à l'utilisateur (motif). Aucune restriction | Oui (efface du casier à la demande admin) |
| **2. Suspension temporaire** (7/15/30 j) | Connexion bloquée (écran dédié), compte invisible (annuaire, fil, groupes passifs), messages/contenus CONSERVÉS, binômes GELÉS sans suppression. À la levée : tout reprend à l'identique | Oui — levée anticipée possible |
| **3. Exclusion définitive** | Compte désactivé : sortie des groupes (message système G4), disparition annuaire, contenus publics MASQUÉS (pas supprimés), binômes clôturés avec motif « exclusion » (déclenche RG6 côté cadet si applicable) | Uniquement sur réexamen admin (appel) |

Règles dures :
1. **Motif obligatoire** ≥20 chars pour niveaux 2 et 3 ; la notification à l'utilisateur contient ce motif + durée + voie d'appel. Aucune sanction fantôme.
2. **Jamais automatique** : l'IA peut flagger (doc 17), seul un humain admin sanctionne (RG11).
3. Traçabilité : chaque sanction = enregistrement immuable (type, motif, auteur admin, date, levée éventuelle) visible dans l'historique du compte (tab admin).
4. Cumul guide (pas de règle dure) : 2e suspension d'un même compte → l'UI suggère l'exclusion ; l'admin garde la main.
5. Sécurité compte vs sanction : un compte peut être désactivé pour SECURITÉ (fraude, compte compromis) sans être « exclu » moralement — le motif le dit.

---

## 3. API

```
POST /api/admin/utilisateurs/:id/sanction/
     // body {type:"avertissement"|"suspension"|"exclusion", dureeJours?:7|15|30, motif:string}
POST /api/admin/utilisateurs/:id/lever-sanction/  // body {noteLevée?}
GET  /api/admin/utilisateurs/:id/sanctions/       // historique complet
// état compte étendu : {statut: "actif"|"suspendu"|"exclu", suspensionFin: ISO|null}
```
Côté auth : un compte suspendu reçoit 423 (Locked) sur toute route auth avec payload {motif, fin} ; un compte exclu → 401 + écran générique.

Clés query : `["sanctions", userId]`.

---

## 4. UI — côté utilisateur sanctionné

**Route publique `/compte-suspendu`** (hors shell protégé — accessible même déconnecté) :
```
╔══ PANEL OPAQUE centré ═══════════════════════╗
║ icône ShieldAlert (lucide, muted)            ║
║ h1 "Ton compte est temporairement suspendu"  ║
║ Motif : « ... » (texte intégral admin)       ║
║ Suspension : du 3 sept au 18 sept 2026       ║
║ Jauge days-remaining discrète (framer)       ║
║ Encart muted : « Tu peux contester cette     ║
║ décision auprès de l'administration :        ║
║ [Contacter l'administration → mailto] »      ║
║ [Se déconnecter ghost]                       ║
╚══════════════════════════════════════════════╝
```
Compte exclu : écran neutre « Ce compte a été désactivé. Contacte l'administration pour toute question. » (pas de détail public, le mail de notification contient le motif).

**Comportement shell** : le ProtectedShell intercepte 423 AVANT tout rendu de données → redirect `/compte-suspendu` avec state {motif, fin} — jamais de flash de contenu.

## 5. UI — côté admin (extension doc 12, tab Comptes)

Menu ⋯ enrichi :
```
Avertir (outline) → modale motif
Suspendre (outline-danger) → modale : radios durée 7/15/30 + motif ≥20 chars + récap effets
Exclure (danger plein) → ConfirmDialog 2 étapes : motif + saisie prénom utilisateur + case «
   les binômes en cours seront clôturés (motif exclusion) et les cadets invités à laisser un avis »
Lever la sanction (success, si suspendu) → note optionnelle
Historique sanctions (ghost) → drawer chronologique
```

## 6. Effets dans les espaces collectifs

- Suspensé : il reste dans la LISTE des membres de familles/cercles avec statut « absent temporairement » (chips muted) — ses anciens messages restent lisibles ; il ne peut ni lire (déconnecté) ni écrire.
- Exclu : retiré des groupes (G4, message système « quitte le groupe »), publications/commentaires/offres masqués (panneau « retiré » pattern doc 09), avis masqués, chip discret côté admin only.
- Nom affiché des contenus historiques d'un exclu : « Membre désactivé » (avatar générique) — pas d'effacement réécritant l'histoire des conversations binôme.

## 7. Animations & accessibilité

- Jauge suspension : compteur jours framer-motion count-down léger
- Modales sanctions : stepper gravité visuelle (bordure de plus en plus sombre) — lisibilité de la gravité par la couleur, jamais par la seule icône
- Écran suspension : focus initial sur le motif, aria-live sur les dates

## 8. Critères d'acceptation

1. Impossible d'appliquer suspension/exclusion sans motif ≥20 chars (client ET serveur).
2. Un suspendu ne voit AUCUNE donnée applicative (interception avant render — tester reload sur /accueil).
3. À la levée : reconnexion → état exact d'avant suspension (binômes, non-lus, groupes).
4. Une exclusion clôture les binômes avec motif « exclusion » → les cadets concernés reçoivent le flux RG6 (avis) — la boucle qualité ne casse pas.
5. Chaque sanction apparaît dans l'historique admin avec auteur et horodatage ; une levée aussi.
6. L'échelle est respectée : pas de raccourci exclusion sans passer par la modale double-étape.
7. Checklist design-system doc 03 §11.

## 9. Frontières

- Sanctions automatiques/rate-limiting techniques (anti-spam réseau) : backend, invisible ici
- « Prison à读者 » (lecture seule intermédiaire) : envisagée V2 si besoin réel
- Notification email des sanctions : backend (le front affiche seulement l'état)
