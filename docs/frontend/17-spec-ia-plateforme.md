# EMSP Connect v2 — Spec IA SUR LA PLATEFORME
## Doc 17 — Fonctionnalités IA proposées & règles d'usage responsable (RG12)

> Prérequis : docs 02 (RG11/RG12), 03, 04 (suggestions §3.2), 09 (modération fil), 12 (file signalements), 16 (sanctions humaines).
> **Statut** : cadrage produit — les features sont des PROPOSITIONS à valider par Ivo/école ; les RÈGLES (RG12) sont elles déjà adoptées comme contrat. L'implémentation lourde est backend ; cette doc fixe ce que le FRONT doit prévoir (états, étiquettes, toggles).

---

## 1. RÈGLES RG12 — IA responsable sur EMSP Connect (adoptées)

1. **L'IA propose, l'humain dispose** : aucune décision automatique (aucune suppression de contenu, aucune sanction, aucun refus de demande) sans action humaine. L'IA flag/suggère, l'admin/l'utilisateur décide (doc 16 §2.2).
2. **Ligne rouge vie privée** : les conversations privées binôme et groupes (doc 08/13) ne sont JAMAIS analysées par l'IA. Aucune exception. La détection d'inactivité utilise des méta-données (dates de dernier message), jamais le contenu.
3. **Transparence totale** : toute sortie IA visible par l'utilisateur est étiquetée « Suggestion générée par IA » (chips dédié + icône Sparkles lucide).
4. **Opt-in pour le personnel** : les features qui traitent les données de l'utilisateur pour l'AIDER (copilot profil, matching enrichi) exigent un consentement explicite révocable dans /profil.
5. **Désactivable** : chaque feature IA a un toggle utilisateur ET un kill-switch global admin (en cas de dérive/coût).
6. **Traçabilité** : chaque action IA est loggée côté serveur (feature, entrée anonymisée minimale, décision prise ensuite par l'humain).
7. **Contenu filtré** : les prompts sortants vers les fournisseurs d'IA ne contiennent JAMAIS de données personnelles au-delà du strict nécessaire (le backend anonymise/tronque — le front n'envoie rien lui-même).

---

## 2. Les 6 fonctionnalités proposées (priorisées)

### IA-1 — Modération préventive 🥇 (phase 3, première livrée)
**Quoi** : analyse automatique des publications/commentaires/offres (Fil doc 09, événements doc 10, offres doc 14) à la soumission → détection spam/harcèlement/contenu interdit.
**Front** :
- Auteur d'un contenu flaggé : publication passée en file d'attente « en vérification » (état visible, pas d'erreur brutale) + toast info.
- Admin (doc 12) : la file signalements gagne une source « Détection IA » avec score + raison affichée, priorisation de la file. L'admin tranche (publier/masquer/sanctionner doc 16).
**Déterminant** : réduit la charge de modération dès que la communauté grandit. DÉPENDANCE RG12.1 : jamais masqué automatiquement sans admin.

### IA-2 — Matching enrichi des suggestions 🥈 (phase 3)
**Quoi** : le cahier §3.2 demande déjà « même filière OU centres d'intérêt proches ». L'IA calcule la similarité sémantique attentes du cadet ↔ profil des aînés (ambitions, projets) pour classer les 3 suggestions.
**Front** : BandeauSuggestions (doc 04) gagne une raison par suggestion : « Proche de tes attentes : bases de données et réseaux » — badge Sparkles + explication. Toggle consentement en /profil (« Suggestions intelligentes »).
**Déterminant** : améliore directement le produit cœur sans nouvelle page.

### IA-3 — Copilot de profil (phase 4)
**Quoi** : bouton « M'aider à rédiger » dans les textareas du profil (attentes cadet, ambitions/projets aîné doc 11) → 3 propositions de formulations basées sur 2-3 mots-clés saisis.
**Front** : panneau de suggestions cliquables, étiquette IA obligatoire, insertion = action utilisateur explicite. Rien ne part sans clic, rien ne s'écrit en auto.
**Déterminant** : débloque les étudiants qui « ne savent pas quoi écrire » — profil complet = annuaire riche (RG8).

### IA-4 — Assistant FAQ L1 (phase 4)
**Quoi** : chatbot d'accueil (widget discret, route/panneau) répondant aux questions courantes des nouveaux (méthodologie, inscriptions, campus) depuis une BASE DE CONNAISSANCES VALIDÉE par l'admin (pas de free-talk général).
**Front** : panneau latéral chat simple, réponses avec sources de la base, bouton « Poser à la communauté » → redirige vers le Fil (doc 09) si la réponse n'existe pas. L'admin édite la base (crud simple, phase 4).
**Déterminant** : réduit la masse de questions répétées qui fatiguent les aînés.

### IA-5 — Détection binômes silencieux (phase 4)
**Quoi** : méta-données uniquement (dernier échange commun >21 jours, RDV annulés en série) → nudge bienveillant aux DEUX membres + ligne dans le tableau « binômes à risque » admin (doc 12).
**Front** : encart doux sur /mon-parrainage : « Ça fait 3 semaines — un petit mot ? » avec CTA messagerie. Jamais de ton culpabilisant, jamais d'affichage public.
**Déterminant** : cahier §3.6 — « permet à l'administration de détecter les binômes en difficulté ».

### IA-6 — Aide à la rédaction d'offres (phase 4, alumni)
**Quoi** : même mécanique que IA-3 appliquée aux offres (doc 14) : structure suggérée (mission, profil recherché, modalités) à partir du type d'offre.
**Front** : identique au copilot — suggestions cliquables étiquetées.

---

## 3. Composants front partagés à prévoir (contrat)

```
src/shared/components/
├── ChipIA.jsx          # chip "Généré par IA" (Sparkles, tone info, TOUJOURS présent sur sortie IA)
├── PanneauSuggestionsIA.jsx  # liste suggestions cliquables + étiquette + état chargement
└── ToggleConsentementIA.jsx  # switch /profil lié aux préférences user (préférencesIA: {matching, copilot})
```
Préférences user (doc 02 User v2 complément) : `preferencesIA: {matchingEnrichi: boolean, copilot: boolean}` — défaut FALSE (opt-in strict), révocable à tout moment.

## 4. États UI obligatoires (toute feature IA)

1. Consentement absent → la feature n'existe pas dans l'UI (pas de bouton fantôme).
2. Requête IA en cours → skeleton + libellé « L'assistant prépare des suggestions… ».
3. Échec service IA → dégradation silencieuse propre : la feature classique sans IA fonctionne (jamais de blocage du parcours métier par l'IA).
4. Sortie affichée → ChipIA systématique.

## 5. Accessibilité & éthique UI

- ChipIA : aria-label « Contenu suggéré automatiquement, vérifie avant d'utiliser »
- Panneau suggestions : toutes navigables clavier, insertion annonce en aria-live
- Ton des textes IA : tutoiement sobre, jamais « intelligent/super » — on vend l'aide, pas la magie
- Aucune manipulation sombre (pas de compteur urgence IA, pas de FOMO)

## 6. Critères d'acceptation transverses

1. AUCUNE action destructrice ni décision n'est déclenchée par l'IA seule — auditer chaque flux (modération, suggestions, sanctions).
2. Le contenu d'aucune conversation privée n'est envoyé à un service IA (vérifier la surface d'attaque front : rien d'autre que méta-données).
3. Désactiver tous les toggles IA → l'app est fonctionnellement identique à une app sans IA.
4. Toute sortie IA porte ChipIA — auditer les écrans.
5. Kill-switch admin ON → tous les points d'entrée IA disparaissent en un refetch (prévoir invalidation ["me"] et ["config"]).

## 7. Frontières & choix de stack (backend, hors scope front)

- Fournisseur IA (API cloud OpenAI/Anthropic/Mistral vs modèle auto-hébergé) : décision backend phase 3 — le front reste agnostique (les états/étiquettes sont identiques)
- Coûts/quotas par utilisateur : backend
- Embeddings des profils (IA-2) : pipeline backend, front ne calcule rien
