// src/pages/BlogDetail.jsx
import { useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import posts from "../data/blog.json";
import Head from "../lib/Head";

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

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // find post + index (always called)
  const { post, index } = useMemo(() => {
    const i = posts.findIndex((p) => p.slug === slug);
    return i !== -1 ? { post: posts[i], index: i } : { post: null, index: -1 };
  }, [slug]);

  // SEO values
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://your-domain.com";
  const canonical = post
    ? `${origin}/blog/${post.slug}`
    : `${origin}/blog/not-found`;
  const title = post
    ? `${post.title} — Priscy Designs`
    : "Post not found — Priscy Designs";
  const description = post
    ? (post.excerpt || post.body || "").toString().slice(0, 160)
    : "The requested blog post could not be found.";
  const cover = post?.coverImage || "/og-cover.jpg";
  const logo = "/logo.png";

  const jsonLdWebPage = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post?.title || "Post not found",
    description: description,
    image: cover,
    url: canonical,
    datePublished: post?.date,
    author: post?.author ? { "@type": "Person", name: post.author } : undefined,
    publisher: {
      "@type": "Organization",
      name: "Priscy Designs",
      logo: { "@type": "ImageObject", url: logo },
    },
  };

  // related (always called)
  const related = useMemo(() => {
    if (!post) return [];
    const pool = posts.filter((p) => p !== post);
    const rng = seededRandom(post.slug);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 4);
  }, [post]);

  // prev/next (compute early)
  const prev =
    index === -1 ? null : posts[(index - 1 + posts.length) % posts.length];
  const next = index === -1 ? null : posts[(index + 1) % posts.length];

  if (!post) {
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
            card: "summary_large_image",
            image: cover,
            title,
            description,
          }}
          jsonLd={jsonLdWebPage}
        />
        <main className="py-12" role="main">
          <h1 className="text-2xl font-semibold mb-2 text-center">
            Post not found
          </h1>
          <p className="text-center text-gray-600 mb-6">
            We couldn’t find a blog post at this URL.
          </p>
          <div className="text-center">
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:underline"
            >
              ← Go Back
            </button>
          </div>
        </main>
      </>
    );
  }

  const toSlug = (p) => `/blog/${p.slug}`;
  const date = new Date(post.date);
  const dateStr = date.toLocaleDateString();

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
          card: "summary_large_image",
          image: cover,
          title,
          description,
        }}
        jsonLd={jsonLdWebPage}
      />

      <main
        id="main"
        role="main"
        className="mt-14 lg:mt-16"
        aria-labelledby="post-title"
      >
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28%)]">
          {/* Main article */}
          <article
            className="space-y-6 bg-[var(--card)] text-[var(--text)] rounded-2xl p-3 h-fit"
            itemScope
            itemType="https://schema.org/BlogPosting"
            aria-labelledby="post-title"
          >
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-sm text-blue-600">
                <li>
                  <Link to="/blog" className="hover:underline">
                    Blog
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li
                  aria-current="page"
                  className="text-gray-600 dark:text-gray-300 truncate max-w-[60ch]"
                >
                  {post.title}
                </li>
              </ol>
            </nav>

            {/* Hero */}
            <figure className="rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800">
              <img
                src={cover}
                alt={post.title}
                className="w-full h-96 object-cover"
                decoding="async"
                fetchpriority="high"
              />
              {post.excerpt && (
                <figcaption className="sr-only">{post.excerpt}</figcaption>
              )}
            </figure>

            {/* Header */}
            <header className="flex flex-col gap-2">
              <p className="text-sm text-gray-500">
                <span className="sr-only">Category: </span>
                {post.category} •{" "}
                <time dateTime={date.toISOString()}>{dateStr}</time>
              </p>
              <h1
                id="post-title"
                className="text-3xl font-bold"
                itemProp="headline"
              >
                {post.title}
              </h1>
              {post.excerpt && (
                <p
                  className="text-gray-700 dark:text-gray-300"
                  itemProp="description"
                >
                  {post.excerpt}
                </p>
              )}
            </header>

            {/* Body */}
            <div
              className="prose dark:prose-invert max-w-none"
              itemProp="articleBody"
            >
              <p>{post.body}</p>
              {Array.isArray(post.images) && post.images.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                  {post.images.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`${post.title} image ${i + 1}`}
                      className="w-full h-64 object-cover rounded-xl border border-gray-200 dark:border-neutral-800"
                      loading="lazy"
                      decoding="async"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* External link */}
            {post.url && (
              <p>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                  aria-label={`Continue reading ${post.title} on external site`}
                >
                  Continue reading ↗
                </a>
              </p>
            )}

            {/* Prev / Next */}
            {prev && next && (
              <nav
                className="mt-8 flex items-center justify-between gap-4 border-t pt-6 border-gray-200 dark:border-neutral-800"
                aria-label="Post navigation"
              >
                <Link
                  to={toSlug(prev)}
                  className="group inline-flex items-center gap-2 text-blue-600 hover:underline"
                  aria-label={`Previous post: ${prev.title}`}
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
                  aria-label={`Next post: ${next.title}`}
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

          {/* Related */}
          <aside
            className="lg:sticky lg:top-24 h-fit space-y-4 bg-[var(--card)] text-[var(--text)] p-3 rounded-2xl"
            aria-labelledby="more-posts-heading"
          >
            <h2 id="more-posts-heading" className="text-lg font-semibold">
              More Posts
            </h2>
            <ul className="grid gap-4">
              {related.map((p) => (
                <li key={p.id + "-rel"} className="list-none">
                  <article aria-labelledby={`rel-${p.id}-title`}>
                    <Link
                      to={toSlug(p)}
                      className="block rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden hover:shadow-sm transition"
                      aria-label={`Read ${p.title}`}
                    >
                      <img
                        src={p.coverImage}
                        alt={p.title}
                        className="w-full h-32 object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="p-3">
                        <p className="text-xs text-gray-500">{p.category}</p>
                        <h3
                          id={`rel-${p.id}-title`}
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
