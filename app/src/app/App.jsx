import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AppProviders } from "@app/providers";
import PublicShell from "@layout/shells/PublicShell";
import ProtectedShell from "@layout/shells/ProtectedShell";
import NotFoundPage from "@shared/pages/NotFoundPage";
import HealthCheck from "@shared/pages/HealthCheck";

// Lazy-loaded pages — code-splitting pour réduire le bundle initial
const LandingPage = lazy(() => import("@features/landing/pages/LandingPage"));
const ConnexionPage = lazy(() => import("@features/authentification/pages/ConnexionPage"));
const InscriptionPage = lazy(() => import("@features/authentification/pages/InscriptionPage"));
const MotDePasseOubliePage = lazy(() => import("@features/authentification/pages/MotDePasseOubliePage"));
const ReinitialiserMotDePassePage = lazy(() => import("@features/authentification/pages/ReinitialiserMotDePassePage"));
const VerifierEmailPage = lazy(() => import("@features/authentification/pages/VerifierEmailPage"));
const CompteSuspenduPage = lazy(() => import("@features/authentification/pages/CompteSuspenduPage"));
const AnnuairePage = lazy(() => import("@features/annuaire/pages/AnnuairePage"));
const FicheAinePage = lazy(() => import("@features/annuaire/pages/FicheAinePage"));
const MesDemandesPage = lazy(() => import("@features/parrainage/pages/MesDemandesPage"));
const MonParrainagePage = lazy(() => import("@features/parrainage/pages/MonParrainagePage"));
const MessagerieListPage = lazy(() => import("@features/messagerie/pages/MessagerieListPage"));
const ConversationPage = lazy(() => import("@features/messagerie/pages/ConversationPage"));
const RendezVousPage = lazy(() => import("@features/rendez-vous/pages/RendezVousPage"));
const RendezVousDetailPage = lazy(() => import("@features/rendez-vous/pages/RendezVousDetailPage"));
const FilPage = lazy(() => import("@features/fil/pages/FilPage"));
const EvenementsPage = lazy(() => import("@features/evenements/pages/EvenementsPage"));
const EvenementDetailPage = lazy(() => import("@features/evenements/pages/EvenementDetailPage"));
const ProfilePage = lazy(() => import("@features/profil/pages/ProfilePage"));
const AdminDashboardPage = lazy(() => import("@features/admin/pages/AdminDashboardPage"));
const ModerationPage = lazy(() => import("@features/admin/pages/ModerationPage"));
const AccueilPage = lazy(() => import("@features/accueil/pages/AccueilPage"));
const OffresPage = lazy(() => import("@features/offres/pages/OffresPage"));

// Composant de chargement partagé pour Suspense
function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-[var(--emsp-gold)]/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-[var(--emsp-gold)] rounded-full animate-spin border-t-transparent" />
        </div>
        <p className="text-sm text-[var(--text-muted)]">Chargement de la page…</p>
      </div>
    </div>
  );
}

/** Routes par domaine (docs 02 §4 / 20). Les vraies pages arrivent tranche par tranche. */
function AppRoutes() {
  return (
    <Routes>
      {/* Shell public */}
      <Route element={<PublicShell />}>
        <Route path="/" element={<Suspense fallback={<PageFallback />}><LandingPage /></Suspense>} />
        <Route path="/connexion" element={<Suspense fallback={<PageFallback />}><ConnexionPage /></Suspense>} />
        <Route path="/inscription" element={<Suspense fallback={<PageFallback />}><InscriptionPage /></Suspense>} />
        <Route path="/mot-de-passe-oublie" element={<Suspense fallback={<PageFallback />}><MotDePasseOubliePage /></Suspense>} />
        <Route path="/reinitialiser-mot-de-passe/:uid/:token" element={<Suspense fallback={<PageFallback />}><ReinitialiserMotDePassePage /></Suspense>} />
        <Route path="/verifier-email/:uid/:token" element={<Suspense fallback={<PageFallback />}><VerifierEmailPage /></Suspense>} />
        <Route path="/compte-suspendu" element={<Suspense fallback={<PageFallback />}><CompteSuspenduPage /></Suspense>} />
        <Route path="/health" element={<HealthCheck />} />
      </Route>

      {/* Shell protégé */}
      <Route element={<ProtectedShell />}>
        <Route path="/accueil" element={<Suspense fallback={<PageFallback />}><AccueilPage /></Suspense>} />
        <Route path="/profil" element={<Suspense fallback={<PageFallback />}><ProfilePage /></Suspense>} />
        <Route path="/annuaire" element={<Suspense fallback={<PageFallback />}><AnnuairePage /></Suspense>} />
        <Route path="/annuaire/:parrainId" element={<Suspense fallback={<PageFallback />}><FicheAinePage /></Suspense>} />
        <Route path="/mes-demandes" element={<Suspense fallback={<PageFallback />}><MesDemandesPage /></Suspense>} />
        <Route path="/mon-parrainage" element={<Suspense fallback={<PageFallback />}><MonParrainagePage /></Suspense>} />
        <Route path="/rendez-vous" element={<Suspense fallback={<PageFallback />}><RendezVousPage /></Suspense>} />
        <Route path="/rendez-vous/:rdvId" element={<Suspense fallback={<PageFallback />}><RendezVousDetailPage /></Suspense>} />
        <Route path="/messagerie" element={<Suspense fallback={<PageFallback />}><MessagerieListPage /></Suspense>}>
          <Route path=":conversationId" element={<Suspense fallback={<PageFallback />}><ConversationPage /></Suspense>} />
        </Route>
        <Route path="/fil" element={<Suspense fallback={<PageFallback />}><FilPage /></Suspense>} />
        <Route path="/evenements" element={<Suspense fallback={<PageFallback />}><EvenementsPage /></Suspense>} />
        <Route path="/evenements/:evenementId" element={<Suspense fallback={<PageFallback />}><EvenementDetailPage /></Suspense>} />
        <Route path="/offres" element={<Suspense fallback={<PageFallback />}><OffresPage /></Suspense>} />
        <Route path="/administration" element={<Suspense fallback={<PageFallback />}><AdminDashboardPage /></Suspense>} />
        <Route path="/moderation" element={<Suspense fallback={<PageFallback />}><ModerationPage /></Suspense>} />
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
