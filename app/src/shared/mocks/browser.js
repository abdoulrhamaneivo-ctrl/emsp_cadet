import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

/** Worker MSW — démarre dans main.jsx quand VITE_ENABLE_MOCKS=1. */
export const worker = setupWorker(...handlers);
