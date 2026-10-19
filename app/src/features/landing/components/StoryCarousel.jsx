import Carousel from "@shared/components/Carousel";

// Ces exemples restent explicitement signalés comme fictifs, comme dans le ZIP.
const histoires = [
  {
    id: "produit",
    citation: "Elle m’a appris à présenter mon projet en trois minutes. C’est ce qui m’a fait décrocher mon stage.",
    prenom: "Yanis",
    contexte: "cadet, parrainé par Nadia (promo 2011)",
    etiquette: "Histoire fictive · Produit",
    initialesA: "NB",
    initialesB: "YM",
    couleurA: "#0B7A3B",
    couleurB: "#3A4FA3",
    fond: "linear-gradient(135deg, #e2f5e8, #fff3bf)",
  },
  {
    id: "data",
    citation: "Son regard sur mon mémoire a changé ma façon de poser le problème. Je n’y serais pas arrivée seule.",
    prenom: "Inès",
    contexte: "cadette, parrainée par Sofia (promo 2013)",
    etiquette: "Histoire fictive · Data",
    initialesA: "SM",
    initialesB: "IR",
    couleurA: "#7A2E5C",
    couleurB: "#FFCB05",
    fond: "linear-gradient(135deg, #dfeaf8, #f7f9f8)",
  },
  {
    id: "communication",
    citation: "Un premier poste, ça se prépare à deux. On a répété chaque entretien jusqu’à ce que ça sonne juste.",
    prenom: "Zoé",
    contexte: "cadette, parrainée par Élise (promo 2015)",
    etiquette: "Histoire fictive · Communication",
    initialesA: "EV",
    initialesB: "ZL",
    couleurA: "#B3261E",
    couleurB: "#0B7A3B",
    fond: "linear-gradient(135deg, #fff3bf, #f7f9f8)",
  },
  {
    id: "entrepreneuriat",
    citation: "Il m’a évité trois erreurs de débutant avant même que j’ouvre ma boutique en ligne.",
    prenom: "Mathis",
    contexte: "cadet, parrainé par Karim (promo 2006)",
    etiquette: "Histoire fictive · Entrepreneuriat",
    initialesA: "KH",
    initialesB: "MP",
    couleurA: "#1F58A3",
    couleurB: "#8F5200",
    fond: "linear-gradient(135deg, #e2f5e8, #dfeaf8)",
  },
];

export default function StoryCarousel() {
  return (
    <Carousel
      items={histoires}
      ariaLabel="Histoires de parrainage"
      getLabel={(histoire, index) => `Histoire ${index + 1} : ${histoire.prenom}`}
      renderSlide={(histoire) => (
        <div className="story-slide">
          <div className="q">
            <span className="badge pri story-tag">{histoire.etiquette}</span>
            <blockquote>« {histoire.citation} »</blockquote>
            <p className="sub"><b>{histoire.prenom}</b> · {histoire.contexte}</p>
          </div>
          <div className="vis" style={{ background: histoire.fond }} aria-hidden="true">
            <span className="av xl story-avatar" style={{ background: histoire.couleurA, marginRight: -18, zIndex: 2 }}>{histoire.initialesA}</span>
            <span className="av xl story-avatar" style={{ background: histoire.couleurB }}>{histoire.initialesB}</span>
          </div>
        </div>
      )}
    />
  );
}
