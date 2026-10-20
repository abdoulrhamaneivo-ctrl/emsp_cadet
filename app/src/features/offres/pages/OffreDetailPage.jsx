import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, Calendar, MapPin, Send, ShieldCheck } from "lucide-react";
import { useAuth } from "@app/providers/Auth";
import Button from "@shared/components/Button";
import Card from "@shared/components/Card";
import { offresApi } from "../api";

function messageErreur(error) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  const premierChamp = Object.values(error?.response?.data ?? {}).flat().find((value) => typeof value === "string");
  return premierChamp ?? "La demande n'a pas pu aboutir. Réessaie dans un instant.";
}

function dateLisible(valeur) {
  if (!valeur) return "À convenir";
  const date = new Date(valeur);
  return Number.isNaN(date.getTime()) ? "À convenir" : date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function OffreDetailPage() {
  const { offreId } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");
  const { data: offre, isPending, isError } = useQuery({
    queryKey: ["offre", offreId],
    queryFn: () => offresApi.detail(offreId),
  });
  const peutVoirCandidatures = Boolean(offre && (offre.estAuteur || user?.isAdmin));
  const { data: candidaturesData, isPending: candidaturesEnChargement, isError: candidaturesEnErreur } = useQuery({
    queryKey: ["offre-candidatures", offreId],
    queryFn: () => offresApi.candidatures(offreId),
    enabled: peutVoirCandidatures,
  });
  const candidature = useMutation({
    mutationFn: () => offresApi.candidater(offreId, { message }),
    onSuccess: () => {
      setErreur("");
      queryClient.invalidateQueries({ queryKey: ["offres"] });
      queryClient.invalidateQueries({ queryKey: ["offre", offreId] });
    },
    onError: (error) => setErreur(messageErreur(error)),
  });

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <Button variant="ghost" to="/offres" icon={ArrowLeft} className="self-start">Retour aux offres</Button>

      {isPending ? (
        <div className="h-80 animate-pulse rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-panel)]" role="status" aria-label="Chargement de l'offre" />
      ) : isError || !offre ? (
        <Card className="p-6 text-center" role="alert">
          <h1 className="font-display text-xl font-bold text-[var(--text-primary)]">Cette offre n'est plus disponible</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Elle a peut-être expiré ou a été retirée par son auteur.</p>
        </Card>
      ) : (
        <>
          <Card className="p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-green)]">{offre.typeContrat} · {offre.entreprise}</p>
                <h1 className="mt-2 font-display text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">{offre.titre}</h1>
              </div>
              {offre.estAuteur && <span className="rounded-full bg-[var(--bg-panel-alt)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)]">Offre publiée par toi</span>}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 border-b border-[var(--border-soft)] pb-5 text-sm text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5"><MapPin size={15} aria-hidden="true" />{offre.localisation}</span>
              <span className="flex items-center gap-1.5"><Calendar size={15} aria-hidden="true" />Candidatures jusqu'au {dateLisible(offre.dateLimite)}</span>
              {offre.salaire && <span>{offre.salaire}</span>}
              {offre.telework && <span>{offre.telework}</span>}
            </div>
            <section className="mt-6">
              <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">La mission</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--text-muted)]">{offre.mission}</p>
            </section>
            <section className="mt-6">
              <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">Profil recherché</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--text-muted)]">{offre.profil}</p>
            </section>
            <section className="mt-6">
              <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">Modalités</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--text-muted)]">{offre.modalites}</p>
            </section>
          </Card>

          <Card className="p-6 sm:p-8" id="candidater">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--bg-panel-alt)] text-[var(--accent-green)]"><BriefcaseBusiness size={21} aria-hidden="true" /></span>
              <div>
                <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">Ta candidature</h2>
                <p className="text-sm text-[var(--text-muted)]">Un message de présentation est facultatif.</p>
              </div>
            </div>
            {offre.estAuteur ? (
              <p className="rounded-xl bg-[var(--bg-panel-alt)] p-4 text-sm text-[var(--text-muted)]">Tu as publié cette offre. Les étudiants peuvent candidater depuis cette page.</p>
            ) : offre.candidatureEnvoyee || candidature.isSuccess ? (
              <p role="status" className="flex items-center gap-2 rounded-xl bg-[var(--bg-panel-alt)] p-4 text-sm font-medium text-[var(--accent-green)]"><ShieldCheck size={18} aria-hidden="true" />Ta candidature a bien été envoyée.</p>
            ) : (
              <form onSubmit={(event) => { event.preventDefault(); setErreur(""); candidature.mutate(); }} className="space-y-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">Message de présentation <span className="font-normal text-[var(--text-muted)]">(facultatif)</span></span>
                  <textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} rows={4} placeholder="Explique brièvement ce qui t'intéresse dans cette offre…" className="resize-y rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-green)] focus:outline-none" />
                </label>
                {erreur && <p role="alert" className="text-sm text-[var(--danger)]">{erreur}</p>}
                <Button type="submit" loading={candidature.isPending} icon={Send}>Envoyer ma candidature</Button>
              </form>
            )}
          </Card>

          {peutVoirCandidatures && (
            <Card className="p-6 sm:p-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">Candidatures reçues</h2>
                {!candidaturesEnChargement && <span className="rounded-full bg-[var(--bg-panel-alt)] px-2.5 py-1 text-xs font-semibold text-[var(--text-muted)]">{candidaturesData?.count ?? 0}</span>}
              </div>
              {candidaturesEnChargement ? (
                <p role="status" className="text-sm text-[var(--text-muted)]">Chargement des candidatures…</p>
              ) : candidaturesEnErreur ? (
                <p role="alert" className="text-sm text-[var(--danger)]">Les candidatures ne sont pas disponibles pour le moment.</p>
              ) : candidaturesData?.results?.length ? (
                <ul className="space-y-3">
                  {candidaturesData.results.map((item) => (
                    <li key={item.id} className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-panel-alt)] p-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-semibold text-[var(--text-primary)]">{item.prenom} {item.nom}</h3>
                        <span className="text-xs text-[var(--text-muted)]">{item.classe}</span>
                      </div>
                      <a href={`mailto:${item.email}`} className="mt-1 inline-block text-sm font-medium text-[var(--accent-green)] hover:underline">{item.email}</a>
                      {item.message && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[var(--text-muted)]">{item.message}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">Aucune candidature reçue pour le moment.</p>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
