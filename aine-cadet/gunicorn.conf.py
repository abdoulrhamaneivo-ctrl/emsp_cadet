"""
Configuration Gunicorn — Ainé & Cadet EMSP.

Usage :
    gunicorn -c gunicorn.conf.py config.wsgi:application

Voir docs/DEPLOIEMENT.md pour systemd / Docker.
"""
import multiprocessing
import os

# Adresse d'écoute (derrière nginx en production)
bind = os.getenv("GUNICORN_BIND", "127.0.0.1:8000")

# Nombre de workers — règle empirique : (2 × CPU) + 1
workers = int(os.getenv("GUNICORN_WORKERS", multiprocessing.cpu_count() * 2 + 1))

# Threads par worker (utile pour I/O : base de données, fichiers)
threads = int(os.getenv("GUNICORN_THREADS", "2"))

# Timeout requêtes longues (upload PDF bibliothèque, export CSV)
timeout = int(os.getenv("GUNICORN_TIMEOUT", "120"))

# Logs access / erreurs (stdout en Docker, fichiers sur serveur bare-metal)
accesslog = os.getenv("GUNICORN_ACCESS_LOG", "-")
errorlog = os.getenv("GUNICORN_ERROR_LOG", "-")
loglevel = os.getenv("GUNICORN_LOG_LEVEL", "info")

# Redémarrage workers après N requêtes (limite fuites mémoire Pillow/PDF)
max_requests = int(os.getenv("GUNICORN_MAX_REQUESTS", "1000"))
max_requests_jitter = 50

# Nom du processus visible dans ps / systemd
proc_name = "aine-cadet-emsp"

# Préchargement application — économise RAM, workers partagent le code
preload_app = True

# Répertoire de travail (racine projet Django)
chdir = os.path.dirname(os.path.abspath(__file__))

# User/group à définir en production (décommenter si service dédié)
# user = "www-data"
# group = "www-data"

# Keep-alive connexions HTTP persistantes
keepalive = 5

# En-tête Server masqué (sécurité légère)
# secure_scheme_headers = {"X-FORWARDED-PROTO": "https"}
