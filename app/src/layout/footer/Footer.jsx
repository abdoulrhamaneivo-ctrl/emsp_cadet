import { Link } from "react-router-dom";
import { Link2, Mail, UsersRound } from "lucide-react";
import LogoMark from "@shared/components/LogoMark";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="foot" aria-label="Pied de page">
      <div className="wrap">
        <div className="foot-g">
          <div>
            <Link to="/" className="logo foot-logo">
              <LogoMark />
              <span>EMSP Connect</span>
            </Link>
            <p className="foot-intro">La communauté qui relie les Cadets et les Aînés de l’École Multinationale des Postes.</p>
          </div>
          <div>
            <h3>Découvrir</h3>
            <Link to="/#fonctionnalites"><Link2 className="ic s" size={15} /> La plateforme</Link>
            <Link to="/inscription"><UsersRound className="ic s" size={15} /> Rejoindre la communauté</Link>
          </div>
          <div>
            <h3>Votre espace</h3>
            <Link to="/connexion">Connexion</Link>
            <Link to="/inscription">Créer un compte</Link>
          </div>
          <div>
            <h3>Contact</h3>
            <a href="mailto:contact@emsp.int"><Mail className="ic s" size={15} /> contact@emsp.int</a>
            <span>Abidjan, Côte d’Ivoire</span>
          </div>
        </div>
        <div className="foot-bottom">© {year} EMSP Connect · École Multinationale des Postes, Abidjan</div>
      </div>
    </footer>
  );
}
