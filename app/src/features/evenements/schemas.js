import { z } from "zod";

/** Contrats de saisie Événements (doc 10 §2/§5). */

export const schemaEvenement = z
  .object({
    type: z.string().trim().max(24, "Tag : 24 caractères maximum.").optional(),
    titre: z
      .string()
      .trim()
      .min(5, "Le titre compte au moins 5 caractères.")
      .max(90, "Titre : 90 caractères maximum."),
    description: z
      .string()
      .trim()
      .min(30, "Décris l'événement en 30 caractères minimum.")
      .max(1500, "Description : 1500 caractères maximum."),
    dateHeure: z.string().min(1, "Choisis une date et une heure."),
    enLigne: z.boolean(),
    lieu: z.string().trim().max(200).optional(),
    capaciteMax: z.coerce
      .number({ message: "Capacité numérique attendue." })
      .int("Entier attendu.")
      .min(2, "Au moins 2 places.")
      .max(100, "100 places maximum."),
  })
  .refine((valeurs) => valeurs.enLigne || (valeurs.lieu ?? "").length > 0, {
    path: ["lieu"],
    message: "Le lieu est requis pour un événement en présentiel.",
  });

export const schemaMessageEvenement = z.object({
  contenu: z
    .string()
    .trim()
    .min(2, "Un message compte au moins 2 caractères.")
    .max(600, "600 caractères maximum."),
});
