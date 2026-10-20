import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigate, useLocation } from "react-router-dom";
import { RefreshCw, AlertTriangle, Send, Users, Eye, Check, XCircle, FileImage } from "lucide-react";
import Card from "@shared/components/Card";
import Button from "@shared/components/Button";
import { SkeletonCard } from "@shared/components/Skeleton";
import { apiClient } from "@shared/api/client";
import { useAuth } from "@app/providers/Auth";
import ModaleTransition from "../components/ModaleTransition";
import ChipIA from "@shared/components/ChipIA";
import Modal from "@shared/components/Modal";
import ConfirmDialog from "@shared/components/ConfirmDialog";

/** GET /api/admin/stats/ — KPI (doc 12 §2, sous-ensemble V1). */
function useStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => apiClient.get("/api/admin/stats/").then((r) => r.data),
  });
}

/** GET /api/admin/binomes-silencieux/ — liste des binômes à risque (IA-5). */
function useBinomesSilencieux() {
  return useQuery({
    queryKey: ["admin-binomes-silencieux"],
    queryFn: () => apiClient.get("/api/admin/binomes-silencieux/").then((r) => r.data),
  });
}

function useVerificationsEtudiants() {
  return useQuery({
    queryKey: ["admin-verifications-etudiants"],
    queryFn: () => apiClient.get("/api/admin/verifications-etudiants/").then((r) => r.data),
  });
}

function useDeciderVerification() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ verificationId, decision, motif }) =>
      apiClient.post("/api/admin/verifications-etudiants/", { verificationId, decision, motif }).then((r) => r.data),
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin-verifications-etudiants"] }),
  });
}

/** POST /api/admin/binomes-silencieux/ {binomeId} — envoie un nudge. */
function useEnvoyerNudge() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (binomeId) => apiClient.post("/api/admin/binomes-silencieux/", { binomeId }).then((r) => r.data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["admin-binomes-silencieux"] });
      client.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

/** Garde admin — redirige vers /accueil si pas isAdmin (doc 12 CA n°1). */
function GardeAdmin() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user?.isAdmin) {
    return <Navigate to="/accueil" replace state={{ from: location.pathname }} />;
  }
  return null;
}

function KPI({ valeur, libelle, accent = false }) {
  return (
    <Card className="flex min-w-0 flex-col gap-1 p-4">
      <p
        className={
          accent
            ? "font-display text-2xl font-bold text-[#b42318]"
            : "font-display text-2xl font-bold text-[var(--text-primary)]"
        }
      >
        {valeur}
      </p>
      <p className="text-xs text-[var(--text-muted)]">{libelle}</p>
    </Card>
  );
}

/**
 * /administration (doc 12 §4, tranche t5b) — dashboard stats + lancement de
 * la transition annuelle. Les autres blocs (signalements, comptes) suivront
 * en t5c — la route est déjà gardée admin.
 */
export default function AdminDashboardPage() {
  const { data: stats, isLoading, refetch, isFetching } = useStats();
  const { data: silence, isLoading: silenceLoading, refetch: refetchSilence } = useBinomesSilencieux();
  const { mutate: envoyerNudge, isPending: nudgeEnCours } = useEnvoyerNudge();
  const {
    data: verifications,
    isLoading: verificationsLoading,
    isError: verificationsError,
    refetch: refetchVerifications,
  } = useVerificationsEtudiants();
  const decisionVerification = useDeciderVerification();
  const [transition, setTransition] = useState(false);
  const [nudge, setNudge] = useState(null); // {binomeId, raisons}
  const [dossierOuvert, setDossierOuvert] = useState(null);
  const [carteUrl, setCarteUrl] = useState("");
  const [chargementCarte, setChargementCarte] = useState(false);
  const [erreurVerification, setErreurVerification] = useState("");
  const [confirmationRefus, setConfirmationRefus] = useState(false);
  const [motifRefus, setMotifRefus] = useState("");

  useEffect(() => () => {
    if (carteUrl) URL.revokeObjectURL(carteUrl);
  }, [carteUrl]);

  async function ouvrirDossier(dossier) {
    setErreurVerification("");
    setChargementCarte(true);
    setDossierOuvert(dossier);
    setCarteUrl("");
    try {
      const { data } = await apiClient.get(dossier.carteUrl, { responseType: "blob" });
      setCarteUrl(URL.createObjectURL(data));
    } catch {
      setErreurVerification("Impossible de charger la carte. Actualise la liste et réessaie.");
    } finally {
      setChargementCarte(false);
    }
  }

  function traiterDossier(decision, motif = "") {
    if (!dossierOuvert) return;
    setErreurVerification("");
    decisionVerification.mutate(
      { verificationId: dossierOuvert.verificationId, decision, motif },
      {
        onSuccess: () => {
          setDossierOuvert(null);
          setCarteUrl("");
          setConfirmationRefus(false);
          setMotifRefus("");
        },
        onError: (erreur) => {
          setErreurVerification(erreur?.response?.data?.detail ?? "La décision n'a pas pu être enregistrée.");
          setConfirmationRefus(false);
          setMotifRefus("");
        },
      },
    );
  }

  return (
    <>
      <GardeAdmin />
      <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[var(--accent-green)]">Pilotage</p>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Administration
          </h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            Santé du dispositif de parrainage, en un coup d'œil.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => { refetch(); refetchSilence(); refetchVerifications(); }} loading={isFetching || silenceLoading || verificationsLoading}>
            Actualiser
          </Button>
          <Button size="sm" onClick={() => setTransition(true)}>
            Clôturer l'année
          </Button>
        </div>
      </header>

      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-[var(--text-primary)]">Vérification des étudiants</h2>
            <p className="mt-1 max-w-3xl text-sm text-[var(--text-muted)]">
              Compare la photo de la carte au prénom, au nom, au matricule et à la promotion déclarés. Un nom déjà présent dans la même classe ou promotion est signalé pour contrôler un possible doublon.
            </p>
          </div>
          <span className="rounded-full bg-[var(--emsp-cream)]/10 px-3 py-1 text-xs font-semibold text-[var(--emsp-gold)]">
          {verificationsLoading ? "Chargement…" : verificationsError ? "Indisponible" : `${verifications?.count ?? 0} dossier${verifications?.count === 1 ? "" : "s"} en attente`}
          </span>
        </div>

        {verificationsError ? (
          <p role="alert" className="py-6 text-center text-sm text-[#b42318]">
            Impossible de charger les dossiers. Vérifie ta connexion et réessaie.
          </p>
        ) : verificationsLoading ? (
          <SkeletonCard />
        ) : verifications?.results?.length ? (
          <div className="space-y-3">
            {verifications.results.map((dossier) => (
              <div key={dossier.verificationId} className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--border-soft)] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--text-primary)]">{dossier.prenom} {dossier.nom}</p>
                  <p className="text-sm text-[var(--text-muted)]">{dossier.classe} · {dossier.filiere} · promotion {dossier.promotion}</p>
                  <p className="text-xs text-[var(--text-muted)]">Matricule {dossier.matricule} · {dossier.email}</p>
                  {!dossier.emailVerifie && <p className="mt-1 text-xs font-semibold text-[#b42318]">E-mail non confirmé</p>}
                  {dossier.homonymeMemeClasseOuPromotion && <p className="mt-1 text-xs font-semibold text-[#b42318]">Même nom et classe ou promotion déjà présents — contrôler le doublon</p>}
                </div>
                <Button size="sm" variant="outline" icon={Eye} onClick={() => ouvrirDossier(dossier)}>
                  Examiner le dossier
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-[var(--text-muted)]">Aucun dossier étudiant à examiner.</div>
        )}
      </Card>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KPI valeur={stats?.parrainagesActifs ?? 0} libelle="Parrainages actifs" />
          <KPI valeur={stats?.demandesEnAttente ?? 0} libelle="Demandes en attente" accent={(stats?.demandesEnAttente ?? 0) > 0} />
          <KPI valeur={stats?.etudiants ?? 0} libelle="Étudiants (L1→M2)" />
          <KPI valeur={stats?.alumni ?? 0} libelle="Alumni" />
        </div>
      )}

      <Card className="p-5">
        <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
          Transition annuelle
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Chaque fin d'année : les niveaux montent (L1→L2…), les fins de cycle L3/M2
          basculent selon l'intention déclarée. Les parrainages en cours sont
          toujours conservés — personne ne perd son Aîné ni ses filleuls.
        </p>
        <Button className="mt-3" onClick={() => setTransition(true)}>
          Ouvrir le récapitulatif de transition
        </Button>
      </Card>

      {/* IA-5 : Binômes silencieux */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
              Binômes silencieux (IA-5)
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Detection metas-only : dernier message Famille {'>'} 21j OU sup ou egal a 3 RDV annules/30j.
              <ChipIA className="ml-2" />
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => refetchSilence()}
            loading={silenceLoading}
          >
            Actualiser
          </Button>
        </div>

        {silenceLoading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : silence?.count === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)]">
            <Users size={32} className="mx-auto mb-2 text-[var(--text-muted)]/50" aria-hidden="true" />
            <p className="text-sm">Aucun binôme silencieux détecté — tout va bien !</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-soft)] text-left text-[var(--text-muted)]">
                  <th className="pb-2 pr-4">Aîné</th>
                  <th className="pb-2 pr-4">Cadet</th>
                  <th className="pb-2 pr-4">Raisons</th>
                  <th className="pb-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {silence?.results?.map((b) => (
                  <tr key={b.binomeId} className="border-b border-[var(--border-soft)]">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--text-primary)]">
                          {b.aine?.prenom} {b.aine?.nom}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {b.aine?.classe}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--text-primary)]">
                          {b.cadet?.prenom} {b.cadet?.nom}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {b.cadet?.classe}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1.5">
                        {b.raisons?.map((r, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-full bg-[var(--emsp-cream)]/10 px-2 py-0.5 text-xs text-[var(--emsp-gold)]"
                          >
                            <AlertTriangle size={10} aria-hidden="true" />
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Send}
                        onClick={() => setNudge({ binomeId: b.binomeId, raisons: b.raisons })}
                        disabled={nudgeEnCours}
                      >
                        Nudge
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </Card>

      <Card className="p-5">
        <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
          Transition annuelle
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Chaque fin d'année : les niveaux montent (L1→L2…), les fins de cycle L3/M2
          basculent selon l'intention déclarée. Les parrainages en cours sont
          toujours conservés — personne ne perd son Aîné ni ses filleuls.
        </p>
        <Button className="mt-3" onClick={() => setTransition(true)}>
          Ouvrir le récapitulatif de transition
        </Button>
      </Card>

      <ModaleTransition open={transition} onClose={() => setTransition(false)} />

      <Modal
        open={!!dossierOuvert && !confirmationRefus}
        onClose={() => { if (!decisionVerification.isPending) { setDossierOuvert(null); setCarteUrl(""); } }}
        title="Examiner la carte étudiante"
        subtitle="Vérifie que le nom, le matricule, la classe et la promotion correspondent à la carte. Après la décision, l'accès est retiré et la suppression du fichier demandée."
        maxWidth="md"
        actions={dossierOuvert && <>
          <Button variant="danger" onClick={() => setConfirmationRefus(true)} disabled={!carteUrl || decisionVerification.isPending}>
            Refuser
          </Button>
          <Button icon={Check} onClick={() => traiterDossier("approuver")} loading={decisionVerification.isPending} disabled={!carteUrl || !dossierOuvert.emailVerifie}>
            Valider le compte
          </Button>
        </>}
      >
        {dossierOuvert && <div className="space-y-4">
          <div className="grid gap-2 rounded-lg bg-[var(--bg-input)] p-3 text-sm sm:grid-cols-2">
            <p><strong>Étudiant :</strong> {dossierOuvert.prenom} {dossierOuvert.nom}</p>
            <p><strong>Matricule :</strong> {dossierOuvert.matricule}</p>
            <p><strong>Classe :</strong> {dossierOuvert.classe} — {dossierOuvert.filiere}</p>
            <p><strong>Promotion :</strong> {dossierOuvert.promotion}</p>
            <p className="sm:col-span-2"><strong>E-mail :</strong> {dossierOuvert.email} {dossierOuvert.emailVerifie ? "(confirmé)" : "(à confirmer)"}</p>
          </div>
          {dossierOuvert.homonymeMemeClasseOuPromotion && <p className="rounded-lg bg-[#b42318]/10 p-3 text-sm text-[#b42318]">Un étudiant avec le même nom et la même classe ou promotion existe déjà. Contrôle le matricule et la carte avant décision.</p>}
          {chargementCarte ? <div className="flex items-center justify-center gap-2 py-12 text-sm text-[var(--text-muted)]"><FileImage size={18} /> Chargement de la carte…</div> : carteUrl ? <img src={carteUrl} alt={`Carte étudiante de ${dossierOuvert.prenom} ${dossierOuvert.nom}`} className="mx-auto max-h-[60vh] max-w-full rounded-lg object-contain" /> : <p className="py-6 text-center text-sm text-[var(--text-muted)]">La carte n'a pas pu être affichée.</p>}
          {erreurVerification && <p role="alert" className="text-sm text-[#b42318]">{erreurVerification}</p>}
        </div>}
      </Modal>

      <Modal
        open={confirmationRefus}
        onClose={() => {
          if (!decisionVerification.isPending) {
            setConfirmationRefus(false);
            setMotifRefus("");
          }
        }}
        title="Refuser ce dossier étudiant ?"
        subtitle="Le compte restera bloqué. L'accès à la carte sera retiré et sa suppression demandée après la décision."
        maxWidth="xs"
        actions={<>
          <Button variant="ghost" onClick={() => { setConfirmationRefus(false); setMotifRefus(""); }} disabled={decisionVerification.isPending}>
            Annuler
          </Button>
          <Button variant="danger" onClick={() => traiterDossier("refuser", motifRefus.trim())} loading={decisionVerification.isPending}>
            Confirmer le refus
          </Button>
        </>}
      >
        <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
          Motif à transmettre à l'étudiant (facultatif)
          <textarea
            value={motifRefus}
            onChange={(event) => setMotifRefus(event.target.value)}
            maxLength={400}
            rows={3}
            className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-[var(--text-primary)]"
          />
        </label>
        {erreurVerification && <p role="alert" className="text-sm text-[#b42318]">{erreurVerification}</p>}
      </Modal>

      {/* Modale confirmation nudge IA-5 */}
      <ConfirmDialog
        open={!!nudge}
        onClose={() => setNudge(null)}
        title="Envoyer un nudge bienveillant ?"
        message={
          <div className="space-y-2">
            <p className="text-sm text-[var(--text-muted)]">
              Un message système sera envoyé dans la conversation Famille aux DEUX membres :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--text-muted)]">
              {nudge?.raisons?.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            <p className="text-xs text-[var(--text-muted)]">
              Ton du message : bienveillant, jamais culpabilisant (RG12.5).
            </p>
          </div>
        }
        confirmLabel="Envoyer le nudge"
        onConfirm={() => {
          if (nudge) {
            envoyerNudge(nudge.binomeId);
            setNudge(null);
          }
        }}
        loading={nudgeEnCours}
      />
    </div>
    </>
  );
}
