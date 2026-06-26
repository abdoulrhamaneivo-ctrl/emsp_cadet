"""Vues concours — inscription publique et tableau admin."""
import csv
import json

from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.shortcuts import redirect, render
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.core.email import (
    envoyer_concours_preinscription_admin,
    envoyer_concours_preinscription_candidat,
    valider_adresse_email,
)
from apps.parrainage.models import AnneeAcademique

from .forms import InscriptionConcoursForm
from .models import AnneeConcours, InscriptionConcours


def _parse_json_body(request: HttpRequest) -> dict | None:
    try:
        data = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError, AttributeError):
        return None
    return data if isinstance(data, dict) else None


def _json_error(message: str, status: int = 400) -> JsonResponse:
    return JsonResponse({"ok": False, "error": message}, status=status)


def _session_concours_active():
    """Retourne la session concours active ou None."""
    return AnneeConcours.objects.filter(active=True).first()


def inscription(request: HttpRequest) -> HttpResponse:
    """Formulaire public d'inscription au concours (lien vitrine)."""
    annee_acad = AnneeAcademique.objects.filter(est_active=True).first()
    session = _session_concours_active()

    if request.method == "POST":
        # S'assurer que le concours est ouvert avant de traiter la soumission
        if not session:
            messages.error(request, "Les inscriptions au concours sont actuellement fermées.")
            return redirect("concours:inscription")

        form = InscriptionConcoursForm(request.POST, request.FILES)
        if form.is_valid():
            inscription_obj = form.save(commit=False)
            inscription_obj.annee_academique = annee_acad
            inscription_obj.save()
            messages.success(
                request,
                "Votre candidature au concours FS MENUM a bien été enregistrée. "
                "L'administration procédera à l'étude de votre dossier.",
            )
            return redirect("concours:inscription")
    else:
        form = InscriptionConcoursForm()

    return render(
        request,
        "concours/inscription.html",
        {"form": form, "annee": annee_acad, "session": session},
    )


def session_active_json(request: HttpRequest) -> HttpResponse:
    """API publique — données session concours pour la vitrine statique."""
    session = _session_concours_active()
    if not session:
        return JsonResponse({"active": False})
    return JsonResponse({
        "active": True,
        "annee": session.annee,
        "date_limite": session.date_limite.isoformat(),
        "date_limite_fr": session.date_limite.strftime("%d/%m/%Y"),
        "frais_fcfa": session.frais_fcfa,
    })


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def preinscription_json(request: HttpRequest) -> JsonResponse:
    """Pré-inscription légère depuis concours.html (vitrine statique)."""
    if request.method == "OPTIONS":
        return JsonResponse({})

    session = _session_concours_active()
    if not session:
        return _json_error("Les pré-inscriptions sont actuellement fermées.", status=403)

    data = _parse_json_body(request)
    if data is None:
        return _json_error("Corps JSON invalide.")

    if data.get("_gotcha"):
        return JsonResponse({"ok": True, "message": "Votre demande a bien été enregistrée."})

    nom = (data.get("nom") or "").strip()
    prenom = (data.get("prenom") or "").strip()
    email = (data.get("email") or "").strip()
    parcours = (data.get("parcours") or "").strip()
    motivation = (data.get("motivation") or "").strip()

    if not nom or not prenom or not email:
        return _json_error("Nom, prénom et e-mail sont obligatoires.")

    if not valider_adresse_email(email):
        return _json_error("Adresse e-mail invalide.")

    if parcours not in ("ingenierie", "management"):
        return _json_error("Veuillez sélectionner un parcours.")

    parcours_libelle = {
        "ingenierie": "Ingénierie (Fullstack, Cybersécurité, IA)",
        "management": "Management digital",
    }[parcours]

    envoyer_concours_preinscription_admin(
        prenom=prenom,
        nom=nom,
        email=email,
        session_annee=session.annee,
        parcours_libelle=parcours_libelle,
        motivation=motivation,
    )
    envoyer_concours_preinscription_candidat(
        prenom=prenom,
        nom=nom,
        email=email,
        session_annee=session.annee,
        parcours_libelle=parcours_libelle,
    )

    return JsonResponse(
        {
            "ok": True,
            "message": (
                "Votre pré-inscription a bien été transmise. "
                "Vous recevrez les prochaines étapes par e-mail."
            ),
        }
    )


from django.shortcuts import get_object_or_404

@staff_member_required
def dashboard_inscriptions(request: HttpRequest) -> HttpResponse:
    """Liste filtrable et panneau de contrôle des inscriptions concours (admin / staff)."""
    
    # Traitement des actions d'administration en POST
    if request.method == "POST":
        action = request.POST.get("action", "")
        
        # 1. Ouvrir / Fermer le concours
        if action == "toggle_concours":
            session = _session_concours_active()
            if session:
                session.active = False
                session.save()
                messages.success(request, f"Le concours ({session.annee}) a été FERMÉ avec succès.")
            else:
                # Active la session la plus récente ou en crée une nouvelle
                dernier = AnneeConcours.objects.first()
                if dernier:
                    dernier.active = True
                    dernier.save()
                    messages.success(request, f"Le concours ({dernier.annee}) a été OUVERT.")
                else:
                    annee_courante = timezone.now().year
                    nouvel = AnneeConcours.objects.create(
                        annee=f"{annee_courante}-{annee_courante+1} — Promotion FS MENUM",
                        date_limite=timezone.now().date() + timezone.timedelta(days=90),
                        frais_fcfa=25000,
                        active=True
                    )
                    messages.success(request, f"Une nouvelle session ({nouvel.annee}) a été créée et OUVERTE.")
            return redirect("concours:dashboard_inscriptions")
            
        # 2. Valider / Rejeter un dossier candidat
        elif action in ["valider_dossier", "rejeter_dossier"]:
            ins_id = request.POST.get("inscription_id")
            inscription_obj = get_object_or_404(InscriptionConcours, pk=ins_id)
            if action == "valider_dossier":
                inscription_obj.statut = InscriptionConcours.StatutCandidature.VALIDE
                messages.success(request, f"Le dossier de {inscription_obj.prenom} {inscription_obj.nom} a été validé (Admis à composer).")
            else:
                inscription_obj.statut = InscriptionConcours.StatutCandidature.REJETE
                messages.warning(request, f"Le dossier de {inscription_obj.prenom} {inscription_obj.nom} a été rejeté.")
            inscription_obj.save()
            return redirect("concours:dashboard_inscriptions")

    filiere = request.GET.get("filiere", "")
    statut = request.GET.get("statut", "")
    
    qs = InscriptionConcours.objects.select_related("annee_academique").all()
    if filiere:
        qs = qs.filter(filiere_choix_1=filiere)
    if statut:
        qs = qs.filter(statut=statut)

    if request.GET.get("export") == "csv":
        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = (
            f'attachment; filename="inscriptions_concours_{timezone.now():%Y%m%d}.csv"'
        )
        writer = csv.writer(response)
        writer.writerow([
            "Date", "Nom", "Prénom", "Moyenne", "Identité collante",
            "Choix 1", "Choix 2", "Choix 3", "Statut", "Email", "Année",
        ])
        for ins in qs:
            writer.writerow([
                ins.date_inscription.strftime("%d/%m/%Y %H:%M"),
                ins.nom,
                ins.prenom,
                ins.moyenne_examen,
                ins.identite_collante_bac,
                ins.filiere_choix_1,
                ins.filiere_choix_2,
                ins.filiere_choix_3,
                ins.get_statut_display(),
                ins.email,
                ins.annee_academique.libelle if ins.annee_academique else "",
            ])
        return response

    stats_par_filiere = {}
    for ins in InscriptionConcours.objects.all():
        stats_par_filiere[ins.filiere_choix_1] = stats_par_filiere.get(ins.filiere_choix_1, 0) + 1

    session = _session_concours_active()
    return render(
        request,
        "concours/dashboard_inscriptions.html",
        {
            "inscriptions": qs[:200],
            "filiere_filtre": filiere,
            "statut_filtre": statut,
            "stats_par_filiere": stats_par_filiere,
            "total": qs.count(),
            "session_active": session,
        },
    )

