import "@testing-library/jest-dom/vitest";

// Polyfill minimal IntersectionObserver : exigé par framer-motion `whileInView`
// (jsdom ne l'implémente pas). Les entrées simulées ne déclenchent jamais "isIntersecting",
// ce qui laisse l'élément en état "initial" — suffisant pour les assertions DOM.
class IO {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
if (typeof IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = IO;
}

// Polyfill minimal matchMedia : jsdom ne l'implémente pas (la split-view
// messagerie écoute "(min-width: 1024px)"). Considère desktop = true.
if (typeof window.matchMedia === "undefined") {
  window.matchMedia = (requete) => ({
    matches: requete.includes("min-width"),
    media: requete,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false;
    },
  });
}

// jsdom n'implémente pas scrollIntoView (scroll bas auto du fil de messages).
if (typeof Element.prototype.scrollIntoView === "undefined") {
  Element.prototype.scrollIntoView = () => {};
}
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
