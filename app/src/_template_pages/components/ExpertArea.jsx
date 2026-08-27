import React from "react";
import workData from "../data/work.json";

export default function ExpertArea() {
  return (
    <section
      className="bg-[var(--card)] border border-[var(--border)] text-[var(--text)] flex-1 px-5 rounded-xl shadow py-3 flex flex-col gap-5"
      aria-labelledby="expert-area-heading"
    >
      <h2 id="expert-area-heading" className="text-2xl font-semibold py-2">
        My Expert Area
      </h2>

      <ul className="grid grid-cols-2 lg:grid-cols-3 gap-3" role="list">
        {workData.map((work) => (
          <li key={work.id} className="mt-2 list-none">
            <figure className="bg-gray-200 rounded-xl flex items-center justify-center p-4">
              <img
                src={work.image}
                alt={`${work.company} logo`}
                className="h-8 w-20 object-contain"
                loading="lazy"
                decoding="async"
              />
              <figcaption className="sr-only">{work.company}</figcaption>
            </figure>
            <p className="text-center font-semibold">{work.company}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
