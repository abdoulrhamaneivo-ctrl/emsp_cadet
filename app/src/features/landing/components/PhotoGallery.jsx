const photos = [
  {
    fichier: "campus-groupe.webp",
    alt: "Étudiants réunis devant le bâtiment de l’EMSP.",
    legende: "La communauté devant l’EMSP",
  },
  {
    fichier: "promo-campus.webp",
    alt: "Étudiants en uniforme marchant ensemble sur le campus.",
    legende: "Une promotion sur le campus",
  },
  {
    fichier: "cours.webp",
    alt: "Étudiantes et étudiants réunis pendant un cours.",
    legende: "La vie en salle de cours",
  },
  {
    fichier: "atelier.webp",
    alt: "Des participants échangent autour d’une activité de groupe.",
    legende: "Un atelier en équipe",
  },
  {
    fichier: "amphitheatre.webp",
    alt: "La communauté réunie dans un amphithéâtre.",
    legende: "Un temps fort de l’école",
  },
  {
    fichier: "rencontre.webp",
    alt: "Cadets et Aînés réunis lors d’une rencontre.",
    legende: "Cadets et Aînés rassemblés",
  },
  {
    fichier: "cadets-en-cours.webp",
    alt: "Étudiants attentifs pendant un cours à l’EMSP.",
    legende: "Apprendre ensemble",
  },
];

export default function PhotoGallery() {
  return (
    <section className="life-section" aria-labelledby="life-section-title">
      <div className="wrap">
        <div className="life-section-heading">
          <div>
            <p className="eyebrow">La vie à l’EMSP</p>
            <h2 id="life-section-title" className="big disp">
              Une communauté <span className="serif">bien réelle.</span>
            </h2>
          </div>
          <p className="lead">
            Des visages, des cours et des rencontres qui font vivre le lien entre les promotions.
          </p>
        </div>
        <div className="life-gallery">
          {photos.map(({ fichier, alt, legende }, index) => (
            <figure className="life-photo" key={fichier}>
              <img
                src={`/images/emsp/${fichier}`}
                alt={alt}
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                <span className="life-photo-index">{String(index + 1).padStart(2, "0")}</span>
                <span>{legende}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
