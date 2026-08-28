import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messagerieApi } from "../api";

/** Liste des conversations (doc 08 §4) — clé ["conversations"], source du badge. */
export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: messagerieApi.conversations,
  });
}

/** Total de messages non lus — alimente badge sidebar + nav (doc 08 §8 n°4). */
export function useTotalNonLus() {
  const { data } = useConversations();
  return (data?.results ?? []).reduce((total, c) => total + (c.nonLus || 0), 0);
}

/** Toast « nouveau message hors page ouverte » (doc 08 §5) — invalidate au passage. */
export function useToastNouveauMessage(horsConversationId) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (evenement) => evenement,
    onMutate: (evenement) => {
      if (evenement.conversationId !== horsConversationId) {
        client.invalidateQueries({ queryKey: ["conversations"] });
      }
    },
  });
}
