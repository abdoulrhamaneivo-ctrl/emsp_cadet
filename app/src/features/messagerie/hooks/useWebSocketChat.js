/**
 * useWebSocketChat (doc 08 §2) — connexion WS unique pour toute la session.
 *
 * T3a : si VITE_WS_URL est défini, WS réel (contrat exact : join, message.new,
 * message.lu, typing, presence) ; sinon simulateur branché sur le store MSW
 * (abonnerWS) — les mêmes événements, livrés en in-process. T3b branchera
 * Channels sans toucher aux composants : seul ce fichier connaît le transport.
 */

import { useEffect, useRef } from "react";
import { abonnerWS } from "@shared/mocks/store-t3.js";

const SIMULATEUR = !import.meta.env.VITE_WS_URL;

export function useWebSocketChat({ conversationId, surEvenement }) {
  const refCallback = useRef(surEvenement);
  refCallback.current = surEvenement;
  const refConv = useRef(conversationId);
  refConv.current = conversationId;

  useEffect(() => {
    let annule = false;
    let desabonnerSimulateur = null;
    let socket = null;
    let delaiReconnexion = 1000;

    const distribuer = (evenement) => {
      if (!annule) refCallback.current?.(evenement);
    };

    const connecter = () => {
      if (annule) return;

      if (SIMULATEUR) {
        // Mode démo : les mutations MSW publient déjà via publierWS —
        // pour l'instant on s'abonne au bus interne uniquement.
        desabonnerSimulateur = abonnerWS(distribuer);
        return;
      }

      // WS réel (T3b) — même contrat d'événements
      socket = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws/chat/?token=${sessionStorage.getItem("jwt") ?? ""}`);
      socket.onopen = () => {
        if (refConv.current) {
          socket.send(JSON.stringify({ type: "join", conversationId: refConv.current }));
        }
      };
      socket.onmessage = (e) => distribuer(JSON.parse(e.data));
      socket.onclose = () => {
        if (annule) return;
        setTimeout(connecter, delaiReconnexion);
        delaiReconnexion = Math.min(delaiReconnexion * 2, 30000); // expo 1s → 30s
      };
    };

    connecter();
    return () => {
      annule = true;
      desabonnerSimulateur?.();
      socket?.close();
    };
  }, []);
}
