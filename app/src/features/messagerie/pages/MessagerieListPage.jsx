import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Card from "@shared/components/Card";
import EmptyState from "@shared/components/EmptyState";
import Button from "@shared/components/Button";
import CarteConversation from "../components/CarteConversation";
import { useConversations } from "../hooks/useConversations";
import { staggerContainer } from "@shared/motion/variants";
/**
 * /messagerie (doc 08 §4) : liste +, desktop ≥lg, split-view — la conversation
 * la plus récente s'ouvre automatiquement à droite ; mobile : liste seule.
 */
const estVueDesktop = () => window.matchMedia("(min-width: 1024px)").matches;

export default function MessagerieListPage() {
  const { conversationId } = useParams();
  const { data, isPending: chargement } = useConversations();
  const conversations = data?.results ?? [];
  const [desktop, setDesktop] = useState(estVueDesktop);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const ecouter = (e) => setDesktop(e.matches);
    media.addEventListener("change", ecouter);
    return () => media.removeEventListener("change", ecouter);
  }, []);

  // RG doc 08 §1 : sans binôme actif, pas de messagerie → annuaire
  // (en démo la famille est toujours là ; un utilisateur sans conversation voit l'EmptyState).

  return (
    <div className="flex min-h-0 flex-col gap-4 lg:h-[calc(100vh-9rem)] lg:flex-row">
      <section aria-labelledby="titre-messagerie" className="flex min-h-0 flex-col gap-3 lg:w-[360px] lg:shrink-0">
        <div>
          <p className="text-xs font-semibold text-[var(--emsp-gold)]">Ton espace binôme</p>
          <h1 id="titre-messagerie" className="font-display text-2xl font-bold text-[var(--emsp-cream)]">
            Messagerie
          </h1>
          <p className="mt-0.5 text-sm text-[var(--emsp-cream)]/90">
            {conversations.length} conversation{conversations.length > 1 ? "s" : ""} — privée
            {conversations.length > 1 ? "s" : ""} du binôme et famille.
          </p>
        </div>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="flex min-h-0 flex-col gap-2.5 overflow-y-auto pr-0.5"
        >
          {chargement ? (
            <Card className="p-6 text-center text-sm text-[var(--text-muted)]">Chargement…</Card>
          ) : conversations.length === 0 ? (
            <Card className="p-6">
              <EmptyState
                title="Ta messagerie s'activera dès qu'un Aîné acceptera ta demande"
                description="En attendant, parcours l'annuaire et trouve ton Aîné."
              >
                <Button to="/annuaire" variant="primary">
                  Voir l'annuaire
                </Button>
              </EmptyState>
            </Card>
          ) : (
            conversations.map((c) => <CarteConversation key={c.id} conversation={c} />)
          )}
        </motion.div>
      </section>

      {/* Split-view desktop : conversation ouverte à droite (Outlet) — si
          aucune conversation n'est sélectionnée, la plus récente s'ouvre
          automatiquement (jamais de colonne droite vide). lg:flex borne la
          hauteur de la Card (sinon le composer passe sous le pli). */}
      <div className="hidden min-h-0 flex-1 lg:flex lg:flex-col">
        {desktop && !conversationId && conversations.length > 0 && (
          <Navigate to={`${conversations[0].id}`} replace />
        )}
        <Outlet />
      </div>
    </div>
  );
}
