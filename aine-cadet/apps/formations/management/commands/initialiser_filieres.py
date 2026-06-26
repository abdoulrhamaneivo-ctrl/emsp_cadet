"""
Initialise les filières EMSP à partir du contenu officiel (www.emsp.int).

Usage : python manage.py initialiser_filieres
"""
from django.core.management.base import BaseCommand

from apps.formations.models import Filiere, Specialite


class Command(BaseCommand):
    help = "Crée ou met à jour les filières EMSP (contenu institutionnel)"

    def handle(self, *args, **options):
        from apps.formations.extracted_data import EXTRACTED_SPECIALTIES_DATA

        filieres_data = [
            {
                "slug": "fsp",
                "nom": "Formations Supérieures Postales (FSP / FCP)",
                "code": "FSP",
                "type_formation": Filiere.TypeFormation.FID,
                "duree": "10 mois (3 cycles × 9 mois cours + 1 mois stage/projet)",
                "ordre": 1,
                "resume": (
                    "Former les administrateurs, inspecteurs et contrôleurs des Postes "
                    "et Services Financiers des 8 pays membres."
                ),
                "description": (
                    "Les FSP de l'EMSP préparent les cadres des administrations et opérateurs "
                    "postaux ouest-africains. Chaque cycle comprend 9 mois de cours théoriques "
                    "suivis d'un mois de stage pratique ou de rédaction de projet professionnel."
                ),
                "conditions_admission": (
                    "L'admission ne se fait pas en candidature individuelle libre : le Ministère, "
                    "le Régulateur ou l'Opérateur Désigné du pays organise un centre de composition "
                    "et présente ses candidats. L'admission définitive est prononcée par la structure "
                    "nationale selon le quota de places du pays."
                ),
                "debouches": (
                    "Cadres des administrations et opérateurs postaux ; postes ministériels ; "
                    "autorités de régulation (ANR) ; institutions internationales (UPU, UPAP, CPEAO)."
                ),
                "cours": (
                    "Logistique & supply chain (Organisation des flux, traçabilité, performance opérationnelle) ;\n"
                    "Management & gouvernance (Pilotage d'équipes, qualité de service, transformation organisationnelle)."
                ),
            },
            {
                "slug": "fs-menum",
                "nom": "FS MENUM — Management de l'Économie Numérique",
                "code": "FS MENUM",
                "type_formation": Filiere.TypeFormation.FID,
                "duree": "10 semestres (système LMD)",
                "ordre": 2,
                "resume": (
                    "Licence professionnelle en 5 spécialités numériques, avec poursuite "
                    "possible en Master professionnel."
                ),
                "description": (
                    "La FS MENUM forme les managers et experts de l'économie numérique pour "
                    "accompagner la transformation digitale des postes africaines. "
                    "5 spécialités au niveau Licence professionnelle, avec accès au Master pro."
                ),
                "conditions_admission": (
                    "Licence 1 : Bac (séries A à G) ou BT, 23 ans max au 31/12 (CI), "
                    "concours direct (écrit + oral), bourse d'État pour les admis. "
                    "Pré-inscription en ligne sur www.emsp.int. "
                    "L3/M1 : Bac+2 ou BTS tertiaire sur concours, ou voie directe pour licenciés EMSP."
                ),
                "debouches": (
                    "Logistique & numérique, finance digitale, marketing digital, "
                    "digitalisation des services, gestion des activités réglementées de l'économie."
                ),
                "cours": "Voir les programmes spécifiques par spécialité (LNUM, FDIG, MDIG, DSER, GARE).",
                "specialites": [
                    ("LNUM", "Logistique & Numérique", "Chargé de logistique, supply chain, e-commerce, transit/douane…"),
                    ("FDIG", "Finance Digitale", "Comptabilité, services financiers, fintech, inclusion financière."),
                    ("MDIG", "Marketing Digital", "Ventes en ligne, accompagnement e-commerce des entreprises."),
                    ("DSER", "Digitalisation des Services", "Transformation digitale, IA, cybersécurité, cloud."),
                    ("GARE", "Gestion des Activités Réglementées", "Conformité réglementaire sectorielle publique/privée."),
                ],
            },
            {
                "slug": "ms-regnum",
                "nom": "MS RegNUM — Mastère Spécialisé Régulation du Numérique",
                "code": "RegNUM",
                "type_formation": Filiere.TypeFormation.FID,
                "duree": "18 mois en alternance",
                "ordre": 3,
                "resume": "Formation en partenariat avec Télécom Paris — régulation des télécoms et du numérique.",
                "description": (
                    "Le Mastère Spécialisé en Régulation du Numérique est monté en partenariat "
                    "avec Télécom Paris. Admission via procédure liée au partenaire."
                ),
                "conditions_admission": "Procédure Télécom Paris — contacter la direction des études EMSP.",
                "debouches": "Autorités de régulation, opérateurs télécoms, cabinets spécialisés.",
                "cours": (
                    "Régulation des réseaux et services de communications électroniques ;\n"
                    "Économie des télécommunications ;\n"
                    "Droit du numérique et de la régulation ;\n"
                    "Cybersécurité, gouvernance de l'internet et souveraineté numérique."
                ),
            },
            {
                "slug": "formation-continue",
                "nom": "Formations Continues Qualifiantes (FCQ)",
                "code": "FCQ",
                "type_formation": Filiere.TypeFormation.FCQ,
                "duree": "1 jour à 3 mois (e-learning à la carte)",
                "ordre": 4,
                "resume": "FCD (1 j–2 sem.), FMD (1–3 mois), e-learning et formations non francophones.",
                "description": (
                    "L'EMSP propose des formations continues pour le perfectionnement des agents "
                    "et cadres postaux : courtes, moyennes durées, e-learning et modules FNF."
                ),
                "conditions_admission": "Selon le module choisi — contact@emsp.int",
                "debouches": "Perfectionnement professionnel dans le secteur postal et financier.",
                "cours": (
                    "Formations de Courte Durée (FCD : 1 jour à 2 semaines) ;\n"
                    "Formations de Moyenne Durée (FMD : 1 à 3 mois) ;\n"
                    "Modules e-learning et formations à la carte."
                ),
            },
        ]

        for data in filieres_data:
            specs = data.pop("specialites", [])
            filiere, created = Filiere.objects.update_or_create(
                slug=data["slug"],
                defaults=data,
            )
            action = "Créée" if created else "Mise à jour"
            self.stdout.write(f"{action} : {filiere.nom}")
            for i, (code, nom, desc) in enumerate(specs):
                extracted = EXTRACTED_SPECIALTIES_DATA.get(code, {})
                
                # Description
                spec_desc = extracted.get("objectif", desc)
                if spec_desc.endswith("..."):
                    spec_desc = spec_desc[:-3]
                
                # Debouches
                spec_debouches = extracted.get("debouches", "")
                if "Postuler ici..." in spec_debouches:
                    spec_debouches = spec_debouches.split("Postuler ici...")[0].strip()
                if not spec_debouches or spec_debouches == "Non spécifié.":
                    spec_debouches = desc
                    
                # Cours
                spec_cours = extracted.get("programme", "")
                if "Postuler ici..." in spec_cours:
                    spec_cours = spec_cours.split("Postuler ici...")[0].strip()
                if not spec_cours or spec_cours == "Non spécifié.":
                    spec_cours = ""

                Specialite.objects.update_or_create(
                    filiere=filiere,
                    code=code,
                    defaults={
                        "nom": nom,
                        "description": spec_desc,
                        "debouches": spec_debouches,
                        "cours": spec_cours,
                        "ordre": i + 1
                    },
                )

        self.stdout.write(self.style.SUCCESS("Filières EMSP initialisées."))
