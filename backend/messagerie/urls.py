"""Routage messagerie (doc 21 §3.1)."""

from django.urls import path

from .views import ConversationsView, LuView, MessagesView

urlpatterns = [
    path("conversations/", ConversationsView.as_view()),
    path("conversations/<int:conversation_id>/messages/", MessagesView.as_view()),
    path("conversations/<int:conversation_id>/lu/", LuView.as_view()),
]
