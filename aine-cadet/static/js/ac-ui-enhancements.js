/**
 * Améliorations UX globales — skip link, retour haut, compteur caractères, recherche rapide.
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    /* Compteur caractères messagerie (max 2000) */
    var chatInput = document.querySelector(".ac-chat-input, textarea[name='contenu']");
    if (chatInput) {
      var max = parseInt(chatInput.getAttribute("maxlength") || "2000", 10);
      chatInput.setAttribute("maxlength", String(max));
      var counter = document.createElement("p");
      counter.className = "ac-char-counter";
      chatInput.parentNode.appendChild(counter);
      function update() {
        var left = max - chatInput.value.length;
        counter.textContent = left + " caractère(s) restant(s)";
        counter.classList.toggle("ac-char-counter-warn", left < 100);
      }
      chatInput.addEventListener("input", update);
      update();
    }

    /* Bouton retour en haut */
    var topBtn = document.getElementById("ac-back-to-top");
    if (topBtn) {
      window.addEventListener("scroll", function () {
        topBtn.classList.toggle("is-visible", window.scrollY > 400);
      });
      topBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    /* Raccourci recherche annuaire depuis la barre globale */
    var searchForm = document.getElementById("ac-global-search");
    if (searchForm) {
      searchForm.addEventListener("submit", function (e) {
        var q = searchForm.querySelector("input[name='q']");
        if (q && !q.value.trim()) e.preventDefault();
      });
    }
  });
})();
