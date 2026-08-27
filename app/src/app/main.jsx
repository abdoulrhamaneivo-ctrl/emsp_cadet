import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import "@/styles/index.css";
import App from "./App";

async function demarrer() {
  // MSW en dev tant que le backend n'existe pas (doc 19) — VITE_ENABLE_MOCKS=1
  if (import.meta.env.VITE_ENABLE_MOCKS === "1") {
    const { worker } = await import("@shared/mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <BrowserRouter>
        <App />
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </StrictMode>,
  );
}

demarrer();
