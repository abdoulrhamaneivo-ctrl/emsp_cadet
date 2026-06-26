"""
Exporte les filières publiées vers JSON pour la vitrine statique.

Usage : python manage.py export_filieres_vitrine
"""
import json
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from apps.formations.models import Filiere


class Command(BaseCommand):
    help = "Export JSON des filières vers html5up-editorial/assets/data/filieres.json"

    def handle(self, *args, **options):
        out_dir = settings.BASE_DIR.parent / "html5up-editorial" / "assets" / "data"
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / "filieres.json"

        payload = []
        for f in Filiere.objects.filter(publie=True).prefetch_related("specialites"):
            payload.append(
                {
                    "slug": f.slug,
                    "nom": f.nom,
                    "code": f.code,
                    "duree": f.duree,
                    "resume": f.resume,
                    "url": f"/formations/{f.slug}/",
                    "image": f.image.url if f.image else None,
                    "specialites": [
                        {"code": s.code, "nom": s.nom, "description": s.description}
                        for s in f.specialites.all()
                    ],
                }
            )

        out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        self.stdout.write(self.style.SUCCESS(f"Exporté : {out_path} ({len(payload)} filières)"))
