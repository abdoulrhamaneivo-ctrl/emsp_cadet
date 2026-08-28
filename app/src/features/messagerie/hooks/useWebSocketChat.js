/**
 * useWebSocketChat (doc 08 §2) — connexion WS unique pour toute la session.
 *
 * Transport (seul ce fichier le connaît) : simulateur si les mocks MSW sont
 * actifs (le backend simulé publie dans le store in-process) ou si VITE_WS_URL
 * est absent. Sinon WS réel — valeur vide = same-origin via le proxy Vite
 * (doc 21 §9). Le token JWT en query est un best effort ; en mode proxy, le
 * cookie httpOnly Path=/ sert d'identité.
 */

import { useEffect, useRef } from "react";
import { abonnerWS } from "@shared/mocks/store-t3.js";

const SIMULATEUR =
  import.meta.env.VITE_ENABLE_MOCKS === "1" || import.meta.env.VITE_WS_URL === undefined;

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
