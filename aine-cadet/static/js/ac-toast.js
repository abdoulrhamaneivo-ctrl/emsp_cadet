/**
 * Notifications toast — remplace les flash messages statiques.
 * Auto-fermeture après 5 s ; bouton fermer manuel.
 */
(function () {
  "use strict";

  var DURATION = 5000;

  function createContainer() {
    var c = document.getElementById("ac-toast-container");
    if (!c) {
      c = document.createElement("div");
      c.id = "ac-toast-container";
      c.setAttribute("aria-live", "polite");
      c.setAttribute("role", "region");
      c.setAttribute("aria-label", "Notifications");
      document.body.appendChild(c);
    }
    return c;
  }

  function showToast(text, type) {
    var container = createContainer();
    var toast = document.createElement("div");
    toast.className = "ac-toast ac-toast-" + (type || "info");
    toast.innerHTML =
      '<span class="ac-toast__text">' + text + '</span>' +
      '<button type="button" class="ac-toast__close" aria-label="Fermer">&times;</button>';
    container.appendChild(toast);
    requestAnimationFrame(function () {
      toast.classList.add("is-visible");
    });
    var close = function () {
      toast.classList.remove("is-visible");
      setTimeout(function () {
        toast.remove();
      }, 300);
    };
    toast.querySelector(".ac-toast__close").addEventListener("click", close);
    setTimeout(close, DURATION);
  }

  document.addEventListener("DOMContentLoaded", function () {
    /* Convertir les flash Django en toasts puis masquer le bloc statique */
    var section = document.querySelector(".ac-messages");
    if (section) {
      section.querySelectorAll(".ac-alert").forEach(function (el) {
        var tags = el.className.match(/ac-alert-(\w+)/);
        showToast(el.textContent.trim(), tags ? tags[1] : "info");
      });
      section.style.display = "none";
    }
  });

  window.ACToast = { show: showToast };
})();
