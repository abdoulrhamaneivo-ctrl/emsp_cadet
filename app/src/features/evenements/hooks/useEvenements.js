import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { evenementsApi } from "../api";

/** Clés query (doc 10 §2) : ["evenements", scope], ["evenement", id], ["discussion", id], ["participants", id]. */

export function useEvenements(scope = "a_venir") {
  return useQuery({
    queryKey: ["evenements", scope],
    queryFn: () => evenementsApi.liste({ scope }),
  });
}

export function useEvenement(id) {
  return useQuery({
    queryKey: ["evenement", id],
    queryFn: () => evenementsApi.detail(id),
    enabled: Boolean(id),
  });
}

export function useDiscussion(id, ouverte = true) {
  return useQuery({
    queryKey: ["discussion", id],
    queryFn: () => evenementsApi.messages(id),
    enabled: Boolean(id && ouverte),
  });
}

export function useParticipants(id, ouverte = true) {
  return useQuery({
    queryKey: ["participants", id],
    queryFn: () => evenementsApi.participants(id),
    enabled: Boolean(id && ouverte),
  });
}

/** Invalidation de TOUT l'espace événements (détail, listes, participants). */
export function useInvaliderEvenement(id) {
  const client = useQueryClient();
  return () => {
    client.invalidateQueries({ queryKey: ["evenements"] });
    if (id) {
      client.invalidateQueries({ queryKey: ["evenement", id] });
      client.invalidateQueries({ queryKey: ["discussion", id] });
      client.invalidateQueries({ queryKey: ["participants", id] });
    }
  };
}

export function useToggleInscription(id) {
  const invalider = useInvaliderEvenement(id);
  return useMutation({
    mutationFn: () => evenementsApi.toggleInscription(id),
    onSuccess: (donnees) => {
      invalider();
      toast.success(donnees?.inscrit ? "Inscription confirmée." : "Tu es désinscrit.");
    },
    onError: (e) => {
      toast.error(e?.response?.data?.detail ?? "Action impossible pour le moment.");
    },
  });
}
