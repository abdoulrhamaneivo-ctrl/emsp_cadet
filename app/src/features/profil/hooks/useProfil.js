import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { profilApi } from "../api";

function premierMessage(erreur) {
  if (typeof erreur === "string") return erreur;
  if (Array.isArray(erreur)) return erreur.map(premierMessage).find(Boolean) ?? "";
  if (!erreur || typeof erreur !== "object") return "";
  for (const cle of ["detail", "photo", "non_field_errors"]) {
    const message = premierMessage(erreur[cle]);
    if (message) return message;
  }
  return Object.values(erreur).map(premierMessage).find(Boolean) ?? "";
}

export function useMoi() {
  return useQuery({ queryKey: ["me"], queryFn: profilApi.moi });
}

export function useVisibilite() {
  return useQuery({ queryKey: ["visibilite-annuaire"], queryFn: profilApi.visibilite });
}

export function usePreferencesIA() {
  return useQuery({
    queryKey: ["preferences-ia"],
    queryFn: profilApi.preferencesIA,
  });
}

/** PATCH me — sauvegarde explicite (jamais d'autosave, doc 11 §5). */
export function useModifierProfil() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: profilApi.modifier,
    onSuccess: (donnees) => {
      client.setQueryData(["me"], donnees);
      client.invalidateQueries({ queryKey: ["preferences-ia"] });
      client.invalidateQueries({ queryKey: ["visibilite-annuaire"] });
      // Le niveau/vitrine changent ce que voient l'annuaire et le parrainage.
      client.invalidateQueries({ queryKey: ["mon-parrainage"] });
      client.invalidateQueries({ queryKey: ["parrains"] });
      client.invalidateQueries({ queryKey: ["demandes"] });
      if (donnees?.promotionDisponible) {
        // Doc 11 §5 : toast-ACTION après promotion — jamais d'auto-ouverture.
        toast("Ton nouveau niveau est enregistré.", {
          description: "Ta candidature Aîné est maintenant disponible.",
        });
      } else {
        toast.success("Profil enregistré.");
      }
    },
    onError: (e) => {
      const detail = e?.response?.data?.detail;
      toast.error(
        typeof detail === "string"
          ? detail
          : (detail?.[0] ?? "Enregistrement impossible."),
      );
    },
  });
}

export function useEnvoyerPhoto() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (fichier) => {
      if (!fichier) throw new Error("Sélectionne une photo.");
      if (fichier.size > 5 * 1024 * 1024) {
        throw Object.assign(new Error(), {
          userMessage: "Photo : 5 Mo maximum.",
        });
      }
      return profilApi.photo(fichier);
    },
    onSuccess: (donnees) => {
      client.setQueryData(["me"], (ancien) => ({ ...ancien, photoUrl: donnees.photoUrl }));
      client.invalidateQueries({ queryKey: ["visibilite-annuaire"] });
      toast.success("Photo mise à jour.");
    },
    onError: (e) => {
      const donnees = e?.response?.data ?? {};
      const message = premierMessage(donnees)
        || e?.userMessage
        || (e?.response?.status >= 500
          ? "Le stockage photo est indisponible. Réessaie dans un instant."
          : e?.response?.status
            ? `Téléversement refusé (HTTP ${e.response.status}). Choisis une image JPG, PNG ou WebP de 5 Mo maximum.`
            : "Envoi de la photo impossible. Vérifie ta connexion puis réessaie.");
      toast.error(message);
    },
  });
}

/** RG8 — bascule de la candidature (modale de confirmation côté page). */
export function useBasculeCandidature() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (ouverte) => profilApi.modifier({ candidatureAineOuverte: ouverte }),
    onSuccess: (donnees) => {
      client.setQueryData(["me"], donnees);
      client.invalidateQueries({ queryKey: ["visibilite-annuaire"] });
      client.invalidateQueries({ queryKey: ["mon-parrainage"] });
      client.invalidateQueries({ queryKey: ["parrains"] });
      client.invalidateQueries({ queryKey: ["demandes"] });
      toast.success(
        donnees.candidatureAineOuverte
          ? "Candidature ouverte — ton profil devient visible dès qu'il est complet."
          : "Candidature fermée — tes cadets actifs restent accompagnés.",
      );
    },
    onError: (e) => {
      const detail = e?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Action impossible.");
    },
  });
}

/** Suppression self-serve — déconnexion locale forcée (cahier §6). */
export function useSupprimerCompte(logout) {
  return useMutation({
    mutationFn: profilApi.supprimerCompte,
    onSuccess: () => {
      toast.success("Compte supprimé. Bonne continuation sur EMSP Connect.");
      logout();
    },
    onError: (e) => {
      const detail = e?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Suppression impossible.");
    },
  });
}
