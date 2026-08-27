import React from "react";
import brandData from "../data/brands.json";

export default function Brands() {
  const count = Array.isArray(brandData) ? brandData.length : 0;

  return (
    <section className="flex flex-col gap-5" aria-labelledby="brands-heading">
      <h2 id="brands-heading" className="text-2xl lg:text-3xl font-semibold">
        Working With 50+ Brands ✨ Worldwide
        <span className="sr-only">
          {" "}
          — currently showcasing {count} brand logos
        </span>
      </h2>

      <ul
        className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-5"
        aria-label="Brand logos"
      >
        {brandData.map((brand) => (
          <li
            key={brand.name}
            className="rounded-lg shadow py-4 px-2 bg-[var(--card)] border border-[var(--border)] text-[var(--text)]"
          >
            <figure className="flex items-center justify-center">
              <img
                src={brand.image}
                alt={`${brand.name} logo`}
                className="h-12 w-auto object-contain"
                loading="lazy"
                decoding="async"
              />
              {/* Keep the visible name out if you want it super minimal; figcaption is optional/sr-only */}
              <figcaption className="sr-only">{brand.name}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
