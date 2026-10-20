import { useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Heart,
  MessageCircle,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import PlatformRail from "../components/PlatformRail";
import PhotoGallery from "../components/PhotoGallery";
import SchoolIllustration from "../components/SchoolIllustration";
import StoryCarousel from "../components/StoryCarousel";

const ruban = [
  "Parrainage", "Stages", "Événements", "Mentorat", "Messagerie", "Rendez-vous", "Communauté", "Offres",
];

export default function LandingPage() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="landing-page page">
      <div className="progtop" aria-hidden="true" />

      <section className="hero2 paper">
        <div className="wrap h2g">
          <div className="hero2-copy">
            <p className="eyebrow">Pour les étudiants et leurs Aînés</p>
            <h1 className="hw" aria-label="Votre réseau de promo, à portée de clic.">
              <span aria-hidden="true">Votre</span><span aria-hidden="true">réseau</span><span aria-hidden="true">de</span>
              <span className="serif" aria-hidden="true">promo,</span><span aria-hidden="true">à</span>
              <span aria-hidden="true">portée</span><span aria-hidden="true">de</span><span aria-hidden="true"><u>clic.</u></span>
            </h1>
            <p className="lead2">
              Trouve un Aîné qui t’accompagne, échange avec ta communauté, organise tes rendez-vous
              et découvre les événements et opportunités de l’EMSP.
            </p>
            <div className="ctas2">
              <Link className="btn pri" to="/inscription">Créer mon compte <ArrowRight className="ic s" aria-hidden="true" /></Link>
              <a className="btn" href="#parrainage">Voir comment ça marche</a>
            </div>
            <p className="hint landing-proof">Une communauté EMSP pour apprendre, transmettre et avancer ensemble.</p>
          </div>
          <SchoolIllustration reducedMotion={reducedMotion} />
        </div>

        <div className="mq" aria-hidden="true">
          <div className="mq-t">
            {[0, 1].map((copie) => (
              <span className="mq-group" key={copie}>
                {ruban.map((item) => <span className="mq-item" key={`${copie}-${item}`}>{item}<i /></span>)}
              </span>
            ))}
          </div>
        </div>
      </section>

      <PhotoGallery />

      <section className="sc2" id="concept">
        <div className="wrap">
          <p className="eyebrow">Le concept</p>
          <h2 className="big disp">Chaque promo a <span className="serif">quelque chose</span> à transmettre.</h2>
          <p className="lead">Un Aîné connaît les portes qui s’ouvrent, un Cadet connaît les questions qu’on n’ose plus poser. EMSP Connect les met face à face, simplement.</p>
          <div className="pill3">
            <article className="pcard3 shine">
              <span className="bigic concept-mentor"><UsersRound className="ic l" aria-hidden="true" /></span>
              <h3 className="disp">Le parrainage</h3>
              <p className="sub">Un Aîné accompagne un Cadet sur la durée, avec des objectifs partagés et des rendez-vous réguliers.</p>
            </article>
            <article className="pcard3 shine">
              <span className="bigic concept-link"><MessageCircle className="ic l" aria-hidden="true" /></span>
              <h3 className="disp">Le lien</h3>
              <p className="sub">Messages, rendez-vous et fil de la communauté pour rester proches entre deux rencontres.</p>
            </article>
            <article className="pcard3 shine">
              <span className="bigic concept-opportunity"><BriefcaseBusiness className="ic l" aria-hidden="true" /></span>
              <h3 className="disp">Les opportunités</h3>
              <p className="sub">Stages, emplois et missions relayés par la communauté, pour la communauté.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="sc2 steps-section" id="parrainage">
        <div className="wrap">
          <div className="board">
            <p className="chalk">Au programme :</p>
            <h2 className="disp">Quatre étapes, un parrainage.</h2>
            <div className="bsteps">
              <svg className="chalkline" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
                <path d="M70 20 Q200 -6 330 20 T590 20 T850 20" vectorEffect="non-scaling-stroke" />
              </svg>
              <article className="bstep"><div className="num">1</div><h3 className="disp">Trouver</h3><p>Parcours l’annuaire et filtre par domaine, compétence ou promotion.</p></article>
              <article className="bstep"><div className="num">2</div><h3 className="disp">Demander</h3><p>Présente-toi en quelques lignes depuis le profil de la personne.</p></article>
              <article className="bstep"><div className="num">3</div><h3 className="disp">Échanger</h3><p>Une fois la demande acceptée, discutez et fixez vos rendez-vous.</p></article>
              <article className="bstep"><div className="num">4</div><h3 className="disp">Avancer</h3><p>Suivez vos objectifs ensemble, puis transmettez à votre tour.</p></article>
            </div>
            <p className="chalk board-signoff">… et un jour, c’est toi l’Aîné·e !</p>
          </div>
        </div>
      </section>

      <section className="sc2 paper" id="communaute">
        <div className="wrap">
          <p className="eyebrow">La communauté</p>
          <h2 className="big disp">Des parcours qui <span className="serif">se croisent.</span></h2>
          <p className="lead story-intro">Des histoires fictives pour illustrer l’esprit du parrainage.</p>
          <StoryCarousel />
        </div>
      </section>

      <section className="sc2" id="fonctionnalites">
        <div className="wrap">
          <p className="eyebrow">Fonctionnalités</p>
          <h2 className="big disp">Tout le campus, <span className="serif">dans ta poche.</span></h2>
          <div className="bento">
            <Link className="bt a shine" to="/messagerie">
              <h3 className="disp">Messagerie</h3>
              <p>Des conversations privées entre Aînés et Cadets, sans quitter la plateforme.</p>
              <div className="message-preview" aria-hidden="true">
                <span className="bub2 l">Vendredi 10 h, ça vous va ?</span>
                <span className="bub2 r">Parfait, à vendredi !</span>
                <span className="dots3"><i /><i /><i /></span>
              </div>
            </Link>
            <Link className="bt b shine" to="/rendez-vous">
              <h3 className="disp">Rendez-vous</h3>
              <p>Propose, confirme ou reporte tes séances de parrainage.</p>
              <div className="mcal" aria-hidden="true">
                <i /><i /><i className="mid" /><i /><i /><i /><i />
                <i /><i className="hot" /><i /><i /><i className="mid" /><i /><i />
              </div>
            </Link>
            <Link className="bt c shine" to="/annuaire">
              <h3 className="disp">Annuaire</h3>
              <p>Filtre par domaine, compétence et promotion.</p>
              <div className="avatar-stack" aria-hidden="true">
                <span className="av" style={{ background: "#0B7A3B" }}>NB</span>
                <span className="av" style={{ background: "#3A4FA3" }}>SM</span>
                <span className="av" style={{ background: "#7A2E5C" }}>YM</span>
                <span className="av avatar-more">+</span>
              </div>
            </Link>
            <Link className="bt d shine" to="/fil" aria-label="Découvrir le fil de la communauté">
              <Heart className="ic l bento-heart" aria-hidden="true" />
              <b className="disp">Fil</b>
            </Link>
            <Link className="bt e shine" to="/offres">
              <h3 className="disp">Offres et stages</h3>
              <p>Des opportunités relayées par les Aînés de la communauté.</p>
              <div className="offer-tags"><span className="badge">Stage</span><span className="badge">Alternance</span><span className="badge">Emploi</span><span className="badge">Mission</span></div>
            </Link>
            <article className="bt f shine">
              <h3 className="disp">Notifications et modération</h3>
              <p>Reste informé et contribue à garder la communauté bienveillante grâce aux signalements.</p>
              <Bell className="ic l bento-bell" aria-hidden="true" />
            </article>
          </div>
        </div>
      </section>

      <section className="sc2 paper" id="evenements">
        <div className="wrap">
          <p className="eyebrow">Événements et opportunités</p>
          <PlatformRail />
          <div className="platform-tickets">
            <Link className="ticket" to="/offres"><span className="badge info">Stages</span><span><b>Découvrir les stages</b><span className="hint">Parcours et premières expériences</span></span><ArrowRight className="ic" aria-hidden="true" /></Link>
            <Link className="ticket" to="/offres"><span className="badge pri">Alternance</span><span><b>Préparer la suite</b><span className="hint">Des opportunités relayées par le réseau</span></span><ArrowRight className="ic" aria-hidden="true" /></Link>
            <Link className="ticket" to="/offres"><span className="badge ok">Emploi</span><span><b>Faire grandir son parcours</b><span className="hint">Emplois, missions et conseils</span></span><ArrowRight className="ic" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="sc2 final-section">
        <div className="wrap">
          <div className="cta3">
            <h2 className="disp">Prêt·e à rejoindre la <span className="serif cta-highlight">prochaine</span> promo ?</h2>
            <div className="ctas">
              <Link className="btn acc" to="/inscription">Créer mon compte <ArrowRight className="ic s" aria-hidden="true" /></Link>
              <Link className="btn cta-login" to="/connexion">J’ai déjà un compte</Link>
            </div>
            <svg className="campus-s" viewBox="0 0 1200 170" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 120 Q300 60 600 110 T1200 90 V170 H0z" fill="#075B2B" />
              <g fill="#0A4D2A"><rect x="500" y="80" width="200" height="90" /><polygon points="490,80 600,36 710,80" /></g>
              <g fill="#FFCB05"><circle cx="1060" cy="50" r="34" /></g>
              <g fill="#0A4D2A"><circle cx="120" cy="108" r="40" /><circle cx="190" cy="124" r="32" /><circle cx="990" cy="116" r="38" /></g>
            </svg>
          </div>
        </div>
      </section>
    </div>
  );
}
