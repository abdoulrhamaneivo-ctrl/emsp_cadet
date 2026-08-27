import React, { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import projectsData from "../data/projects.json";

/**
 * Props:
 * - pagination  (boolean)  => show Prev/Next controls and read/write ?page=   (default: true)
 * - perPage     (number)   => items per page                                  (default: 4)
 * - prevText    (string)   => label for Prev                                  (default: "Prev")
 * - nextText    (string)   => label for Next                                  (default: "Next")
 */
export default function ProjectCards({
  pagination = true,
  perPage = 4,
  prevText = "Prev",
  nextText = "Next",
}) {
  const [params, setParams] = useSearchParams();

  // Always call hooks; ignore when pagination=false
  const pageFromUrl = Number(params.get("page")) || 1;

  const totalPages = Math.max(1, Math.ceil(projectsData.length / (perPage || 1)));
  const page = pagination ? Math.min(Math.max(1, pageFromUrl), totalPages) : 1;

  // Keep URL valid if someone types ?page=abc or too big
  useEffect(() => {
    if (!pagination) return;
    if (page !== pageFromUrl) {
      setParams({ page: String(page) }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination, page, pageFromUrl]);

  // Slice for this page (or first chunk if pagination=false)
  const projects = useMemo(() => {
    const start = (page - 1) * perPage;
    return projectsData.slice(start, start + perPage);
  }, [page, perPage]);

  // Scroll to top when changing page (only when paginating)
  useEffect(() => {
    if (!pagination) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pagination, page]);

  const goto = (p) => setParams({ page: String(p) });

  return (
    <section className="space-y-6" aria-labelledby="projects-heading">
      <h2 id="projects-heading" className="sr-only">
        Projects
      </h2>

      {/* Grid list */}
      <ul className="grid lg:grid-cols-2 gap-3" role="list">
        {projects.map((p, i) => {
          const slug = p.slug ?? p.title.toLowerCase().replace(/\s+/g, "-");
          const key = p.id ?? slug ?? `${p.title}-${i}`;
          return (
            <li key={key} className="list-none">
              <article
                className="bg-[var(--card)] border border-[var(--border)] text-[var(--text)] rounded-lg"
                aria-labelledby={`proj-title-${key}`}
              >
                <Link
                  to={`/portfolio/${slug}`}
                  className="block bg-[var(--card)] p-3 rounded-xl h-64 focus:outline-none focus-visible:ring focus-visible:ring-blue-500"
                  aria-label={`Open project: ${p.title}`}
                >
                  <figure className="h-full w-full m-0">
                    <img
                      src={p.coverImage}
                      alt={p.title}
                      className="h-full w-full rounded-lg object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    {/* figcaption is optional; keep SR-only to avoid visual noise */}
                    <figcaption className="sr-only">{p.title}</figcaption>
                  </figure>
                </Link>

                <div className="px-3 pt-0 flex flex-col gap-2 lg:flex-row lg:justify-between lg:items-center">
                  <h3 id={`proj-title-${key}`} className="text-xl font-semibold">
                    <Link
                      to={`/portfolio/${slug}`}
                      className="hover:underline focus:outline-none focus-visible:ring focus-visible:ring-blue-500 rounded"
                    >
                      {p.title}
                    </Link>
                  </h3>

                  <Link
                    to={`/portfolio/${slug}`}
                    className="text-blue-500 underline font-semibold"
                    aria-label={`See project details for ${p.title}`}
                  >
                    See Project
                  </Link>
                </div>

                {p.category && (
                  <p className="px-5 pb-3 text-sm text-gray-600 dark:text-gray-300">
                    <span className="sr-only">Category: </span>
                    {p.category}
                  </p>
                )}
              </article>
            </li>
          );
        })}
      </ul>

      {/* Prev / Next (optional) */}
      {pagination && (
        <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
          <button
            type="button"
            onClick={() => goto(page - 1)}
            disabled={page === 1}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-800 disabled:opacity-50"
            aria-label="Go to previous page"
          >
            {prevText}
          </button>

          {/* Announce page changes politely for AT */}
          <span
            className="text-sm text-gray-600 dark:text-gray-300 px-2"
            aria-live="polite"
          >
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => goto(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-800 disabled:opacity-50"
            aria-label="Go to next page"
          >
            {nextText}
          </button>
        </nav>
      )}
    </section>
  );
}
