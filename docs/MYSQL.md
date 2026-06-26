# MySQL — Ainé & Cadet (Django)

Guide pour connecter l'application Django à une base **MySQL** locale ou distante, en remplacement de SQLite (dev) ou PostgreSQL (Docker production).

---

## Démarrage en 2 minutes

**Vous n'avez qu'une seule commande SQL à exécuter dans MySQL** — le reste est automatisé.

### 1. Créer la base (MySQL Workbench, phpMyAdmin ou client `mysql`)

```sql
CREATE DATABASE emspconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configurer `.env`

```powershell
cd aine-cadet
copy .env.example .env
```

Renseignez au minimum **`DB_USER`** et **`DB_PASSWORD`** (ex. `root` / mot de passe vide en local).

### 3. Lancer le script tout-en-un

```powershell
# À la racine EMSPCONNECT
.\scripts\setup-mysql.ps1
```

Ce script : installe les dépendances (PyMySQL), applique **toutes les migrations** (`migrate` crée automatiquement toutes les tables), propose `createsuperuser`, lance `check`, les tests et les commandes seed (`initialiser_filieres`, `initialiser_badges`).

### 4. Démarrer l'application

```powershell
.\scripts\dev.ps1
```

- Vitrine → http://localhost:8080/index.html  
- Ainé & Cadet → http://127.0.0.1:8000/

> **Fallback SQLite** : commentez ou supprimez `DB_ENGINE=mysql` dans `.env` — Django utilisera `aine-cadet/db.sqlite3` sans MySQL.

---

## 1. Prérequis

- **MySQL Server 8.0+** ou **MariaDB 10.5+** installé et démarré
- Python 3.11+ avec l'environnement virtuel du projet (`aine-cadet/.venv`)
- Droits pour créer une base et un utilisateur MySQL

---

## 2. Création de la base

Connectez-vous au client MySQL (`mysql -u root -p`) puis exécutez :

```sql
CREATE DATABASE emspconnect
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Optionnel : utilisateur dédié (recommandé)
CREATE USER 'emsp_app'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON emspconnect.* TO 'emsp_app'@'localhost';
FLUSH PRIVILEGES;
```

> Utilisez **utf8mb4** pour supporter les accents, emojis et caractères ivoiriens sans corruption.

---

## 3. Driver Python (Windows)

Le projet utilise **PyMySQL** (pur Python), plus simple à installer sur Windows que `mysqlclient` (compilation C requise).

### Installation

```powershell
cd aine-cadet
.venv\Scripts\activate
pip install -r requirements.txt
```

Le patch est appliqué automatiquement au démarrage Django dans `config/__init__.py` :

```python
import pymysql
pymysql.install_as_MySQLdb()
```

### Alternative mysqlclient

Si vous préférez `mysqlclient` (légèrement plus performant) :

1. Installer [Build Tools for Visual Studio](https://visualstudio.microsoft.com/visual-cpp-build-tools/) avec « Desktop development with C++ »
2. `pip install mysqlclient`
3. Retirer ou commenter le bloc PyMySQL dans `config/__init__.py`

---

## 4. Configuration `.env`

Copier `aine-cadet/.env.example` vers `aine-cadet/.env` et renseigner :

```env
DB_ENGINE=mysql
DB_NAME=emspconnect
DB_USER=emsp_app
DB_PASSWORD=votre_mot_de_passe
DB_HOST=127.0.0.1
DB_PORT=3306
```

| Variable | Description |
|----------|-------------|
| `DB_ENGINE` | Mettre `mysql` pour activer MySQL. **Absent ou autre valeur** → SQLite (`db.sqlite3`) |
| `DB_NAME` | Nom de la base (défaut : `emspconnect`) |
| `DB_USER` | Utilisateur MySQL |
| `DB_PASSWORD` | Mot de passe (ne jamais committer) |
| `DB_HOST` | Hôte (souvent `127.0.0.1` en local) |
| `DB_PORT` | Port (défaut `3306`) |

> **Ne pas committer** le fichier `.env` ni de vrais mots de passe.

### Fallback SQLite (dev rapide)

Commentez ou supprimez `DB_ENGINE=mysql` dans `.env` : Django utilisera automatiquement `aine-cadet/db.sqlite3`.

---

## 5. Migrations et superutilisateur

> **`python manage.py migrate` crée automatiquement toutes les tables** dans la base `emspconnect` : Django (auth, sessions…), `accounts`, `parrainage`, `concours`, `formations`, `bibliotheque`. Aucun script SQL manuel n'est nécessaire après le `CREATE DATABASE`.

**Recommandé** — script automatisé :

```powershell
.\scripts\setup-mysql.ps1
```

**Manuel** (équivalent) :

```powershell
cd aine-cadet
.venv\Scripts\activate
python manage.py makemigrations
python manage.py migrate
python manage.py initialiser_admin --email admin@emsp.int
python manage.py check
python manage.py test apps
```

Commandes métier optionnelles :

```powershell
python manage.py initialiser_badges
```

Compte admin local :

```powershell
cd aine-cadet
$env:EMSP_ADMIN_PASSWORD="votre_mot_de_passe"
.venv\Scripts\python.exe manage.py initialiser_admin --email admin@emsp.int --no-input
Remove-Item Env:\EMSP_ADMIN_PASSWORD
```

La commande est idempotente : elle cree le compte s'il n'existe pas, ou repare les droits `is_staff`, `is_superuser`, `role=admin` et le mot de passe si le compte existe deja.

---

## 6. Export / import depuis SQLite

Si vous aviez des données dans SQLite et souhaitez les migrer vers MySQL :

### Méthode recommandée — dumpdata / loaddata

```powershell
# 1. Exporter depuis SQLite (retirer DB_ENGINE du .env temporairement)
python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission --indent 2 > backup.json

# 2. Activer MySQL dans .env, migrer le schéma
python manage.py migrate

# 3. Importer les données
python manage.py loaddata backup.json
```

### Points d'attention

- Les **fichiers media** (`media/profiles/`) ne sont pas inclus dans le dump : copiez le dossier manuellement
- En cas de conflit de clés primaires, repartir d'une base MySQL vide
- Vérifiez les encodages : MySQL doit rester en `utf8mb4`

---

## 7. Docker Compose

Le fichier `docker-compose.yml` à la racine utilise **PostgreSQL** pour la production conteneurisée. Pour MySQL en local, utilisez votre serveur MySQL natif avec les variables `.env` ci-dessus.

Exemple de service MySQL commenté dans `docker-compose.yml` (profil optionnel) :

```yaml
# db-mysql:
#   image: mysql:8.0
#   environment:
#     MYSQL_DATABASE: emspconnect
#     MYSQL_USER: emsp_app
#     MYSQL_PASSWORD: ${DB_PASSWORD:-changeme}
#     MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-rootsecret}
#   ports:
#     - "3306:3306"
#   command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
```

---

## 8. Dépannage

### `MariaDB 10.5 or later is required (found 10.4.x)`

Django 5 refuse MariaDB 10.4 (souvent livré avec d'anciennes versions de XAMPP/WAMP).

**Solutions :**
- Mettre à jour XAMPP/WAMP vers une version incluant **MariaDB 10.5+**
- Ou installer **MySQL Server 8.0+** à la place
- En attendant : retirer `DB_ENGINE=mysql` du `.env` pour utiliser SQLite en dev

Le script `setup-mysql.ps1` détecte cette incompatibilité avant `migrate`.

### `Access denied for user`

- Vérifiez `DB_USER`, `DB_PASSWORD`, `DB_HOST` dans `.env`
- Testez la connexion : `mysql -u emsp_app -p -h 127.0.0.1 emspconnect`
- Accordez les privilèges : `GRANT ALL ON emspconnect.* TO 'emsp_app'@'localhost';`

### `Unknown database 'emspconnect'`

Exécutez le `CREATE DATABASE` de la section 2.

### Erreurs charset / accents corrompus

Assurez-vous que :
- La base est créée en `utf8mb4`
- `settings.py` contient `"charset": "utf8mb4"` dans `OPTIONS`

### `mysqlclient` — erreur de compilation (Windows)

Utilisez **PyMySQL** (déjà dans `requirements.txt`) ou installez les Build Tools C++.

### `django.db.utils.OperationalError: (2002, "Can't connect...")`

- MySQL n'est pas démarré (Services Windows → MySQL)
- Mauvais port ou host firewall

### `Table 'django_content_type' already exists` (erreur 1050)

Cause : une migration a été interrompue — les tables existent mais `django_migrations` est incomplet.

**Solution automatique** — relancer le script (détecte et applique `--fake-initial`) :

```powershell
.\scripts\setup-mysql.ps1 -SkipSuperuser
```

**Solution manuelle** :

```powershell
cd aine-cadet
.venv\Scripts\python.exe manage.py migrate --fake-initial
```

**Repartir de zéro** (efface les données) :

```powershell
.\scripts\setup-mysql.ps1 -SkipSuperuser -ForceReset
```

### XAMPP / MariaDB 10.4

Ajoutez dans `.env` :

```env
MYSQL_ALLOW_LEGACY=1
```

Le script `setup-mysql.ps1` l'ajoute automatiquement si MariaDB 10.4 est détecté.

### Le script s'arrête avec des messages PowerShell rouges

Django affiche parfois des **WARNINGS** sur stderr (ex. contraintes MariaDB). Ce ne sont pas des erreurs fatales. Le script corrigé ignore ces faux positifs.

### Tests automatiques

Les tests s'exécutent avec SQLite si `DB_ENGINE` n'est pas défini. Pour CI, ne pas exporter `DB_ENGINE=mysql` sans service MySQL disponible.

---

## 9. Liens

- [docs/GUIDE-DEVELOPPEUR.md](GUIDE-DEVELOPPEUR.md) — setup général
- [docs/DEPLOIEMENT.md](DEPLOIEMENT.md) — production PostgreSQL / Docker
- [docs/DEPANNAGE.md](DEPANNAGE.md) — erreurs fréquentes
