"""
Vues parrainage — Phases 1–3 Ainé & Cadet.

Accueil, tableaux de bord, annuaire, demandes (Phase 1).
Messagerie et rendez-vous (Phase 2).
Avis, badges, événements (Phase 3).
"""
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from django.core.paginator import Paginator
from django.db import transaction
from django.http import HttpRequest, HttpResponse, HttpResponseForbidden, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST

from apps.accounts.models import User

from .forms import (
    AvisForm,
    DemandeParrainageForm,
    EvenementForm,
    FiltreAnnuaireForm,
    MessageForm,
    RendezVousForm,
)
from .models import AnneeAcademique, DemandeParrainage, Evenement, InscriptionEvenement, RendezVous
from apps.concours.models import AnneeConcours
from .services import (
    attribuer_badges_parrain,
    badges_parrain,
    binome_partenaire,
    compter_filleuls_actifs,
    compter_non_lus,
    evenements_a_venir,
    inscrire_evenement,
    marquer_messages_lus,
    mettre_a_jour_disponibilite_parrain,
    parrainages_termines_sans_avis,
    parrains_disponibles_queryset,
    peut_acceder_messagerie,
    peut_acceder_rdv,
    peut_creer_evenement,
    peut_laissser_avis,
    peut_repondre_rdv,
    peut_sinscrire_evenement,
    places_restantes_evenement,
    rdv_a_venir,
    rdv_en_attente,
    soumettre_avis,
    statistiques_administration,
    suggerer_parrains,
    terminer_parrainage,
    valider_nouvelle_demande,
)


def accueil(request: HttpRequest) -> HttpResponse:
    """Page d'accueil publique — présentation du parrainage Ainé & Cadet."""
    if request.user.is_authenticated:
        return redirect("parrainage:dashboard")
    session_concours = AnneeConcours.objects.filter(active=True).first()
    return render(
        request, 
        "parrainage/accueil.html",
        {"session_concours": session_concours}
    )


@login_required
def dashboard(request: HttpRequest) -> HttpResponse:
    """Tableau de bord Cadet ou Ainé selon le rôle."""
    utilisateur = request.user
    contexte = {"utilisateur": utilisateur}

    if utilisateur.est_filleul:
        contexte["parrainage_actif"] = DemandeParrainage.objects.filter(
            filleul=utilisateur,
            statut=DemandeParrainage.Statut.ACCEPTE,
        ).select_related("parrain").first()
        contexte["rdv_prochains"] = rdv_a_venir(utilisateur)
        contexte["messages_non_lus"] = compter_non_lus(utilisateur)
        contexte["nb_demandes_actives"] = DemandeParrainage.objects.filter(
            filleul=utilisateur,
            statut__in=[
                DemandeParrainage.Statut.EN_ATTENTE,
                DemandeParrainage.Statut.ACCEPTE,
            ],
        ).count()
        contexte["demandes_envoyees"] = (
            DemandeParrainage.objects.filter(filleul=utilisateur)
            .select_related("parrain")
            .order_by("-date_creation")[:10]
        )
        contexte["suggestions"] = suggerer_parrains(utilisateur)
        contexte["avis_en_attente"] = parrainages_termines_sans_avis(utilisateur)
        contexte["evenements"] = evenements_a_venir(5)
        template = "parrainage/dashboard_cadet.html"
    elif utilisateur.est_parrain:
        contexte["filleuls_actifs"] = compter_filleuls_actifs(utilisateur)
        from django.conf import settings

        contexte["capacite_max"] = settings.PARRAIN_MAX_FILLEULS
        try:
            contexte["score_fiabilite"] = utilisateur.profil_parrain.score_fiabilite
        except Exception:
            contexte["score_fiabilite"] = 0
        contexte["nb_rdv_avenir"] = rdv_a_venir(utilisateur).count()
        contexte["demandes_recues"] = (
            DemandeParrainage.objects.filter(
                parrain=utilisateur,
                statut=DemandeParrainage.Statut.EN_ATTENTE,
            )
            .select_related("filleul")
            .order_by("-date_creation")
        )
        contexte["parrainages_actifs"] = (
            DemandeParrainage.objects.filter(
                parrain=utilisateur,
                statut=DemandeParrainage.Statut.ACCEPTE,
            )
            .select_related("filleul")
        )
        contexte["rdv_prochains"] = rdv_a_venir(utilisateur)
        contexte["rdv_a_traiter"] = rdv_en_attente(utilisateur)
        contexte["messages_non_lus"] = compter_non_lus(utilisateur)
        contexte["avis_en_attente"] = parrainages_termines_sans_avis(utilisateur)
        contexte["badges"] = badges_parrain(utilisateur)
        contexte["evenements"] = evenements_a_venir(5)
        template = "parrainage/dashboard_aine.html"
    else:
        stats = statistiques_administration()
        from apps.concours.models import InscriptionConcours
        from django.db.models import Count

        concours_par_filiere = (
            InscriptionConcours.objects.values("filiere_choix_1")
            .annotate(total=Count("id"))
            .order_by("-total")
        )
        stats["chart_concours_filiere"] = {
            "labels": [r["filiere_choix_1"] for r in concours_par_filiere],
            "values": [r["total"] for r in concours_par_filiere],
        }
        stats["inscriptions_concours_total"] = InscriptionConcours.objects.count()
        stats["inscriptions_concours_en_attente"] = InscriptionConcours.objects.filter(
            statut=InscriptionConcours.StatutCandidature.EN_ATTENTE
        ).count()
        stats["dernieres_inscriptions_concours"] = InscriptionConcours.objects.order_by(
            "-date_inscription"
        )[:8]
        stats["dernieres_inscriptions_evenements"] = (
            InscriptionEvenement.objects.select_related("participant", "evenement")
            .order_by("-date_inscription")[:8]
        )
        stats["dernieres_demandes_parrainage"] = (
            DemandeParrainage.objects.filter(statut=DemandeParrainage.Statut.EN_ATTENTE)
            .select_related("filleul", "parrain")
            .order_by("-date_creation")[:8]
        )
        stats["evenements_admin"] = evenements_a_venir(6)
        contexte.update(stats)
        template = "parrainage/dashboard_admin.html"

    return render(request, template, contexte)


@login_required
def annuaire(request: HttpRequest) -> HttpResponse:
    """Annuaire des Ainés disponibles avec filtres filière / classe."""
    from django.conf import settings
    from django.db.models import Q

    form = FiltreAnnuaireForm(request.GET or None)
    parrains = parrains_disponibles_queryset()

    if form.is_valid():
        if form.cleaned_data.get("filiere"):
            parrains = parrains.filter(filiere__icontains=form.cleaned_data["filiere"])
        if form.cleaned_data.get("classe"):
            parrains = parrains.filter(classe__icontains=form.cleaned_data["classe"])
        if form.cleaned_data.get("q"):
            terme = form.cleaned_data["q"]
            parrains = parrains.filter(
                Q(first_name__icontains=terme)
                | Q(last_name__icontains=terme)
                | Q(filiere__icontains=terme)
                | Q(profil_parrain__centres_interet__icontains=terme)
            )

    paginator = Paginator(parrains, 12)
    page_obj = paginator.get_page(request.GET.get("page"))

    # Chaîne de requête pour pagination (sans param page)
    querydict = request.GET.copy()
    querydict.pop("page", None)
    query_string = querydict.urlencode()

    return render(
        request,
        "parrainage/annuaire.html",
        {
            "form": form,
            "parrains": page_obj,
            "page_obj": page_obj,
            "query_string": query_string,
            "utilisateur": request.user,
            "capacite_max": settings.PARRAIN_MAX_FILLEULS,
        },
    )


@login_required
def detail_aine(request: HttpRequest, pk: int) -> HttpResponse:
    """Fiche détaillée d'un Ainé (parrain)."""
    from django.conf import settings

    parrain = get_object_or_404(
        User.objects.filter(role=User.Role.PARRAIN).select_related("profil_parrain"),
        pk=pk,
    )
    filleuls_actifs = compter_filleuls_actifs(parrain)
    return render(
        request,
        "parrainage/detail_aine.html",
        {
            "parrain": parrain,
            "utilisateur": request.user,
            "badges": badges_parrain(parrain),
            "filleuls_actifs": filleuls_actifs,
            "capacite_max": settings.PARRAIN_MAX_FILLEULS,
            "places_restantes": max(settings.PARRAIN_MAX_FILLEULS - filleuls_actifs, 0),
        },
    )


@login_required
def demande_creer(request: HttpRequest, parrain_id: int) -> HttpResponse:
    """Création d'une demande de parrainage par un Cadet."""
    if not request.user.est_filleul:
        return HttpResponseForbidden("Seuls les Cadets peuvent envoyer une demande.")

    parrain = get_object_or_404(User, pk=parrain_id, role=User.Role.PARRAIN)
    form = DemandeParrainageForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        try:
            valider_nouvelle_demande(request.user, parrain)
        except ValidationError as exc:
            messages.error(request, exc.messages[0] if exc.messages else str(exc))
            return redirect("parrainage:annuaire")

        demande = form.save(commit=False)
        demande.filleul = request.user
        demande.parrain = parrain
        demande.save()
        messages.success(request, f"Demande envoyée à {parrain.get_full_name()}.")
        return redirect("parrainage:dashboard")

    return render(
        request,
        "parrainage/demande_form.html",
        {"form": form, "parrain": parrain},
    )


@login_required
@transaction.atomic
def demande_repondre(request: HttpRequest, pk: int, action: str) -> HttpResponse:
    """Acceptation ou refus d'une demande par un Ainé."""
    if not request.user.est_parrain:
        return HttpResponseForbidden("Seuls les Ainés peuvent répondre aux demandes.")

    demande = get_object_or_404(
        DemandeParrainage,
        pk=pk,
        parrain=request.user,
        statut=DemandeParrainage.Statut.EN_ATTENTE,
    )

    if action == "accepter":
        try:
            valider_nouvelle_demande(demande.filleul, request.user)
        except ValidationError as exc:
            messages.error(request, exc.messages[0] if exc.messages else str(exc))
            return redirect("parrainage:dashboard")

        demande.statut = DemandeParrainage.Statut.ACCEPTE
        demande.date_reponse = timezone.now()
        demande.save()
        mettre_a_jour_disponibilite_parrain(request.user)
        messages.success(request, f"Accompagnement accepté avec {demande.filleul.get_full_name()}.")

    elif action == "refuser":
        demande.statut = DemandeParrainage.Statut.REFUSE
        demande.date_reponse = timezone.now()
        demande.save()
        messages.info(request, f"Demande de {demande.filleul.get_full_name()} refusée.")

    else:
        return HttpResponseForbidden("Action non reconnue.")

    return redirect("parrainage:dashboard")


@login_required
def messages_fil(request: HttpRequest, pk: int) -> HttpResponse:
    """Fil de conversation privée Ainé ↔ Cadet (CDC §3.4)."""
    parrainage = get_object_or_404(
        DemandeParrainage.objects.select_related("parrain", "filleul"),
        pk=pk,
    )
    if not peut_acceder_messagerie(parrainage, request.user):
        return HttpResponseForbidden("Messagerie indisponible : parrainage non accepté ou accès refusé.")

    partenaire = binome_partenaire(parrainage, request.user)

    if request.method == "POST":
        form = MessageForm(request.POST)
        if form.is_valid():
            message = form.save(commit=False)
            message.parrainage = parrainage
            message.expediteur = request.user
            message.save()
            messages.success(request, "Message envoyé.")
            return redirect("parrainage:messages", pk=pk)
    else:
        form = MessageForm()

    # Marquer les messages reçus comme lus à l'ouverture du fil
    marquer_messages_lus(parrainage, request.user)

    fil_messages = parrainage.messages.select_related("expediteur").all()
    rdv_liste = parrainage.rendez_vous.select_related("organisateur").order_by("-date_heure")[:5]
    rdv_form = RendezVousForm()

    # Polling AJAX — compteur messages pour rafraîchissement auto
    if request.headers.get("X-Requested-With") == "XMLHttpRequest":
        from django.http import JsonResponse

        return JsonResponse({"count": fil_messages.count()})

    return render(
        request,
        "parrainage/messages.html",
        {
            "parrainage": parrainage,
            "partenaire": partenaire,
            "fil_messages": fil_messages,
            "form": form,
            "rdv_form": rdv_form,
            "rdv_liste": rdv_liste,
            "utilisateur": request.user,
        },
    )


@login_required
@require_POST
def messages_marquer_lu(request: HttpRequest, pk: int) -> HttpResponse:
    """API JSON pour marquer les messages d'un fil comme lus (polling / refresh)."""
    parrainage = get_object_or_404(DemandeParrainage, pk=pk)
    if not peut_acceder_messagerie(parrainage, request.user):
        return JsonResponse({"ok": False, "erreur": "Accès refusé"}, status=403)

    nb = marquer_messages_lus(parrainage, request.user)
    return JsonResponse({"ok": True, "marques": nb, "non_lus_total": compter_non_lus(request.user)})


@login_required
def rdv_proposer(request: HttpRequest, pk: int) -> HttpResponse:
    """Proposition d'un rendez-vous dans un binôme actif (CDC §3.5)."""
    parrainage = get_object_or_404(
        DemandeParrainage.objects.select_related("parrain", "filleul"),
        pk=pk,
    )
    if not peut_acceder_rdv(parrainage, request.user):
        return HttpResponseForbidden("Rendez-vous indisponibles pour ce binôme.")

    if request.method == "POST":
        form = RendezVousForm(request.POST)
        if form.is_valid():
            rdv = form.save(commit=False)
            rdv.parrainage = parrainage
            rdv.organisateur = request.user
            rdv.statut = RendezVous.Statut.PROPOSE
            rdv.save()
            messages.success(request, "Proposition de rendez-vous envoyée.")
            return redirect("parrainage:messages", pk=pk)
    else:
        form = RendezVousForm()

    partenaire = binome_partenaire(parrainage, request.user)
    return render(
        request,
        "parrainage/rdv_form.html",
        {
            "parrainage": parrainage,
            "partenaire": partenaire,
            "form": form,
            "action_label": "Proposer le rendez-vous",
        },
    )


@login_required
@transaction.atomic
def rdv_repondre(request: HttpRequest, pk: int, rdv_id: int, action: str) -> HttpResponse:
    """Acceptation, refus ou contre-proposition d'un rendez-vous."""
    parrainage = get_object_or_404(DemandeParrainage, pk=pk)
    rdv = get_object_or_404(RendezVous, pk=rdv_id, parrainage=parrainage)

    if not peut_repondre_rdv(rdv, request.user):
        return HttpResponseForbidden("Vous ne pouvez pas répondre à ce rendez-vous.")

    if action == "accepter":
        rdv.statut = RendezVous.Statut.ACCEPTE
        rdv.save(update_fields=["statut"])
        messages.success(request, f"Rendez-vous « {rdv.titre} » accepté.")

    elif action == "refuser":
        rdv.statut = RendezVous.Statut.REFUSE
        rdv.save(update_fields=["statut"])
        messages.info(request, f"Rendez-vous « {rdv.titre} » refusé.")

    elif action == "contre-proposer":
        if request.method == "POST":
            form = RendezVousForm(request.POST)
            if form.is_valid():
                rdv.statut = RendezVous.Statut.CONTRE_PROPOSITION
                rdv.save(update_fields=["statut"])
                nouveau = form.save(commit=False)
                nouveau.parrainage = parrainage
                nouveau.organisateur = request.user
                nouveau.statut = RendezVous.Statut.PROPOSE
                nouveau.save()
                messages.success(request, "Contre-proposition envoyée.")
                return redirect("parrainage:messages", pk=pk)
        else:
            form = RendezVousForm(initial={
                "titre": rdv.titre,
                "lieu": rdv.lieu,
            })
            partenaire = binome_partenaire(parrainage, request.user)
            return render(
                request,
                "parrainage/rdv_form.html",
                {
                    "parrainage": parrainage,
                    "partenaire": partenaire,
                    "form": form,
                    "rdv_origine": rdv,
                    "action_label": "Envoyer la contre-proposition",
                },
            )
    else:
        return HttpResponseForbidden("Action non reconnue.")

    return redirect("parrainage:messages", pk=pk)


@login_required
@require_POST
@transaction.atomic
def parrainage_terminer(request: HttpRequest, pk: int) -> HttpResponse:
    """Clôture d'un parrainage actif — libère une place Ainé (CDC R6)."""
    parrainage = get_object_or_404(
        DemandeParrainage.objects.select_related("parrain", "filleul"),
        pk=pk,
    )
    try:
        terminer_parrainage(parrainage, request.user)
    except ValidationError as exc:
        messages.error(request, exc.messages[0] if exc.messages else str(exc))
        return redirect("parrainage:dashboard")

    messages.success(
        request,
        "Parrainage terminé. Merci de laisser un retour d'expérience si ce n'est pas déjà fait.",
    )
    return redirect("parrainage:avis_creer", pk=pk)


@login_required
def avis_creer(request: HttpRequest, pk: int) -> HttpResponse:
    """Formulaire d'avis en fin de parrainage (CDC §3.6)."""
    parrainage = get_object_or_404(
        DemandeParrainage.objects.select_related("parrain", "filleul"),
        pk=pk,
    )
    if not peut_laissser_avis(parrainage, request.user):
        return HttpResponseForbidden("Avis indisponible pour ce parrainage.")

    partenaire = binome_partenaire(parrainage, request.user)

    if request.method == "POST":
        form = AvisForm(request.POST)
        if form.is_valid():
            try:
                soumettre_avis(
                    parrainage,
                    request.user,
                    form.cleaned_data["note"],
                    form.cleaned_data.get("commentaire", ""),
                )
            except ValidationError as exc:
                messages.error(request, exc.messages[0] if exc.messages else str(exc))
                return redirect("parrainage:dashboard")

            messages.success(request, "Merci pour votre retour d'expérience.")
            return redirect("parrainage:dashboard")
    else:
        form = AvisForm()

    return render(
        request,
        "parrainage/avis_form.html",
        {
            "parrainage": parrainage,
            "partenaire": partenaire,
            "form": form,
        },
    )


@login_required
def evenements_liste(request: HttpRequest) -> HttpResponse:
    """Liste des événements collectifs à venir (CDC §3.7)."""
    evenements_qs = evenements_a_venir()
    paginator = Paginator(evenements_qs, 9)
    page_obj = paginator.get_page(request.GET.get("page"))

    inscriptions_utilisateur = set()
    if request.user.est_filleul:
        inscriptions_utilisateur = set(
            request.user.inscriptions_evenements.values_list("evenement_id", flat=True)
        )

    return render(
        request,
        "parrainage/evenements_liste.html",
        {
            "evenements": page_obj,
            "page_obj": page_obj,
            "inscriptions_utilisateur": inscriptions_utilisateur,
            "peut_creer": peut_creer_evenement(request.user),
        },
    )


@login_required
def evenement_creer(request: HttpRequest) -> HttpResponse:
    """Création d'un événement par un Ainé ou un administrateur."""
    if not peut_creer_evenement(request.user):
        return HttpResponseForbidden("Seuls les Ainés et administrateurs peuvent créer un événement.")

    if request.method == "POST":
        form = EvenementForm(request.POST)
        if form.is_valid():
            evenement = form.save(commit=False)
            evenement.organisateur = request.user
            evenement.save()
            if request.user.est_parrain:
                attribuer_badges_parrain(request.user)
            messages.success(request, f"Événement « {evenement.titre} » publié.")
            return redirect("parrainage:evenement_detail", pk=evenement.pk)
    else:
        form = EvenementForm()

    return render(request, "parrainage/evenement_form.html", {"form": form})


@login_required
def evenement_detail(request: HttpRequest, pk: int) -> HttpResponse:
    """Fiche événement avec inscription Cadet."""
    evenement = get_object_or_404(
        Evenement.objects.select_related("organisateur").prefetch_related("inscriptions__participant"),
        pk=pk,
    )
    return render(
        request,
        "parrainage/evenement_detail.html",
        {
            "evenement": evenement,
            "places_restantes": places_restantes_evenement(evenement),
            "peut_sinscrire": peut_sinscrire_evenement(evenement, request.user),
            "deja_inscrit": evenement.inscriptions.filter(participant=request.user).exists(),
        },
    )


@login_required
@require_POST
def evenement_inscrire(request: HttpRequest, pk: int) -> HttpResponse:
    """Inscription d'un Cadet à un événement collectif."""
    evenement = get_object_or_404(Evenement, pk=pk)
    try:
        inscrire_evenement(evenement, request.user)
    except ValidationError as exc:
        messages.error(request, exc.messages[0] if exc.messages else str(exc))
    else:
        messages.success(request, f"Inscription confirmée pour « {evenement.titre} ».")

    return redirect("parrainage:evenement_detail", pk=pk)


@login_required
def archives(request: HttpRequest) -> HttpResponse:
    """Archives lecture seule par année académique — administrateurs uniquement."""
    if not request.user.is_staff:
        return HttpResponseForbidden("Accès réservé aux administrateurs.")

    annees = AnneeAcademique.objects.all()
    annee_selectionnee = None
    demandes = []
    evenements = []

    annee_id = request.GET.get("annee")
    if annee_id:
        annee_selectionnee = get_object_or_404(AnneeAcademique, pk=annee_id)
        demandes = (
            DemandeParrainage.objects.filter(annee_academique=annee_selectionnee)
            .select_related("filleul", "parrain")
            .order_by("-date_creation")
        )
        evenements = (
            Evenement.objects.filter(annee_academique=annee_selectionnee)
            .select_related("organisateur")
            .order_by("-date_heure")
        )

    return render(
        request,
        "parrainage/archives.html",
        {
            "annees": annees,
            "annee_selectionnee": annee_selectionnee,
            "demandes": demandes,
            "evenements": evenements,
        },
    )


