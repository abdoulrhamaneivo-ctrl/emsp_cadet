import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleHelp,
  Handshake,
  Inbox,
  Link2,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { useAuth } from "@app/providers/Auth";
import { useMonParrainage } from "@features/annuaire/hooks/useParrains";
import { useDemandes } from "@features/parrainage/hooks/useDemandes";
import { useEvenements } from "@features/evenements/hooks/useEvenements";
import { useConversations } from "@features/messagerie/hooks/useConversations";
import WidgetFAQ from "@shared/components/WidgetFAQ";
import Carousel from "@shared/components/Carousel";

const raccourcis = [
  {
    titre: "Trouver un Aîné",
    description: "Découvre les profils et trouve le bon accompagnement.",
    lien: "/annuaire",
    Icone: Users,
  },
  {
    titre: "Mon parrainage",
    description: "Suis ton binôme, tes demandes et tes accompagnements.",
    lien: "/mon-parrainage",
    Icone: Handshake,
  },
  {
    titre: "Fil d’actualité",
    description: "Partage une question, une idée ou une réussite.",
    lien: "/fil",
    Icone: Sparkles,
  },
  {
    titre: "Événements",
    description: "Retrouve les ateliers et rendez-vous de la communauté.",
    lien: "/evenements",
    Icone: CalendarDays,
  },
];

function formatDate(dateHeure) {
  if (!dateHeure) return "Date à confirmer";
  const date = new Date(dateHeure);
  if (Number.isNaN(date.getTime())) return "Date à confirmer";
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function dateDuJour() {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

function nomConversation(conversation) {
  if (conversation.type === "prive" && conversation.interlocuteur) {
    return `${conversation.interlocuteur.prenom} ${conversation.interlocuteur.nom}`.trim();
  }
  return conversation.groupe?.titre ?? "Conversation de groupe";
}

function CarteChiffre({ Icone, libelle, valeur, note, enChargement, enErreur }) {
  return (
    <div className="tile dash-stat">
      <span className="dash-stat-icon"><Icone size={19} aria-hidden="true" /></span>
      <b>{enChargement ? "…" : enErreur ? "—" : valeur}</b>
      <span className="dash-stat-label">{libelle}</span>
      {note && <span className="dash-stat-note">{note}</span>}
    </div>
  );
}

/** /accueil — tableau de bord connecté, dans le langage visuel EMSP Connect. */
export default function AccueilPage() {
  const [faqOuvert, setFaqOuvert] = useState(false);
  const { user } = useAuth();
  const {
    data: monParrainage,
    isPending: parrainageEnChargement,
    isError: parrainageEnErreur,
  } = useMonParrainage();
  const {
    data: evenementsData,
    isPending: evenementsEnChargement,
    isError: evenementsEnErreur,
  } = useEvenements("a_venir");
  const {
    data: conversationsData,
    isPending: conversationsEnChargement,
    isError: conversationsEnErreur,
  } = useConversations();
  const {
    data: demandesData,
    isPending: demandesEnChargement,
    isError: demandesEnErreur,
  } = useDemandes("recues");

  const evenements = evenementsData?.results ?? [];
  const conversations = conversationsData?.results ?? [];
  const demandesEnAttente = (demandesData?.results ?? []).filter(
    (demande) => demande.statut === "en_attente",
  ).length;
  const messagesNonLus = conversations.reduce((total, conversation) => total + (conversation.nonLus || 0), 0);
  const nombreBinomes = Number(Boolean(monParrainage?.monAine ?? monParrainage?.binomeActif))
    + (monParrainage?.cadetsActifs?.length ?? 0);
  const prochainEvenement = useMemo(
    () => [...evenements].sort((a, b) => new Date(a.dateHeure) - new Date(b.dateHeure))[0] ?? null,
    [evenements],
  );
  const misesEnAvant = useMemo(() => {
    const aUnBinome = Boolean(monParrainage?.monAine ?? monParrainage?.binomeActif)
      || Boolean(monParrainage?.cadetsActifs?.length);
    return [
      {
        id: "parrainage",
        kicker: demandesEnAttente > 0 ? "Demandes à traiter" : aUnBinome ? "Parrainage actif" : "Pour commencer",
        titre: demandesEnAttente > 0
          ? `${demandesEnAttente} demande${demandesEnAttente > 1 ? "s" : ""} en attente de ta réponse`
          : aUnBinome ? "Continue à faire grandir ton binôme" : "Trouve la personne qui te fera avancer",
        texte: demandesEnAttente > 0
          ? "Consulte les demandes reçues et réponds depuis ton espace de parrainage."
          : aUnBinome ? "Retrouve tes accompagnements, échanges et objectifs au même endroit."
            : "Parcours l’annuaire par filière, compétence ou promotion.",
        cta: demandesEnAttente > 0 ? "Voir les demandes" : aUnBinome ? "Voir mon parrainage" : "Ouvrir l’annuaire",
        lien: demandesEnAttente > 0 ? "/mes-demandes" : aUnBinome ? "/mon-parrainage" : "/annuaire",
        Icone: demandesEnAttente > 0 ? Inbox : aUnBinome ? Handshake : Users,
        fond: "linear-gradient(135deg, #0b7a3b, #075b2b)",
      },
      {
        id: "evenements",
        kicker: prochainEvenement ? "À ne pas manquer" : "Événements EMSP",
        titre: prochainEvenement?.titre ?? "Rencontre la communauté",
        texte: prochainEvenement
          ? `${formatDate(prochainEvenement.dateHeure)} · ${prochainEvenement.enLigne ? "En ligne" : prochainEvenement.lieu || "Lieu à confirmer"}`
          : "Consulte les ateliers, rencontres et conférences publiés sur la plateforme.",
        cta: prochainEvenement ? "Voir l’événement" : "Voir les événements",
        lien: prochainEvenement ? `/evenements/${prochainEvenement.id}` : "/evenements",
        Icone: CalendarDays,
        fond: "linear-gradient(135deg, #b88b00, #ffcb05)",
      },
      {
        id: "messagerie",
        kicker: messagesNonLus > 0 ? "Messages non lus" : "Reste en contact",
        titre: messagesNonLus > 0
          ? `${messagesNonLus} nouveau${messagesNonLus > 1 ? "x" : ""} message${messagesNonLus > 1 ? "s" : ""}`
          : "Poursuis tes échanges",
        texte: messagesNonLus > 0
          ? "Retrouve tes conversations privées et de groupe."
          : "Échange avec ton binôme et garde le lien avec la communauté.",
        cta: "Ouvrir la messagerie",
        lien: "/messagerie",
        Icone: messagesNonLus > 0 ? MessageCircle : Link2,
        fond: "linear-gradient(135deg, #1f58a3, #0e2016)",
      },
    ];
  }, [demandesEnAttente, messagesNonLus, monParrainage, prochainEvenement]);

  return (
    <div className="page dashboard-page">
      <header className="ph dashboard-heading">
        <div>
          <p className="eyebrow">{dateDuJour()}</p>
          <h1>Bonjour{user?.prenom ? `, ${user.prenom}` : ""} 👋</h1>
          <p className="sub">
            {user?.classe ? `${user.classe} · ` : ""}Retrouve ici ta communauté et les prochaines étapes de ton parcours.
          </p>
        </div>
        <div className="acts">
          <button className="btn" type="button" onClick={() => setFaqOuvert(true)}>
            <CircleHelp size={17} aria-hidden="true" /> Besoin d’aide ?
          </button>
          <Link className="btn pri" to="/annuaire">
            Trouver un Aîné <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <Carousel
        className="dashboard-carousel"
        slideClassName="dash-slide"
        items={misesEnAvant}
        ariaLabel="À la une de mon espace"
        controlsStyle={{ left: 36, bottom: 16 }}
        getLabel={(slide, index) => `À la une ${index + 1} : ${slide.kicker}`}
        renderSlide={(slide) => (
          <div className="dhero" style={{ background: slide.fond }}>
            <slide.Icone className="ic l bigbg" aria-hidden="true" />
            <span className="badge dhero-badge">{slide.kicker}</span>
            <h2>{slide.titre}</h2>
            <p>{slide.texte}</p>
            <Link className="btn acc" to={slide.lien}>{slide.cta} <ArrowRight className="ic s" aria-hidden="true" /></Link>
          </div>
        )}
      />

      <section className="tiles" aria-label="Résumé de mon espace">
        <CarteChiffre
          Icone={Handshake}
          libelle="Binômes actifs"
          valeur={nombreBinomes}
          note={monParrainage?.monAine ? "Ton Aîné et tes cadets" : "Tes accompagnements"}
          enChargement={parrainageEnChargement}
          enErreur={parrainageEnErreur}
        />
        <CarteChiffre
          Icone={MessageCircle}
          libelle="Messages non lus"
          valeur={messagesNonLus}
          note="Dans ta messagerie"
          enChargement={conversationsEnChargement}
          enErreur={conversationsEnErreur}
        />
        <CarteChiffre
          Icone={CalendarDays}
          libelle="Événements à venir"
          valeur={evenementsData?.count ?? evenements.length}
          note="Pour la communauté"
          enChargement={evenementsEnChargement}
          enErreur={evenementsEnErreur}
        />
        <CarteChiffre
          Icone={Users}
          libelle="Demandes reçues"
          valeur={user?.candidatureAineOuverte ? demandesEnAttente : "—"}
          note={user?.candidatureAineOuverte ? "À consulter" : "Ouvertes aux Aînés"}
          enChargement={demandesEnChargement && Boolean(user?.candidatureAineOuverte)}
          enErreur={demandesEnErreur && Boolean(user?.candidatureAineOuverte)}
        />
      </section>

      <div className="cols2 dashboard-columns">
        <div className="stk">
          <section className="card pp" aria-labelledby="titre-raccourcis">
            <div className="ch">
              <div>
                <p className="eyebrow">Avance à ton rythme</p>
                <h2 id="titre-raccourcis">Les espaces de la plateforme</h2>
              </div>
            </div>
            <div className="dashboard-shortcuts">
              {raccourcis.map(({ titre, description, lien, Icone }) => (
                <Link className="dashboard-shortcut" to={lien} key={lien}>
                  <span className="dashboard-shortcut-icon"><Icone size={19} aria-hidden="true" /></span>
                  <span className="grow">
                    <b>{titre}</b>
                    <span className="t">{description}</span>
                  </span>
                  <ArrowRight size={17} aria-hidden="true" className="dashboard-shortcut-arrow" />
                </Link>
              ))}
            </div>
          </section>

          <section className="card pp" aria-labelledby="titre-evenement">
            <div className="ch">
              <div>
                <p className="eyebrow">À la une</p>
                <h2 id="titre-evenement">Prochain événement</h2>
              </div>
              <Link className="text-link" to="/evenements">Tout voir <ArrowRight size={15} aria-hidden="true" /></Link>
            </div>
            {evenementsEnChargement ? (
              <p className="sub">Chargement des événements…</p>
            ) : evenementsEnErreur ? (
              <p className="sub">Les événements sont temporairement indisponibles.</p>
            ) : prochainEvenement ? (
              <Link className="dashboard-event" to={`/evenements/${prochainEvenement.id}`}>
                <span className="dashboard-event-date">
                  <CalendarDays size={20} aria-hidden="true" />
                  <span>{formatDate(prochainEvenement.dateHeure)}</span>
                </span>
                <span className="dashboard-event-title">{prochainEvenement.titre}</span>
                <span className="dashboard-event-meta">
                  {prochainEvenement.enLigne ? "En ligne" : prochainEvenement.lieu || "Lieu à confirmer"}
                  {prochainEvenement.type ? ` · ${prochainEvenement.type}` : ""}
                </span>
                <span className="badge pri"><Check size={13} aria-hidden="true" /> Découvrir</span>
              </Link>
            ) : (
              <div className="dashboard-empty">
                <span className="dashboard-empty-icon"><CalendarDays size={20} aria-hidden="true" /></span>
                <div>
                  <b>Aucun événement programmé pour le moment</b>
                  <p className="sub">Les prochaines rencontres apparaîtront dans cet espace.</p>
                </div>
                <Link className="btn sm" to="/evenements">Voir les événements</Link>
              </div>
            )}
          </section>
        </div>

        <aside className="stk">
          <section className="card pp" aria-labelledby="titre-messagerie">
            <div className="ch">
              <div>
                <p className="eyebrow">Reste en contact</p>
                <h2 id="titre-messagerie">Messagerie</h2>
              </div>
              <Link className="text-link" to="/messagerie">Ouvrir <ArrowRight size={15} aria-hidden="true" /></Link>
            </div>
            {conversationsEnChargement ? (
              <p className="sub">Chargement des conversations…</p>
            ) : conversationsEnErreur ? (
              <p className="sub">La messagerie est temporairement indisponible.</p>
            ) : conversations.length > 0 ? (
              <div className="dashboard-conversations">
                {conversations.slice(0, 3).map((conversation) => (
                  <Link className="dashboard-conversation" to={`/messagerie/${conversation.id}`} key={conversation.id}>
                    <span className="dashboard-conversation-icon"><MessageCircle size={17} aria-hidden="true" /></span>
                    <span className="grow">
                      <b>{nomConversation(conversation)}</b>
                      <span className="t">{conversation.dernierMessage?.contenu || "Commence la conversation"}</span>
                    </span>
                    {conversation.nonLus > 0 && <span className="nb">{conversation.nonLus}</span>}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="dashboard-empty compact">
                <span className="dashboard-empty-icon"><MessageCircle size={20} aria-hidden="true" /></span>
                <div>
                  <b>Ta messagerie t’attend</b>
                  <p className="sub">Tes échanges avec tes binômes apparaîtront ici.</p>
                </div>
              </div>
            )}
          </section>

          <section className="dashboard-note">
            <span className="dashboard-note-icon"><Sparkles size={19} aria-hidden="true" /></span>
            <div>
              <b>Une question sur EMSP Connect ?</b>
              <p>Pose-la à l’assistant ou échange avec la communauté.</p>
              <button type="button" onClick={() => setFaqOuvert(true)}>
                Demander à l’assistant <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          </section>
        </aside>
      </div>

      <WidgetFAQ open={faqOuvert} onClose={() => setFaqOuvert(false)} />
    </div>
  );
}
