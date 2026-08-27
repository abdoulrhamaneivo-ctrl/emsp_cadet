import React from "react";
import rightArrow from "/assets/arrow-right.svg";
import { Link } from "react-router-dom";

export default function WorkTogetherCard() {
  const ticker =
    "Available For Hire — Crafting Digital Experiences — Available For Hire — Crafting Digital Experiences";

  return (
    <section
      className="bg-[var(--card)] border border-[var(--border)] text-[var(--text)] rounded-xl p-7 flex flex-col gap-6 justify-between"
      aria-labelledby="work-together-heading"
    >
      {/* Marquee (hidden from AT; provide SR-only static alt below) */}
      <div
        className="group relative overflow-hidden rounded-lg bg-gray-200 py-2"
        aria-hidden="true"
      >
        <div className="marquee flex w-max whitespace-nowrap group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
          <p className="px-4 py-2 text-xl text-gray-800">{ticker}</p>
          {/* duplicate for seamless loop */}
          <p
            className="px-4 py-2 text-xl font-semibold text-gray-800"
            aria-hidden="true"
          >
            {ticker}
          </p>
        </div>
      </div>
      {/* SR-only static equivalent of the marquee text */}
      <p className="sr-only">
        Available for hire. Crafting digital experiences.
      </p>

      <h2
        id="work-together-heading"
        className="text-4xl font-semibold leading-11 lg:leading-13"
      >
        <span>Let&apos;s</span>
        <span aria-hidden="true">👋</span>
        <br />
        Work Together
      </h2>

      <div className="flex flex-col w-[40%] lg:w-[40%]">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-blue-500 font-semibold hover:underline focus:outline-none focus-visible:ring focus-visible:ring-blue-500 rounded"
          aria-label="Contact me about services"
        >
          <span>Let&apos;s Talk</span>
          <img
            src={rightArrow}
            alt=""
            aria-hidden="true"
            className="w-4 h-4"
            loading="lazy"
            decoding="async"
          />
        </Link>
        <hr className="text-gray-400" aria-hidden="true" />
      </div>

      {/* Local styles for the marquee + reduced-motion support */}
      <style>{`
        @keyframes marquee-x {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } /* moves past the first copy */
        }
        .marquee {
          animation: marquee-x 18s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
