import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { messagerieApi } from "../api";
import { useWebSocketChat } from "./useWebSocketChat";
import { useAuth } from "@app/providers/Auth";

const creeCle = () =>
  (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`);

/**
 * Fil de messages (doc 08 §2/§5) : query paginée par curseur + mutation
 * OPTIMISTE idempotente — la bulle apparaît instantanément (état « en cours »),
 * le remplacement par la réponse serveur se fait par idempotencyKey : zéro
 * doublon même en retry réseau (critère d'acceptation n°2 doc 08 §8).
 *
 * Temps réel doc 08 §2 complet : message.new, typing, presence, message.lu —
 * plus file d'envois rejouée à la reconnexion (mêmes idempotencyKeys) et
 * toast cliquable pour un message.new d'une AUTRE conversation.
 */
export function useMessages(conversationId) {
  const client = useQueryClient();
  const naviguer = useNavigate();
  const { user } = useAuth();
  const monId = user?.id;
  const [brouillon, setBrouillon] = useState("");
  const [etatTyping, setEtatTyping] = useState(null); // {utilisateurId, actif}
  const [presence, setPresence] = useState(null); // bool|null (interlocuteur privé)
  const [luJusqua, setLuJusqua] = useState(null); // {parUserId, jusquaMessageId}
  const clesLocales = useRef(new Map()); // idempotencyKey → contenu optimiste
  const fileAttente = useRef([]); // envois en échec → rejoués à la reconnexion

  const requete = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => messagerieApi.messages(conversationId),
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
        auteurId: monId,
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
    onError: (erreur, variables) => {
      // Échec (réseau) : bulle « echec » + mise en file — rejouée à la
      // reconnexion avec la MÊME idempotencyKey (zéro doublon, doc 08 §5).
      fileAttente.current.push(variables);
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

  const { envoyerBrut, etatConnexion } = useWebSocketChat({
    conversationId,
    surEvenement: (evenement) => {
      switch (evenement.type) {
        case "message.new": {
          if (evenement.conversationId !== conversationId) {
            client.invalidateQueries({ queryKey: ["conversations"] });
            toast("Nouveau message reçu", {
              description: evenement.message?.contenu?.slice(0, 80),
              action: {
                label: "Ouvrir",
                onClick: () => naviguer(`/messagerie/${evenement.conversationId}`),
              },
            });
            return;
          }
          const message = evenement.message;
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
          break;
        }
        case "typing":
          if (evenement.utilisateurId === monId) return; // anti-écho
          if (evenement.conversationId === conversationId) {
            setEtatTyping({ utilisateurId: evenement.utilisateurId, actif: evenement.etat });
          }
          break;
        case "presence":
          if (evenement.utilisateurId === monId) return; // anti-écho
          if (evenement.conversationId === conversationId) {
            setPresence(evenement.enLigne);
          }
          break;
        case "message.lu":
          if (evenement.parUserId === monId) return; // anti-écho
          if (evenement.conversationId === conversationId) {
            setLuJusqua((ancien) => ({
              parUserId: evenement.parUserId,
              jusquaMessageId: Math.max(ancien?.jusquaMessageId ?? 0, evenement.jusquaMessageId),
            }));
          }
          break;
        default:
          break;
      }
    },
  });

  // Join à chaque ouverture de conversation (le connect initial ne couvre que
  // la première — navigation list↔conversation comprise).
  useEffect(() => {
    if (conversationId) envoyerBrut({ type: "join", conversationId });
  }, [conversationId, envoyerBrut]);

  // Retour du lien WS → rejouer la file d'envois (idempotence garantie).
  const etatPrecedent = useRef(etatConnexion);
  useEffect(() => {
    if (etatPrecedent.current === "reconnexion" && etatConnexion === "connecte") {
      const aRejouer = fileAttente.current;
      fileAttente.current = [];
      for (const envoi of aRejouer) mutation.mutate(envoi);
    }
    etatPrecedent.current = etatConnexion;
  }, [etatConnexion, mutation]);

  const envoyer = useCallback(() => {
    const contenu = brouillon.trim();
    if (!contenu) return;
    setBrouillon("");
    mutation.mutate({ contenu, cle: creeCle() });
  }, [brouillon, mutation]);

  const marquerLu = useCallback(async () => {
    // Cache « plus récent d'abord » → le dernier VRAI message = premier id
    // NUMÉRIQUE de results (une bulle optimiste `optimiste-…` peut occuper la
    // tête juste après un envoi — la PATCH refuse tout id non numérique).
    const dernier = (client.getQueryData(["messages", conversationId])?.results ?? []).find(
      (m) => typeof m.id === "number",
    );
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
    envoyerBrut,
    etatConnexion,
    etatTyping,
    presence,
    luJusqua,
  };
}
