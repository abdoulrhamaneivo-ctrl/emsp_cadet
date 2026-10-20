# EMSP Connect — backend Django (T3b)

Messagerie temps réel + rendez-vous, contrat doc 21 (`docs/backend/21-backend-django-channels.md`),
verbatim du front T3a (mocks MSW `app/src/shared/mocks/handlers-t3.js`).

## Démarrage

```bash
cd backend
uv sync                          # installe .venv (Python 3.13)
uv run python manage.py migrate
uv run python manage.py runserver 8000
```

La base démarre sans compte ni contenu de démonstration. Crée les comptes administrateurs
explicitement avec `uv run python manage.py createsuperuser`.

## E-mails Brevo

Sur Render Free, configurer dans Render `BREVO_TRANSPORT=api`, `BREVO_API_KEY` (clé API Brevo) et
`BREVO_FROM_EMAIL` (adresse expéditeur vérifiée dans Brevo). L'envoi passe par l'API HTTPS
de Brevo, car Render Free bloque les ports SMTP 25, 465 et 587. Sur un hébergement qui
autorise SMTP, `BREVO_SMTP_LOGIN` et `BREVO_SMTP_KEY` (clé SMTP) restent disponibles en
repli. Les liens de confirmation et de réinitialisation pointent vers `FRONT_ORIGIN`.

## Qualité

```bash
uv run pytest          # 21 tests : REST (18) + WebSocket (3)
uv run ruff check .    # 0 erreur
```

## Bascule front (mocks → backend)

Dans `app/.env.local`, retirer `VITE_ENABLE_MOCKS` et ajouter :

```
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

(le hook WS concatène déjà `/ws/chat/?token=…`). Voir doc 21 §9 pour le proxy Vite.
