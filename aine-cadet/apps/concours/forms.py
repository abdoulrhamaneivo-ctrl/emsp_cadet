"""Formulaires concours d'entrée EMSP."""
from django import forms

from apps.accounts.choices import FILIERE_CHOICES_VIDES

from .models import InscriptionConcours

_CSS_INPUT = {"class": "ac-input"}
_CSS_SELECT = {"class": "ac-select"}


class InscriptionConcoursForm(forms.ModelForm):
    """Inscription au concours FS MENUM — choix ordonnés sans doublon et fichiers justificatifs."""

    class Meta:
        model = InscriptionConcours
        fields = (
            "nom",
            "prenom",
            "moyenne_examen",
            "identite_collante_bac",
            "email",
            "filiere_choix_1",
            "filiere_choix_2",
            "filiere_choix_3",
            "photo_candidat",
            "type_piece_cni",
            "cni_document",
            "collante_bac",
        )
        labels = {
            "identite_collante_bac": "N° identité collante (examen BAC)",
            "moyenne_examen": "Moyenne à l'examen (/20)",
            "photo_candidat": "Photo d'identité (Fichier)",
            "type_piece_cni": "Type de pièce d'identité",
            "cni_document": "Document CNI / Récépissé",
            "collante_bac": "Collante du Baccalauréat",
        }
        widgets = {
            "nom": forms.TextInput(attrs={**_CSS_INPUT, "placeholder": "Nom", "required": True}),
            "prenom": forms.TextInput(attrs={**_CSS_INPUT, "placeholder": "Prénom", "required": True}),
            "moyenne_examen": forms.NumberInput(
                attrs={**_CSS_INPUT, "min": "0", "max": "20", "step": "0.01", "required": True}
            ),
            "identite_collante_bac": forms.TextInput(
                attrs={**_CSS_INPUT, "placeholder": "Ex. 0123456789", "required": True}
            ),
            "filiere_choix_1": forms.Select(attrs={**_CSS_SELECT, "required": True}),
            "filiere_choix_2": forms.Select(attrs={**_CSS_SELECT, "required": True}),
            "filiere_choix_3": forms.Select(attrs={**_CSS_SELECT, "required": True}),
            "email": forms.EmailInput(attrs={**_CSS_INPUT, "placeholder": "email@exemple.com"}),
            "photo_candidat": forms.ClearableFileInput(attrs={"class": "ac-file-input", "required": True}),
            "type_piece_cni": forms.Select(attrs={**_CSS_SELECT, "required": True}),
            "cni_document": forms.ClearableFileInput(attrs={"class": "ac-file-input", "required": True}),
            "collante_bac": forms.ClearableFileInput(attrs={"class": "ac-file-input", "required": True}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Choix de spécialités FS MENUM uniquement
        choices = [("", "— Sélectionnez votre spécialité —")] + list(InscriptionConcours.SpecialiteFSMenum.choices)
        for name in ("filiere_choix_1", "filiere_choix_2", "filiere_choix_3"):
            self.fields[name].choices = choices
            self.fields[name].required = True
            
        self.fields["photo_candidat"].required = True
        self.fields["cni_document"].required = True
        self.fields["collante_bac"].required = True

    def clean(self):
        cleaned = super().clean()
        c1 = cleaned.get("filiere_choix_1")
        c2 = cleaned.get("filiere_choix_2")
        c3 = cleaned.get("filiere_choix_3")
        if c1 and c2 and c3 and len({c1, c2, c3}) != 3:
            raise forms.ValidationError("Vos trois choix de spécialités doivent être différents.")
        return cleaned

