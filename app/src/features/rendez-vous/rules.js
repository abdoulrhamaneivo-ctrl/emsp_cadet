/**
 * Matrice de réponse RDV (doc 06 §2/§9 n°3) : seul l'INVITÉ traite une
 * proposition ; seul l'ORGANISATEUR traite une contre-proposition.
 * Fonction pure — l'appelant fournit l'utilisateur (useAuth côté pages).
 * @returns {{ok: boolean, raison: string|null}}
 */
export function peutRepondre(rdv, user) {
  if (!rdv || !user) return { ok: false, raison: "Session inconnue." };

  const jeSuisInvite = rdv.invite?.id === user.id;
  const jeSuisOrganisateur = rdv.organisateur?.id === user.id;

  if (rdv.statut === "propose") {
    if (!jeSuisInvite) return { ok: false, raison: "Seul l'invité répond à une proposition." };
    return { ok: true, raison: null };
  }
  if (rdv.statut === "contre_propose") {
    if (!jeSuisOrganisateur) {
      return { ok: false, raison: "Le contre-proposant attend ta réponse — c'est à l'organisateur de trancher." };
    }
    return { ok: true, raison: null };
  }
  return { ok: false, raison: "Ce rendez-vous n'attend plus de réponse." };
}
