import { z } from "zod";

/** Messages texte uniquement V1, 1..2000 chars (doc 08 §2 règle 4). */
export const schemaMessage = z.object({
  contenu: z
    .string()
    .trim()
    .min(1, "Le message ne peut pas être vide.")
    .max(2000, "2000 caractères maximum."),
});
