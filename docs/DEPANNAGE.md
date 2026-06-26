# Dépannage — EMSPCONNECT

Guide de résolution des problèmes fréquents en développement et pré-production.

---

## 1. ERR_CONNECTION_REFUSED

### Symptôme

Console navigateur : `Failed to fetch`, `net::ERR_CONNECTION_REFUSED` sur les appels vers `:8000`.

### Causes

- Django non démarré
- Mauvais port (vitrine pointe vers `:8000` mais Django sur autre port)
- Pare-feu local

### Solutions

```powershell
# Démarrer les deux serveurs
.\scripts\dev.ps1

# Ou manuellement
cd aine-cadet
.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

Vérifier que `<meta name="emsp-aine-cadet-url">` dans les pages vitrine vaut `http://127.0.0.1:8000` (injecté par `build-vitrine.py`).

Tester directement : http://127.0.0.1:8000/concours/session-active.json

---

## 2. Erreurs CORS

### Symptôme

Console : `Access to fetch at 'http://127.0.0.1:8000/...' from origin 'http://localhost:8080' has been blocked by CORS policy`.

### Causes

- Origine vitrine absente de `CORS_ALLOWED_ORIGINS`
- `corsheaders` middleware mal placé (doit être **avant** `CommonMiddleware`)
- Vitrine servie depuis un port/host non listé (ex. `:5500`, Live Server)

### Solutions

1. Servir la vitrine sur **port 8080** : `python -m http.server 8080` dans `html5up-editorial/`
2. Ajouter l'origine dans `config/settings.py` :

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    # + votre URL prod
]
```

3. En production, aligner `EMSP_VITRINE_URL` dans `.env` avec l'URL réelle (`https://www.emsp.int`)

4. Redémarrer Django après modification `.env`

---

## 3. E-mails non reçus

### Symptôme

Formulaire contact/concours affiche succès mais aucun e-mail.

### Diagnostic

| Contexte | Comportement attendu |
|----------|---------------------|
| Dev sans `BREVO_API_KEY` | E-mails dans **console Django** (pas en boîte mail) |
| Dev avec clé Brevo | E-mails réels — vérifier spam |
| Prod | SPF/DKIM requis sur `emsp.int` |

### Actions

1. Regarder le terminal Django lors de la soumission
2. Vérifier `.env` : `BREVO_API_KEY`, `DEFAULT_FROM_EMAIL`, destinataires admin
3. Tester avec backend locmem :

```powershell
.venv\Scripts\python.exe manage.py test apps.core.tests.test_email config.tests -v 1
```

4. Consulter [EMAIL-BREVO.md](EMAIL-BREVO.md) section dépannage

### E-mails silencieux (fail_silently)

Les fonctions dans `apps/core/email.py` utilisent `fail_silently=True` pour ne pas bloquer l'UX. En cas d'échec Brevo, l'API renvoie quand même `{ "ok": true }` mais l'e-mail n'est pas parti — **consulter les logs Django** (`Échec envoi e-mail`).

---

## 4. Formulaires vitrine — mailto restants

### Symptôme

Clic « Envoyer » ouvre le client mail au lieu d'afficher un message AJAX.

### Causes

- `emsp-init.js` non chargé
- `EMSPCONFIG` absent (`emsp-config.js` manquant ou ordre scripts incorrect)
- Formulaire sans les bons IDs (`emsp-contact-form`, `emsp-concours-preinscription-form`)

### Vérification

Ordre scripts en fin de `<body>` :

```html
<script src="assets/js/emsp-config.js"></script>
<script src="assets/js/emsp-init.js"></script>
```

Regénérer si besoin :

```powershell
python scripts/build-vitrine.py
```

Les liens `mailto:contact@emsp.int` dans la **sidebar** ou bloc coordonnées sont normaux (affichage). Seuls les **formulaires** doivent passer par AJAX.

---

## 5. Sidebar vitrine illisible / caractères bizarres

### Symptôme

Texte sidebar avec tirets entre chaque lettre, navigation cassée.

### Cause

Corruption du fichier `html5up-editorial/partials/sidebar.html` (encodage UTF-16 ou caractères em-dash intercalés).

### Solution

```powershell
# Corriger partials/sidebar.html puis regénérer
python scripts/build-vitrine.py
```

Ne jamais éditer la sidebar directement dans chaque page HTML — toujours passer par le partial + build.

---

## 6. Dates concours non dynamiques

### Symptôme

`concours.html` affiche les dates statiques du HTML, pas celles de l'admin.

### Causes

- Aucune `AnneeConcours` avec `active=True`
- Django arrêté (fetch échoue silencieusement)
- Page sans classe `.emsp-concours-dynamique` ou attributs `data-emsp-concours-*`

### Solution

Admin Django → Concours → AnneeConcours → cocher **Active**.  
Tester : http://127.0.0.1:8000/concours/session-active.json

---

## 7. Médiathèque vide (API)

### Symptôme

Section `#emsp-ressources-publiques` reste avec placeholders.

### Causes

- Aucune ressource `publie=True` et `reserve_etudiants=False`
- API inaccessible

### Solution

Admin → Bibliothèque → créer ressources publiques.  
Tester : http://127.0.0.1:8000/bibliotheque/api/publiques.json

---

## 8. Tests Django en échec

### Commandes

```powershell
cd aine-cadet
.venv\Scripts\python.exe manage.py check
.venv\Scripts\python.exe manage.py test apps -v 2
```

### Problèmes connus

| Erreur | Solution |
|--------|----------|
| Migrations en attente | `makemigrations` + `migrate` |
| Module manquant | `pip install -r requirements.txt` |
| Python 3.14 + context copy | Contournement déjà dans `settings.py` (`store_rendered_templates`) |

Checklist complète : `.\scripts\deploy-check.ps1`

---

## 9. collectstatic

### Symptôme

Assets manquants en production, CSS/JS 404.

### Solutions

```powershell
cd aine-cadet
.venv\Scripts\python.exe manage.py collectstatic --noinput
```

Vérifier `STATICFILES_DIRS` inclut `html5up-editorial/assets`.  
Dry-run : `collectstatic --dry-run` (inclus dans `deploy-check.ps1`).

---

## 10. Coordonnées contact incohérentes

Référence officielle projet :

| Champ | Valeur |
|-------|--------|
| E-mail | contact@emsp.int |
| Téléphone | (+225) 27 21 21 45 60 / 61 |
| Adresse | 18 BP 42 Abidjan 18, Treichville |

Sources à aligner : `emsp-config.js`, `partials/sidebar.html`, `contact.html`, templates Django.

---

## 11. Pré-inscription concours — erreur 403

Message : « Les pré-inscriptions sont actuellement fermées ».

**Cause :** pas de session concours active.

**Action :** Admin → activer une `AnneeConcours`, ou dashboard staff `/concours/admin/inscriptions/` → Ouvrir le concours.

---

## 12. Bloqué sans infra externe

Ces points ne se résolvent pas dans le code seul :

| Besoin | Responsable |
|--------|-------------|
| Clé API Brevo production | Compte Brevo EMSP |
| SPF / DKIM / DMARC `emsp.int` | Admin DNS / hébergeur |
| Certificat SSL production | Infra serveur |
| Hébergement www.emsp.int + API | Équipe infra EMSP |
| Photos campus réelles | Contenu éditorial |

---

## Voir aussi

- [GUIDE-DEVELOPPEUR.md](GUIDE-DEVELOPPEUR.md) — setup et conventions
- [API-VITRINE.md](API-VITRINE.md) — endpoints et fetch
- [EMAIL-BREVO.md](EMAIL-BREVO.md) — configuration e-mails
- [DEPLOIEMENT.md](DEPLOIEMENT.md) — mise en production
