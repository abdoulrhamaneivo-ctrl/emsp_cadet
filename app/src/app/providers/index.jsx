import { ThemeProvider } from "./Theme";
import { AuthProvider } from "./Auth";
import { QueryProvider } from "./Query";
import { MuiProvider } from "./Mui";
import { MotionConfig } from "framer-motion";

/**
 * Ordre contractuel des providers (doc 01 §1.3).
 * Theme en premier (pose html.dark avant paint), Mui englobe tout le reste.
 */
export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <MuiProvider>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </MuiProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
