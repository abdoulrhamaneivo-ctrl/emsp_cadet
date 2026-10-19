import { createTheme } from "@mui/material/styles";

/*
 * Pont MUI ↔ tokens EMSP — source unique (doc 03 §5).
 * Interdit d'importer un thème alternatif ou des couleurs hors palette.
 */
export const muiTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: { main: "#0b7a3b", contrastText: "#ffffff" },
    secondary: { main: "#ffcb05", contrastText: "#2a1b00" },
    success: { main: "#1b7545" },
    error: { main: "#b42318" },
    warning: { main: "#b54708" },
    info: { main: "#175cd3" },
    /*
     * background.default = transparent : le fond animé (gradient vert profond)
     * est géré par styles/globals.css sur <body>, pas par MUI.
     */
    background: { paper: "#ffffff", default: "#f5f8f1" },
    text: { primary: "#0e2016", secondary: "#50625e" },
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
