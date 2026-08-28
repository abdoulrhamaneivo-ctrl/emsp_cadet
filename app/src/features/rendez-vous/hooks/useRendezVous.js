import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rendezVousApi } from "../api";

/** Clés query (doc 06 §2) : ["rdv", scope], ["prochain-rdv"]. Invalide ["mon-parrainage"]. */
const invalider = (client) => {
  client.invalidateQueries({ queryKey: ["rdv"] });
  client.invalidateQueries({ queryKey: ["prochain-rdv"] });
  client.invalidateQueries({ queryKey: ["mon-parrainage"] });
};

export function useRendezVous(scope) {
  return useQuery({
    queryKey: ["rdv", scope],
    queryFn: () => rendezVousApi.liste(scope),
  });
}

/** Bannière J-1 (doc 06 §6) — confirme < 48h, rappel pas encore vu. */
export function useProchainRappel() {
  return useQuery({
    queryKey: ["prochain-rdv"],
    queryFn: rendezVousApi.prochainRappel,
  });
}

export function useRendezVousDetail(id) {
  return useQuery({
    queryKey: ["rdv", "detail", id],
    queryFn: () => rendezVousApi.detail(id),
  });
}

export function useProposerRdv() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (corps) => rendezVousApi.proposer(corps),
    onSuccess: () => invalider(client),
  });
}

export function useRepondreRdv() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }) => rendezVousApi.repondre(id, decision),
    onSuccess: (_, { decision }) => {
      invalider(client);
      toast.success(decision === "confirme" ? "Rendez-vous confirmé" : "Rendez-vous refusé");
    },
  });
}

export function useContreProposer() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dateHeure, lieu }) => rendezVousApi.contreProposer(id, { dateHeure, lieu }),
    onSuccess: () => {
      invalider(client);
      toast.success("Contre-proposition envoyée");
    },
  });
}

export function useAnnulerRdv() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => rendezVousApi.annuler(id),
    onSuccess: () => {
      invalider(client);
      toast.success("Rendez-vous annulé");
    },
  });
}

export function useRappelVu() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => rendezVousApi.rappelVu(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ["prochain-rdv"] }),
  });
}
