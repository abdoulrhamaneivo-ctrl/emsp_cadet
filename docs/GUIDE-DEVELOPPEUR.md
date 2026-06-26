# Guide développeur — EMSPCONNECT

Guide pratique pour travailler sur la vitrine statique EMSP et l'application Django **Ainé & Cadet**.

---

## 1. Structure du dépôt

```
EMSPCONNECT/
├── html5up-editorial/     # Vitrine statique (8 pages HTML actives)
│   ├── assets/            # CSS, JS, images (partagés avec Django)
│   ├── partials/          # sidebar.html (source build-vitrine)
│   └── *.html             # Pages vitrine
├── aine-cadet/            # Application Django
│   ├── apps/              # accounts, parrainage, concours, formations, bibliotheque
│   ├── config/            # settings, urls, api_views
│   ├── templates/         # Templates Django (Editorial)
│   ├── static/            # CSS/JS spécifiques Django
│   └── manage.py
├── scripts/               # dev.ps1, build-vitrine.py, sync-backgrounds.ps1, deploy-check.ps1
├── docs/                  # Documentation projet
├── BACKGROUND/            # Sources visuelles (hero, motif, vidéo)
└── www.emsp.int/          # Archive miroir site Joomla (référence, non servie en dev)
```

---

## 2. Environnement de développement

### Prérequis

- Python 3.11+ (3.14 testé avec contournement tests Django)
- PowerShell (Windows)
- Venv dans `aine-cadet/.venv`

### Installation initiale

```powershell
cd aine-cadet
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
```

### Base MySQL (option dev Windows)

Voir [docs/MYSQL.md](../docs/MYSQL.md) : créer la base `emspconnect`, renseigner `DB_ENGINE=mysql` dans `.env`, puis `migrate`.

Sans `DB_ENGINE=mysql`, Django utilise **SQLite** (`db.sqlite3`) — pratique pour les tests locaux rapides.

### Démarrage quotidien

```powershell
# À la racine EMSPCONNECT
.\scripts\dev.ps1
```

| Service | URL |
|---------|-----|
| Vitrine | http://localhost:8080/index.html |
| Django | http://127.0.0.1:8000/ |
| Admin | http://127.0.0.1:8000/admin/ |

---

## 3. Scripts utilitaires

### `scripts/dev.ps1`

Lance deux fenêtres PowerShell :
- `python -m http.server 8080` dans `html5up-editorial/`
- `manage.py runserver 127.0.0.1:8000` dans `aine-cadet/`

### `scripts/build-vitrine.py`

Assemble la coque commune sur les 8 pages actives :

- Sidebar depuis `partials/sidebar.html`
- Meta SEO (OG, favicon, `emsp-aine-cadet-url`)
- Liens CSS sans `@import` bloquant (fontawesome + Google Fonts en `<link>`)
- Scripts : jQuery, Editorial, `emsp-config.js`, `emsp-init.js`, `ac-ui-vitrine.js`
- Skip link + bouton retour haut

```powershell
python scripts/build-vitrine.py
```

**Quand l'exécuter :** après modification de `partials/sidebar.html` ou changement structure coque.

### `scripts/sync-backgrounds.ps1`

Copie les fichiers `BACKGROUND/` vers :
- `html5up-editorial/assets/images/backgrounds/`
- `aine-cadet/static/images/backgrounds/`

Mapping : Emerald → `hero-emerald.jpg`, fond vert → `hero-pattern-green.jpg`, topographic → `hero-topo-animation.mp4`.

### `scripts/deploy-check.ps1`

Checklist pré-production :
1. `build-vitrine.py`
2. `makemigrations --check --dry-run`
3. `manage.py check`
4. `manage.py test apps`
5. `collectstatic --dry-run`

---

## 4. Applications Django

| App | Rôle | URLs principales |
|-----|------|------------------|
| `accounts` | Auth, profils Cadet/Aîné | `/accounts/` |
| `parrainage` | Demandes, messagerie, RDV, badges | `/`, `/parrainage/` |
| `concours` | Inscriptions FS MENUM, API session | `/concours/` |
| `formations` | CRUD filières admin | `/formations/` |
| `bibliotheque` | Documents PDF, API publique | `/bibliotheque/` |

Module transversal : `apps/core/email.py` (e-mails transactionnels Brevo).

### Migrations

```powershell
cd aine-cadet
.venv\Scripts\python.exe manage.py makemigrations
.venv\Scripts\python.exe manage.py migrate
```

### Commandes métier

```powershell
python manage.py initialiser_badges
python manage.py initialiser_filieres
python manage.py export_filieres_vitrine
python manage.py archiver_annee
python manage.py envoyer_rappels_rdv
```

---

## 5. Tests

```powershell
cd aine-cadet
.venv\Scripts\python.exe manage.py check
.venv\Scripts\python.exe manage.py test apps -v 1
```

Couverture actuelle : **38 tests** (parrainage, concours, bibliothèque, e-mails, API contact).

Tests e-mail isolés :

```powershell
.venv\Scripts\python.exe manage.py test apps.core.tests.test_email config.tests -v 1
```

Les tests utilisent le backend `locmem` — pas d'appel Brevo réel.

---

## 6. Conventions frontend

### Préfixes CSS

| Préfixe | Portée | Exemples |
|---------|--------|----------|
| `.emsp-*` | Vitrine institutionnelle | `.emsp-page-bg`, `.emsp-hero`, `.emsp-student-link` |
| `.ac-*` | Ainé & Cadet (formulaires, dashboard) | `.ac-form`, `.ac-card`, `.ac-toast`, `.ac-skip-link` |

Charte couleur : teal `#147c71`, vert foncé `#264719`.

### Fichiers CSS clés

| Fichier | Usage |
|---------|-------|
| `assets/css/emsp-custom.css` | Vitrine EMSP |
| `assets/css/ac-dashboard.css` | Dashboard, cartes rôle |
| `static/css/aine-cadet-forms.css` | Formulaires Django |
| `static/css/aine-cadet.css` | Layout Django |

**Règle `:has()` :** éviter en CSS vitrine/Django — utiliser la classe `.is-selected` posée par `ac-forms.js` sur les cartes rôle inscription.

**Règle `@import` :** ne pas ajouter d'`@import` dans `main.css` — préférer des balises `<link>` dans le HTML (déjà appliqué par `build-vitrine.py`).

### Modules JavaScript

| Fichier | Rôle |
|---------|------|
| `emsp-config.js` | Routes, contact, réseaux sociaux, base URL Django |
| `emsp-init.js` | Liens dynamiques + fetch API vitrine + formulaires AJAX |
| `ac-forms.js` | Validation email live, force MDP, cartes rôle |
| `ac-toast.js` | Notifications flash |
| `ac-ui-vitrine.js` | Retour haut vitrine |
| `ac-messaging-poll.js` | Polling messagerie (12 s) |

---

## 7. Pont vitrine ↔ Django

La vitrine statique ne peut pas accéder à la base Django directement. Le pont repose sur :

1. **`emsp-config.js`** — construit les URLs API
2. **`emsp-init.js`** — `fetch()` JSON + soumission formulaires AJAX
3. **`django-cors-headers`** — autorise `localhost:8080` → `:8000`
4. **`config/api_views.py`** + vues concours/bibliothèque — endpoints JSON

Documentation détaillée : [API-VITRINE.md](API-VITRINE.md).

---

## 8. E-mails (Brevo)

Sans clé API → backend **console** (dev).  
Avec `BREVO_API_KEY` → envoi réel via django-anymail.

Guide complet : [EMAIL-BREVO.md](EMAIL-BREVO.md).

---

## 9. Checklist avant déploiement

- [ ] `python scripts/build-vitrine.py` — sidebars et coque à jour
- [ ] `.\scripts\sync-backgrounds.ps1` — assets hero synchronisés
- [ ] `.\scripts\deploy-check.ps1` — check + tests + collectstatic dry-run
- [ ] `.env` production : `DEBUG=False`, `SECRET_KEY`, `ALLOWED_HOSTS`, `DATABASE_URL`
- [ ] `BREVO_API_KEY` + SPF/DKIM domaine `emsp.int`
- [ ] `EMSP_VITRINE_URL` et `AINE_CADET_PUBLIC_URL` corrects
- [ ] `AnneeConcours` active en admin (dates concours rentrée)
- [ ] Coordonnées contact cohérentes : `contact@emsp.int`, `(+225) 27 21 21 45 60 / 61`
- [ ] Vérifier manuellement formulaires contact + concours depuis la vitrine prod

Voir [DEPLOIEMENT.md](DEPLOIEMENT.md) pour Docker, Gunicorn et nginx.

---

## 10. Documentation associée

| Fichier | Contenu |
|---------|---------|
| [API-VITRINE.md](API-VITRINE.md) | Endpoints JSON, CORS, exemples fetch |
| [EMAIL-BREVO.md](EMAIL-BREVO.md) | Configuration e-mails transactionnels |
| [DEPANNAGE.md](DEPANNAGE.md) | Erreurs fréquentes et solutions |
| [AUDIT.md](AUDIT.md) | Checklist vérification complète |
| [DEPLOIEMENT.md](DEPLOIEMENT.md) | Production |
