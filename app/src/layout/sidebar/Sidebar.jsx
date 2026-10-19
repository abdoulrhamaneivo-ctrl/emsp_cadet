import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  Home,
  Link2,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Newspaper,
  ShieldCheck,
  Sun,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import menuProtege from "@/data/menu-protege.json";
import { useAuth } from "@app/providers/Auth";
import { useTheme } from "@app/providers/Theme";
import Avatar from "@shared/components/Avatar";
import LogoMark from "@shared/components/LogoMark";
import { useTotalNonLus } from "@features/messagerie/hooks/useConversations";

const icones = {
  home: Home,
  users: UsersRound,
  link: Link2,
  message: MessageCircle,
  newspaper: Newspaper,
  calendar: CalendarDays,
  clock: Clock3,
  briefcase: BriefcaseBusiness,
  user: UserRound,
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const unread = useTotalNonLus();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    if (!moreOpen) return undefined;
    const fermerAvecEscape = (event) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("keydown", fermerAvecEscape);
    return () => document.removeEventListener("keydown", fermerAvecEscape);
  }, [moreOpen]);

  const fermerSession = async () => {
    try {
      await logout();
    } finally {
      navigate("/connexion");
    }
  };

  const Liens = ({ mobile = false }) => (
    <nav aria-label={mobile ? "Navigation complémentaire" : "Navigation de la plateforme"}>
      {menuProtege.data.map((item) => {
        const Icon = icones[item.icon];
        return (
          <NavLink
            key={item.id}
            end={item.link === "/accueil"}
            to={item.link}
            onClick={() => setMoreOpen(false)}
            className={({ isActive }) => `ni${isActive ? " on" : ""}`}
            title={item.title}
          >
            {Icon && <Icon className="ic" size={19} aria-hidden="true" />}
            <span className="lbl">{item.title}</span>
            {item.link === "/messagerie" && unread > 0 && (
              <span className="nb" aria-label={`${unread} messages non lus`}>
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </NavLink>
        );
      })}
      {user?.isAdmin && (
        <NavLink
          to="/administration"
          onClick={() => setMoreOpen(false)}
          className={({ isActive }) => `ni${isActive ? " on" : ""}`}
        >
          <ShieldCheck className="ic" size={19} aria-hidden="true" />
          <span className="lbl">Administration</span>
        </NavLink>
      )}
    </nav>
  );

  const compte = (
    <div className="side-bot">
      <NavLink to="/profil" className="mecard" onClick={() => setMoreOpen(false)}>
        <Avatar prenom={user?.prenom ?? ""} nom={user?.nom ?? ""} id={user?.id} size="sm" />
        <span className="me-t">
          <b>{user ? `${user.prenom} ${user.nom}` : "Mon compte"}</b>
          <span className="sub">{user?.classe ?? "Profil et préférences"}</span>
        </span>
      </NavLink>
      <div className="side-actions">
        <button className="side-action" type="button" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="ic s" size={17} /> : <Moon className="ic s" size={17} />}
          <span className="lbl">{theme === "dark" ? "Thème clair" : "Thème sombre"}</span>
        </button>
        <button className="side-action" type="button" onClick={fermerSession}>
          <LogOut className="ic s" size={17} />
          <span className="lbl">Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <a href="#main" className="skip-link">Aller au contenu principal</a>
      <aside className="side" aria-label="Navigation de la plateforme">
        <div className="side-in">
          <div className="side-top">
            <NavLink to="/accueil" className="logo" aria-label="EMSP Connect, accueil">
              <LogoMark />
              <span className="logo-t">EMSP Connect</span>
            </NavLink>
          </div>
          <Liens />
          {compte}
        </div>
      </aside>

      <nav className="tabbar" aria-label="Navigation mobile">
        {menuProtege.data.slice(0, 5).map((item) => {
          const Icon = icones[item.icon];
          return (
            <NavLink key={item.id} to={item.link} end={item.link === "/accueil"} className={({ isActive }) => `tab${isActive ? " on" : ""}`}>
              {Icon && <Icon className="ic" size={19} aria-hidden="true" />}
              <span>{item.title}</span>
              {item.link === "/messagerie" && unread > 0 && <span className="dot">{unread > 9 ? "9+" : unread}</span>}
            </NavLink>
          );
        })}
        <button className={`tab${moreOpen ? " on" : ""}`} type="button" onClick={() => setMoreOpen(true)} aria-expanded={moreOpen}>
          <Menu className="ic" size={19} aria-hidden="true" />
          <span>Plus</span>
        </button>
      </nav>

      {moreOpen && (
        <>
          <button className="drawer-scrim" type="button" aria-label="Fermer le menu" onClick={() => setMoreOpen(false)} />
          <aside className="side mobile-side" role="dialog" aria-modal="true" aria-label="Menu complémentaire">
            <div className="side-in">
              <div className="side-top">
                <span className="logo"><LogoMark /><span>EMSP Connect</span></span>
                <button className="icb" type="button" onClick={() => setMoreOpen(false)} aria-label="Fermer le menu"><X className="ic" size={20} /></button>
              </div>
              <Liens mobile />
              {compte}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
