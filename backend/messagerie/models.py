"""Messagerie — conversations, messages idempotents, marqueurs de lecture (doc 08 §2)."""

from django.conf import settings
from django.db import models


class Conversation(models.Model):
    class Type(models.TextChoices):
        PRIVE = "prive", "Conversation privée du binôme"
        GROUPE_FAMILLE = "groupe_famille", "Famille / cercle"

    type = models.CharField(max_length=20, choices=Type.choices)
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="conversations")
    titre_groupe = models.CharField("titre du groupe", max_length=120, blank=True)
    icone_code = models.CharField("icône", max_length=40, blank=True)
    proprietaire = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="groupes_possedes",
    )
    cree_le = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-cree_le"]

    def __str__(self):
        return f"#{self.pk} {self.get_type_display()}"


class Message(models.Model):
    """idempotency_key unique par (conversation, auteur) → zéro doublon (règle 1 doc 08)."""

    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="messages"
    )
    auteur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="messages"
    )
    contenu = models.TextField()
    date_envoi = models.DateTimeField(auto_now_add=True)
    idempotency_key = models.CharField(max_length=64)

    class Meta:
        ordering = ["-date_envoi", "-pk"]
        constraints = [
            models.UniqueConstraint(
                fields=["conversation", "auteur", "idempotency_key"],
                name="message_idempotent",
            )
        ]

    def __str__(self):
        return f"#{self.pk} par {self.auteur_id}"

    def clean(self):
        contenu = (self.contenu or "").strip()
        if not 1 <= len(contenu) <= 2000:
            raise ValueError("Le message doit compter entre 1 et 2000 caractères.")
        self.contenu = contenu


class Lecture(models.Model):
    """Dernier message lu par utilisateur/conversation → calcule `nonLus`."""

    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="lectures"
    )
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    dernier_message_lu = models.ForeignKey(
        Message, null=True, blank=True, on_delete=models.SET_NULL
    )
    mis_a_jour_le = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["conversation", "utilisateur"], name="lecture_unique")
        ]

    def __str__(self):
        return f"Lecture conv.{self.conversation_id} par {self.utilisateur_id}"

    @classmethod
    def non_lus_pour(cls, conversation, utilisateur):
        """Messages postérieurs à la dernière lecture, hors les miens."""
        filtre = conversation.messages.exclude(auteur=utilisateur)
        lecture = cls.objects.filter(conversation=conversation, utilisateur=utilisateur).first()
        if lecture and lecture.dernier_message_lu:
            filtre = filtre.filter(pk__gt=lecture.dernier_message_lu.pk)
        return filtre.count()
