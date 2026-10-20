"""Stockage privé des justificatifs étudiants.

Les justificatifs ne passent jamais par le stockage public utilisé pour les
photos de profil. En production ils sont téléversés comme ressources Cloudinary
authentifiées; en développement ils restent dans STUDENT_CARD_STORAGE_ROOT et
ne sont servis que par la vue d'administration autorisée.
"""

import time
import uuid
from pathlib import PurePosixPath
from urllib.request import urlopen

import cloudinary
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import FileSystemStorage, Storage
from django.utils.deconstruct import deconstructible


@deconstructible
class CloudinaryAuthenticatedStorage(Storage):
    """Stocke les cartes en privé et refuse les URL publiques permanentes."""

    def _cloudinary_active(self):
        config = cloudinary.config()
        return bool(config.cloud_name and config.api_key and config.api_secret)

    def _local_storage(self):
        return FileSystemStorage(location=settings.STUDENT_CARD_STORAGE_ROOT)

    def get_available_name(self, name, max_length=None):
        suffix = PurePosixPath(name).suffix.lower()
        return f"student-cards/{uuid.uuid4().hex}{suffix}"

    def _save(self, name, content):
        if not self._cloudinary_active():
            if not settings.DEBUG:
                raise RuntimeError(
                    "Cloudinary est obligatoire en production pour les cartes étudiantes."
                )
            return self._local_storage().save(name, content)

        from cloudinary import uploader

        suffix = PurePosixPath(name).suffix.lower()
        public_id = PurePosixPath(name).with_suffix("").as_posix()
        prefix = getattr(settings, "CLOUDINARY_STORAGE", {}).get("PREFIX", "").strip("/")
        if prefix:
            public_id = f"{prefix}/{public_id}"
        if hasattr(content, "seek"):
            content.seek(0)
        result = uploader.upload(
            content,
            public_id=public_id,
            resource_type="image",
            type="authenticated",
            overwrite=False,
            unique_filename=False,
            use_filename=False,
            format=suffix.lstrip("."),
            tags=["student-card", "private"],
        )
        return f"{result['public_id']}.{result.get('format') or suffix.lstrip('.')}"

    def _open(self, name, mode="rb"):
        if not self._cloudinary_active():
            if not settings.DEBUG:
                raise RuntimeError(
                    "Cloudinary est obligatoire en production pour les cartes étudiantes."
                )
            return self._local_storage().open(name, mode)

        from cloudinary.utils import private_download_url

        path = PurePosixPath(name)
        extension = path.suffix.lstrip(".")
        download_url = private_download_url(
            path.with_suffix("").as_posix(),
            extension,
            resource_type="image",
            type="authenticated",
            expires_at=int(time.time()) + 60,
        )
        with urlopen(download_url, timeout=15) as response:
            content = ContentFile(response.read(), name=path.name)
        return content

    def delete(self, name):
        if not name:
            return
        if not self._cloudinary_active():
            if not settings.DEBUG:
                raise RuntimeError(
                    "Cloudinary est obligatoire en production pour les cartes étudiantes."
                )
            return self._local_storage().delete(name)

        from cloudinary import uploader

        public_id = PurePosixPath(name).with_suffix("").as_posix()
        prefix = getattr(settings, "CLOUDINARY_STORAGE", {}).get("PREFIX", "").strip("/")
        if prefix and not public_id.startswith(f"{prefix}/"):
            public_id = f"{prefix}/{public_id}"
        resultat = uploader.destroy(
            public_id,
            resource_type="image",
            type="authenticated",
            invalidate=True,
        )
        if resultat.get("result") not in {"ok", "not found"}:
            raise RuntimeError("Cloudinary n'a pas confirmé la suppression du justificatif privé.")

    def exists(self, name):
        if not self._cloudinary_active():
            return self._local_storage().exists(name)
        # Upload names are random UUIDs and never reused.
        return False

    def url(self, name):
        raise ValueError("Les cartes étudiantes n'ont pas d'URL publique.")
