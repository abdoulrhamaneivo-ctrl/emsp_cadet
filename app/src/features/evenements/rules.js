import { useAuth } from "@app/providers/Auth";

/** L'utilisateur peut-il créer un événement ? (doc 10 §2 : aîné|admin)
 *  Le front reflète la règle backend `_est_aine` : niveau L2+ ou alumni en
 *  préfixe de `classe`, ou isAdmin. */
export function estAine(user) {
  if (!user) return false;
  if (user.isAdmin) return true;
  const classe = (user.classe ?? "").trim().toLowerCase();
  return ["l2", "l3", "m1", "m2", "alumni"].some((niveau) => classe.startsWith(niveau));
}

/** Garde de ROUTE doc 10 §8 n°1 : le cadet ne voit même pas le bouton créer. */
export default function PeutCreerEvenement({ children }) {
  const { user } = useAuth();
  return estAine(user) ? children : null;
}
