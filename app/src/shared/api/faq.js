import { apiClient } from "./client";

/** IA-4 FAQ L1 (doc 17 §2) — base connaissances validée admin. */

export const faqApi = {
  async poser(question) {
    const { data } = await apiClient.post("/api/faq/", { question });
    return data; // { trouve, reponse, sources, score }
  },
};