# Roadmap — EMSPCONNECT

> Plan priorisé : vitrine EMSP + plateforme Ainé & Cadet

---

## Vue d'ensemble

| Volet | Avancement estimé | Priorité |
|-------|-------------------|----------|
| Vitrine statique | ~85 % | P1 |
| Backend Ainé & Cadet Phase 1 | ~95 % | P1 |
| Intégration vitrine ↔ backend | ~95 % (bibliothèque + concours dynamiques) | P2 |
| Phases 2–4 Ainé & Cadet | Phase 2 ✅ · Phase 3 ✅ | P2–P4 |

---

## Phase A — Vitrine EMSP (statique)

### A.1 — Pages manquantes (priorité haute)

| Page | Fichier cible | Statut |
|------|---------------|--------|
| FSP | `formations-fsp.html` | ✅ Créée |
| RegNUM | `formations-regnum.html` | ✅ Créée |
| Formation Continue | `formation-continue.html` | ✅ Créée |
| Médiathèque | `mediatheque.html` | ✅ Créée |
| Contact | `contact.html` | ✅ Créée |
| Concours FS MENUM | `concours.html` | ✅ Créée |

### A.2 — Corrections navigation

- [x] Remplacer les liens `href="#"` du menu par les vraies pages
- [x] Ajouter URLs LinkedIn / YouTube (`emsp-config.js`)
- [x] Lier « Espace Étudiant » vers Ainé & Cadet (`emsp-config.js` + `emsp-init.js`)
- [x] URL Django configurable (meta tag / hostname)

### A.3 — Contenu et médias

- [x] Contenu institutionnel www.emsp.int intégré (1970, UPU, coordonnées, filières)
- [ ] Remplacer SVG placeholders par photos (`BACKGROUND/` + `sync-backgrounds.ps1`)
- [x] Page concours / inscriptions (`concours.html` → `/concours/inscription/`)
- [x] CRUD filières admin (`apps/formations/`) + export JSON vitrine
- [x] Adapter ou retirer `generic.html` / `elements.html` — plan du site + redirection

### A.5 — SEO et confiance

- [x] Favicon, Open Graph, robots.txt, sitemap.xml
- [x] Page 404 vitrine + Django
- [x] Section témoignages (carousel accueil)

### A.4 — Maintenabilité

- [x] Extraire sidebar en partial (`partials/sidebar.html` + `build-vitrine.py`)
- [x] Carousel vanilla (`ac-carousel.js`) sur index et médiathèque
- [x] Onglets dashboards (`ac-tabs.js`) + graphiques Chart.js admin
- [ ] Documenter workflow SASS → CSS

---

## Phase B — Ainé & Cadet (CDC)

Alignée sur le cahier des charges §7.

### B.1 — Socle *(Phase 1 livrée)*

- [x] Structure projet Django (`aine-cadet/`)
- [x] Rebranding Parr'Innov → Ainé & Cadet
- [x] Modèles de données commentés
- [x] Validateur email domaine école
- [x] Service règles métier (capacité Ainé)
- [x] Vues inscription / connexion / déconnexion
- [x] Templates Editorial (HTML5 UP + charte EMSP)
- [x] Formulaires UI : selects classe/filière, radios rôle, centrage Editorial
- [x] CRUD profil Cadet et Ainé
- [x] Annuaire Ainés + filtres
- [x] Demandes parrainage (création, acceptation, refus)
- [x] Tests unitaires règles R1–R6

### B.2 — Communication *(Phase 2 livrée)*

- [x] Messagerie privée Ainé ↔ Cadet (refresh page, extensible WebSocket)
- [x] Indicateur messages non lus (sidebar + dashboard)
- [x] Proposition / acceptation / refus / contre-proposition RDV
- [x] Rappels automatiques (`manage.py envoyer_rappels_rdv` + cron documenté)
- [x] Notifications email (signaux message + nouvelle demande)

### B.3 — Communauté et qualité *(Phase 3 livrée)*

- [x] Formulaire avis fin de parrainage
- [x] Score fiabilité parrain (moyenne notes Cadets)
- [x] Badges automatiques (premier parrainage, 5 Cadets, événement organisé)
- [x] Événements collectifs + inscriptions
- [x] Dashboard administrateur (statistiques)

### B.4 — Production

- [x] Configuration PostgreSQL (settings + `.env.example`)
- [x] Suppression compte RGPD (`/accounts/supprimer-compte/`)
- [x] Mot de passe oublié
- [x] Guide déploiement (`docs/DEPLOIEMENT.md`)
- [x] Docker Compose + Gunicorn + `deploy-check.ps1`
- [x] Dates concours dynamiques (`AnneeConcours` admin)
- [ ] Stockage photos externe (S3)
- [ ] Tests charge et sécurité
- [ ] Hébergement + CI/CD
- [ ] Lancement pilote parrains avant rentrée L1

---

## Phase C — Intégration EMSPCONNECT

| Jalon | Description | Statut |
|-------|-------------|--------|
| C1 | Lien vitrine « Espace Étudiant » → login Ainé & Cadet | ✅ |
| C2 | Charte graphique EMSP appliquée aux templates Django | ✅ |
| C3 | Script dev `scripts/dev.ps1` (vitrine 8080 + Django 8000) | ✅ |
| C4 | UI formulaires (selects, radios, centrage, overflow) | ✅ |
| C5 | Bibliothèque numérique authentifiée (hors CDC Ainé & Cadet) | ✅ |

---

## Jalons suggérés

| Semaine | Livrable |
|---------|----------|
| S1–S2 | Pages vitrine FSP, RegNUM, Contact + liens corrigés |
| S3–S4 | Auth + profils + annuaire Ainé & Cadet fonctionnels |
| S5–S6 | Demandes parrainage + tests règles métier |
| S7–S8 | Messagerie + RDV (Phase 2) |
| S9+ | Badges, événements, production |

---

## Risques

| Risque | Mitigation |
|--------|------------|
| Contenu institutionnel manquant | Valider textes avec EMSP |
| Deux périmètres (vitrine + app) | Roadmap séparée, docs unifiées |
| Duplication HTML sidebar | Générateur statique ou composants |
| Photos indisponibles | Conserver SVG en attendant |

---

## Prochaine action immédiate

1. **Hébergement réel** — déployer vitrine + app sur serveur EMSP (voir `docs/DEPLOIEMENT.md`)
2. Lancement pilote parrains avant rentrée L1
3. Remplacer photos placeholders campus

### Cron rappels RDV (production)

Exécuter chaque matin à 8 h (fuseau serveur = `Africa/Abidjan`) :

```cron
0 8 * * * cd /chemin/vers/aine-cadet && .venv/bin/python manage.py envoyer_rappels_rdv >> /var/log/aine-cadet-rdv.log 2>&1
```

En développement, les emails s'affichent dans la console (`EMAIL_BACKEND=console`).
