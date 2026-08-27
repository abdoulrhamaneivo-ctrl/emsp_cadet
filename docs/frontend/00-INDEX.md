# EMSP Connect v2 — Documentation Frontend

## Ordre de lecture OBLIGATOIRE pour tout agent travaillant ici

| # | Document | Contenu | Status |
|---|---|---|---|
| 01 | `01-architecture-globale.md` | Stack, arborescence src/, shells, tokens bruts | ✅ |
| 02 | `02-perimetre-fonctionnel.md` | **Source de vérité métier** : modèle v2 CASQUETTES cumulables (Cadet toujours · Aîné si L2+/candidature ouverte), matrice permissions, RG1–RG9 traduites front, carte routes définitive, entités JSDoc, parcours, roadmap phases cahier | ✅ |
| 03 | `03-design-system.md` | Contrat visuel : principes non négociables, palette usage sémantique, composants shared (contrats), motion system, états serveur, checklist PR | ✅ |
| 04 | `04-spec-annuaire.md` | Spec exécutable /annuaire + fiche Aîné + suggestion auto (filtrait annuaire = uniquement candidatures ouvertes L2+) | ✅ |
| 05 | `05-spec-mes-demandes-mon-parrainage.md` | Spec exécutable /mes-demandes (envoyées tous · reçues selon candidature) + /mon-parrainage DOUBLE FACETTE (Mon Aîné ↔ Mes cadets) + entrées Famille/Cercles | ✅ |
| 06 | `06-spec-rendez-vous.md` | Spec exécutable /rendez-vous liste+détail, contre-proposition, rappel J-1 | ✅ |
| 07 | `07-spec-retours-badges.md` | Spec flux avis RG6 + score fiabilité + badges §3.8 | ✅ |
| 08 | `08-spec-messagerie.md` | Spec chat privé binôme temps réel : WS contractuel, idempotence, non-lus serveur, reconnexion (moteur réutilisé tel quel par les groupes) | ✅ |
| 09 | `09-spec-fil-commentaires.md` | Spec Fil d'annonces + COMMENTAIRES = espace collectif d'échange étudiant | ✅ |
| 10 | `10-spec-evenements.md` | Spec événements collectifs §3.7 + discussion participants | ✅ |
| 11 | `11-spec-profil.md` | Spec profil : identité+niveau, LE toggle candidature Aîné (RG7/RG8), vitrine, pipeline complétude, suppression compte self-serve | ✅ |
| 12 | `12-spec-administration-moderation.md` | Spec admin : stats KPI, binômes à risque, file signalements, comptes, changement rôle RG5 | ✅ |
| 13 | `13-spec-groupes-famille-cercles.md` | Spec Familles (groupe auto Aîné+ses cadets, extension grand-aîné) & Cercles (groupes libres entre relations) — échange de groupe vertical, règles G1–G8 | ✅ |
| 14 | `14-spec-alumni-offres.md` | Spec Alumni (statut, transition admin annuelle, capacités prolongées) + module Offres stage/alternance/emploi publié par alumni/admin | ✅ |
| 15 | `15-spec-parcours-academique-transitions.md` | Parcours L1→L2→L3→M1→M2, déclaration d'intention fin de cycle (Master OU Alumni), modale transition annuelle admin 3 étapes | ✅ |
| 16 | `16-spec-exclusions-sanctions.md` | Échelle graduée avertissement→suspension→exclusion, motifs obligatoires, écran /compte-suspendu, levée et appel, effets espaces collectifs | ✅ |
| 17 | `17-spec-ia-plateforme.md` | Règles RG12 IA responsable (l'IA propose, l'humain dispose) + 6 fonctionnalités IA priorisées avec composants/états front requis | ✅ |
| 18 | `18-analyse-senior-plan.md` | **AUDIT SENIOR** : forces, risques R1-R5, gaps traités, décisions structurantes (tranches verticales T0→T6), points à trancher par Ivo | ✅ |
| 19 | `19-qualite-tests-devops.md` | **GARDE-FOUS CODE** : workflow git/PR, stack tests (Vitest+RTL+MSW+Playwright), erreurs globales, sécurité front, perf budget, CI, Definition of Done | ✅ |
| 20 | `20-cartographie-pages.md` | **TABLEAU DE BORD CONSTRUCTION** : les 26 pages (P01-P26) avec route/fichier/spec/tranche/statut + planning composants shared | ✅ |

## Décisions produit consignées (août 2026)
0. **NOM FINAL (décision Ivo, 27 août 2026) : « EMSP Connect »** — partout dans l'UI, le code, les déploiements. « Parr'Innov » désigne uniquement le cahier des charges d'origine, jamais le produit.
1. **Échanges étudiants** : messagerie privée RÉSERVÉE au binôme accepté (cahier §3.4 inchangé) ; l'échange passe par 3 espaces COLLECTIFS — commentaires du Fil (doc 09), discussion des événements (doc 10), groupes Famille/Cercle (doc 13).
2. **Modèle casquettes (besoin réel exprimé par Ivo)** : en L2 on a déjà des filleuls pendant que notre aîné nous accompagne ENCORE. Cadet/Aîné se CUMULENT. Aîné exige L2+ (RG7) et une candidature personnelle ouverte/fermée (RG8). Quotas séparés (RG9). Un L1 ne peut ni être aîné ni l'être plus tard avant promotion.
3. **Familles automatiques** : dès son premier binôme accepté, un Aîné reçoit son groupe Famille (lui + ses cadets ≤7) ; option « famille étendue » invitant SON propre aîné — la chaîne verticale complète s'échange (doc 13).
4. Lexique UI : Cadet/Aîné (jamais filleul/parrain à l'écran) ; `role` remplacé par `isAdmin` + `niveauEtude` + `candidatureAineOuverte`.
5. Rendez-vous, avis et badges intégrés au périmètre officiel (docs 06/07).
6. Pas d'images dans le Fil V1 (stockage externe phase prod).
7. **Alumni & parcours (demande Ivo)** : fin de L3, l'étudiant CHOISIT — continuer en M1/M2 (droits L2/L3 intacts) ou passer alumni ; fin de M2 → alumni. Transition admin annuelle atomique (doc 15). Les diplômés restent membres pleins, chip « ALUMNI · Promo », auteurs des Offres (doc 14).
8. **Exclusions graduées (RG11)** : avertissement → suspension (gel réversible) → exclusion (irréversible après appel) ; jamais automatique ; motif + contestation obligatoires (doc 16).
9. **IA responsable (RG12)** : l'IA propose, l'humain dispose ; chats privés jamais analysés ; tout étiqueté « Généré par IA » ; opt-in strict (doc 17).

## Roadmap d'exécution (doc 18 §4 — fait foi)
**T0 Socle** (structure+tokens+shared+shells+MSW+CI) → **T1 Annuaire** → **T2 Parrainage+avis** → **T3 Communication** (WS+RDV, backend requis) → **T4 Communauté** (fil+events+groupes) → **T5 Back-office** (admin+transitions+sanctions) → **T6 IA** (IA-1 puis IA-2, extensions déjà intégrées aux specs 04/09/11/12/14).
Chaque tranche : démo Ivo (375px+1280px) + checklist doc 03 §11 + tests doc 19 verts + merge + tag.

## Ce qui reste HORS docs (à écrire si besoin plus tard)
- Landing page `/` marketing (spec légère seulement)
- Pages auth détaillées (déjà implémentées ; adapter validation email domaine doc 02 §RG4)
- Notifications granulaires / réglages (phase 2+)
- Specs backend Django/DRF/Channels (phase 3, dossier `docs/backend/`)

## Sources externes au dossier
- Cahier des charges officiel : `../Cahier_des_charges_Parrainage.pdf` (+ .docx) — socle ne JAMAIS contredire ; les modules produits ajoutés (casquettes, familles/cercles, fil) l'ÉTENDENT sans le contredire
- Template visuel : `../TemplateEmspConnect/cillaux/` — point de départ JSX/CSS obligatoire (encore vierge au 27 août 2026)
