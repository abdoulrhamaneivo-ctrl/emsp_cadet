import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import menuItems from "../data/menu.json";
import Button from "./Button";
import { Menu, MoonIcon, SunIcon, X } from "lucide-react";

export default function NavBar() {
  // THEME
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // MOBILE MENU
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleBtnRef = useRef(null);
  const drawerRef = useRef(null);

  const openMobile = () => setMobileOpen(true);
  const closeMobile = () => setMobileOpen(false);
  const toggleMobile = () => setMobileOpen((o) => !o);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Focus management & Esc to close for dialog
  useEffect(() => {
    if (!mobileOpen) {
      // return focus to toggle button
      toggleBtnRef.current?.focus();
      return;
    }
    // move focus into the drawer
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
      {/* Skip link for keyboard users */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-white focus:text-black focus:px-3 focus:py-2 rounded"
      >
        Skip to content
      </a>

      <header
        className="fixed inset-x-0 top-0 z-50 bg-white dark:bg-neutral-900/95 backdrop-blur border-b border-gray-300 dark:border-neutral-700"
        aria-label="Site header"
      >
        <div className="mx-auto w-full max-w-7xl px-5 lg:px-10">
          <nav
            className="flex items-center justify-between py-4 lg:py-2"
            aria-label="Primary"
          >
            {/* Brand */}
            <div>
              <Link
                to="/"
                className="font-bold text-xl text-gray-900 dark:text-gray-100"
                onClick={closeMobile}
              >
                Priscy<span className="text-blue-500">Designs</span>
              </Link>
            </div>

            {/* Desktop menu */}
            <ul
              className="hidden lg:flex lg:flex-row gap-2 text-md font-medium text-gray-600 dark:text-gray-300"
              role="list"
            >
              {menuData.map((item) => (
                <li key={item.id} className="list-none">
                  <Link
                    to={item.link}
                    className="flex gap-2 items-center px-4 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-neutral-800"
                  >
                    <img
                      src={item.image}
                      alt="" /* decorative icon */
                      aria-hidden="true"
                      className="w-5 h-5"
                    />
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-8">
              <button
                type="button"
                onClick={toggleTheme}
                className="border border-gray-300 dark:border-neutral-700 rounded-lg py-1 px-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800"
                aria-label={`Switch to ${
                  theme === "dark" ? "light" : "dark"
                } mode`}
              >
                {theme === "dark" ? (
                  <SunIcon aria-hidden="true" />
                ) : (
                  <MoonIcon aria-hidden="true" />
                )}
              </button>
              <Button
                title="Let's Talk"
                bgColor="bg-black dark:bg-blue-600"
                hoverBgColor="hover:bg-blue-500 dark:hover:bg-blue-500"
              />
            </div>

            {/* Mobile toggle */}
            <button
              ref={toggleBtnRef}
              type="button"
              onClick={toggleMobile}
              className="lg:hidden border border-gray-300 dark:border-neutral-700 rounded-lg py-1 px-3 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-neutral-900"
              aria-controls="mobile-drawer"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <X strokeWidth={0.75} />
              ) : (
                <Menu strokeWidth={1.25} />
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Backdrop (presentational) */}
      <button
        type="button"
        onClick={closeMobile}
        aria-hidden="true"
        tabIndex={-1}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Mobile Drawer */}
      <aside
        id="mobile-drawer"
        ref={drawerRef}
        tabIndex={-1}
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85%] lg:hidden
                    bg-white dark:bg-neutral-900 border-r border-gray-300 dark:border-neutral-800
                    transition-transform duration-300 ease-out
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-title"
      >
        {/* Top: Brand */}
        <div className="px-5 pt-4 pb-3 border-b border-gray-200 dark:border-neutral-800">
          <Link
            to="/"
            className="font-bold text-2xl text-gray-900 dark:text-gray-100"
            id="mobile-title"
            onClick={closeMobile}
          >
            Priscy<span className="text-blue-500">Designs</span>
          </Link>
        </div>

        {/* Middle: Menu items */}
        <nav className="px-3 py-4" aria-label="Mobile menu">
          <ul
            className="flex flex-col gap-2 text-lg font-medium text-gray-700 dark:text-gray-300"
            role="list"
          >
            {menuData.map((item) => (
              <li key={item.id} className="list-none">
                <Link
                  to={item.link}
                  onClick={closeMobile}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
                >
                  <img
                    src={item.image}
                    alt=""
                    aria-hidden="true"
                    className="w-5 h-5"
                  />
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom: Actions */}
        <div className="mt-auto absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-neutral-800 p-4 flex flex-col justify-between gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-2 border border-gray-300 dark:border-neutral-700 rounded-lg py-4 px-3 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <SunIcon size={18} aria-hidden="true" />
            ) : (
              <MoonIcon size={18} aria-hidden="true" />
            )}
            <span>
              {theme === "dark"
                ? "Switch to Light Mode"
                : "Switch to Dark Mode"}
            </span>
          </button>

          <Button
            title="Let's Talk"
            bgColor="bg-black dark:bg-blue-600"
            hoverBgColor="hover:bg-blue-500 dark:hover:bg-blue-500"
          />
        </div>
      </aside>
    </>
  );
}
