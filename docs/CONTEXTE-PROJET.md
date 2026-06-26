# Contexte du projet EMSPCONNECT

> Dernière mise à jour : juin 2025  
> Périmètre : dossier `EMSPCONNECT/` uniquement

---

## Vue d'ensemble

**EMSPCONNECT** est un site vitrine **statique** (HTML/CSS/JS) pour l'**École Multinationale des Postes (EMSP)**, avec un focus visible sur la filière **FS MENUM** (Filière Supérieure des Métiers de l'Économie Numérique).

Le dépôt contient :

- `html5up-editorial/` — application vitrine basée sur le template **HTML5 UP Editorial**, adaptée à l'identité EMSP
- `Print_Transparent.svg` — logo source EMSP
- `docs/` — documentation du projet (ce dossier)

**Aucun backend**, **aucun fichier de cahier des charges** et **aucun autre dossier projet** ne sont présents dans EMSPCONNECT.

---

## Contenu du dépôt

| Élément | Emplacement | Rôle |
|---------|-------------|------|
| Vitrine web | `html5up-editorial/` | Pages HTML, assets CSS/JS/SASS, images |
| Logo source | `Print_Transparent.svg` | Fichier SVG d'origine (copié vers `assets/images/logo.svg`) |
| Documentation | `docs/` | 5 fichiers Markdown de référence |

---

## L'institution EMSP (contenu affiché sur le site)

Informations reprises telles qu'implémentées dans `index.html` et `formations-fs-menum.html` :

| Élément | Détail |
|---------|--------|
| Nom complet | École Multinationale des Postes |
| Création | 1971 |
| Siège | BP 2660 Abidjan 18, Treichville, Côte d'Ivoire |
| Contact | info@emsp.int — (+225) 21 24 30 40 |
| Site officiel (lien externe) | [emsp.int](https://emsp.int) |
| Pays membres | Bénin, Burkina Faso, Côte d'Ivoire, Mali, Mauritanie, Niger, Sénégal, Togo |

---

## Périmètre fonctionnel visible dans le code

La navigation et le contenu des pages HTML indiquent les sections prévues :

1. **Accueil** — Présentation EMSP, stats institutionnelles, cartes formations, mention médiathèque
2. **Formations** — FSP, FS MENUM (page existante), Mastère RegNUM, Formation Continue (liens placeholder)
3. **Médiathèque** — Mentionnée sur l'accueil (lien placeholder)
4. **Contact** — Coordonnées dans la sidebar ; page dédiée absente
5. **Espace étudiant** — Lien sidebar (placeholder) ; mention d'une bibliothèque numérique réservée
6. **Inscriptions concours** — CTA « 3e promotion FS MENUM 2025-2026 » (liens placeholder)

---

## Filière FS MENUM (contenu implémenté)

Page `formations-fs-menum.html` :

- **Parcours Ingénierie** : Fullstack, cybersécurité, intelligence artificielle
- **Parcours Management** : Transformation digitale, marketing, pilotage de projets
- **Durée** : 10 semestres (LMD)
- **Chiffres affichés** : 100 % insertion professionnelle, 15+ partenaires, 10 semestres

---

## État actuel

| Réalisé | Non réalisé (dans EMSPCONNECT) |
|---------|--------------------------------|
| Page d'accueil EMSP (`index.html`) | Pages FSP, RegNUM, Formation Continue |
| Page FS MENUM (`formations-fs-menum.html`) | Page Médiathèque |
| Charte graphique EMSP (`emsp-custom.css`, `_vars.scss`) | Page Contact dédiée |
| Navigation sidebar avec sous-menu Formations | Espace étudiant fonctionnel |
| 6 images SVG (logo + placeholders) | Backend, authentification, bibliothèque numérique |
| Template Editorial intact (`generic.html`, `elements.html`) | Formulaire concours / inscriptions |

---

## Note sur le cahier des charges

**Aucun cahier des charges formel** (PDF, Word, brief texte) n'est présent dans le dossier EMSPCONNECT. Les exigences documentées dans `CAHIER-DES-CHARGES-SYNTHESE.md` sont **déduites du contenu HTML/CSS déjà implémenté** et des liens/sections prévus mais non encore créés.
