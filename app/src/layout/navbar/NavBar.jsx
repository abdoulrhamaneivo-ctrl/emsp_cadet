import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "@app/providers/Theme";
import LogoMark from "@shared/components/LogoMark";

const liens = [
  ["Le concept", "/#concept"],
  ["Parrainage", "/#parrainage"],
  ["Fonctionnalités", "/#fonctionnalites"],
  ["Communauté", "/#communaute"],
  ["Événements", "/#evenements"],
];

export default function NavBar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const fermer = () => setMobileOpen(false);

  return (
    <header className="ph0" aria-label="En-tête EMSP Connect">
      <div className="ph0-in">
        <Link to="/" className="logo" onClick={fermer} aria-label="EMSP Connect, accueil">
          <LogoMark />
          <span>EMSP Connect</span>
        </Link>

        <nav className="pnav" aria-label="Navigation principale">
          {liens.map(([label, href]) => <a href={href} key={label}>{label}</a>)}
        </nav>

        <div className="pacts">
          <button
            className="icb theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Activer le thème clair" : "Activer le thème sombre"}
            title={theme === "dark" ? "Thème clair" : "Thème sombre"}
          >
            {theme === "dark" ? <Sun className="ic" size={19} /> : <Moon className="ic" size={19} />}
          </button>
          <Link className="btn" to="/connexion">Connexion</Link>
          <Link className="btn pri" to="/inscription">Créer un compte</Link>
        </div>

        <button
          className="icb burger"
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="menu-public-mobile"
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="ic" size={22} /> : <Menu className="ic" size={22} />}
        </button>
      </div>

      <nav id="menu-public-mobile" className={`mmenu${mobileOpen ? " open" : ""}`} aria-label="Navigation mobile">
        {liens.map(([label, href]) => <a href={href} key={label} onClick={fermer}>{label}</a>)}
        <Link to="/connexion" onClick={fermer}>Connexion</Link>
        <Link to="/inscription" onClick={fermer}>Créer un compte</Link>
      </nav>
    </header>
  );
}
