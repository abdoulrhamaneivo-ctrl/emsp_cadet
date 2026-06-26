# API vitrine — pont statique Django

Documentation des endpoints JSON consommés par la vitrine statique (`html5up-editorial/`) via `assets/js/emsp-init.js` et `assets/js/emsp-config.js`.

---

## Architecture du pont

```
┌─────────────────────────┐         fetch JSON          ┌──────────────────────────┐
│  Vitrine statique       │  ────────────────────────►  │  Django Ainé & Cadet     │
│  localhost:8080         │   CORS (origines autorisées)│  127.0.0.1:8000          │
│  html5up-editorial/     │                             │  aine-cadet/             │
└─────────────────────────┘                             └──────────────────────────┘
         │                                                          │
         │  emsp-config.js résout AINE_CADET_BASE                   │
         │  emsp-init.js appelle les routes API                       │
         └──────────────────────────────────────────────────────────┘
```

### Résolution de l'URL Django

Priorité dans `emsp-config.js` :

1. `<meta name="emsp-aine-cadet-url" content="http://127.0.0.1:8000" />` (injecté par `build-vitrine.py`)
2. `window.EMSPCONFIG.aineCadetBase` (override manuel)
3. En local : `http://127.0.0.1:8000`
4. En production : même origine ou port `:8000` si sous-domaine API

**Dev obligatoire :** lancer les deux serveurs avec `.\scripts\dev.ps1`.

---

## CORS

Configuré dans `aine-cadet/config/settings.py` via `django-cors-headers` :

| Origine autorisée | Usage |
|-------------------|-------|
| `EMSP_VITRINE_URL` (variable `.env`) | URL vitrine prod |
| `http://localhost:8080` | Dev vitrine |
| `http://127.0.0.1:8080` | Dev vitrine |
| `https://www.emsp.int` | Production |
| `https://emsp.int` | Production |

Méthodes : `GET`, `POST`, `OPTIONS`  
En-têtes : `Content-Type`, `Accept`

Les endpoints POST sont `@csrf_exempt` (pas de cookie CSRF côté vitrine statique).

---

## Endpoints

### 1. Session concours active

| | |
|---|---|
| **URL** | `GET /concours/session-active.json` |
| **Auth** | Aucune |
| **Consommateur** | `emsp-init.js` → `initConcoursSession()` |
| **Page** | `concours.html` (classe `.emsp-concours-dynamique`) |

**Réponse — session ouverte :**

```json
{
  "active": true,
  "annee": "2025-2026 — Promotion FS MENUM",
  "date_limite": "2025-11-30",
  "date_limite_fr": "30/11/2025",
  "frais_fcfa": 25000
}
```

**Réponse — session fermée :**

```json
{ "active": false }
```

**Usage JS :** remplit les éléments `[data-emsp-concours-annee]`, `[data-emsp-concours-date]`, `[data-emsp-concours-frais]`.

**Exemple fetch :**

```javascript
fetch("http://127.0.0.1:8000/concours/session-active.json")
  .then((r) => r.json())
  .then((data) => console.log(data));
```

**Codes :** `200` (toujours JSON valide).

**Administration :** modèle `AnneeConcours` (admin Django) — champ `active=True` requis.

---

### 2. Bibliothèque publique (médiathèque)

| | |
|---|---|
| **URL** | `GET /bibliotheque/api/publiques.json` |
| **Auth** | Aucune |
| **Consommateur** | `emsp-init.js` → `initRessourcesPubliques()` |
| **Page** | `mediatheque.html` (`#emsp-ressources-publiques`) |

**Réponse :**

```json
{
  "ressources": [
    {
      "titre": "Guide FS MENUM 2025",
      "categorie": "Brochure",
      "resume": "Présentation des parcours...",
      "url": "https://..."
    }
  ]
}
```

Seules les ressources `publie=True` et `reserve_etudiants=False` sont exposées.

**Exemple fetch :**

```javascript
fetch("http://127.0.0.1:8000/bibliotheque/api/publiques.json")
  .then((r) => r.json())
  .then((data) => data.ressources.forEach(console.log));
```

**Codes :** `200`. Si API indisponible, la vitrine conserve les placeholders HTML statiques.

---

### 3. Formulaire contact

| | |
|---|---|
| **URL** | `POST /api/contact/` |
| **Auth** | Aucune |
| **Consommateur** | `emsp-init.js` → `bindAjaxForm(#emsp-contact-form)` |
| **Page** | `contact.html` |
| **Content-Type** | `application/json` |

**Corps JSON :**

```json
{
  "nom": "Kouadio Traoré",
  "email": "kouadio@exemple.com",
  "objet": "Information formations",
  "message": "Bonjour, j'aimerais des renseignements."
}
```

**Champ honeypot :** `_gotcha` (si rempli → réponse OK neutre, aucun e-mail).

**Réponse succès (`200`) :**

```json
{
  "ok": true,
  "message": "Votre message a bien été envoyé. Nous vous répondrons dans les meilleurs délais."
}
```

**Réponse erreur (`400`) :**

```json
{ "ok": false, "error": "Nom, e-mail et message sont obligatoires." }
```

**Rate limit (`429`) :**

```json
{ "ok": false, "error": "Trop de messages envoyés récemment. Réessayez plus tard." }
```

**Effets serveur :** 2 e-mails via Brevo/console — admin (`CONTACT_API_EMAIL`) + accusé visiteur.

**Exemple fetch :**

```javascript
fetch("http://127.0.0.1:8000/api/contact/", {
  method: "POST",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  body: JSON.stringify({
    nom: "Test",
    email: "test@exemple.com",
    message: "Message de test",
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

---

### 4. Pré-inscription concours (vitrine)

| | |
|---|---|
| **URL** | `POST /concours/preinscription.json` |
| **Auth** | Aucune |
| **Consommateur** | `emsp-init.js` → `bindAjaxForm(#emsp-concours-preinscription-form)` |
| **Page** | `concours.html` |

**Corps JSON :**

```json
{
  "nom": "Diallo",
  "prenom": "Fatou",
  "email": "fatou@exemple.com",
  "parcours": "ingenierie",
  "motivation": "Motivation optionnelle"
}
```

**Valeurs `parcours` :** `ingenierie` | `management`

**Réponse succès (`200`) :**

```json
{
  "ok": true,
  "message": "Votre pré-inscription a bien été transmise. Vous recevrez les prochaines étapes par e-mail."
}
```

**Erreurs :**

| Code | Cas |
|------|-----|
| `400` | Champs manquants, e-mail invalide, parcours incorrect |
| `403` | Aucune session concours active (`AnneeConcours.active=False`) |

**Effets serveur :** e-mails candidat + admissions (`CONCOURS_PREINSCRIPTION_EMAIL`).

> **Note :** l'inscription complète avec pièces jointes se fait sur `/concours/inscription/` (formulaire Django, pas AJAX vitrine).

---

## Routes configurées dans `emsp-config.js`

| Clé `EMSPCONFIG.routes` | Endpoint / page |
|---------------------------|-----------------|
| `concoursSession` | `/concours/session-active.json` |
| `bibliothequeApi` | `/bibliotheque/api/publiques.json` |
| `contactApi` | `/api/contact/` |
| `concoursPreinscription` | `/concours/preinscription.json` |
| `concoursInscription` | `/concours/inscription/` (redirect navigateur) |
| `espaceEtudiant` | `/accounts/login/` |
| `bibliothequeLogin` | `/accounts/login/?next=/bibliotheque/` |

---

## Tests automatisés

```powershell
cd aine-cadet
.venv\Scripts\python.exe manage.py test config.tests.test_api_views apps.concours.tests apps.bibliotheque.tests -v 1
```

---

## Dépannage rapide

| Symptôme | Cause | Action |
|----------|-------|--------|
| `ERR_CONNECTION_REFUSED` | Django arrêté | `.\scripts\dev.ps1` |
| Erreur CORS navigateur | Origine non listée | Ajouter l'URL dans `CORS_ALLOWED_ORIGINS` |
| Formulaire « Service indisponible » | Réseau ou 500 Django | Vérifier console Django + logs |
| Dates concours statiques | Session inactive ou API down | Activer `AnneeConcours` en admin |
| Médiathèque vide | Aucune ressource publique | Admin → Bibliothèque, cocher `publie` sans `reserve_etudiants` |

Voir aussi [DEPANNAGE.md](DEPANNAGE.md) et [EMAIL-BREVO.md](EMAIL-BREVO.md).
