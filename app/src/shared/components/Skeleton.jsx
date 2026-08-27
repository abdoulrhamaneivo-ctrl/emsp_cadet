import { cx } from "@shared/utils/cx";

/** Base shimmer commune (doc 03 §6.10 + styles/animations.css). */
function Base({ className, ...props }) {
  return <div aria-hidden="true" className={cx("skeleton-shimmer rounded-md", className)} {...props} />;
}

/** Texte : N lignes, la dernière plus courte. */
export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cx("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Base
          key={i}
          className={cx("h-3.5", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

/** Carte entière au format du contenu final. */
export function SkeletonCard({ className }) {
  return (
    <div className={cx("rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-5", className)}>
      <div className="flex items-center gap-3 mb-4">
        <Base className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Base className="h-3.5 w-1/2" />
          <Base className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

/** Avatar rond. */
export function SkeletonAvatar({ size = 40, className }) {
  return <Base className={cx("rounded-full", className)} style={{ width: size, height: size }} />;
}

/** Ligne de tableau/liste. */
export function SkeletonRow({ className }) {
  return (
    <div className={cx("flex items-center gap-3 py-2.5", className)}>
      <SkeletonAvatar size={32} />
      <Base className="h-3.5 flex-1" />
      <Base className="h-3.5 w-20" />
    </div>
  );
}
