/**
 * EMSP — initialisation navigation vitrine (Espace Étudiant, réseaux sociaux, concours).
 */
(function () {
  "use strict";

  function applyExternalLink(link, url) {
    if (!link || !url) {
      return;
    }
    link.href = url;
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  }

  function initEmspLinks() {
    var cfg = window.EMSPCONFIG;
    if (!cfg) {
      return;
    }

    document.querySelectorAll(".emsp-student-link").forEach(function (link) {
      link.href = cfg.routes.espaceEtudiant;
      link.removeAttribute("target");
      link.setAttribute("title", "Ainé & Cadet — Parrainage étudiant EMSP");
    });

    document.querySelectorAll(".emsp-social-linkedin").forEach(function (link) {
      applyExternalLink(link, cfg.social.linkedin);
    });

    document.querySelectorAll(".emsp-social-youtube").forEach(function (link) {
      applyExternalLink(link, cfg.social.youtube);
    });

    document.querySelectorAll(".emsp-concours-form-link").forEach(function (link) {
      link.href = cfg.routes.concoursInscription;
      link.removeAttribute("target");
    });

    document.querySelectorAll(".emsp-biblio-link").forEach(function (link) {
      link.href = cfg.routes.bibliothequeLogin;
      link.removeAttribute("target");
      link.setAttribute("title", "Bibliothèque numérique — connexion requise");
    });

    initConcoursSession(cfg);
    initRessourcesPubliques(cfg);
    initFormulairesAjax(cfg);
  }

  function showFormFeedback(form, text, isError) {
    var box = form.querySelector(".emsp-form-feedback");
    if (!box) {
      box = document.createElement("p");
      box.className = "emsp-form-feedback";
      form.insertBefore(box, form.firstChild);
    }
    box.className = "emsp-form-feedback " + (isError ? "is-error" : "is-success");
    box.textContent = text;
    box.setAttribute("role", "alert");
  }

  function bindAjaxForm(form, url) {
    if (!form || !url) {
      return;
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
      }

      var payload = {};
      new FormData(form).forEach(function (value, key) {
        payload[key] = value;
      });

      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (response) {
          return response.json().then(function (data) {
            return { ok: response.ok, data: data };
          });
        })
        .then(function (result) {
          if (result.data && result.data.ok) {
            showFormFeedback(form, result.data.message, false);
            form.reset();
          } else {
            var msg = (result.data && result.data.error) || "Erreur lors de l'envoi.";
            showFormFeedback(form, msg, true);
          }
        })
        .catch(function () {
          showFormFeedback(
            form,
            "Service indisponible. Réessayez plus tard ou écrivez à contact@emsp.int.",
            true
          );
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
          }
        });
    });
  }

  function initFormulairesAjax(cfg) {
    bindAjaxForm(document.getElementById("emsp-contact-form"), cfg.routes.contactApi);
    bindAjaxForm(
      document.getElementById("emsp-concours-preinscription-form"),
      cfg.routes.concoursPreinscription
    );
  }

  function initConcoursSession(cfg) {
    if (!document.querySelector(".emsp-concours-dynamique")) {
      return;
    }
    fetch(cfg.routes.concoursSession)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.active) {
          return;
        }
        document.querySelectorAll("[data-emsp-concours-annee]").forEach(function (el) {
          el.textContent = data.annee;
        });
        document.querySelectorAll("[data-emsp-concours-date]").forEach(function (el) {
          el.textContent = data.date_limite_fr;
        });
        document.querySelectorAll("[data-emsp-concours-frais]").forEach(function (el) {
          el.textContent = data.frais_fcfa.toLocaleString("fr-FR");
        });
      })
      .catch(function () { /* API indisponible — contenu statique conservé */ });
  }

  function initRessourcesPubliques(cfg) {
    var container = document.getElementById("emsp-ressources-publiques");
    if (!container) {
      return;
    }
    fetch(cfg.routes.bibliothequeApi)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.ressources || !data.ressources.length) {
          return;
        }
        container.innerHTML = "";
        data.ressources.forEach(function (res) {
          var article = document.createElement("article");
          article.className = "ac-card";
          article.innerHTML =
            "<h3>" + res.titre + "</h3>" +
            "<p><span class=\"ac-badge\">" + res.categorie + "</span></p>" +
            "<p>" + (res.resume || "") + "</p>" +
            "<ul class=\"actions\"><li><a href=\"" + res.url + "\" class=\"button small\" target=\"_blank\" rel=\"noopener\">Consulter</a></li></ul>";
          container.appendChild(article);
        });
      })
      .catch(function () { /* API indisponible — placeholders statiques conservés */ });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEmspLinks);
  } else {
    initEmspLinks();
  }
})();
