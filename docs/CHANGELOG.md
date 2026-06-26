# Journal des modifications — EMSPCONNECT

> Mises à jour documentées au fil du développement

---

## Juin 2026 — Setup MySQL automatisé (`setup-mysql.ps1`)

### Script tout-en-un

- Nouveau `scripts/setup-mysql.ps1` : venv, pip, test MySQL, `migrate`, `check`, tests, seed
- `.env` créé automatiquement depuis `.env.example` si absent
- `.env.example` : variables DB commentées en français (`DB_USER=root`, etc.)
- `docs/MYSQL.md` : section **Démarrage en 2 minutes** (CREATE DATABASE → `.env` → script → `dev.ps1`)
- `README.md` : lien vers `setup-mysql.ps1`

### Migrations

- Toutes les apps métier ont des migrations à jour : `accounts`, `parrainage`, `concours`, `formations`, `bibliotheque`
- `migrate` crée **toutes** les tables automatiquement après le seul `CREATE DATABASE`

---

## Juin 2026 — MySQL dev + profils immersifs Cadet

### Base de données MySQL

- `PyMySQL` ajouté à `requirements.txt` (patch dans `config/__init__.py`)
- Variables `.env.example` : `DB_ENGINE=mysql`, `DB_NAME=emspconnect`, hôte/port
- `settings.py` : MySQL si `DB_ENGINE=mysql`, fallback SQLite si absent
- Documentation : `docs/MYSQL.md` (création base, migrate, export SQLite, dépannage)

### Profils immersifs (annuaire / fiche Ainé)

- Templates `annuaire.html`, `detail_aine.html` refondus (hero, cartes, stats, sections bento)
- Partial `_avatar_aine.html`, filtres template `parrainage_extras`
- Assets : `ac-premium.css`, `ac-animations.js` sur pages parrainage
- Documentation : `docs/PROFILS-IMMERSIFS.md`

### Tests automatiques

- `manage.py check` — OK
- `manage.py test apps` — **38 tests OK**

---

## Juin 2026 — Documentation détaillée + corrections vitrine

### Corrections code

- **Sidebar vitrine** — `partials/sidebar.html` recréé (fichier corrompu avec caractères intercalés) ; regénération des 8 pages via `build-vitrine.py`
- **contact.html** — coordonnées alignées sur la référence officielle (contact@emsp.int, téléphone, adresse)
- **ac-dashboard.css** (vitrine) — remplacement `:has()` par `.is-selected` (compatibilité navigateurs)

### Documentation (nouveau / enrichi)

- `docs/GUIDE-DEVELOPPEUR.md` — structure repo, scripts, apps, conventions CSS/JS, checklist déploiement
- `docs/API-VITRINE.md` — endpoints JSON, CORS, exemples fetch, schéma pont statique/Django
- `docs/DEPANNAGE.md` — ERR_CONNECTION_REFUSED, CORS, e-mails, sidebar, collectstatic
- `docs/EMAIL-BREVO.md` — enrichi (reset MDP, liens croisés)
- Mise à jour `docs/AUDIT.md`, `docs/ETAT-DU-PROJET.md`, `README.md`

### Tests automatiques

- `manage.py check` — OK
- `manage.py test apps` — **38 tests OK**
- `build-vitrine.py` — 8 pages mises à jour

---

## Juin 2026 — Intégration Brevo (e-mails transactionnels)

### Backend e-mail

- `django-anymail[brevo]` — envoi via API Brevo si `BREVO_API_KEY` est renseignée
- Fallback console en dev (sans clé)
- Variables `.env.example` : `BREVO_API_KEY`, `DEFAULT_FROM_EMAIL`, `BREVO_SENDER_NAME`, destinataires admin

### Module `apps/core/email.py`

- Fonctions réutilisables + templates HTML/texte (`templates/emails/`, charte teal `#147c71`)
- Bienvenue inscription, contact vitrine (admin + accusé), pré-inscription concours (candidat + admissions)
- Mot de passe oublié et notifications parrainage passent par le même backend Django

### API vitrine

- `/api/contact/` — double envoi + rate limiting basique par IP
- `/concours/preinscription.json` — confirmation candidat + notification admissions

### Documentation

- Section Brevo dans `docs/DEPLOIEMENT.md` (compte, clé API, SPF/DKIM)

### Tests automatiques

- `manage.py check` — OK
- `manage.py test apps config` — couverture e-mails (locmem backend)

---

## Juin 2026 — Session finalisation bibliothèque & production

### Bibliothèque numérique (`apps/bibliotheque/`)

- Modèle `RessourceDocument` (titre, PDF/lien, catégorie, publie, reserve_etudiants)
- Vues liste + détail authentifiées (`/bibliotheque/`)
- API publique `/bibliotheque/api/publiques.json` pour la vitrine médiathèque
- Admin CRUD + lien sidebar Django
- CTA médiathèque → connexion bibliothèque

### Concours — dates dynamiques

- Modèle `AnneeConcours` (annee, date_limite, frais_fcfa, active) — admin éditable
- Context processor `concours_session` pour templates Django
- API `/concours/session-active.json` pour `concours.html` (JS vitrine)
- Note admin : vérifier www.emsp.int chaque rentrée

### Vitrine

- `generic.html` → plan du site EMSP (plus de Lorem ipsum)
- `elements.html` → redirection vers plan du site
- `mediatheque.html` — section ressources publiques + CTA bibliothèque
- `concours.html` — dates/frais chargés depuis l'API Django

### Production

- `docker-compose.yml` (PostgreSQL + app Gunicorn)
- `aine-cadet/gunicorn.conf.py` commenté FR
- `Procfile`, `aine-cadet/Dockerfile`, `requirements-prod.txt`
- `scripts/deploy-check.ps1` — check, test, collectstatic dry-run
- `docs/DEPLOIEMENT.md` complété (Docker, nginx, cron)

### Tests automatiques

- `manage.py check` — OK
- `manage.py test apps` — **31 tests OK** (+5 bibliothèque/concours)

---

## Juin 2026 — Session audit & fonds vitrine multi-pages

### Vitrine EMSP

- **Fonds BACKGROUND** — classe `.emsp-page-bg` (motif vert) sur les 8 pages actives + 404
- **En-têtes** — `.emsp-page-header--emerald` sur formations, concours, contact, médiathèque
- **SEO** — Open Graph + favicon `logo.svg` sur toutes les pages actives
- **UX** — `ac-ui-vitrine.js` (retour haut) + skip link partout
- **Coordonnées** — contact@emsp.int, (+225) 27 21 21 45 60/61 (contact.html + `emsp-config.js`)
- **`build-vitrine.py`** — coque commune ; `--emerald` ; favicon SVG
- **`sync-backgrounds.ps1`** — copie aussi vers `aine-cadet/static/images/backgrounds/`

### Documentation

- **`docs/AUDIT.md`** — checklist vérification complète
- Mise à jour `docs/ETAT-DU-PROJET.md`

### Tests automatiques

- `manage.py check` — OK
- `manage.py test apps` — 26 tests OK

---

## Juin 2026 — Session finalisation front & Phase 4

### Application Ainé & Cadet

- **Module `apps/formations/`** — CRUD admin filières + spécialités FS MENUM
  - `python manage.py initialiser_filieres`
  - `python manage.py export_filieres_vitrine` → JSON vitrine
  - Pages `/formations/` et `/formations/<slug>/`
- **Mot de passe oublié** — flux Django complet (`/accounts/mot-de-passe-oublie/`)
- **Suppression compte RGPD** — `/accounts/supprimer-compte/`
- **PostgreSQL** — config via `DATABASE_URL=postgres` + variables `DB_*`
- **Front formulaires** — `ac-forms.js` (email live, force MDP, cartes rôle)
- **Toasts** — `ac-toast.js` remplace flash messages statiques
- **Messagerie polling** — refresh auto toutes les 12 s (`ac-messaging-poll.js`)
- **UX** — skip link, retour haut, recherche sidebar annuaire, compteur caractères
- **404 Django** — template Editorial personnalisé

### Vitrine EMSP

- Contenu institutionnel actualisé (fondation **1970**, UPU, Michel Touré, coordonnées officielles)
- **Open Graph**, favicon, `robots.txt`, `sitemap.xml`, `404.html`
- **Témoignages** — carousel sur l'accueil
- **Photos** — chemins `assets/images/photos/*.jpg` avec fallback SVG ; script `sync-backgrounds.ps1`
- Sidebar contact : contact@emsp.int, (+225) 27 21 21 45 60/61, 18 BP 42 Abidjan 18

### Documentation

- `docs/DEPLOIEMENT.md` — guide Phase 4
- `docs/CHANGELOG.md` — ce fichier
- Mise à jour `docs/ROADMAP.md`, `docs/ETAT-DU-PROJET.md`

---

## Phases précédentes (résumé)

| Phase | Livrables |
|-------|-----------|
| 1 | Auth, profils, annuaire, demandes parrainage |
| 2 | Messagerie, RDV, notifications, rappels cron |
| 3 | Avis, badges, événements, dashboard admin Chart.js |
| Archivage | `AnneeAcademique`, `archiver_annee`, page Archives |
| Concours | Module `apps/concours/` inscription FS MENUM |
