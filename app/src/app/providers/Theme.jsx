import { createContext, useContext, useLayoutEffect, useState } from "react";

const ThemeContext = createContext(null);

/**
 * Fournit { theme, toggleTheme } et pose la classe `html.dark`
 * AVANT le paint (useLayoutEffect — pas de flash clair en dark).
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const stocke = localStorage.getItem("theme");
    if (stocke === "light" || stocke === "dark") return stocke;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useLayoutEffect(() => {
    const racine = document.documentElement;
    if (theme === "dark") racine.classList.add("dark");
    else racine.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme doit être utilisé dans <ThemeProvider>");
  return ctx;
}
