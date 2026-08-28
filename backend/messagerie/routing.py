"""Routage WebSocket (config/asgi.py pointe ici)."""

from django.urls import path

from .consumers import ChatConsumer

websocket_urlpatterns = [
    path("ws/chat/", ChatConsumer.as_asgi()),
]
