import { useEffect } from "react";

function upsertMeta(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("data-managed", "head");
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => {
    if (v != null) el.setAttribute(k, v);
  });
  return el;
}
function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    el.setAttribute("data-managed", "head");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
  return el;
}
function upsertScript(id, type, text) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = type;
    el.setAttribute("data-managed", "head");
    document.head.appendChild(el);
  }
  el.textContent = text;
  return el;
}

export default function Head({
  title,
  description,
  canonical,
  og = {},
  twitter = {},
  jsonLd, // object or array of objects
}) {
  useEffect(() => {
    const created = [];

    if (title) {
      const prev = document.title;
      document.title = title;
      created.push(() => (document.title = prev));
    }
    if (description) {
      const el = upsertMeta('meta[name="description"]', {
        name: "description",
        content: description,
      });
      created.push(() => el.remove());
    }
    if (canonical) {
      const el = upsertLink("canonical", canonical);
      created.push(() => el.remove());
    }

    // Open Graph
    const ogMap = {
      "og:type": og.type || "website",
      "og:title": og.title || title,
      "og:description": og.description || description,
      "og:url": og.url || canonical,
      "og:image": og.image,
      "og:site_name": og.siteName,
    };
    Object.entries(ogMap).forEach(([prop, content]) => {
      if (!content) return;
      const el = upsertMeta(`meta[property="${prop}"]`, {
        property: prop,
        content,
      });
      created.push(() => el.remove());
    });

    // Twitter
    const twMap = {
      "twitter:card": twitter.card || "summary_large_image",
      "twitter:title": twitter.title || title,
      "twitter:description": twitter.description || description,
      "twitter:image": twitter.image || og.image,
    };
    Object.entries(twMap).forEach(([name, content]) => {
      if (!content) return;
      const el = upsertMeta(`meta[name="${name}"]`, { name, content });
      created.push(() => el.remove());
    });

    // JSON-LD
    if (jsonLd) {
      const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      const el = upsertScript(
        "jsonld-webpage",
        "application/ld+json",
        JSON.stringify(items.length === 1 ? items[0] : items)
      );
      created.push(() => el.remove());
    }

    return () => created.reverse().forEach((fn) => fn());
  }, [
    title,
    description,
    canonical,
    JSON.stringify(og),
    JSON.stringify(twitter),
    JSON.stringify(jsonLd),
  ]);

  return null;
}
