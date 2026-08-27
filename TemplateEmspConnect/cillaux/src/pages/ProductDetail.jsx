import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import products from "../data/projects.json";
import Head from "../lib/Head";

function slugify(s) {
  return (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// tiny seeded RNG so "random" is stable per product
function seededRandom(seed) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // find product + index (hook always called)
  const { product, index } = useMemo(() => {
    const bySlug = products.findIndex((p) => p.slug === slug);
    if (bySlug !== -1) return { product: products[bySlug], index: bySlug };

    const byTitle = products.findIndex((p) => slugify(p.title) === slug);
    if (byTitle !== -1) return { product: products[byTitle], index: byTitle };

    return { product: null, index: -1 };
  }, [slug]);

  // related list (hook always called; returns [] when no product)
  const related = useMemo(() => {
    if (!product) return [];
    const pool = products.filter((p) => p !== product);
    const rng = seededRandom(product.slug ?? slugify(product.title));
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 4);
  }, [product]);

  // prev/next (compute even if product is null; values only used when product exists)
  const prevIndex =
    index === -1 ? -1 : (index - 1 + products.length) % products.length;
  const nextIndex = index === -1 ? -1 : (index + 1) % products.length;
  const prev = prevIndex === -1 ? null : products[prevIndex];
  const next = nextIndex === -1 ? null : products[nextIndex];
  const toSlug = (p) => `/portfolio/${p.slug ?? slugify(p.title)}`;

  // now it’s safe to conditionally return
  if (!product) {
    return (
      <>
        <Head
          title="Project not found — Priscy Designs"
          description="The requested project could not be found."
        />
        <div className="py-12 text-center">
          <h1 className="text-2xl font-semibold mb-2">Product not found</h1>
          <p className="text-gray-600 mb-6">
            We couldn’t find a product with that URL.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:underline"
          >
            ← Go Back
          </button>
        </div>
      </>
    );
  }

  /* ---------- ✅ Build SEO values from the product ---------- */
  const prodSlug = product.slug ?? slugify(product.title); //replace with your actual product slug/url
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://your-domain.com";
  const canonical = `${origin}/portfolio/${prodSlug}`;
  const title = `${product.title} — Priscy Designs`;
  const description =
    product.body?.slice(0, 160) || "Project case study from Priscy Designs.";
  const cover = product.coverImage ?? product.images?.[0] ?? "/og-cover.jpg";
  const logo = "/logo.png";

  const jsonLdWebPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    url: canonical,
    description,
    primaryImageOfPage: { "@type": "ImageObject", url: cover },
    publisher: {
      "@type": "Organization",
      name: "Priscy Designs",
      logo: { "@type": "ImageObject", url: logo },
    },
  };

  return (
    <>
      <Head
        title={title}
        description={description}
        canonical={canonical}
        og={{
          url: canonical,
          image: cover,
          siteName: "Priscy Designs",
          title,
          description,
        }}
        twitter={{
          image: cover,
          title,
          description,
          card: "summary_large_image",
        }}
        jsonLd={jsonLdWebPage}
      />

      <main
        id="main"
        role="main"
        className="mt-14 lg:mt-16"
        aria-labelledby="project-title"
      >
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28%)]">
          {/* Main project */}
          <article
            className="space-y-6 bg-[var(--card)] text-[var(--text)] rounded-2xl p-3 h-fit"
            itemScope
            itemType="https://schema.org/CreativeWork"
            aria-labelledby="project-title"
          >
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-sm text-blue-600">
                <li>
                  <Link to="/portfolio" className="hover:underline">
                    Portfolio
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li
                  aria-current="page"
                  className="text-gray-600 dark:text-gray-300 truncate max-w-[60ch]"
                >
                  {product.title}
                </li>
              </ol>
            </nav>

            {/* Hero */}
            <figure className="rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800">
              <img
                src={product.coverImage ?? product.images?.[0]}
                alt={product.title}
                className="w-full h-72 object-cover"
                decoding="async"
                fetchpriority="high"
                itemProp="image"
              />
              {description && (
                <figcaption className="sr-only">{description}</figcaption>
              )}
            </figure>

            {/* Header */}
            <header className="flex flex-col gap-2">
              <p className="text-sm">
                <span className="sr-only">Category: </span>
                {product.category}
              </p>
              <h1
                id="project-title"
                className="text-3xl font-bold"
                itemProp="name"
              >
                {product.title}
              </h1>
            </header>

            {/* Body */}
            <div className="text-lg dark:text-gray-300" itemProp="description">
              <p>{product.body}</p>
            </div>

            {/* Gallery */}
            {Array.isArray(product.images) && product.images.length > 0 && (
              <div
                className="grid gap-4 sm:grid-cols-2"
                aria-label="Project gallery"
              >
                {product.images.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`${product.title} image ${i + 1}`}
                    className="w-full h-64 object-cover rounded-xl border border-gray-200 dark:border-neutral-800"
                    loading="lazy"
                    decoding="async"
                  />
                ))}
              </div>
            )}

            {/* External URL */}
            {product.url && (
              <p>
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                  aria-label={`Visit external project page for ${product.title}`}
                >
                  Visit Project ↗
                </a>
              </p>
            )}

            {/* Prev / Next */}
            {prev && next && (
              <nav
                className="mt-8 flex items-center justify-between gap-4 border-t pt-6 border-gray-200 dark:border-neutral-800"
                aria-label="Project navigation"
              >
                <Link
                  to={toSlug(prev)}
                  className="group inline-flex items-center gap-2 text-blue-600 hover:underline"
                  aria-label={`Previous project: ${prev.title}`}
                >
                  <span
                    aria-hidden="true"
                    className="translate-x-0 group-hover:-translate-x-0.5 transition"
                  >
                    ←
                  </span>
                  <span className="truncate max-w-[16rem]">{prev.title}</span>
                </Link>
                <Link
                  to={toSlug(next)}
                  className="group inline-flex items-center gap-2 text-blue-600 hover:underline"
                  aria-label={`Next project: ${next.title}`}
                >
                  <span className="truncate max-w-[16rem]">{next.title}</span>
                  <span
                    aria-hidden="true"
                    className="translate-x-0 group-hover:translate-x-0.5 transition"
                  >
                    →
                  </span>
                </Link>
              </nav>
            )}
          </article>

          {/* Related projects */}
          <aside
            className="lg:sticky lg:top-24 h-fit space-y-4 bg-[var(--card)] text-[var(--text)] p-3 rounded-2xl"
            aria-labelledby="more-projects-heading"
          >
            <h2 id="more-projects-heading" className="text-lg font-semibold">
              More Projects
            </h2>
            <ul className="grid gap-4">
              {related.map((p) => (
                <li key={(p.id ?? p.title) + "-rel"} className="list-none">
                  <article
                    aria-labelledby={`rel-${p.id ?? slugify(p.title)}-title`}
                  >
                    <Link
                      to={toSlug(p)}
                      className="block rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden hover:shadow-sm transition"
                      aria-label={`Open project ${p.title}`}
                    >
                      <img
                        src={p.coverImage ?? p.images?.[0]}
                        alt={p.title}
                        className="w-full h-32 object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="p-3">
                        <p className="text-xs text-gray-500">{p.category}</p>
                        <h3
                          id={`rel-${p.id ?? slugify(p.title)}-title`}
                          className="text-sm font-medium line-clamp-2"
                        >
                          {p.title}
                        </h3>
                      </div>
                    </Link>
                  </article>
                </li>
              ))}
            </ul>
          </aside>
        </section>
      </main>
    </>
  );
}
