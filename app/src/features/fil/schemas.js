import { z } from "zod";

/** Contrats de saisie du Fil (doc 09 §2/§8). */

export const TYPES_PUBLICATION = ["annonce", "question", "succes"];

export const schemaPublication = z.object({
  type: z.enum(["annonce", "question", "succes"], {
    message: "Choisis un type de publication.",
  }),
  contenu: z
    .string()
    .trim()
    .min(10, "Une publication compte au moins 10 caractères.")
    .max(1200, "1200 caractères maximum."),
});

export const schemaCommentaire = z.object({
  contenu: z
    .string()
    .trim()
    .min(2, "Un commentaire compte au moins 2 caractères.")
    .max(600, "600 caractères maximum."),
});

/** Raisons prescrites (doc 09 §3 — jamais de raison libre). */
export const RAISONS_SIGNALEMENT = [
  { code: "spam", libelle: "Spam ou publicité" },
  { code: "harcelement", libelle: "Harcèlement" },
  { code: "faux", libelle: "Fausse information" },
  { code: "info", libelle: "Contenu inapproprié" },
];
