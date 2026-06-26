"""Formulaires parrainage — annuaire, demandes, messagerie et RDV."""
from django import forms

from apps.accounts.choices import CLASSE_FILTRE_CHOICES, FILIERE_FILTRE_CHOICES

from .models import Avis, DemandeParrainage, Evenement, Message, RendezVous

_CSS_INPUT = {"class": "ac-input"}
_CSS_SELECT = {"class": "ac-select"}
_CSS_TEXTAREA_SM = {"class": "ac-textarea-sm", "rows": 3}
_CSS_TEXTAREA_MD = {"class": "ac-textarea-md", "rows": 4}


class FiltreAnnuaireForm(forms.Form):
    """Filtres de l'annuaire des Ainés (CDC §3.2) — listes déroulantes EMSP."""

    filiere = forms.ChoiceField(
        label="Filière",
        choices=FILIERE_FILTRE_CHOICES,
        required=False,
        widget=forms.Select(attrs=_CSS_SELECT),
    )
    classe = forms.ChoiceField(
        label="Classe",
        choices=CLASSE_FILTRE_CHOICES,
        required=False,
        widget=forms.Select(attrs=_CSS_SELECT),
    )
    q = forms.CharField(
        label="Recherche",
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={**_CSS_INPUT, "placeholder": "Nom, centre d'intérêt…"}),
    )


class DemandeParrainageForm(forms.ModelForm):
    """Demande de parrainage envoyée par un Cadet à un Ainé."""

    class Meta:
        model = DemandeParrainage
        fields = ("message_introduction",)
        labels = {
            "message_introduction": "Message pour votre Ainé",
        }
        widgets = {
            "message_introduction": forms.Textarea(
                attrs={
                    **_CSS_TEXTAREA_MD,
                    "placeholder": "Présentez-vous et expliquez vos attentes…",
                    "required": True,
                }
            ),
        }


class MessageForm(forms.ModelForm):
    """Envoi d'un message privé dans un binôme Ainé ↔ Cadet."""

    class Meta:
        model = Message
        fields = ("contenu",)
        labels = {"contenu": "Votre message"}
        widgets = {
            "contenu": forms.Textarea(
                attrs={
                    **_CSS_TEXTAREA_SM,
                    "placeholder": "Écrivez votre message…",
                    "class": "ac-chat-input ac-textarea-sm",
                    "required": True,
                }
            ),
        }


class RendezVousForm(forms.ModelForm):
    """Proposition ou contre-proposition de rendez-vous (CDC §3.5)."""

    class Meta:
        model = RendezVous
        fields = ("titre", "date_heure", "lieu")
        labels = {
            "titre": "Titre",
            "date_heure": "Date et heure",
            "lieu": "Lieu",
        }
        widgets = {
            "titre": forms.TextInput(attrs={**_CSS_INPUT, "placeholder": "Ex. Point d'étape filière"}),
            "date_heure": forms.DateTimeInput(
                attrs={"type": "datetime-local", "class": "ac-input", "required": True},
                format="%Y-%m-%dT%H:%M",
            ),
            "lieu": forms.TextInput(attrs={**_CSS_INPUT, "placeholder": "Ex. campus EMSP, salle B12"}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Format compatible avec input datetime-local
        self.fields["date_heure"].input_formats = ["%Y-%m-%dT%H:%M", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M"]


class AvisForm(forms.ModelForm):
    """Retour d'expérience en fin de parrainage (CDC §3.6)."""

    class Meta:
        model = Avis
        fields = ("note", "commentaire")
        labels = {
            "note": "Note (1 à 5)",
            "commentaire": "Commentaire",
        }
        widgets = {
            "note": forms.NumberInput(attrs={"min": 1, "max": 5, "class": "ac-input ac-input-note", "required": True}),
            "commentaire": forms.Textarea(
                attrs={
                    **_CSS_TEXTAREA_MD,
                    "placeholder": "Partagez votre expérience d'accompagnement…",
                }
            ),
        }


class EvenementForm(forms.ModelForm):
    """Création d'un événement collectif (CDC §3.7)."""

    class Meta:
        model = Evenement
        fields = ("titre", "description", "date_heure", "lieu", "places_max")
        labels = {
            "titre": "Titre",
            "description": "Description",
            "date_heure": "Date et heure",
            "lieu": "Lieu",
            "places_max": "Places maximum (optionnel)",
        }
        widgets = {
            "titre": forms.TextInput(attrs=_CSS_INPUT),
            "description": forms.Textarea(attrs=_CSS_TEXTAREA_MD),
            "date_heure": forms.DateTimeInput(
                attrs={"type": "datetime-local", "class": "ac-input", "required": True},
                format="%Y-%m-%dT%H:%M",
            ),
            "lieu": forms.TextInput(attrs={**_CSS_INPUT, "placeholder": "Lieu de l'événement"}),
            "places_max": forms.NumberInput(attrs={"min": 1, "class": "ac-input", "placeholder": "Illimité si vide"}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["places_max"].required = False
        self.fields["date_heure"].input_formats = ["%Y-%m-%dT%H:%M", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M"]
