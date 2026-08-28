import { useCallback, useEffect, useRef } from "react";

/**
 * Émission « typing » throttlée (doc 08 §2 : throttle 2s).
 * - saisie active : `{etat: true}` au plus toutes les 2 s ;
 * - 2,5 s sans frappe (ou champ vidé) : `{etat: false}` une seule fois.
 */
export function useTyping(envoyerBrut, conversationId) {
  const dernierEnvoi = useRef(0);
  const minuterieFin = useRef(null);

  useEffect(() => () => clearTimeout(minuterieFin.current), []);

  return useCallback(
    (texte) => {
      if (!envoyerBrut || !conversationId) return;
      if (texte && texte.length > 0) {
        const maintenant = Date.now();
        if (maintenant - dernierEnvoi.current > 2000) {
          dernierEnvoi.current = maintenant;
          envoyerBrut({ type: "typing", conversationId, etat: true });
        }
        clearTimeout(minuterieFin.current);
        minuterieFin.current = setTimeout(() => {
          envoyerBrut({ type: "typing", conversationId, etat: false });
          dernierEnvoi.current = 0;
        }, 2500);
      } else {
        clearTimeout(minuterieFin.current);
        if (dernierEnvoi.current) {
          envoyerBrut({ type: "typing", conversationId, etat: false });
        }
        dernierEnvoi.current = 0;
      }
    },
    [envoyerBrut, conversationId],
  );
}
