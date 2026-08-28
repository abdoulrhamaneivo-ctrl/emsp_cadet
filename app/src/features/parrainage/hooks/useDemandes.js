import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  annulerDemande,
  cloturerParrainage,
  donnerAvis,
  fetchDemandes,
  fetchGroupsResume,
  fetchMesRendezVous,
  repondreDemande,
} from "../api";

/**
 * Hooks TanStack Query de la feature parrainage (doc 05 §2).
 * Invalidation croisée contractuelle : une acceptation crée la Famille et
 * change la capacité de l'Aîné — on re-synchronise aussi l'annuaire.
 */

const CLE_PARRAINAGE = ["mon-parrainage"];

/** Invalidation après TOUTE mutation : les deux facettes + groupes + annuaire. */
function invaliderTout(queryClient) {
  queryClient.invalidateQueries({ queryKey: CLE_PARRAINAGE });
  queryClient.invalidateQueries({ queryKey: ["demandes"] });
  queryClient.invalidateQueries({ queryKey: ["groups-resume"] });
  queryClient.invalidateQueries({ queryKey: ["parrains"] });
  queryClient.invalidateQueries({ queryKey: ["suggestions"] });
}

/** GET /api/demandes/?sens=… — clés [« demandes », sens]. */
export function useDemandes(sens = "envoyees") {
  return useQuery({
    queryKey: ["demandes", sens],
    queryFn: () => fetchDemandes(sens),
  });
}

/** GET /api/me/groups-resume/ — clé [« groups-resume »] (doc 13). */
export function useGroupsResume() {
  return useQuery({
    queryKey: ["groups-resume"],
    queryFn: fetchGroupsResume,
  });
}

/** GET /api/me/rendez-vous/ — aperçu des RDV du binôme. */
export function useMesRendezVous() {
  return useQuery({
    queryKey: ["mes-rendez-vous"],
    queryFn: fetchMesRendezVous,
  });
}

/** Accepter/refuser une demande reçue (aîné, RG2). */
export function useRepondreDemande() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ demandeId, decision, options }) => repondreDemande(demandeId, decision, options),
    onSuccess: () => invaliderTout(queryClient),
  });
}

/** Annuler une demande envoyée en attente. */
export function useAnnulerDemandeEnvoyee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (demandeId) => annulerDemande(demandeId),
    onSuccess: () => invaliderTout(queryClient),
  });
}

/** Clôturer un binôme (RG6 : déclenche l'avis). */
export function useCloturerParrainage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ parrainageId, raison }) => cloturerParrainage(parrainageId, raison),
    onSuccess: () => invaliderTout(queryClient),
  });
}

/** Donner son avis (RG6, doc 07) — un seul par binôme. */
export function useDonnerAvis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ parrainageId, note, commentaire }) => donnerAvis(parrainageId, note, commentaire),
    onSuccess: () => invaliderTout(queryClient),
  });
}
