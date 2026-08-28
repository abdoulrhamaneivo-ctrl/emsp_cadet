import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { filApi } from "../api";

/** Clés query (doc 09 §2) : ["publications", filtres], ["commentaires", pubId]. */

export function usePublications({ type } = {}) {
  return useInfiniteQuery({
    queryKey: ["publications", type ?? "tous"],
    queryFn: ({ pageParam }) => filApi.publications({ type, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (derniere, toutes) =>
      toutes.reduce((total, p) => total + p.results.length, 0) < derniere.count
        ? toutes.length + 1
        : undefined,
  });
}

export function useQuestionsRestantes() {
  return useQuery({
    queryKey: ["questions-restantes"],
    queryFn: filApi.questionsRestantes,
  });
}

export function useCommentaires(publicationId, actif) {
  return useQuery({
    queryKey: ["commentaires", publicationId],
    queryFn: () => filApi.commentaires(publicationId),
    enabled: Boolean(actif && publicationId),
  });
}

export function useInvaliderFil() {
  const client = useQueryClient();
  return () => {
    client.invalidateQueries({ queryKey: ["publications"] });
    client.invalidateQueries({ queryKey: ["commentaires"] });
    client.invalidateQueries({ queryKey: ["questions-restantes"] });
  };
}
