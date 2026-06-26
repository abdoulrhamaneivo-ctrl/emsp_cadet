/**
 * Polling messagerie — vérifie les nouveaux messages toutes les 12 s.
 * Usage : data-poll-url sur #ac-chat-fil
 */
(function () {
  "use strict";

  var INTERVAL = 12000;

  document.addEventListener("DOMContentLoaded", function () {
    var fil = document.getElementById("ac-chat-fil");
    if (!fil || !fil.dataset.pollUrl) return;

    var lastCount = fil.querySelectorAll(".ac-chat-bubble").length;

    setInterval(function () {
      fetch(fil.dataset.pollUrl, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
        credentials: "same-origin",
      })
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          if (data.count > lastCount) {
            lastCount = data.count;
            window.location.reload();
          }
        })
        .catch(function () {});
    }, INTERVAL);
  });
})();
