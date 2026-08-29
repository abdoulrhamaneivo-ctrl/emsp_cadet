import { z } from "zod";

/** Contrats de saisie Profil (doc 11 §2). */

export const NIVEAUX = ["L1", "L2", "L3", "M1", "M2", "alumni"];

export const schemaIdentite = z.object({
  prenom: z.string().trim().min(1, "Prénom requis.").max(80),
  nom: z.string().trim().min(1, "Nom requis.").max(80),
  filiere: z.string().trim().max(120).optional(),
  classe: z.string().trim().max(40).optional(),
  niveauEtude: z.enum(["L1", "L2", "L3", "M1", "M2", "alumni"]),
  attentes: z.string().trim().max(1000, "1000 caractères maximum.").optional(),
});

export const ITEM_VITRINE = z
  .string()
  .trim()
  .min(1)
  .max(160, "160 caractères maximum par élément.");

/** Conditions de complétude (doc 11 §2 n°7) — libellés d'affichage. */
export const CONDITIONS_VISIBILITE = {
  candidature: "Candidature Aîné ouverte",
  photo: "Photo de profil ajoutée",
  ambitions: "Au moins 3 ambitions",
  projets: "Au moins 1 projet",
  pointsForts: "Au moins 2 points forts",
  pointsFaibles: "Au moins 1 point faible",
};
