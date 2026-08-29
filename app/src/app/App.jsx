import { Route, Routes } from "react-router-dom";
import { AppProviders } from "@app/providers";
import PublicShell from "@layout/shells/PublicShell";
import ProtectedShell from "@layout/shells/ProtectedShell";
import NotFoundPage from "@shared/pages/NotFoundPage";
import HealthCheck from "@shared/pages/HealthCheck";
import PlaceholderPage from "@shared/pages/PlaceholderPage";
import ConnexionPage from "@features/authentification/pages/ConnexionPage";
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

/** Routes par domaine (docs 02 §4 / 20). Les vraies pages arrivent tranche par tranche. */
function AppRoutes() {
  return (
    <Routes>
      {/* Shell public */}
      <Route element={<PublicShell />}>
        <Route path="/" element={<PlaceholderPage titre="Landing" spec="adaptation template Home (T0) — P01" />} />
        <Route path="/connexion" element={<ConnexionPage />} />
        <Route path="/inscription" element={<PlaceholderPage titre="Inscription" spec="T0 — P03" />} />
        <Route path="/mot-de-passe-oublie" element={<PlaceholderPage titre="Mot de passe oublié" spec="T0 — P04" />} />
        <Route path="/reinitialiser-mot-de-passe/:uid/:token" element={<PlaceholderPage titre="Réinitialiser le mot de passe" spec="T0 — P05" />} />
        <Route path="/verifier-email/:uid/:token" element={<PlaceholderPage titre="Vérification e-mail" spec="T0 — P06" />} />
        <Route path="/compte-suspendu" element={<PlaceholderPage titre="Compte suspendu" spec="doc 16 — P07" />} />
        <Route path="/health" element={<HealthCheck />} />
      </Route>

      {/* Shell protégé */}
      <Route element={<ProtectedShell />}>
        <Route path="/accueil" element={<PlaceholderPage titre="Accueil" spec="T0* — P09" />} />
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
        <Route path="/offres" element={<PlaceholderPage titre="Offres" spec="doc 14 — P22" />} />
        <Route path="/administration" element={<AdminDashboardPage />} />
        <Route path="/moderation" element={<PlaceholderPage titre="Modération" spec="doc 12 — P24 (admin only)" />} />
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
