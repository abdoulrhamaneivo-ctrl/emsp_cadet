import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { muiTheme } from "./muiTheme";

/** Habillage MUI aux tokens EMSP (doc 03 §5) — thème unique, jamais alternatif. */
export function MuiProvider({ children }) {
  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline enableColorScheme />
      {children}
    </MuiThemeProvider>
  );
}
