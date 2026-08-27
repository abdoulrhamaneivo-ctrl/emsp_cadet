import React from "react";
import { Link } from "react-router-dom";
import rightArrow from "/assets/arrow-right.svg";
import workData from "../data/work.json";

export default function ServiceOffer() {
  const workLimit = workData.slice(0, 4);

  return (
    <section
      className="bg-[var(--card)] border border-[var(--border)] text-[var(--text)] rounded-xl p-3 flex flex-col gap-6 lg:col-span-2"
      aria-labelledby="services-offer-heading"
    >
      <div className="flex flex-col gap-2 lg:justify-between">
        <h2 id="services-offer-heading" className="text-2xl font-semibold">
          Services I Offer
        </h2>

        <nav aria-label="All services">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-blue-500 font-semibold hover:underline focus:outline-none focus-visible:ring focus-visible:ring-blue-500 rounded"
            aria-label="See all services"
          >
            <span>See All Services</span>
            <img
              src={rightArrow}
              alt=""              /* decorative */
              aria-hidden="true"
              className="w-4 h-4"
              loading="lazy"
              decoding="async"
            />
          </Link>
          <hr className="text-gray-400" />
        </nav>
      </div>

      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-5" role="list">
        {workLimit.map((work) => (
          <li key={work.id} className="list-none">
            <article
              className="bg-[var(--card)] border border-[var(--border)] text-[var(--text)] rounded-xl p-5 flex flex-col gap-3"
              aria-labelledby={`service-title-${work.id}`}
            >
              <figure className="bg-[var(--card)] border border-[var(--border)] text-[var(--text)] rounded-lg px-5 py-8 flex items-center justify-center">
                <img
                  src={work.image}
                  alt=""                 /* decorative brand/service icon */
                  aria-hidden="true"
                  className="w-14 h-14 object-contain"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption className="sr-only">{work.company}</figcaption>
              </figure>

              <h3
                id={`service-title-${work.id}`}
                className="text-center text-lg font-semibold"
              >
                {work.company}
              </h3>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
