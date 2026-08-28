import { z } from "zod";

/** Règles connexion — doc 02 §5 (RG4 : domaine @emsp.int exclusivement). */
export const schemaConnexion = z.object({
  email: z
    .string()
    .min(1, "L'e-mail est requis.")
    .email("Adresse e-mail invalide.")
    .refine(
      (valeur) => valeur.toLowerCase().endsWith("@emsp.int"),
      "Utilise ton adresse @emsp.int — les comptes externes ne sont pas admis.",
    ),
  motDePasse: z.string().min(1, "Le mot de passe est requis."),
});
