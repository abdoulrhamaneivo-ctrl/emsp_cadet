import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

const r = (p) => fileURLToPath(new URL(p, import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": r("./src"),
      "@app": r("./src/app"),
      "@features": r("./src/features"),
      "@layout": r("./src/layout"),
      "@shared": r("./src/shared"),
    },
  },
  server: {
    port: 5200,
    strictPort: true,
    // Bascule T3b (doc 21 §9) : proxy même origine vers le backend Django.
    // Actif en dev seulement — sans lui, définir VITE_API_URL/VITE_WS_URL directs.
    proxy: {
      "/api": "http://localhost:8000",
      "/ws": { target: "ws://localhost:8000", ws: true },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/shared/test/setup.js",
    css: false,
  },
});
