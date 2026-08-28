import { apiClient } from "@shared/api/client";

/** Appels REST messagerie (contrat doc 08 §2). Le temps réel vit dans useWebSocketChat. */

export const messagerieApi = {
  async conversations() {
    const { data } = await apiClient.get("/api/conversations/");
    return data;
  },
  async messages(conversationId, { avant } = {}) {
    const { data } = await apiClient.get(`/api/conversations/${conversationId}/messages/`, {
      params: avant ? { avant } : undefined,
    });
    return data; // { hasMore, cursor, results }
  },
  async envoyer(conversationId, contenu, idempotencyKey) {
    const { data } = await apiClient.post(`/api/conversations/${conversationId}/messages/`, {
      contenu,
      idempotencyKey,
    });
    return data;
  },
  async marquerLu(conversationId, dernierMessageId) {
    await apiClient.patch(`/api/conversations/${conversationId}/lu/`, { dernierMessageId });
  },
};
