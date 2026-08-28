import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "@app/providers/Theme";
import { useAuth } from "@app/providers/Auth";
import Avatar from "@shared/components/Avatar";
import { Menu, MoonIcon, SunIcon, X, Home, Users, Link2, MessageCircle, Newspaper, CalendarDays, Clock, Briefcase, UserRound, LogOut, ShieldCheck } from "lucide-react";
import menuProtege from "@/data/menu-protege.json";
import { useTotalNonLus } from "@features/messagerie/hooks/useConversations";
import { cx } from "@shared/utils/cx";

const icones = {
  home: Home,
  users: Users,
  link: Link2,
  message: MessageCircle,
  newspaper: Newspaper,
  calendar: CalendarDays,
  clock: Clock,
  briefcase: Briefcase,
  user: UserRound,
};

const iconesParTitre = Object.fromEntries(
  menuProtege.data.map((item) => [item.title, icones[item.icon]]),
);

/**
 * Navigation protégée (doc 03 §4) : sidebar vert profond desktop ≥1024px,
 * bottom-nav mobile <640px. Actif = fond gold text ink + liseré kente.
 */
export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOuvert, setMobileOuvert] = useState(false);
  const totalNonLus = useTotalNonLus();

  const deco = user ? `${user.prenom} ${user.nom}` : "Invité";

  const versProfil = () => navigate("/profil");

  const lienActif =
    "bg-[var(--emsp-gold)] text-[#16281c] font-semibold shadow-[var(--shadow-card)]";
  const lienInactif =
    "text-[var(--emsp-cream)]/85 hover:bg-white/10 hover:text-[var(--emsp-cream)]";

  const contenuLiens = (
    <ul role="list" className="flex flex-col gap-1">
      {menuProtege.data.map((item) => {
        const Icone = iconesParTitre[item.title];
        const actifOuBadge = item.link.startsWith("/messagerie") && totalNonLus > 0;
        return (
          <li key={item.id} className="list-none">
            <NavLink
              to={item.link}
              onClick={() => setMobileOuvert(false)}
              className={({ isActive }) =>
                cx(
                  "flex items-center gap-3 rounded-[var(--radius-chip)] px-3.5 py-2.5 text-sm transition-colors",
                  isActive || actifOuBadge ? lienActif : lienInactif,
                )
              }
            >
              {Icone && <Icone size={17} aria-hidden="true" />}
              {item.title}
              {item.link.startsWith("/messagerie") && totalNonLus > 0 && (
                <span
                  className={cx(
                    "ml-auto inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
                    "bg-[#16281c] text-[var(--emsp-gold)]",
                  )}
                >
                  {totalNonLus > 99 ? "99+" : totalNonLus}
                </span>
              )}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );

  const blocCompte = (
    <div className="border-t border-white/10 p-4">
      <button
        type="button"
        onClick={versProfil}
        className="flex w-full items-center gap-3 rounded-[var(--radius-chip)] px-2 py-2 text-left hover:bg-white/10"
      >
        <Avatar prenom={user?.prenom ?? ""} nom={user?.nom ?? ""} id={user?.id} size="sm" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-[var(--emsp-cream)]">{deco}</span>
          <span className="block truncate text-xs text-[var(--emsp-cream)]/90">{user?.classe ?? "—"}</span>
        </span>
      </button>
      <div className="mt-2 flex gap-2">
        {user?.isAdmin && (
          <NavLink
            to="/administration"
            className={({ isActive }) =>
              cx(
                "flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-chip)] border border-white/20 px-3 py-2 text-xs font-semibold",
                isActive ? "bg-[var(--emsp-gold)] text-[#16281c]" : "text-[var(--emsp-cream)] hover:bg-white/10",
              )
            }
          >
            <ShieldCheck size={15} aria-hidden="true" /> Admin
          </NavLink>
        )}
        <button
          type="button"
          onClick={async () => {
            try {
              await logout();
            } finally {
              navigate("/connexion");
            }
          }}
          className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-chip)] border border-white/20 px-3 py-2 text-xs font-semibold text-[var(--emsp-cream)] hover:bg-white/10"
        >
          <LogOut size={15} aria-hidden="true" /> Quitter
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-[var(--radius-chip)] border border-white/20 px-2.5 text-[var(--emsp-cream)] hover:bg-white/10"
          aria-label={theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre"}
        >
          {theme === "dark" ? <SunIcon size={15} aria-hidden="true" /> : <MoonIcon size={15} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <a href="#main" className="skip-link">
        Aller au contenu principal
      </a>

      {/* ===== Sidebar desktop ===== */}
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col bg-[var(--emsp-green-deep)] lg:flex"
        aria-label="Navigation principale"
      >
        <div className="kente-band" />
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--emsp-gold)] font-mono text-sm font-bold text-[#16281c]">
            EC
            </span>
          <span className="font-bold text-lg text-[var(--emsp-cream)]">
            EMSP<span className="text-[var(--emsp-gold)]">Connect</span>
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2">{contenuLiens}</nav>
        {blocCompte}
      </aside>

      {/* ===== Drawer mobile ===== */}
      <button
        type="button"
        onClick={() => setMobileOuvert(false)}
        aria-hidden="true"
        tabIndex={-1}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
          mobileOuvert ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        id="nav-mobile"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85%] flex-col bg-[var(--emsp-green-deep)] transition-transform duration-300 ease-out lg:hidden ${
          mobileOuvert ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
      >
        <div className="kente-band" />
        <div className="flex items-center justify-between px-5 py-4">
          <span className="font-bold text-lg text-[var(--emsp-cream)]">
            EMSP<span className="text-[var(--emsp-gold)]">Connect</span>
          </span>
          <button
            type="button"
            onClick={() => setMobileOuvert(false)}
            className="rounded-lg border border-white/20 p-1.5 text-[var(--emsp-cream)]"
            aria-label="Fermer le menu"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2">{contenuLiens}</nav>
        {blocCompte}
      </aside>

      {/* ===== Bottom-nav mobile (jusqu'à 1023px — la sidebar prend le relais à ≥1024px) ===== */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[var(--emsp-green-deep)] lg:hidden"
        aria-label="Navigation mobile"
      >
        <ul role="list" className="flex items-stretch justify-around">
          {menuProtege.data.slice(0, 5).map((item) => {
            const Icone = iconesParTitre[item.title];
            return (
              <li key={item.id} className="list-none flex-1">
                <NavLink
                  to={item.link}
                  className={({ isActive }) =>
                    cx(
                      "relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium",
                      isActive ? "text-[var(--emsp-gold)]" : "text-[var(--emsp-cream)]/85",
                    )
                  }
                >
                  {Icone && <Icone size={19} aria-hidden="true" />}
                  {item.title}
                  {item.link.startsWith("/messagerie") && totalNonLus > 0 && (
                    <span
                      className="absolute right-[calc(50%-1.15rem)] top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--emsp-gold)] px-1 text-[9px] font-bold text-[#16281c] tabular-nums"
                      aria-label={`${totalNonLus} messages non lus`}
                    >
                      {totalNonLus > 99 ? "99+" : totalNonLus}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
          <li className="list-none flex-1">
            <button
              type="button"
              onClick={() => setMobileOuvert(true)}
              className="flex w-full flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium text-[var(--emsp-cream)]/85"
            >
              <Menu size={19} aria-hidden="true" />
              Plus
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
