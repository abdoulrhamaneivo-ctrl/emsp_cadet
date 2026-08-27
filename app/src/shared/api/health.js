import { apiClient } from "./client";

/** Healthcheck (doc 20 P08) — sert aussi de sonde de connectivité. */
export const healthApi = {
  verifier: async () => (await apiClient.get("/api/health/")).data,
};
