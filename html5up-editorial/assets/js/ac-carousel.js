/**
 * EMSP / Ainé & Cadet — carousel vanilla (scroll-snap, flèches, dots).
 * Respecte prefers-reduced-motion (pas d'auto-scroll).
 */
(function () {
  "use strict";

  var AUTO_INTERVAL_MS = 6000;

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initCarousel(root) {
    var track = root.querySelector(".ac-carousel__track");
    if (!track) {
      return;
    }

    var slides = Array.prototype.slice.call(track.querySelectorAll(".ac-carousel__slide"));
    if (slides.length <= 1) {
      return;
    }

    var prevBtn = root.querySelector(".ac-carousel__prev");
    var nextBtn = root.querySelector(".ac-carousel__next");
    var dotsHost = root.querySelector(".ac-carousel__dots");
    var index = 0;
    var timer = null;
    var reduced = prefersReducedMotion();

    function scrollToIndex(i) {
      index = (i + slides.length) % slides.length;
      var slide = slides[index];
      track.scrollTo({ left: slide.offsetLeft, behavior: reduced ? "auto" : "smooth" });
      updateDots();
    }

    function updateDots() {
      if (!dotsHost) {
        return;
      }
      dotsHost.querySelectorAll(".ac-carousel__dot").forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
        dot.setAttribute("aria-selected", i === index ? "true" : "false");
      });
    }

    if (dotsHost) {
      slides.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "ac-carousel__dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("aria-label", "Slide " + (i + 1));
        dot.setAttribute("role", "tab");
        dot.addEventListener("click", function () {
          stopAuto();
          scrollToIndex(i);
          startAuto();
        });
        dotsHost.appendChild(dot);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        stopAuto();
        scrollToIndex(index - 1);
        startAuto();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        stopAuto();
        scrollToIndex(index + 1);
        startAuto();
      });
    }

    track.addEventListener("scroll", function () {
      var closest = 0;
      var minDist = Infinity;
      slides.forEach(function (slide, i) {
        var dist = Math.abs(track.scrollLeft - slide.offsetLeft);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      if (closest !== index) {
        index = closest;
        updateDots();
      }
    });

    function startAuto() {
      if (reduced) {
        return;
      }
      stopAuto();
      timer = window.setInterval(function () {
        scrollToIndex(index + 1);
      }, AUTO_INTERVAL_MS);
    }

    function stopAuto() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    root.addEventListener("mouseenter", stopAuto);
    root.addEventListener("mouseleave", startAuto);
    root.addEventListener("focusin", stopAuto);
    root.addEventListener("focusout", startAuto);

    startAuto();
  }

  function boot() {
    document.querySelectorAll("[data-ac-carousel]").forEach(initCarousel);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
