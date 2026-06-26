# EMSPCONNECT — Documentation Complète du Projet

> **Pour toute personne souhaitant reprendre, déployer ou contribuer au projet.**  
> Version : Juin 2026 | Auteur : EMSP / Équipe Aine-Cadet

---

## Table des matières

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Architecture du projet](#2-architecture-du-projet)
3. [Applications Django](#3-applications-django)
4. [Modèles de données](#4-modèles-de-données)
5. [Schéma SQL de la base de données](#5-schéma-sql)
6. [Configuration MySQL](#6-configuration-mysql)
7. [Installation et démarrage](#7-installation-et-démarrage)
8. [Pages et fonctionnalités](#8-pages-et-fonctionnalités)
9. [Partie Vitrine (html5up-editorial)](#9-vitrine-html5up-editorial)
10. [Système de concours et inscriptions](#10-système-de-concours-et-inscriptions)
11. [Bibliothèque et Médiathèque](#11-bibliothèque-et-médiathèque)
12. [Système de parrainage et messagerie](#12-parrainage-et-messagerie)
13. [CSS, Design System et UI](#13-css-design-system-et-ui)
14. [Tests automatisés](#14-tests-automatisés)
15. [Déploiement en production](#15-déploiement-en-production)
16. [Variables d'environnement](#16-variables-denvironnement)
17. [Audit et flux complets](#17-audit-et-flux-complets)

---

## 1. Vue d'ensemble du projet

**EMSPCONNECT** est la plateforme numérique officielle de l'**École Militaire Supérieure de Police (EMSP)** d'Abidjan (Côte d'Ivoire). Elle comprend deux parties :

| Partie | Technologie | Port | Rôle |
|--------|-------------|------|------|
| **Vitrine publique** | HTML/CSS statique (thème HTML5UP Editorial) | 8080 | Présentation EMSP, formations, concours public |
| **Application web** | Django 5 (Python) | 8000 | Espace connecté : parrainage, bibliothèque, candidatures |

### Rôles utilisateurs

| Rôle | Description |
|------|-------------|
| `admin` | Administrateur EMSP (staff Django) |
| `aine` | Étudiant Aîné (parrain potentiel) |
| `filleul` (cadet) | Étudiant de première année (filleul) |
| Anonyme | Visiteur vitrine uniquement |

---

## 2. Architecture du projet

```
EMSPCONNECT/
├── aine-cadet/                     # Application Django principale
│   ├── apps/                       # Applications métier
│   │   ├── accounts/               # Authentification & profils
│   │   ├── bibliotheque/           # Bibliothèque numérique & médiathèque
│   │   ├── concours/               # Inscriptions au concours d'entrée
│   │   ├── formations/             # Présentation des filières
│   │   └── parrainage/             # Système de parrainage Aîné-Cadet
│   ├── config/                     # Configuration Django
│   │   ├── __init__.py             # Chargement pymysql (MySQL)
│   │   ├── settings.py             # Paramètres (SQLite/MySQL/PostgreSQL)
│   │   ├── urls.py                 # Routes globales
│   │   └── wsgi.py / asgi.py
│   ├── templates/                  # Templates HTML Django
│   │   ├── base.html               # Template de base
│   │   ├── accounts/               # Login, inscription, profil, annuaire
│   │   ├── bibliotheque/           # Liste et détail des ressources
│   │   ├── concours/               # Formulaire d'inscription concours
│   │   ├── formations/             # Liste et détail des filières
│   │   └── parrainage/             # Dashboard, messagerie, événements
│   ├── static/                     # CSS/JS/images de l'app Django
│   ├── media/                      # Fichiers uploadés (photos, PDFs)
│   ├── db.sqlite3                  # Base SQLite (développement)
│   ├── manage.py
│   └── requirements.txt
│
├── html5up-editorial/              # Vitrine publique statique
│   ├── index.html                  # Page d'accueil EMSP
│   ├── formations-fs-menum.html    # Page FS MENUM (5 spécialités)
│   ├── formations-fsp.html         # Page FSP
│   ├── formations-regnum.html      # Page RegNUM
│   ├── concours.html               # Page concours (lien vers app Django)
│   └── assets/
│       ├── css/
│       │   ├── main.css            # CSS thème HTML5UP
│       │   ├── emsp-custom.css     # CSS personnalisé EMSP (couleurs, composants)
│       │   └── ac-carousel.css     # CSS du carrousel médiathèque
│       ├── js/
│       └── images/
│
├── emspconnect_schema.sql          # Script SQL du schéma de la BDD (26 tables)
├── docker-compose.yml              # Configuration Docker
├── Procfile                        # Configuration Heroku/Railway
└── docs/                           # Documentation du projet
    └── DOCUMENTATION_COMPLETE.md  # Ce fichier
```

---

## 3. Applications Django

### `accounts` — Comptes & Authentification

**Modèle principal :** `User` (extension de `AbstractUser`)

Champs supplémentaires :
- `email` (unique, utilisé comme identifiant de connexion)
- `role` : `admin` | `aine` | `filleul`
- `classe` : ex. `"Promotion 2024"`
- `filiere` : ex. `"FS MENUM / LNUM"`
- `photo` : photo de profil
- `attentes` : texte libre (attentes envers le parrainage)
- `is_suspended` : compte suspendu

**Vues principales :**

| URL | Vue | Description |
|-----|-----|-------------|
| `/accounts/login/` | `LoginView` | Connexion par email |
| `/accounts/inscription/` | `InscriptionView` | Inscription nouvelle recrue |
| `/accounts/profil/` | `ProfilView` | Profil personnel |
| `/accounts/annuaire/` | `AnnuaireView` | Annuaire (authentifié) |

---

### `formations` — Filières & Formations

Présente les trois filières de l'EMSP :

| Filière | Sigle | Type |
|---------|-------|------|
| Filière Supérieure de Police | FSP | Sécurité/Police |
| FS Métiers de l'Économie Numérique | FS MENUM | Numérique |
| Régulation du Numérique | RegNUM | Régulation |

**Modèles :**
- `Filiere` : nom, type_formation, description, image, duree, cours (TextField)
- `Specialite` : code, nom, filiere (FK), description, debouches, cours (TextField)

**La FS MENUM comporte 5 spécialités :**

| Code | Nom | Débouchés |
|------|-----|-----------|
| LNUM | Logistique & Numérique | Chargé Logistique, Approvisionneur, Gestionnaire de Stocks, E-commerce |
| FDIG | Finance Digitale | Analyste Financier, Chargé Mobile Money, Expert Fintech |
| MDIG | Marketing Digital | Community Manager, Chef de Projet Digital, SEO/SEA |
| DSER | Développement de Services Numériques | Développeur Web, Intégrateur, Architecte SI |
| GARE | Gestion & Administration des Réseaux | Administrateur Réseau, Expert Cybersécurité, RSSI |

**Vues :**

| URL | Description |
|-----|-------------|
| `/formations/` | Liste des filières |
| `/formations/<slug>/` | Détail filière : spécialités, débouchés, cours |

---

### `concours` — Inscription au Concours

> **Important** : L'inscription au concours est uniquement pour la **FS MENUM**. Le candidat choisit ses spécialités par ordre de préférence.

**Modèles :**
- `AnneeConcours` : session du concours, statut (ouvert/fermé)
- `InscriptionConcours` : dossier de candidature complet

**Champs de l'inscription :**
- Informations personnelles (nom, prénom, date de naissance, sexe...)
- `photo_identite` : fichier (JPG, PNG, PDF)
- `cni_document` : CNI / Récépissé / Autre pièce d'identité (JPG, PNG, PDF)
- `collante_bac` : relevé/collante du BAC (JPG, PNG, PDF)
- `choix_1`, `choix_2`, `choix_3` : Spécialités choisies par ordre de préférence (FK vers Specialite)

**Règles métier :**
1. L'inscription est impossible si aucune session active n'existe
2. L'admin peut ouvrir/fermer le concours depuis `/admin/`
3. Les 3 choix de spécialités doivent être distincts
4. L'admin valide ou rejette les candidatures

---

### `bibliotheque` — Bibliothèque & Médiathèque

**Accès :** Réservé aux utilisateurs connectés (`@login_required`)

**Modèles :**

**`RessourceDocument`** — Documents pédagogiques :
- `titre`, `categorie` (`brochure` | `cours` | `reglement` | `publication` | `autre`)
- `resume` : résumé affiché en liste
- `fichier` : PDF uploadé OU `lien_externe` : URL
- `publie` : bool
- `reserve_etudiants` : si `False`, visible aussi en vitrine via l'API publique
- `ordre` : ordre d'affichage

**`MediaBibliotheque`** — Photos et vidéos (album géré par l'admin) :
- `titre`, `type_media` (`photo` | `video`)
- `fichier` : fichier local (photo ou vidéo)
- `video_url` : URL externe (YouTube, etc.)
- `legende`, `ordre`, `publie`

**Fonctionnement du carrousel :**
1. L'admin ajoute des photos/vidéos depuis `/admin/bibliotheque/mediabibliotheque/`
2. Les médias publiés s'affichent automatiquement dans un **carrousel** sur la page bibliothèque
3. Un album sous le carrousel liste toutes les photos avec leurs légendes

**API publique :**
- `GET /bibliotheque/api/publiques/` → JSON des ressources non réservées (pour vitrine)

---

### `parrainage` — Système de Parrainage Aîné-Cadet

Le module le plus riche du projet. Il gère le cycle complet de parrainage.

**Modèles principaux :**

| Modèle | Description |
|--------|-------------|
| `AnneeAcademique` | Année en cours, une seule active |
| `DemandeParrainage` | Demande d'un Cadet vers un Aîné (statuts: `en_attente`, `accepte`, `refuse`, `cloture`) |
| `Message` | Messages entre Aîné et Cadet du même binôme |
| `RendezVous` | Proposition de RDV (date, lieu, statut) |
| `Evenement` + `InscriptionEvenement` | Événements créés par les admins |
| `Avis` | Évaluation post-parrainage (note 1–5) |
| `Badge` | Récompenses virtuelles pour les aînés |
| `ProfilParrain` | Score de fiabilité, badges, statistiques de l'aîné |

**Cycle de vie :**
```
Cadet envoie demande
    → Aîné accepte/refuse
    → Binôme actif (messagerie + RDV)
    → Fin d'année : Archivage
    → Avis Cadet → Score fiabilité Aîné mis à jour
```

---

## 4. Modèles de données

### Diagramme des relations principales

```
accounts_user (1) ────────────── (N) parrainage_demandeparrainage
     │ (parrain_id / filleul_id)         │
     │                                    ├── (N) parrainage_message
     │                                    ├── (N) parrainage_rendezvous
     │                                    └── (N) parrainage_avis
     │
     └──── (1) accounts_profilparrain ──── (N) parrainage_badge (M2M)

formations_filiere (1) ──────── (N) formations_specialite
                                         ↑
concours_inscriptionconcours.choix_1/2/3─┘

bibliotheque_ressourcedocument  (indépendant)
bibliotheque_mediabibliotheque  (indépendant)
```

---

## 5. Schéma SQL

Le fichier **`emspconnect_schema.sql`** à la racine du projet contient le schéma complet exporté depuis SQLite3.

```
26 tables | 35 index
```

### Tables principales

| Table | Description |
|-------|-------------|
| `accounts_user` | Utilisateurs (cadets, aînés, admins) |
| `accounts_profilparrain` | Profil étendu des aînés |
| `formations_filiere` | Filières de formation |
| `formations_specialite` | Spécialités par filière |
| `bibliotheque_ressourcedocument` | Documents pédagogiques |
| `bibliotheque_mediabibliotheque` | Photos et vidéos |
| `concours_anneeconcours` | Sessions du concours |
| `concours_inscriptionconcours` | Candidatures au concours |
| `parrainage_demandeparrainage` | Demandes de parrainage |
| `parrainage_message` | Messages binôme |
| `parrainage_rendezvous` | Rendez-vous |
| `parrainage_evenement` | Événements |
| `parrainage_avis` | Évaluations post-parrainage |
| `parrainage_badge` | Badges de récompense |
| `parrainage_anneeacademique` | Années académiques |

> Pour créer la base de données avec Django (recommandé), utiliser `python manage.py migrate` plutôt qu'importer directement ce SQL. Le script SQL sert de référence documentaire.

---

## 6. Configuration MySQL

### Étape 1 — Installer les dépendances

```bash
pip install pymysql
# Ou si mysqlclient compilé disponible :
pip install mysqlclient
```

### Étape 2 — Créer la base de données MySQL

```sql
CREATE DATABASE aine_cadet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'emsp_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON aine_cadet.* TO 'emsp_user'@'localhost';
FLUSH PRIVILEGES;
```

### Étape 3 — Configurer les variables d'environnement

Créez le fichier `aine-cadet/.env` :

```env
DB_ENGINE=mysql
DB_NAME=aine_cadet
DB_USER=emsp_user
DB_PASSWORD=votre_mot_de_passe
DB_HOST=localhost
DB_PORT=3306

SECRET_KEY=generez-une-cle-secrete-longue-et-aleatoire
DEBUG=False
ALLOWED_HOSTS=emsp.int,www.emsp.int
```

### Étape 4 — Appliquer les migrations

```bash
cd aine-cadet
python manage.py migrate
python manage.py createsuperuser
python manage.py initialiser_filieres   # Peupler les filières et spécialités
```

### Comment ça fonctionne dans le code

**`config/__init__.py`** — Chargement du pilote MySQL :

```python
try:
    import pymysql
    pymysql.install_as_MySQLdb()
except ImportError:
    pass
```

**`config/settings.py`** — Détection automatique :

```python
# Connexion via DATABASE_URL complète (ex: mysql://user:pwd@host/db)
elif _database_url.startswith("mysql://"):
    DATABASES = { "default": { "ENGINE": "django.db.backends.mysql", ... } }

# Connexion via variables séparées (méthode recommandée)
elif os.getenv("DB_ENGINE") == "mysql":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "NAME": os.getenv("DB_NAME", "aine_cadet"),
            "USER": os.getenv("DB_USER", "root"),
            "PASSWORD": os.getenv("DB_PASSWORD", ""),
            "HOST": os.getenv("DB_HOST", "localhost"),
            "PORT": os.getenv("DB_PORT", "3306"),
        }
    }

# SQLite par défaut (développement)
else:
    DATABASES = { "default": { "ENGINE": "django.db.backends.sqlite3", "NAME": BASE_DIR / "db.sqlite3" } }
```

### Notes d'adaptation MySQL pour le fichier SQL

| SQLite | MySQL |
|--------|-------|
| `INTEGER PRIMARY KEY AUTOINCREMENT` | `INT AUTO_INCREMENT PRIMARY KEY` |
| `bool` | `TINYINT(1)` |
| `DEFERRABLE INITIALLY DEFERRED` | *(supprimer cette clause)* |
| Pas de charset | `CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci` |

---

## 7. Installation et démarrage

### Prérequis

- Python 3.11+
- SQLite3 (intégré Python) ou MySQL 8+
- pip

### Installation locale (développement)

```bash
# 1. Cloner le projet
git clone <repo> EMSPCONNECT
cd EMSPCONNECT/aine-cadet

# 2. Créer l'environnement virtuel
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # Linux/Mac

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Appliquer les migrations (SQLite par défaut)
python manage.py migrate

# 5. Peupler les filières et spécialités
python manage.py initialiser_filieres

# 6. Créer un superutilisateur admin
python manage.py createsuperuser

# 7. Lancer le serveur Django (port 8000)
python manage.py runserver

# 8. (Optionnel) Lancer la vitrine statique (port 8080)
# Windows PowerShell :
cd ..\html5up-editorial
python -m http.server 8080
```

### Accès

| URL | Description |
|-----|-------------|
| `http://localhost:8000/admin/` | Administration Django |
| `http://localhost:8000/accounts/login/` | Connexion |
| `http://localhost:8000/formations/` | Filières |
| `http://localhost:8000/concours/` | Inscription concours |
| `http://localhost:8000/bibliotheque/` | Bibliothèque (connecté) |
| `http://localhost:8000/parrainage/` | Espace parrainage (connecté) |
| `http://localhost:8080/` | Vitrine publique statique |
| `http://localhost:8080/formations-fs-menum.html` | Page FS MENUM |

---

## 8. Pages et fonctionnalités

### Flux public (non connecté)

```
Vitrine (port 8080)
  ├── index.html               → Accueil EMSP
  ├── formations-fsp.html      → FSP (Filière Supérieure de Police)
  ├── formations-fs-menum.html → FS MENUM (5 spécialités détaillées)
  ├── formations-regnum.html   → RegNUM (Régulation Numérique)
  └── concours.html            → Info concours + lien vers /concours/
```

### Flux connecté (port 8000)

```
/accounts/login/
  │
  ├── [Admin] → /admin/
  │                ├── Ouvrir/Fermer le concours
  │                ├── Valider/Rejeter les candidatures
  │                ├── Ajouter documents bibliothèque
  │                ├── Ajouter photos/vidéos médiathèque
  │                └── Dashboard parrainage / archivage
  │
  ├── [Aîné] → /parrainage/
  │              ├── Voir les demandes reçues
  │              ├── Accepter/Refuser
  │              ├── Messagerie binôme
  │              └── Proposer RDV
  │
  └── [Cadet] → /parrainage/
                  ├── Chercher un aîné
                  ├── Envoyer demande de parrainage
                  ├── Messagerie binôme
                  ├── S'inscrire aux événements
                  └── /concours/ → Inscription concours
```

---

## 9. Vitrine html5up-editorial

La vitrine est un **site statique** basé sur le thème HTML5UP Editorial, personnalisé aux couleurs de l'EMSP.

### Palette de couleurs EMSP

```css
--emsp-green:       #147c71;   /* Vert principal EMSP */
--emsp-green-dark:  #264719;   /* Vert foncé */
--emsp-gold:        #c9a84c;   /* Or EMSP */
--ac-primary-500:   #147c71;   /* Alias design system */
--ac-gold-500:      #c9a84c;
```

### Typographie

- Police principale : **Outfit** (Google Fonts)
- Police secondaire : **Inter**

### Composants CSS personnalisés

Définis dans `assets/css/emsp-custom.css` :

| Classe | Description |
|--------|-------------|
| `.emsp-page-header` | Bannière titre de page avec fond dégradé vert EMSP |
| `.ac-hero-banner` | Bannière pleine largeur avec image de fond |
| `.ac-card` | Carte avec ombre légère et bordure |
| `.ac-badge` | Badge coloré (catégorie, statut) |
| `.ac-back-to-top` | Bouton circulaire retour en haut (bas à droite, fixe) |
| `.ac-section-title` | Titre de section stylisé |
| `.ac-specialite-card` | Carte de spécialité en grille |
| `.ac-animate-in` | Animation d'apparition au défilement |

Définis dans `assets/css/ac-carousel.css` :

| Classe | Description |
|--------|-------------|
| `.ac-carousel-wrapper` | Conteneur du carrousel |
| `.ac-slide` | Diapositive individuelle |
| `.ac-carousel__prev / __next` | Boutons navigation (cercles parfaits, `!important`) |
| `.ac-carousel__dot` | Points de pagination |

> **Note technique — Boutons circulaires :** Les boutons `.ac-back-to-top` et `.ac-carousel__prev/next` utilisent `!important` sur `padding`, `width`, `height`, `min-width`, `max-width`, `border-radius` pour éviter l'étirement en ovale causé par les styles généraux du thème HTML5UP.

### Page `formations-fs-menum.html` (clé de la vitrine)

Présente les 5 spécialités de la FS MENUM avec :
- Description détaillée de chaque spécialité
- Débouchés professionnels spécifiques
- Programme de cours (aperçu)
- CSS Grid (`display: grid; grid-template-columns: 1fr; gap: 1.5rem;`)
- Hover effect sur chaque carte (`translateY(-2px)`)

---

## 10. Système de concours et inscriptions

### Règles importantes

1. **Seule la FS MENUM** est concernée par les inscriptions via la plateforme
2. Le candidat choisit **3 spécialités par ordre de préférence**
3. Les 3 choix doivent être **distincts**
4. L'admin **ouvre ou ferme** le concours depuis l'interface d'administration
5. Pièces justificatives obligatoires :
   - **photo_identite** : Photo du candidat (JPG, PNG ou PDF)
   - **cni_document** : CNI OU Récépissé OU Autre pièce d'identité (JPG, PNG, PDF)
   - **collante_bac** : Relevé/collante du baccalauréat (JPG, PNG, PDF)
6. L'admin valide ou rejette chaque candidature

### Workflow complet

```
Admin ouvre le concours (AnneeConcours.statut = 'ouvert')
        ↓
Candidat accède à /concours/ → Formulaire disponible
        ↓
Candidat remplit formulaire + upload des pièces justificatives
        ↓
Dossier créé en statut 'en_attente'
        ↓
Admin → /admin/concours/inscriptionconcours/ → Consulte les dossiers
        ↓
Admin valide → statut 'valide'  |  Admin rejette → statut 'rejete'
        ↓
Admin ferme le concours (AnneeConcours.statut = 'ferme')
```

---

## 11. Bibliothèque et Médiathèque

### Documents pédagogiques

L'admin ajoute des documents depuis `/admin/bibliotheque/ressourcedocument/add/` :
- Brochures institutionnelles
- Supports de cours
- Règlements et procédures
- Publications et actualités

Si `reserve_etudiants = False` → la ressource est aussi visible sur la vitrine via l'API JSON publique.

### Album photos/vidéos (Médiathèque)

L'admin gère l'album depuis `/admin/bibliotheque/mediabibliotheque/add/` :
- Upload de photos locales ou ajout d'URL YouTube
- L'ordre d'affichage est contrôlé par le champ `ordre`
- Les médias publiés s'affichent dans le **carrousel automatique** sur la page bibliothèque
- L'album complet est affiché sous le carrousel

### Contrôles admin — Bibliothèque

| Action | Qui peut faire | Comment |
|--------|----------------|---------|
| Ajouter document | Admin (is_staff) | `/admin/bibliotheque/ressourcedocument/add/` |
| Ajouter photo/vidéo | Admin (is_staff) | `/admin/bibliotheque/mediabibliotheque/add/` |
| Publier/Dépublier | Admin | Champ `publie` dans l'admin |
| Réserver aux étudiants | Admin | Champ `reserve_etudiants` |
| Ordonner l'affichage | Admin | Champ `ordre` (tri croissant) |

---

## 12. Parrainage et Messagerie

### Principe

Chaque Cadet (filleul) peut envoyer une demande de parrainage à un Aîné disponible. L'Aîné accepte ou refuse. En cas d'acceptation, le binôme est formé et la messagerie interne s'active.

### Messagerie

- La messagerie n'est accessible qu'aux **membres d'un binôme accepté**
- Les messages non lus sont comptabilisés et affichés dans le dashboard
- URL : `/parrainage/message/<id_parrainage>/`

### Tests messagerie (flows vérifiés et passants)

| Test | Résultat |
|------|----------|
| Accès messagerie binôme accepté | OK |
| Accès messagerie refusé si parrainage non accepté | OK |
| Compteur messages non lus | OK |
| Proposition RDV | OK |
| Accepter/refuser RDV | OK |

### Score de fiabilité

Après la clôture d'une année académique :
1. Le Cadet peut laisser un avis (note 1–5)
2. La note moyenne alimente le **score de fiabilité** de l'Aîné (`ProfilParrain.score_fiabilite`)
3. L'Aîné obtient des badges en fonction de ses performances

---

## 13. CSS, Design System et UI

### Principes de design

- **Pas de framework CSS** (pas de Tailwind, pas de Bootstrap) — CSS natif uniquement
- **Variables CSS** pour la cohérence des couleurs et dimensions
- **CSS Grid** pour toutes les mises en page (responsive automatique)
- **Google Fonts** pour une typographie moderne
- **Animations CSS** légères (transitions hover, fadeIn)

### Variables CSS globales

```css
:root {
  /* Couleurs EMSP */
  --emsp-green:        #147c71;
  --emsp-green-dark:   #264719;
  --emsp-gold:         #c9a84c;
  --ac-primary-500:    #147c71;
  --ac-gold-500:       #c9a84c;

  /* Espacement et rayons */
  --ac-radius-sm:      4px;
  --ac-radius-md:      8px;
  --ac-radius-lg:      12px;

  /* Ombres */
  --ac-shadow-sm:      0 2px 8px rgba(0,0,0,0.06);
  --ac-shadow-lg:      0 8px 32px rgba(0,0,0,0.12);
}
```

### Grilles CSS utilisées

```css
/* Grille de filières (responsive automatique) */
.ac-formations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Grille de spécialités (une colonne, lisible) */
.ac-specialite-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}
```

### Cohérence front (connecté ou non)

Les mêmes variables CSS et classes sont partagées entre :
- La vitrine statique (`html5up-editorial/assets/css/emsp-custom.css`)
- L'application Django (via `static/` importé dans `base.html`)

---

## 14. Tests automatisés

### Lancer les tests

```bash
cd aine-cadet
python manage.py test --verbosity=2
```

### Suite de tests — 33 tests, 100% PASS

| App | Nb tests | Couverture |
|-----|----------|-----------|
| `accounts` | 3 | Accueil public, annuaire authentifié, inscription |
| `bibliotheque` | 4 | Liste, détail, API publique, accès anonyme redirigé |
| `concours` | 5 | Inscription valide, fermée, doublon, admin toggle, admin validation |
| `parrainage` | 21 | Messagerie, RDV, avis, score fiabilité, dashboard admin, archivage |
| **Total** | **33** | **100% PASS (Ran 33 tests in ~99s — OK)** |

### Résultat attendu

```
Ran 33 tests in 99.099s
OK
```

---

## 15. Déploiement en production

### Option A — Docker

```bash
docker-compose up -d
```

Le `docker-compose.yml` configure le conteneur Django avec volume pour `media/`.

### Option B — Heroku / Railway

Le `Procfile` est configuré :

```
web: gunicorn config.wsgi --workers 2 --threads 4 --worker-class gthread
```

Variables d'environnement à configurer sur la plateforme :
- `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`
- `DATABASE_URL` (PostgreSQL) ou `DB_ENGINE=mysql` + `DB_NAME`, etc.

### Option C — VPS Linux avec Nginx + Gunicorn

```bash
# Lancer Gunicorn
gunicorn config.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 4 \
  --timeout 120 \
  --log-level info

# Collecter les fichiers statiques
python manage.py collectstatic --no-input
```

Configuration Nginx minimale :

```nginx
server {
    listen 80;
    server_name emsp.int www.emsp.int;

    location /static/ {
        alias /path/to/aine-cadet/staticfiles/;
    }
    location /media/ {
        alias /path/to/aine-cadet/media/;
    }
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 16. Variables d'environnement

Fichier : `aine-cadet/.env` (copier depuis `.env.example`)

| Variable | Description | Défaut |
|----------|-------------|--------|
| `SECRET_KEY` | Clé secrète Django | *(à générer)* |
| `DEBUG` | Mode debug | `True` (dev) |
| `ALLOWED_HOSTS` | Domaines autorisés | `localhost` |
| `DATABASE_URL` | URL complète de la BDD | `""` |
| `DB_ENGINE` | `mysql` ou vide | `""` (→ SQLite) |
| `DB_NAME` | Nom de la base | `aine_cadet` |
| `DB_USER` | Utilisateur BDD | `root` |
| `DB_PASSWORD` | Mot de passe BDD | `""` |
| `DB_HOST` | Hôte BDD | `localhost` |
| `DB_PORT` | Port BDD | `3306` (MySQL) / `5432` (PG) |

### Générer une SECRET_KEY

```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## 17. Audit et flux complets

### Flux d'inscription au concours (détaillé)

```
1. Admin: AnneeConcours.statut → 'ouvert'
2. Candidat → GET /concours/ → Formulaire visible
3. Candidat remplit:
   - Informations personnelles
   - choix_1 / choix_2 / choix_3 (spécialités FS MENUM, ordre préférence)
   - Fichiers: photo_identite, cni_document (CNI/récépissé/autre), collante_bac
4. POST /concours/ → Validation Django (3 choix distincts, fichiers requis)
5. InscriptionConcours créée (statut='en_attente')
6. Admin → /admin/concours/inscriptionconcours/ → Consulte dossiers
7. Admin valide → statut='valide' | Admin rejette → statut='rejete'
8. Admin: AnneeConcours.statut → 'ferme'
```

### Flux bibliothèque/médiathèque (détaillé)

```
1. Admin → /admin/bibliotheque/mediabibliotheque/add/
   - Ajoute photos/vidéos avec titre, légende, ordre, publie=True
2. Admin → /admin/bibliotheque/ressourcedocument/add/
   - Ajoute documents PDF avec catégorie, résumé, reserve_etudiants
3. Étudiant connecté → /bibliotheque/
   - Voit le carrousel des photos/vidéos publiées
   - Voit l'album photo complet
   - Voit les documents (publics + réservés étudiants)
4. GET /bibliotheque/api/publiques/ → JSON des ressources publiques (pour vitrine)
```

### Flux parrainage complet (détaillé)

```
1. Admin crée/active AnneeAcademique
2. [Cadet] s'inscrit → /accounts/inscription/ (role=filleul)
3. [Aîné] s'inscrit → /accounts/inscription/ (role=aine)
4. [Cadet] → /parrainage/ → Cherche un aîné disponible
5. [Cadet] → Envoie DemandeParrainage (message_introduction)
6. [Aîné] → /parrainage/ → Voit la demande → Accepte/Refuse
7. Si accepté: Binôme formé → Messagerie active
8. [Cadet/Aîné] → /parrainage/message/<id>/ → Échangent messages
9. [Aîné] → Propose RendezVous (date, lieu)
10. [Cadet] → Accepte/Refuse le RDV
11. [Admin] → /parrainage/archiver/ → Clôture de l'année
    - DemandeParrainage.statut → 'cloture'
    - ProfilParrain masqué (sans reconduction)
12. [Cadet] → Laisse un Avis (note 1-5, commentaire)
13. Score fiabilité de l'Aîné mis à jour automatiquement
```

---

## Fichiers clés du projet

| Fichier | Rôle |
|---------|------|
| `aine-cadet/config/settings.py` | Configuration principale Django (BDD, apps, etc.) |
| `aine-cadet/config/__init__.py` | Chargement pymysql pour MySQL |
| `aine-cadet/apps/formations/models.py` | Modèles Filiere & Specialite |
| `aine-cadet/apps/concours/models.py` | Modèles concours & candidatures |
| `aine-cadet/apps/bibliotheque/models.py` | Documents & médias bibliothèque |
| `aine-cadet/apps/parrainage/models.py` | Tout le système parrainage |
| `aine-cadet/templates/bibliotheque/liste.html` | Page bibliothèque avec carrousel |
| `aine-cadet/templates/formations/detail.html` | Détail filière avec spécialités |
| `html5up-editorial/assets/css/emsp-custom.css` | CSS personnalisé EMSP |
| `html5up-editorial/assets/css/ac-carousel.css` | CSS du carrousel |
| `html5up-editorial/formations-fs-menum.html` | Page vitrine FS MENUM |
| `emspconnect_schema.sql` | Schéma SQL complet (26 tables, 35 index) |
| `aine-cadet/.env.example` | Exemple de configuration des variables |
| `docker-compose.yml` | Configuration Docker |
| `Procfile` | Configuration Heroku/Railway |

---

*Documentation EMSPCONNECT — École Militaire Supérieure de Police, Abidjan — Juin 2026*
