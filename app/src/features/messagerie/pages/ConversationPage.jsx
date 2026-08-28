import { useParams } from "react-router-dom";
import Card from "@shared/components/Card";
import EmptyState from "@shared/components/EmptyState";
import Button from "@shared/components/Button";
import FilConversation from "../components/FilConversation";
import { useConversations } from "../hooks/useConversations";

/**
 * /messagerie/:conversationId (doc 08 §5) — mobile : page pleine ; desktop :
 * rendue dans le split-view de la liste. 403/conv inconnue → redirection douce.
 */
export default function ConversationPage() {
  const { conversationId } = useParams();
  const { data } = useConversations();
  const conversation = (data?.results ?? []).find((c) => c.id === Number(conversationId));

  if (!conversation) {
    return (
      <Card className="p-6">
        <EmptyState
          title="Conversation introuvable"
          description="Cette conversation n'existe pas ou n'est pas destinataire."
        >
          <Button to="/messagerie" variant="ghost">
            Retour à la messagerie
          </Button>
        </EmptyState>
      </Card>
    );
  }

  return <FilConversation conversation={conversation} />;
}
