import React, { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import posts from "../data/blog.json";
import Head from "../lib/Head";

const SITE_URL = "https://priscy-orcin.vercel.app";
const COVER_URL = "https://priscy-orcin.vercel.app/og-cover.jpg";
const LOGO_URL = "https://priscy-orcin.vercel.app/logo.png";
const TITLE = "Blog — Priscy Designs";
const DESCRIPTION =
  "Explore UI/UX, full-stack development, branding, and product design projects.";

const PER_PAGE = 6;

export default function Blog() {
  const jsonLdWebPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    url: `${SITE_URL}/blog`,
    description: DESCRIPTION,
    primaryImageOfPage: { "@type": "ImageObject", url: COVER_URL },
    publisher: {
      "@type": "Organization",
      name: "Priscy Designs",
      logo: { "@type": "ImageObject", url: LOGO_URL },
    },
  };

  const [params, setParams] = useSearchParams();
  const pageFromUrl = Number(params.get("page")) || 1;

  const totalPages = Math.max(1, Math.ceil(posts.length / PER_PAGE));
  const page = Math.min(Math.max(1, pageFromUrl), totalPages);

  // Keep URL clean & valid if someone types ?page=999 or ?page=abc
  useEffect(() => {
    if (page !== pageFromUrl)
      setParams({ page: String(page) }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageFromUrl]);

  // Slice the posts for this page
  const pagePosts = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return posts.slice(start, start + PER_PAGE);
  }, [page]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const goto = (p) => setParams({ page: String(p) });

  return (
    <>
      <Head
        title={TITLE}
        description={DESCRIPTION}
        canonical={SITE_URL}
        og={{ url: SITE_URL, image: COVER_URL, siteName: "Priscy Designs" }}
        twitter={{ image: COVER_URL }}
        jsonLd={jsonLdWebPage}
      />
      <div className="mt-14 lg:mt-16 bg-[var(--card)] text-[var(--text)] rounded-2xl p-3">
        <h1 className="text-3xl py-3">Recent Posts</h1>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pagePosts.map((p) => (
            <article
              key={p.id}
              className="rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden flex flex-col justify-between"
            >
              <img
                src={p.coverImage}
                alt={p.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <p className="text-xs text-gray-500">
                  {p.category} • {new Date(p.date).toLocaleDateString()}
                </p>
                <h3 className="text-lg font-semibold mt-1">{p.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mt-1">
                  {p.excerpt}
                </p>
                <Link
                  to={`/blog/${p.slug}`}
                  className="inline-block mt-3 text-blue-600 hover:underline"
                >
                  See More →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        <nav
          className="mt-8 flex items-center justify-center gap-2"
          aria-label="Pagination"
        >
          <button
            onClick={() => goto(page - 1)}
            disabled={page === 1}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-800 disabled:opacity-50"
          >
            Prev
          </button>

          {/* Page numbers (simple: show all; you can window this if pages get big) */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goto(p)}
              aria-current={p === page ? "page" : undefined}
              className={`px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-800
              ${p === page ? "bg-blue-600 text-white border-blue-600" : ""}`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => goto(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-800 disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      </div>
    </>
  );
}
