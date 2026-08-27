import { ThemeProvider } from "./Theme";
import { AuthProvider } from "./Auth";
import { QueryProvider } from "./Query";
import { MuiProvider } from "./Mui";

/**
 * Ordre contractuel des providers (doc 01 §1.3).
 * Theme en premier (pose html.dark avant paint), Mui englobe tout le reste.
 */
export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <MuiProvider>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </MuiProvider>
    </ThemeProvider>
  );
}
