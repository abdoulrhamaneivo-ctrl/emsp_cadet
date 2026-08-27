import React, { useEffect, useRef, useState } from "react";

/**
 * GallerySlider (a11y tuned)
 * @param {Array<{src:string, alt?:string, caption?:string}>} images
 * @param {number} interval  ms between slides (default 4000)
 * @param {boolean} loop     wrap around (default true)
 * @param {string} ariaLabel accessible label for the carousel (default "Image gallery")
 * @param {string} imgSizes  <img sizes> attr for responsive layouts (optional)
 * @param {number} heightPx  fixed slide height in px (default 310)
 */
export default function GallerySlider({
  images = [],
  interval = 4000,
  loop = true,
  ariaLabel = "Image gallery",
  imgSizes,
  heightPx = 310,
}) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);
  const touchDeltaX = useRef(0);
  const slideCount = images.length;

  const clampIndex = (i) => {
    if (slideCount === 0) return 0;
    if (loop) return (i + slideCount) % slideCount;
    return Math.max(0, Math.min(slideCount - 1, i));
  };

  const goTo = (i) => setIndex(clampIndex(i));
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(!!mq?.matches);
    update();
    mq?.addEventListener?.("change", update);
    return () => mq?.removeEventListener?.("change", update);
  }, []);

  // Auto-play (disabled if reduced motion or paused or only 1 slide)
  useEffect(() => {
    if (slideCount <= 1 || isPaused || reducedMotion) return;
    timerRef.current = setInterval(next, interval);
    return () => clearInterval(timerRef.current);
  }, [index, isPaused, interval, slideCount, reducedMotion]);

  // Pause when tab hidden
  useEffect(() => {
    const onVis = () => setIsPaused(document.hidden || isPaused);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [isPaused]);

  // Keyboard: arrows + Home/End
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
      goTo(slideCount - 1);
    }
  };

  // Touch swipe
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    setIsPaused(true);
  };
  const onTouchMove = (e) => {
    if (touchStartX.current == null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    if (touchStartX.current == null) return;
    const threshold = 40; // px
    if (touchDeltaX.current <= -threshold) next();
    else if (touchDeltaX.current >= threshold) prev();
    touchStartX.current = null;
    touchDeltaX.current = 0;
    setIsPaused(false);
  };

  if (slideCount === 0) {
    return (
      <section
        aria-label={ariaLabel}
        className="w-full aspect-[16/9] grid place-items-center rounded-xl bg-gray-200 text-gray-600"
      >
        No images
      </section>
    );
  }

  const heightClass = `h-[${heightPx}px]`; // Tailwind won’t parse dynamic value; we’ll inline style below

  const atStart = !loop && index === 0;
  const atEnd = !loop && index === slideCount - 1;

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className="relative w-full select-none"
      style={{ height: `${heightPx}px` }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={onKeyDown}
      tabIndex={0} // focusable for keyboard control
    >
      {/* Viewport */}
      <div
        className="overflow-hidden rounded-xl bg-black/5 w-full h-full"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Track */}
        <div
          className={`flex ${reducedMotion ? "" : "transition-transform duration-500 ease-out"}`}
          style={{ transform: `translateX(-${index * 100}%)`, height: "100%" }}
        >
          {images.map((img, i) => (
            <figure key={i} className="shrink-0 w-full h-full m-0">
              <img
                src={img.src}
                alt={img.alt ?? `Slide ${i + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                sizes={imgSizes}
              />
              {img.caption && (
                <figcaption className="text-center text-sm text-gray-600 dark:text-gray-300 mt-2">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>

      {/* Left / Right controls */}
      <button
        type="button"
        aria-label="Previous slide"
        onClick={prev}
        disabled={atStart}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 dark:bg-neutral-900/80 border border-gray-300 dark:border-neutral-700 shadow px-3 py-2 hover:bg-white dark:hover:bg-neutral-900 disabled:opacity-50"
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={next}
        disabled={atEnd}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 dark:bg-neutral-900/80 border border-gray-300 dark:border-neutral-700 shadow px-3 py-2 hover:bg-white dark:hover:bg-neutral-900 disabled:opacity-50"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => {
          const active = i === index;
          return (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={active ? "true" : undefined}
              className={`h-2.5 rounded-full transition-all ${
                active ? "w-6 bg-blue-500" : "w-2.5 bg-gray-300 dark:bg-neutral-700"
              }`}
            />
          );
        })}
      </div>

      {/* Live region for screen readers */}
      <p className="sr-only" aria-live="polite">
        Slide {index + 1} of {slideCount}
        {images[index]?.caption ? ` — ${images[index].caption}` : ""}
      </p>
    </section>
  );
}
