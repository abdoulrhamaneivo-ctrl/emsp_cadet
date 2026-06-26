/**
 * Ainé & Cadet — animations légères (sans librairie externe).
 * Respecte prefers-reduced-motion via CSS ; ce script ajoute les classes d'entrée.
 */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  function animateSections() {
    var sections = document.querySelectorAll("#main .inner > section");
    sections.forEach(function (section, index) {
      section.classList.add("ac-animate-in");
      if (index > 0) {
        section.classList.add("ac-animate-in-delay-" + Math.min(index, 2));
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", animateSections);
  } else {
    animateSections();
  }
})();
