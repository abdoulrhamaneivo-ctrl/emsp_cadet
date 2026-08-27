import { createTheme } from "@mui/material/styles";

/*
 * Pont MUI ↔ tokens EMSP — source unique (doc 03 §5).
 * Interdit d'importer un thème alternatif ou des couleurs hors palette.
 */
export const muiTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: { main: "#1d4430", contrastText: "#fdfaf2" },
    secondary: { main: "#e9b517", contrastText: "#16281c" },
    success: { main: "#1a8a52" },
    error: { main: "#b42318" },
    warning: { main: "#b54708" },
    info: { main: "#175cd3" },
    /*
     * background.default = transparent : le fond animé (gradient vert profond)
     * est géré par styles/globals.css sur <body>, pas par MUI.
     */
    background: { paper: "#fdfaf2", default: "transparent" },
    text: { primary: "#16281c", secondary: "#4a5d50" },
  },
  shape: { borderRadius: 12 },
  typography: { fontFamily: "var(--font-sans), sans-serif" },
  components: {
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none", boxShadow: "var(--shadow-card)" } },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "var(--radius-panel)",
          backgroundColor: "var(--bg-panel)",
        },
      },
    },
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiTooltip: { defaultProps: { arrow: true } },
  },
});
