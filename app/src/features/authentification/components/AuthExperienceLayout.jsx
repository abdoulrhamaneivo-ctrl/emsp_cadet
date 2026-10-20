import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import LogoMark from "@shared/components/LogoMark";

/** Shared visual frame for the sign-up, email, and password journeys. */
export default function AuthExperienceLayout({
  children,
  eyebrow = "La communauté EMSP",
  storyTitle,
  storyText,
  image = "/images/emsp/cadets-en-cours.webp",
  imageAlt = "Des étudiants de l'EMSP réunis dans une salle de cours",
  highlights = [],
  actionLabel = "Déjà membre ?",
  actionText = "Connexion",
  actionTo = "/connexion",
  caption = "Une école. Plusieurs promotions. Un même réseau.",
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7f1]">
      <header className="relative z-10 border-b border-[#dce5df] bg-white/95">
        <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2.5 text-[#10251a] no-underline" aria-label="EMSP Connect, accueil">
            <LogoMark />
            <span className="font-display text-base font-bold sm:text-lg">EMSP Connect</span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden text-[var(--text-muted)] sm:inline">{actionLabel}</span>
            <Link
              to={actionTo}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#cbd8d0] bg-white px-4 font-semibold text-[#075b2b] transition-colors hover:border-[#075b2b] hover:bg-[#f0f7f1]"
            >
              {actionText}<ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 items-start gap-5 px-4 py-5 sm:px-6 sm:py-7 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,.98fr)] lg:items-center lg:gap-10 lg:px-8 lg:py-8">
        <aside className="relative isolate order-2 flex min-h-[280px] flex-col justify-between overflow-hidden rounded-[26px] bg-[#075b2b] p-6 text-white shadow-[0_20px_55px_-28px_rgba(7,45,24,.6)] sm:min-h-[310px] sm:p-8 lg:sticky lg:top-6 lg:order-1 lg:min-h-[610px] lg:self-start lg:p-10">
          <img
            src={image}
            alt={imageAlt}
            className="absolute inset-0 z-0 h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#062e1c]/60 via-[#064323]/45 to-[#052f1c]/95" aria-hidden="true" />
          <div className="absolute -right-16 top-16 z-10 h-64 w-64 rounded-full border border-white/20" aria-hidden="true" />
          <div className="absolute -right-5 top-28 z-10 h-44 w-44 rounded-full border border-[#ffcb05]/40" aria-hidden="true" />

          <div className="relative z-20 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#062e1c]/55 px-3 py-1.5 text-xs font-bold tracking-wide text-[#ffdc55] backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[#ffcb05] shadow-[0_0_12px_rgba(255,203,5,.8)]" aria-hidden="true" />
              {eyebrow}
            </span>
            <span className="hidden items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm sm:inline-flex">
              <ShieldCheck size={14} aria-hidden="true" /> Espace sécurisé
            </span>
          </div>

          <div className="relative z-20 mt-8 max-w-xl lg:mt-auto lg:pt-20">
            <p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-[#ffdc55]">École Multinationale des Postes · Abidjan</p>
            <h2 className="max-w-lg font-display text-3xl font-extrabold leading-[1.04] tracking-tight sm:text-4xl lg:text-[2.8rem]">
              {storyTitle}
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/90 sm:text-base">{storyText}</p>

            {highlights.length > 0 && (
              <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {highlights.map(({ icon: Icon = CheckCircle2, title, text }) => (
                  <div key={title} className="flex items-start gap-3 rounded-2xl border border-white/15 bg-[#062e1c]/45 p-3 backdrop-blur-sm sm:p-3.5">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#ffcb05] text-[#17351f]">
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-white">{title}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-white/75">{text}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="relative z-20 mt-6 border-t border-white/20 pt-4 text-xs font-semibold tracking-wide text-white/85 lg:mt-8">{caption}</p>
        </aside>

        <section className="order-1 flex min-w-0 items-center justify-center lg:order-2">
          <div className="w-full max-w-[540px]">{children}</div>
        </section>
      </div>

      <footer className="border-t border-[#dce5df] bg-white/80">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-[#52635a] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>Un souci avec ton compte ? <a className="font-semibold text-[#075b2b] hover:underline" href="mailto:support@emsp.int">Contacter le support</a></p>
          <p>© {new Date().getFullYear()} EMSP Connect · Abidjan</p>
        </div>
      </footer>
    </div>
  );
}
