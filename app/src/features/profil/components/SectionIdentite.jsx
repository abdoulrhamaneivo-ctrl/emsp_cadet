import { useRef } from "react";
import { Camera, Lock, Mail } from "lucide-react";
import Avatar from "@shared/components/Avatar";

/**
 * Section identité (doc 11 §4) : avatar XL avec badge caméra (upload photo),
 * prénom/nom éditables, email affiché en lecture seule (jamais
 * modifiable ici).
 */
export default function SectionIdentite({ moi, surPrenom, surNom, surPhoto, chargementPhoto }) {
  const refFichier = useRef(null);

  const choisir = (e) => {
    const fichier = e.target.files?.[0];
    if (fichier) surPhoto(fichier);
    e.target.value = "";
  };

  return (
    <section
      aria-labelledby="titre-identite"
      className="rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-card)]"
    >
      <h2 id="titre-identite" className="sr-only">
        Identité
      </h2>
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <Avatar
            prenom={moi.prenom}
            nom={moi.nom}
            id={moi.id}
            size="xl"
            photoUrl={moi.photoUrl}
          />
          <button
            type="button"
            onClick={() => refFichier.current?.click()}
            disabled={chargementPhoto}
            aria-label="Changer ma photo"
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--bg-panel)] bg-[var(--emsp-gold)] text-[#16281c] shadow-[var(--shadow-card)] disabled:opacity-60"
          >
            <Camera size={15} aria-hidden="true" />
          </button>
          <input
            ref={refFichier}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={choisir}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="grid min-w-0 gap-2 sm:grid-cols-2">
            <label className="flex min-w-0 flex-col gap-1">
              <span className="text-xs font-semibold text-[var(--text-muted)]">Prénom</span>
              <input
                className="w-full rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                value={moi.prenom}
                onChange={(e) => surPrenom(e.target.value)}
                maxLength={80}
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1">
              <span className="text-xs font-semibold text-[var(--text-muted)]">Nom</span>
              <input
                className="w-full rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                value={moi.nom}
                onChange={(e) => surNom(e.target.value)}
                maxLength={80}
              />
            </label>
          </div>
          <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Mail size={13} aria-hidden="true" className="shrink-0" />
            <span className="truncate">{moi.email}</span>
            <Lock size={11} aria-hidden="true" className="shrink-0" aria-label="Non modifiable" />
          </p>
        </div>
      </div>
    </section>
  );
}
