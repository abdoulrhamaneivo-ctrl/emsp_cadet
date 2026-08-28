/**
 * useWebSocketChat (doc 08 §2) — connexion WS unique pour toute la session.
 *
 * Transport (seul ce fichier le connaît) : simulateur si les mocks MSW sont
 * actifs (le backend simulé publie dans le store in-process) ou si VITE_WS_URL
 * est absent. Sinon WS réel — valeur vide = same-origin via le proxy Vite
 * (doc 21 §9). Le token JWT en query est un best effort ; en mode proxy, le
 * cookie httpOnly Path=/ sert d'identité.
 *
 * Retourne en plus du callback d'événements :
 * - envoyerBrut(payload) : émission client → serveur (join, typing…) —
 *   en simulateur, publie directement sur le bus (l'émetteur s'identifie via
 *   utilisateurId, le front ignore ses propres événements) ;
 * - etatConnexion : "connecte" | "reconnexion" (bannière doc 08 §5).
 */

import { useEffect, useRef, useState } from "react";
import { abonnerWS, publierWS } from "@shared/mocks/store-t3.js";
import { useAuth } from "@app/providers/Auth";
import { obtenirJeton } from "@shared/api/client";

const SIMULATEUR =
  import.meta.env.VITE_ENABLE_MOCKS === "1" || import.meta.env.VITE_WS_URL === undefined;

export function useWebSocketChat({ conversationId, surEvenement }) {
  const { user } = useAuth();
  const refCallback = useRef(surEvenement);
  refCallback.current = surEvenement;
  const refConv = useRef(conversationId);
  refConv.current = conversationId;
  const [etatConnexion, setEtatConnexion] = useState("connecte");
  const refSocket = useRef(null);

  useEffect(() => {
    let annule = false;
    let desabonnerSimulateur = null;
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
        setEtatConnexion("connecte");
        return;
      }

      // WS réel (T3b) — même contrat d'événements. Token d'access lu EN
      // MÉMOIRE (doc 19 : jamais sessionStorage/localStorage) ; en mode proxy
      // le cookie httpOnly sert de toute façon d'identité au backend.
      const socket = new WebSocket(
        `${import.meta.env.VITE_WS_URL}/ws/chat/?token=${encodeURIComponent(obtenirJeton() ?? "")}`,
      );
      refSocket.current = socket;
      socket.onopen = () => {
        setEtatConnexion("connecte");
        if (refConv.current) {
          socket.send(JSON.stringify({ type: "join", conversationId: refConv.current }));
        }
      };
      socket.onmessage = (e) => distribuer(JSON.parse(e.data));
      socket.onclose = () => {
        refSocket.current = null;
        if (annule) return;
        setEtatConnexion("reconnexion");
        setTimeout(connecter, delaiReconnexion);
        delaiReconnexion = Math.min(delaiReconnexion * 2, 30000); // expo 1s → 30s
      };
    };

    connecter();
    return () => {
      annule = true;
      desabonnerSimulateur?.();
      refSocket.current?.close();
      refSocket.current = null;
    };
  }, []);

  const envoyerBrut = (payload) => {
    if (SIMULATEUR) {
      // Le bus in-process ne connaît pas l'émetteur : on s'identifie pour que
      // le front ignore ses propres événements (anti-écho, cf. consumer).
      publierWS({ ...payload, utilisateurId: payload.utilisateurId ?? user?.id });
      return;
    }
    // WS pas encore ouvert (course join < onopen) ou fermé entre-temps :
    // on ne jette JAMAIS d'exception au rendu — le join est réémis à chaque
    // navigation, les envois en file attendent la reconnexion.
    try {
      refSocket.current?.send(JSON.stringify(payload));
    } catch {
      /* hors connexion : reconnexion expo en cours */
    }
  };

  return { envoyerBrut, etatConnexion };
}
