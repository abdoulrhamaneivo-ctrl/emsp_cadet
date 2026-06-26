# Analyse module par module — Ainé & Cadet

> Contrôle qualité EMSPCONNECT — juin 2026  
> Projet unifié sous **`aine-cadet/`** (plus de dossier `parrinnov/`)

---

## Synthèse globale

| Module | Statut | Phase CDC |
|--------|--------|-----------|
| Vitrine (`html5up-editorial`) | ✅ | Hors CDC app |
| Comptes (`apps.accounts`) | ✅ | Phase 1 |
| Parrainage (`apps.parrainage`) | ✅ | Phase 1 + Phase 2 + Phase 3 |
| Templates Django | ✅ | Phase 1 |
| Static / assets | ✅ | Phase 1 |

**Légende :** ✅ conforme Phase 1 · 🟡 partiel / écarts mineurs · ❌ manquant

---

## Module Vitrine (`html5up-editorial/`)

### Rôle

Site institutionnel EMSP (formations, contact, médiathèque). Point d'entrée vers l'application Ainé & Cadet via le lien **Espace Étudiant**.

### Fichiers clés

| Fichier | Description |
|---------|-------------|
| `index.html` | Accueil EMSP (hero, stats, formations) |
| `formations-fs-menum.html` | Page filière FS MENUM |
| `formations-fsp.html` | Formations Supérieures Postales |
| `formations-regnum.html` | Mastère Régulation du Numérique |
| `formation-continue.html` | Formation continue EMSP |
| `mediatheque.html` | Actualités et ressources statiques |
| `contact.html` | Coordonnées + formulaire mailto |
| `concours.html` | Inscription 3e promotion FS MENUM |
| `assets/css/main.css` | Template Editorial compilé |
| `assets/css/emsp-custom.css` | Charte EMSP (vert, jaune, bleu) |
| `assets/js/emsp-config.js` | Routes navigation + URL Ainé & Cadet |
| `assets/js/emsp-init.js` | Injection Espace Étudiant + réseaux sociaux |
| `assets/images/logo.svg` | Logo EMSP vitrine |

### Navigation

- Menu sidebar : 8 pages actives listées dans `emsp-config.js` (`ROUTES` / `ACTIVE_PAGES`)
- Lien `.emsp-student-link` → `http://localhost:8000/accounts/login/` (injecté par `emsp-init.js`)
- `emsp-init.js` chargé sur toutes les pages EMSP actives

### Écarts vs besoin

| Écart | Priorité | Action |
|-------|----------|--------|
| ~~Pages FSP, RegNUM, Contact, Médiathèque absentes~~ | ~~P1~~ | ✅ Créées (juin 2026) |
| ~~Liens `href="#"` dans le menu~~ | ~~P1~~ | ✅ Corrigés (juin 2026) |
| ~~Sidebar dupliquée sur chaque page HTML~~ | ~~P2~~ | ✅ `partials/sidebar.html` + `scripts/build-vitrine.py` |
| ~~LinkedIn / YouTube sans URL~~ | ~~P3~~ | ✅ URLs dans `emsp-config.js` |
| Module concours Django | P1 | ✅ `apps/concours/` + lien vitrine |

### Actions correctives (session courante)

- [x] Lien Espace Étudiant → app Django (`emsp-config.js` + `emsp-init.js`)
- [x] Titre attribut `title` = « Ainé & Cadet — Parrainage étudiant EMSP »
- [x] Pages formations, médiathèque, contact, concours créées
- [x] Navigation hero, menu sidebar et CTA concours corrigés

---

## Module Comptes (`apps.accounts`)

### Rôle

Inscription, authentification, profils Cadet et Ainé. Référence CDC §3.1 et règles R4–R5.

### Fichiers clés

| Fichier | Contenu |
|---------|---------|
| `models.py` | `User` (rôles Cadet/Ainé/admin), `ProfilParrain` (profil détaillé Ainé) |
| `validators.py` | `validate_school_email` — domaine `@emsp.int` configurable |
| `forms.py` | `InscriptionForm`, `ConnexionForm`, `ProfilCadetForm`, `ProfilAineForm` |
| `views.py` | Inscription, connexion, déconnexion, édition profil |
| `urls.py` | `/accounts/login/`, `/inscription/`, `/profil/`, `/logout/` |
| `admin.py` | Gestion utilisateurs + suspension |

### Modèles

- **User** : email institutionnel (identifiant), rôle, classe, filière, photo, attentes (Cadet)
- **ProfilParrain** : ambitions, motivations, projets, points forts/faibles, centres d'intérêt, disponibilité annuaire, score fiabilité

> Noms techniques internes (`filleul`, `parrain`, `ProfilParrain`) conservés en base ; labels UI = **Cadet** / **Ainé**.

### Écarts CDC §3.1

| Exigence | Statut | Détail |
|----------|--------|--------|
| Inscription champs complets | ✅ | Nom, prénom, email, MDP, classe, filière, rôle |
| Domaine email école | ✅ | `SCHOOL_EMAIL_DOMAIN` + validateur |
| Connexion / déconnexion | ✅ | `LoginView` / `LogoutView` |
| Rôle modifiable admin seul | 🟡 | Champ éditable en admin ; pas de garde UI utilisateur (normal Phase 1) |
| Suppression compte RGPD | ❌ | Prévu Phase 4 |

### Actions correctives (session courante)

- [x] Labels rôle : « Cadet (L1) » / « Ainé (devancier) »
- [x] `role` → RadioSelect, `classe` / `filiere` → Select (choices EMSP)
- [x] `attentes` → Textarea dimensionnée
- [x] CSS formulaires centrés (`aine-cadet-forms.css`)
- [x] Migration `0002_alter_user_role` — choix affichés Ainé/Cadet
- [x] Commentaires français dans models, forms, views, validators
- [x] Tests auth + accès annuaire

---

## Module Parrainage (`apps.parrainage`)

### Rôle

Cœur métier : annuaire, demandes, tableaux de bord. Modèles Phase 2–3 déjà schématisés.

### Fichiers clés

| Fichier | Contenu |
|---------|---------|
| `models.py` | `DemandeParrainage`, `Message`, `RendezVous`, `Avis`, `Evenement`, `Badge` |
| `services.py` | Règles R1–R6, annuaire, suggestions |
| `views.py` | Accueil, dashboard, annuaire, fiche Ainé, CRUD demandes, messagerie, RDV, avis, événements |
| `forms.py` | `FiltreAnnuaireForm`, `DemandeParrainageForm`, `MessageForm`, `RendezVousForm`, `AvisForm`, `EvenementForm` |
| `signals.py` | Notifications email (message, nouvelle demande) |
| `management/commands/envoyer_rappels_rdv.py` | Rappels cron RDV 24 h |
| `management/commands/initialiser_badges.py` | Initialisation badges par défaut |
| `urls.py` | Routes Phase 1–3 |
| `tests/` | Règles R1–R6 + tests Phase 2 + Phase 3 |

### Règles métier (`services.py`)

| Règle | Fonction | Statut |
|-------|----------|--------|
| R1 | `filleul_a_deja_un_parrain_actif` / `valider_nouvelle_demande` | ✅ |
| R2 | `parrain_a_de_la_place` / `compter_filleuls_actifs` | ✅ |
| R3 | `mettre_a_jour_disponibilite_parrain` | ✅ |
| R4 | Validateur email (module accounts) | ✅ |
| R5 | Rôle admin-only (modèle + admin) | ✅ |
| R6 | `mettre_a_jour_disponibilite_parrain` après fin | ✅ |
| Messagerie | `peut_acceder_messagerie`, `compter_non_lus` | ✅ |
| RDV | `peut_acceder_rdv`, `peut_repondre_rdv`, `rdv_a_venir` | ✅ |
| Phase 3 | `terminer_parrainage`, `soumettre_avis`, `attribuer_badges_parrain`, `inscrire_evenement` | ✅ |

### Vues Phase 1

| Vue | URL | Rôle |
|-----|-----|------|
| `accueil` | `/` | Présentation publique |
| `dashboard` | `/dashboard/` | Espace Cadet / Ainé / admin |
| `annuaire` | `/annuaire/` | Liste Ainés + filtres |
| `detail_aine` | `/aines/<pk>/` | Fiche profil Ainé |
| `demande_creer` | `/demande/<parrain_id>/` | Envoi demande (Cadet) |
| `demande_repondre` | `/demande/<pk>/<action>/` | Accepter / refuser (Ainé) |

### Vues Phase 2

| Vue | URL | Rôle |
|-----|-----|------|
| `messages_fil` | `/parrainage/<pk>/messages/` | Fil conversation Ainé ↔ Cadet |
| `messages_marquer_lu` | `/parrainage/<pk>/messages/marquer-lu/` | POST JSON — marquer lu |
| `rdv_proposer` | `/parrainage/<pk>/rdv/proposer/` | Proposer un RDV |
| `rdv_repondre` | `/parrainage/<pk>/rdv/<rdv_id>/<action>/` | Accepter / refuser / contre-proposer |

### Vues Phase 3

| Vue | URL | Rôle |
|-----|-----|------|
| `parrainage_terminer` | `/parrainage/<pk>/terminer/` | Clôture parrainage (POST) |
| `avis_creer` | `/parrainage/<pk>/avis/` | Retour d'expérience fin de parcours |
| `evenements_liste` | `/evenements/` | Liste événements collectifs |
| `evenement_creer` | `/evenements/creer/` | Création événement (Ainé / admin) |
| `evenement_detail` | `/evenements/<pk>/` | Fiche + inscriptions |
| `evenement_inscrire` | `/evenements/<pk>/inscrire/` | Inscription Cadet (POST) |

### Écarts CDC §3.2–§3.8

| Section | Statut | Détail |
|---------|--------|--------|
| §3.2 Annuaire + filtres + suggestion | ✅ | `parrains_disponibles_queryset`, `suggerer_parrains` |
| §3.3 Mise en relation | ✅ | CRUD demandes Phase 1 |
| §3.4 Messagerie | ✅ | Fil chat, non lus, accès binôme accepté |
| §3.5 Rendez-vous | ✅ | Proposition, acceptation, refus, contre-proposition, rappels cron |
| §3.6 Avis / score fiabilité | ✅ | Clôture parrainage, avis, score moyen Cadets |
| §3.7 Événements collectifs | ✅ | CRUD événements, inscriptions Cadets |
| §3.8 Badges | ✅ | Attribution auto (premier parrainage, 5 Cadets, événement) |
| Dashboard admin stats | ✅ | Indicateurs parrainages, Cadets en attente, avis faibles |

### Actions correctives (session courante)

- [x] Terminologie UI Ainé/Cadet dans templates et messages
- [x] Messages d'erreur métier en français (Cadet/Ainé)
- [x] Tests unitaires règles R1–R6
- [x] Messagerie privée + compteur non lus (Phase 2)
- [x] Rendez-vous + rappels cron (Phase 2)
- [x] Notifications email (signaux Django)
- [x] Fin de parrainage + avis + score fiabilité (Phase 3)
- [x] Badges automatiques Ainé (Phase 3)
- [x] Événements collectifs + inscriptions (Phase 3)
- [x] Dashboard admin avec statistiques (Phase 3)

---

## Module Templates Django (`aine-cadet/templates/`)

### Rôle

Layout Editorial (#wrapper / #main / #sidebar) partagé avec la vitrine EMSP.

### Structure

```
templates/
├── base.html                 # Layout principal Editorial
├── partials/
│   ├── _header.html          # En-tête #main
│   ├── _sidebar.html         # Menu + logo + footer
│   └── _messages.html        # Flash messages Django
├── accounts/                 # login, inscription, profils
└── parrainage/               # accueil, dashboards, annuaire, demandes
```

### Intégration Editorial

- `base.html` charge `main.css`, `emsp-custom.css`, `aine-cadet.css`, **`aine-cadet-forms.css`**
- Assets Editorial via `STATICFILES_DIRS` → `html5up-editorial/assets/`
- Classes `.ac-*` pour composants app (cartes, formulaires, alertes)
- Partial `_form_fields.html` pour rendu uniforme des champs
- Animations légères : `aine-cadet-motion.js` + keyframes CSS (`prefers-reduced-motion`)
- Mobile-first : breakpoints Editorial natifs (sidebar toggle ≤1280px)

Voir [UI-UX.md](UI-UX.md) pour la charte formulaires complète.

### Écarts

| Écart | Statut |
|-------|--------|
| Partials réutilisables | ✅ Extraction header/sidebar + `_form_fields.html` |
| Bannière accueil stylée | ✅ `.ac-hero-banner` |
| Pages auth + dashboard | ✅ |
| Formulaires centrés sans overflow | ✅ `aine-cadet-forms.css` |
| Selects classe/filière + radios rôle | ✅ `choices.py` + widgets |
| Messagerie / RDV templates | ✅ Phase 2 |
| Avis / événements templates | ✅ Phase 3 |

---

## Module Static / Assets

### Rôle

CSS/JS/images partagés vitrine ↔ Django.

### Configuration (`config/settings.py`)

```python
EDITORIAL_ASSETS = BASE_DIR.parent / "html5up-editorial" / "assets"
STATICFILES_DIRS = [BASE_DIR / "static", EDITORIAL_ASSETS]
```

### Fichiers app

| Fichier | Usage |
|---------|-------|
| `static/css/aine-cadet.css` | Surcharges app (cartes, chat, alertes) |
| `static/css/aine-cadet-forms.css` | Formulaires centrés, selects, radios, overflow |
| `static/js/aine-cadet-motion.js` | Animations d'apparition sections |
| `static/images/aine-cadet-logo.svg` | Logo sidebar app |
| `static/images/emsp-logo-transparent.svg` | Logo source `Print_Transparent.svg` |

### Assets Editorial (partagés)

- `css/main.css`, `css/emsp-custom.css`, `css/fontawesome-all.min.css`
- `js/jquery.min.js`, `main.js`, `util.js`, `breakpoints.min.js`, `browser.min.js`
- `webfonts/` Font Awesome

### Écarts

| Écart | Statut |
|-------|--------|
| Logos intégrés | ✅ |
| `emsp-config.js` dans Django | 🟡 Non chargé côté app (navigation Django native) |
| Photos réelles campus | ❌ Placeholders SVG vitrine |

---

## Vérifications finales

```powershell
cd aine-cadet
.venv\Scripts\activate
python manage.py check      # OK — 0 issues
python manage.py migrate    # OK — à jour
python manage.py test apps  # OK — 23 tests (Phase 1 + Phase 2 + Phase 3)
```

### URLs test local

| URL | Description |
|-----|-------------|
| http://localhost:8080/index.html | Vitrine EMSP |
| http://localhost:8000/ | Accueil Ainé & Cadet |
| http://localhost:8000/accounts/inscription/ | Inscription |
| http://localhost:8000/accounts/login/ | Connexion |
| http://localhost:8000/annuaire/ | Annuaire Ainés (auth requise) |
| http://localhost:8000/dashboard/ | Tableau de bord |
| http://localhost:8000/parrainage/<id>/messages/ | Messagerie binôme (auth + parrainage accepté) |
| http://localhost:8000/parrainage/<id>/rdv/proposer/ | Proposer un RDV |
| http://localhost:8000/parrainage/<id>/avis/ | Laisser un avis (parrainage terminé) |
| http://localhost:8000/evenements/ | Événements collectifs |

---

## Prochaines étapes (Phase 4)

1. **Production** — PostgreSQL, stockage photos, CI/CD
2. **RGPD** — suppression compte utilisateur
3. **Vitrine** — pages FSP, RegNUM, Contact + correction liens `#`

---

## Documents connexes

- [CONTEXTE.md](CONTEXTE.md) — vision dépôt
- [CAHIER_DES_CHARGES.md](CAHIER_DES_CHARGES.md) — exigences fonctionnelles
- [ARCHITECTURE.md](ARCHITECTURE.md) — stack technique
- [TEMPLATES.md](TEMPLATES.md) — analyse Editorial
- [ROADMAP.md](ROADMAP.md) — plan priorisé
