import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { annulerDemande, envoyerDemande, fetchMonParrainage, fetchParrain, fetchParrains, fetchSuggestions } from "../api";

/**
 * Hooks TanStack Query de la feature annuaire.
 * Clés contractuelles (doc 04 §2) : ["parrains", filtres], ["parrain", id],
 * ["suggestions"], ["mon-parrainage"].
 */

/** Liste paginée + filtrée des Aînés (RG3 côté serveur). */
export function useParrains(filtres = {}) {
  return useQuery({
    queryKey: ["parrains", filtres],
    queryFn: () => fetchParrains(filtres),
    placeholderData: keepPreviousData, // pas de flash vide entre pages
  });
}

/** Suggestions automatiques (max 3) — cadet libre uniquement. */
export function useSuggestions(activee = true) {
  return useQuery({
    queryKey: ["suggestions"],
    queryFn: fetchSuggestions,
    enabled: activee,
  });
}

/** Fiche détaillée d'un Aîné. */
export function useParrain(parrainId) {
  return useQuery({
    queryKey: ["parrain", String(parrainId)],
    queryFn: () => fetchParrain(parrainId),
    enabled: parrainId != null,
    retry: false, // 404 = état final, pas d'erreur transitoire
  });
}

/** État parrainage du cadet connecté (RG1 : binôme actif / demande en attente). */
export function useMonParrainage() {
  return useQuery({
    queryKey: ["mon-parrainage"],
    queryFn: fetchMonParrainage,
  });
}

/** POST demande → succès : toast + invalidations + redirect gérés par la fiche. */
export function useEnvoyerDemande() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ parrainId, message }) => envoyerDemande(parrainId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mon-parrainage"] });
      queryClient.invalidateQueries({ queryKey: ["parrains"] });
      queryClient.invalidateQueries({ queryKey: ["parrain"] });
    },
  });
}

/** DELETE demande en attente (RG1 : l'attente compte comme engagement). */
export function useAnnulerDemande() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (demandeId) => annulerDemande(demandeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mon-parrainage"] });
      queryClient.invalidateQueries({ queryKey: ["parrains"] });
      queryClient.invalidateQueries({ queryKey: ["parrain"] });
    },
  });
}
