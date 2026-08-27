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
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
