# EMSP Connect v2 — Spec PARCOURS ACADÉMIQUE & TRANSITIONS DE CYCLE
## Doc 15 — L1 → L2 → L3 → {M1/M2 | Alumni} : le choix de fin de cycle

> Prérequis : docs 02 (RG7/RG10), 11 (profil), 12 (transition admin), 14 (alumni).
> **Origine produit (Ivo)** : à la fin de L3, l'étudiant ne disparaît PAS automatiquement en alumni — il peut CONTINUER en Master 1 et 2 à l'EMSP. Le passage alumni devient un CHOIX, pas un verdict.

---

## 1. Objectif

Modéliser le parcours académique complet de l'EMSP et ses moments de transition :
- progression L1→L2→L3→M1→M2 (promotion annuelle),
- à la fin de L3 (et M2) : **déclaration d'intention** de l'étudiant — poursuite ou alumni,
- transition annuelle admin : applique les montées de niveau + bascule les fins de cycle.

**Users stories :**
- Étudiant : je déclare mon intention pour l'année suivante (M1 / Alumni / Indécis) depuis mon profil, quand je veux.
- Admin : chaque fin d'année, je lance la transition : les niveaux montent d'un cran, les L3/M2 sans déclaration claire sont proposés en alumni (ajustable un à un), tout est récapitulé avant exécution.
- M1/M2 : j'ai EXACTEMENT les droits des L2/L3 (éligibilité Aîné, annuaire, quotas) — le master est un niveau comme les autres.

---

## 2. Modèle de données & API

```js
/** niveauEtude (doc 02) élargi :
 * @property {"L1"|"L2"|"L3"|"M1"|"M2"|"alumni"} niveauEtude
 * @property {"master"|"alumni"|"inconnu"} intentionAnneeSuivante   // déclaratif, pertinent L3/M2
 */
```
```
PATCH /api/me/                        // intentionAnneeSuivante libre (étudiant)
GET  /api/admin/transition-apercu/    // → { promotions: [{user, niveauActuel, niveauSuivant}],
                                      //     finsDeCycle: [{user, intention, niveauSuivantPropose}],
                                      //     anomalies: [...] }
POST /api/admin/transition-executer/  // body {decisionParUser: {id: "L2"|"M1"|"alumni"...}}
                                      // → applique TOUT (atomique côté serveur), log complet
```

Règles dures :
1. **Montée standard** : L1→L2→L3→M1→M2 automatique dans l'aperçu admin ; l'admin peut corriger un cas (redoublement — décrémente manuellement).
2. **Fins de cycle** : fin de L3 → proposition selon `intentionAnneeSuivante` (master→M1, alumni→alumni, inconnu→**alumni par défaut**, ajustable). Fin de M2 → alumni (dernier niveau, plus de montée).
3. La transition est **atomique et loggée** : soit tout passe, rien n'est à moitié fait ; récapitulatif avant exécution (compteurs par niveau).
4. Déclarer « master » ne vaut PAS admission officielle — c'est indicatif (l'admin vérifie/ajuste à la transition). Message explicatif dans l'UI.
5. Après transition : les M1/M2 conservent TOUT l'équipement étudiant (RG7 incluse : éligibles Aîné) ; les alumni passent au régime RG10 ; les binômes en cours ne sont PAS cassés par une montée de niveau (seule l'initiative personnelle ou la clôture RG6 arrête un binôme).

Clés query : `["me"]` (invalidation globale), `["transition-apercu"]`.

---

## 3. Impact UI par surface

| Surface | Changement |
|---|---|
| `/profil` (doc 11) | Select niveau complet L1→M2 + section « Mon année prochaine » visible SEULEMENT en L3/M2 (radio Master/Alumni/Indécis + note « déclaratif, vérifié à la transition ») |
| Chips partout (docs 04/14) | « M1 », « M2 » s'affichent naturellement ; chip alumni inchangé |
| Annuaire (doc 04) | Éligibilité RG7 étendue : `niveauEtude ∈ {L2, L3, M1, M2, alumni}` — un L1 seul reste exclu |
| Stats admin (doc 12) | Compteur « étudiants » = L1→M2 ; alumni séparé |
| `/accueil` | Rien de spécial — le niveau n'est pas une fierté affichée en hero |

---

## 4. Wireframe — modale transition annuelle (admin, doc 12 étendue)

```
╔══ MODALE "Clôturer l'année — Transition 2026→2027" ═══════╗
║ ÉTAPE 1 RÉCAPITULATIF                                      ║
║  Promotions : 48 L1→L2 · 41 L2→L3 · 39 L3→? · 24 M1→M2    ║
║  Fins de cycle L3 : 12 → M1 (déclaré) · 18 → alumni        ║
║                     · 9 sans déclaration → alumni par défaut║
║  Fins M2 : 22 → alumni                                     ║
║  ⚠ Anomalies (2) : doublon niveau, niveau manquant — à    ║
║    corriger AVANT exécution (liste détaillée)              ║
║ ÉTAPE 2 AJUSTEMENTS (table filtrable, éditer cellule      ║
║    niveauSuivant ; recherche par nom)                      ║
║ ÉTAPE 3 CONFIRMATION FORTE : compteur final + case        ║
║    « Je comprends que les alumni reçoivent le régime RG10 » ║
║    + saisie « TRANSITION 2027 » pour activer le bouton     ║
║ [Annuler ghost]                    [Exécuter danger loading]║
╚═════════════════════════════════════════════════════════════╝
```
Après exécution : rapport de transition affiché (réussis/anomalies) + export CSV (phase prod) + invalidation globale.

---

## 5. Animations & accessibilité

- Modale 3 étapes : stepper animé (layoutId indicateur), transitions AnimatePresence
- Table ajustements : même comportement que TableUtilisateurs doc 12
- Confirmation forte : input pattern exact (comme suppression compte doc 11)
- Radio intention : fieldset/legend réels, descriptions par option

## 6. Critères d'acceptation

1. Un L3 déclarant « master » et passé M1 garde ses cadets actifs ET son propre aîné sans interruption (test bout en bout).
2. L3 sans déclaration apparaît dans l'aperçu avec proposition alumni MISE EN ÉVIDENCE comme défaut ajustable — jamais appliqué en silence sans récapitulatif.
3. La transition est atomique : simuler une erreur serveur → aucun compte modifié (contrat API).
4. Un M2 ne peut PAS déclarer « master » (UI masque l'option, API 422).
5. Les écrans étudiants montrent leur nouveau niveau dès la transition sans reconnexion (invalidation ["me"] à la prochaine session — ou WS push, au choix backend).
6. Checklist design-system doc 03 §11.

## 7. Frontières

- Admission officielle master (dossiers, jurys) : hors plateforme — ici uniquement le niveau déclaré/géré
- Dates de rentrée/années académiques paramétrables : config backend
