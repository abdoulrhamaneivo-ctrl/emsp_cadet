import { z } from "zod";

/** Un compte administrateur peut aussi utiliser une adresse de gestion externe. */
export const schemaConnexion = z.object({
  email: z
    .string()
    .min(1, "L'e-mail est requis.")
    .email("Adresse e-mail invalide."),
  motDePasse: z.string().min(1, "Le mot de passe est requis."),
});
