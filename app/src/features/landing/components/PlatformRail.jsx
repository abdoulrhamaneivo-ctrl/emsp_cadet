import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays, BriefcaseBusiness, Handshake } from "lucide-react";
import { Link } from "react-router-dom";

const espaces = [
  {
    type: "ÉVÉNEMENTS",
    titre: "Ateliers et rencontres",
    details: "Participe aux temps forts de la communauté EMSP.",
    Icone: CalendarDays,
    couleur: "linear-gradient(135deg, #0b7a3b, #075b2b)",
    photo: "/images/emsp/evenement.webp",
    lien: "/evenements",
  },
  {
    type: "PARRAINAGE",
    titre: "Rendez-vous de binôme",
    details: "Organise tes échanges et fais avancer tes projets ensemble.",
    Icone: Handshake,
    couleur: "linear-gradient(135deg, #b88b00, #ffcb05)",
    photo: "/images/emsp/mentorat.webp",
    lien: "/mon-parrainage",
  },
  {
    type: "OPPORTUNITÉS",
    titre: "Stages et offres",
    details: "Découvre les opportunités relayées par les membres.",
    Icone: BriefcaseBusiness,
    couleur: "linear-gradient(135deg, #1f58a3, #0e2016)",
    photo: "/images/emsp/opportunites.webp",
    lien: "/offres",
  },
];

export default function PlatformRail() {
  const railRef = useRef(null);
  const reducedMotion = useReducedMotion();

  const defiler = (direction) => {
    railRef.current?.scrollBy({
      left: direction * 340,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <>
      <div className="platform-rail-head">
        <h2 className="big disp">Se rencontrer, <span className="serif">puis saisir sa chance.</span></h2>
        <div className="acts" aria-label="Commandes des espaces à découvrir">
          <button className="arrow" type="button" onClick={() => defiler(-1)} aria-label="Espaces précédents">
            <ArrowLeft className="ic" aria-hidden="true" />
          </button>
          <button className="arrow" type="button" onClick={() => defiler(1)} aria-label="Espaces suivants">
            <ArrowRight className="ic" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div ref={railRef} className="rail" tabIndex={0} aria-label="Espaces de la plateforme à découvrir">
        {espaces.map(({ type, titre, details, Icone, couleur, photo, lien }) => (
          <Link className="evc shine" to={lien} key={type}>
            <div className="cv" style={{ background: couleur, backgroundImage: `linear-gradient(180deg, rgba(8, 24, 15, .16), rgba(8, 24, 15, .7)), url("${photo}")`, backgroundSize: "cover", backgroundPosition: "center" }}>
              <Icone className="ic l" aria-hidden="true" />
              <span className="badge rail-badge">{type}</span>
            </div>
            <div className="bd">
              <b className="disp rail-title">{titre}</b>
              <span className="hint">{details}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
