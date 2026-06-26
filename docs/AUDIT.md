# Checklist audit EMSPCONNECT

> Dernière vérification : juin 2026 — session documentation + corrections

## Assets BACKGROUND

| Vérification | Statut |
|--------------|--------|
| `BACKGROUND/` contient 3 fichiers source | ✅ |
| Copie vers `html5up-editorial/assets/images/backgrounds/` | ✅ |
| Copie vers `aine-cadet/static/images/backgrounds/` (script sync) | ✅ |
| `hero-emerald.jpg`, `hero-pattern-green.jpg`, `hero-topo-animation.mp4` | ✅ |
| CSS `emsp-custom.css` — chemins `url(../images/backgrounds/…)` | ✅ |
| Django `STATICFILES_DIRS` → `html5up-editorial/assets` | ✅ |

**Commande sync :** `.\scripts\sync-backgrounds.ps1`

---

## Vitrine HTML (pages actives)

| Page | `emsp-page-bg` | En-tête emerald | OG + favicon | `ac-ui-vitrine.js` | Sidebar partial |
|------|----------------|-----------------|--------------|-------------------|-----------------|
| index.html | ✅ | Hero vidéo | ✅ | ✅ | ✅ |
| formations-fsp.html | ✅ | ✅ | ✅ | ✅ | ✅ |
| formations-fs-menum.html | ✅ | ✅ | ✅ | ✅ | ✅ |
| formations-regnum.html | ✅ | ✅ | ✅ | ✅ | ✅ |
| formation-continue.html | ✅ | ✅ | ✅ | ✅ | ✅ |
| mediatheque.html | ✅ | ✅ | ✅ | ✅ | ✅ |
| contact.html | ✅ | ✅ | ✅ | ✅ | ✅ |
| concours.html | ✅ | ✅ | ✅ | ✅ | ✅ |
| 404.html | ✅ | ✅ | ✅ | ✅ | — |
| generic.html (plan du site) | ✅ | ✅ | ✅ | ✅ | — |

**Regénérer sidebars :** `python scripts/build-vitrine.py`

**Coordonnées officielles :** contact@emsp.int — (+225) 27 21 21 45 60 / 61 — 18 BP 42 Abidjan 18

---

## Pont vitrine ↔ Django

| Vérification | Statut |
|--------------|--------|
| `emsp-config.js` — routes API | ✅ |
| `emsp-init.js` — fetch session, bibliothèque, AJAX formulaires | ✅ |
| `POST /api/contact/` + rate limit | ✅ |
| `POST /concours/preinscription.json` | ✅ |
| `GET /concours/session-active.json` | ✅ |
| `GET /bibliotheque/api/publiques.json` | ✅ |
| CORS `localhost:8080` → Django | ✅ |
| Formulaires sans action mailto (AJAX) | ✅ |
| `@import` retiré du HTML (liens `<link>` explicites) | ✅ |
| `:has()` remplacé par `.is-selected` (cartes rôle) | ✅ |

**Documentation :** [API-VITRINE.md](API-VITRINE.md)

---

## Liens morts

| Zone | Statut |
|------|--------|
| Pages actives — `href="#"` | ✅ Aucun (LinkedIn/YouTube/Espace Étudiant → `href=""` + JS) |
| `generic.html` / `elements.html` | ✅ Plan du site EMSP ; `elements.html` redirige |
| Sidebar vitrine (`partials/sidebar.html`) | ✅ Corrigée (encodage) + build-vitrine |

---

## Application Django

| Vérification | Statut |
|--------------|--------|
| `manage.py check` | ✅ 0 issue |
| `manage.py test apps` | ✅ **38 tests OK** |
| Inscription — cartes rôle, email live, force MDP | ✅ `ac-forms.js` |
| Login — mot de passe oublié | ✅ |
| Messagerie — polling 12 s | ✅ `ac-messaging-poll.js` |
| Concours `/concours/inscription/` | ✅ |
| Concours — dates dynamiques `AnneeConcours` | ✅ |
| E-mails Brevo / console fallback | ✅ `apps/core/email.py` |
| Formations CRUD + pages `/formations/` | ✅ |
| Bibliothèque `/bibliotheque/` | ✅ |
| Template 404 personnalisé | ✅ |
| Fond motif `emsp-has-pattern-bg` | ✅ |

---

## Production / déploiement

| Vérification | Statut |
|--------------|--------|
| `docs/DEPLOIEMENT.md` complet | ✅ |
| `docs/GUIDE-DEVELOPPEUR.md` | ✅ |
| `docs/EMAIL-BREVO.md` | ✅ |
| `docs/DEPANNAGE.md` | ✅ |
| `docker-compose.yml` (postgres + app) | ✅ |
| `Procfile` + Gunicorn | ✅ |
| `scripts/deploy-check.ps1` | ✅ |

---

## Tests manuels recommandés

| URL | Attendu |
|-----|---------|
| http://localhost:8080/index.html | Hero vidéo + motif vert + carousel |
| http://localhost:8080/contact.html | Coordonnées contact@emsp.int + formulaire AJAX |
| http://localhost:8080/concours.html | Dates dynamiques + pré-inscription AJAX |
| http://localhost:8080/mediatheque.html | Ressources API + CTA bibliothèque |
| http://127.0.0.1:8000/api/contact/ | POST JSON (via formulaire vitrine) |
| http://127.0.0.1:8000/concours/session-active.json | JSON session active |
| http://127.0.0.1:8000/bibliotheque/api/publiques.json | Liste ressources publiques |
| http://127.0.0.1:8000/accounts/inscription/ | Cartes Cadet/Aîné, toast |

---

## Reste à faire (hors scope code)

- Photos réelles campus (remplacer placeholders)
- Aligner contenu HTML statique ↔ module formations Django
- Tests mobile inscription/concours
- Hébergement réel + CI/CD sur serveur EMSP
- SPF/DKIM/DMARC DNS `emsp.int` (infra externe)
- Clé Brevo production (compte EMSP)
- WebSocket messagerie temps réel
- Export RGPD portabilité
