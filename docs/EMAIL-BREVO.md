# E-mails transactionnels — Brevo

Guide détaillé pour configurer l'envoi d'e-mails (confirmations, contact, concours) via **Brevo** dans le projet EMSPCONNECT.

---

## Vue d'ensemble

| Composant | Rôle |
|-----------|------|
| `django-anymail[brevo]` | Backend Django → API Brevo v3 |
| `apps/core/email.py` | Fonctions d'envoi centralisées (HTML + texte) |
| `templates/emails/` | Modèles charte EMSP (teal `#147c71`) |
| `.env` | Clé API et expéditeurs (jamais committer la clé) |

**Sans `BREVO_API_KEY`** : Django utilise le backend **console** — les e-mails s'affichent dans le terminal (comportement dev normal).

---

## 1. Créer un compte Brevo

1. Inscription sur [brevo.com](https://www.brevo.com) (offre gratuite ~300 e-mails/jour).
2. **Paramètres → SMTP & API → Clés API** : générer une clé **API v3**.
3. **Expéditeurs & domaines** : ajouter `noreply@emsp.int` (ou `contact@emsp.int`) et valider le domaine `emsp.int`.

---

## 2. Variables `.env`

Copier `aine-cadet/.env.example` vers `aine-cadet/.env` :

```env
# Obligatoire pour envoi réel
BREVO_API_KEY=votre-cle-api-v3-brevo

# Expéditeur (format : "Nom <email@domaine>")
DEFAULT_FROM_EMAIL=EMSP / Ainé & Cadet <noreply@emsp.int>
BREVO_SENDER_NAME=EMSP / Ainé & Cadet

# Destinataires internes
CONTACT_API_EMAIL=contact@emsp.int
CONCOURS_PREINSCRIPTION_EMAIL=admissions@emsp.int

# Anti-spam contact vitrine (optionnel)
CONTACT_API_RATE_LIMIT=10
CONTACT_API_RATE_WINDOW=3600
```

| Variable | Description |
|----------|-------------|
| `BREVO_API_KEY` | Clé API v3 Brevo. Vide = mode console. |
| `DEFAULT_FROM_EMAIL` | Expéditeur affiché aux utilisateurs |
| `CONTACT_API_EMAIL` | Reçoit les messages du formulaire contact vitrine |
| `CONCOURS_PREINSCRIPTION_EMAIL` | Reçoit les pré-inscriptions concours |
| `CONTACT_API_RATE_LIMIT` | Max requêtes contact par IP par fenêtre |

---

## 3. Configuration Django

Dans `config/settings.py` :

- Si `BREVO_API_KEY` est renseignée → `EMAIL_BACKEND = "anymail.backends.brevo.EmailBackend"`
- Sinon → `django.core.mail.backends.console.EmailBackend`

Le mot de passe oublié Django et les notifications parrainage utilisent le **même backend** (aucune config séparée).

---

## 4. E-mails transactionnels

| Événement | Destinataire | Déclencheur | Template |
|-----------|--------------|-------------|----------|
| Inscription compte | Utilisateur | `accounts/views.py` après signup | `emails/welcome.*` |
| Contact vitrine | Admin (`CONTACT_API_EMAIL`) | `POST /api/contact/` | `emails/contact_admin.*` |
| Contact vitrine | Visiteur (accusé) | `POST /api/contact/` | `emails/contact_ack.*` |
| Pré-inscription concours | Candidat | `POST /concours/preinscription.json` | `emails/concours_preinscription_user.*` |
| Pré-inscription concours | Admissions | idem | `emails/concours_preinscription_admin.*` |
| Mot de passe oublié | Utilisateur | Django auth (`/accounts/mot-de-passe-oublie/`) | templates auth Django + e-mail reset |
| Notifications parrainage | Utilisateurs | Signaux `parrainage` | texte plain (inchangé) |

### Détail mot de passe oublié

Le flux utilise le système Django natif (`PasswordResetView`). Avec Brevo configuré, l'e-mail de réinitialisation part via le même `EMAIL_BACKEND` — aucune configuration supplémentaire. Template : `registration/password_reset_email.html`.

### Notifications parrainage

Les signaux dans `apps/parrainage/signals.py` envoient des e-mails texte simples (nouvelle demande, message, RDV). Contrôlés par `NOTIFY_EMAIL_ON_MESSAGE` et `NOTIFY_EMAIL_ON_DEMANDE` dans `.env`.

---

## 5. Tester en local

### Mode console (sans clé)

```powershell
cd aine-cadet
.venv\Scripts\activate
python manage.py runserver
```

- Inscription : http://127.0.0.1:8000/accounts/inscription/
- Contact : soumettre le formulaire sur http://localhost:8080/contact.html (Django sur :8000)
- Concours : http://localhost:8080/concours.html
- Mot de passe oublié : http://127.0.0.1:8000/accounts/mot-de-passe-oublie/

Les e-mails apparaissent dans la console du serveur Django.

### Mode Brevo réel

1. Coller `BREVO_API_KEY` dans `.env`
2. Redémarrer Django
3. Utiliser une **vraie adresse e-mail** que vous contrôlez
4. Vérifier la boîte de réception et les spams

### Tests automatisés

```powershell
python manage.py test apps.core.tests.test_email apps config.tests -v 1
```

Les tests mockent l'envoi (pas d'appel API Brevo réel).

---

## 6. SPF, DKIM, DMARC (production)

Indispensable pour éviter les spams sur `@emsp.int` :

1. Dans Brevo → **Expéditeurs & domaines** → enregistrements DNS proposés
2. Ajouter chez le registrar du domaine :
   - **SPF** : autorise les serveurs Brevo
   - **DKIM** : signature cryptographique
   - **DMARC** (recommandé) : politique de rejet/quarantaine

Sans SPF/DKIM, les confirmations utilisateur peuvent finir en courrier indésirable.

---

## 7. Dépannage

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| Aucun e-mail reçu, rien en console | Django non démarré ou mauvaise URL API vitrine | Lancer `.\scripts\dev.ps1` |
| E-mails en console mais pas en prod | `BREVO_API_KEY` vide | Renseigner la clé dans `.env` |
| Erreur 401 Brevo | Clé API invalide ou révoquée | Régénérer la clé v3 |
| E-mails en spam | SPF/DKIM non configurés | Configurer DNS (section 6) |
| Contact vitrine 429 | Rate limit IP | Attendre ou ajuster `CONTACT_API_RATE_LIMIT` |
| CORS / formulaire vitrine échoue | Origine non autorisée | Vérifier `CORS_ALLOWED_ORIGINS` dans `settings.py` |

Logs Django : rechercher `Échec envoi e-mail` ou `Aucun destinataire valide` dans `apps/core/email.py`.

---

## 8. Fichiers de référence

| Fichier | Contenu |
|---------|---------|
| `aine-cadet/apps/core/email.py` | Logique d'envoi |
| `aine-cadet/templates/emails/` | Templates HTML/texte |
| `aine-cadet/config/settings.py` | Backend et variables |
| `aine-cadet/config/api_views.py` | Endpoint contact + throttle |
| `docs/DEPLOIEMENT.md` | Déploiement global incluant Brevo |

---

## Voir aussi

- [DEPLOIEMENT.md](DEPLOIEMENT.md) — Docker, Gunicorn, nginx
- [API-VITRINE.md](API-VITRINE.md) — Endpoints JSON consommés par la vitrine
- [DEPANNAGE.md](DEPANNAGE.md) — Erreurs fréquentes (CORS, spam, clé invalide)
- [GUIDE-DEVELOPPEUR.md](GUIDE-DEVELOPPEUR.md) — Setup dev et checklist déploiement
