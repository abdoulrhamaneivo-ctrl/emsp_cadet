from django.apps import AppConfig


class ParrainageConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.parrainage"
    verbose_name = "Ainé & Cadet — parrainage"

    def ready(self):
        # Enregistre les signaux de notification (Phase 2)
        import apps.parrainage.signals  # noqa: F401
