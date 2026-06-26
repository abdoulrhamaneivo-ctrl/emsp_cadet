# État du projet — EMSPCONNECT

> Dernière mise à jour : juin 2026

## Résumé

| Volet | Avancement |
|-------|------------|
| Vitrine EMSP | ✅ ~99 % (sidebar + API + formulaires AJAX) |
| Ainé & Cadet Phases 1–3 | ✅ |
| Bibliothèque numérique | ✅ |
| Concours + Formations CRUD | ✅ |
| E-mails transactionnels (Brevo) | ✅ (config prête, clé prod externe) |
| Pont vitrine ↔ Django (CORS + API) | ✅ |
| Documentation développeur | ✅ |
| Phase 4 production | ~75 % (Docker prêt, hébergement réel à faire) |

---

## ✅ Terminé

- 8 pages vitrine + carousel + témoignages + SEO (OG, favicon, robots, sitemap, 404)
- Pont statique/Django : `emsp-init.js` + 4 endpoints JSON + CORS
- Formulaires contact et concours en AJAX (plus de mailto sur soumission)
- Brevo intégré via django-anymail (`apps/core/email.py`, templates HTML)
- Script `build-vitrine.py` — coque commune + sidebar depuis partial
- Sidebar vitrine corrigée (`partials/sidebar.html` — encodage)
- Coordonnées unifiées : contact@emsp.int, (+225) 27 21 21 45 60 / 61
- App Django : parrainage, messagerie, RDV, avis, badges, événements
- Module concours + `AnneeConcours` (dates/frais dynamiques)
- Module formations admin + module bibliothèque + API publique
- Mot de passe oublié + suppression compte RGPD
- Docker Compose + Gunicorn + `deploy-check.ps1`
- **38 tests** automatisés OK
- Documentation : GUIDE-DEVELOPPEUR, API-VITRINE, EMAIL-BREVO, DEPANNAGE

---

## 🟡 En cours / à peaufiner

| Item | Action |
|------|--------|
| Photos réelles campus | Remplacer placeholders dans `assets/images/photos/` |
| Contenu filières vitrine HTML | Aligner pages statiques sur contenu admin |
| Checklist mobile | Tester inscription/concours sur téléphone |
| Hébergement CI/CD réel | Déployer sur serveur EMSP (infra externe) |
| Clé Brevo + DNS SPF/DKIM | Compte et registrar EMSP |

---

## ❌ Non démarré (infra externe)

- Tests charge / sécurité production
- Export données RGPD (portabilité)
- WebSocket messagerie temps réel
- Stockage S3 médias
- Certificats SSL + CDN production

---

## Lancer le projet

```powershell
.\scripts\dev.ps1
# Vitrine : http://localhost:8080/index.html
# App     : http://127.0.0.1:8000/
```

Vérification pré-déploiement :

```powershell
.\scripts\deploy-check.ps1
```

Documentation : [GUIDE-DEVELOPPEUR.md](GUIDE-DEVELOPPEUR.md) | [DEPANNAGE.md](DEPANNAGE.md)
