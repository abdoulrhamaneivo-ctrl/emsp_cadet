"""Admin — statistiques et TRANSITION ANNUELLE (docs 12/15 + règle Ivo n°1).

La transition monte les niveaux mais ne touche JAMAIS comptes.Binome :
« en fin d'année on ne perd pas ses aînés et filleuls » (verbatim user).
Atomique : soit tout passe, rien n'est à moitié fait (doc 15 §2 n°3).
"""

import logging
from pathlib import PurePosixPath

from django.db import transaction
from django.db.models import Q
from django.http import HttpResponse
from django.utils import timezone
from django.utils.html import escape
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from comptes.models import Binome, User, VerificationEtudiant
from comptes.serializers import UtilisateurLegereSerializer
from config.exceptions import ErreurValidation
from ia.silence import creer_nudge_binome, detecter_binomes_silencieux

ORDRE = ["L1", "L2", "L3", "M1", "M2", "alumni"]
logger = logging.getLogger(__name__)


def _garde_admin(request):
    user = request.user
    if not user.is_authenticated or not (user.is_staff or user.is_superuser):
        raise ErreurValidation("Réservé à l'administration.")
    return user


class StatsAdminView(APIView):
    """GET /api/admin/stats/ — KPI doc 12 §2 (sous-ensemble utile V1)."""

    def get(self, request):
        _garde_admin(request)
        from parrainage.models import Demande

        return Response(
            {
                "parrainagesActifs": Binome.objects.filter(statut=Binome.Statut.ACTIF).count(),
                "demandesEnAttente": Demande.objects.filter(
                    statut=Demande.Statut.EN_ATTENTE
                ).count(),
                "etudiants": (
                    User.objects.filter(is_active=True).exclude(niveau_etude="alumni").count()
                ),
                "alumni": User.objects.filter(is_active=True, niveau_etude="alumni").count(),
            }
        )


def _niveau_suivant(niveau):
    """L1→L2→L3→M1→M2 ; M2/alumni = fins de cycle (gérées à part)."""
    index = ORDRE.index(niveau) if niveau in ORDRE else 0
    return ORDRE[min(index + 1, ORDRE.index("M2"))]


class TransitionApercuView(APIView):
    """GET /api/admin/transition-apercu/ — récapitulatif SANS exécution."""

    def get(self, request):
        _garde_admin(request)
        promotions, fins, anomalies = [], [], []

        for user in User.objects.filter(is_active=True).order_by("niveau_etude", "email"):
            niveau = user.niveau_etude
            if niveau not in ORDRE:
                anomalies.append({"user": user.email, "raison": f"Niveau inconnu : {niveau!r}"})
                continue
            if niveau in ("L1", "L2", "M1"):
                promotions.append(
                    {
                        "id": user.id,
                        "user": UtilisateurLegereSerializer(user).data,
                        "niveauActuel": niveau,
                        "niveauSuivant": _niveau_suivant(niveau),
                    }
                )
            elif niveau == "L3":
                intention = getattr(user, "intention_annee_suivante", "inconnu") or "inconnu"
                propose = "M1" if intention == "master" else "alumni"
                fins.append(
                    {
                        "id": user.id,
                        "user": UtilisateurLegereSerializer(user).data,
                        "intention": intention,
                        "niveauSuivantPropose": propose,
                        "parDefaut": intention not in ("master", "alumni"),
                    }
                )
            elif niveau == "M2":
                fins.append(
                    {
                        "id": user.id,
                        "user": UtilisateurLegereSerializer(user).data,
                        "intention": "fin_de_cycle",
                        "niveauSuivantPropose": "alumni",
                        "parDefaut": False,
                    }
                )

        return Response({"promotions": promotions, "finsDeCycle": fins, "anomalies": anomalies})


class TransitionExecuterView(APIView):
    """POST /api/admin/transition-executer/ — ATOMIQUE + binômes intacts.

    body {decisionParUser: {id: "L2"|"M1"|"alumni"|…}} — l'admin a validé
    chaque ligne de l'aperçu ; le serveur revalide et applique en une seule
    transaction. Les binômes ne sont JAMAIS touchés (règle Ivo n°1) : les
    alumni gardent leurs cadets actifs, les cadets gardent leur aîné.
    """

    def post(self, request):
        _garde_admin(request)
        decisions = (request.data or {}).get("decisionParUser") or {}
        if not isinstance(decisions, dict) or not decisions:
            raise ErreurValidation("Aucune décision fournie.")

        niveaux_valides = set(ORDRE)
        with transaction.atomic():
            modifiees = 0
            for id_texte, niveau_cible in decisions.items():
                if niveau_cible not in niveaux_valides:
                    raise ErreurValidation(f"Niveau cible invalide : {niveau_cible!r}")
                user = User.objects.select_for_update().filter(pk=int(id_texte)).first()
                if user is None:
                    raise ErreurValidation(f"Compte {id_texte} introuvable.")
                user.niveau_etude = niveau_cible
                user.save(update_fields=["niveau_etude"])
                modifiees += 1
            # RÈGLE IVO n°1 — zéro opération sur comptes.Binome ici.
            binomes_actifs = Binome.objects.filter(statut=Binome.Statut.ACTIF).count()

        return Response(
            {
                "ok": True,
                "modifiees": modifiees,
                "binomesConserves": binomes_actifs,
                "message": (
                    "Transition appliquée — les parrainages en cours sont "
                    "conservés, personne ne perd son Aîné ni ses filleuls."
                ),
            }
        )


class BinomesSilencieuxView(APIView):
    """GET /api/admin/binomes-silencieux/ — liste des binômes à risque (IA-5).

    Critères (métas only RG12.2) : dernier message Famille > 21j OU
    ≥ 3 RDV annulés sur 30j. Retourne liste avec raisons + option nudge.
    """

    def get(self, request):
        _garde_admin(request)

        silencieux = detecter_binomes_silencieux()
        # Enrichir avec infos utilisateur
        resultats = []
        for s in silencieux:
            from comptes.models import User
            from comptes.serializers import UtilisateurLegereSerializer
            aine = User.objects.get(pk=s["aine_id"])
            cadet = User.objects.get(pk=s["cadet_id"])
            resultats.append({
                "binomeId": s["binome_id"],
                "aine": UtilisateurLegereSerializer(aine).data,
                "cadet": UtilisateurLegereSerializer(cadet).data,
                "raisons": s["raisons"],
            })
        return Response({"results": resultats, "count": len(resultats)})

    def post(self, request):
        """POST {binomeId} → envoie un nudge bienveillant aux DEUX membres (IA-5)."""
        _garde_admin(request)
        binome_id = (request.data or {}).get("binomeId")
        if not binome_id:
            raise ErreurValidation("binomeId requis.")
        silencieux = detecter_binomes_silencieux()
        cible = next((s for s in silencieux if s["binome_id"] == binome_id), None)
        if not cible:
            raise ErreurValidation("Binôme non trouvé dans la liste des silencieux.")
        creer_nudge_binome(binome_id, cible["raisons"])
        return Response({"ok": True, "message": "Nudge envoyé aux deux membres."})


class VerificationsEtudiantsView(APIView):
    """Revue réservée au personnel: carte privée, matricule unique, décision."""

    class Decision(serializers.Serializer):
        verificationId = serializers.IntegerField(min_value=1)
        decision = serializers.ChoiceField(choices=("approuver", "refuser"))
        motif = serializers.CharField(max_length=400, required=False, allow_blank=True)

    def get(self, request):
        _garde_admin(request)
        verifications = VerificationEtudiant.objects.select_related("utilisateur").filter(
            utilisateur__statut_compte=User.StatutCompte.EN_ATTENTE
        )
        resultats = []
        for verification in verifications:
            user = verification.utilisateur
            homonyme = (
                User.objects.filter(prenom__iexact=user.prenom, nom__iexact=user.nom)
                .exclude(pk=user.pk)
                .filter(
                    Q(is_active=True, classe__iexact=user.classe)
                    | Q(verification_etudiant__promotion=verification.promotion)
                )
                .exists()
            )
            resultats.append(
                {
                    "verificationId": verification.pk,
                    "userId": user.pk,
                    "prenom": user.prenom,
                    "nom": user.nom,
                    "email": user.email,
                    "emailVerifie": user.email_verifie,
                    "classe": user.classe,
                    "filiere": user.filiere,
                    "matricule": verification.matricule,
                    "promotion": verification.promotion,
                    "soumiseLe": verification.creee_le,
                    "homonymeMemeClasseOuPromotion": homonyme,
                    "carteUrl": f"/api/admin/verifications-etudiants/{verification.pk}/carte/",
                }
            )
        reponse = Response({"results": resultats, "count": len(resultats)})
        reponse["Cache-Control"] = "no-store, private"
        reponse["Referrer-Policy"] = "no-referrer"
        return reponse

    def post(self, request):
        admin = _garde_admin(request)
        entree = self.Decision(data=request.data)
        entree.is_valid(raise_exception=True)
        donnees = entree.validated_data
        with transaction.atomic():
            verification = (
                VerificationEtudiant.objects.select_for_update()
                .select_related("utilisateur")
                .filter(pk=donnees["verificationId"])
                .first()
            )
            if verification is None:
                raise ErreurValidation("Dossier de vérification introuvable.")
            user = User.objects.select_for_update().get(pk=verification.utilisateur_id)
            if user.statut_compte != User.StatutCompte.EN_ATTENTE:
                raise ErreurValidation("Ce dossier a déjà été traité.")

            decision = donnees["decision"]
            if decision == "approuver":
                if not user.email_verifie:
                    raise ErreurValidation(
                        "L'étudiant doit confirmer son adresse e-mail avant validation."
                    )
                if not verification.carte_etudiant:
                    raise ErreurValidation("La carte étudiante est absente du dossier.")
                user.statut_compte = User.StatutCompte.ACTIF
                user.is_active = True
                verification.motif_refus = ""
            else:
                user.statut_compte = User.StatutCompte.REFUSE
                user.is_active = False
                verification.motif_refus = donnees.get("motif", "").strip()

            user.save(update_fields=["statut_compte", "is_active"])
            verification.decidee_le = timezone.now()
            verification.decidee_par = admin
            nom_carte = verification.carte_etudiant.name
            verification.save(update_fields=["decidee_le", "decidee_par", "motif_refus"])

            # Le document est supprimé du fournisseur après validation de la
            # transaction; il n'est jamais conservé comme pièce publique.
            if nom_carte:
                transaction.on_commit(
                    lambda: _supprimer_carte_verification(verification.pk, nom_carte)
                )
            if user.email_verifie:
                transaction.on_commit(
                    lambda: _notifier_decision_verification(
                        user.pk, decision, verification.motif_refus
                    )
                )

        return Response(
            {
                "detail": (
                    "Compte activé."
                    if decision == "approuver"
                    else "Dossier refusé."
                )
            }
        )


class CarteEtudiantAdminView(APIView):
    """Renvoie une copie sans cache uniquement après authentification admin."""

    def get(self, request, verification_id):
        _garde_admin(request)
        verification = (
            VerificationEtudiant.objects.select_related("utilisateur")
            .filter(
                pk=verification_id,
                utilisateur__statut_compte=User.StatutCompte.EN_ATTENTE,
            )
            .first()
        )
        if verification is None or not verification.carte_etudiant:
            raise ErreurValidation("Carte étudiante introuvable.")

        extension = PurePosixPath(verification.carte_etudiant.name).suffix.lower()
        content_type = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png"}.get(
            extension
        )
        if not content_type:
            raise ErreurValidation("Format de carte non autorisé.")
        with verification.carte_etudiant.open("rb") as fichier:
            contenu = fichier.read()
        reponse = HttpResponse(contenu, content_type=content_type)
        reponse["Content-Disposition"] = f'inline; filename="carte-etudiante{extension}"'
        reponse["Cache-Control"] = "no-store, private"
        reponse["Pragma"] = "no-cache"
        reponse["X-Content-Type-Options"] = "nosniff"
        reponse["Referrer-Policy"] = "no-referrer"
        return reponse


def _supprimer_carte_verification(verification_id, nom_carte):
    try:
        verification = VerificationEtudiant.objects.get(pk=verification_id)
        verification.carte_etudiant.storage.delete(nom_carte)
        VerificationEtudiant.objects.filter(
            pk=verification_id, carte_etudiant=nom_carte
        ).update(carte_etudiant="")
    except Exception:
        logger.exception("Impossible de supprimer la carte étudiante privée %s", verification_id)


def _notifier_decision_verification(user_id, decision, motif):
    try:
        user = User.objects.get(pk=user_id)
        if decision == "approuver":
            sujet = "Compte activé — EMSP Connect"
            texte = (
                "Ton identité étudiante a été validée. Tu peux maintenant te connecter à "
                "EMSP Connect."
            )
            html = (
                f"<p>Bonjour {escape(user.prenom)},</p>"
                "<h1 style='margin:0 0 12px;color:#10251a;font-size:25px;line-height:1.25'>"
                "Ton compte est activé</h1>"
                "<p>Ton identité étudiante a été validée. Tu peux maintenant te connecter "
                "et retrouver le réseau EMSP Connect.</p>"
            )
        else:
            sujet = "Dossier étudiant non validé — EMSP Connect"
            texte = (
                "Ton dossier n'a pas été validé. Contacte l'administration EMSP Connect "
                "pour toute question."
            )
            html = (
                f"<p>Bonjour {escape(user.prenom)},</p>"
                "<h1 style='margin:0 0 12px;color:#10251a;font-size:25px;line-height:1.25'>"
                "Dossier à compléter</h1>"
                "<p>Ton dossier n'a pas été validé. Contacte l'administration EMSP Connect "
                "pour toute question.</p>"
            )
            if motif:
                texte += f"\n\nMotif : {motif}"
                html += f"<p>Motif : {escape(motif)}</p>"
        from .auth_views import _envoyer, _gabarit_courriel

        _envoyer(
            user.email,
            sujet,
            texte,
            _gabarit_courriel(html, "Mise à jour de la vérification de ton dossier étudiant EMSP."),
        )
    except Exception:
        logger.exception("Impossible d'envoyer le résultat de validation du compte %s", user_id)
