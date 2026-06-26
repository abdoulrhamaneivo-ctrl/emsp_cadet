# Contexte — EMSPCONNECT

> Dernière mise à jour : juin 2026

## Vision du dépôt

**EMSPCONNECT** regroupe deux volets complémentaires pour l'EMSP :

1. **Communication publique** — site vitrine statique présentant l'école, ses formations (FS MENUM, FSP, RegNUM…) et ses services institutionnels.
2. **Connexion étudiante** — plateforme **Ainé & Cadet** (Python/Django) : parrainage entre Cadets (L1) et Ainés (devanciers).

Le nom du dépôt reflète cette double mission : **EMSP** + **CONNECT** (mise en relation des étudiants).

## Institution EMSP (vitrine)

| Élément | Détail |
|---------|--------|
| Nom | École Multinationale des Postes |
| Création | 1971 |
| Siège | BP 2660 Abidjan 18, Treichville, Côte d'Ivoire |
| Contact | info@emsp.int — (+225) 21 24 30 40 |
| Pays membres | Bénin, Burkina Faso, Côte d'Ivoire, Mali, Mauritanie, Niger, Sénégal, Togo |

## Projet Ainé & Cadet (cahier des charges)

Plateforme de **parrainage étudiant** visant à :

- Faciliter l'intégration des L1 (Cadets) par un accompagnement personnalisé
- Valoriser l'engagement des Ainés (devanciers / parrains)
- Remplacer les processus manuels par un outil web fiable
- Mesurer la qualité des accompagnements via retours d'expérience

**Stack imposée :** Python 3, Django, SQLite (dev) / PostgreSQL (prod).

**Terminologie UI :**

| Terme UI | Rôle technique | Description |
|----------|----------------|-------------|
| **Cadet** | filleul | Étudiant L1 |
| **Ainé** | parrain | Étudiant devancier |

## Acteurs Ainé & Cadet

| Rôle | Responsabilités principales |
|------|----------------------------|
| **Cadet** (L1) | Profil, annuaire Ainés, demande, messagerie, RDV, avis |
| **Ainé** (devancier) | Profil détaillé, acceptation/refus, max 5 Cadets, badges |
| **Administrateur** | Modération, statistiques, suspension de comptes |

## Règles métier clés

- 1 Cadet = 1 Ainé actif maximum
- 1 Ainé = 5 Cadets actifs maximum
- Inscription réservée aux emails `@domaine-ecole` (configurable)
- Messagerie et RDV activés uniquement après acceptation du parrainage

## Contenu du dépôt

```
EMSPCONNECT/
├── README.md
├── Cahier_des_charges_Parrainage.docx   # CDC officiel (historique Parr'Innov)
├── Print_Transparent.svg                # Logo Ainé & Cadet (source)
├── docs/                                # Documentation projet
├── html5up-editorial/                   # Vitrine statique EMSP
└── aine-cadet/                          # Backend Django Ainé & Cadet
```

## Lien entre les deux volets

| Vitrine (`html5up-editorial`) | Backend (`aine-cadet`) |
|-------------------------------|------------------------|
| Lien sidebar « Espace Étudiant » | Connexion / inscription Ainé & Cadet |
| Mention bibliothèque numérique | Authentification + accès restreint (futur) |
| Pages formations | Contexte institutionnel ; filières = filtres annuaire |

## Documents connexes

- [MODULES.md](MODULES.md) — analyse module par module (contrôle qualité)
- [CAHIER_DES_CHARGES.md](CAHIER_DES_CHARGES.md) — exigences fonctionnelles détaillées
- [ARCHITECTURE.md](ARCHITECTURE.md) — stack et structure technique
- [TEMPLATES.md](TEMPLATES.md) — template HTML5 UP Editorial
- [ROADMAP.md](ROADMAP.md) — phases de développement

Fichiers historiques (analyse vitrine seule) : `CONTEXTE-PROJET.md`, `CAHIER-DES-CHARGES-SYNTHESE.md`, etc.
