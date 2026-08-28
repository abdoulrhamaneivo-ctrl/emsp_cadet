# EMSP Connect — backend Django (T3b)

Messagerie temps réel + rendez-vous, contrat doc 21 (`docs/backend/21-backend-django-channels.md`),
verbatim du front T3a (mocks MSW `app/src/shared/mocks/handlers-t3.js`).

## Démarrage

```bash
cd backend
uv sync                          # installe .venv (Python 3.13)
uv run python manage.py migrate
uv run python manage.py seed_demo   # démo : Ivo/Awa, conv 101 + famille, RDV demain 14h
uv run python manage.py runserver 8000
```

Comptes de démo : `ivo.abdoul@emsp.int`, `awa.kouassi@emsp.int`, `yann.gbagbo@emsp.int`,
`salim.cisse@emsp.int` — mot de passe `demo` (JAMAIS en prod).

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
