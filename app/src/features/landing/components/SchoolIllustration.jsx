import { CalendarDays, Check } from "lucide-react";

/** Illustration du campus : les couches se déplacent légèrement au pointeur. */
export default function SchoolIllustration({ reducedMotion = false }) {
  const bouger = (event) => {
    if (reducedMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", ((event.clientX - bounds.left) / bounds.width - 0.5).toFixed(3));
    event.currentTarget.style.setProperty("--my", ((event.clientY - bounds.top) / bounds.height - 0.5).toFixed(3));
  };

  const reinitialiser = (event) => {
    event.currentTarget.style.setProperty("--mx", "0");
    event.currentTarget.style.setProperty("--my", "0");
  };

  return (
    <div
      className="stage"
      role="img"
      aria-label="Photo de la communauté EMSP superposée à une illustration animée du campus"
      onPointerMove={bouger}
      onPointerLeave={reinitialiser}
    >
      <div className="arch" aria-hidden="true">
        <div className="ly px1">
          <svg viewBox="0 0 440 540" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="campus-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#FFE56B" />
                <stop offset="1" stopColor="#FFF9DC" />
              </linearGradient>
            </defs>
            <rect width="440" height="540" fill="url(#campus-sky)" />
            <g transform="translate(325 150)">
              <circle r="42" fill="#FFCB05" />
              <circle r="42" fill="#FFCB05" className="sun-halo" />
            </g>
            <g fill="#fff">
              <g className="cloud-drift"><ellipse cx="90" cy="120" rx="48" ry="16" /><ellipse cx="122" cy="106" rx="30" ry="16" /></g>
              <g className="cloud-drift cloud-two"><ellipse cx="250" cy="64" rx="42" ry="12" /><ellipse cx="276" cy="54" rx="24" ry="12" /></g>
            </g>
          </svg>
        </div>
        <div className="ly px2">
          <svg viewBox="0 0 440 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <path d="M0 400 Q110 322 220 378 T440 356 V540 H0z" fill="#A9D974" />
            <path d="M0 440 Q140 376 262 430 T440 418 V540 H0z" fill="#63B04B" />
          </svg>
        </div>
        <div className="ly px3">
          <svg viewBox="0 0 440 540" preserveAspectRatio="xMidYMid slice" stroke="#0E2016" strokeLinejoin="round">
            <rect x="196" y="214" width="48" height="96" fill="#FBF8EE" strokeWidth="3" />
            <polygon points="186,214 220,166 254,214" fill="#0B7A3B" strokeWidth="3" />
            <path d="M220 166V136" strokeWidth="3" strokeLinecap="round" />
            <path d="M220 136L252 145L220 154z" fill="#FFCB05" strokeWidth="2" className="flag-sway" />
            <circle cx="220" cy="254" r="17" fill="#fff" strokeWidth="3" />
            <rect x="218.7" y="240" width="2.6" height="14" fill="#0E2016" stroke="none" className="clock-hand" />
            <rect x="219" y="245" width="2.2" height="9" fill="#0E2016" stroke="none" className="clock-hand-slow" />
            <rect x="50" y="494" width="340" height="14" fill="#E8E1C8" strokeWidth="2.5" />
            <rect x="70" y="480" width="300" height="14" fill="#F3EDD3" strokeWidth="2.5" />
            <rect x="90" y="360" width="260" height="120" fill="#FBF8EE" strokeWidth="3" />
            <polygon points="78,360 220,298 362,360" fill="#FFCB05" strokeWidth="3" />
            <circle cx="220" cy="336" r="11" fill="#fff" strokeWidth="2.5" />
            <rect x="96" y="368" width="9" height="112" fill="#fff" strokeWidth="2" />
            <rect x="335" y="368" width="9" height="112" fill="#fff" strokeWidth="2" />
            <path d="M190 480V430a30 30 0 0 1 60 0V480z" fill="#0B7A3B" strokeWidth="3" />
            <g fill="#FFE56B" strokeWidth="2.5">
              <rect x="118" y="392" width="26" height="36" className="window-blink" />
              <rect x="154" y="392" width="26" height="36" className="window-blink window-two" />
              <rect x="262" y="392" width="26" height="36" className="window-blink window-three" />
              <rect x="298" y="392" width="26" height="36" className="window-blink window-four" />
            </g>
          </svg>
        </div>
        <div className="ly px4">
          <svg viewBox="0 0 440 540" preserveAspectRatio="xMidYMid slice" stroke="#0E2016" strokeLinejoin="round">
            <g className="tree-sway"><rect x="30" y="420" width="12" height="76" fill="#8A5A2B" strokeWidth="2.5" /><circle cx="36" cy="400" r="34" fill="#2F8F4A" strokeWidth="3" /><circle cx="12" cy="426" r="24" fill="#2F8F4A" strokeWidth="3" /><circle cx="62" cy="428" r="24" fill="#3AA356" strokeWidth="3" /></g>
            <g className="tree-sway tree-two"><rect x="398" y="430" width="12" height="66" fill="#8A5A2B" strokeWidth="2.5" /><circle cx="404" cy="412" r="30" fill="#1F7A3B" strokeWidth="3" /><circle cx="430" cy="436" r="22" fill="#2F8F4A" strokeWidth="3" /></g>
          </svg>
        </div>
        <div className="ly px5">
          <svg viewBox="0 0 440 540" preserveAspectRatio="xMidYMid slice" stroke="#0E2016" strokeLinejoin="round">
            <path d="M0 516 Q110 500 220 513 T440 508 V540 H0z" fill="#2F8F4A" stroke="none" />
            <g className="campus-walkers">
              <g transform="translate(0 528)"><g className="walker-bob"><circle cy="-42" r="8" fill="#F2C9A0" strokeWidth="2" /><rect x="-9" y="-34" width="18" height="28" rx="8" fill="#0B7A3B" strokeWidth="2" /><rect x="-17" y="-32" width="9" height="17" rx="4" fill="#FFCB05" strokeWidth="2" /><path d="M-5 -6V6M5 -6V6" strokeWidth="3" strokeLinecap="round" fill="none" /></g></g>
              <g transform="translate(34 530)"><g className="walker-bob walker-two"><circle cy="-40" r="8" fill="#C98B5B" strokeWidth="2" /><rect x="-9" y="-32" width="18" height="26" rx="8" fill="#FFCB05" strokeWidth="2" /><rect x="8" y="-30" width="9" height="16" rx="4" fill="#0E2016" strokeWidth="2" /><path d="M-5 -6V6M5 -6V6" strokeWidth="3" strokeLinecap="round" fill="none" /></g></g>
            </g>
            <g fill="none" strokeWidth="2.5" strokeLinecap="round">
              <path className="bird-fly" d="M30 90q8-10 16 0q8-10 16 0" />
              <path className="bird-fly bird-two" d="M20 130q6-8 12 0q6-8 12 0" />
            </g>
          </svg>
        </div>
      </div>
      <figure className="campus-photo-card" aria-hidden="true">
        <img src="/images/emsp/campus-groupe.webp" alt="" fetchPriority="high" />
        <figcaption>La communauté EMSP</figcaption>
      </figure>
      <div className="px6 campus-note-wrap">
        <div className="note hand" style={{ position: "relative" }}>Bienvenue à l’EMSP !</div>
      </div>
      <div className="px5 campus-approval">
        <div className="chipf bob" style={{ position: "relative" }}>
          <Check className="ic" aria-hidden="true" /> Un binôme, un parcours
        </div>
      </div>
      <div className="px6 campus-calendar">
        <div className="chipf bob bob-delay" style={{ position: "relative" }}>
          <CalendarDays className="ic" aria-hidden="true" /> Rencontres · échanges · projets
        </div>
      </div>
    </div>
  );
}
