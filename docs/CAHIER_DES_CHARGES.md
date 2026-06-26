# Cahier des charges — Ainé & Cadet

> Source officielle : `Cahier_des_charges_Parrainage.docx` (racine du dépôt)  
> Extraction texte : `docs/_cdc_extract.txt`  
> Projet : **Ainé & Cadet** — Plateforme de parrainage étudiant EMSP  
> Technologie : **Python / Django** — Date CDC : juin 2026

---

## 1. Contexte et objectifs

### Problématique

L'intégration des étudiants de première année (L1) pose des difficultés récurrentes : méthodologie, orientation, vie associative, rythme universitaire. Les devanciers possèdent l'expérience nécessaire, mais **aucun outil centralisé** n'organise aujourd'hui cet accompagnement de façon simple et équitable.

### Objectifs

| # | Objectif |
|---|----------|
| O1 | Faciliter l'intégration des L1 via un accompagnement personnalisé |
| O2 | Valoriser l'engagement des devanciers (parrains) |
| O3 | Remplacer les processus manuels (papier, tirage au sort) |
| O4 | Suivre la qualité des accompagnements grâce aux retours d'expérience |

---

## 2. Acteurs

### Cadet (étudiant L1 — filleul)

- Crée et modifie son profil (classe, filière, photo, attentes)
- Consulte l'annuaire des Ainés disponibles
- Envoie une demande de parrainage
- Discute et planifie des RDV après acceptation
- Laisse un avis en fin de parcours

### Ainé (étudiant devancier — parrain)

- Profil détaillé : ambitions, projets, points forts/faibles
- Accepte ou refuse les demandes
- Accompagne **jusqu'à 5 Cadets** simultanément
- Messagerie et RDV avec ses Cadets
- Badges de reconnaissance selon l'engagement

### Administrateur

- Gestion des comptes et modération des contenus signalés
- Statistiques (parrainages actifs, étudiants en attente)
- Suspension ou suppression de comptes

---

## 3. Fonctionnalités

### 3.1 Inscription et authentification

- Champs : nom, prénom, email école, mot de passe, classe, filière, rôle
- **Restriction domaine email** école uniquement
- Connexion / déconnexion sécurisées

### 3.2 Annuaire et recherche

- Liste des parrains disponibles
- Filtres : filière, classe, mots-clés
- Fiche parrain : ambitions, projets, forces, faiblesses
- **Suggestion automatique** : priorité même filière / centres d'intérêt proches

### 3.3 Mise en relation

- Demande filleul → parrain
- Acceptation / refus depuis le tableau de bord parrain
- Activation automatique messagerie + RDV si accepté

### 3.4 Messagerie

- Chat privé parrain ↔ filleul (post-acceptation)
- Indicateur messages non lus

### 3.5 Rendez-vous

- Proposition : titre, date, heure, lieu
- Réponse : accepter, refuser, contre-proposer
- Rappel automatique avant RDV validé

### 3.6 Retours d'expérience *(nouveauté proposée)*

- Notation + commentaire en fin de parrainage
- Score de fiabilité sur le profil parrain
- Détection des binômes en difficulté (admin)

### 3.7 Événements collectifs *(nouveauté proposée)*

- Création par parrain ou admin (atelier, sortie, révision)
- Inscription filleuls depuis la plateforme

### 3.8 Badges *(nouveauté proposée)*

- Exemples : premier parrainage, 5 filleuls, événement organisé
- Affichage sur le profil public du parrain

---

## 4. Règles de gestion

| Règle | Description |
|-------|-------------|
| R1 | Un filleul = **un seul** parrain actif |
| R2 | Un parrain = **max 5** filleuls actifs |
| R3 | Parrain à capacité max → **masqué** de l'annuaire |
| R4 | Inscription = email domaine école uniquement |
| R5 | Changement de rôle = **admin uniquement** |
| R6 | Fin de parrainage → libération place + demande d'avis |

---

## 5. Modèle de données

| Entité | Attributs principaux |
|--------|---------------------|
| **Utilisateur** | identité, rôle, classe, filière, photo |
| **Profil parrain** | ambitions, motivations, projets, forces, faiblesses |
| **Demande parrainage** | filleul, parrain, statut (attente/accepté/refusé) |
| **Message** | expéditeur, destinataire, contenu, date, lu/non lu |
| **Rendez-vous** | organisateur, invité, date, lieu, statut |
| **Avis** | note, commentaire, auteur, parrainage concerné |
| **Événement** | titre, date, lieu, organisateur, inscrits |

Implémentation initiale : `aine-cadet/apps/accounts/models.py`, `aine-cadet/apps/parrainage/models.py`.

---

## 6. Exigences techniques

| Exigence | Détail |
|----------|--------|
| Langage | Python 3 |
| Framework | Django |
| BDD dev | SQLite |
| BDD prod | PostgreSQL |
| Mobile-first | Interface responsive (majorité mobile) |
| Photos prod | Stockage externe (S3, Cloudinary…) |
| Sécurité | Mots de passe hashés, accès membres vérifiés |
| RGPD | Suppression compte et données sur demande |

---

## 7. Phases de développement

| Phase | Périmètre | Statut dépôt |
|-------|-----------|--------------|
| **1 — Socle** | Inscription, connexion, profils, annuaire, demandes | 🟡 Base Django posée |
| **2 — Communication** | Messagerie, RDV, notifications | ⬜ À faire |
| **3 — Communauté** | Avis, badges, événements | ⬜ À faire |
| **4 — Production** | Tests règles, hébergement, lancement parrains | ⬜ À faire |

---

## 8. Critères d'acceptation globaux

- [ ] Inscription refusée hors domaine email configuré
- [ ] Un filleul ne peut pas avoir deux parrainages actifs
- [ ] Un parrain ne peut pas dépasser 5 filleuls actifs
- [ ] Annuaire masque les parrains saturés
- [ ] Messagerie inaccessible sans parrainage accepté
- [ ] Interface utilisable sur mobile
- [ ] Admin peut suspendre un compte et voir les statistiques
