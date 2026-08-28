import { z } from "zod";

/**
 * Validation RDV (doc 06 §3) : dateHeure future (> now+5min, critère §9 n°6),
 * titre 3..80, lieu requis si présentiel.
 */
export const schemaPropositionRDV = z
  .object({
    inviteId: z.number({ invalid_type_error: "Choisis un invité." }),
    titre: z.string().trim().min(3, "3 caractères minimum.").max(80, "80 caractères maximum."),
    description: z.string().trim().max(600, "600 caractères maximum.").optional().or(z.literal("")),
    dateHeure: z
      .string()
      .min(1, "La date est requise.")
      .refine((valeur) => {
        const date = new Date(valeur);
        return !Number.isNaN(date.getTime()) && date.getTime() > Date.now() + 5 * 60 * 1000;
      }, "Choisis un créneau au moins 5 minutes dans le futur."),
    mode: z.enum(["presentiel", "visio"], { errorMap: () => ({ message: "Choisis un mode." }) }),
    // Requis uniquement en présentiel (superRefine) — en visio un lien est optionnel.
    lieu: z.string().trim().max(120, "120 caractères maximum.").optional().or(z.literal("")),
  })
  .superRefine((valeurs, ctx) => {
    if (valeurs.mode === "presentiel" && !valeurs.lieu?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lieu"],
        message: "Le lieu est requis en présentiel.",
      });
    }
  });
