import React from "react";
import { Link } from "react-router-dom";

export default function WorkTogetherSlider() {
  const ticker = "Let's 👋 Work Together · Let's 👋 Work Together ·";

  return (
    <section
      className="max-w-full"
      aria-labelledby="work-together-slider-heading"
    >
      <h2 id="work-together-slider-heading" className="sr-only">
        Work Together Call-to-Action
      </h2>

      {/* Full-width clickable viewport */}
      <Link
        to="/contact"
        className="group block"
        aria-label="Contact me — Let's work together"
      >
        <div
          className="relative h-16 overflow-hidden rounded-lg bg-[var(--card)]
                     border border-[var(--border)] text-[var(--text)]
                     focus:outline-none focus-visible:ring focus-visible:ring-blue-500"
          tabIndex={-1}
          aria-hidden="true" /* hide animated content; static label below */
        >
          {/* Absolutely positioned track so it can't expand layout width */}
          <div className="marquee absolute inset-0 flex items-center will-change-transform group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
            <p className="px-4 text-3xl shrink-0">{ticker}</p>
            {/* duplicate for seamless loop */}
            <p className="px-4 text-3xl shrink-0" aria-hidden="true">
              {ticker}
            </p>
          </div>
        </div>

        {/* Static equivalent for screen readers */}
        <span className="sr-only">Let’s work together — contact me</span>
      </Link>

      {/* Local styles for the marquee */}
      <style>{`
        @keyframes marquee-x {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } /* slides past the first copy */
        }
        .marquee {
          animation: marquee-x 18s linear infinite;
          white-space: nowrap;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee { animation: none !important; transform: none !important; }
        }
      `}</style>
    </section>
  );
}
