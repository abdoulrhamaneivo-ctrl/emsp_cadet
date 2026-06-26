/**
 * Ainé & Cadet — onglets dashboard (.ac-tabs).
 */
(function () {
  "use strict";

  function activateTab(group, tabId) {
    group.querySelectorAll("[data-ac-tab]").forEach(function (btn) {
      var active = btn.getAttribute("data-ac-tab") === tabId;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    group.querySelectorAll("[data-ac-panel]").forEach(function (panel) {
      var show = panel.getAttribute("data-ac-panel") === tabId;
      panel.classList.toggle("is-active", show);
      panel.hidden = !show;
    });
  }

  function initTabs(root) {
    var buttons = root.querySelectorAll("[data-ac-tab]");
    if (!buttons.length) {
      return;
    }
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        activateTab(root, btn.getAttribute("data-ac-tab"));
      });
    });
    var initial = root.querySelector("[data-ac-tab].is-active") || buttons[0];
    if (initial) {
      activateTab(root, initial.getAttribute("data-ac-tab"));
    }
  }

  function boot() {
    document.querySelectorAll("[data-ac-tabs]").forEach(initTabs);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
