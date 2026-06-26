/**
 * Formulaires Ainé & Cadet — validation live, cartes rôle, force mot de passe.
 */
(function () {
  "use strict";

  var domain = (document.body.dataset.emailDomain || "emsp.int").toLowerCase();

  /** Validation email @emsp.int en direct */
  function bindEmailValidation(input) {
    if (!input || input.type !== "email") return;
    var hint = document.createElement("p");
    hint.className = "ac-field-hint";
    hint.setAttribute("aria-live", "polite");
    input.parentNode.appendChild(hint);

    function check() {
      var v = input.value.trim().toLowerCase();
      if (!v) {
        hint.textContent = "";
        input.classList.remove("ac-invalid", "ac-valid");
        return;
      }
      if (v.endsWith("@" + domain)) {
        hint.textContent = "✓ Adresse EMSP valide";
        hint.className = "ac-field-hint ac-hint-ok";
        input.classList.add("ac-valid");
        input.classList.remove("ac-invalid");
      } else {
        hint.textContent = "L'adresse doit se terminer par @" + domain;
        hint.className = "ac-field-hint ac-hint-error";
        input.classList.add("ac-invalid");
        input.classList.remove("ac-valid");
      }
    }
    input.addEventListener("input", check);
    input.addEventListener("blur", check);
  }

  /** Indicateur de force du mot de passe */
  function bindPasswordStrength(input) {
    if (!input || input.type !== "password" || input.name !== "password1") return;
    var bar = document.createElement("div");
    bar.className = "ac-password-strength";
    bar.innerHTML = '<div class="ac-password-strength__track"><div class="ac-password-strength__bar"></div></div><span class="ac-password-strength__label"></span>';
    input.parentNode.appendChild(bar);
    var fill = bar.querySelector(".ac-password-strength__bar");
    var label = bar.querySelector(".ac-password-strength__label");

    input.addEventListener("input", function () {
      var p = input.value;
      var score = 0;
      if (p.length >= 8) score++;
      if (p.length >= 12) score++;
      if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
      if (/\d/.test(p)) score++;
      if (/[^A-Za-z0-9]/.test(p)) score++;
      var levels = ["", "Faible", "Moyen", "Bon", "Fort", "Très fort"];
      var colors = ["#eee", "#e74c3c", "#e67e22", "#f1c40f", "#147c71", "#264719"];
      var widths = ["0%", "20%", "40%", "60%", "80%", "100%"];
      fill.style.width = widths[score];
      fill.style.background = colors[score];
      label.textContent = p ? levels[score] : "";
      bar.dataset.level = String(score);
    });
  }

  /** Cartes cliquables Cadet / Ainé — structure Django RadioSelect (ul > li > label > input) */
  function enhanceRoleCards(group) {
    if (!group) return;
    var items = group.querySelectorAll("li");
    if (!items.length) {
      items = group.querySelectorAll("label");
    }
    items.forEach(function (item) {
      item.classList.add("ac-role-card");
      var input = item.querySelector('input[type="radio"]');
      if (!input) return;
      function sync() {
        group.querySelectorAll(".ac-role-card").forEach(function (card) {
          var radio = card.querySelector('input[type="radio"]');
          card.classList.toggle("is-selected", radio && radio.checked);
        });
      }
      input.addEventListener("change", sync);
      sync();
    });
  }

  function bindRoleConditionalFields() {
    var radios = document.querySelectorAll('input[name="role"]');
    if (!radios.length) return;

    var cadetFields = ["attentes"];
    var aineFields = ["ambitions", "motivations", "centres_interet"];

    function setFieldState(name, visible) {
      var field = document.querySelector('[data-field-name="' + name + '"]');
      if (!field) return;
      field.classList.toggle("ac-field-hidden", !visible);
      field.setAttribute("aria-hidden", visible ? "false" : "true");
      field.querySelectorAll("input, select, textarea").forEach(function (input) {
        input.disabled = !visible;
      });
    }

    function selectedRole() {
      var checked = document.querySelector('input[name="role"]:checked');
      return checked ? checked.value : "";
    }

    function sync() {
      var role = selectedRole();
      var isAine = role === "parrain";
      cadetFields.forEach(function (name) {
        setFieldState(name, !isAine);
      });
      aineFields.forEach(function (name) {
        setFieldState(name, isAine);
      });
    }

    radios.forEach(function (radio) {
      radio.addEventListener("change", sync);
    });
    sync();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('input[type="email"]').forEach(bindEmailValidation);
    document.querySelectorAll('input[type="password"]').forEach(bindPasswordStrength);
    document.querySelectorAll("#id_role, .ac-radio-group.ac-role-cards, .ac-field-radio ul").forEach(enhanceRoleCards);
    bindRoleConditionalFields();
  });
})();
