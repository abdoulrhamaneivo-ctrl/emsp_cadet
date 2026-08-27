import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import menuItems from "@/data/menu.json";
import { useTheme } from "@app/providers/Theme";
import { Menu, MoonIcon, SunIcon, X } from "lucide-react";

/**
 * NavBar publique — ADAPTÉE du template cillaux (structure, drawer,
 * gestion du focus, Escape et scroll-lock préservés à l'identique).
 * Changements : marque EMSP Connect, liens depuis menu.json, CTA connexion.
 */
export default function NavBar() {
  const { theme, toggleTheme } = useTheme();

  // MOBILE MENU (logique template conservée)
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleBtnRef = useRef(null);
  const drawerRef = useRef(null);

  const closeMobile = () => setMobileOpen(false);
  const toggleMobile = () => setMobileOpen((o) => !o);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) {
      toggleBtnRef.current?.focus();
      return;
    }
    drawerRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMobile();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const menuData = menuItems.data;

  return (
    <>
      {/* Skip link (pattern template) */}
      <a href="#main" className="skip-link">
        Aller au contenu principal
      </a>

      <header
        className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#143524]"
        aria-label="En-tête du site"
      >
        <div className="mx-auto w-full max-w-7xl px-5 lg:px-10">
          <nav className="flex items-center justify-between py-3.5" aria-label="Navigation principale">
            {/* Marque */}
            <div className="flex items-center gap-2.5">
              <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--emsp-gold)] font-mono text-sm font-bold text-[#16281c]">
                EC
              </span>
              <Link
                to="/"
                className="font-bold text-lg text-[var(--emsp-cream)]"
                onClick={closeMobile}
              >
                EMSP<span className="text-[var(--emsp-gold)]">Connect</span>
              </Link>
            </div>

            {/* Menu desktop */}
            <ul className="hidden lg:flex lg:flex-row gap-1 text-sm font-medium text-[var(--emsp-cream)]/80" role="list">
              {menuData.map((item) => (
                <li key={item.id} className="list-none">
                  <Link
                    to={item.link}
                    className="flex gap-2 items-center px-4 py-2 rounded-[var(--radius-chip)] hover:bg-white/10 hover:text-[var(--emsp-cream)]"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Actions desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-[var(--radius-chip)] border border-white/20 py-1.5 px-2 text-sm text-[var(--emsp-cream)] hover:bg-white/10"
                aria-label={theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre"}
              >
                {theme === "dark" ? <SunIcon size={16} aria-hidden="true" /> : <MoonIcon size={16} aria-hidden="true" />}
              </button>
              <Link
                to="/connexion"
                className="inline-flex items-center rounded-[var(--radius-chip)] bg-[var(--emsp-gold)] px-4 py-2 text-sm font-semibold text-[#16281c] hover:bg-[var(--emsp-gold-bright)]"
              >
                Connexion
              </Link>
            </div>

            {/* Bouton mobile */}
            <button
              ref={toggleBtnRef}
              type="button"
              onClick={toggleMobile}
              className="lg:hidden rounded-lg border border-white/20 py-1.5 px-3 text-sm text-[var(--emsp-cream)]"
              aria-controls="menu-mobile"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {mobileOpen ? <X strokeWidth={1.5} /> : <Menu strokeWidth={1.5} />}
            </button>
          </nav>
        </div>
      </header>

      {/* Toile (présentational) */}
      <button
        type="button"
        onClick={closeMobile}
        aria-hidden="true"
        tabIndex={-1}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Tiroir mobile */}
      <aside
        id="menu-mobile"
        ref={drawerRef}
        tabIndex={-1}
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85%] lg:hidden
                    bg-[var(--bg-panel)] border-r border-[var(--border-soft)]
                    transition-transform duration-300 ease-out
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-menu-mobile"
      >
        <div className="kente-band rounded-t-none" />
        <div className="px-5 pt-4 pb-3 border-b border-[var(--border-soft)]">
          <Link to="/" id="titre-menu-mobile" className="font-bold text-xl text-[var(--text-primary)]" onClick={closeMobile}>
            EMSP<span className="text-[var(--accent-green)]">Connect</span>
          </Link>
        </div>

        <nav className="px-3 py-4" aria-label="Menu mobile">
          <ul className="flex flex-col gap-1.5 text-base font-medium text-[var(--text-primary)]" role="list">
            {menuData.map((item) => (
              <li key={item.id} className="list-none">
                <Link
                  to={item.link}
                  onClick={closeMobile}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-chip)] hover:bg-[var(--hover-bg)]"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--border-soft)] p-4">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center gap-2 rounded-[var(--radius-chip)] border border-[var(--border-soft)] py-3 px-3 text-sm text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
            aria-label={theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre"}
          >
            {theme === "dark" ? <SunIcon size={18} aria-hidden="true" /> : <MoonIcon size={18} aria-hidden="true" />}
            <span>{theme === "dark" ? "Mode clair" : "Mode sombre"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
