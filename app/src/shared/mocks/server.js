import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/** Serveur MSW pour Vitest (doc 19) — activé dans les tests d'intégration. */
export const server = setupServer(...handlers);
