import React, { useEffect, useRef, useState, useMemo } from "react";
import data from "../data/testimonials.json";

/**
 * Testimonials slider (accessible)
 * - Auto-advances every few seconds (pauses on hover/focus and reduced motion)
 * - Keyboard: Left/Right, Home/End
 * - Touch swipe on mobile
 * - Next/Prev buttons are pinned top-right on lg+
 */
export default function Testimonials({
  interval = 5000,
  loop = true,
  ariaLabel = "Client testimonials",
}) {
  const testimonials = useMemo(() => data ?? [], []);
  const count = testimonials.length;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const timerRef = useRef(null);
  const trackRef = useRef(null);
  const touchStartX = useRef(null);
  const touchDeltaX = useRef(0);

  const clamp = (i) => {
    if (count === 0) return 0;
    return loop ? (i + count) % count : Math.max(0, Math.min(count - 1, i));
  };
  const goTo = (i) => setIndex(clamp(i));
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // Reduced motion
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(!!mq?.matches);
    update();
    mq?.addEventListener?.("change", update);
    return () => mq?.removeEventListener?.("change", update);
  }, []);

  // Autoplay
  useEffect(() => {
    if (count <= 1 || paused || reducedMotion) return;
    timerRef.current = setInterval(next, interval);
    return () => clearInterval(timerRef.current);
  }, [index, paused, interval, count, reducedMotion]);

  // Pause when tab hidden
  useEffect(() => {
    const onVis = () => setPaused((p) => document.hidden || p);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Keyboard
  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(count - 1);
    }
  };

  // Touch
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    setPaused(true);
  };
  const onTouchMove = (e) => {
    if (touchStartX.current == null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    if (touchStartX.current == null) return;
    const threshold = 40;
    if (touchDeltaX.current <= -threshold) next();
    else if (touchDeltaX.current >= threshold) prev();
    touchStartX.current = null;
    touchDeltaX.current = 0;
    setPaused(false);
  };

  if (count === 0) {
    return (
      <section
        aria-label={ariaLabel}
        className="rounded-2xl p-6 bg-[var(--card)] border border-[var(--border)] text-[var(--text)]"
      >
        <h2 className="text-3xl font-semibold mb-3">Trusted By Clients</h2>
        <p>No testimonials yet.</p>
      </section>
    );
  }

  const atStart = !loop && index === 0;
  const atEnd = !loop && index === count - 1;

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="relative rounded-2xl p-6 bg-[var(--card)] border border-[var(--border)] text-[var(--text)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="testimonials-heading" className="text-3xl font-semibold">
            Trusted By 1200+ Clients
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Real words from the teams we&apos;ve partnered with.
          </p>
        </div>

        {/* Top-right controls on large screens */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            disabled={atStart}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--hover)] disabled:opacity-50"
            aria-label="Previous testimonial"
          >
            ← Prev
          </button>
          <button
            type="button"
            onClick={next}
            disabled={atEnd}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--hover)] disabled:opacity-50"
            aria-label="Next testimonial"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        className="mt-5 relative overflow-hidden rounded-xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onKeyDown={onKeyDown}
        tabIndex={0}
      >
        {/* Track */}
        <ul
          ref={trackRef}
          className={`flex ${
            reducedMotion ? "" : "transition-transform duration-500 ease-out"
          }`}
          style={{ transform: `translateX(-${index * 100}%)` }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          role="list"
        >
          {testimonials.map((t, i) => (
            <li key={t.id} className="list-none shrink-0 w-full">
              <article
                className="grid gap-5 md:grid-cols-[auto,1fr] items-start bg-[var(--card)]"
                aria-label={`Testimonial from ${t.name}`}
              >
                {/* Avatar */}
                <figure className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border border-[var(--border)] mx-auto md:mx-0">
                  <img
                    src={t.avatar}
                    alt={`Avatar of ${t.name}`}
                    className="w-full h-full object-cover"
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                  />
                  <figcaption className="sr-only">{t.name}</figcaption>
                </figure>

                {/* Quote card */}
                <div className="rounded-2xl border border-[var(--border)] p-5 bg-[var(--card)]">
                  {/* Stars */}
                  <div
                    className="flex items-center gap-1 mb-2"
                    aria-label={`Rated ${t.rating} out of 5`}
                  >
                    {[...Array(5)].map((_, s) => (
                      <svg
                        key={s}
                        viewBox="0 0 20 20"
                        className={`w-4 h-4 ${
                          s < t.rating
                            ? "text-yellow-400"
                            : "text-gray-300 dark:text-neutral-700"
                        }`}
                        aria-hidden="true"
                      >
                        <path d="M10 15.27l5.18 3.05-1.64-5.81 4.46-3.73-5.86-.5L10 2 7.86 8.28l-5.86.5 4.46 3.73-1.64 5.81L10 15.27z" />
                      </svg>
                    ))}
                  </div>

                  <blockquote className="text-lg leading-relaxed">
                    “{t.quote}”
                  </blockquote>

                  <footer className="mt-3">
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {t.role}
                    </p>
                  </footer>
                </div>
              </article>
            </li>
          ))}
        </ul>

        {/* Mobile controls (bottom overlay) */}
        <div className="flex lg:hidden justify-center gap-3 mt-4">
          <button
            type="button"
            onClick={prev}
            disabled={atStart}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--hover)] disabled:opacity-50"
            aria-label="Previous testimonial"
          >
            ← Prev
          </button>
          <button
            type="button"
            onClick={next}
            disabled={atEnd}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--hover)] disabled:opacity-50"
            aria-label="Next testimonial"
          >
            Next →
          </button>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {testimonials.map((_, i) => {
            const active = i === index;
            return (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                aria-current={active ? "true" : undefined}
                className={`h-2.5 rounded-full transition-all ${
                  active
                    ? "w-6 bg-blue-500"
                    : "w-2.5 bg-gray-300 dark:bg-neutral-700"
                }`}
              />
            );
          })}
        </div>

        {/* Live region */}
        <p className="sr-only" aria-live="polite">
          Testimonial {index + 1} of {count}. {testimonials[index]?.name}.
        </p>
      </div>
    </section>
  );
}
