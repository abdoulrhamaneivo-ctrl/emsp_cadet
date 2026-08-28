import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messagerieApi } from "../api";
import { useWebSocketChat } from "./useWebSocketChat";

const creeCle = () =>
  (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`);

/**
 * Fil de messages (doc 08 §2/§5) : query paginée par curseur + mutation
 * OPTIMISTE idempotente — la bulle apparaît instantanément (état « en cours »),
 * le remplacement par la réponse serveur se fait par idempotencyKey : zéro
 * doublon même en retry réseau (critère d'acceptation n°2 doc 08 §8).
 */
export function useMessages(conversationId) {
  const client = useQueryClient();
  const [brouillon, setBrouillon] = useState("");
  const clesLocales = useRef(new Map()); // idempotencyKey → contenu optimiste

  const requete = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => messagerieApi.messages(conversationId),
  });

  // Temps réel : un message.new pour CETTE conversation s'ajoute au cache
  useWebSocketChat({
    conversationId,
    surEvenement: (evenement) => {
      if (evenement.type !== "message.new") return;
      if (evenement.conversationId !== conversationId) {
        client.invalidateQueries({ queryKey: ["conversations"] });
        return;
      }
      const message = evenement.message;
      // Si c'était un optimiste local, la vraie réponse le remplacera via
      // setQueryData du mutation onSuccess — on évite juste le doublon par clé.
      client.setQueryData(["messages", conversationId], (ancien) => {
        if (!ancien) return ancien;
        if (ancien.results.some((m) => m.id === message.id)) return ancien;
        if (
          message.idempotencyKey &&
          ancien.results.some((m) => m.idempotencyKey === message.idempotencyKey)
        ) {
          return ancien;
        }
        // Cache « plus récent d'abord » → prepend
        return { ...ancien, results: [message, ...ancien.results] };
      });
    },
  });

  const mutation = useMutation({
    mutationFn: ({ contenu, cle }) => messagerieApi.envoyer(conversationId, contenu, cle),
    onMutate: async ({ contenu, cle }) => {
      await client.cancelQueries({ queryKey: ["messages", conversationId] });
      const optimiste = {
        id: `optimiste-${cle}`,
        idempotencyKey: cle,
        contenu,
        dateEnvoi: new Date().toISOString(),
        auteurId: 1,
        envoyeParMoi: true,
        etat: "en_cours",
      };
      clesLocales.current.set(cle, optimiste);
      // Cache « plus récent d'abord » → prepend (le plus récent reste en tête)
      client.setQueryData(["messages", conversationId], (ancien) =>
        ancien ? { ...ancien, results: [optimiste, ...ancien.results] } : ancien,
      );
    },
    onSuccess: (message) => {
      client.setQueryData(["messages", conversationId], (ancien) => {
        if (!ancien) return ancien;
        const sansOptimiste = ancien.results.filter(
          (m) => m.idempotencyKey !== message.idempotencyKey,
        );
        if (sansOptimiste.some((m) => m.id === message.id)) return ancien;
        // Cache « plus récent d'abord » → prepend du message confirmé
        return { ...ancien, results: [message, ...sansOptimiste] };
      });
      client.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: () => {
      // Échec : l'optimiste passe en état « echec » (icône alerte, clic = renvoyer)
      client.setQueryData(["messages", conversationId], (ancien) => {
        if (!ancien) return ancien;
        return {
          ...ancien,
          results: ancien.results.map((m) =>
            m.etat === "en_cours" ? { ...m, etat: "echec" } : m,
          ),
        };
      });
    },
  });

  const envoyer = useCallback(() => {
    const contenu = brouillon.trim();
    if (!contenu) return;
    setBrouillon("");
    mutation.mutate({ contenu, cle: creeCle() });
  }, [brouillon, mutation]);

  const marquerLu = useCallback(async () => {
    // Cache « plus récent d'abord » → le dernier VRAI message = results[0].
    // (at(-1) renvoyait le plus ancien : le serveur marquait lu le mauvais message.)
    const dernier = client.getQueryData(["messages", conversationId])?.results?.[0];
    if (!dernier) return;
    try {
      await messagerieApi.marquerLu(conversationId, dernier.id);
    } catch {
      // échec réseau : on rafraîchit quand même le badge
    } finally {
      // Accusé de lecture pris en compte → badge sidebar/liste à 0 (doc 08 §8 n°4)
      client.invalidateQueries({ queryKey: ["conversations"] });
    }
  }, [client, conversationId]);

  // Ouverture conversation → accusé de lecture immédiat (badge à 0 partout)
  useEffect(() => {
    if (requete.data?.results?.length) marquerLu();
  }, [requete.data?.results?.length, marquerLu]);

  const chargerAnciens = useCallback(async () => {
    const page = client.getQueryData(["messages", conversationId]);
    if (!page?.hasMore || !page.cursor) return;
    const suite = await messagerieApi.messages(conversationId, { avant: page.cursor });
    client.setQueryData(["messages", conversationId], (ancien) =>
      ancien
        ? {
            hasMore: suite.hasMore,
            cursor: suite.cursor,
            results: [...suite.results, ...ancien.results],
          }
        : suite,
    );
  }, [client, conversationId]);

  return {
    messages: requete.data?.results ?? [],
    hasMore: requete.data?.hasMore ?? false,
    chargement: requete.isLoading,
    brouillon,
    setBrouillon,
    envoyer,
    chargerAnciens,
  };
}
