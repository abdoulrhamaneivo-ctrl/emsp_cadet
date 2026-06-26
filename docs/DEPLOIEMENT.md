# Déploiement — EMSPCONNECT / Ainé & Cadet

> Phase 4 — PostgreSQL, Docker, Gunicorn, cron

---

## Prérequis production

- Python 3.11+
- PostgreSQL 14+ (ou conteneur Docker)
- Serveur web (nginx) + Gunicorn
- Domaine : `emsp.int` (vitrine) + sous-domaine app optionnel (`api.emsp.int`)

---

## Vérification pré-déploiement

```powershell
# À la racine EMSPCONNECT
.\scripts\deploy-check.ps1
```

Exécute : `build-vitrine.py`, `makemigrations --check`, `manage.py check`, `test apps`, `collectstatic --dry-run`.

---

## Variables d'environnement (`.env`)

```env
DEBUG=False
SECRET_KEY=<clé-longue-aléatoire>
ALLOWED_HOSTS=emsp.int,www.emsp.int,api.emsp.int
DATABASE_URL=postgres
DB_NAME=aine_cadet
DB_USER=aine_cadet
DB_PASSWORD=<secret>
DB_HOST=localhost
DB_PORT=5432
SCHOOL_EMAIL_DOMAIN=emsp.int
EMSP_VITRINE_URL=https://www.emsp.int
AINE_CADET_PUBLIC_URL=https://api.emsp.int
BREVO_API_KEY=<clé-api-brevo-v3>
DEFAULT_FROM_EMAIL=noreply@emsp.int
BREVO_SENDER_NAME=EMSP / Ainé & Cadet
CONTACT_API_EMAIL=contact@emsp.int
CONCOURS_PREINSCRIPTION_EMAIL=admissions@emsp.int
```

Copier `aine-cadet/.env.example` vers `aine-cadet/.env`.

**MySQL (dev local Windows)** — voir [docs/MYSQL.md](MYSQL.md) :

```env
DB_ENGINE=mysql
DB_NAME=emspconnect
DB_USER=
DB_PASSWORD=
DB_HOST=127.0.0.1
DB_PORT=3306
```

**PostgreSQL (Docker / production)** :

### Brevo (e-mails transactionnels)

1. Créer un compte sur [brevo.com](https://www.brevo.com) (gratuit jusqu'à 300 e-mails/jour).
2. **Paramètres → SMTP & API → Clés API** : générer une clé v3 → `BREVO_API_KEY`.
3. **Expéditeurs & domaines** : ajouter et vérifier `emsp.int` (ou au minimum `noreply@emsp.int`).
4. Configurer les enregistrements **SPF** et **DKIM** proposés par Brevo sur le DNS du domaine — indispensable pour la délivrabilité.
5. Sans clé API, Django utilise le backend **console** (e-mails affichés dans les logs en dev).

E-mails couverts : bienvenue inscription, contact vitrine (admin + accusé), pré-inscription concours (candidat + admissions), mot de passe oublié, notifications parrainage.

Alternative SMTP Brevo (si `EMAIL_BACKEND=smtp`) :

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_HOST_USER=<login-smtp-brevo>
EMAIL_HOST_PASSWORD=<clé-smtp-brevo>
EMAIL_USE_TLS=True
```

L'API Brevo via `django-anymail` est recommandée (déjà dans `requirements.txt`).

---

## Option A — Docker Compose (recommandé)

```powershell
# Racine EMSPCONNECT
$env:SECRET_KEY = "votre-cle-secrete"
$env:DB_PASSWORD = "mot-de-passe-postgres"
docker compose up -d --build
docker compose exec app python manage.py migrate
docker compose exec app python manage.py initialiser_filieres
docker compose exec app python manage.py initialiser_badges
docker compose exec app python manage.py createsuperuser
```

Services :
- **db** — PostgreSQL 16 sur le port 5432
- **app** — Gunicorn sur le port 8000

Volumes persistants : `pgdata`, `media`, `staticfiles`.

---

## Option B — Installation manuelle

### Base PostgreSQL

```sql
CREATE USER aine_cadet WITH PASSWORD '...';
CREATE DATABASE aine_cadet OWNER aine_cadet;
```

```powershell
cd aine-cadet
pip install -r requirements.txt -r requirements-prod.txt
python manage.py migrate
python manage.py initialiser_filieres
python manage.py initialiser_badges
python manage.py createsuperuser
python manage.py collectstatic --noinput
```

### Gunicorn

```powershell
cd aine-cadet
gunicorn -c gunicorn.conf.py config.wsgi:application
```

Configuration commentée : `aine-cadet/gunicorn.conf.py`

### Procfile (Heroku / Railway)

```
web: cd aine-cadet && gunicorn -c gunicorn.conf.py config.wsgi:application
```

### Exemple systemd

```ini
[Unit]
Description=Ainé & Cadet EMSP
After=network.target postgresql.service

[Service]
User=www-data
WorkingDirectory=/opt/emsconnect/aine-cadet
EnvironmentFile=/opt/emsconnect/aine-cadet/.env
ExecStart=/opt/emsconnect/aine-cadet/.venv/bin/gunicorn -c gunicorn.conf.py config.wsgi:application
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

---

## Vitrine statique

Servir `html5up-editorial/` via nginx ou CDN.

```powershell
python scripts/build-vitrine.py      # injecte sidebar
.\scripts\sync-backgrounds.ps1       # copie photos BACKGROUND/
python -m http.server 8080           # dev local
```

Meta production : `<meta name="emsp-aine-cadet-url" content="https://api.emsp.int">`

La vitrine charge dynamiquement :
- Session concours → `/concours/session-active.json`
- Ressources publiques médiathèque → `/bibliotheque/api/publiques.json`

---

## nginx (exemple)

```nginx
# Vitrine
server {
    listen 443 ssl;
    server_name www.emsp.int;
    root /var/www/emsp/html5up-editorial;
    index index.html;
    location / { try_files $uri $uri/ =404; }
}

# Application Django
server {
    listen 443 ssl;
    server_name api.emsp.int;
    location /static/ { alias /opt/emsconnect/aine-cadet/staticfiles/; }
    location /media/  { alias /opt/emsconnect/aine-cadet/media/; }
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Cron rappels RDV

```cron
0 8 * * * cd /opt/aine-cadet && .venv/bin/python manage.py envoyer_rappels_rdv >> /var/log/aine-cadet-rdv.log 2>&1
```

Fuseau serveur : `Africa/Abidjan`.

---

## Archivage fin d'année

```powershell
python manage.py archiver_annee --annee 2025-2026
```

---

## Admin — données à configurer

| Modèle | Emplacement admin | Note |
|--------|-------------------|------|
| `AnneeConcours` | Concours | Vérifier www.emsp.int chaque rentrée |
| `RessourceDocument` | Bibliothèque | PDF ou lien externe |
| `Filiere` | Formations | Export JSON vitrine |

---

## RGPD

- Suppression compte : `/accounts/supprimer-compte/` (utilisateur authentifié)
- Export données : à planifier Phase 4+ si exigé

---

## CI/CD (recommandé)

1. `.\scripts\deploy-check.ps1`
2. Deploy : `migrate` + `collectstatic` + restart gunicorn
3. Smoke test : `/accounts/login/`, `/bibliotheque/`, `/concours/inscription/`

---

## Hors scope infra locale

- Certificats SSL/TLS (Let's Encrypt)
- CDN photos campus
- Stockage S3 médias
- Monitoring (Sentry, Datadog)
