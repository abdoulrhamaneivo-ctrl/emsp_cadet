# Déploiement EMSP Connect — Vercel, Render, Neon et Cloudinary

Le front est servi par Vercel, l’API Django et les WebSockets par Render, PostgreSQL par Neon et les médias envoyés par les utilisateurs par Cloudinary. Les SVG de fond du site restent des fichiers statiques versionnés dans `app/public/images/`.

## 1. Neon — base PostgreSQL

1. Le projet Neon `emsp-connect` est créé en Ohio, séparé de `Portail_emsp`, avec une branche vide `main` et la base `emsp_connect`.
2. Dans Neon, copie la chaîne de connexion **pooled** PostgreSQL avec TLS de cette branche.
3. Ajoute cette valeur uniquement comme `DATABASE_URL` dans les variables secrètes Render. Ne la mets pas dans Git ni dans le front Vercel.

Le backend exécute les migrations Django au démarrage. Le point `/health/` répond `200` quand la base est joignable.

## 2. Cloudinary — photos et médias

1. Crée un compte gratuit Cloudinary.
2. Dans Render, définis `CLOUDINARY_URL` depuis les identifiants affichés dans le tableau de bord Cloudinary. Cette valeur est un secret.
3. Les photos de profil existantes utilisent le stockage Cloudinary par défaut. Le tableau de bord Cloudinary permet de consulter, organiser et supprimer les médias.
4. Pour un futur `FileField` de documents (PDF, texte, etc.), utilise le stockage `raw_media` plutôt que celui réservé aux images :

```python
from django.core.files.storage import storages
from django.db import models

document = models.FileField(upload_to="documents/", storage=storages["raw_media"])
```

Les photos du dossier local `Photos/` ne sont pas automatiquement envoyées. Les nouveaux fonds du site sont des SVG originaux, sans photo de personne.

## 3. Render — API et WebSockets

Le Blueprint [render.yaml](render.yaml) crée `emsp-connect-api` en plan Free, dans la région Ohio pour être proche du projet Neon `aws-us-east-2`.

1. Pousse le dépôt dans un fournisseur Git pris en charge par Render, puis connecte ce dépôt au tableau de bord Render.
2. Choisis **New → Blueprint**, sélectionne le dépôt et confirme `render.yaml`.
3. Renseigne les trois secrets demandés :
   - `DATABASE_URL` : connexion Neon pooled de la branche dédiée ;
   - `CLOUDINARY_URL` : secret du compte Cloudinary ;
   - `FRONT_ORIGIN` : URL exacte de production Vercel, par exemple `https://emsp-connect.vercel.app`.
4. Lance le premier déploiement et vérifie `/health/`.

Render migre la base puis démarre Daphne/Channels. L’instance gratuite s’endort après une période d’inactivité et peut prendre environ une minute à se réveiller. Le channel layer en mémoire convient à une seule instance ; Redis sera nécessaire avant de mettre plusieurs instances.

## 4. Vercel — interface React

1. Le projet Vercel `emsp-connect` est créé et configuré avec **Root Directory** = `app` et le preset Vite.
2. Vérifie les variables de build :
   - `VITE_API_URL` : vide ;
   - `VITE_ENABLE_MOCKS` : `0` ;
   - `VITE_DEMO_SESSION` : `0` ;
   - `VITE_WS_URL` : `wss://emsp-connect-api.onrender.com`.
3. Déploie le front. `app/vercel.json` transmet `/api/*` à Render et conserve le fallback SPA React. Les WebSockets vont directement vers Render via `VITE_WS_URL`.
4. Mets l’URL de production Vercel exacte dans `FRONT_ORIGIN` sur Render, puis redéploie l’API.

## 5. Réglages locaux et vérifications

- Front : `app/.env.example`.
- Backend local : `backend/.env.example` (le profil local utilise toujours SQLite).
- Backend en production : `DJANGO_SETTINGS_MODULE=config.settings.prod` (défini par le Blueprint).
- Les valeurs secrètes doivent être ajoutées dans les tableaux de bord des services, jamais dans les fichiers `.env.example` ou Git.

Après le premier déploiement, vérifie l’inscription/connexion, l’envoi d’une photo de profil, son URL Cloudinary, le rafraîchissement de session et une conversation WebSocket.

## Limites des offres gratuites

- Vercel Hobby est prévu pour un usage personnel/non commercial.
- Render Free met les services web en veille après inactivité ; le réveil ajoute de la latence.
- Neon Free a des plafonds de calcul et de stockage par projet.
- Cloudinary Free partage son quota entre stockage, bande passante et transformations.

Consulte les limites officielles avant de mettre la plateforme en usage régulier : [Vercel Hobby](https://vercel.com/docs/plans/hobby), [Render Free](https://render.com/docs/free), [Neon Free](https://neon.com/pricing) et [Cloudinary](https://cloudinary.com/pricing).
