"""Formulaires comptes: inscription et profils Aine / Cadet."""
from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm

from .choices import CLASSE_CHOICES_VIDES, FILIERE_CHOICES_VIDES
from .models import ProfilParrain, User

_CSS_INPUT = {"class": "ac-input", "autocomplete": "off"}
_CSS_SELECT = {"class": "ac-select"}
_CSS_TEXTAREA_SM = {"class": "ac-textarea-sm", "rows": 3}
_CSS_TEXTAREA_MD = {"class": "ac-textarea-md", "rows": 4}


class ConnexionForm(AuthenticationForm):
    """Connexion par email institutionnel."""

    username = forms.EmailField(
        label="Email EMSP",
        widget=forms.EmailInput(
            attrs={
                **_CSS_INPUT,
                "placeholder": "prenom.nom@emsp.int",
                "autocomplete": "email",
                "required": True,
            }
        ),
    )
    password = forms.CharField(
        label="Mot de passe",
        widget=forms.PasswordInput(
            attrs={
                **_CSS_INPUT,
                "placeholder": "Votre mot de passe EMSP Connect",
                "autocomplete": "current-password",
                "required": True,
            }
        ),
    )


class InscriptionForm(UserCreationForm):
    """Inscription reservee au domaine email de l'ecole."""

    email = forms.EmailField(
        label="Email EMSP",
        help_text="Utilisez votre adresse institutionnelle.",
        widget=forms.EmailInput(
            attrs={
                **_CSS_INPUT,
                "placeholder": "prenom.nom@emsp.int",
                "autocomplete": "email",
                "required": True,
            }
        ),
    )
    role = forms.ChoiceField(
        label="Je m'inscris en tant que",
        choices=[
            (User.Role.FILLEUL, "Cadet (L1 - filleul)"),
            (User.Role.PARRAIN, "Aine (devancier - parrain)"),
        ],
        widget=forms.RadioSelect(attrs={"class": "ac-radio-group ac-role-cards"}),
    )
    classe = forms.ChoiceField(
        label="Classe / niveau",
        choices=CLASSE_CHOICES_VIDES,
        required=False,
        widget=forms.Select(attrs=_CSS_SELECT),
    )
    filiere = forms.ChoiceField(
        label="Filiere",
        choices=FILIERE_CHOICES_VIDES,
        required=False,
        widget=forms.Select(attrs=_CSS_SELECT),
    )
    attentes = forms.CharField(
        label="Mes besoins de Cadet",
        required=False,
        help_text="Visible quand vous choisissez Cadet.",
        widget=forms.Textarea(
            attrs={
                **_CSS_TEXTAREA_SM,
                "placeholder": "Ex. comprendre la filiere, preparer les examens, trouver mes reperes sur le campus.",
            }
        ),
    )
    ambitions = forms.CharField(
        label="Ce que je veux transmettre comme Aine",
        required=False,
        help_text="Visible quand vous choisissez Aine.",
        widget=forms.Textarea(
            attrs={
                **_CSS_TEXTAREA_SM,
                "placeholder": "Ex. aider les L1 a s'organiser, partager mes methodes et mes contacts utiles.",
            }
        ),
    )
    motivations = forms.CharField(
        label="Pourquoi je veux parrainer",
        required=False,
        help_text="Expliquez ce qui vous motive a accompagner un Cadet.",
        widget=forms.Textarea(
            attrs={
                **_CSS_TEXTAREA_SM,
                "placeholder": "Ex. j'ai ete aide a mon arrivee et je veux rendre ce soutien concret.",
            }
        ),
    )
    centres_interet = forms.CharField(
        label="Themes ou centres d'interet",
        max_length=255,
        required=False,
        help_text="Mots-cles separes par des virgules pour ameliorer les suggestions.",
        widget=forms.TextInput(
            attrs={**_CSS_INPUT, "placeholder": "Ex. data, reseaux, entrepreneuriat, concours, sport"}
        ),
    )

    class Meta:
        model = User
        fields = (
            "email",
            "first_name",
            "last_name",
            "role",
            "classe",
            "filiere",
            "attentes",
            "ambitions",
            "motivations",
            "centres_interet",
            "password1",
            "password2",
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["first_name"].label = "Prenom"
        self.fields["last_name"].label = "Nom"
        self.fields["password1"].label = "Mot de passe"
        self.fields["password2"].label = "Confirmation du mot de passe"
        self.fields["first_name"].widget.attrs.setdefault("placeholder", "Ex. Aminata")
        self.fields["last_name"].widget.attrs.setdefault("placeholder", "Ex. Diop")
        self.fields["password1"].widget.attrs.setdefault(
            "placeholder", "Minimum 8 caracteres, avec chiffres et majuscules"
        )
        self.fields["password2"].widget.attrs.setdefault(
            "placeholder", "Retapez exactement le meme mot de passe"
        )
        for name in ("first_name", "last_name", "password1", "password2"):
            widget = self.fields[name].widget
            existing = widget.attrs.get("class", "")
            widget.attrs["class"] = f"{existing} ac-input".strip()
            widget.attrs.setdefault("required", True)
        self.fields.pop("username", None)

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"].lower().strip()
        user.username = user.email.split("@")[0]
        base_username = user.username
        suffix = 1
        while User.objects.filter(username=user.username).exclude(pk=user.pk).exists():
            user.username = f"{base_username}{suffix}"
            suffix += 1
        user.attentes = self.cleaned_data.get("attentes", "") if user.role == User.Role.FILLEUL else ""
        if commit:
            user.save()
            if user.role == User.Role.PARRAIN:
                profil, _ = ProfilParrain.objects.get_or_create(utilisateur=user)
                profil.ambitions = self.cleaned_data.get("ambitions", "")
                profil.motivations = self.cleaned_data.get("motivations", "")
                profil.centres_interet = self.cleaned_data.get("centres_interet", "")
                profil.save()
        return user


class ProfilCadetForm(forms.ModelForm):
    """Edition du profil Cadet."""

    classe = forms.ChoiceField(
        label="Classe / niveau",
        choices=CLASSE_CHOICES_VIDES,
        required=False,
        widget=forms.Select(attrs=_CSS_SELECT),
    )
    filiere = forms.ChoiceField(
        label="Filiere",
        choices=FILIERE_CHOICES_VIDES,
        required=False,
        widget=forms.Select(attrs=_CSS_SELECT),
    )

    class Meta:
        model = User
        fields = ("first_name", "last_name", "classe", "filiere", "attentes", "photo")
        labels = {
            "first_name": "Prenom",
            "last_name": "Nom",
            "attentes": "Attentes vis-a-vis de votre Aine",
            "photo": "Photo de profil",
        }
        widgets = {
            "first_name": forms.TextInput(attrs={**_CSS_INPUT, "placeholder": "Votre prenom"}),
            "last_name": forms.TextInput(attrs={**_CSS_INPUT, "placeholder": "Votre nom"}),
            "attentes": forms.Textarea(
                attrs={
                    **_CSS_TEXTAREA_MD,
                    "placeholder": "Ex. cours a renforcer, rythme de travail, orientation, vie campus.",
                }
            ),
            "photo": forms.FileInput(attrs={"class": "ac-input", "accept": "image/*"}),
        }


class ProfilAineForm(forms.ModelForm):
    """Edition du profil utilisateur Aine."""

    classe = forms.ChoiceField(
        label="Classe / niveau",
        choices=CLASSE_CHOICES_VIDES,
        required=False,
        widget=forms.Select(attrs=_CSS_SELECT),
    )
    filiere = forms.ChoiceField(
        label="Filiere",
        choices=FILIERE_CHOICES_VIDES,
        required=False,
        widget=forms.Select(attrs=_CSS_SELECT),
    )
    ambitions = forms.CharField(
        label="Ambitions",
        widget=forms.Textarea(
            attrs={**_CSS_TEXTAREA_MD, "placeholder": "Ex. devenir referent dans ma filiere et aider les nouveaux a progresser vite."}
        ),
        required=False,
    )
    motivations = forms.CharField(
        label="Motivations",
        widget=forms.Textarea(
            attrs={**_CSS_TEXTAREA_MD, "placeholder": "Ex. transmettre mes methodes, rassurer les L1 et creer une communaute solide."}
        ),
        required=False,
    )
    projets = forms.CharField(
        label="Projets en cours",
        widget=forms.Textarea(
            attrs={**_CSS_TEXTAREA_SM, "placeholder": "Ex. memoire, stage, concours, association, projet numerique."}
        ),
        required=False,
    )
    points_forts = forms.CharField(
        label="Points forts",
        widget=forms.Textarea(
            attrs={**_CSS_TEXTAREA_SM, "placeholder": "Ex. organisation, prise de parole, finance digitale, revision en groupe."}
        ),
        required=False,
    )
    points_faibles = forms.CharField(
        label="Points faibles",
        widget=forms.Textarea(
            attrs={**_CSS_TEXTAREA_SM, "placeholder": "Ex. disponibilite limitee en periode d'examen, a prevenir a l'avance."}
        ),
        required=False,
    )
    centres_interet = forms.CharField(
        label="Centres d'interet",
        max_length=255,
        required=False,
        help_text="Mots-cles separes par des virgules.",
        widget=forms.TextInput(attrs={**_CSS_INPUT, "placeholder": "Ex. data, fiscalite, sport, entrepreneuriat"}),
    )

    class Meta:
        model = User
        fields = ("first_name", "last_name", "classe", "filiere", "photo")
        labels = {
            "first_name": "Prenom",
            "last_name": "Nom",
            "photo": "Photo de profil",
        }
        widgets = {
            "first_name": forms.TextInput(attrs={**_CSS_INPUT, "placeholder": "Votre prenom"}),
            "last_name": forms.TextInput(attrs={**_CSS_INPUT, "placeholder": "Votre nom"}),
            "photo": forms.FileInput(attrs={"class": "ac-input", "accept": "image/*"}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance.pk and hasattr(self.instance, "profil_parrain"):
            profil = self.instance.profil_parrain
            for champ in (
                "ambitions",
                "motivations",
                "projets",
                "points_forts",
                "points_faibles",
                "centres_interet",
            ):
                self.fields[champ].initial = getattr(profil, champ)

    def save(self, commit=True):
        user = super().save(commit=commit)
        if user.role == User.Role.PARRAIN:
            profil, _ = ProfilParrain.objects.get_or_create(utilisateur=user)
            for champ in (
                "ambitions",
                "motivations",
                "projets",
                "points_forts",
                "points_faibles",
                "centres_interet",
            ):
                setattr(profil, champ, self.cleaned_data.get(champ, ""))
            profil.save()
        return user
