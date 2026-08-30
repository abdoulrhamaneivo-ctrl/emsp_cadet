import { Route, Routes } from "react-router-dom";
import { AppProviders } from "@app/providers";
import PublicShell from "@layout/shells/PublicShell";
import ProtectedShell from "@layout/shells/ProtectedShell";
import NotFoundPage from "@shared/pages/NotFoundPage";
import HealthCheck from "@shared/pages/HealthCheck";
import LandingPage from "@features/landing/pages/LandingPage";
import ConnexionPage from "@features/authentification/pages/ConnexionPage";
import InscriptionPage from "@features/authentification/pages/InscriptionPage";
import MotDePasseOubliePage from "@features/authentification/pages/MotDePasseOubliePage";
import ReinitialiserMotDePassePage from "@features/authentification/pages/ReinitialiserMotDePassePage";
import VerifierEmailPage from "@features/authentification/pages/VerifierEmailPage";
import CompteSuspenduPage from "@features/authentification/pages/CompteSuspenduPage";
import AnnuairePage from "@features/annuaire/pages/AnnuairePage";
import FicheAinePage from "@features/annuaire/pages/FicheAinePage";
import MesDemandesPage from "@features/parrainage/pages/MesDemandesPage";
import MonParrainagePage from "@features/parrainage/pages/MonParrainagePage";
import MessagerieListPage from "@features/messagerie/pages/MessagerieListPage";
import ConversationPage from "@features/messagerie/pages/ConversationPage";
import RendezVousPage from "@features/rendez-vous/pages/RendezVousPage";
import RendezVousDetailPage from "@features/rendez-vous/pages/RendezVousDetailPage";
import FilPage from "@features/fil/pages/FilPage";
import EvenementsPage from "@features/evenements/pages/EvenementsPage";
import EvenementDetailPage from "@features/evenements/pages/EvenementDetailPage";
import ProfilePage from "@features/profil/pages/ProfilePage";
import AdminDashboardPage from "@features/admin/pages/AdminDashboardPage";
import ModerationPage from "@features/admin/pages/ModerationPage";
import AccueilPage from "@features/accueil/pages/AccueilPage";
import OffresPage from "@features/offres/pages/OffresPage";

/** Routes par domaine (docs 02 §4 / 20). Les vraies pages arrivent tranche par tranche. */
function AppRoutes() {
  return (
    <Routes>
      {/* Shell public */}
      <Route element={<PublicShell />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/connexion" element={<ConnexionPage />} />
        <Route path="/inscription" element={<InscriptionPage />} />
        <Route path="/mot-de-passe-oublie" element={<MotDePasseOubliePage />} />
        <Route path="/reinitialiser-mot-de-passe/:uid/:token" element={<ReinitialiserMotDePassePage />} />
        <Route path="/verifier-email/:uid/:token" element={<VerifierEmailPage />} />
        <Route path="/compte-suspendu" element={<CompteSuspenduPage />} />
        <Route path="/health" element={<HealthCheck />} />
      </Route>

      {/* Shell protégé */}
      <Route element={<ProtectedShell />}>
        <Route path="/accueil" element={<AccueilPage />} />
        <Route path="/profil" element={<ProfilePage />} />
        <Route path="/annuaire" element={<AnnuairePage />} />
        <Route path="/annuaire/:parrainId" element={<FicheAinePage />} />
        <Route path="/mes-demandes" element={<MesDemandesPage />} />
        <Route path="/mon-parrainage" element={<MonParrainagePage />} />
        <Route path="/rendez-vous" element={<RendezVousPage />} />
        <Route path="/rendez-vous/:rdvId" element={<RendezVousDetailPage />} />
        <Route path="/messagerie" element={<MessagerieListPage />}>
          <Route path=":conversationId" element={<ConversationPage />} />
        </Route>
        <Route path="/fil" element={<FilPage />} />
        <Route path="/evenements" element={<EvenementsPage />} />
        <Route path="/evenements/:evenementId" element={<EvenementDetailPage />} />
        <Route path="/offres" element={<OffresPage />} />
        <Route path="/administration" element={<AdminDashboardPage />} />
        <Route path="/moderation" element={<ModerationPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
