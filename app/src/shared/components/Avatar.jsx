import { cx } from "@shared/utils/cx";

const tailles = { xs: 24, sm: 32, md: 40, lg: 56, xl: 88 };

/** Hash simple → alternance fond vert/gold (doc 03 §6.4). */
function fondSelonId(id = 0) {
  return (String(id).split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 2 === 0)
    ? "bg-[var(--emsp-green-deep)] text-[var(--emsp-cream)]"
    : "bg-[var(--emsp-gold)] text-[#16281c]";
}

export default function Avatar({ prenom = "", nom = "", photoUrl, id, size = "md", status, className }) {
  const px = tailles[size] ?? tailles.md;
  const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || "?";

  return (
    <span className={cx("relative inline-block shrink-0", className)} style={{ width: px, height: px }}>
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={`Photo de ${prenom} ${nom}`}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className={cx(
            "flex w-full h-full items-center justify-center rounded-full font-bold select-none",
            fondSelonId(id),
          )}
          style={{ fontSize: Math.max(11, px * 0.34) }}
        >
          {initiales}
        </span>
      )}
      {status && (
        <span
          title={status === "online" ? "En ligne" : "Absent"}
          className={cx(
            "absolute bottom-0 right-0 block rounded-full border-2 border-[var(--bg-panel)]",
            status === "online" ? "bg-[var(--emsp-green-bright)]" : "bg-transparent border-[var(--text-muted)]",
          )}
          style={{ width: px * 0.28, height: px * 0.28 }}
        />
      )}
    </span>
  );
}
