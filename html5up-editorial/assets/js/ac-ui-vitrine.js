/** UX vitrine EMSP — retour haut + skip link styles partagés */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    var topBtn = document.getElementById("ac-back-to-top");
    if (topBtn) {
      window.addEventListener("scroll", function () {
        topBtn.classList.toggle("is-visible", window.scrollY > 400);
      });
      topBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  });
})();
