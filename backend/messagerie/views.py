"""Endpoints REST messagerie — contrat doc 21 §3.1 (verbatim des handlers MSW T3a)."""

from django.db import IntegrityError, models, transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from config.exceptions import ErreurValidation

from .models import Conversation, Lecture, Message
from .serializers import ConversationSerializer, MessageSerializer
from .temps_reel import publier

TAILLE_PAGE = 8


def _conversation_autorisee(request, conversation_id):
    """404 si inconnue, 403 si non-participant (doc 21 §6.5)."""
    conversation = get_object_or_404(Conversation, pk=conversation_id)
    if not conversation.participants.filter(pk=request.user.pk).exists():
        raise PermissionDenied("Tu n'es pas participant de cette conversation.")
    return conversation


class ConversationsView(APIView):
    """GET /api/conversations/ — les miennes, plus récents d'abord (cache front idem)."""

    def get(self, request):
        conversations = (
            Conversation.objects.filter(participants=request.user)
            # Tri contrat doc 08 : date du DERNIER message (pas le pk — les seeds
            # réécrivent des dates historiques postérieures à leur insertion).
            .annotate(derniere_date=models.Max("messages__date_envoi"))
            .order_by(models.F("derniere_date").desc(nulls_last=True))
            .prefetch_related("participants", "messages")
        )
        serializer = ConversationSerializer(conversations, many=True, context={"request": request})
        return Response({"results": serializer.data})


class MessagesView(APIView):
    """GET : pagination curseur descendante. POST : envoi idempotent → 201."""

    def get(self, request, conversation_id):
        conversation = _conversation_autorisee(request, conversation_id)
        # Ordre strict par pk décroissante (insertion chronologique garanti par les
        # seeds) : c'est ce que suppose le curseur `avant` — jamais -date_envoi seul.
        messages = conversation.messages.order_by("-pk")
        avant = request.query_params.get("avant")
        if avant:
            if not avant.isdigit():
                raise ErreurValidation("Curseur invalide.")
            messages = messages.filter(pk__lt=int(avant))
        total = messages.count()
        page = list(messages[:TAILLE_PAGE])
        serializer = MessageSerializer(page, many=True, context={"request": request})
        return Response(
            {
                "hasMore": total > len(page),
                "cursor": page[-1].pk if page else None,
                "results": serializer.data,
            }
        )

    def post(self, request, conversation_id):
        conversation = _conversation_autorisee(request, conversation_id)
        contenu = (request.data.get("contenu") or "").strip()
        cle = (request.data.get("idempotencyKey") or "").strip()
        if not 1 <= len(contenu) <= 2000:
            raise ErreurValidation("Le message doit compter entre 1 et 2000 caractères.")
        if not cle:
            raise ErreurValidation("idempotencyKey requis.")

        # Règle 1 doc 08 : clé déjà vue → le MÊME message, zéro doublon.
        message = conversation.messages.filter(auteur=request.user, idempotency_key=cle).first()
        if message is None:
            try:
                with transaction.atomic():
                    message = Message.objects.create(
                        conversation=conversation,
                        auteur=request.user,
                        contenu=contenu,
                        idempotency_key=cle,
                    )
            except IntegrityError:  # course concurrente sur la contrainte unique
                message = conversation.messages.get(auteur=request.user, idempotency_key=cle)

        # Envoyer vaut lecture : mon compteur retombe à 0 (cohérence badge).
        Lecture.objects.update_or_create(
            conversation=conversation,
            utilisateur=request.user,
            defaults={"dernier_message_lu": message},
        )

        payload = MessageSerializer(message, context={"request": request}).data
        publier(
            conversation.pk,
            {"type": "message.new", "conversationId": conversation.pk, "message": payload},
        )
        return Response(payload, status=status.HTTP_201_CREATED)


class LuView(APIView):
    """PATCH /api/conversations/{id}/lu/ — accusé de lecture, jamais régressif."""

    def patch(self, request, conversation_id):
        conversation = _conversation_autorisee(request, conversation_id)
        dernier_id = request.data.get("dernierMessageId")
        dernier = conversation.messages.filter(pk=dernier_id).first()
        if dernier is None:
            raise ErreurValidation("Message inconnu dans cette conversation.")

        lecture = Lecture.objects.filter(
            conversation=conversation, utilisateur=request.user
        ).first()
        deja_lu = (
            lecture and lecture.dernier_message_lu and lecture.dernier_message_lu.pk >= dernier.pk
        )
        if not deja_lu:
            Lecture.objects.update_or_create(
                conversation=conversation,
                utilisateur=request.user,
                defaults={"dernier_message_lu": dernier},
            )
            publier(
                conversation.pk,
                {
                    "type": "message.lu",
                    "conversationId": conversation.pk,
                    "dernierMessageId": dernier.pk,
                },
            )
        return Response({"ok": True})
